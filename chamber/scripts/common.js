

const navToggle = document.querySelector("#nav-toggle");
const primaryNav = document.querySelector("#primary-nav");
const themeToggle = document.querySelector("#theme-toggle");

navToggle?.addEventListener("click", () => {
  const isOpen = primaryNav.classList.toggle("open");
  navToggle.setAttribute("aria-expanded", String(isOpen));
});

function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  themeToggle?.setAttribute("aria-pressed", String(theme === "dark"));
  localStorage.setItem("theme", theme);
}

themeToggle?.addEventListener("click", () => {
  const current = document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light";
  applyTheme(current === "dark" ? "light" : "dark");
});

function initTheme() {
  const saved = localStorage.getItem("theme");
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  applyTheme(saved || (prefersDark ? "dark" : "light"));
}

function initFooter() {
  const yearEl = document.querySelector("#current-year");
  const modifiedEl = document.querySelector("#last-modified");
  if (yearEl) yearEl.textContent = new Date().getFullYear();
  if (modifiedEl) modifiedEl.textContent = document.lastModified;
}

initTheme();
initFooter();