<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Aturan bersama untuk agen AI (Claude Code & Codex)

Repo ini dikerjakan oleh dua agen: **Claude Code** (membaca `CLAUDE.md`, yang mengimpor file ini) dan **Codex** (membaca `AGENTS.md`). Aturan di bawah berlaku untuk keduanya. Jangan menaruh aturan di dalam blok `nextjs-agent-rules` di atas karena blok itu ditimpa oleh `next dev`.

## Sebelum mulai

1. Baca `README.md` (setup, keputusan desain, Security).
2. Baca `docs/ai-collab/BOARD.md`: siapa sedang mengerjakan apa, handoff terakhir, dan pertanyaan terbuka.
3. Baca catatan terbaru di `docs/ai-collab/notes/` yang relevan dengan tugasmu.

## Saat bekerja

- Bahasa: teks UI dan dokumentasi dalam Bahasa Indonesia; identifier dan komentar kode dalam Bahasa Inggris (ikuti gaya yang sudah ada).
- Ikuti keputusan desain di `README.md`. Mengubahnya berarti menulis entri baru di `docs/ai-collab/DECISIONS.md` lebih dulu.
- Setiap akses data dashboard wajib lewat `getOwnedInvitation()` / `requireUser()`. `src/proxy.ts` bukan auth gate.
- Ubah skema hanya di `src/db/schema.ts`, lalu `npm run db:generate`. Jangan mengedit file di `drizzle/` secara manual.
- Jangan commit `.env*` (kecuali `.env.example`) atau token/kunci apa pun, termasuk di `docs/ai-collab/`.
- Satu branch per agen per tugas (`claude/...` atau `codex/...`). Jangan mengedit file yang sedang diklaim agen lain di `BOARD.md`.

## Sebelum selesai

```bash
npm run typecheck
npm test
npm run build   # butuh .env.local atau env dummy
```

Lalu perbarui `docs/ai-collab/BOARD.md` (status dan handoff), dan tulis catatan di `docs/ai-collab/notes/` jika ada temuan, alasan, atau pertanyaan yang perlu dibaca agen lain.
