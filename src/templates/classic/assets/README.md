# Aset UI template Classic

Aset dekoratif ini diimpor oleh komponen Next.js, sehingga build menghasilkan URL `/_next/static/media/...` dengan hash. Path tidak diturunkan dari slug, UUID, atau token tamu. Sumber visual: export Figma di `prototype/assets/`.

| Aset | Pemakaian |
|---|---|
| `bouquet.png`, `glow.svg` | Buket dan cahaya pada cover Frame 1 |
| `minang-pattern.png` | Motif pada hero dan bagian acara |
| `rumah-gadang.png` | Rumah transparan di hero/quote |
| `gold-leaves.png` | Daun pada quote dan potret mempelai |
| `arch-frame.svg` | Bingkai potret mempelai |
| `curve.svg` | Lengkungan pemisah quote |
| `countdown-circle.svg` | Lingkaran hitung mundur |
| `flowers.png` | Bunga pada kartu acara |

Foto cover, potret, galeri, musik, nama, jadwal, lokasi, dan rekening adalah **konten undangan**, berasal dari `InvitationContent`. Tidak ada foto pasangan, screenshot peta, atau rekening demo Figma yang dipakai sebagai fallback. Peta dibentuk dari venue/alamat acara. Galeri dan hadiah yang kosong tidak ditampilkan.

`prototype/script.js` hanya untuk prototype HTML. Runtime Next menggunakan `CoverGate` (animasi overlay selesai lewat Web Animations API), `Countdown` (timer dengan cleanup), `RsvpForm` (server action/database), dan `CopyButton` (clipboard).
