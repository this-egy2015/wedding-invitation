// Run against a local app with a published invitation containing at least two gallery photos.
// Usage: node scripts/smoke-gallery.mjs http://localhost:3000/gaby-afdhal
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

const url = process.argv[2] ?? "http://localhost:3000/gaby-afdhal";
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const profile = await mkdtemp(join(tmpdir(), "gallery-smoke-"));
const chrome = spawn(process.env.CHROME_BIN ?? "google-chrome", ["--headless=new", "--no-sandbox", "--disable-dev-shm-usage", "--remote-debugging-port=0", `--user-data-dir=${profile}`, "about:blank"], { stdio: "ignore" });
let socket;
try {
  let port;
  for (let i = 0; i < 100; i++) {
    try { port = (await readFile(join(profile, "DevToolsActivePort"), "utf8")).split("\n")[0]; break; }
    catch { await sleep(100); }
  }
  assert(port, "Chrome must be installed and running");
  const tabs = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
  const tab = tabs.find((item) => item.type === "page" && item.url === "about:blank");
  socket = new WebSocket(tab.webSocketDebuggerUrl);
  await new Promise((resolve) => socket.addEventListener("open", resolve, { once: true }));
  let id = 0;
  const pending = new Map();
  const errors = [];
  socket.addEventListener("message", ({ data }) => {
    const message = JSON.parse(data);
    if (message.id) {
      const request = pending.get(message.id);
      pending.delete(message.id);
      if (message.error) request.reject(new Error(message.error.message));
      else request.resolve(message.result);
    }
    if (message.method === "Runtime.exceptionThrown") errors.push(message.params.exceptionDetails.text);
    if (message.method === "Runtime.consoleAPICalled" && message.params.type === "error") errors.push(message.params.args.map((arg) => arg.value ?? arg.description).join(" "));
  });
  const send = (method, params = {}) => new Promise((resolve, reject) => {
    const requestId = ++id;
    pending.set(requestId, { resolve, reject });
    socket.send(JSON.stringify({ id: requestId, method, params }));
  });
  const evaluate = async (expression) => {
    const result = await send("Runtime.evaluate", { expression, returnByValue: true, awaitPromise: true });
    assert(!result.exceptionDetails, result.exceptionDetails?.text);
    return result.result.value;
  };
  const waitFor = async (expression) => {
    for (let i = 0; i < 150; i++) { if (await evaluate(expression)) return; await sleep(100); }
    assert.fail(`Timed out: ${expression}`);
  };
  await send("Runtime.enable");
  await send("Page.enable");
  await send("Emulation.setDeviceMetricsOverride", { width: 390, height: 844, deviceScaleFactor: 1, mobile: true });
  await send("Page.navigate", { url });
  await waitFor("!!document.querySelector('[data-cover] button') && document.readyState === 'complete'");
  await sleep(700);
  await evaluate("document.querySelector('[data-cover] button').click()");
  await waitFor("!document.querySelector('[data-cover]')");
  await evaluate("window.gallery = document.querySelector('[data-section=gallery] [role=region]'); gallery.scrollIntoView()");
  assert.equal(await evaluate("document.querySelector('[data-section=gallery] button')"), null, "Prototype has no gallery controls");
  assert.equal(await evaluate("getComputedStyle(gallery).scrollbarWidth"), "none", "No visible scrollbar");
  assert.equal(await evaluate("getComputedStyle(gallery, '::-webkit-scrollbar').display"), "none", "Scrollbar hidden in WebKit/Blink too");
  await sleep(200);
  const start = await evaluate("gallery.scrollLeft");
  await sleep(800);
  assert((await evaluate("gallery.scrollLeft")) > start + 15, "Autoplay moves continuously");

  await send("Input.dispatchKeyEvent", { type: "keyDown", key: "Tab", code: "Tab", windowsVirtualKeyCode: 9 });
  await send("Input.dispatchKeyEvent", { type: "keyUp", key: "Tab", code: "Tab", windowsVirtualKeyCode: 9 });
  await evaluate("gallery.focus({preventScroll:true}); gallery.scrollIntoView()"); await sleep(100);
  const focused = await evaluate("gallery.scrollLeft");
  await sleep(400);
  assert((await evaluate("gallery.scrollLeft")) > focused + 10, "Focus alone does not stop autoplay");
  const point = await evaluate("({x:gallery.getBoundingClientRect().left+220,y:gallery.getBoundingClientRect().top+100})");
  await send("Input.dispatchMouseEvent", { type: "mouseMoved", ...point });
  const hovered = await evaluate("gallery.scrollLeft");
  await sleep(350);
  assert((await evaluate("gallery.scrollLeft")) > hovered + 10, "Hover does not stop autoplay");
  await send("Input.dispatchMouseEvent", { type: "mousePressed", ...point, button: "left", buttons: 1, clickCount: 1 });
  await sleep(100);
  const heldMouse = await evaluate("gallery.scrollLeft");
  await sleep(300);
  assert.equal(await evaluate("gallery.scrollLeft"), heldMouse, "Holding the mouse stops autoplay");
  await send("Input.dispatchMouseEvent", { type: "mouseMoved", x: point.x - 90, y: point.y, button: "left", buttons: 1 });
  await sleep(100);
  assert((await evaluate("gallery.scrollLeft")) > heldMouse + 80, "Mouse drag scrolls manually");
  await evaluate("gallery.scrollLeft = gallery.children[gallery.children.length / 2].offsetLeft - gallery.children[0].offsetLeft - 4");
  await sleep(100);
  await send("Input.dispatchMouseEvent", { type: "mouseReleased", x: point.x - 90, y: point.y, button: "left", buttons: 0, clickCount: 1 });
  await sleep(500);
  assert((await evaluate("gallery.scrollLeft")) < 40, "Release immediately resumes and wraps the strip");

  const beforeWheel = await evaluate("gallery.scrollLeft");
  await send("Input.dispatchMouseEvent", { type: "mouseWheel", ...point, deltaX: 120, deltaY: 0 });
  await sleep(300);
  assert((await evaluate("gallery.scrollLeft")) > beforeWheel + 50, "Native wheel scroll is preserved during autoplay");
  const resumed = await evaluate("gallery.scrollLeft");
  await sleep(300);
  assert((await evaluate("gallery.scrollLeft")) > resumed + 10, "Wheel does not add an autoplay delay");

  await send("Emulation.setTouchEmulationEnabled", { enabled: true });
  await send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x: 260, y: point.y }] });
  await sleep(100);
  const held = await evaluate("gallery.scrollLeft");
  await sleep(250);
  assert.equal(await evaluate("gallery.scrollLeft"), held, "Holding a finger pauses autoplay");
  for (const x of [230, 200, 170, 140]) {
    await send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ x, y: point.y }] });
    await sleep(50);
  }
  await sleep(150);
  const heldAfterSwipe = await evaluate("gallery.scrollLeft");
  assert(heldAfterSwipe > held + 50, "Native touch swipe scrolls the gallery");
  await sleep(350);
  assert.equal(await evaluate("gallery.scrollLeft"), heldAfterSwipe, "Still holding after a native swipe keeps autoplay stopped");
  await send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
  await sleep(300);
  assert((await evaluate("gallery.scrollLeft")) > heldAfterSwipe + 10, "Finger release resumes immediately without cooldown");

  await send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-motion", value: "reduce" }] });
  await sleep(200);
  const reduced = await evaluate("gallery.scrollLeft");
  await sleep(400);
  assert.equal(await evaluate("gallery.scrollLeft"), reduced, "Reduced motion disables autoplay");
  assert.equal(await evaluate("document.documentElement.scrollWidth"), 390, "No page overflow");
  assert.deepEqual(errors, [], "No JavaScript/hydration errors");
  console.log("PASS: no extra UI, continuous autoplay on hover/focus/wheel, mouse hold+drag, native swipe+hold, immediate release resume, loop, reduced motion, no overflow");
} finally {
  socket?.close();
  chrome.kill();
  await sleep(200);
  await rm(profile, { recursive: true, force: true });
}
