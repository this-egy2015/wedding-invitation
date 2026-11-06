# Satu kartu Tanda Kasih

Permintaan pemilik: dua rekening jangan mengulang seluruh kartu; font nomor rekening diperjelas. Branch codex/gift-single-card.

ClassicTemplate sekarang membuat kartu/judul/pengantar satu kali dan hanya mengulang grup rekening di dalamnya. Antar-rekening memakai pemisah halus; masing-masing punya tombol salin. Nomor tetap string utuh (nol awal dipertahankan), menggunakan Inter 600 dengan lining/tabular numerals dan wrapping untuk nomor panjang. Konten kosong menyembunyikan bagian ini. Editor sudah mendukung sampai lima rekening; ditambahkan petunjuk dan aria-describedby, tanpa mengubah struktur gifts, database atau nilai rekening pengguna.

Validasi: typecheck, 24 tes, build lulus. Smoke Chrome terhadap fixture lokal sementara mencakup 0/1/2/5 rekening pada viewport 320/390/1280px, satu kartu/judul, font Inter, angka tabular, tidak ada horizontal overflow termasuk 40 digit, serta hasil clipboard setiap tombol. Klik sintetis awal ditolak Clipboard API karena fokus/aktivasi; pengujian diulang dengan fokus halaman dan input mouse nyata melalui CDP, seluruh kasus lulus. Screenshot dua rekening 390px diperiksa. Fixture dibersihkan setelah pengujian. Tidak mengubah rekening produksi untuk testing.
