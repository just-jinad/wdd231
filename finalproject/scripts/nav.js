// Hamburger toggle for small screens. The CSS owns layout; this only flips state.
export function initNav() {
  const toggle = document.querySelector(".nav-toggle");
  const nav = document.querySelector("#primary-nav");
  if (!toggle || !nav) return;

  const isOpen = () => toggle.getAttribute("aria-expanded") === "true";
  const setOpen = (open) => {
    toggle.setAttribute("aria-expanded", String(open));
    nav.classList.toggle("is-open", open);
  };

  toggle.addEventListener("click", () => setOpen(!isOpen()));

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && isOpen()) {
      setOpen(false);
      toggle.focus(); // return focus to where the user opened the menu
    }
  });

  // Leaving the small-screen layout resets the menu so it can't get stuck open.
  const desktop = window.matchMedia?.("(min-width: 48rem)");
  desktop?.addEventListener?.("change", (event) => {
    if (event.matches) setOpen(false);
  });
}
