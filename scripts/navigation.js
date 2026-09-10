const navToggle = document.getElementById('nav-toggle');
const primaryNav = document.getElementById('primary-nav');
const hamburgerIcon = navToggle.querySelector('.hamburger-icon');

navToggle.addEventListener('click', () => {
  const isOpen = primaryNav.classList.toggle('open');
  navToggle.setAttribute('aria-expanded', isOpen);
  navToggle.setAttribute('aria-label', isOpen ? 'Close navigation menu' : 'Toggle navigation menu');
  hamburgerIcon.textContent = isOpen ? '\u2715' : '\u2630'; // ✕ / ☰
});