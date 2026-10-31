import assert from "node:assert/strict";
import { test } from "node:test";
import { assetContentType, isAssetPath } from "./asset-path.ts";

test("media URLs stay within an invitation namespace and reject traversal/executable files", () => {
  assert(isAssetPath("/berubah/demo-gaby-afdhal/figma-1-2/gallery/01.jpg"));
  assert(isAssetPath("/berubah/wedding-2026/music.mp3"));
  assert.equal(assetContentType("wedding-2026", ["cover.PNG"]), "image/png");
  for (const value of [
    "/berubah/demo-gaby-afdhal/../secret.png", "/berubah/demo-gaby-afdhal/%2e%2e/a.jpg",
    "/berubah/demo-gaby-afdhal/a%2fb.jpg", "/berubah/demo-gaby-afdhal/a\\b.jpg",
    "/berubah/demo-gaby-afdhal/.env.local", "/berubah/demo-gaby-afdhal/app.sqlite",
    "/berubah/demo-gaby-afdhal/a.svg", "/berubah/demo-gaby-afdhal/index.html",
    "/berubah/demo-gaby-afdhal/a.jpg?url=https://evil.test", "/berubah/demo-gaby-afdhal/a.jpg#x",
    "//evil.test/cover.jpg", "https://evil.test/cover.jpg", "/berubah/login/cover.jpg",
    "/berubah/demo-gaby-afdhal/", "/berubah/demo-gaby-afdhal/a/toString",
  ]) assert.equal(isAssetPath(value), false, value);
});
