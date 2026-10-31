# Carousel Momen Kami otomatis

Permintaan pemilik: galeri harus bergerak otomatis sekaligus bisa digeser manual, bukan hanya scroll horizontal. Koreksi berikutnya: ikuti prototype tanpa menambah UI tombol jeda/putar atau scrollbar. Tombol yang sempat ditambahkan sudah dihapus; scrollbar disembunyikan tanpa menonaktifkan native scroll.

`ClassicTemplate` sekarang memakai client component `Gallery`. Animasi memakai `requestAnimationFrame` untuk menggeser native scroll sekitar 61,43 piksel/detik, mengikuti kecepatan prototype (9.029 piksel dalam 146,98 detik). Salinan strip foto membuat peralihan akhir ke awal tampak bersambung; salinan disembunyikan dari pembaca layar. CSS scroll-snap dihapus agar tidak melawan gerakan kontinu. Foto tetap berasal dari konten undangan, tanpa dependency atau perubahan database.

Koreksi terakhir pemilik: gerakan berhenti hanya ketika jari/mouse masih ditahan, lalu langsung lanjut ketika dilepas. Jeda 2,5 detik dan penghentian saat hover/fokus/wheel dihapus. Mouse memakai pointer capture agar drag dan pelepasan di luar elemen tetap terdeteksi; sentuhan memakai touchstart/end/cancel karena native swipe mengirim pointercancel sebelum jari benar-benar dilepas. Animasi membaca perubahan scroll manual agar wheel/swipe tidak dikembalikan ke posisi sebelumnya.

Saat galeri tidak terlihat atau tab tersembunyi, posisi tidak bergerak. Preferensi reduced motion menonaktifkan autoplay. Galeri satu foto tidak berulang. Scroll vertikal section dan transisi cover tidak diubah. Public route dan preview memakai komponen yang sama; prototype HTML tidak diubah.

Verifikasi: `npm run typecheck`, `npm test` (6/6), `npm run build`, `git diff --check` lulus. Self-check browser tersedia di `scripts/smoke-gallery.mjs`; jalankan dengan Chrome terpasang dan server lokal aktif:

```bash
node scripts/smoke-gallery.mjs http://localhost:3000/demo-gaby-afdhal
```

Self-check lulus pada emulasi Chrome mobile 390×844: tidak ada tombol/scrollbar tambahan; autoplay berlanjut saat hover/fokus/wheel; tahan/drag mouse; native swipe lalu tetap menahan jari menghentikan gerakan; pelepasan langsung melanjutkan tanpa cooldown; pengulangan akhir-ke-awal; reduced motion; tidak ada overflow halaman maupun error JavaScript/hydration. Tidak memutasi database. Safari dan HP fisik belum diuji. Perubahan carousel digabung dalam commit bersama route/template sesuai permintaan pemilik; `.vscode/` tidak disertakan.
