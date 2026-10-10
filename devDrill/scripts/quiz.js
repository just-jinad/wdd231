import { loadQuestions, shuffle } from './api.js';
import { MODES, startRound, submitAnswer } from './modes.js';
import { TRACKS } from './tracks.js';
import { addMissed, removeMissed, getMissedList, getBestStreak, addRound } from './storage.js';
import {
  esc, sourceLabelText, heartsText, studyHTML, questionCardHTML,
  feedbackHTML, summaryHTML, emptyReviewHTML, errorHTML,
} from './render.js';
import { initDialog, openAnswerDialog } from './modal.js';

const DECK_SIZE = 50; 
const STUDY_COUNT = 20;
const MODE_KEYS = ['study', 'survival', 'review'];
const MAX_LIVES = MODES.survival.lives;

const has = (obj, key) => Object.prototype.hasOwnProperty.call(obj, key);

function readParams() {
  const search = new URLSearchParams(window.location.search);
  const mode = search.get('mode');
  const track = search.get('track');
  return {
    mode: MODE_KEYS.includes(mode) ? mode : 'study',
    track: track && has(TRACKS, track) ? track : 'general',
  };
}

export function initQuiz() {
  const $ = (selector) => document.querySelector(selector);
  const els = {
    form: $('#controls'), track: $('#track'), source: $('#source-label'),
    layout: $('.quiz-layout'), stage: $('#stage'), status: $('#status-panel'),
    lives: $('#lives'), livesStat: $('#lives-stat'), streak: $('#streak'),
    best: $('#best-streak'), counter: $('#question-counter'),
    bar: $('#progress'), fill: $('#progress-fill'), dialog: $('#answer-dialog'),
  };
  if (!els.stage || !els.form) return;

  els.track.innerHTML = Object.entries(TRACKS)
    .map(([key, track]) => `<option value="${esc(key)}">${esc(track.label)}</option>`)
    .join('');
  initDialog(els.dialog);

  let params = readParams();
  let loadToken = 0;
  let round = null;
  let deckSize = 0;
  let current = null;
  let options = [];
  let answered = false;
  let roundSaved = false;
  let studyCards = [];

  // ---- controls -------------------------------------------------------------
  const selectedMode = () => els.form.querySelector('input[name="mode"]:checked').value;
  const syncTrackState = () => { els.track.disabled = selectedMode() === 'review'; };

  els.form.querySelector(`input[name="mode"][value="${params.mode}"]`).checked = true;
  els.track.value = params.track;
  syncTrackState();
  els.form.addEventListener('change', syncTrackState);

  els.form.addEventListener('submit', (event) => {
    event.preventDefault();
    const mode = selectedMode();
    params = { mode, track: mode === 'review' ? params.track : els.track.value };
    window.history.replaceState(null, '', `?${new URLSearchParams(params)}`);
    start();
  });

  // ---- round lifecycle ------------------------------------------------------
  function saveRound() {
    if (!round || roundSaved || round.answered === 0) return;
    roundSaved = true;
    addRound({
      date: new Date().toISOString(),
      mode: round.modeKey,
      track: round.modeKey === 'review' ? 'saved' : params.track,
      answered: round.answered,
      correct: round.correct,
      bestStreak: round.bestStreak,
    });
  }

  async function start() {
    const token = ++loadToken;
    saveRound(); // a round abandoned mid-way still counts
    round = null;
    roundSaved = false;
    showStatus(false);
    els.source.textContent = 'Loading questions\u2026';
    els.stage.innerHTML = '<p class="loading" role="status">Loading questions\u2026</p>';

    try {
      if (params.mode === 'review') {
        startReview();
        return;
      }
      const { questions, source } = await loadQuestions(params.track, { amount: DECK_SIZE });
      if (token !== loadToken) return; // a newer Start superseded this one
      els.source.textContent = sourceLabelText(source, params.track);
      if (params.mode === 'study') showStudy(questions);
      else beginRound('survival', questions);
    } catch (error) {
      if (token !== loadToken) return;
      els.source.textContent = 'Questions: unavailable';
      els.stage.innerHTML = errorHTML(error.message);
    }
  }

  function startReview() {
    els.source.textContent = sourceLabelText('saved', params.track);
    const saved = getMissedList();
    if (saved.length === 0) {
      els.stage.innerHTML = emptyReviewHTML();
      return;
    }
    beginRound('review', shuffle(saved));
  }

  function showStudy(questions) {
    studyCards = questions.slice(0, STUDY_COUNT).map((question) => ({
      question,
      choices: shuffle([question.correct_answer, ...question.incorrect_answers]),
    }));
    els.stage.innerHTML = studyHTML(studyCards, TRACKS[params.track].label);
  }

  function beginRound(modeKey, questions) {
    round = startRound(modeKey, questions);
    deckSize = round.queue.length;
    showStatus(true);
    nextQuestion(false);
  }

  function nextQuestion(moveFocus) {
    if (round.over) {
      showSummary();
      return;
    }
    current = round.queue[0];
    options = shuffle([current.correct_answer, ...current.incorrect_answers]);
    answered = false;
    els.stage.innerHTML = questionCardHTML(current, options);
    updateStatus();
    if (moveFocus) els.stage.querySelector('#question-text').focus();
  }

  function onOption(index) {
    if (answered) return;
    answered = true;
    const correct = options[index] === current.correct_answer;
    round = submitAnswer(round, current, correct);

    // Persist immediately: closing the tab mid-round must not lose a miss.
    if (!correct && MODES[round.modeKey].recordMissed) addMissed(current);
    if (correct && MODES[round.modeKey].clearOnCorrect) removeMissed(current.id);

    markOptions(index, correct);
    const feedback = els.stage.querySelector('#feedback');
    feedback.innerHTML = feedbackHTML({ correct, answer: current.correct_answer, over: round.over });
    updateStatus();
    if (round.over) saveRound();
    feedback.querySelector('[data-action="next"]').focus();
  }

  function markOptions(chosenIndex, correct) {
    els.stage.querySelectorAll('.option').forEach((button, i) => {
      // aria-disabled (not disabled) keeps the buttons readable and focusable.
      button.setAttribute('aria-disabled', 'true');
      if (options[i] === current.correct_answer) {
        button.classList.add('is-correct');
        button.insertAdjacentHTML('beforeend', '<span class="option-mark">\u2713 Correct answer</span>');
      } else if (i === chosenIndex && !correct) {
        button.classList.add('is-wrong');
        button.insertAdjacentHTML('beforeend', '<span class="option-mark">\u2717 Your answer</span>');
      }
    });
  }

  function showSummary() {
    const missedTotal = getMissedList().length;
    const isReview = round.modeKey === 'review';
    const cleared = round.queue.length === 0 && round.lives > 0;
    let title;
    let message;
    if (isReview) {
      title = 'Review complete';
      message = missedTotal === 0
        ? 'You cleared every saved question. Nice work.'
        : `${missedTotal} ${missedTotal === 1 ? 'question is' : 'questions are'} still saved for another go.`;
    } else if (cleared) {
      title = 'Deck cleared!';
      message = 'You made it through every question without running out of lives.';
    } else {
      title = 'Round over';
      message = `You ran out of lives after ${round.answered} ${round.answered === 1 ? 'answer' : 'answers'}.`;
    }
    els.stage.innerHTML = summaryHTML({
      title,
      message,
      mode: round.modeKey,
      missedCount: missedTotal,
      stats: [
        { label: 'Answered', value: round.answered },
        { label: 'Correct', value: round.correct },
        { label: 'Best streak', value: round.bestStreak },
        { label: 'Saved to review', value: missedTotal },
      ],
    });
    els.stage.querySelector('#summary-title').focus();
  }

  // ---- status panel -----------------------------------------------------------
  function showStatus(visible) {
    els.status.hidden = !visible;
    els.layout.classList.toggle('has-status', visible);
  }

  function updateStatus() {
    const survival = round.modeKey === 'survival';
    els.livesStat.hidden = !survival;
    if (survival) {
      els.lives.textContent = heartsText(round.lives, MAX_LIVES);
      els.lives.setAttribute('aria-label', `${Math.max(0, round.lives)} of ${MAX_LIVES} lives left`);
    }
    els.streak.textContent = round.streak;
    els.best.textContent = Math.max(getBestStreak(), round.bestStreak);
    els.counter.textContent = round.over
      ? `Answered ${round.answered} of ${deckSize}`
      : `Question ${round.answered + 1} of ${deckSize}`;
    els.fill.style.setProperty('--progress', `${Math.round((round.answered / deckSize) * 100)}%`);
    els.bar.setAttribute('aria-valuemax', String(deckSize));
    els.bar.setAttribute('aria-valuenow', String(round.answered));
  }

  // ---- events (delegated, so re-rendering the stage never loses handlers) -----------
  els.stage.addEventListener('click', (event) => {
    const button = event.target.closest('[data-action]');
    if (!button) return;
    switch (button.dataset.action) {
      case 'option': onOption(Number(button.dataset.index)); break;
      case 'explain': openAnswerDialog(els.dialog, current, button); break;
      case 'next': nextQuestion(true); break;
      case 'restart':
      case 'retry': start(); break;
      case 'reveal': {
        const card = studyCards.find(({ question }) => question.id === button.dataset.id);
        if (card) openAnswerDialog(els.dialog, card.question, button);
        break;
      }
      default: break;
    }
  });

  window.addEventListener('pagehide', saveRound);
  start();
}