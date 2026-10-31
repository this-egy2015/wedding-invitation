# Keputusan

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
