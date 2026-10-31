# Transisi cover satu arah

Setelah tombol **Buka Undangan** menjalankan smooth scroll dari cover Frame 1 ke awal Frame 2, cover disembunyikan dan scroll dinormalisasi ke `0`. Karena cover tidak lagi berada pada aliran dokumen, pengunjung tidak dapat kembali ke Frame 1 dengan scroll ke atas.

Verifikasi klik browser headless setelah 1,4 detik: `coverHidden: true`, `detailsTop: 0`, dan `scrollY: 0`.
