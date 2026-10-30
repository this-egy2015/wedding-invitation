# Wedding Invitation Platform

Next.js App Router + Supabase (Auth, Postgres) + Drizzle. Modular monolith dengan pemisahan per domain di `src/features`.

## Setup

```bash
cp .env.example .env.local      # isi semua variabel
npm install
npm audit                       # lihat Security untuk temuan yang sudah diketahui
npm run db:migrate              # terapkan drizzle/*.sql, pakai DIRECT_DATABASE_URL (port 5432)
npm run dev
```

Setelah mengubah `src/db/schema.ts`, jalankan `npm run db:generate` untuk membuat migration baru, lalu `npm run db:migrate`.

### Scripts

| Script | Fungsi |
|---|---|
| `npm run dev` / `build` / `start` | Next.js |
| `npm run typecheck` | `tsc --noEmit` |
| `npm test` | Unit test (`node --test`) |
| `npm run db:generate` / `db:migrate` | Drizzle Kit |

Supabase Auth: aktifkan Email provider (magic link), set **Site URL** = `SITE_URL`, dan tambahkan `${SITE_URL}/auth/callback` ke Redirect URLs.

Setelah migrate, pastikan di Supabase Table Editor ketiga tabel (`invitations`, `guests`, `rsvps`) berstatus **RLS enabled**. Jika tidak, token tamu bisa terbaca lewat Data API memakai anon key.

## Struktur

```
src/
  app/                      routes (PRD §3)
    invite/[slug]           halaman publik, ?to=<token> untuk personalisasi
    dashboard/invitations   list, new, [id]/edit, [id]/preview, [id]/guests, [id]/guests/[guestId]
  features/
    invitations/            content schema (Zod), queries (ownership guard + public cache), actions
    guests/                 queries, actions (token, kuota)
    rsvp/                   upsert RSVP + wish
  templates/                registry template (kode) + template "classic"
  db/                       Drizzle schema & client
  lib/                      auth (requireUser), supabase client, util zona waktu
  proxy.ts                  refresh session Supabase (bukan auth gate)
```

## Keputusan desain

- **Ownership**: Drizzle konek sebagai role `postgres` dan tidak terkena RLS. Semua akses dashboard melewati `getOwnedInvitation()` (filter `owner_id`). Proxy hanya me-refresh session.
- **RLS tanpa policy** di semua tabel, agar Data API Supabase (anon/authenticated) tidak bisa membaca data.
- **Caching publik**: konten published di-cache per slug (`unstable_cache` + tag). `publish`/`unpublish` memanggil `updateTag`. Tamu dan ucapan dibaca per request, sehingga token tidak pernah masuk cache.
- **Token tamu**: 128-bit random (`base64url`, 22 karakter). `Referrer-Policy: no-referrer` di `/invite/*` agar token tidak bocor ke Maps/R2.
- **Slug immutable** setelah dibuat, agar link tamu yang sudah dibagikan tidak rusak.
- **Template di kode, bukan tabel**: `invitations.template_id` + `template_version` merujuk ke `src/templates/index.ts`. Menambah template tidak mengubah skema DB.
- **Status `pending`** tidak disimpan; tamu tanpa baris `rsvps` dianggap pending.
- **Waktu acara** disimpan sebagai wall-clock lokal + zona IANA (`timezone`). Countdown dihitung di server ke epoch absolut.
- **Kuota**: divalidasi di server dalam transaksi `FOR UPDATE`. Kuota tidak bisa diturunkan di bawah jumlah yang sudah dikonfirmasi.

## Belum dikerjakan (sengaja / butuh keputusan)

- **Upload ke R2**: konten saat ini menerima URL yang harus berada di bawah `R2_PUBLIC_URL`. Upload (presigned URL + verifikasi ukuran/tipe) belum dibuat.
- **Rate limiting**: belum ada di level aplikasi. Rekomendasi: aturan Vercel WAF untuk `POST /invite/*`. RSVP sudah terbatas satu baris per token.
- **Desain Figma**: baru layar cover (Figma node `5:2`) yang sudah diterapkan ke template `classic`. Bagian setelah "Buka Undangan" (mempelai, acara, galeri, RSVP, ucapan, hadiah) masih layout dasar dan menunggu frame Figma berikutnya.
- **shadcn/ui**: dashboard masih Tailwind biasa. Jalankan `npx shadcn@latest init` bila ingin migrasi.
- Backup DB dan monitoring (Phase 6): gunakan PITR/backup Supabase.

## Security

Batas minimum versi (dicek 2026-10-30 via sumber pihak ketiga; konfirmasi ulang ke advisory vendor):

| Package | Minimum | Alasan |
|---|---|---|
| next | 16.4.3 | RCE Image Optimizer SVG (CVE-2026-96889), RCE `use cache` (GHSA-673q-mjm6-r5xr), DoS Server Actions (GHSA-p3m5-59mp-jv5r). Line 15 EOL. |
| sharp | 0.35.5 | Terkait RCE SVG di atas (via `overrides`). |
| drizzle-orm | 0.45.2 | CVE-2026-39356, SQL injection via `sql.identifier()`/`.as()`. Kode ini tidak memakai identifier dinamis. |
| @supabase/auth-js | 2.69.1 | CVE-2025-48370 (transitive via supabase-js). |

Versi lain belum diverifikasi terhadap registry. Jalankan `npm audit` setelah install, lalu commit `package-lock.json`.

Temuan audit yang sudah diketahui (2026-10-30): 4 moderate dari `esbuild <=0.24.2` lewat `drizzle-kit` (dev dependency, GHSA-67mh-4wv8-2f99). Tidak masuk bundle produksi. Jangan jalankan `npm audit fix --force` karena akan menurunkan drizzle-kit ke 0.18.1.

## Kolaborasi AI (Claude Code & Codex)

Repo ini dikerjakan oleh Claude Code dan Codex.

- `AGENTS.md`: aturan bersama untuk semua agen (Codex membacanya langsung).
- `CLAUDE.md`: hanya mengimpor `AGENTS.md` untuk Claude Code.
- `docs/ai-collab/`: ruang berbagi pikiran antar-agen, berisi board status/handoff, log keputusan, dan catatan. Lihat `docs/ai-collab/README.md`.
