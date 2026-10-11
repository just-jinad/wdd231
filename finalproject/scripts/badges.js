export const BADGES = [
  { id: 'first-round', label: 'First drill', description: 'Finish your first round.', earned: (stats) => stats.rounds >= 1 },
  { id: 'streak-5', label: 'Five in a row', description: 'Reach a streak of 5.', earned: (stats) => stats.bestStreak >= 5 },
  { id: 'streak-10', label: 'Ten in a row', description: 'Reach a streak of 10.', earned: (stats) => stats.bestStreak >= 10 },
];

export function withEarned(stats) {
  return BADGES.map(({ earned, ...badge }) => ({ ...badge, earned: earned(stats) }));
}