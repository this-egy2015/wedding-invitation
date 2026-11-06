# Menyiapkan invitation.riburupa.com

Target aplikasi: **https://invitation.riburupa.com**. Proyek Vercel: `acme-d-luh-vi/wedding-invitation`. Undangan tetap di `/<slug>`, misalnya `/gaby-afdhal`; `/` dan `/home` tetap 404 sesuai keputusan pemilik. Admin/petugas masuk lewat `/login` dan menuju pengelolaan tamu.

## Status persiapan — 6 November 2026

- Domain sudah ditambahkan ke proyek Vercel dan kepemilikannya terverifikasi.
- DNS `riburupa.com` berada di Cloudflare (`devin.ns.cloudflare.com`, `zoe.ns.cloudflare.com`). Subdomain belum memiliki record; Vercel masih melaporkan `invalid_configuration`.
- `SITE_URL` Production sengaja disetel eksplisit ke `https://wedding-invitation-lovat-theta.vercel.app` selama persiapan. Dengan demikian penambahan domain tidak mengubah origin aplikasi melalui fallback domain sistem Vercel sebelum DNS/Auth siap.
- Kode menerima origin custom melalui `SITE_URL`, menormalisasi trailing slash dan menolak path/query/fragment/kredensial. Link tamu, login petugas, callback dan metadata mengikuti nilai ini. Tidak perlu basePath atau prefix `/invitation`.

## 1. Tambahkan DNS Cloudflare

Di zona **riburupa.com → DNS → Records**, tambahkan record host `invitation` berikut:

| Field | Nilai |
|---|---|
| Type | CNAME |
| Name | invitation |
| Target | 63d20240d6610afa.vercel-dns-017.com |
| Proxy status | DNS only (awan abu-abu) |
| TTL | Auto |

Nilai tersebut berasal dari `vercel domains verify invitation.riburupa.com`, bukan CNAME generik yang ditebak. Pilih satu record CNAME untuk host ini. Record apex, www, MX dan DNS layanan lain tetap terpisah.

Alternatif: proyek Vercel → Settings → Domains → invitation.riburupa.com → **Connect Automatically** bila ditawarkan, lalu tinjau perubahan Cloudflare melalui Domain Connect. Lakukan verifikasi ulang setelah record diterapkan:

```bash
npx vercel domains verify invitation.riburupa.com
curl -I https://invitation.riburupa.com/login
curl -I https://invitation.riburupa.com/gaby-afdhal
```

Lanjutkan setelah konfigurasi valid, sertifikat HTTPS terbit, dan kedua halaman merespons 200. `/` memberi 404 secara sengaja, sehingga gunakan `/login` atau slug untuk mengecek kesehatan domain. [Panduan domain Vercel](https://vercel.com/docs/domains/working-with-domains/add-a-domain).

## 2. Siapkan callback Supabase

Supabase → proyek hosted → **Authentication → URL Configuration**:

| Pengaturan | Nilai setelah DNS/HTTPS siap |
|---|---|
| Site URL | https://invitation.riburupa.com |
| Redirect URLs tambahan | https://invitation.riburupa.com/auth/callback |

Pertahankan callback lama `https://wedding-invitation-lovat-theta.vercel.app/auth/callback` selama perpindahan dan opsi rollback. Gunakan URL callback lengkap dan spesifik. `SUPABASE_URL` tetap menunjuk API proyek Supabase; domain web dikonfigurasi melalui `SITE_URL`. [Panduan redirect Supabase](https://supabase.com/docs/guides/auth/redirect-urls).

## 3. Aktifkan origin aplikasi

Setelah langkah 1–2 selesai, ubah environment **Production** proyek Vercel:

```dotenv
SITE_URL=https://invitation.riburupa.com
```

Redeploy aplikasi agar build dan runtime memakai konfigurasi yang sama. `ADMIN_EMAIL`, kredensial Turso, Supabase Auth/Storage dan data undangan tetap memakai layanan yang telah dikonfigurasi. Development tetap memakai `http://localhost:3000`; Preview memiliki konfigurasi dan callback terpisah.

Mulai login dari `https://invitation.riburupa.com/login` dan bagikan URL domain baru. PKCE verifier/session berada di cookie origin tempat login dimulai; memulai login dari alias lama lalu diarahkan ke callback domain baru dapat gagal. Jika alias lama dibuat redirect ke domain baru melalui pengaturan Domains Vercel, pertahankan path dan query (`?to=`) dan aktifkan hanya setelah domain baru teruji. Uji ulang link tamu personal setelah redirect.

Cookie login/RSVP tidak otomatis berpindah antar-domain. Pengunjung perlu login ulang pada domain baru; link personal `?to=` tetap mengenali tamu yang sama. Pengisi RSVP link umum dari domain baru dapat dianggap pengunjung baru karena cookie lama tidak tersedia. Tidak mengubah domain cookie menjadi `.riburupa.com`.

## 4. Verifikasi setelah aktivasi

- `/gaby-afdhal`: cover, gambar, carousel, RSVP dan musik yang sudah dipasang berjalan.
- Link personal hasil salin dashboard memakai `https://invitation.riburupa.com/<slug>?to=...` dengan token tetap utuh; gambar Open Graph memakai domain baru.
- Login admin dan petugas via email kembali ke `/auth/callback`, kemudian `/dashboard`/halaman tamu. Email di luar daftar tetap ditolak.
- `/`, `/home` dan slug tidak terbit memberi 404; dashboard anonim menuju `/login`.

Magic link hosted masih memerlukan custom SMTP untuk petugas di luar tim Supabase. Domain web saja belum mengaktifkan pengiriman email. Konfigurasi sender/DNS email mengikuti penyedia SMTP yang dipilih, terpisah dari CNAME web. [SMTP Supabase](https://supabase.com/docs/guides/auth/auth-smtp).

## Rollback origin

Jika ditemukan masalah, kembalikan `SITE_URL` Production ke `https://wedding-invitation-lovat-theta.vercel.app`, kembalikan Site URL Supabase ke alamat itu, pastikan callback lama tetap diizinkan, lalu redeploy. Nonaktifkan redirect alias lama jika sebelumnya diaktifkan. Data Turso dan objek Storage tidak perlu dimigrasikan untuk rollback domain.
