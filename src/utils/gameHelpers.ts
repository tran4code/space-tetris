import { PieceType, PieceShape, PALETTE, Rotation, RockyConfig } from './pieceDefinitions';

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
