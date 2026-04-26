import { create } from 'zustand';
import {
  PieceType,
  generateRandomPieces,
  makePiece,
  getRandomShape,
  applyRockyConfig,
  RockyConfig,
  ArmLength,
} from '../utils/pieceDefinitions';
import type { PieceShape } from '../utils/pieceDefinitions';
import {
  GameGrid,
  createEmptyGrid,
  canPlacePiece,
  placePiece,
  checkCompleteLines,
  clearLines,
  calculateScore,
  hasValidMoves,
  findOptimalRockyConfig,
  GRID_WIDTH,
  GRID_HEIGHT,
} from '../utils/gameHelpers';
import { Theme, loadTheme, saveTheme } from '../utils/theme';
import {
  loadSoundEnabled,
  setSoundEnabled,
  playLineClear,
  playCombo,
  playSnap,
  playPerfectClear,
  playBonusUnlock,
  playGameOver,
} from '../utils/sound';

const TRAY_SIZE = 3;
// Progressive milestone intervals: first ROCKY arrives fast, then ramps up.
// 1st award after 2 lines, 2nd after 4 more, 3rd+ after 8 more each.
const BONUS_INTERVALS: readonly number[] = [2, 4, 8];
function nextBonusInterval(awardedCount: number): number {
  return BONUS_INTERVALS[Math.min(awardedCount, BONUS_INTERVALS.length - 1)];
}
const BONUS_SHAPE: PieceShape = 'ROCKY';
const PERFECT_CLEAR_BONUS = 1000;

export interface ScorePopup {
  id: string;
  x: number; // grid col (cell-space)
  y: number; // grid row (cell-space)
  value: number;
  label?: string;
  kind: 'place' | 'clear' | 'combo' | 'perfect' | 'bonus';
}

export interface GameState {
  grid: GameGrid;
  score: number;
  best: number;
  linesCleared: number;
  combo: number;
  lastClearLines: number;
  gameStatus: 'menu' | 'playing' | 'paused' | 'gameOver';
  availablePieces: (PieceType | null)[];
  draggedPiece: PieceType | null;
  draggedPieceInstanceId: string | null;
  previewPosition: { x: number; y: number } | null;
  lineClearAnimation: { rows: number[]; cols: number[] } | null;
  theme: Theme;
  bonusPiece: PieceType | null;
  linesToNextBonus: number;
  bonusesAwarded: number;
  bonusJustUnlocked: boolean;
  scorePopups: ScorePopup[];
  perfectClearAt: number | null;
  soundOn: boolean;
}

export interface GameActions {
  startGame: () => void;
  resetGame: () => void;
  returnToMenu: () => void;
  pauseGame: () => void;
  resumeGame: () => void;
  setDraggedPiece: (piece: PieceType | null, instanceId?: string | null) => void;
  setPreviewPosition: (position: { x: number; y: number } | null) => void;
  placePieceOnGrid: (piece: PieceType, x: number, y: number) => boolean;
  refillTray: () => void;
  toggleTheme: () => void;
  toggleSound: () => void;
  removeScorePopup: (id: string) => void;
  adjustBonusArm: (armIndex: number, delta: 1 | -1) => void;
  reFitBonus: () => void;
}

function loadBest(): number {
  try {
    const raw = localStorage.getItem('artemis-tetris-best');
    return raw ? parseInt(raw, 10) || 0 : 0;
  } catch {
    return 0;
  }
}

function saveBest(score: number) {
  try {
    localStorage.setItem('artemis-tetris-best', String(score));
  } catch {
    // ignore
  }
}

function refreshTray(pool: (PieceType | null)[]): (PieceType | null)[] {
  if (pool.every((p) => p === null)) {
    return Array.from({ length: TRAY_SIZE }, () => makePiece(getRandomShape()));
  }
  return pool;
}

let popupIdCounter = 0;
function nextPopupId() {
  popupIdCounter += 1;
  return `pop_${popupIdCounter}`;
}

function gridIsEmpty(grid: GameGrid): boolean {
  for (let y = 0; y < GRID_HEIGHT; y += 1) {
    for (let x = 0; x < GRID_WIDTH; x += 1) {
      if (grid[y][x] !== null) return false;
    }
  }
  return true;
}

export const useGameStore = create<GameState & GameActions>((set, get) => ({
  grid: createEmptyGrid(),
  score: 0,
  best: loadBest(),
  linesCleared: 0,
  combo: 0,
  lastClearLines: 0,
  gameStatus: 'menu',
  availablePieces: generateRandomPieces(TRAY_SIZE),
  draggedPiece: null,
  draggedPieceInstanceId: null,
  previewPosition: null,
  lineClearAnimation: null,
  theme: loadTheme(),
  bonusPiece: null,
  linesToNextBonus: nextBonusInterval(0),
  bonusesAwarded: 0,
  bonusJustUnlocked: false,
  scorePopups: [],
  perfectClearAt: null,
  soundOn: loadSoundEnabled(),

  toggleTheme: () => {
    const next: Theme = get().theme === 'light' ? 'dark' : 'light';
    saveTheme(next);
    set({ theme: next });
  },

  toggleSound: () => {
    const next = !get().soundOn;
    setSoundEnabled(next);
    set({ soundOn: next });
  },

  startGame: () => {
    const { theme, soundOn } = get();
    set({
      grid: createEmptyGrid(),
      score: 0,
      linesCleared: 0,
      combo: 0,
      lastClearLines: 0,
      gameStatus: 'playing',
      availablePieces: generateRandomPieces(TRAY_SIZE),
      draggedPiece: null,
      draggedPieceInstanceId: null,
      previewPosition: null,
      lineClearAnimation: null,
      theme,
      bonusPiece: null,
      linesToNextBonus: nextBonusInterval(0),
      bonusesAwarded: 0,
      bonusJustUnlocked: false,
      scorePopups: [],
      perfectClearAt: null,
      soundOn,
    });
  },

  resetGame: () => {
    get().startGame();
  },

  returnToMenu: () => {
    set({ gameStatus: 'menu' });
  },

  pauseGame: () => {
    if (get().gameStatus === 'playing') set({ gameStatus: 'paused' });
  },

  resumeGame: () => {
    if (get().gameStatus === 'paused') set({ gameStatus: 'playing' });
  },

  setDraggedPiece: (piece, instanceId) => {
    set({
      draggedPiece: piece,
      draggedPieceInstanceId: instanceId || null,
    });
  },

  setPreviewPosition: (position) => {
    set({ previewPosition: position });
  },

  removeScorePopup: (id) => {
    set((s) => ({ scorePopups: s.scorePopups.filter((p) => p.id !== id) }));
  },

  adjustBonusArm: (armIndex, delta) => {
    const { bonusPiece } = get();
    if (!bonusPiece || bonusPiece.shape !== 'ROCKY') return;
    const cfg: RockyConfig = bonusPiece.customization?.rocky ?? { arms: [2, 2, 2, 2, 2] };
    const current = cfg.arms[armIndex];
    const next = Math.max(0, Math.min(2, current + delta)) as ArmLength;
    if (next === current) return;
    const newArms = [...cfg.arms] as RockyConfig['arms'];
    newArms[armIndex] = next;
    set({ bonusPiece: applyRockyConfig(bonusPiece, { arms: newArms }) });
  },

  reFitBonus: () => {
    const { bonusPiece, grid } = get();
    if (!bonusPiece || bonusPiece.shape !== 'ROCKY') return;
    const cfg = findOptimalRockyConfig(grid);
    set({ bonusPiece: applyRockyConfig(bonusPiece, cfg) });
  },

  placePieceOnGrid: (piece, x, y): boolean => {
    const state = get();
    if (!canPlacePiece(state.grid, piece, x, y)) return false;

    const afterPlace = placePiece(state.grid, piece, x, y);
    const completed = checkCompleteLines(afterPlace);
    const hasClears = completed.rows.length > 0 || completed.cols.length > 0;
    const clearedCount = completed.rows.length + completed.cols.length;

    // ROCKY scores 2× per cell — special bonus piece.
    const placePoints = piece.shape === 'ROCKY' ? piece.cells.length * 2 : piece.cells.length;
    const lineBonus = calculateScore(piece, completed) - piece.cells.length;
    const earnedThisTurn = placePoints + lineBonus;
    const newScore = state.score + earnedThisTurn;
    const newLinesCleared = state.linesCleared + clearedCount;
    const newCombo = hasClears ? state.combo + 1 : 0;

    const fromBonus = state.bonusPiece !== null && state.bonusPiece.id === piece.id;

    let newTray: (PieceType | null)[] = [...state.availablePieces];
    let newBonus: PieceType | null = state.bonusPiece;

    if (fromBonus) {
      newBonus = null;
    } else {
      const idx = newTray.findIndex((p) => p !== null && p.id === piece.id);
      if (idx !== -1) newTray[idx] = null;
      newTray = refreshTray(newTray);
    }

    let bonusCountdown = state.linesToNextBonus;
    let newBonusesAwarded = state.bonusesAwarded;
    let bonusJustUnlocked = false;
    let shouldOptimizeBonus = false;
    // Only count down toward the next bonus when the slot is empty —
    // otherwise the player could stockpile lines and get a free instant
    // re-award the moment they place the current ROCKY.
    if (hasClears && newBonus === null) {
      bonusCountdown = Math.max(0, bonusCountdown - clearedCount);
      if (bonusCountdown === 0) {
        newBonus = makePiece(BONUS_SHAPE);
        newBonusesAwarded = state.bonusesAwarded + 1;
        bonusCountdown = nextBonusInterval(newBonusesAwarded);
        bonusJustUnlocked = true;
        shouldOptimizeBonus = true;
      }
    }

    // Build score popups for this placement.
    const popups: ScorePopup[] = [];
    // Centroid of placed cells in grid space.
    const cx = piece.cells.reduce((a, [c]) => a + c, 0) / piece.cells.length + x;
    const cy = piece.cells.reduce((a, [, r]) => a + r, 0) / piece.cells.length + y;
    if (piece.shape === 'ROCKY') {
      popups.push({
        id: nextPopupId(),
        x: cx,
        y: cy,
        value: placePoints,
        label: 'ROCKY!',
        kind: 'bonus',
      });
    } else {
      popups.push({
        id: nextPopupId(),
        x: cx,
        y: cy,
        value: placePoints,
        kind: 'place',
      });
    }

    if (hasClears) {
      // Center popup on the cleared line(s).
      const rowCenter = completed.rows.length
        ? completed.rows.reduce((a, b) => a + b, 0) / completed.rows.length
        : null;
      const colCenter = completed.cols.length
        ? completed.cols.reduce((a, b) => a + b, 0) / completed.cols.length
        : null;
      const px = colCenter !== null ? colCenter : GRID_WIDTH / 2 - 0.5;
      const py = rowCenter !== null ? rowCenter : GRID_HEIGHT / 2 - 0.5;
      popups.push({
        id: nextPopupId(),
        x: px,
        y: py,
        value: lineBonus,
        label: clearedCount > 1 ? `${clearedCount}× CLEAR` : 'CLEAR',
        kind: 'clear',
      });
      if (newCombo > 1) {
        popups.push({
          id: nextPopupId(),
          x: px,
          y: py - 0.6,
          value: 0,
          label: `COMBO ×${newCombo}`,
          kind: 'combo',
        });
      }
    }

    if (hasClears) {
      set({
        grid: afterPlace,
        lineClearAnimation: completed,
        score: newScore,
        linesCleared: newLinesCleared,
        combo: newCombo,
        lastClearLines: clearedCount,
        availablePieces: newTray,
        bonusPiece: newBonus,
        linesToNextBonus: bonusCountdown,
        bonusesAwarded: newBonusesAwarded,
        bonusJustUnlocked,
        draggedPiece: null,
        draggedPieceInstanceId: null,
        previewPosition: null,
        scorePopups: [...state.scorePopups, ...popups],
      });
      // SFX
      playSnap();
      playLineClear(newCombo);
      if (newCombo > 1) playCombo(newCombo);
      if (bonusJustUnlocked) playBonusUnlock();

      setTimeout(() => {
        const s = get();
        const cleared = clearLines(s.grid, completed);
        const isPerfect = gridIsEmpty(cleared);
        let scoreAfterPerfect = newScore;
        const morePopups: ScorePopup[] = [];
        if (isPerfect) {
          scoreAfterPerfect = newScore + PERFECT_CLEAR_BONUS;
          morePopups.push({
            id: nextPopupId(),
            x: GRID_WIDTH / 2 - 0.5,
            y: GRID_HEIGHT / 2 - 0.5,
            value: PERFECT_CLEAR_BONUS,
            label: 'PERFECT!',
            kind: 'perfect',
          });
          playPerfectClear();
        }
        // If a bonus was unlocked this turn, auto-shape it now against the
        // freshly-cleared grid so it's most useful for the player.
        let optimizedBonus = s.bonusPiece;
        if (shouldOptimizeBonus && optimizedBonus && optimizedBonus.shape === 'ROCKY') {
          const cfg = findOptimalRockyConfig(cleared);
          optimizedBonus = applyRockyConfig(optimizedBonus, cfg);
        }
        const gameOver = !hasValidMoves(
          cleared,
          s.availablePieces.filter((p): p is PieceType => p !== null),
        );
        if (gameOver) {
          if (scoreAfterPerfect > s.best) saveBest(scoreAfterPerfect);
          playGameOver();
        }
        set({
          grid: cleared,
          lineClearAnimation: null,
          gameStatus: gameOver ? 'gameOver' : 'playing',
          best: gameOver ? Math.max(s.best, scoreAfterPerfect) : s.best,
          score: scoreAfterPerfect,
          perfectClearAt: isPerfect ? Date.now() : s.perfectClearAt,
          scorePopups: [...s.scorePopups, ...morePopups],
          bonusPiece: optimizedBonus,
        });
      }, 420);
    } else {
      const gameOver = !hasValidMoves(
        afterPlace,
        newTray.filter((p): p is PieceType => p !== null),
      );
      if (gameOver && newScore > state.best) saveBest(newScore);
      set({
        grid: afterPlace,
        score: newScore,
        linesCleared: newLinesCleared,
        combo: newCombo,
        lastClearLines: 0,
        availablePieces: newTray,
        bonusPiece: newBonus,
        draggedPiece: null,
        draggedPieceInstanceId: null,
        previewPosition: null,
        gameStatus: gameOver ? 'gameOver' : 'playing',
        best: gameOver ? Math.max(state.best, newScore) : state.best,
        scorePopups: [...state.scorePopups, ...popups],
      });
      playSnap();
      if (gameOver) playGameOver();
    }

    return true;
  },

  refillTray: () => {
    set((s) => ({ availablePieces: refreshTray(s.availablePieces) }));
  },
}));

if (typeof window !== 'undefined' && process.env.NODE_ENV !== 'production') {
  // Dev-only: expose for quick console probing.
  (window as unknown as { __game?: typeof useGameStore }).__game = useGameStore;
}
