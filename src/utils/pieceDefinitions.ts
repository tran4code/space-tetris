// Artemis II — flat-cartoon piece system.
// Each piece is defined by occupied [col, row] cells plus a shape id that
// maps to its SVG illustration in GridPiece.tsx.

export type PieceShape =
  | 'PLANET'
  | 'NASA'
  | 'SUN'
  | 'MOON'
  | 'COMET'
  | 'ROCKET'
  | 'SATELLITE'
  | 'ASTRONAUT'
  | 'STATION'
  | 'METEOR'
  | 'UFO'
  | 'ROCKY';

export interface PieceDef {
  shape: PieceShape;
  name: string;
  tetromino: string;
  cells: [number, number][];
  w: number;
  h: number;
  bodyColor: string;
  accentColor: string;
}

export type Rotation = 0 | 90 | 180 | 270;

// ROCKY-specific: each of his 5 limbs (2 upper + 3 lower) is independently
// sized 0–2. Body is always the 5-cell horizontal bar.
//   arms[0] = upper-left  (col 1)
//   arms[1] = upper-right (col 3)
//   arms[2] = lower-left  (col 0)
//   arms[3] = lower-mid   (col 2)
//   arms[4] = lower-right (col 4)
export type ArmLength = 0 | 1 | 2;
export interface RockyConfig {
  arms: [ArmLength, ArmLength, ArmLength, ArmLength, ArmLength];
}
export const DEFAULT_ROCKY_CONFIG: RockyConfig = { arms: [2, 2, 2, 2, 2] };

export interface PieceCustomization {
  rocky?: RockyConfig;
}

export interface PieceType extends PieceDef {
  id: string;
  rotation: Rotation;
  customization?: PieceCustomization;
}

const UPPER_ARM_COLS = [1, 3] as const;
const LOWER_ARM_COLS = [0, 2, 4] as const;

/**
 * Compute ROCKY's cells/bbox from a config. The body row sits at index
 * max(upper arm lengths); arms grow outward from the body.
 */
export function rockyGeometry(cfg: RockyConfig): {
  cells: [number, number][];
  w: number;
  h: number;
  bodyRow: number;
} {
  const upperMax = Math.max(cfg.arms[0], cfg.arms[1]);
  const lowerMax = Math.max(cfg.arms[2], cfg.arms[3], cfg.arms[4]);
  const bodyRow = upperMax;
  const w = 5;
  const h = upperMax + 1 + lowerMax;
  const cells: [number, number][] = [];
  for (let c = 0; c < 5; c += 1) cells.push([c, bodyRow]);
  UPPER_ARM_COLS.forEach((col, i) => {
    const len = cfg.arms[i];
    for (let k = 1; k <= len; k += 1) cells.push([col, bodyRow - k]);
  });
  LOWER_ARM_COLS.forEach((col, i) => {
    const len = cfg.arms[i + 2];
    for (let k = 1; k <= len; k += 1) cells.push([col, bodyRow + k]);
  });
  return { cells, w, h, bodyRow };
}

// Shapes that allow random rotation (rotation changes the footprint in a
// meaningful way AND the illustration still reads OK under rotation).
const ROTATABLE: Set<PieceShape> = new Set<PieceShape>([
  'SATELLITE', 'ASTRONAUT', 'STATION', 'METEOR', 'UFO',
]);

export function rotateCells(
  cells: [number, number][],
  w: number,
  h: number,
  rotation: Rotation,
): { cells: [number, number][]; w: number; h: number } {
  switch (rotation) {
    case 0:
      return { cells, w, h };
    case 90:
      return { cells: cells.map(([x, y]) => [h - 1 - y, x] as [number, number]), w: h, h: w };
    case 180:
      return { cells: cells.map(([x, y]) => [w - 1 - x, h - 1 - y] as [number, number]), w, h };
    case 270:
      return { cells: cells.map(([x, y]) => [y, w - 1 - x] as [number, number]), w: h, h: w };
  }
}

function randomRotationFor(shape: PieceShape): Rotation {
  if (!ROTATABLE.has(shape)) return 0;
  const options: Rotation[] = [0, 90, 180, 270];
  return options[Math.floor(Math.random() * options.length)];
}

// Design-token palette from the handoff.
export const PALETTE = {
  outline: '#1e2a4a',
  ink: '#1e2a4a',
  white: '#fef9f0',
  cream: '#f5e6d3',
  orange: '#ff7a3d',
  orangeDk: '#c74a1a',
  red: '#e84a3d',
  redDk: '#9a2a20',
  yellow: '#ffc93d',
  yellowDk: '#c89515',
  blue: '#3a6dc7',
  blueDk: '#1e3f82',
  teal: '#5ec4c4',
  purple: '#8a6dc7',
  gray: '#b8c0d0',
  grayDk: '#5a6a82',
  dark: '#1e2a4a',
  pink: '#ff9ab8',
  night: '#0b1a3a',
  cardBg: '#fef9f0',
  pageBg: '#f0eee9',
  badge: '#ffd9b8',
};

export const PIECE_DEFS: Record<PieceShape, PieceDef> = {
  PLANET: {
    shape: 'PLANET',
    name: 'Planet',
    tetromino: 'O',
    cells: [[0, 0], [1, 0], [0, 1], [1, 1]],
    w: 2, h: 2,
    bodyColor: PALETTE.blue,
    accentColor: PALETTE.cream,
  },
  NASA: {
    shape: 'NASA',
    name: 'NASA',
    tetromino: 'O',
    cells: [[0, 0], [1, 0], [0, 1], [1, 1]],
    w: 2, h: 2,
    bodyColor: PALETTE.white,
    accentColor: PALETTE.blueDk,
  },
  SUN: {
    shape: 'SUN',
    name: 'Sun',
    tetromino: 'O',
    cells: [[0, 0], [1, 0], [0, 1], [1, 1]],
    w: 2, h: 2,
    bodyColor: PALETTE.night,
    accentColor: PALETTE.yellow,
  },
  MOON: {
    shape: 'MOON',
    name: 'Moon',
    tetromino: 'O',
    cells: [[0, 0], [1, 0], [0, 1], [1, 1]],
    w: 2, h: 2,
    bodyColor: PALETTE.night,
    accentColor: PALETTE.gray,
  },
  COMET: {
    shape: 'COMET',
    name: 'Comet',
    tetromino: 'I',
    cells: [[0, 0], [1, 0], [2, 0], [3, 0]],
    w: 4, h: 1,
    bodyColor: PALETTE.yellow,
    accentColor: PALETTE.red,
  },
  ROCKET: {
    shape: 'ROCKET',
    name: 'Rocket',
    tetromino: 'I',
    cells: [[0, 0], [0, 1], [0, 2], [0, 3]],
    w: 1, h: 4,
    bodyColor: PALETTE.white,
    accentColor: PALETTE.orange,
  },
  SATELLITE: {
    shape: 'SATELLITE',
    name: 'Satellite',
    tetromino: 'L',
    cells: [[0, 0], [0, 1], [0, 2], [1, 2]],
    w: 2, h: 3,
    bodyColor: PALETTE.white,
    accentColor: PALETTE.blue,
  },
  ASTRONAUT: {
    shape: 'ASTRONAUT',
    name: 'Astronaut',
    tetromino: 'J',
    cells: [[1, 0], [1, 1], [1, 2], [0, 2]],
    w: 2, h: 3,
    bodyColor: PALETTE.white,
    accentColor: PALETTE.orange,
  },
  STATION: {
    shape: 'STATION',
    name: 'Station',
    tetromino: 'T',
    cells: [[0, 0], [1, 0], [2, 0], [1, 1]],
    w: 3, h: 2,
    bodyColor: PALETTE.white,
    accentColor: PALETTE.blueDk,
  },
  METEOR: {
    shape: 'METEOR',
    name: 'Meteor',
    tetromino: 'S',
    cells: [[1, 0], [2, 0], [0, 1], [1, 1]],
    w: 3, h: 2,
    bodyColor: PALETTE.gray,
    accentColor: PALETTE.grayDk,
  },
  UFO: {
    shape: 'UFO',
    name: 'UFO',
    tetromino: 'Z',
    cells: [[0, 0], [1, 0], [1, 1], [2, 1]],
    w: 3, h: 2,
    bodyColor: PALETTE.teal,
    accentColor: PALETTE.yellow,
  },
  ROCKY: {
    shape: 'ROCKY',
    name: 'Rocky',
    tetromino: 'PENTA',
    cells: [
      [1, 0], [3, 0],
      [1, 1], [3, 1],
      [0, 2], [1, 2], [2, 2], [3, 2], [4, 2],
      [0, 3], [2, 3], [4, 3],
      [0, 4], [2, 4], [4, 4],
    ],
    w: 5, h: 5,
    bodyColor: '#7a4a28',
    accentColor: '#8fb04a',
  },
};

// Standard spawn pool (ROCKY excluded — milestone-gated bonus only).
export const STANDARD_SHAPES: PieceShape[] = [
  'PLANET', 'NASA', 'SUN', 'MOON',
  'COMET', 'ROCKET',
  'SATELLITE', 'ASTRONAUT',
  'STATION', 'METEOR', 'UFO',
];

let pieceIdCounter = 0;
export function nextPieceId(shape: PieceShape): string {
  pieceIdCounter += 1;
  return `${shape}_${pieceIdCounter}`;
}

export function makePiece(shape: PieceShape, rotation?: Rotation): PieceType {
  const def = PIECE_DEFS[shape];
  if (shape === 'ROCKY') {
    // ROCKY ignores rotation (always 0) and uses configurable geometry.
    const geom = rockyGeometry(DEFAULT_ROCKY_CONFIG);
    return {
      ...def,
      cells: geom.cells,
      w: geom.w,
      h: geom.h,
      id: nextPieceId(shape),
      rotation: 0,
      customization: { rocky: DEFAULT_ROCKY_CONFIG },
    };
  }
  const r = rotation ?? randomRotationFor(shape);
  const rot = rotateCells(def.cells, def.w, def.h, r);
  return {
    ...def,
    cells: rot.cells,
    w: rot.w,
    h: rot.h,
    id: nextPieceId(shape),
    rotation: r,
  };
}

/** Returns a new piece with an updated ROCKY config (cells/w/h re-derived). */
export function applyRockyConfig(piece: PieceType, cfg: RockyConfig): PieceType {
  const geom = rockyGeometry(cfg);
  return {
    ...piece,
    cells: geom.cells,
    w: geom.w,
    h: geom.h,
    customization: { ...piece.customization, rocky: cfg },
  };
}

export function getRandomShape(): PieceShape {
  return STANDARD_SHAPES[Math.floor(Math.random() * STANDARD_SHAPES.length)];
}

export function generateRandomPieces(count: number): PieceType[] {
  const out: PieceType[] = [];
  for (let i = 0; i < count; i += 1) {
    out.push(makePiece(getRandomShape()));
  }
  return out;
}
