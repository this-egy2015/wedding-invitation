# Wedding Invitation Platform

Next.js App Router + SQLite/libSQL (Drizzle) + Supabase Auth/Storage. Development memakai file SQLite privat; deployment Vercel memakai Turso (SQLite remote). Modular monolith dengan pemisahan per domain di `src/features`.

## Setup

Panduan langkah demi langkah dan perintah `make seeded`: [readme-howto.md](readme-howto.md).

```bash
cp .env.example .env.local      # isi semua variabel
npm install
npm audit                       # lihat Security untuk temuan yang sudah diketahui
npm run db:migrate              # terapkan drizzle/sqlite/*.sql ke SQLITE_PATH
npm run dev
```

Gunakan Node.js >=22.18. `SQLITE_PATH` default `./data/wedding.sqlite`; folder baru dibuat privat (0700), file DB 0600. Jika direktori sudah ada, atur `chmod 700 data` terlebih dahulu. Path di `public/`, `out/`, atau `.next/` ditolak. File DB, WAL, backup, dan environment tidak masuk Git maupun file tracing deployment Next.js.

Setelah mengubah `src/db/schema.ts`, jalankan `npm run db:generate` untuk membuat migration baru, lalu `npm run db:migrate`. Migrasi membuat backup konsisten terlebih dahulu jika tabel aplikasi sudah ada. Seluruh migration aktif berada di `drizzle/sqlite/`.

### Scripts

| Script | Fungsi |
|---|---|
| `npm run dev` / `build` / `start` | Next.js |
| `npm run typecheck` | `tsc --noEmit` |
| `npm test` | Unit test (`node --test`) |
| `npm run db:generate` / `db:migrate` | Generate migration Drizzle / jalankan migration SQLite dengan backup |
| `npm run db:backup` | Backup SQLite lokal dengan backup API, termasuk transaksi di WAL; bukan backup Turso |
| `npm run db:seed` | Seed demo lengkap dan upload 37 gambar ke server aset Supabase Storage |

Supabase Auth: aktifkan Email provider (magic link), set **Site URL** = `SITE_URL`, dan tambahkan `${SITE_URL}/auth/callback` ke Redirect URLs.

### Seed demo

Setelah `npm run db:migrate`, jalankan `npm run db:seed`. Seed memperbarui draft/published **hanya** `/demo-gaby-afdhal` dengan teks acara dari prototype, 30 foto galeri, cover/bingkai, foto mempelai/kutipan, dan 2 gambar peta (37 gambar total). Empat tamu contoh mencakup belum konfirmasi, hadir, dan tidak hadir; tiga ucapan contoh mengisi daftar ucapan. Rekening adalah contoh, musik kosong karena prototype tidak menyertakan berkas audio.

Pada DB baru, isi `SEED_OWNER_ID` dengan UUID akun Supabase Auth yang sudah ada. Pada workspace ini owner diambil dari demo yang sudah ada. Owner diverifikasi sebelum seed; seed menolak mengambil alih undangan milik akun lain. Jalankan hanya untuk demo: konten draft/published demo ditimpa setelah backup, sedangkan tamu/token/respons/moderasi yang sudah ada dan undangan lain dipertahankan.

Media disimpan di bucket publik `wedding-assets` pada `SUPABASE_URL`, dengan prefix `berubah/demo-gaby-afdhal/`. URL aplikasi berbentuk `/berubah/<idUndangan>/<file>`; `idUndangan` tetap slug. Route GET/HEAD meneruskan media dari Storage dengan allowlist tipe/path, tanpa memberikan secret key ke pengunjung. Gambar tersedia setelah deploy ulang dan tidak memerlukan rebuild saat file baru ditambahkan. Saat mengganti gambar, gunakan nama file baru dan perbarui konten agar cache langsung memakai versi baru.

Saat lokal, CLI Supabase menyediakan kunci tanpa menuliskannya ke repo. Saat hosted, isi `SUPABASE_SERVICE_ROLE_KEY` atau `SUPABASE_SECRET_KEY` melalui environment privat untuk seed; jangan memakai awalan `NEXT_PUBLIC_`. Seed memeriksa gambar sebelum menyimpan DB. `R2_PUBLIC_URL` tidak dipakai lagi. Gambar konten tetap terpisah dari ornamen UI template.

Halaman yang sudah di-cache perlu diterbitkan ulang lewat dashboard pemilik setelah seed. Link RSVP personal tersedia pada daftar tamu pemilik; token acak tidak disimpan dalam fixture Git.

### Deployment dan backup

GitHub: `https://github.com/this-egy2015/wedding-invitation`; push SSH ke `main` sudah berhasil. Untuk aplikasi penuh di Vercel, isi `TURSO_DATABASE_URL` dan `TURSO_AUTH_TOKEN` serta Supabase hosted dan `SITE_URL`. Runtime menolak fallback file lokal di Vercel. Lihat [alur remote](readme-howto.md#aplikasi-penuh-di-vercel). [Vercel tidak menyediakan persistensi file SQLite lokal](https://vercel.com/kb/guide/is-sqlite-supported-in-vercel). `.vercelignore` mengecualikan environment privat, DB/backup, dan konfigurasi editor saat upload source.

`make seed-remote` membaca `.env.production.local`, menjalankan migration SQLite yang sama ke Turso, lalu seed dengan owner Auth hosted yang valid dan upload foto ke Storage hosted. Tidak mengimpor data/tamu lokal otomatis ke produksi. Backup/export Turso perlu disiapkan lewat layanan Turso sebelum mengubah data produksi; `db:backup` sengaja menolak target remote. Storage juga perlu dicadangkan terpisah. Integrasi Vercel Supabase dapat memakai `SUPABASE_PUBLISHABLE_KEY` / `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`; keduanya diterima sebagai alias key publik Auth.

Untuk mode file SQLite lokal, jalankan pada server Node.js dengan disk lokal persisten; mount direktori SQLite ketika memakai container. Gunakan satu host untuk file DB ini. Jangan menaruhnya pada filesystem sementara/serverless atau berbagi file lewat network filesystem: [WAL memerlukan proses pada host yang sama](https://sqlite.org/wal.html). Backup di `data/backups/` juga privat; salin backup hasil `npm run db:backup` ke penyimpanan terpisah sesuai jadwal operasional. Jangan sekadar menyalin file `.sqlite` saat aplikasi aktif karena transaksi terbaru dapat berada di WAL.

Untuk pemulihan, hentikan semua proses aplikasi, simpan set DB/WAL/SHM lama untuk rollback, lalu pulihkan snapshot backup ke `SQLITE_PATH` tanpa membawa sidecar WAL/SHM dari DB sebelumnya. Pastikan izin folder 0700/file 0600, jalankan migrasi yang diperlukan, dan hidupkan kembali aplikasi. Proteksi file ini bukan enkripsi; gunakan enkripsi disk/backup jika dibutuhkan.

## Struktur

```
src/
  app/                      routes (PRD §3)
    [idUndangan]            halaman publik berdasarkan slug, ?to=<token> untuk personalisasi
    invite/[slug]           redirect kompatibilitas ke /:idUndangan
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

- **Ownership**: seluruh akses dashboard melewati `requireUser()`/`getOwnedInvitation()` (filter `owner_id`). Identitas tetap diverifikasi lewat Supabase Auth; proxy hanya me-refresh session. UUID owner dipertahankan saat impor.
- **Batas akses SQLite**: modul DB ditandai `server-only`, file privat, query terparameterisasi, foreign keys aktif di setiap koneksi, serta constraint status/token/kuota/JSON di database. Tidak ada Data API SQLite publik atau RLS. Foreign key ke `auth.users` tidak bisa lintas database; penghapusan akun Supabase perlu disertai penghapusan data aplikasi secara terpisah.
- **Caching publik**: konten published di-cache per slug (`unstable_cache` + tag). `publish`/`unpublish` memanggil `updateTag`. Tamu dan ucapan dibaca per request, sehingga token tidak pernah masuk cache.
- **Route publik**: `/:idUndangan` memakai slug immutable (contoh `/demo-fajar-nadya`), bukan UUID internal dashboard atau ID template. `/`, `/home`, dan slug tidak terbit/tidak dikenal menampilkan 404 “Undangan tidak ditemukan”. `/invite/:slug` mengarahkan ke route baru sambil mempertahankan token. `/login` hanya diakses lewat URL langsung, tanpa tautan dari undangan.
- **Token tamu**: 128-bit random (`base64url`, 22 karakter). `Referrer-Policy: no-referrer` di seluruh route agar token tidak bocor ke Maps/R2.
- **Slug immutable** setelah dibuat, agar link tamu yang sudah dibagikan tidak rusak.
- **Template di kode, bukan tabel**: `invitations.template_id` + `template_version` merujuk ke `src/templates/index.ts`. Menambah template tidak mengubah skema DB.
- **UI dan konten terpisah**: template `classic` mengikuti Frame 1/2 prototype, dengan CSS Module dan komponen React. Ornamen berada di `src/templates/classic/assets/` ([inventaris](src/templates/classic/assets/README.md)); foto dan informasi pasangan berasal dari konten slug yang dibuka. Prototype HTML/JS bukan runtime aplikasi. Cover meluncur vertikal 1,5 detik lalu dilepas; bagian undangan memakai scroll biasa.
- **Status `pending`** tidak disimpan; tamu tanpa baris `rsvps` dianggap pending.
- **Waktu acara** disimpan sebagai wall-clock lokal + zona IANA (`timezone`). Countdown dihitung di server ke epoch absolut.
- **Kuota**: RSVP dan perubahan kuota memakai transaksi write libSQL (`BEGIN IMMEDIATE`) dengan operasi async yang ditunggu. Kuota tidak bisa diturunkan di bawah jumlah yang sudah dikonfirmasi; perubahan RSVP tidak membuka kembali ucapan yang dimoderasi. Mode file lokal memakai WAL dan busy timeout 5 detik.

## Belum dikerjakan (sengaja / butuh keputusan)

- **Upload dari dashboard**: belum dibuat. Seed/admin menaruh file di Storage; editor menerima path `/berubah/<slug>/<file>`. Bucket publik hanya untuk membaca media, tanpa policy tulis anonim.
- **Rate limiting**: belum ada di level aplikasi. Aturan WAF perlu mencakup POST RSVP pada route publik `/:idUndangan`. RSVP sudah terbatas satu baris per token.
- **shadcn/ui**: dashboard masih Tailwind biasa. Jalankan `npx shadcn@latest init` bila ingin migrasi.
- Penjadwalan backup off-host dan monitoring belum otomatis; alat snapshot SQLite tersedia melalui `npm run db:backup`.

## Security

Migrasi SQLite (2026-10-31) diuji dengan better-sqlite3 13.0.3 / SQLite 3.53.4. `npm audit --omit=dev --registry=https://registry.npmjs.org` tidak menemukan vulnerability runtime. Pengujian DB mencakup file privat, penolakan path publik/symlink, constraint/FK/cascade, token invalid, upsert/moderasi, rollback penurunan kuota, backup, dan persaingan transaksi pada koneksi terpisah. [Drizzle SQLite](https://orm.drizzle.team/docs/sqlite/get-started-sqlite) dan [foreign key SQLite](https://sqlite.org/foreignkeys.html) menjadi referensi konfigurasi.

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
