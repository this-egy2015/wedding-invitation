# Hapus langsung dari tabel tamu

Pemilik meminta tombol hapus di tabel tamu, tanpa membuka Detail. Branch codex/guest-table-delete. Setiap baris kini menampilkan Hapus di kolom Aksi, memakai ConfirmButton dan deleteGuestAction yang sudah ada. Konfirmasi mencantumkan nama tamu dan bahwa RSVP ikut dihapus permanen. Aksi memakai getGuestManagementInvitation sehingga tetap dibatasi admin/petugas pada undangan tersebut. Ditambahkan revalidatePath untuk daftar/detail tamu sebelum redirect agar tabel segera berubah. Tombol dapat wrap pada layar sempit; fungsi hapus di Detail tetap tersedia.

Validasi: typecheck, 27 tes dan build lulus. Smoke Chrome viewport 390px memakai akun admin/petugas dan fixture lokal sementara: tombol tiap baris terlihat, dialog konfirmasi native dibatalkan (tamu/RSVP utuh), konfirmasi hapus sebagai petugas dan admin berhasil, baris hilang tanpa reload manual, RSVP cascade, empty state tampil setelah tamu terakhir dihapus, dan tamu undangan lain tetap ada. Tidak ada page overflow. Semua fixture dibersihkan. Skrip sementara /tmp/wedding-delete-smoke.mjs.

Tidak menghapus tamu produksi untuk pengujian. Login/email hosted tetap menunggu konfigurasi custom SMTP; pemilik menyatakan belum/belum tahu.
