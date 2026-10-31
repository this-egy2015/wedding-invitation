# Frame 2 memakai scroll biasa

Perilaku sticky, scale, fade, bayangan, dan listener scroll untuk perpindahan antar-section Frame 2 telah dihapus. Semua `<section class="page">` kini berada pada aliran dokumen biasa.

Verifikasi browser headless saat `scrollY: 1600`: page berposisi `relative`, dengan `opacity: 1` dan `transform: none`. Transisi scroll dari cover Frame 1 ke awal Frame 2 tidak diubah.
