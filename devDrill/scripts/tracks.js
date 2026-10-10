
export const TRACKS = {
  algorithms: { label: 'Algorithms', source: 'local' },
  dsa: { label: 'DSA', source: 'local' },
  oop: { label: 'OOP Concepts', source: 'local' },
  'fun-facts': { label: 'Fun Facts', source: 'local' },


  general: {
    label: 'General Concepts',
    source: 'api',
    category: 18, 
    fallback: ['algorithms', 'dsa', 'oop'],
  },
  trivia: {
    label: 'Trivia',
    source: 'api',
    category: 9,
    fallback: ['fun-facts'],
  },
};