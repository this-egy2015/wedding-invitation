# Board

## Sedang dikerjakan

| Agen | Branch | Tugas | File yang disentuh |
|---|---|---|---|
| — | — | Perbaikan SITE_URL selesai; deployment menunggu environment Turso | — |

## Handoff terakhir

- **2026-10-31, codex**: `codex/vercel-site-url` memperbaiki ZodError SITE_URL pada build Vercel. URL eksplisit tetap utama; fallback domain sistem Vercel membedakan Production dan Preview. Typecheck, 19 tes, dan build lulus. CLI Vercel kini login dan repo terhubung ke proyek `acme-d-luh-vi/wedding-invitation`; integrasi Supabase Production ada, tetapi TURSO_DATABASE_URL/TURSO_AUTH_TOKEN belum terdaftar. Lihat `notes/2026-10-31-codex-vercel-site-url.md`.

- **2026-10-31, codex**: Origin SSH sudah dapat push ke `main`. Keputusan terakhir pemilik: aplikasi penuh di Vercel, dengan Turso (SQLite/libSQL) dan Supabase hosted Auth/Storage. Kode memakai transaksi async, seed/migrasi lokal maupun remote, URL media `/berubah/<slug>/...`, alias environment integrasi Supabase, dan region Vercel Singapore. Makefile/howto tersedia. Typecheck, tes, build lokal/simulasi config remote, smoke HTTP ownership/RSVP serta media/carousel lulus. Deployment sungguhan menunggu layanan/env hosted; lihat `notes/2026-10-31-codex-vercel-remote-assets.md`.

- **2026-10-31, codex**: `codex/seeded-flow-howto` menambahkan `readme-howto.md` dan `Makefile`. `make seeded` menjalankan services → migrate → seed → dev secara berurutan; setup mempertahankan env lama. Panduan mencakup owner Auth, konfigurasi lokal, login/RSVP, cache, dan troubleshooting. Make orchestration diuji dengan stub terisolasi, `make check` (typecheck, 14 tes, build) lulus. Lihat `notes/2026-10-31-codex-seeded-flow-howto.md`.

- **2026-10-31, codex**: Branch `codex/github-seed-vercel`: origin diarahkan ke repo yang diminta; riwayat Git dipertahankan. Seed lengkap `demo-gaby-afdhal` aktif (37 gambar via Supabase Storage, 30 galeri, 4 tamu + 3 ucapan contoh), repeatable tanpa mengganti token/respons lama. Foto kutipan/peta dan urutan anak menjadi konten opsional; validasi origin/path aset diperketat. Typecheck, 14 tes, build, seed ulang dan smoke HTTP lulus. Push tertahan akses repo (`Repository not found` pada akun lokal `egy2015`); percobaan deploy Vercel gagal karena belum login, dan SQLite file lokal/Auth localhost belum cocok untuk Vercel. Lihat `notes/2026-10-31-codex-github-seed-vercel.md`.

- **2026-10-31, codex**: Purge pada branch `codex/purge-legacy-stack`: hapus postgres, motion beserta dependency yang tidak diperlukan, importer sekali pakai, migration/snapshot PostgreSQL lama, serta variabel koneksi lama. Alur DB aktif hanya SQLite; Supabase Auth/storage dan prototype acuan dipertahankan. Typecheck, 12 tes, build, integritas DB, dan smoke route lulus. Lihat `notes/2026-10-31-codex-purge-legacy-stack.md`.
- **2026-10-31, codex**: Database aplikasi dipindahkan ke SQLite/Drizzle/better-sqlite3 pada branch `codex/sqlite-database`; Supabase tetap untuk Auth/storage. Data lokal 2 undangan + 1 tamu terimpor dan diverifikasi tanpa mengubah PostgreSQL sumber. File privat, akses server-only, constraint/FK, transaksi IMMEDIATE, backup, dan pengecualian artefak deployment aktif. Typecheck, 12 test, build, audit runtime, smoke HTTP ownership/RSVP/publish, dan smoke carousel lulus. Lihat `notes/2026-10-31-codex-sqlite-database.md`.
- **2026-10-31, codex**: Carousel “Momen Kami” bergerak otomatis berulang dengan kecepatan prototype, tanpa tombol/scrollbar tambahan. Koreksi terakhir: berhenti hanya saat jari/mouse ditahan, langsung lanjut saat dilepas; hover, fokus, dan wheel tidak menghentikan autoplay. Native swipe dan drag mouse tetap bisa menggeser foto. Typecheck, unit test, build, dan smoke browser termasuk tahan setelah swipe serta lanjut tanpa delay lulus. Branch `codex/gallery-autoscroll`; lihat `notes/2026-10-31-codex-gallery-autoscroll.md`.
- **2026-10-31, codex**: Selesai pada branch `codex/invitation-route-template`: undangan publik di `/:idUndangan` (slug), root/home/slug tidak terbit memberi 404. Template Classic memakai UI Frame 1/2 dengan ornamen terpisah dari konten, animasi cover React/WAAPI, serta RSVP database. Demo lokal `/demo-gaby-afdhal` tersedia; undangan lama tidak diubah. Typecheck, 6 unit test, build, dan smoke test browser mobile lulus. Lihat `notes/2026-10-31-codex-invitation-route-template.md`. Menggantikan pendekatan demo root pada entri berikut.
- **2026-10-31, codex**: `/` sekarang menampilkan undangan publik berbasis prototype Frame 1/2 tanpa query data atau redirect auth. `/login` tetap hanya dapat diakses lewat URL langsung dan diberi `noindex`; dashboard tetap memakai `requireUser()`. Lihat `notes/2026-10-31-codex-public-root-invitation.md`.
- **2026-10-31, codex**: Keluar cover sekarang memakai Web Animations API 1.500 ms, bukan `transitionend`/timeout yang dapat terpanggil oleh elemen anak. Cover hanya disembunyikan saat animasi cover selesai. Lihat `notes/2026-10-31-codex-cover-web-animation.md`.
- **2026-10-31, codex**: Animasi cover overlay memakai 1,5 detik linear dan menunggu dua frame render sebelum mulai, agar Frame 1 tidak melompat ketika keluar. Lihat `notes/2026-10-31-codex-smooth-cover-overlay.md`.
- **2026-10-31, codex**: Animasi cover overlay sekarang memakai `translateY` saja; posisi horizontal dipisahkan lewat `left`, sehingga Frame 1 bergerak lurus vertikal ke atas. Lihat `notes/2026-10-31-codex-vertical-cover-overlay.md`.
- **2026-10-31, codex**: Cover Frame 1 mengikuti tinggi viewport dinamis mobile (`100dvh`) dengan minimum 799px, sehingga tidak ada background luar pada layar HP tinggi. Lihat `notes/2026-10-31-codex-mobile-cover-height.md`.
- **2026-10-31, codex**: Transisi cover sekarang berupa overlay: Frame 2 langsung di bawah, sementara Frame 1 fixed meluncur naik selama 1,5 detik lalu dihapus. Tidak ada scroll dokumen dan tidak dapat kembali ke cover. Lihat `notes/2026-10-31-codex-cover-overlay-transition.md`.
- **2026-10-31, codex**: Setelah transisi cover → Frame 2 selesai, cover Frame 1 dikeluarkan dari aliran dokumen. Pengunjung tidak dapat scroll kembali ke Frame 1. Lihat `notes/2026-10-31-codex-one-way-cover-transition.md`.
- **2026-10-31, codex**: Animasi sticky/fade antar-section Frame 2 dihapus. Frame 2 sekarang menggunakan scroll dokumen biasa; transisi cover Frame 1 ke awal Frame 2 tetap ada. Lihat `notes/2026-10-31-codex-frame-2-normal-scroll.md`.
- **2026-10-31, codex**: Tombol "Buka Undangan" sekarang mempertahankan cover Frame 1 lalu men-scroll satu tinggi cover (799px) ke Frame 2 secara halus; pada reduced motion scroll langsung. Lihat `notes/2026-10-31-codex-cover-scroll-transition.md`.
- **2026-10-30, claude**: Frame 2 (`1:2`) di `prototype/` dibangun ulang dari koordinat Figma dengan aset baru di `prototype/assets/figma-1-2/`, dan posisi cover Frame 1 diperbaiki. Hasilnya dibandingkan per piksel dengan render Figma. Lihat `notes/2026-10-30-claude-prototype-fidelity.md`. Folder `prototype/assets/frame-2/` sudah tidak dipakai.
- **2026-10-30, codex**: Frame 2 Figma (`1:2`) kini tersambung ke prototype mandiri: hero/countdown, quote, mempelai, acara/peta, galeri, RSVP, ucapan, dan gift. Aset yang dirender berada di `prototype/assets/frame-2/`; buka `prototype/index-figma.html?open=1` untuk langsung melihat Frame 2. Lihat `notes/2026-10-30-codex-figma-frame-2.md`.
- **2026-10-30, codex**: Prototype cover Figma mandiri tersedia di `prototype/index-figma.html`; seluruh export aset node `5:2` ada di `prototype/assets/`. Lihat `notes/2026-10-30-codex-figma-prototype.md`.
- **2026-10-30, claude**: Cover template `classic` diganti sesuai Figma (file `jSjr6kbydM2da7LMpIBA12`, node `5:2`), lihat `notes/2026-10-30-claude-figma-cover.md`. Ditambahkan field konten opsional `coverPortraitUrl` dan `coverTitle`.
- **2026-10-30, claude**: Audit repo selesai, lihat `notes/2026-10-30-claude-audit.md`. Typecheck, test (4/4), dan build lulus. Menambahkan `CLAUDE.md`, aturan bersama di `AGENTS.md`, dan folder ini.

## Pertanyaan terbuka untuk pemilik repo

- GitHub sudah publik dan deploy key SSH berizin tulis sudah ditambahkan; push berhasil.
- Pilihan akhir: aplikasi penuh Vercel, database/storage remote. Pemilik sedang provisioning Supabase Free Singapore melalui Vercel Marketplace. Masih perlu Turso, owner Auth hosted, SITE_URL/callback, dan login CLI Vercel.

- Upload media dari dashboard belum dibuat; seed/admin memakai Supabase Storage pada namespace `berubah/<slug>`.
- Rate limiting: cukup Vercel WAF, atau perlu di level aplikasi?
- Migrasi dashboard ke shadcn/ui: ya/tidak?
- Tidak ada pertanyaan Figma aktif: Frame 1 dan Frame 2 sudah diprototipekan secara mandiri.
