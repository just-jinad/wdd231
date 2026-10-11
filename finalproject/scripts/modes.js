// Modes are data, not code branches: one engine, one config object per mode.
export const MODES = {
  survival: {
    label: "Survival",
    source: "fetch", // API (or local JSON fallback)
    lives: 3,
    recordMissed: true, // wrong answers feed the Review Missed list
    clearOnCorrect: false,
  },
  review: {
    label: "Review Missed",
    source: "missed", // stored question objects, no network
    lives: Infinity, // goal is clearing the list, not surviving
    recordMissed: false,
    clearOnCorrect: true, // a correct answer removes it from the list
  },
};

export function startRound(modeKey, questions) {
  const mode = MODES[modeKey];
  if (!mode) throw new Error(`Unknown mode: ${modeKey}`);
  return {
    modeKey,
    queue: [...questions],
    lives: mode.lives,
    streak: 0,
    bestStreak: 0,
    answered: 0,
    correct: 0,
    missed: [], // question objects answered wrong this round
    cleared: [], // ids answered right (used by Review Missed)
    over: false,
  };
}

// Pure: returns a new round state, never mutates the old one.
export function submitAnswer(round, question, isCorrect) {
  const mode = MODES[round.modeKey];
  const queue = round.queue.filter((q) => q.id !== question.id);

  const streak = isCorrect ? round.streak + 1 : 0;
  const lives = isCorrect ? round.lives : round.lives - 1;

  return {
    ...round,
    queue,
    streak,
    bestStreak: Math.max(round.bestStreak, streak),
    answered: round.answered + 1,
    correct: round.correct + (isCorrect ? 1 : 0),
    lives,
    missed:
      !isCorrect && mode.recordMissed
        ? [...round.missed, question]
        : round.missed,
    cleared:
      isCorrect && mode.clearOnCorrect
        ? [...round.cleared, question.id]
        : round.cleared,
    // Round ends on zero lives, or when the deck runs out (a win state).
    over: lives <= 0 || queue.length === 0,
  };
}
