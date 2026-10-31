# Animasi keluar cover mandiri

`transitionend` pada container cover dapat menerima event yang membubble dari tombol di dalamnya, sehingga cover berisiko hilang sebelum transisi keluar selesai. Mekanisme tersebut serta timeout dihapus.

Cover kini memakai `Element.animate()` dengan `duration: 1500`, `easing: linear`, dan `fill: forwards`; `onfinish` animasi tersebut satu-satunya jalur yang menyembunyikan cover. Smoke test pada pertengahan durasi mencatat `hidden: false`, animasi aktif, dan transform vertikal berjalan.
