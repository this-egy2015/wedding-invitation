# Animasi cover overlay mulus

Animasi Frame 1 memakai `transform 1.5s linear`. Penambahan class tujuan terjadi setelah dua `requestAnimationFrame`, memastikan browser telah merender state fixed overlay awal sebelum melakukan transisi.

Verifikasi browser headless: transform berubah kontinu dari Y `-213.077px` ke `-488.29px` dalam selang 0,5 detik.
