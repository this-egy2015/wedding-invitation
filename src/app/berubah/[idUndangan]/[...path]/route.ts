import { env } from "@/env";
import { assetContentType } from "@/lib/asset-path";
import { MUSIC_BUCKET, MUSIC_FILE, musicPath } from "@/lib/music-upload";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Context = { params: Promise<{ idUndangan: string; path: string[] }> };

async function serve(request: Request, { params }: Context) {
  const { idUndangan, path } = await params;
  const contentType = assetContentType(idUndangan, path);
  if (!contentType) return new Response(null, { status: 404 });
  if (path.join("/") === MUSIC_FILE) {
    // Direct playback avoids proxying large audio through a Vercel Function.
    const url = new URL(`/storage/v1/object/public/${MUSIC_BUCKET}/${musicPath(idUndangan)}`, env.SUPABASE_URL);
    url.searchParams.set("v", String(Date.now()));
    return new Response(null, { status: 307, headers: { Location: url.href, "Cache-Control": "no-store" } });
  }
  try {
    const upstream = await fetch(`${env.SUPABASE_URL.replace(/\/$/, "")}/storage/v1/object/public/wedding-assets/berubah/${idUndangan}/${path.join("/")}`, {
      method: request.method, cache: "no-store", redirect: "error", signal: AbortSignal.timeout(15000),
      headers: request.headers.has("range") ? { Range: request.headers.get("range")! } : {},
    });
    if (!upstream.ok) {
      await upstream.body?.cancel();
      if (upstream.status === 416) return new Response(null, { status: 416, headers: { "Content-Range": upstream.headers.get("content-range") ?? "bytes */0" } });
      return new Response(null, { status: upstream.status === 404 || upstream.status === 400 ? 404 : 502 });
    }
    const headers = new Headers({
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=60",
      "X-Content-Type-Options": "nosniff",
    });
    for (const name of ["content-length", "content-range", "accept-ranges"]) {
      const value = upstream.headers.get(name);
      if (value) headers.set(name, value);
    }
    return new Response(upstream.body, { status: upstream.status, headers });
  } catch {
    return new Response(null, { status: 502 });
  }
}

export const GET = serve;
export const HEAD = serve;
