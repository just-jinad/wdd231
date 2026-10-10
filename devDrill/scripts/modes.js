export const MODES = {
  survival: {
    label: 'Survival',
    source: 'fetch',        
    lives: 3,
    recordMissed: true,     
    clearOnCorrect: false,
  },
  review: {
    label: 'Review Missed',
    source: 'missed',       
    lives: Infinity,        
    recordMissed: false,
    clearOnCorrect: true,   
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
    missed: [],  
    cleared: [],   
    over: false,
  };
}


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
    lives,
    missed: !isCorrect && mode.recordMissed ? [...round.missed, question] : round.missed,
    cleared: isCorrect && mode.clearOnCorrect ? [...round.cleared, question.id] : round.cleared,
    over: lives <= 0 || queue.length === 0,
  };
}