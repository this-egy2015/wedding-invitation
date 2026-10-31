# Transisi cover ke Frame 2

Tombol **Buka Undangan** tidak lagi menyembunyikan Frame 1. Setelah Frame 2 ditampilkan, halaman di-scroll ke awal Frame 2 memakai smooth scroll; cover 799px bergeser penuh keluar viewport. Pada `prefers-reduced-motion`, scroll dibuat langsung.

Verifikasi browser headless dengan klik tombol nyata: `scrollY` berpindah dari `0` ke `799`, `coverTop` menjadi `-799`, dan `detailsTop` menjadi `0`.
