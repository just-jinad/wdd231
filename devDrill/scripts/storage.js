
const PREFIX = 'devdrill:';
const HISTORY_LIMIT = 20;

function area(kind) {
  try {
    return globalThis[kind];
  } catch {
    return undefined;
  }
}

function read(kind, key, fallback) {
  try {
    const raw = area(kind)?.getItem(PREFIX + key);
    return raw == null ? fallback : JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function write(kind, key, value) {
  try {
    area(kind).setItem(PREFIX + key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

// ---- Missed questions (Review Missed mode) --------------------------------

export function getMissed() {
  return read('localStorage', 'missed', {});
}

export function getMissedList() {
  return Object.values(getMissed());
}

export function addMissed(question) {
  const missed = getMissed();
  missed[question.id] = question;
  return write('localStorage', 'missed', missed);
}

export function removeMissed(id) {
  const missed = getMissed();
  delete missed[id];
  return write('localStorage', 'missed', missed);
}

// ---- Rounds, totals, best streak -------------------------------------------
export function getHistory() {
  return read('localStorage', 'history', []);
}


export function addRound(summary) {
  const history = [summary, ...getHistory()].slice(0, HISTORY_LIMIT);
  const totals = read('localStorage', 'totals', { rounds: 0, answered: 0, correct: 0 });
  totals.rounds += 1;
  totals.answered += summary.answered;
  totals.correct += summary.correct;
  const ok = write('localStorage', 'history', history) && write('localStorage', 'totals', totals);
  recordBestStreak(summary.bestStreak);
  return ok;
}

export function getBestStreak() {
  return read('localStorage', 'bestStreak', 0);
}

export function recordBestStreak(streak) {
  if (streak > getBestStreak()) write('localStorage', 'bestStreak', streak);
}

export function getStats() {
  const { rounds, answered, correct } = read('localStorage', 'totals', {
    rounds: 0,
    answered: 0,
    correct: 0,
  });
  return {
    rounds,
    bestStreak: getBestStreak(),
    accuracy: answered ? Math.round((correct / answered) * 100) : 0,
    missedCount: Object.keys(getMissed()).length,
  };
}

export function clearProgress() {
  for (const key of ['missed', 'history', 'totals', 'bestStreak']) {
    try {
      area('localStorage')?.removeItem(PREFIX + key);
    } catch {
      /* nothing to clear if storage is unavailable */
    }
  }
}


export function getCached(key, ttlMs) {
  const entry = read('sessionStorage', `cache:${key}`, null);
  if (!entry || Date.now() - entry.t > ttlMs) return null;
  return entry.v;
}

export function setCached(key, value) {
  return write('sessionStorage', `cache:${key}`, { t: Date.now(), v: value });
}