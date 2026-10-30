# Prototype Frame 2 Figma

- Sumber: Figma file `jSjr6kbydM2da7LMpIBA12`, node `1:2` (390 × 6428).
- Implementasi mandiri: `prototype/index-figma.html`, `prototype/styles.css`, dan `prototype/script.js`.
- Aset yang diperlukan untuk section yang dirender diekspor dari Figma ke `prototype/assets/frame-2/`:
  - hero/background dan portrait;
  - pola Minang dan ornamen floral;
  - portrait Gaby/Afdhal dan frame;
  - peta Akad dan Resepsi;
  - foto galeri utama.
- Perilaku prototype: buka undangan, countdown menuju 29 November 2026, tautan peta, konfirmasi RSVP lokal, dan salin nomor rekening. Tidak terhubung ke database atau API produksi.
- Verifikasi: resource lokal ada, JavaScript lolos syntax check, screenshot Chrome mobile 390 px berhasil dibuat; `npm run typecheck`, `npm test`, dan `npm run build` lulus.
