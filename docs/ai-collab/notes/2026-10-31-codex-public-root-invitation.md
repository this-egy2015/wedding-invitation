# Undangan publik pada route utama

> Digantikan oleh `2026-10-31-codex-invitation-route-template.md`: sesuai koreksi pemilik, root menampilkan 404 dan undangan berada pada `/:idUndangan`. `HomeInvitation` dihapus; runtime memakai template Classic dengan data undangan.

Route `/` tidak lagi mengarahkan ke dashboard. Ia merender `HomeInvitation`, contoh undangan publik yang membawa bahasa visual dan interaksi prototype Frame 1/2 ke Next.js: cover overlay, countdown, mempelai, acara/peta, galeri, RSVP lokal, dan salin rekening.

Halaman ini sengaja tidak membaca database atau menjalankan auth agar aman untuk kunjungan publik. `/invite/[slug]` tetap menjadi undangan dinamis berbasis data. `/login` masih dapat dibuka langsung, tetapi tidak ditautkan dari root dan mempunyai metadata `noindex, nofollow`; dashboard tetap dilindungi `requireUser()`.

Verifikasi production lokal: `/` memberi 200 tanpa header `Location`; `/dashboard/invitations` anonim memberi 307 ke `/login`; login merender metadata robots `noindex, nofollow`.
