# Build Vercel: SITE_URL belum diisi

Log pemilik untuk commit 351fb04 menunjukkan kompilasi/TypeScript berhasil, kemudian collect page data gagal karena src/env.ts meminta SITE_URL saat layout dievaluasi. Warning npm/engine bukan penyebab kegagalan tersebut.

Perbaikan pada branch `codex/vercel-site-url`: SITE_URL eksplisit tetap utama. Jika tidak ada dan VERCEL aktif, Production memakai VERCEL_PROJECT_PRODUCTION_URL (fallback VERCEL_URL), sedangkan Preview/environment lain memakai VERCEL_URL. Skema HTTPS ditambahkan pada domain sistem. Tidak mengambil URL dari header Host. URL kosong/salah eksplisit dan localhost tetap ditolak; lokal tanpa SITE_URL masih gagal agar tidak mengarang domain.

Tes reproduksi gagal sebelum patch dan lulus setelahnya. Cakupan: domain Production/Preview, fallback deployment, prioritas URL custom, serta penolakan URL eksplisit invalid dan environment lokal tanpa SITE_URL. `make check`: typecheck, 19 tes, build lulus. Referensi resmi: https://vercel.com/docs/environment-variables/system-environment-variables.

CLI kini terautentikasi sebagai this-egy2015. Proyek yang ditemukan: `acme-d-luh-vi/wedding-invitation`, domain produksi `https://wedding-invitation-acme-d-luh-vi.vercel.app`. `vercel link` menghubungkan direktori melalui .vercel/ yang diabaikan Git dan menambahkan OIDC token ke .env.local privat; variabel lokal sebelumnya dipertahankan, izin file 0600.

Pemeriksaan nama env Production menunjukkan variabel integrasi Supabase tersedia. SITE_URL dan kedua variabel Turso belum ada saat pemeriksaan. Fallback memperbaiki SITE_URL, tetapi runtime/collect page data tetap memerlukan TURSO_DATABASE_URL dan TURSO_AUTH_TOKEN. Pemilik sudah diminta menambahkan keduanya di Vercel tanpa membagikan token di chat. Deploy live/RSVP hosted belum dapat diverifikasi sebelum database remote tersedia; jangan mengaktifkan SQLite file lokal untuk melewati guard ini.
