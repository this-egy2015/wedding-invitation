# Keputusan

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
