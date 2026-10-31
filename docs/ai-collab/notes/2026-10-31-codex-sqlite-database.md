# Migrasi SQLite dan proteksi data

> Setelah migrasi diverifikasi, pemilik meminta purge. Importer sekali pakai, package postgres, migration PostgreSQL lama, dan POSTGRES_IMPORT_URL kemudian dihapus. Detail di bawah adalah catatan proses migrasi; alur operasional terbaru hanya SQLite, lihat `2026-10-31-codex-purge-legacy-stack.md`.

Permintaan pemilik: ganti database ke SQLite dan amankan. Branch `codex/sqlite-database`; keputusan arsitektur dicatat sebelum perubahan pada DECISIONS 004. Scope adalah data undangan/tamu/RSVP. Supabase Auth dan lokasi media tetap digunakan; autentikasi tidak diganti menjadi login lokal tanpa verifikasi.

## Implementasi

- `src/db/schema.ts` memakai sqlite-core: UUID tetap text, konten JSON memakai text/json, timestamp epoch milidetik, boolean integer. Constraint status, format slug/token, range kuota, attendance/status, panjang ucapan, JSON, unique, dan FK cascade diterapkan. Migration dihasilkan `npm run db:generate` ke `drizzle/sqlite/`; migration PostgreSQL lama tidak diedit.
- Runtime DB `server-only` memakai better-sqlite3 13.0.3 (SQLite 3.53.4). Koneksi dev dipakai ulang. FK ON, WAL, synchronous FULL, trusted_schema OFF, timeout 5 detik. Query tetap terparameterisasi. `LIKE` menggantikan `ILIKE`; pencarian case-insensitive ASCII sudah diuji (case-fold Unicode mengikuti keterbatasan LIKE SQLite).
- `src/db/writes.ts` memuat transaksi sinkron RSVP dan perubahan kuota. `BEGIN IMMEDIATE` mengganti `FOR UPDATE`; callback tidak async agar commit tidak mendahului pekerjaan. Token harus cocok dengan undangan published, kuota dicek dalam transaksi, upsert menjaga moderasi. Action tamu tetap memanggil ownership guard, kemudian mutation juga memfilter ID undangan/tamu.
- `SQLITE_PATH` default `./data/wedding.sqlite`. Pembukaan DB memvalidasi direktori privat 0700, file 0600, menolak public/out/.next serta symlink file dan hard link. File DB/sidecar/backup diabaikan Git. `outputFileTracingExcludes` menghindari DB, backup, dan `.env` terbawa ke deployment. Akses path runtime memakai anotasi Turbopack agar pemeriksaan lokasi tidak menyebabkan seluruh proyek ditelusuri ke artefak build.
- `db:migrate` memakai helper koneksi yang sama dan membuat backup sebelum migrasi DB yang sudah ada. `db:backup` memakai online backup API, bukan salinan mentah file WAL aktif. `db:import-postgres` membaca snapshot read-only, menolak target berisi data, menyalin/verifikasi setiap baris dalam transaksi, lalu memeriksa FK/integritas. Paket postgres hanya dev dependency untuk impor.

## State lokal

Impor aktual selesai: 2 undangan, 1 tamu, 0 RSVP. ID, owner, slug, token, konten, dan timestamp dipertahankan. `/demo-fajar-nadya` dan `/demo-gaby-afdhal` tetap tersedia; foto berada di storage lokal sebelumnya. PostgreSQL sumber tidak dihapus/diubah. `.env.local` sudah memakai SQLITE_PATH; URL PostgreSQL lama disimpan privat sebagai POSTGRES_IMPORT_URL untuk pemulihan/impor, tidak dibaca runtime. Backup konsisten dibuat di folder data/backups yang diabaikan Git. Tidak ada token/kredensial di catatan ini atau file tracked.

## Bukti verifikasi

- `npm run typecheck`, `npm test` (12/12), `npm run build` lulus. Build terakhir tanpa warning tracing. `npm audit --omit=dev --registry=https://registry.npmjs.org`: 0 vulnerability runtime; 4 moderate dev dari esbuild/drizzle-kit tetap sebagaimana catatan sebelumnya.
- Unit/integration DB memakai database sementara yang dibuat dari migration sebenarnya: izin file/direktori, penolakan path publik/symlink, constraint/FK/cascade, token invalid, quota, moderation/upsert, backup, dan race RSVP vs penurunan kuota lewat dua worker/koneksi independen.
- Smoke HTTP production port 3001: route publik 200; root/home/draft 404; file DB/WAL/env/backup tidak tersaji; dashboard anonim dan mutasi anonim ditolak. Sesi Supabase pemilik diverifikasi tanpa mengirim email; edit/guests/preview milik sendiri 200, baca/hapus milik owner lain ditolak. Sesi uji dicabut setelah selesai.
- Server action asli diuji lewat HTTP: buat undangan, RSVP kuota berlebih ditolak, RSVP valid tersimpan/upsert, penurunan kuota di bawah jumlah hadir ditolak, moderasi tetap tersembunyi, pencarian nama huruf kecil berhasil, draft tidak bocor ke published, publish memperbarui cache, unpublish memberi 404 dan menolak RSVP baru, delete menghapus anak melalui FK cascade. Fixture sementara dihapus; data demo dipertahankan.
- Impor ulang ke DB yang terisi ditolak tanpa menimpa data. Backup aktual berhasil. Manifest file tracing Next diperiksa: tidak ada file DB, WAL, backup, atau `.env` di daftar deployment.
- Smoke carousel pada aplikasi production lulus setelah migrasi. Server dev port 3000 juga diuji: root/home 404 dan demo 200.

## Operasional

Butuh satu host Node.js dengan disk lokal persisten; jangan gunakan filesystem sementara/serverless atau berbagi file DB antar-host melalui jaringan. Hak akses file bukan enkripsi; gunakan enkripsi disk/backup bila diperlukan. Penjadwalan backup off-host dan rate limiting edge belum dibuat. Penghapusan akun Supabase tidak lagi otomatis cascade ke DB aplikasi karena FK lintas database tidak tersedia; hapus data aplikasi secara terpisah setelah menghapus akun. README memuat prosedur cutover, backup, dan restore. Deploy produksi/restore pada host produksi belum diuji; `.vscode/` milik pengguna tidak diubah. Perubahan ini belum di-commit.
