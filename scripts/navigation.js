//navigation.js — responsive hamburger menu
// Runs after `defer` guarantees the DOM exists, so no DOMContentLoaded wrapper needed.

const navToggle = document.getElementById('nav-toggle');
const primaryNav = document.getElementById('primary-nav');

navToggle.addEventListener('click', () => {
  const isOpen = primaryNav.classList.toggle('open');
  // Keep the accessibility tree in sync with the visual state —
  // screen readers get nothing from a CSS class alone.
  navToggle.setAttribute('aria-expanded', isOpen);
});