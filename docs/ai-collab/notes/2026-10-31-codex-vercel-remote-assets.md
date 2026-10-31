# GitHub SSH, Vercel remote, dan URL media per undangan

Keputusan terakhir pemilik adalah **aplikasi penuh Vercel dengan layanan remote**, bukan preview statis atau SQLite file pada filesystem Vercel. Branch kerja `codex/vercel-remote-assets`. Panduan/Makefile dari tugas sebelumnya turut diselesaikan.

## GitHub dan akses

Repo `this-egy2015/wedding-invitation` kini publik. Plugin dapat membaca tetapi tidak punya izin push. Pemilik memasang deploy key khusus repo dengan write access; push SSH `main` berhasil. Private key tetap di direktori SSH pengguna, tidak masuk repo. Konfigurasi SSH untuk key khusus hanya di Git config repo ini. Tidak mengganti key SSH pengguna yang sudah ada.

## Implementasi

- Runtime Drizzle/libSQL menggunakan `@libsql/client`. Lokal tetap file SQLite privat melalui initializer yang sama; Vercel memerlukan `TURSO_DATABASE_URL` + `TURSO_AUTH_TOKEN`, tanpa fallback `/tmp`. URL remote hanya libsql/https tanpa userinfo.
- RSVP/perubahan kuota menjadi transaksi async yang seluruh operasinya di-await. Driver libSQL membuka transaksi write dengan BEGIN IMMEDIATE. Owner guard, token, kuota, moderasi, dan constraint SQLite tetap berlaku. better-sqlite3 dipertahankan untuk pengamanan file dan snapshot backup lokal.
- Migration memakai Drizzle libSQL migrator dengan folder `drizzle/sqlite/` yang sama. Tidak ada perubahan skema tabel/manual migration. `db:backup` menolak target remote; backup/export Turso harus dikelola pada layanan remote.
- `make seed-remote` memakai `APP_ENV_FILE=.env.production.local` dan guard remote. Tidak membaca fallback `.env.local`; kekurangan URL/token remote tidak akan menulis DB lokal. Seed tetap memverifikasi owner hosted dan melestarikan token/respons/moderasi contoh yang sudah ada.
- Route GET/HEAD `/berubah/<slug>/<file>` mengambil media publik dari bucket Supabase `wedding-assets`, prefix `berubah/<slug>`. Path menyimpan slug, bukan UUID atau ID template. Route memvalidasi path/ekstensi, menolak traversal/SVG/HTML/DB/env, mendukung byte range, dan tidak meneruskan cookie/secret key. Tidak ada endpoint upload anonim.
- Konten menyimpan path relatif; editor menerima path teks. Optimizer Next mengizinkan `/berubah/**` dan static media dengan TTL minimum 60 detik. Pakai nama file baru untuk perubahan gambar yang harus langsung tampak. `metadataBase` memakai SITE_URL agar gambar Open Graph memakai domain yang benar.
- Alias integrasi Supabase didukung: URL publik, publishable key, key anon lama; seed menerima secret key atau service role key. Vercel menolak URL Supabase/SITE_URL HTTP atau localhost. `vercel.json` mengatur region `sin1`.
- Demo Gaby/Afdhal di-seed ulang ke namespace baru (37 foto). Foto demo Fajar/Nadya dipindahkan sekali pakai dari Storage lama ke namespace baru dan referensi draft/published diperbarui setelah backup; undangan/tamu/respons dipertahankan. Bucket lama tidak dihapus.

## Validasi dan batasnya

Typecheck, unit test, build lokal, dan build dengan config remote dummy lulus. Config dummy hanya menguji build, tidak menguji koneksi Turso hosted. Tidak ada DB/environment privat dalam file tracing; fungsi terbesar sekitar 30 MB.

Smoke HTTP produksi lokal menguji anonymous/cross-owner denial, create/edit/publish/unpublish, token scoping, RSVP nyata, kuota, moderasi, cache, dan cascade. Fixture sementara dibersihkan. Smoke media: GET/HEAD, byte range 206, optimizer 200, POST 405, serta penolakan file/path tidak aman lulus. Smoke carousel lulus. Supabase masih lokal selama pemeriksaan ini; belum menguji delivery email Auth hosted atau persistence deployment Vercel.

## Lanjutan deployment

Pemilik sedang memasang Supabase Free Singapore di Vercel Marketplace; nama resource disarankan `wedding-invitation`, prefix `NEXT_PUBLIC_`. Login CLI Vercel dimulai melalui device authorization; jangan menyalin token ke catatan. Turso, owner Auth hosted, dan environment produksi masih perlu tersedia sebelum seed/deploy penuh. Kredensial hanya melalui env privat atau `vercel env pull`, tidak melalui chat/Git.

Sesudah tersedia: link proyek Vercel, tarik env secara privat, lengkapi Turso/SITE_URL/owner, jalankan `make seed-remote`, set callback Auth, deploy production, smoke undangan/media/login/RSVP live. Seed remote tidak otomatis mengimpor akun/tamu/token lokal. Jangan mengganti database ke file lokal untuk meloloskan build.
