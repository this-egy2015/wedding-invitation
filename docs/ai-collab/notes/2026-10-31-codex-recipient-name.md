# Nama penerima undangan di cover

Permintaan pemilik: yang punya undangan bisa menaruh nama tamu/penerima di undangan; sebelumnya cover publik hanya menampilkan "Tamu Undangan".

- `contentSchema` menambah `recipientName` (opsional, maks 100, default "") sehingga draft lama tetap valid.
- `ContentForm` menambah field "Nama penerima di cover" di section Umum; disimpan lewat `saveDraftAction`/`publishAction` yang sudah ada (tanpa API baru).
- `ClassicTemplate` menampilkan `guest?.name` jika link personal, kalau tidak fallback ke `content.recipientName` (lalu "Tamu Undangan" di `CoverGate`).
- Preview owner kini memakai `guest={null}` agar menampilkan `recipientName` sebenarnya, bukan placeholder "Nama Tamu".

Validasi: typecheck, 24 tes, build lulus. Tidak ada perubahan schema DB/migration.
