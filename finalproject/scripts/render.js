import { TRACKS } from "./tracks.js";
export function esc(value) {
  return String(value).replace(
    /[&<>"']/g,
    (char) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        char
      ],
  );
}

// ---- Home page: track tiles --------------------------------------------------
const SOURCE_BADGE = { api: "Live questions", local: "Offline bank" };

export function trackTileHTML([key, track]) {
  return `
    <li class="tile-item">
      <a class="tile" href="quiz.html?track=${encodeURIComponent(key)}">
        <!-- <img src="images/track-${esc(key)}.svg" width="56" height="56" alt="" loading="lazy"> -->
        <h3>${esc(track.label)}</h3>
        <p>${esc(track.blurb)}</p>
        <span class="badge">${esc(SOURCE_BADGE[track.source])}</span>
      </a>
    </li>`;
}

export function renderTrackTiles(container) {
  container.innerHTML = Object.entries(TRACKS).map(trackTileHTML).join("");
}

// ---- Quiz page builders (pure: data in, HTML string out) -----------------------
export function sourceLabelText(source, trackKey) {
  if (source === "saved") return "Questions: your saved missed questions";
  if (source === "api") return "Questions: live from Open Trivia DB";
  return TRACKS[trackKey]?.source === "api"
    ? "Questions: offline question bank (Open Trivia DB couldn't be reached)"
    : "Questions: built-in offline question bank";
}

export function heartsText(lives, max) {
  const left = Math.max(0, Math.min(lives, max));
  return "\u2665".repeat(left) + "\u2661".repeat(max - left);
}

const metaHTML = (q) => `
  <div class="card-meta">
    <span class="badge">${esc(q.difficulty)}</span>
    <span class="meta-category">${esc(q.category)}</span>
  </div>`;

// cards: [{ question, choices }] where choices is the shuffled answer list
export function studyHTML(cards, trackLabel) {
  const items = cards
    .map(
      ({ question: q, choices }, i) => `
    <li class="card study-card">
      ${metaHTML(q)}
      <p class="study-question">${esc(q.question)}</p>
      <ul class="choice-list">
        ${choices.map((choice) => `<li>${esc(choice)}</li>`).join("")}
      </ul>
      <button type="button" class="button button-secondary" data-action="reveal" data-id="${esc(q.id)}">
        Reveal answer<span class="visually-hidden"> for card ${i + 1}</span>
      </button>
    </li>`,
    )
    .join("");
  return `
    <h2>Study cards</h2>
    <p class="section-intro">${cards.length} cards from ${esc(trackLabel)}. Think of the answer first, then reveal it.</p>
    <ul class="card-grid study-grid">${items}</ul>`;
}

export function questionCardHTML(q, options) {
  const buttons = options
    .map(
      (option, i) => `
      <button type="button" class="option" data-action="option" data-index="${i}">${esc(option)}</button>`,
    )
    .join("");
  return `
    <article class="question-card" aria-labelledby="question-text">
      ${metaHTML(q)}
      <h2 id="question-text" class="question-text" tabindex="-1">${esc(q.question)}</h2>
      <div class="options" role="group" aria-label="Answer options">${buttons}
      </div>
      <div id="feedback" class="feedback" role="status"></div>
    </article>`;
}

export function feedbackHTML({ correct, answer, over }) {
  return `
    <p class="feedback-message ${correct ? "is-correct" : "is-wrong"}">
      <strong>${correct ? "\u2713 Correct!" : "\u2717 Not quite."}</strong>${correct ? "" : ` The answer is ${esc(answer)}.`}
    </p>
    <div class="feedback-actions">
      <button type="button" class="button button-secondary" data-action="explain">Explain</button>
      <button type="button" class="button" data-action="next">${over ? "See results" : "Next question"}</button>
    </div>`;
}

export function summaryHTML({ title, message, stats, missedCount, mode }) {
  const statItems = stats
    .map(
      (s) => `
      <div class="stat"><dt>${esc(s.label)}</dt><dd>${esc(s.value)}</dd></div>`,
    )
    .join("");
  const reviewLink =
    missedCount > 0 && mode !== "review"
      ? `<a class="button button-secondary" href="quiz.html?mode=review">Review missed (${missedCount})</a>`
      : "";
  return `
    <section class="summary" aria-labelledby="summary-title">
      <h2 id="summary-title" tabindex="-1">${esc(title)}</h2>
      <p>${esc(message)}</p>
      <dl class="summary-stats">${statItems}
      </dl>
      <div class="feedback-actions">
        <button type="button" class="button" data-action="restart">Play again</button>
        ${reviewLink}
        <a class="button button-secondary" href="dashboard.html">View dashboard</a>
      </div>
    </section>`;
}

export function emptyReviewHTML() {
  return `
    <section class="summary">
      <h2>Nothing to review yet</h2>
      <p>Questions you miss in Survival mode are saved here so you can replay them.</p>
      <a class="button" href="quiz.html?mode=survival">Start Survival</a>
    </section>`;
}

export function errorHTML(message) {
  return `
    <section class="summary" role="alert">
      <h2>Couldn't load questions</h2>
      <p>${esc(message)}</p>
      <button type="button" class="button" data-action="retry">Try again</button>
    </section>`;
}
