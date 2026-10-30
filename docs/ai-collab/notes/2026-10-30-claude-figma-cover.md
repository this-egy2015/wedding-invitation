# Cover Figma → template classic (claude, 2026-10-30)

Sumber: https://www.figma.com/design/jSjr6kbydM2da7LMpIBA12 node `5:2` ("Frame 1", 390 x 799). File hanya berisi satu frame ini.

## Yang diterapkan

- `src/templates/classic/CoverGate.tsx`: layout cover mengikuti posisi Figma, diverifikasi di viewport 390 x 799 dengan selisih ≤ 1px per elemen.
- Token warna di `src/app/globals.css`: `blush` #ffebec, `terracotta` #e26a2f, `cocoa` #2b160c. Font `font-script` (Yellowtail).
- Aset statis: `assets/bouquet.png` (rangkaian bunga kering) dan `assets/glow.svg` (ellipse gradien), diunduh dari Figma tanpa diubah.

## Deviasi yang disengaja

- **Font nama**: Figma memakai SignPainter HouseScript (font sistem macOS, tidak tersedia di web). Diganti Yellowtail ukuran 57px agar lebarnya sama (290px).
- **Urutan lapisan glow**: Di Figma, glow berada di bawah overlay hitam 55%. Di kode, glow diletakkan di atas overlay dengan `brightness(0.45)`, yang hasilnya identik, supaya bisa diposisikan relatif ke kolom konten.
- **Crop foto latar**: Figma meng-crop fotonya secara manual. Di kode, `scale(1.45)` dan `translateY(-15.6%)` dari object-cover meniru crop itu untuk foto apa pun.
- **Layar pendek** (< 799px): cover bisa di-scroll agar tombol tetap terjangkau.

## Belum

- Bagian setelah cover masih memakai palet lama (ivory/gold), menunggu frame Figma berikutnya.
- Urutan nama: desain menulis "Gaby & Afdhal" (wanita dulu), sedangkan kode memakai `groom & bride`. Perlu konfirmasi pemilik.
