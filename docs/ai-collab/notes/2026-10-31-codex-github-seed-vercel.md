# GitHub, seed lengkap, dan percobaan Vercel

Pemilik memberikan remote `https://github.com/this-egy2015/wedding-invitation.git`, meminta push main, seed teks/gambar, lalu mencoba deploy Vercel. Repo sudah memiliki riwayat; tidak diinisialisasi ulang dan README tidak ditimpa dengan boilerplate. Branch kerja `codex/github-seed-vercel` membawa perubahan SQLite/purge yang sebelumnya belum commit. `.vscode/` pengguna tidak disentuh.

## Hasil lokal

- `npm run db:seed` memakai fixture `scripts/fixtures/demo-gaby-afdhal.json`. Konten sesuai prototype: pasangan, urutan anak, orang tua, ayat, waktu/tempat/alamat/Maps, 30 foto, dan rekening contoh. Tidak mengarang Instagram/audio yang tidak ada sumbernya.
- Bucket publik `wedding-assets`, prefix `demo-gaby-afdhal/`, di Supabase Storage lokal yang sudah berjalan. Semua 37 gambar di-upload dan HEAD diperiksa sebelum DB disimpan: cover, bingkai, dua mempelai, foto kutipan, dua peta, 30 galeri. Ini server aset lokal sementara, belum URL produksi.
- Data SQLite: 2 undangan, total 5 tamu (1 lama + 4 contoh), 3 RSVP/ucapan contoh. Seed membuat backup sebelum perubahan, memverifikasi owner melalui Supabase Auth, hanya menimpa draft/published demo. Rerun mempertahankan guest token, respons, moderasi, dan undangan lain. Tidak membuat/menghapus akun Auth.
- Tambahan JSON konten opsional `birthOrder`, `quote.imageUrl`, `akad/resepsi.mapImageUrl` tersambung ke form editor/template, fallback konten lama dipertahankan. Galeri maksimum 30. Tidak perlu migrasi tabel.
- URL aset diperiksa berdasarkan origin dan batas path, menggantikan startsWith mentah yang menerima domain/path menyerupai server aset. Token/kunci tidak disimpan pada fixture.
- `.vercelignore` melindungi environment privat, DB/backup, serta konfigurasi editor dari upload source. Tracing build juga diperiksa: tidak ada DB atau environment privat.
- Halaman demo diterbitkan ulang melalui server action dengan sesi owner terverifikasi agar cache dev tidak tetap menampilkan seed lama. Sesi pengujian kemudian sign out lokal; magic link hanya dibuat/ditukar via admin lokal, tidak mengirim email.

## Validasi

Typecheck, 14 unit test, build produksi, dan `git diff --check` lulus. Test baru mencakup 37 sumber gambar, galeri 30, kompatibilitas konten lama, penolakan origin/path aset tiruan, seed berulang, owner mismatch, serta pelestarian respons/moderasi/undangan lain. Rerun seed pada DB workspace juga diperiksa sebelum/sesudah.

Smoke HTTP produksi dan dev memverifikasi venue, foto kutipan/peta, foto galeri ke-30, ucapan contoh, serta 404 root/home/DB/environment. Smoke carousel pada produksi sempat gagal ambang waktu fokus ketika pemuatan awal; rerun diagnostik menunjukkan pergerakan 68→92 px dalam 400 ms dan seluruh interaksi lulus. Tidak mengubah perilaku carousel atau menambah kontrol UI.

## Hambatan eksternal

- GitHub plugin, `gh repo view`, dan `git ls-remote` dengan kredensial gh mengembalikan Not Found untuk repo tujuan. Akun CLI aktif `egy2015`, sedangkan owner URL `this-egy2015`. Origin sudah diset; perlu akses akun atau koreksi URL sebelum push.
- Vercel CLI 65.9.0 via registry npm publik dapat berjalan, tetapi `whoami` logged out; `vercel deploy --yes --prod` gagal `No existing credentials found`. Belum ada deployment/URL live. Registry npm default mesin mengarah ke Artifactory yang tidak dapat di-resolve; override per perintah, tidak mengubah konfigurasi global.
- SQLite lokal tidak cocok sebagai DB tulis di Vercel. Pertanyaan SQLite remote vs VPS dan konfigurasi Auth/asset server produksi sudah disampaikan, belum dijawab. Tidak mengganti provider atau memasukkan DB ke `/tmp`. Referensi: https://vercel.com/kb/guide/is-sqlite-supported-in-vercel.

Lanjutan: selesaikan akses GitHub dan push main; untuk Vercel perlu login, keputusan SQLite remote, serta konfigurasi layanan publik. Seed produksi dijalankan setelah provider/owner/storage tersedia, bukan terhadap localhost. Semua kredensial melalui environment privat.
