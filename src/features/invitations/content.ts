import { z } from "zod";
import { env } from "../../env.ts";

export const TIMEZONES = ["Asia/Jakarta", "Asia/Makassar", "Asia/Jayapura"] as const;

const required = (max: number) => z.string().trim().min(1, "Wajib diisi").max(max);
const optional = (max: number) => z.string().trim().max(max);
const localDateTime = z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/, "Format tanggal/jam tidak valid");

// Match the asset origin and path boundary used by next/image.
const asset = z
  .string()
  .trim()
  .refine((v) => {
    if (!URL.canParse(v)) return false;
    const url = new URL(v);
    const base = new URL(env.R2_PUBLIC_URL);
    return url.origin === base.origin && !url.username && !url.password &&
      url.pathname.startsWith(`${base.pathname.replace(/\/$/, "")}/`);
  }, "URL harus berasal dari server aset yang dikonfigurasi");
const optionalAsset = z.union([z.literal(""), asset]);
const optionalHttpsUrl = z.union([
  z.literal(""),
  z.string().trim().refine((v) => URL.canParse(v) && new URL(v).protocol === "https:", "URL harus https"),
]);

const person = z.object({
  fullName: required(100),
  nickname: required(40),
  parents: required(200),
  birthOrder: optional(40).default(""),
  instagram: optional(60),
  photoUrl: optionalAsset,
});

const event = z.object({
  startsAt: localDateTime,
  endsAt: z.union([z.literal(""), localDateTime]),
  venue: required(120),
  address: required(300),
  mapsUrl: optionalHttpsUrl,
  mapImageUrl: optionalAsset.default(""),
});

export const contentSchema = z.object({
  timezone: z.enum(TIMEZONES),
  coverImageUrl: asset,
  // Defaults keep drafts saved before these fields existed valid.
  coverPortraitUrl: optionalAsset.default(""),
  coverTitle: optional(40).default(""),
  musicUrl: optionalAsset,
  groom: person,
  bride: person,
  quote: z.object({ text: optional(600), source: optional(100), imageUrl: optionalAsset.default("") }),
  akad: event,
  resepsi: event,
  galleryUrls: z.array(asset).max(30, "Maksimal 30 foto"),
  gifts: z
    .array(z.object({ bank: required(50), accountNumber: required(40), accountName: required(100) }))
    .max(5, "Maksimal 5 rekening"),
});

export type InvitationContent = z.infer<typeof contentSchema>;

function lines(value: FormDataEntryValue | null) {
  return String(value ?? "")
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
}

/** Builds the content object from ContentForm fields (dotted names, multi-line lists). */
export function contentFromFormData(formData: FormData) {
  const raw: Record<string, unknown> = {};
  for (const [key, value] of formData) {
    // "$ACTION_*" entries are injected by React for server-action forms.
    if (key === "galleryUrls" || key === "gifts" || key.startsWith("$")) continue;
    const path = key.split(".");
    let node = raw;
    for (const segment of path.slice(0, -1)) {
      node[segment] ??= {};
      node = node[segment] as Record<string, unknown>;
    }
    node[path.at(-1)!] = value;
  }
  raw.galleryUrls = lines(formData.get("galleryUrls"));
  raw.gifts = lines(formData.get("gifts")).map((line) => {
    const [bank = "", accountNumber = "", accountName = ""] = line.split("|").map((p) => p.trim());
    return { bank, accountNumber, accountName };
  });
  return raw;
}

export function formatIssues(error: z.ZodError) {
  return error.issues.map((i) => (i.path.length ? `${i.path.join(".")}: ${i.message}` : i.message));
}
