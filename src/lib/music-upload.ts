import { isPublicInvitationSlug } from "./invitation-url.ts";

export const MUSIC_BUCKET = "wedding-music";
export const MUSIC_FILE = "audio/music.mp3";
export const MAX_MUSIC_BYTES = 10 * 1024 * 1024;

export function musicPath(slug: string) {
  if (!isPublicInvitationSlug(slug)) throw new Error("Slug undangan tidak valid.");
  return `berubah/${slug}/${MUSIC_FILE}`;
}

export function musicFileError(file: { name: string; size: number; type: string }) {
  if (!/\.mp3$/i.test(file.name) || !["", "audio/mpeg", "audio/mp3"].includes(file.type)) {
    return "Pilih file lagu berformat MP3.";
  }
  if (!Number.isSafeInteger(file.size) || file.size <= 0 || file.size > MAX_MUSIC_BYTES) {
    return "Ukuran lagu harus lebih dari 0 dan maksimal 10 MB.";
  }
  return null;
}
