// Single source of truth for tracks. The home-page tiles, the quiz selector,
// and the data layer all read from here, so adding a track is a one-line change.
// Key order is the display order (matches the home-page wireframe).
export const TRACKS = {
  algorithms: {
    label: 'Algorithms',
    blurb: 'Sorting, searching, graph traversal and Big-O.',
    source: 'local',
  },
  dsa: {
    label: 'DSA',
    blurb: 'Stacks, queues, trees, heaps and hash maps.',
    source: 'local',
  },
  oop: {
    label: 'OOP Concepts',
    blurb: 'Inheritance, polymorphism, SOLID and design patterns.',
    source: 'local',
  },

  // API-backed tracks. `fallback` lists the local tracks used when the API fails,
  // because the local bank has no questions tagged 'general' or 'trivia'.
  general: {
    label: 'General Concepts',
    blurb: 'Broad computer science questions, fresh from the API.',
    source: 'api',
    category: 18, // Science: Computers (confirmed via api_count.php?category=18)
    fallback: ['algorithms', 'dsa', 'oop'],
  },
  trivia: {
    label: 'Trivia',
    blurb: 'General knowledge for a break from the code.',
    source: 'api',
    category: 9, // General Knowledge. UNVERIFIED id: confirm at https://opentdb.com/api_category.php
    fallback: ['fun-facts'],
  },

  'fun-facts': {
    label: 'Fun Facts',
    blurb: 'Computing history, language origins and nerdy trivia.',
    source: 'local',
  },
};