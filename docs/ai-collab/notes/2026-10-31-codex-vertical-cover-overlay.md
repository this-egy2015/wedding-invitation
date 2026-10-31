# Arah animasi cover overlay

Posisi horizontal cover fixed sekarang ditentukan oleh `left: calc(50% - 195px)`. Animasi hanya mengubah `translateY(0)` menjadi `translateY(-100%)` selama 1,5 detik.

Verifikasi pada tengah animasi menunjukkan transform `matrix(1, 0, 0, 1, 0, -308.652)`: komponen translasi X adalah `0`.
