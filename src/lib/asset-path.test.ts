import assert from "node:assert/strict";
import { test } from "node:test";
import { assetContentType, isAssetPath } from "./asset-path.ts";

test("media URLs stay within an invitation namespace and reject traversal/executable files", () => {
  assert(isAssetPath("/berubah/gaby-afdhal/figma-1-2/gallery/01.jpg"));
  assert(isAssetPath("/berubah/wedding-2026/music.mp3"));
  assert.equal(assetContentType("wedding-2026", ["cover.PNG"]), "image/png");
  for (const value of [
    "/berubah/gaby-afdhal/../secret.png", "/berubah/gaby-afdhal/%2e%2e/a.jpg",
    "/berubah/gaby-afdhal/a%2fb.jpg", "/berubah/gaby-afdhal/a\\b.jpg",
    "/berubah/gaby-afdhal/.env.local", "/berubah/gaby-afdhal/app.sqlite",
    "/berubah/gaby-afdhal/a.svg", "/berubah/gaby-afdhal/index.html",
    "/berubah/gaby-afdhal/a.jpg?url=https://evil.test", "/berubah/gaby-afdhal/a.jpg#x",
    "//evil.test/cover.jpg", "https://evil.test/cover.jpg", "/berubah/login/cover.jpg",
    "/berubah/gaby-afdhal/", "/berubah/gaby-afdhal/a/toString",
  ]) assert.equal(isAssetPath(value), false, value);
});
