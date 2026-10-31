const prototype = document.querySelector(".prototype");
const cover = document.querySelector(".cover");
const details = document.querySelector(".details");
const rsvpForm = document.querySelector(".rsvp-form");
const toast = document.querySelector(".toast");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

function openInvitation() {
  if (prototype.classList.contains("is-opened")) return;
  prototype.classList.add("is-opened");
  details.setAttribute("aria-hidden", "false");
  const dismissCover = () => { cover.hidden = true; };
  if (reducedMotion.matches) return dismissCover();
  const exitAnimation = cover.animate(
    [{ transform: "translateY(0)" }, { transform: "translateY(-100%)" }],
    { duration: 1500, easing: "linear", fill: "forwards" },
  );
  exitAnimation.onfinish = dismissCover;
}
document.querySelector(".open-button").addEventListener("click", openInvitation);
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
