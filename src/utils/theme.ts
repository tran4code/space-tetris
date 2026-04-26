export type Theme = 'light' | 'dark';

export interface Tokens {
  pageBg: string;
  gridBg: string;
  gridInner: string;
  cellEven: string;
  cellOdd: string;
  cellBorder: string;
  pageInk: string;
  pageMutedInk: string;
  gridBorder: string;
  overlayBg: string;
}

export const TOKENS: Record<Theme, Tokens> = {
  light: {
    pageBg: '#f0eee9',
    gridBg: '#fef9f0',
    gridInner: '#e8dfc9',
    cellEven: '#f5efe0',
    cellOdd: '#ece4d1',
    cellBorder: 'rgba(30,42,74,0.06)',
    pageInk: '#1e2a4a',
    pageMutedInk: '#5a6a82',
    gridBorder: '#1e2a4a',
    overlayBg: 'rgba(240, 238, 233, 0.88)',
  },
  dark: {
    pageBg: '#0b1a3a',
    gridBg: '#0b1a3a',
    gridInner: '#0b1a3a',
    cellEven: '#122344',
    cellOdd: '#0f1e3d',
    cellBorder: 'rgba(255,255,255,0.06)',
    pageInk: '#fef9f0',
    pageMutedInk: '#b8c0d0',
    gridBorder: '#3a4d7a',
    overlayBg: 'rgba(11, 26, 58, 0.9)',
  },
};

const STORAGE_KEY = 'artemis-tetris-theme';

export function loadTheme(): Theme {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    return v === 'dark' ? 'dark' : 'light';
  } catch {
    return 'light';
  }
}

export function saveTheme(t: Theme) {
  try {
    localStorage.setItem(STORAGE_KEY, t);
  } catch {
    // ignore
  }
}
