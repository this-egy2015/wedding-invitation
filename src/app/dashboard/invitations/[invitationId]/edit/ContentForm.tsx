"use client";

import { useActionState, useTransition } from "react";
import { FormErrors } from "@/components/FormErrors";
import type { FormState } from "@/features/invitations/actions";
import type { InvitationContent } from "@/features/invitations/content";

type Props = {
  initial: InvitationContent | null;
  timezones: readonly string[];
  action: (prev: FormState, formData: FormData) => Promise<FormState>;
};

function Field({ name, label, defaultValue, type = "text", required, hint }: {
  name: string;
  label: string;
  defaultValue?: string;
  type?: string;
  required?: boolean;
  hint?: string;
}) {
  return (
    <div>
      <label htmlFor={name} className="label">
        {label}
      </label>
      <input id={name} name={name} type={type} defaultValue={defaultValue} required={required} className="input" />
      {hint && <p className="mt-1 text-xs text-neutral-500">{hint}</p>}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset className="space-y-3 rounded-lg border bg-white p-4">
      <legend className="px-1 text-sm font-semibold">{title}</legend>
      {children}
    </fieldset>
  );
}

export function ContentForm({ initial, timezones, action }: Props) {
  const [state, formAction] = useActionState(action, { ok: false, errors: [] });
  const [pending, startTransition] = useTransition();

  const person = (key: "groom" | "bride", label: string) => (
    <Section title={label}>
      <Field name={`${key}.fullName`} label="Nama lengkap" defaultValue={initial?.[key].fullName} required />
      <Field name={`${key}.nickname`} label="Nama panggilan" defaultValue={initial?.[key].nickname} required />
      <Field name={`${key}.parents`} label="Putra/Putri dari" defaultValue={initial?.[key].parents} required />
      <Field name={`${key}.birthOrder`} label="Urutan anak (opsional)" defaultValue={initial?.[key].birthOrder} hint="Contoh: pertama, kedua, bungsu." />
      <Field name={`${key}.instagram`} label="Instagram (tanpa @)" defaultValue={initial?.[key].instagram} />
      <Field name={`${key}.photoUrl`} label="Path foto" defaultValue={initial?.[key].photoUrl} />
    </Section>
  );

  const event = (key: "akad" | "resepsi", label: string) => (
    <Section title={label}>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field name={`${key}.startsAt`} label="Mulai" type="datetime-local" defaultValue={initial?.[key].startsAt} required />
        <Field name={`${key}.endsAt`} label="Selesai (opsional)" type="datetime-local" defaultValue={initial?.[key].endsAt} />
      </div>
      <Field name={`${key}.venue`} label="Tempat" defaultValue={initial?.[key].venue} required />
      <Field name={`${key}.address`} label="Alamat" defaultValue={initial?.[key].address} required />
      <Field name={`${key}.mapsUrl`} label="Link Google Maps" type="url" defaultValue={initial?.[key].mapsUrl} />
      <Field name={`${key}.mapImageUrl`} label="Path gambar peta (opsional)" defaultValue={initial?.[key].mapImageUrl} />
    </Section>
  );

  return (
    <form
      // Submit via transition instead of `action=` so React does not reset the fields when validation fails.
      onSubmit={(e) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        startTransition(() => formAction(formData));
      }}
      className="space-y-4"
    >
      <Section title="Umum">
        <div>
          <label htmlFor="timezone" className="label">
            Zona waktu acara
          </label>
          <select id="timezone" name="timezone" defaultValue={initial?.timezone ?? "Asia/Jakarta"} className="input">
            {timezones.map((tz) => (
              <option key={tz} value={tz}>
                {tz}
              </option>
            ))}
          </select>
        </div>
        <Field name="coverImageUrl" label="Path foto cover" defaultValue={initial?.coverImageUrl} required hint="Contoh: /berubah/gaby-afdhal/cover.jpg" />
        <Field
          name="coverPortraitUrl"
          label="Path foto bingkai cover (opsional)"
          defaultValue={initial?.coverPortraitUrl}
          hint="Foto di dalam bingkai heksagon. Jika kosong, memakai foto cover."
        />
        <Field
          name="coverTitle"
          label="Judul cover (opsional)"
          defaultValue={initial?.coverTitle}
          hint='Jika kosong, memakai "Maimbau Baralek".'
        />
        <Field
          name="recipientName"
          label="Nama penerima di cover"
          defaultValue={initial?.recipientName}
          hint='Tampil sebagai "Kepada Yth. [nama]". Kosongkan untuk "Tamu Undangan". Link personal tamu tetap menimpa nama ini.'
        />
        <Field name="musicUrl" label="Path musik (opsional)" defaultValue={initial?.musicUrl} />
      </Section>

      {person("groom", "Mempelai Pria")}
      {person("bride", "Mempelai Wanita")}

      <Section title="Kutipan / Ayat">
        <div>
          <label htmlFor="quote.text" className="label">
            Teks
          </label>
          <textarea id="quote.text" name="quote.text" rows={3} defaultValue={initial?.quote.text} className="input" />
        </div>
        <Field name="quote.source" label="Sumber" defaultValue={initial?.quote.source} />
        <Field name="quote.imageUrl" label="Path foto kutipan (opsional)" defaultValue={initial?.quote.imageUrl} />
      </Section>

      {event("akad", "Akad")}
      {event("resepsi", "Resepsi")}

      <Section title="Galeri">
        <label htmlFor="galleryUrls" className="label">
          Path foto /berubah/idUndangan/file, satu per baris (maks. 30)
        </label>
        <textarea
          id="galleryUrls"
          name="galleryUrls"
          rows={5}
          defaultValue={initial?.galleryUrls.join("\n")}
          className="input font-mono"
        />
      </Section>

      <Section title="Tanda Kasih">
        <label htmlFor="gifts" className="label">
          Satu rekening per baris: Bank | Nomor Rekening | Atas Nama
        </label>
        <textarea
          id="gifts"
          name="gifts"
          rows={3}
          placeholder="BCA | 1234567890 | Gaby"
          defaultValue={initial?.gifts.map((g) => `${g.bank} | ${g.accountNumber} | ${g.accountName}`).join("\n")}
          className="input font-mono"
        />
      </Section>

      <FormErrors errors={state.errors} />
      {state.ok && !pending && <p className="text-sm text-green-700">Draft tersimpan.</p>}
      <button type="submit" disabled={pending} className="btn-primary">
        {pending ? "Menyimpan..." : "Simpan Draft"}
      </button>
    </form>
  );
}
