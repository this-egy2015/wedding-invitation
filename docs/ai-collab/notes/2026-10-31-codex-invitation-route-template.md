# Route undangan dan port template Classic

Koreksi pemilik: route publik harus `/:idUndangan`; `/` atau home menampilkan “Undangan tidak ditemukan”. `idUndangan` memakai slug immutable yang sudah ada, sedangkan UUID tetap untuk dashboard. Keputusan dicatat pada DECISIONS 003.

## Implementasi

- `src/app/[idUndangan]/page.tsx` membaca konten published dan memilih komponen dari registry template. Root, `/home`, slug tidak dikenal, draft, dan unpublished memberi HTTP 404. Tidak ada redirect otomatis ke login atau tautan login dari undangan. Dashboard tetap memakai guard ownership/auth yang sudah ada.
- `/invite/:slug` mengarahkan ke route baru dengan query `to` dipertahankan. Link dashboard, link personal tamu, dan revalidasi RSVP mengikuti route baru. Slug yang berbenturan dengan route internal ditolak ketika membuat undangan. Header no-referrer berlaku pada seluruh route.
- `HomeInvitation` dari iterasi sebelumnya dihapus. Halaman publik dan preview memakai template Classic yang sama: hero, quote, mempelai, acara, lokasi, galeri, RSVP/ucapan, dan hadiah. Konten panjang mengalir dalam layout; galeri dapat digeser horizontal; section tidak memakai animasi saat scroll.
- `classic.module.css` mengisolasi style dari dashboard dan Tailwind. Dekorasi diimpor dari `src/templates/classic/assets/` menjadi URL static dengan hash; [inventaris](../../../src/templates/classic/assets/README.md) membedakan dekorasi dengan foto/konten milik undangan. Tidak ada path gambar yang dibentuk dari slug publik di komponen UI, ataupun impor runtime dari `prototype/`.
- Interaksi prototype dipindah ke komponen React: CoverGate mengunci scroll, menjalankan Web Animations API 1.500 ms vertikal, melepas cover hanya saat animasi selesai, memindahkan fokus ke isi, dan menghormati reduced motion. Countdown menggunakan timer dengan cleanup dan render awal konsisten untuk hydration. RSVP memakai server action/transaksi/kuota/token asli. CopyButton menangani clipboard berhasil maupun gagal.
- Galeri/hadiah yang belum dikonfigurasi tidak ditampilkan. RSVP hanya aktif melalui token personal valid; preview/kunjungan umum tidak membuat respons simulasi.

## Demo lokal

Data lama `/demo-fajar-nadya` ternyata memakai PNG placeholder 1 piksel, tanpa foto mempelai/galeri. Data ini dipertahankan. Dibuat undangan lokal baru `/demo-gaby-afdhal` milik akun lokal yang sama, dengan 10 gambar konten yang disalin dari prototype ke Supabase Storage lokal (cover, potret cover, dua potret mempelai, enam foto galeri). Dekorasi tetap berasal dari bundle template. Rekening diberi label contoh, bukan untuk transfer; musik belum diisi.

Seed hanya ada di database/storage lokal, bukan hasil migrasi atau data produksi. Tidak ada kredensial/token di repo. Tamu dan undangan sementara untuk smoke test dihapus setelah pengujian; demo Gaby/Afdhal tetap tersedia untuk pemilik. Tidak mengubah skema DB atau memasang dependency baru.

## Verifikasi

- `npm run typecheck`, `npm test` (6/6), `npm run build`, dan `git diff --check` lulus.
- Production lokal port 3001: undangan published 200; `/`, `/home`, slug tidak ada, draft, unpublished, dan path aset palsu 404; redirect lama mempertahankan token; dashboard anonim 307 ke `/login`.
- Chrome mobile emulation 390×844: cover setinggi viewport; sampel animasi pada 100/600/1.100 ms masih ada, opacity 1, posisi X tetap 0, posisi Y bergerak naik; pada 1.700 ms cover sudah dilepas. Fokus pindah ke isi. Scroll ke awal tidak mengembalikan cover.
- Lebar 320 dan 430: tidak ada overflow horizontal, tombol buka tetap dalam viewport. Reduced motion membuka langsung. Kedelapan section dapat dicapai; semua gambar UI/konten berhasil dimuat; galeri dapat digeser. Tidak ada error JavaScript atau hydration.
- Token invalid dan token dari undangan lain tidak membuka form. Token valid menampilkan tamu yang sesuai. RSVP melebihi kuota ditolak tanpa insert; respons valid tersimpan; kirim ulang mengubah satu baris menjadi tidak hadir dengan jumlah 0. Clipboard menyalin nomor yang sesuai.
- Route demo pada server pengembangan port 3000 juga memberi 200.

Peta adalah iframe eksternal berdasarkan venue/alamat, dengan tautan Maps dari data acara. Interaksi internal Google Maps, pemutaran musik tanpa aset musik, perangkat fisik, dan Safari belum diuji. Screenshot otomatis tidak menjadi bukti isi iframe eksternal selesai dimuat. File `.vscode/` milik pengguna dibiarkan di luar commit. Perubahan route/template digabung dalam commit bersama penyempurnaan carousel sesuai permintaan pemilik.
