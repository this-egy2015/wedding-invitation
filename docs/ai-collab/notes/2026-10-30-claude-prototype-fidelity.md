# Fidelity Figma → prototype (claude, 2026-10-30)

Melanjutkan `notes/2026-10-30-codex-figma-frame-2.md`. Fokus: tampilan sama persis dengan Figma, belum memakai framework.

## Yang diubah

- `prototype/index-figma.html`, `styles.css`, dan `script.js` ditulis ulang untuk Frame 2 (`1:2`, 390 x 6428). Setiap layer memakai `top`/`left` dari koordinat frame Figma, urutan z sama dengan urutan layer Figma, dan nilai warna, radius, shadow, serta opacity diambil dari `get_design_context`.
- Konten disamakan dengan Figma. Versi sebelumnya memakai teks karangan: sekarang ada "dr. Gaby Derenski", "Afdhal Aulia, BA.IR", nama orang tua, Masjid Al-Hakim / Pangeran Beach Hotel, jam 08.00 / 10.00 WIB, tombol "Maps", dan placeholder rekening.
- Aset baru diunduh dari Figma ke `prototype/assets/figma-1-2/`, termasuk 30 foto galeri. Foto galeri dan `flowers.png` diperkecil ke 2x ukuran tampil (asli 293MB, sekarang 11MB total) tanpa crop atau edit. Aset di `prototype/assets/frame-2/` (render crop versi lama) tidak dipakai lagi dan boleh dihapus.
- Galeri memakai animasi Figma (`get_motion_context` node `39:4`): strip digeser `translate: 707px -5px → -8322px -5px` selama 146.98 detik, linear, berulang. Animasi berhenti jika `prefers-reduced-motion` aktif.
- Font: Poppins (angka countdown) dan Montserrat (jam, input) ditambahkan sesuai Figma.
- Cover Frame 1: bouquet sekarang memakai kotak rotasi Figma (sebelumnya meleset sekitar 8–12px), hexagon diposisikan di `left: 64.77px`, dan jarak baris pesan 21px (box Figma 42px untuk 2 baris).

## Verifikasi

- Chrome headless 390 x 6428 dibandingkan per piksel dengan `get_screenshot` node `1:2`. Rata-rata selisih per pita 200px: 0–5 (skala 0–255) untuk hampir semua bagian. Pengecualian: nama script (font pengganti) dan pita galeri (karena animasi).
- Cover dibandingkan dengan `assets/figma-frame.png`.
- Interaksi di browser: Buka Undangan, countdown, galeri bergerak, submit RSVP (kartu ucapan pertama ter-update, form reset), dan salin rekening (fallback toast). Tidak ada error di console dan tidak ada gambar rusak.

## Deviasi yang disengaja

- SignPainter HouseScript → Yellowtail pada 0.89x ukuran, dengan line-height px Figma dipertahankan.
- Typo desain "Novermber" ditulis "November".
- Countdown menghitung ke resepsi, 29 Nov 2026 10.00 WIB (tanggal di hero). Angka di Figma (23/8/0/0) statis.
- Wish baru menggantikan kartu pertama (artboard tingginya tetap 6428px). Di aplikasi nanti ini harus berupa list dinamis.
- Artboard lebarnya tetap 390px, belum fluid untuk layar < 390px.

## Untuk Next.js nanti

- Template `classic` di aplikasi baru punya cover. Frame 2 perlu di-port dengan layout flow (bukan absolute) karena konten dinamis (nama, orang tua, acara, galeri, ucapan).
- Field konten yang belum ada di skema: keterangan anak ke berapa ("Putri pertama", "Putra bungsu"; saat ini `parents` hanya teks bebas). Peta saat ini berupa gambar statis; di aplikasi pakai `mapsUrl` atau embed.
