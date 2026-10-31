# Menjalankan undangan dengan data seed

Jalankan seluruh perintah dari root repo. Aplikasi memakai SQLite/libSQL untuk undangan/tamu/RSVP, Supabase Auth untuk login, dan Supabase Storage untuk gambar. Lokal memakai file DB + Supabase Docker; Vercel memakai Turso + Supabase hosted.

## Cepat: workspace yang sudah dikonfigurasi

Pastikan Docker aktif, dependency terpasang, dan `.env.local` berisi konfigurasi lokal yang valid. Hentikan dev server sebelumnya dengan `Ctrl+C` agar port 3000 tidak bentrok.

```bash
nvm use
make seeded
```

Target tersebut menjalankan Supabase lokal → migrasi SQLite → seed teks/gambar → dev server, berurutan dan berhenti jika ada tahap gagal. Kredensial tetap perlu dikonfigurasi. Untuk undangan yang sudah ada, owner dapat dibaca dari SQLite.

Buka **http://localhost:3000/gaby-afdhal**. Route `/` dan `/home` memang menampilkan 404 “Undangan tidak ditemukan”. Untuk penggunaan berikutnya tanpa mengulang inisialisasi undangan, cukup `make services` lalu `make dev`.

## Setup dari clone atau database kosong

### 1. Siapkan alat dan dependency

Butuh Docker yang sedang berjalan, GNU Make, dan Node.js sesuai `.nvmrc` (24.18.0; minimum aplikasi 22.18). Jika memakai nvm:

```bash
nvm install
nvm use
make setup
make services
```

`make setup` menjalankan `npm ci` dan menyalin `.env.example` menjadi `.env.local` dengan izin privat jika file belum ada. Konfigurasi yang sudah ada tidak ditimpa. `make services` menggunakan CLI Supabase yang terpasang di repo; tidak perlu install CLI global.

Jika registry npm mesin menunjuk server kantor yang tidak tersedia, gunakan override untuk perintah itu saja:

```bash
npm_config_registry=https://registry.npmjs.org make setup
```

### 2. Isi environment lokal

Lihat konfigurasi layanan dari terminal sendiri:

```bash
./node_modules/.bin/supabase status -o json
```

Salin nilai `ANON_KEY` ke `SUPABASE_ANON_KEY` di `.env.local`. Jangan menyalin output berisi kunci ke Git atau chat. Dengan port default repo ini, isinya:

```dotenv
SQLITE_PATH=./data/wedding.sqlite
SUPABASE_URL=http://127.0.0.1:54321
SUPABASE_ANON_KEY=<isi ANON_KEY dari status lokal>
SITE_URL=http://localhost:3000
SEED_OWNER_ID=<UUID akun owner dari langkah berikutnya>
```

Ganti placeholder sebelum menjalankan seed. Seed mengambil service role key langsung dari CLI lokal; tidak perlu menyimpannya di `.env.local`. Jangan memakai `NEXT_PUBLIC_` untuk service role key. Kosongkan/hapus variabel Turso saat ingin memakai SQLite lokal. `R2_PUBLIC_URL` tidak diperlukan lagi.

### 3. Siapkan owner undangan

1. Buka Supabase Studio lokal di **http://127.0.0.1:54323**.
2. Di **Authentication → Users**, buat user lokal melalui **Add user / Create user**, atau gunakan user yang sudah ada.
3. Salin UUID user itu ke `SEED_OWNER_ID` di `.env.local`. Gunakan alamat email user yang sama saat login dashboard nanti.

Seed memverifikasi akun tersebut melalui Supabase Auth. UUID acak tidak cukup. Jika undangan sudah dimiliki akun lain, gunakan owner undangan tersebut; seed tidak mengambil alih kepemilikan. Tidak ada password/login admin bawaan dalam repo.

Alternatif pada DB baru: isi `SEED_OWNER_EMAIL` tanpa `SEED_OWNER_ID`. Seed mencari akun dengan email itu atau membuat akun belum terverifikasi, tanpa password dan tanpa mengirim email. Login tetap memakai magic link. Owner undangan yang sudah ada selalu dipertahankan jika UUID tidak ditentukan.

### 4. Migrasi, seed, dan jalankan

```bash
make seeded
```

Jika hanya ingin menyiapkan data tanpa menjalankan dev server:

```bash
make services
make seed
```

`make seed` otomatis menjalankan migrasi terlebih dahulu. Migration aktif berasal dari `drizzle/sqlite/`; Supabase tetap menjalankan PostgreSQL internal untuk Auth/Storage, tetapi data aplikasi berada di SQLite.

## Data yang dihasilkan

| Isi | Hasil |
|---|---|
| Undangan | `/gaby-afdhal`, status published |
| Teks | Nama/orang tua, urutan anak, ayat, jadwal, venue, alamat dan link Maps sesuai prototype |
| Gambar | 37 gambar: cover, bingkai, dua mempelai, kutipan, dua peta, 30 foto galeri |
| Server aset | Bucket publik `wedding-assets`, prefix `berubah/gaby-afdhal/`; URL aplikasi `/berubah/gaby-afdhal/...` |
| Tamu | Awalnya kosong; diisi dari form publik atau dashboard pemilik |
| RSVP/ucapan | Awalnya kosong; tersimpan dari kiriman tamu |
| Tanda kasih | Kosong sampai pemilik memasukkan rekening yang benar |
| Musik | Kosong karena tidak ada berkas sumber |

Fixture teks ada di `scripts/fixtures/gaby-afdhal.json`; sumber gambar di `prototype/assets/`. Ornamen UI tetap di `src/templates/classic/assets/`, terpisah dari foto konten.

Seed ulang **tidak menimpa konten/status, gambar, tamu, respons, atau moderasi yang sudah ada**. Seed hanya membuat undangan jika belum tersedia. Untuk memperbarui konten, gunakan dashboard; sebelum perubahan produksi, siapkan backup Turso dan Storage.

File baru/berubah ditempatkan pada `wedding-assets/berubah/<slug>/...` melalui Storage, kemudian isi path `/berubah/<slug>/<file>` di editor. Pakai nama file baru saat mengganti foto agar cache memakai versi baru. Route aplikasi hanya melayani GET/HEAD; tidak ada upload anonim. Media tersedia melalui server aplikasi tanpa menyimpan file dalam filesystem Vercel.

## Login dan mencoba RSVP

1. Buka **http://localhost:3000/login** dan masukkan email owner.
2. Untuk Supabase lokal, buka kotak email uji di **http://127.0.0.1:54324**, lalu buka magic link yang diterima.
3. Masuk ke **http://localhost:3000/dashboard/invitations**, pilih undangan, lalu buka daftar tamunya.
4. Tambahkan tamu lewat dashboard jika membutuhkan undangan personal dan kuota tertentu, lalu salin linknya. Token dibuat acak; jangan mengarang nilai `?to=`.

URL undangan tanpa token menyediakan form nama, kehadiran, jumlah tamu (1–20), dan ucapan. Kiriman disimpan di database dan ucapan langsung diperbarui. Cookie HttpOnly mengingat respons pada browser yang sama; perangkat baru atau cookie dihapus dianggap tamu baru. Nama tidak digunakan untuk menebak/mengambil alih respons orang lain. Jika halaman masih menampilkan konten sebelum seed, buka editor undangan sebagai owner lalu klik **Publikasikan Ulang** untuk menyegarkan cache publik; reload browser saja belum tentu cukup.

## Perintah harian

```bash
make help       # daftar target
make dev        # jalankan aplikasi tanpa seed ulang
make backup     # snapshot SQLite; lokasi hasil dicetak di terminal
make check      # typecheck → unit test → build
```

Untuk mencoba build produksi secara lokal, hentikan dev server lalu jalankan:

```bash
make build
make start
```

Environment, SQLite, dan layanan Supabase tetap diperlukan. `Ctrl+C` menghentikan aplikasi. Jika layanan lokal juga ingin dihentikan, jalankan `./node_modules/.bin/supabase stop`; jangan gunakan `--no-backup` atau reset untuk flow ini.

## Jika gagal

| Gejala | Tindakan |
|---|---|
| `make` / `node` tidak ditemukan | Install GNU Make; aktifkan versi Node lewat `nvm use` |
| Docker tidak terhubung | Hidupkan Docker, lalu ulangi `make services` |
| Validasi env/URL gagal | Periksa `.env.local`, hapus placeholder, cocokkan URL dengan `supabase status` |
| `SEED_OWNER_ID` gagal / user tidak ada | Salin UUID akun dari Auth pada Supabase lokal yang sama |
| `no such table: invitations` | Gunakan `make seed`, yang menjalankan migrasi sebelum seed |
| Direktori SQLite tidak privat | Untuk path default yang sudah ada, jalankan `chmod 700 data` |
| Gambar tidak tampil | Pastikan Supabase hidup dan objek ada di `wedding-assets/berubah/<slug>/...`; pulihkan objek dari backup Storage atau unggah kembali aset yang hilang |
| Port 3000 dipakai | Hentikan proses aplikasi sebelumnya; konfigurasi Auth repo memakai port 3000 |
| Demo lama masih tampil | Klik Publikasikan Ulang lewat dashboard pemilik untuk invalidasi cache |

## Aplikasi penuh di Vercel

1. Hubungkan repo GitHub `this-egy2015/wedding-invitation` ke proyek Vercel. Login CLI lewat `npx vercel login`, lalu `npx vercel link` dari root repo. Jangan upload `.env` atau database ke repo.
2. Buat/hubungkan Supabase hosted melalui Marketplace Vercel. Untuk percobaan, pilih Free Plan dan Singapore (`ap-southeast-1`) jika tersedia; biarkan prefix `NEXT_PUBLIC_`. Hubungkan integrasi ke proyek aplikasi. Variabel publik/rahasia harus tetap terpisah.
3. Di Marketplace Vercel, tambahkan Turso dan hubungkan ke proyek pada environment Production. Integrasi membuat `TURSO_DATABASE_URL` dan `TURSO_AUTH_TOKEN`. SQLite lokal tetap digunakan untuk development; data produksi tersimpan di Turso. Proyek ini sudah memiliki resource `wedding-invitation-db` (Starter, Tokyo), jadi tidak perlu membuat database kedua.
4. Buat user owner di **Authentication → Users** pada Supabase hosted, atau gunakan `SEED_OWNER_EMAIL` ketika seed pertama. UUID akun Auth ini berbeda dari UUID akun lokal dan akun admin dashboard Supabase.
5. Simpan konfigurasi produksi di `.env.production.local` dengan izin 0600. File ini diabaikan Git. Jangan salin URL localhost atau owner UUID lokal ke produksi.

```dotenv
TURSO_DATABASE_URL=libsql://<database>-<organization>.turso.io
TURSO_AUTH_TOKEN=<token database>
SUPABASE_URL=https://<project-ref>.supabase.co
SUPABASE_PUBLISHABLE_KEY=<key publik dari integrasi>
SUPABASE_SECRET_KEY=<key privat untuk proses seed>
SEED_OWNER_ID=<UUID Auth hosted>
SITE_URL=https://<domain-aplikasi>.vercel.app
```

Key lama `SUPABASE_ANON_KEY` dan `SUPABASE_SERVICE_ROLE_KEY` juga didukung. `NEXT_PUBLIC_SUPABASE_URL` dan `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` dari integrasi diterima oleh aplikasi. Jangan menambahkan prefix publik pada secret key atau token Turso. Abaikan variabel `POSTGRES_*` untuk database aplikasi ini.

Jika env sudah tersinkron ke Vercel, `npx vercel env pull .env.vercel.remote --environment=production` dapat mengambil variabel yang diizinkan ke file privat. Variabel bertipe **Secret** dapat berisi placeholder `[SENSITIVE]`; file seperti ini belum bisa dipakai untuk seed lokal. Jangan menurunkan proteksi secret. Nama `.env.vercel.remote` sengaja tidak dimuat otomatis oleh Next.js agar hasil pull tidak merusak build lokal. Jika semua nilai asli tersedia melalui pengelola kredensial, salin konfigurasi lengkap ke `.env.production.local`, lengkapi owner dan SITE_URL, lalu jalankan `chmod 600 .env.production.local`. Seed harus dijalankan secara eksplisit, bukan setiap build:

```bash
make seed-remote
```

Target ini hanya membaca `.env.production.local`, menjalankan migrasi ke Turso, memverifikasi owner hosted, lalu meng-upload 37 foto dan inisialisasi undangan. Jika konfigurasi remote tidak lengkap, proses gagal tanpa fallback ke DB lokal. Token tamu lokal tidak diimpor otomatis.

Jika secret hanya tersedia di Vercel, seed dapat dijalankan sekali di build remote. Buat konfigurasi sementara di luar repo, misalnya `/tmp/wedding-vercel-seed.json`:

```json
{
  "regions": ["sin1"],
  "buildCommand": "npm run db:migrate && npm run db:seed && npm run build"
}
```

Kemudian, dari root repo yang sudah di-link, ganti alamat contoh dengan email owner:

```bash
npx vercel --prod --yes --local-config /tmp/wedding-vercel-seed.json \
  --build-env SEED_OWNER_EMAIL=owner@example.com
```

Secret diinjeksikan langsung oleh Vercel. Jangan mengubah build command default proyek menjadi seed: untuk deployment berikutnya gunakan `npx vercel --prod` biasa atau push Git. Seed ulang mempertahankan konten undangan dan gambarnya. Jika konfigurasi `vercel.json` berubah, samakan konfigurasi sementara sebelum memakai cara ini.

Jika undangan pernah dibuka sebelum seed, Vercel dapat mempertahankan cache 404 lintas deployment. Setelah seed berhasil, terbitkan ulang dari dashboard atau hapus hanya cache bertag undangan lewat CLI yang sudah di-link:

```bash
npx vercel cache dangerously-delete --tag invitation:gaby-afdhal --yes
```

Perintah ini menghapus cache, bukan data undangan di Turso.

6. Di environment Vercel **Production**, isi `TURSO_DATABASE_URL`, `TURSO_AUTH_TOKEN`, `SITE_URL`, serta URL/key publik Supabase (boleh alias integrasi). Secret/admin key hanya diperlukan oleh proses seed, bukan untuk halaman undangan atau login.

   `SITE_URL` dapat dikosongkan dengan menghapus variabelnya pada Vercel: Production memakai `https://${VERCEL_PROJECT_PRODUCTION_URL}` (fallback `VERCEL_URL`), sedangkan Preview memakai `https://${VERCEL_URL}`. Nilai eksplisit tetap diutamakan. Pastikan akses System Environment Variables aktif pada pengaturan Vercel. Untuk seed dari mesin lokal, `.env.production.local` tetap perlu SITE_URL eksplisit karena domain sistem Vercel tidak otomatis tersedia. Jika URL callback harus stabil/custom, isi SITE_URL dengan domain tersebut.
7. Pada Supabase Auth, set **Site URL** ke domain produksi dan tambahkan `https://<domain-aplikasi>.vercel.app/auth/callback` ke **Redirect URLs**. Delivery email produksi memakai konfigurasi Supabase hosted; inbox Docker port 54324 hanya untuk lokal. [SMTP bawaan Supabase hanya mengirim ke email anggota tim proyek](https://supabase.com/docs/guides/auth/auth-smtp); untuk alamat lain, konfigurasi SMTP sendiri.
8. Deploy dengan `npx vercel --prod`, lalu buka `https://<domain-aplikasi>.vercel.app/gaby-afdhal`. Periksa `/login`, login owner, link personal tamu, dan penyimpanan RSVP. `/` tetap 404 sesuai desain.

Jika memakai deployment preview, gunakan environment Preview dan callback URL yang sesuai; jangan mengarahkan pengujian yang mengubah data ke produksi tanpa sengaja. `make backup` hanya membackup SQLite lokal; backup Turso dan Storage harus dikelola melalui layanan masing-masing.
