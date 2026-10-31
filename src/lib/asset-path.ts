import { isPublicInvitationSlug } from "./invitation-url.ts";

export const assetTypes: Record<string, string> = {
  png: "image/png", jpg: "image/jpeg", jpeg: "image/jpeg", webp: "image/webp",
  avif: "image/avif", gif: "image/gif", mp3: "audio/mpeg", ogg: "audio/ogg",
  m4a: "audio/mp4", wav: "audio/wav",
};

export function assetContentType(slug: string, parts: string[]) {
  if (!isPublicInvitationSlug(slug) || !parts.length ||
    parts.some((part) => !/^[a-zA-Z0-9][a-zA-Z0-9._-]*$/.test(part))) return null;
  const extension = parts.at(-1)!.split(".").at(-1)!.toLowerCase();
  return Object.hasOwn(assetTypes, extension) ? assetTypes[extension] : null;
}

export function isAssetPath(value: string) {
  const [empty, prefix, slug, ...parts] = value.split("/");
  return empty === "" && prefix === "berubah" && !!assetContentType(slug ?? "", parts);
}
