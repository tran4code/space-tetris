// Local-only arcade leaderboard. Top 10 by score, persisted to localStorage.

export interface LeaderboardEntry {
  name: string;
  score: number;
  lines: number;
  date: string; // ISO timestamp
}

const STORAGE_KEY = 'artemis-tetris-leaderboard';
export const MAX_ENTRIES = 10;
export const MAX_NAME_LEN = 8;

function isEntry(v: unknown): v is LeaderboardEntry {
  if (!v || typeof v !== 'object') return false;
  const e = v as Record<string, unknown>;
  return (
    typeof e.name === 'string' &&
    typeof e.score === 'number' &&
    typeof e.lines === 'number' &&
    typeof e.date === 'string'
  );
}

export function loadLeaderboard(): LeaderboardEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter(isEntry)
      .sort((a, b) => b.score - a.score)
      .slice(0, MAX_ENTRIES);
  } catch {
    return [];
  }
}

export function saveLeaderboard(entries: LeaderboardEntry[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries.slice(0, MAX_ENTRIES)));
  } catch {
    // ignore
  }
}

export function qualifiesForLeaderboard(score: number): boolean {
  if (score <= 0) return false;
  const board = loadLeaderboard();
  if (board.length < MAX_ENTRIES) return true;
  return score > board[board.length - 1].score;
}

export function addEntry(entry: LeaderboardEntry): {
  entries: LeaderboardEntry[];
  rank: number;
} {
  const board = loadLeaderboard();
  const next = [...board, entry]
    .sort((a, b) => b.score - a.score)
    .slice(0, MAX_ENTRIES);
  saveLeaderboard(next);
  // Find which index our entry ended up at (by reference / unique fields).
  const rank = next.findIndex(
    (e) => e.score === entry.score && e.date === entry.date && e.name === entry.name,
  );
  return { entries: next, rank };
}

export function sanitizeName(raw: string): string {
  return raw
    .toUpperCase()
    .replace(/[^A-Z0-9 ]/g, '')
    .trim()
    .slice(0, MAX_NAME_LEN);
}

export function clearLeaderboard(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}
