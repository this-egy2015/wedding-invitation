# Daftar ucapan RSVP: maks 5 tampil + infinite scroll

Melanjutkan sesi Codex: setelah submit, ucapan langsung masuk ke daftar di bawah form; maksimal 5 kartu terlihat (sesuai tinggi 5 kartu), sisanya dimuat lewat infinite scroll.

- `src/features/rsvp/wishes.ts` (server action): `listWishesAction(slug, offset)` mengambil ucapan published yang terlihat (`isWishVisible` true dan `wish` tidak null), urut `respondedAt` desc + `id` desc, halaman 5 item, `hasMore` dari `limit(6)`. Menggantikan `listVisibleWishes` di queries.
- `src/templates/classic/WishList.tsx` (client): `IntersectionObserver` pada sentinel memuat halaman berikutnya saat mendekati bawah; otomatis mengisi sampai list bisa di-scroll bila 5 item belum overflow.
- `src/templates/classic/RsvpSection.tsx` (client): menggabung `RsvpForm` + `WishList`, menaikkan `refreshKey` tiap submit sukses agar ucapan baru langsung tampil tanpa reload penuh.
- `src/templates/classic/RsvpForm.tsx`: memanggil server action langsung (`await`) untuk memicu `onSaved` setelah sukses, dengan pending state dan pesan error lokal.
- `TemplateProps.wishes` dihapus; halaman publik tidak lagi memuat wish server-side. Preview tetap tidak menampilkan form/ucapan.
- CSS: kartu wish tinggi tetap 99px (judul ellipsis, ucapan clamp 2 baris); `.wishes` `max-height: 605px` + `overflow-y: auto` agar persis 5 kartu terlihat.

Validasi: typecheck, 24 tes, build lulus. Smoke browser untuk perilaku infinite scroll/live update belum dijalankan; perlu dicek di dev/hosted bila ingin memastikan IntersectionObserver dan live update.
