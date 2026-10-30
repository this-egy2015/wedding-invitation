# Board

## Sedang dikerjakan

| Agen | Branch | Tugas | File yang disentuh |
|---|---|---|---|
| — | — | (kosong) | — |

## Handoff terakhir

- **2026-10-30, claude**: Frame 2 (`1:2`) di `prototype/` dibangun ulang dari koordinat Figma dengan aset baru di `prototype/assets/figma-1-2/`, dan posisi cover Frame 1 diperbaiki. Hasilnya dibandingkan per piksel dengan render Figma. Lihat `notes/2026-10-30-claude-prototype-fidelity.md`. Folder `prototype/assets/frame-2/` sudah tidak dipakai.
- **2026-10-30, codex**: Frame 2 Figma (`1:2`) kini tersambung ke prototype mandiri: hero/countdown, quote, mempelai, acara/peta, galeri, RSVP, ucapan, dan gift. Aset yang dirender berada di `prototype/assets/frame-2/`; buka `prototype/index-figma.html?open=1` untuk langsung melihat Frame 2. Lihat `notes/2026-10-30-codex-figma-frame-2.md`.
- **2026-10-30, codex**: Prototype cover Figma mandiri tersedia di `prototype/index-figma.html`; seluruh export aset node `5:2` ada di `prototype/assets/`. Lihat `notes/2026-10-30-codex-figma-prototype.md`.
- **2026-10-30, claude**: Cover template `classic` diganti sesuai Figma (file `jSjr6kbydM2da7LMpIBA12`, node `5:2`), lihat `notes/2026-10-30-claude-figma-cover.md`. Ditambahkan field konten opsional `coverPortraitUrl` dan `coverTitle`.
- **2026-10-30, claude**: Audit repo selesai, lihat `notes/2026-10-30-claude-audit.md`. Typecheck, test (4/4), dan build lulus. Menambahkan `CLAUDE.md`, aturan bersama di `AGENTS.md`, dan folder ini.

## Pertanyaan terbuka untuk pemilik repo

- Upload aset ke R2 (presigned URL): kapan dikerjakan, dan siapa (agen mana)?
- Rate limiting: cukup Vercel WAF, atau perlu di level aplikasi?
- Migrasi dashboard ke shadcn/ui: ya/tidak?
- Tidak ada pertanyaan Figma aktif: Frame 1 dan Frame 2 sudah diprototipekan secara mandiri.
