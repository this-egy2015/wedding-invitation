# Keputusan

## 008. SITE_URL dari domain Vercel bila belum diisi (2026-10-31, codex)

**Konteks**: Build Vercel gagal saat memuat layout karena integrasi Supabase tidak menyediakan SITE_URL.
**Keputusan**: SITE_URL eksplisit tetap utama. Pada Vercel Production, fallback memakai VERCEL_PROJECT_PRODUCTION_URL lalu VERCEL_URL; environment lain memakai VERCEL_URL agar preview tidak mengarah ke produksi. Domain sistem ditambahkan skema HTTPS. Di luar Vercel, SITE_URL tetap wajib diisi.
**Konsekuensi**: Redirect Auth, tautan tamu, dan metadata tetap berasal dari konfigurasi tepercaya, bukan header request. URL salah/localhost tetap ditolak di Vercel. Callback Supabase harus sesuai domain efektif; kredensial Turso tetap diperlukan terpisah.

## 007. Aplikasi penuh di Vercel dengan SQLite remote dan media persisten (2026-10-31, codex)

**Konteks**: Keputusan terakhir pemilik adalah aplikasi penuh di Vercel dengan layanan remote. Path media yang diminta tetap `/berubah/<idUndangan>`.
**Keputusan**: Runtime memakai Drizzle/libSQL: file SQLite privat untuk development, Turso melalui TLS/token privat untuk Vercel. Transaksi write libSQL memakai BEGIN IMMEDIATE, guard ownership tetap berlaku. Supabase hosted menangani Auth dan Storage. Media konten disimpan di bucket `wedding-assets/berubah/<slug>/...`, disajikan melalui route GET/HEAD pada path aplikasi yang sama. Konten menyimpan path relatif; ornamen UI tetap ikut build. Tidak menambah endpoint upload anonim.
**Konsekuensi**: Vercel menolak fallback ke SQLite lokal bila token/URL remote belum tersedia. Migration/seed mendukung env produksi terpisah; backup lokal tidak dianggap backup Turso. Foto dan DB tidak bergantung filesystem deployment. Route media menolak traversal/file executable, meneruskan media dari host Supabase yang dikonfigurasi tanpa mengirim secret key. Akun/layanan hosted perlu dikonfigurasi sebelum deploy.

## 006. Seed prototype lengkap melalui asset server (2026-10-31, codex)

**Konteks**: Pemilik meminta push ke repo GitHub, seed semua teks/foto, dan mencoba Vercel.
**Keputusan**: Seed khusus `demo-gaby-afdhal` memakai teks prototype dan 30 foto galeri, serta foto kutipan dan peta sebagai konten URL opsional. Batas galeri naik menjadi 30. File foto disajikan storage aset; ornamen tetap milik template. Seed membuat contoh tamu/ucapan dengan token acak, tidak menghapus tamu/respons yang ada, dan membuat backup sebelum memperbarui demo. Rekening tetap contoh; musik tidak dibuat karena tidak ada berkas sumber.
**Konsekuensi**: Tambahan field berada dalam JSON konten, tanpa perubahan tabel. Konten lama tetap tampil melalui fallback. Vercel memerlukan SQLite remote dan Auth/storage publik; SQLite lokal tidak dipindah ke filesystem sementara. Perubahan provider menunggu keputusan pemilik dan akses layanan.

## 005. Purge stack database lama setelah cutover (2026-10-31, codex)

**Konteks**: Setelah migrasi SQLite berhasil, pemilik meminta menghapus yang tidak lagi dipakai.
**Keputusan**: Hapus importer PostgreSQL sekali pakai, package postgres, migration/snapshot PostgreSQL lama, variabel koneksi lamanya, dan dependency motion yang tidak diimpor kode. Migration SQLite, backup, test, serta prototype acuan tetap diperlukan. Supabase Auth/storage masih aktif sehingga package/config layanannya dipertahankan.
**Konsekuensi**: Repo hanya menyediakan alur DB SQLite; migration PostgreSQL lama masih ada dalam riwayat Git. Alat impor sekali pakai dihapus setelah data terverifikasi. Database SQLite dan backup tetap disimpan; tidak melakukan drop/reset layanan Supabase yang dipakai login/media.

## 004. SQLite untuk data aplikasi (2026-10-31, codex)

**Konteks**: Pemilik meminta mengganti database dengan SQLite dan menjaga keamanan.
**Keputusan**: Data undangan/tamu/RSVP memakai SQLite melalui Drizzle dan better-sqlite3. Supabase tetap untuk Auth; storage foto tidak berubah. File DB disimpan di direktori privat di luar public, diabaikan Git, dengan foreign keys, WAL, busy timeout, dan transaksi sinkron `BEGIN IMMEDIATE` untuk perubahan kuota/RSVP. Semua akses dashboard tetap melewati guard ownership/auth. Skema SQLite dan migration baru dihasilkan Drizzle; migration PostgreSQL lama tetap disimpan sebagai riwayat.
**Konsekuensi**: Deployment memerlukan Node.js dan disk persisten lokal pada satu host, bukan filesystem sementara/serverless. FK ke `auth.users` tidak tersedia lintas database: owner UUID tetap diverifikasi oleh Supabase Auth dan filter ownership aplikasi; penghapusan akun Auth memerlukan penghapusan data aplikasi tersendiri. Impor data lama dilakukan dari snapshot baca-saja PostgreSQL ke SQLite kosong, mempertahankan UUID, slug, token, dan timestamp tanpa menghapus sumber. Backup harus memakai API SQLite agar konsisten dengan WAL.

## 003. URL publik dan pemisahan konten/template (2026-10-31, codex)

**Konteks**: Pemilik meminta `/:idUndangan` dan 404 pada `/`. Halaman demo root sebelumnya mencampur foto contoh dengan dekorasi UI.
**Keputusan**: `idUndangan` adalah slug publik immutable yang sudah ada; UUID tetap untuk dashboard. Route publik hanya membaca konten published dan memilih UI lewat `templateId`. `/` serta slug tidak ditemukan menampilkan 404 “Undangan tidak ditemukan”. Link lama `/invite/:slug` diarahkan ke URL baru dengan token personal tetap dipertahankan.
**Konsekuensi**: Link dashboard, pembagian undangan, dan invalidasi RSVP mengikuti URL baru. Nama route internal dicadangkan ketika membuat slug. Dekorasi berada di `src/templates/classic/assets/`; foto pasangan/galeri, peta dan rekening berasal dari konten undangan. Tidak ada impor runtime dari `prototype/` atau form RSVP simulasi. Template dipakai bersama halaman publik dan preview pemilik.

Keputusan desain inti ada di `README.md` → "Keputusan desain". Entri di bawah adalah keputusan baru atau perubahan sesudahnya.

Format:

```
## NNN. Judul (YYYY-MM-DD, agen)
Konteks / Keputusan / Konsekuensi
```

## 001. Aturan agen di AGENTS.md, CLAUDE.md hanya mengimpor (2026-10-30, claude)

**Konteks**: Repo dikerjakan oleh Claude Code (membaca `CLAUDE.md`) dan Codex (membaca `AGENTS.md`). Blok `nextjs-agent-rules` di `AGENTS.md` ditulis ulang oleh `next dev`.
**Keputusan**: Aturan bersama ditulis di `AGENTS.md`, di luar blok Next.js. `CLAUDE.md` hanya berisi `@AGENTS.md`.
**Konsekuensi**: Satu sumber aturan untuk kedua agen. `next dev` tidak menimpa bagian di luar penanda (`upsertManagedBlock` hanya mengganti isi di antara marker).

## 002. Foto bingkai & judul cover sebagai konten, bukan aset statis (2026-10-30, claude)

**Konteks**: Cover Figma berisi foto pasangan dalam heksagon dan judul "MAIMBAU BARALEK" (khas Minang).
**Keputusan**: Keduanya jadi field konten opsional (`coverPortraitUrl`, `coverTitle`) dengan `.default("")`. Template jatuh ke `coverImageUrl` dan "Maimbau Baralek" jika kosong. Hanya bouquet dan glow yang menjadi aset statis template (`src/templates/classic/assets/`).
**Konsekuensi**: Tidak perlu migrasi DB (konten berupa jsonb). Draft lama tetap valid. `templateVersion` tidak dinaikkan karena belum ada undangan yang di-publish.
