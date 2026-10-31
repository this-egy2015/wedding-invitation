# Purge sisa stack lama

Pemilik meminta menghapus yang sudah tidak dipakai setelah migrasi SQLite. Branch `codex/purge-legacy-stack`; keputusan 005 memperbarui keputusan sebelumnya yang menyimpan migration PostgreSQL sebagai riwayat dalam working tree.

Dihapus:

- Dependency `postgres` dan `motion`; npm menghapus total 5 paket termasuk dependency animasi yang tidak diperlukan. Animasi aplikasi sudah memakai Web Animations API/requestAnimationFrame, tidak mengimpor motion.
- `scripts/import-postgres.ts` serta script npm `db:import-postgres`, setelah impor lokal selesai dan terverifikasi.
- `drizzle/0000_cultured_sheva_callister.sql` dan `drizzle/meta/` yang berisi snapshot/journal PostgreSQL. Migration ini masih tersedia dalam riwayat Git; migration SQLite aktif tetap di `drizzle/sqlite/`.
- Variabel PostgreSQL lama dari `.env.local`, contoh environment, serta instruksi importer dari README. Nilai kredensial tidak disalin ke catatan/commit.

Dipertahankan karena masih digunakan: Supabase package/CLI/config untuk Auth dan media, migration SQLite, script migrasi/backup, test keamanan, prototype acuan, aset UI dan foto, data/backup SQLite, dan catatan kolaborasi. Tidak melakukan drop tabel atau reset service/container Supabase. `.vscode/` pengguna tidak disentuh.

Verifikasi: `npm run typecheck`, `npm test` (12/12), `npm run build`, dan `git diff --check` lulus. Tidak ada referensi importer/koneksi PostgreSQL lama di kode/config aktif. SQLite integrity_check = ok; 2 undangan dan 1 tamu tetap ada. Smoke dev port 3000: demo dan login 200, root/home 404, dashboard anonim 307. Perubahan migrasi SQLite dari tugas sebelumnya tetap dipertahankan; belum commit/push atau deploy produksi.
