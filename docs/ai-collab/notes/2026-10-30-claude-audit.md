# Audit repo (claude, 2026-10-30)

## Hasil verifikasi

- `npm ci`: OK (lockfile menunjuk ke `registry.npmjs.org`).
- `npm run typecheck`: OK.
- `npm test`: 4/4 lulus (`src/lib/time.test.ts`).
- `next build` dengan env dummy: OK, 11 route.
- Versi terpasang memenuhi batas minimum di README: next 16.4.3, sharp 0.35.5, drizzle-orm 0.45.4, @supabase/auth-js 2.118.0.
- `npm audit` (registry npmjs): 4 temuan **moderate**, semuanya dari `esbuild <=0.24.2` lewat `drizzle-kit` → `@esbuild-kit/*` (GHSA-67mh-4wv8-2f99, dev server esbuild). Hanya dev dependency, tidak masuk bundle, dan drizzle-kit tidak menjalankan dev server esbuild. `npm audit fix --force` akan menurunkan drizzle-kit ke 0.18.1 (breaking), jadi **jangan** dijalankan.
- Catatan lingkungan: registry npm global di mesin ini adalah mirror internal yang tidak bisa diakses dari luar jaringannya, sehingga `npm audit` gagal. Pakai `npm audit --registry=https://registry.npmjs.org`.

## Review kode (tidak ditemukan bug yang perlu diperbaiki)

- Ownership: semua action dashboard memanggil `getOwnedInvitation()`; `getGuest` dan `deleteGuestAction` memfilter `invitationId`.
- RLS aktif di ketiga tabel (`drizzle/0000_*.sql` baris 16, 33, 48).
- Token tamu: 128-bit, dicek dengan regex sebelum query, dan tidak masuk cache publik.
- RSVP: kuota dicek dalam transaksi dengan `FOR UPDATE`, dan undangan harus `published`.
- Open redirect: redirect magic link memakai `SITE_URL`, bukan header Host.

## Perubahan di sesi ini

- README: langkah setup diperbaiki (migration `drizzle/0000` sudah ada, jadi `db:generate` hanya dijalankan setelah mengubah skema), catatan audit, dan bagian kolaborasi AI.
- `CLAUDE.md` baru, aturan bersama di `AGENTS.md`, dan folder `docs/ai-collab/`.

## Saran untuk agen berikutnya

- Belum ada lint (Next 16 menghapus `next lint`). Pertimbangkan ESLint flat config atau Biome, tetapi tanyakan pemilik repo dulu.
- Test hanya mencakup `time.ts`. Kandidat berikutnya: `contentFromFormData` dan `contentSchema` (`src/features/invitations/content.ts`).
