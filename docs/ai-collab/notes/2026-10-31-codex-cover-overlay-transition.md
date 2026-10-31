# Cover overlay ke Frame 2

Frame 1 dan Frame 2 tidak lagi memakai satu aliran scroll saat membuka undangan. Saat tombol ditekan, Frame 2 langsung berada di `top: 0`; Frame 1 berubah menjadi fixed overlay dan bergerak `translateY(-100%)` selama 1,5 detik. Setelah animasi selesai, overlay disembunyikan sehingga Frame 1 tidak dapat dicapai lagi dengan scroll.

Verifikasi browser headless: pada 0,75 detik `detailsTop: 0`, cover `position: fixed` dan masih terlihat; setelah 1,75 detik cover tersembunyi dan `scrollY: 0`.
