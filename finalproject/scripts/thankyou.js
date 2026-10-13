import { initNav } from "./nav.js";

initNav();

const params = new URLSearchParams(window.location.search);
const details = document.querySelector("#submission-details");
const fields = [
  ["Type", params.get("type") || "Not provided"],
  ["Name", params.get("name") || "Anonymous"],
  ["Message", params.get("message") || "Not provided"],
];

details.innerHTML = fields
  .map(
    ([label, value]) =>
      `<div class="stat"><dt>${escapeHTML(label)}</dt><dd>${escapeHTML(value)}</dd></div>`,
  )
  .join("");

function escapeHTML(value) {
  return String(value).replace(
    /[&<>"']/g,
    (character) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      })[character],
  );
}
