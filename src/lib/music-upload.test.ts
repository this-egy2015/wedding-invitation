import assert from "node:assert/strict";
import { test } from "node:test";
import { MAX_MUSIC_BYTES, musicFileError, musicPath } from "./music-upload.ts";

test("music uploads accept only nonempty MP3 files within the storage limit", () => {
  const file = { name: "Lagu.MP3", size: MAX_MUSIC_BYTES, type: "audio/mpeg" };
  assert.equal(musicFileError(file), null);
  assert.equal(musicFileError({ ...file, type: "" }), null);
  for (const change of [{ name: "song.html" }, { type: "text/html" }, { size: 0 },
    { size: -1 }, { size: 1.5 }, { size: Infinity }, { size: MAX_MUSIC_BYTES + 1 }]) {
    assert(musicFileError({ ...file, ...change }));
  }
});

test("replacement uses one fixed object per invitation, never a user filename", () => {
  assert.equal(musicPath("gaby-afdhal"), "berubah/gaby-afdhal/audio/music.mp3");
  assert.notEqual(musicPath("gaby-afdhal"), musicPath("other-wedding"));
  for (const slug of ["../other", "a/b", "login", "", "gaby?x=1"]) {
    assert.throws(() => musicPath(slug));
  }
});
