import {
  PieceType,
  PieceShape,
  PALETTE,
  Rotation,
  RockyConfig,
  ArmLength,
  DEFAULT_ROCKY_CONFIG,
  rockyGeometry,
} from './pieceDefinitions';

export interface GridCellData {
  shape: PieceShape;
  color: string;
  pieceInstanceId: string;
  originX: number;
  originY: number;
  rotation: Rotation;
  rockyConfig?: RockyConfig;
}

export type GridCell = GridCellData | null;
export type GameGrid = GridCell[][];

export const GRID_WIDTH = 10;
export const GRID_HEIGHT = 10;

export function createEmptyGrid(): GameGrid {
  return Array(GRID_HEIGHT)
    .fill(null)
    .map(() => Array<GridCell>(GRID_WIDTH).fill(null));
}

function tintForPiece(piece: PieceType): string {
  switch (piece.shape) {
    case 'PLANET':
      return PALETTE.blue;
    case 'COMET':
      return PALETTE.yellow;
    case 'METEOR':
      return PALETTE.gray;
    case 'UFO':
      return PALETTE.teal;
    case 'SUN':
      return PALETTE.yellow;
    case 'MOON':
      return PALETTE.gray;
    case 'NASA':
      return PALETTE.blueDk;
    case 'ROCKY':
      return '#7a4a28';
    case 'ROCKET':
      return PALETTE.orange;
    case 'SATELLITE':
      return PALETTE.blue;
    case 'ASTRONAUT':
      return PALETTE.orange;
    case 'STATION':
      return PALETTE.cream;
    default:
      return PALETTE.white;
  }
}

export function canPlacePiece(
  grid: GameGrid,
  piece: PieceType,
  startX: number,
  startY: number,
): boolean {
  for (const [cx, cy] of piece.cells) {
    const gridX = startX + cx;
    const gridY = startY + cy;
    if (gridX < 0 || gridX >= GRID_WIDTH || gridY < 0 || gridY >= GRID_HEIGHT) {
      return false;
    }
    if (grid[gridY][gridX] !== null) {
      return false;
    }
  }
  return true;
}

export function placePiece(
  grid: GameGrid,
  piece: PieceType,
  startX: number,
  startY: number,
): GameGrid {
  const newGrid = grid.map((row) => [...row]);
  const tint = tintForPiece(piece);
  for (const [cx, cy] of piece.cells) {
    const gridX = startX + cx;
    const gridY = startY + cy;
    newGrid[gridY][gridX] = {
      shape: piece.shape,
      color: tint,
      pieceInstanceId: piece.id,
      originX: startX,
      originY: startY,
      rotation: piece.rotation,
      rockyConfig: piece.customization?.rocky,
    };
  }
  return newGrid;
}

/**
 * Groups the grid's currently-occupied cells by piece instance.
 * Used by GameGrid to render each placed piece's illustration, clipped to
 * whichever cells survive after line clears.
 */
export interface PieceInstanceOnGrid {
  pieceInstanceId: string;
  shape: PieceShape;
  originX: number;
  originY: number;
  rotation: Rotation;
  rockyConfig?: RockyConfig;
  occupiedCells: [number, number][];
}

export function getPieceInstancesOnGrid(grid: GameGrid): PieceInstanceOnGrid[] {
  const instances = new Map<string, PieceInstanceOnGrid>();
  for (let y = 0; y < GRID_HEIGHT; y += 1) {
    for (let x = 0; x < GRID_WIDTH; x += 1) {
      const cell = grid[y][x];
      if (!cell) continue;
      const existing = instances.get(cell.pieceInstanceId);
      if (existing) {
        existing.occupiedCells.push([x, y]);
      } else {
        instances.set(cell.pieceInstanceId, {
          pieceInstanceId: cell.pieceInstanceId,
          shape: cell.shape,
          originX: cell.originX,
          originY: cell.originY,
          rotation: cell.rotation,
          rockyConfig: cell.rockyConfig,
          occupiedCells: [[x, y]],
        });
      }
    }
  }
  return Array.from(instances.values());
}

export function checkCompleteLines(grid: GameGrid): { rows: number[]; cols: number[] } {
  const completeRows: number[] = [];
  const completeCols: number[] = [];

  for (let y = 0; y < GRID_HEIGHT; y += 1) {
    if (grid[y].every((cell) => cell !== null)) {
      completeRows.push(y);
    }
  }

  for (let x = 0; x < GRID_WIDTH; x += 1) {
    if (grid.every((row) => row[x] !== null)) {
      completeCols.push(x);
    }
  }

  return { rows: completeRows, cols: completeCols };
}

// Drag-to-fit style: cleared lines simply empty in place (no gravity).
export function clearLines(
  grid: GameGrid,
  linesToClear: { rows: number[]; cols: number[] },
): GameGrid {
  const newGrid = grid.map((row) => [...row]);
  for (const rowIndex of linesToClear.rows) {
    for (let x = 0; x < GRID_WIDTH; x += 1) {
      newGrid[rowIndex][x] = null;
    }
  }
  for (const colIndex of linesToClear.cols) {
    for (let y = 0; y < GRID_HEIGHT; y += 1) {
      newGrid[y][colIndex] = null;
    }
  }
  return newGrid;
}

export function calculateScore(
  piece: PieceType,
  linesCleared: { rows: number[]; cols: number[] },
): number {
  // Base points: one per cell placed.
  const placementPoints = piece.cells.length;
  const totalLines = linesCleared.rows.length + linesCleared.cols.length;
  // Combo bonus grows quickly — clearing multiple lines at once is the goal.
  const lineBonus =
    totalLines === 0 ? 0 :
    totalLines === 1 ? 100 :
    totalLines === 2 ? 300 :
    totalLines === 3 ? 600 :
    totalLines * 300;
  return placementPoints + lineBonus;
}

/**
 * Counts how many full rows + columns the grid would have if the given cells
 * were placed at (px, py). Used by the ROCKY auto-shape optimizer.
 */
function countLinesIfPlaced(
  grid: GameGrid,
  cells: [number, number][],
  px: number,
  py: number,
): number {
  const placed = new Set<string>();
  for (const [cx, cy] of cells) placed.add(`${px + cx},${py + cy}`);
  let lines = 0;
  for (let y = 0; y < GRID_HEIGHT; y += 1) {
    let full = true;
    for (let x = 0; x < GRID_WIDTH; x += 1) {
      if (grid[y][x] === null && !placed.has(`${x},${y}`)) {
        full = false;
        break;
      }
    }
    if (full) lines += 1;
  }
  for (let x = 0; x < GRID_WIDTH; x += 1) {
    let full = true;
    for (let y = 0; y < GRID_HEIGHT; y += 1) {
      if (grid[y][x] === null && !placed.has(`${x},${y}`)) {
        full = false;
        break;
      }
    }
    if (full) lines += 1;
  }
  return lines;
}

function fits(grid: GameGrid, cells: [number, number][], px: number, py: number): boolean {
  for (const [cx, cy] of cells) {
    const gx = px + cx;
    const gy = py + cy;
    if (gx < 0 || gx >= GRID_WIDTH || gy < 0 || gy >= GRID_HEIGHT) return false;
    if (grid[gy][gx] !== null) return false;
  }
  return true;
}

/**
 * Searches all 243 valid ROCKY configs (3⁵ permutations of arm lengths) and
 * picks the one whose best placement on the current grid maximizes
 * `lines_cleared * 100 + cells_placed`. Tie-breaks toward the larger ROCKY.
 *
 * Falls back to DEFAULT_ROCKY_CONFIG if no config can be placed anywhere
 * (the player can still shrink it manually via the editor).
 */
export function findOptimalRockyConfig(grid: GameGrid): RockyConfig {
  const lengths: ArmLength[] = [0, 1, 2];
  let bestConfig: RockyConfig = DEFAULT_ROCKY_CONFIG;
  let bestScore = -1;
  let foundAnyFit = false;

  for (const ul of lengths) {
    for (const ur of lengths) {
      for (const ll of lengths) {
        for (const lm of lengths) {
          for (const lr of lengths) {
            const config: RockyConfig = { arms: [ul, ur, ll, lm, lr] };
            const geom = rockyGeometry(config);
            let bestPlacementScore = -1;
            for (let py = 0; py + geom.h <= GRID_HEIGHT; py += 1) {
              for (let px = 0; px + geom.w <= GRID_WIDTH; px += 1) {
                if (!fits(grid, geom.cells, px, py)) continue;
                const lineCount = countLinesIfPlaced(grid, geom.cells, px, py);
                const score = lineCount * 100 + geom.cells.length;
                if (score > bestPlacementScore) bestPlacementScore = score;
              }
            }
            if (bestPlacementScore < 0) continue; // doesn't fit anywhere
            foundAnyFit = true;
            if (bestPlacementScore > bestScore) {
              bestScore = bestPlacementScore;
              bestConfig = config;
            }
          }
        }
      }
    }
  }

  return foundAnyFit ? bestConfig : DEFAULT_ROCKY_CONFIG;
}

export function hasValidMoves(grid: GameGrid, availablePieces: PieceType[]): boolean {
  for (const piece of availablePieces) {
    for (let y = 0; y < GRID_HEIGHT; y += 1) {
      for (let x = 0; x < GRID_WIDTH; x += 1) {
        if (canPlacePiece(grid, piece, x, y)) {
          return true;
        }
      }
    }
  }
  return false;
}
