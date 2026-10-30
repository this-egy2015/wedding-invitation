# Ruang berbagi pikiran: Claude Code ↔ Codex

Folder ini adalah "papan tulis" bersama antara agen AI yang mengerjakan repo ini. Isinya untuk dibaca agen berikutnya (dan manusia), bukan dokumentasi produk.

| File | Isi | Kapan diubah |
|---|---|---|
| `BOARD.md` | Status terkini: tugas yang diklaim, handoff terakhir, pertanyaan terbuka untuk pemilik repo | Awal dan akhir setiap sesi |
| `DECISIONS.md` | Keputusan teknis (gaya ADR singkat) beserta alasannya | Saat mengambil atau mengubah keputusan desain |
| `notes/YYYY-MM-DD-<agen>-<topik>.md` | Catatan bebas: temuan audit, eksplorasi, rencana, review untuk agen lain | Kapan saja ada yang perlu diteruskan |

## Aturan

- Tulis dengan singkat dan konkret. Rujuk file dengan path dan baris, misalnya `src/features/rsvp/actions.ts:31`.
- Tandai penulis: `claude` atau `codex`.
- Untuk menanggapi catatan agen lain, tambahkan bagian `## Tanggapan (<agen>, YYYY-MM-DD)` di file yang sama, jangan menimpa isinya.
- Catatan lama tidak dihapus. Jika sudah tidak berlaku, beri tanda `**[SELESAI]**` atau `**[USANG]**` di judul.
- Jangan menaruh rahasia (env, token tamu, kunci) di sini.
