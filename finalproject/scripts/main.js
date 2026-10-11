// Shared bootstrap: every page loads this, and each feature only runs when its
// element exists on the page.
import { initNav } from './nav.js';
import { renderTrackTiles } from './render.js';

initNav();

const trackGrid = document.querySelector('#track-grid');
if (trackGrid) renderTrackTiles(trackGrid);

// The quiz controller is only fetched on the quiz page.
if (document.querySelector('#stage')) import('./quiz.js').then(({ initQuiz }) => initQuiz());
if (document.querySelector('#dashboard')) import('./dashboard.js').then(({ initDashboard }) => initDashboard());
if (document.querySelector('#submit-form')) import('./submit.js').then(({ initSubmit }) => initSubmit());

const jokeText = document.querySelector('#joke-text');
if (jokeText) showDailyJoke(jokeText);

// The HTML ships with a default joke, so a failed fetch leaves the card intact.
async function showDailyJoke(element) {
  try {
    const response = await fetch('data/jokes.json');
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const jokes = await response.json();
    const dayNumber = Math.floor(Date.now() / 86400000);
    element.textContent = jokes[dayNumber % jokes.length];
  } catch (error) {
    console.warn(`Joke unavailable (${error.message}); keeping the default.`);
  }
}