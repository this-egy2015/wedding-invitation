# Prototype cover Figma (codex, 2026-10-30)

Sumber: file Figma `jSjr6kbydM2da7LMpIBA12`, frame `5:2` (390 × 799).

## Hasil

- Prototype statis mandiri ada di `prototype/index-figma.html`, dengan `styles.css` dan `script.js`.
- Seluruh export dari subtree frame disimpan di `prototype/assets/`: render frame, foto sumber ukuran penuh dan crop, dua ukuran buket, poligon crop, serta glow SVG.
- Implementasi memakai aset sumber Figma, bukan screenshot sebagai UI. Tombol membuka state konfirmasi sederhana agar prototype dapat diuji.
- Render Chrome headless pada 390 × 799 diperiksa secara visual terhadap screenshot Figma; posisi layer utama mengikuti koordinat frame.

## Catatan

- Font Figma `SignPainter HouseScript` tidak tersedia di web. Prototype memakai Yellowtail sebagai pengganti, sama seperti keputusan cover template sebelumnya.
- Prototype terpisah dari route/komponen aplikasi yang ada. Belum ada perubahan pada flow undangan produksi.
