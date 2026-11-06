# Unggah lagu dan floating mute

Permintaan pemilik: pilih file lagu melalui layanan undangan, sistem timpa, dan tombol mute mengambang. Branch `codex/music-upload-mute`.

Editor mengganti input path musik dengan input MP3 maksimal 10 MiB, status unggahan dan pesan gagal. Form tetap menyimpan `musicUrl`, jadi tanpa migrasi konten/DB. Server action `prepareMusicUploadAction` memanggil `getOwnedInvitation`, memvalidasi metadata, lalu menerbitkan signed upload dengan upsert ke satu objek `wedding-music/berubah/<slug>/audio/music.mp3`. Nama file pengguna tidak menentukan lokasi. Browser mengirim file langsung ke Supabase, menghindari batas body Vercel; tidak mengirim file lewat FormData simpan draft.

Bucket publik musik dibuat otomatis pada upload pertama menggunakan service-role/secret key privat. MIME hanya audio/mpeg, batas 10 MiB; konfigurasi existing yang tidak sesuai ditolak, tanpa memperluas izin gambar atau menambah policy tulis anonim. Supabase tetap memeriksa ukuran/MIME aktual pada PUT, bukan sekadar metadata client. Signed URL berlaku sesuai TTL Supabase (dua jam) dan hanya memberi akses objek itu; jangan mencatat URL bertoken di log. .env.example/howto menjelaskan key lokal dan hosted. Key lokal dikonfigurasi di .env.local yang diabaikan Git.

Path konten tetap lokal `/berubah/<slug>/audio/music.mp3`. Handler khusus mengarahkan GET/HEAD ke Storage dengan cache-buster dan no-store, agar playback baru mengambil lagu pengganti tanpa mem-proxy audio besar melalui Vercel. Path musik lama tetap memakai handler aset existing. File lagu baru pertama kali memerlukan Simpan Draft → Publikasikan; upload berikutnya langsung menimpa objek yang sedang dipakai undangan terbit. Tab yang sedang memutar perlu dimuat ulang. Tidak mengubah atau menghapus berkas legacy yang asal-usulnya belum diketahui.

CoverGate memakai tombol speaker fixed 44px dengan safe-area, focus ring, label aksesibel dan aria-pressed. Mute mengubah audio.muted, tidak pause/reset waktu. Audio mulai melalui klik Buka Undangan; bila browser menolak play, tombol memungkinkan mencoba lagi. Tidak ada tombol tanpa lagu. Animasi cover/carousel tidak diubah.

Validasi: typecheck, 26 unit test, build lulus. Smoke Chrome mobile terhadap akun dan undangan lokal sementara mencakup unggah 6 MB, simpan draft/publish, timpa file kedua (satu objek tersisa), penolakan MIME executable dan file >10 MiB oleh Storage (lagu lama utuh), penolakan tulis anonim, replay action dari pemilik lain dan tanpa autentikasi, redirect no-store, Range 206/100 byte, autoplay dari klik, mute tanpa menghentikan waktu, unmute, tombol terlihat setelah scroll dan tanpa overflow. Semua fixture akun, undangan, objek dibersihkan. Audio sintetis hanya dipakai lokal, tidak diunggah ke undangan produksi. Skrip smoke sementara `/tmp/wedding-music-smoke.mjs`.

Belum diperiksa: Safari/iOS fisik dan upload melalui login owner hosted. Lagu produksi belum disediakan pemilik; tidak memasukkan lagu contoh. Bucket hosted akan dibuat pada upload owner pertama. Tidak menambah playlist, histori lagu, konversi format, atau upload gambar.

Referensi: [Supabase signed upload/upsert](https://supabase.com/docs/reference/javascript/file-buckets-uploadtosignedurl), [batas request Vercel](https://vercel.com/docs/functions/limitations); guide Server Actions dibaca dari dokumentasi Next yang terpasang.
