const prototype = document.querySelector(".prototype");
const details = document.querySelector(".details");
const rsvpForm = document.querySelector(".rsvp-form");
const toast = document.querySelector(".toast");

function openInvitation() {
  prototype.classList.add("is-opened");
  details.setAttribute("aria-hidden", "false");
  window.scrollTo(0, 0);
  layoutPages();
}
document.querySelector(".open-button").addEventListener("click", openInvitation);

// Page transitions: a page sticks once its bottom reaches the viewport bottom (or its top reaches the viewport
// top, if it is shorter than the viewport). The next page then slides in over it, and the covered page fades
// and shrinks slightly. Progress comes from scroll position, so the effect follows the finger in both directions.
const pages = [...details.querySelectorAll(".page")];
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
let pageFrame = 0;

function layoutPages() {
  const stacked = !reducedMotion.matches;
  details.classList.toggle("is-stacked", stacked);
  const viewport = window.innerHeight;
  for (const page of pages) {
    page.flowTop = parseFloat(page.style.getPropertyValue("--y"));
    const height = page.offsetHeight;
    page.stickTop = Math.min(0, viewport - height);
    page.visibleHeight = Math.min(height, viewport);
    page.style.top = stacked ? `${page.stickTop}px` : "";
    // Shrink around the middle of what is on screen, not the middle of the whole (possibly tall) page.
    page.style.transformOrigin = `50% ${page.visibleHeight / 2 - page.stickTop}px`;
  }
  updatePages();
}

function updatePages() {
  pageFrame = 0;
  const stacked = details.classList.contains("is-stacked");
  const detailsTop = details.getBoundingClientRect().top;
  pages.forEach((page, i) => {
    const next = pages[i + 1];
    // Layout position of the next page (its flow position, clamped by sticky), ignoring our own transforms.
    const nextTop = next && Math.max(detailsTop + next.flowTop, next.stickTop);
    const cover = stacked && next ? Math.min(1, Math.max(0, 1 - nextTop / page.visibleHeight)) : 0;
    page.style.opacity = cover ? String(1 - cover) : "";
    page.style.transform = cover ? `scale(${1 - 0.08 * cover})` : "";
    page.style.visibility = cover >= 1 ? "hidden" : "";
    if (next) next.style.boxShadow = cover > 0 && cover < 1 ? `0 -18px 36px rgb(0 0 0 / ${0.4 * Math.sin(Math.PI * cover)})` : "";
  });
}

window.addEventListener("scroll", () => { pageFrame ||= requestAnimationFrame(updatePages); }, { passive: true });
window.addEventListener("resize", layoutPages);
reducedMotion.addEventListener("change", layoutPages);
if (new URLSearchParams(window.location.search).has("open")) openInvitation();

let toastTimer;
function showToast(message) {
  toast.textContent = message;
  toast.classList.add("is-visible");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("is-visible"), 2600);
}

// Hero shows "Minggu, 29 November 2026"; count down to the resepsi start (10.00 WIB).
const target = new Date("2026-11-29T10:00:00+07:00").getTime();
function updateCountdown() {
  const diff = Math.max(0, target - Date.now());
  const values = {
    days: Math.floor(diff / 86400000),
    hours: Math.floor(diff / 3600000) % 24,
    minutes: Math.floor(diff / 60000) % 60,
    seconds: Math.floor(diff / 1000) % 60,
  };
  document.querySelectorAll("[data-countdown]").forEach((node) => {
    node.textContent = values[node.dataset.countdown];
  });
}
updateCountdown();
setInterval(updateCountdown, 1000);

// Prototype only: the newest wish replaces the first card instead of growing the fixed-height artboard.
rsvpForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const data = new FormData(rsvpForm);
  const name = data.get("name").trim();
  const wish = data.get("wish").trim();
  if (wish) {
    const cards = [...document.querySelectorAll(".wish-card")];
    for (let i = cards.length - 1; i > 0; i--) cards[i].innerHTML = cards[i - 1].innerHTML;
    cards[0].querySelector("strong").textContent = name;
    cards[0].querySelector("p").textContent = wish;
  }
  showToast(`Terima kasih, ${name}. Konfirmasi "${data.get("attendance")}" sudah dicatat.`);
  rsvpForm.reset();
});

document.querySelector(".copy-account").addEventListener("click", async (event) => {
  const account = event.currentTarget.dataset.account;
  try {
    await navigator.clipboard.writeText(account);
    showToast("Nomor rekening berhasil disalin.");
  } catch {
    showToast(`Nomor rekening: ${account}`);
  }
});
