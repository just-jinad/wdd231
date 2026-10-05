import { places } from "../data/places.mjs";

const MS_PER_DAY = 1000 * 60 * 60 * 24;
const VISIT_KEY = "ogbomoso-cc-last-visit";

/* ---------- Cards ---------- */

function buildCard(place, index) {
  const card = document.createElement("article");
  card.className = "discover-card";

  const title = document.createElement("h2");
  title.textContent = place.name;

  const figure = document.createElement("figure");
  const img = document.createElement("img");
  img.src = place.image;
  img.alt = place.alt;
  img.width = 300;
  img.height = 200;
  // First card stays eager so it isn't penalised as a lazy LCP candidate.
  img.loading = index === 0 ? "eager" : "lazy";
  img.decoding = "async";
  figure.append(img);

  const address = document.createElement("address");
  address.textContent = place.address;

  const description = document.createElement("p");
  description.textContent = place.description;

  const button = document.createElement("button");
  button.type = "button";
  button.className = "card-button";
  button.textContent = "Learn more";
  button.setAttribute("aria-label", `Learn more about ${place.name} (opens map in a new tab)`);
  button.addEventListener("click", () => {
    const query = encodeURIComponent(`${place.name}, Ogbomoso, Oyo State, Nigeria`);
    window.open(
      `https://www.google.com/maps/search/?api=1&query=${query}`,
      "_blank",
      "noopener,noreferrer"
    );
  });

  card.append(title, figure, address, description, button);
  return card;
}

function renderCards() {
  const grid = document.querySelector("#discover-grid");
  if (!grid) return;
  grid.replaceChildren(...places.map(buildCard));
}

/* ---------- Last visit message ---------- */

function getVisitMessage(lastVisit, now) {
  if (!Number.isFinite(lastVisit)) {
    return "Welcome! Let us know if you have any questions.";
  }

  const days = Math.floor((now - lastVisit) / MS_PER_DAY);

  if (days < 1) return "Back so soon! Awesome!";
  return `You last visited ${days} ${days === 1 ? "day" : "days"} ago.`;
}

function showVisitMessage() {
  const banner = document.querySelector("#visit-message");
  const text = document.querySelector("#visit-text");
  const close = document.querySelector("#visit-close");
  if (!banner || !text || !close) return;

  const now = Date.now();
  let lastVisit = NaN;

  // localStorage can throw (privacy modes, blocked storage). Never let it break the page.
  try {
    const stored = localStorage.getItem(VISIT_KEY);
    lastVisit = stored === null ? NaN : Number(stored);
  } catch {
    /* treat as first visit */
  }

  text.textContent = getVisitMessage(lastVisit, now);
  banner.hidden = false;
  close.addEventListener("click", () => {
    banner.hidden = true;
  });

  try {
    localStorage.setItem(VISIT_KEY, String(now));
  } catch {
    /* storage unavailable: message still works, it just can't persist */
  }
}

renderCards();
showVisitMessage();