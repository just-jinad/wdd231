import { withEarned } from './badges.js';
import { esc } from './render.js';
import { clearProgress, getHistory, getMissedList, getStats } from './storage.js';
import { initDialog, openDialog } from './modal.js';

const formatDate = (date) => {
  const parsed = new Date(date);
  return Number.isNaN(parsed.getTime()) ? 'Unknown date' : parsed.toLocaleDateString();
};

export function initDashboard() {
  const root = document.querySelector('#dashboard');
  const dialog = document.querySelector('#clear-dialog');
  if (!root || !dialog) return;

  initDialog(dialog);
  const stats = {
    rounds: root.querySelector('#stat-rounds'),
    accuracy: root.querySelector('#stat-accuracy'),
    streak: root.querySelector('#stat-streak'),
    missed: root.querySelector('#stat-missed'),
  };
  const history = root.querySelector('#history-list');
  const badges = root.querySelector('#badge-list');
  const missed = root.querySelector('#missed-list');
  const empty = root.querySelector('#dashboard-empty');
  const clearButton = root.querySelector('[data-action="clear-progress"]');

  function render() {
    const currentStats = getStats();
    stats.rounds.textContent = currentStats.rounds;
    stats.accuracy.textContent = `${currentStats.accuracy}%`;
    stats.streak.textContent = currentStats.bestStreak;
    stats.missed.textContent = currentStats.missedCount;

    const rounds = getHistory();
    history.innerHTML = rounds.length
      ? rounds.map((round) => `
          <li class="history-item">
            <div>
              <strong>${esc(round.mode === 'review' ? 'Review Missed' : round.mode === 'survival' ? 'Survival' : 'Study')}</strong>
              <span>${esc(round.track || 'General')} - ${esc(formatDate(round.date))}</span>
            </div>
            <span>${esc(round.correct)} / ${esc(round.answered)} correct</span>
          </li>`).join('')
      : '<li class="empty-list">No rounds completed yet.</li>';

    badges.innerHTML = withEarned(currentStats).map((badge) => `
      <li class="badge-card ${badge.earned ? 'is-earned' : 'is-locked'}">
        <span class="badge-icon" aria-hidden="true">${badge.earned ? 'Earned' : 'Locked'}</span>
        <div>
          <strong>${esc(badge.label)}</strong>
          <p>${esc(badge.description)}</p>
          <span class="badge-status">${badge.earned ? 'Earned' : 'Locked'}</span>
        </div>
      </li>`).join('');

    const missedQuestions = getMissedList();
    missed.innerHTML = missedQuestions.length
      ? missedQuestions.map((question) => `
          <li class="missed-item">
            <strong>${esc(question.question)}</strong>
            <span>${esc(question.category)} - ${esc(question.difficulty)}</span>
          </li>`).join('')
      : '<li class="empty-list">No saved questions. Missed Survival questions will appear here.</li>';
    empty.hidden = rounds.length > 0 || missedQuestions.length > 0;
  }

  clearButton.addEventListener('click', () => {
    openDialog(dialog, {
      title: 'Clear progress?',
      message: 'This will remove your saved questions, round history, totals and badges. This cannot be undone.',
      trigger: clearButton,
    });
  });

  dialog.addEventListener('click', (event) => {
    if (!event.target.closest('[data-confirm-clear]')) return;
    clearProgress();
    dialog.close();
    render();
  });

  render();
}
