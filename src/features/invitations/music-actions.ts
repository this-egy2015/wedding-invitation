"use server";

import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import { env } from "@/env";
import { MAX_MUSIC_BYTES, MUSIC_BUCKET, musicFileError, musicPath } from "@/lib/music-upload";
import { getOwnedInvitation } from "./queries";

export async function prepareMusicUploadAction(invitationId: string, input: unknown) {
  const invitation = await getOwnedInvitation(invitationId);
  const parsed = z.object({ name: z.string().max(255), size: z.number(), type: z.string().max(100) }).safeParse(input);
  const validationError = parsed.success ? musicFileError(parsed.data) : "File lagu tidak valid.";
  if (validationError) return { error: validationError };

  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SECRET_KEY;
  if (!key) return { error: "Penyimpanan lagu belum dikonfigurasi. Hubungi pengelola." };

  try {
    const storage = createClient(env.SUPABASE_URL, key, {
      auth: { persistSession: false, autoRefreshToken: false },
    }).storage;
    let { data: bucket } = await storage.getBucket(MUSIC_BUCKET);
    if (!bucket) {
      await storage.createBucket(MUSIC_BUCKET, {
        public: true, fileSizeLimit: MAX_MUSIC_BYTES, allowedMimeTypes: ["audio/mpeg"],
      });
      // Re-read also handles two owners creating the bucket simultaneously.
      ({ data: bucket } = await storage.getBucket(MUSIC_BUCKET));
    }
    if (!bucket?.public || bucket.file_size_limit !== MAX_MUSIC_BYTES ||
      bucket.allowed_mime_types?.length !== 1 || bucket.allowed_mime_types[0] !== "audio/mpeg") {
      return { error: "Konfigurasi penyimpanan lagu belum sesuai. Hubungi pengelola." };
    }
    const path = musicPath(invitation.slug);
    const { data, error } = await storage.from(MUSIC_BUCKET).createSignedUploadUrl(path, { upsert: true });
    if (error) return { error: "Belum bisa menyiapkan unggahan. Silakan coba lagi." };
    return { signedUrl: data.signedUrl, musicUrl: `/${path}` };
  } catch {
    return { error: "Penyimpanan lagu tidak terhubung. Silakan coba lagi." };
  }
}
