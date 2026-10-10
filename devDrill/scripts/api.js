import { TRACKS } from './tracks.js';
import { getCached, setCached } from './storage.js';

const OTDB_URL = 'https://opentdb.com/api.php';
const LOCAL_URL = 'data/questions.json'; 
const MAX_PER_CALL = 50; 
const TIMEOUT_MS = 8000;
const CACHE_TTL_MS = 10 * 60 * 1000;


export async function loadQuestions(trackKey, { amount = 15, difficulty, timeoutMs = TIMEOUT_MS } = {}) {
  const track = TRACKS[trackKey];
  if (!track) throw new Error(`Unknown track: ${trackKey}`);

  if (track.source === 'api') {
    try {
      const questions = await fetchFromApi(trackKey, track, amount, difficulty, timeoutMs);
      return { questions, source: 'api' };
    } catch (err) {
     
      console.warn(`Open Trivia DB unavailable (${err.message}); using the local question bank.`);
    }
  }

  const localTracks = track.source === 'api' ? track.fallback : [trackKey];
  const questions = await loadLocal(localTracks, amount, difficulty, timeoutMs);
  return { questions, source: 'local' };
}

async function fetchFromApi(trackKey, track, amount, difficulty, timeoutMs) {
  const cacheKey = `q:${trackKey}:${difficulty ?? 'any'}:${amount}`;
  const cached = getCached(cacheKey, CACHE_TTL_MS);
  if (cached) return shuffle(cached);

  const params = new URLSearchParams({
    amount: Math.min(amount, MAX_PER_CALL),
    category: track.category,
    type: 'multiple',
    encode: 'url3986',
  });
  if (difficulty) params.set('difficulty', difficulty);

  const data = await fetchJson(`${OTDB_URL}?${params}`, timeoutMs);
  if (data.response_code !== 0 || !Array.isArray(data.results) || data.results.length === 0) {
    throw new Error(`Open Trivia DB response_code ${data.response_code}`);
  }

  const questions = data.results.map((item) => normalizeApiItem(item, trackKey));
  setCached(cacheKey, questions);
  return shuffle(questions);
}

async function loadLocal(trackKeys, amount, difficulty, timeoutMs) {
  const all = await fetchJson(LOCAL_URL, timeoutMs);
  const pool = all
    .filter((q) => trackKeys.includes(q.track) && (!difficulty || q.difficulty === difficulty))
    .map(normalizeLocalItem);
  if (pool.length === 0) {
    throw new Error(`No local questions for ${trackKeys.join(', ')}${difficulty ? ` (${difficulty})` : ''}`);
  }
  return shuffle(pool).slice(0, amount);
}

async function fetchJson(url, timeoutMs) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: controller.signal });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } finally {
    clearTimeout(timer);
  }
}

// ---- Normalization: both sources end up with the same shape ----------------
const decode = (s) => {
  try {
    return decodeURIComponent(s);
  } catch {
    return s; // malformed encoding: show the raw text rather than crash
  }
};

export function normalizeApiItem(item, trackKey) {
  const question = decode(item.question);
  const correct = decode(item.correct_answer);
  return {
    id: `otdb-${hash(`${question}|${correct}`)}`, 
    track: trackKey,
    category: decode(item.category),
    difficulty: decode(item.difficulty),
    question,
    correct_answer: correct,
    incorrect_answers: item.incorrect_answers.map(decode),
    explanation: '', 
    source: 'api',
  };
}

export function normalizeLocalItem(item) {
  return { explanation: '', ...item, source: 'local' };
}

// FNV-1a 32-bit: small, deterministic, plenty for a few hundred questions.
export function hash(str) {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0).toString(36);
}

// Fisher-Yates on a copy; never mutates the input (the cache stays intact).
export function shuffle(items) {
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}