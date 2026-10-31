# Panduan dan Makefile seeded flow

Permintaan pemilik: `readme-howto.md` dan Makefile untuk menjalankan seeded flow. Branch `codex/seeded-flow-howto`.

- `make seeded`: Supabase lokal → `make seed` (migrasi dahulu) → dev server. Recursive make menjaga urutan walaupun dipanggil dengan `-j`; kegagalan menghentikan tahap selanjutnya.
- Target lain: help, setup, services, migrate, seed, dev, backup, check, build, start. Menggunakan npm script/CLI lokal yang sudah ada, tanpa dependency atau perubahan runtime.
- `setup` memakai `npm ci`, membuat `.env.local` berizin 0600 jika belum ada, dan mempertahankan konfigurasi yang sudah ada. Owner Auth dan nilai environment tetap harus disiapkan menurut panduan; tidak membuat kredensial/akun otomatis.
- Panduan membedakan workspace siap pakai dan clone/DB kosong, menjelaskan UUID owner di Studio, email lokal port 54324, URL demo/personal, dampak seed ulang, serta tombol Publikasikan Ulang untuk cache. README utama menautkannya.

Validasi: `make help`, dry run `make seeded`, assert-based check pada direktori sementara dengan npm/Supabase stub (urutan di `-j4`, penghentian saat migrasi gagal, izin env baru, env lama tidak ditimpa), `make check` (typecheck, 14 tes, build), dan `git diff --check` lulus. Tidak mengulang npm install, membuat akun Auth, atau reseed DB pengguna untuk perubahan dokumentasi/orchestration ini. Setup penuh dari clone kosong belum dieksekusi. `.vscode/` pengguna tetap tidak disentuh.
