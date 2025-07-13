import { PieceType } from './pieceDefinitions';

export type GridCell = { emoji: string; color: string } | null;
export type GameGrid = GridCell[][];

export const GRID_WIDTH = 10;
export const GRID_HEIGHT = 15;

export function createEmptyGrid(): GameGrid {
  return Array(GRID_HEIGHT).fill(null).map(() => Array(GRID_WIDTH).fill(null));
}

export function createGridWithMeteorities(): GameGrid {
  const grid = createEmptyGrid();
  const meteoriteCount = Math.floor((GRID_WIDTH * GRID_HEIGHT) * 0.25); // 25% coverage
  
  for (let i = 0; i < meteoriteCount; i++) {
    let x, y;
    do {
      x = Math.floor(Math.random() * GRID_WIDTH);
      y = Math.floor(Math.random() * GRID_HEIGHT);
    } while (grid[y][x] !== null);
    
    grid[y][x] = { emoji: '🌑', color: '#555' };
  }
  
  return grid;
}

export function repopulateMeteorities(grid: GameGrid, linesCleared: { rows: number[], cols: number[] }): GameGrid {
  const newGrid = grid.map(row => [...row]);
  
  // Repopulate the top rows (newly created empty rows after row clearing)
  const rowsToRepopulate = linesCleared.rows.length;
  for (let i = 0; i < rowsToRepopulate; i++) {
    const meteoriteCount = Math.floor(GRID_WIDTH * 0.25); // 25% coverage like initial setup
    for (let j = 0; j < meteoriteCount; j++) {
      const x = Math.floor(Math.random() * GRID_WIDTH);
      if (newGrid[i][x] === null) { // Only place if cell is empty
        newGrid[i][x] = { emoji: '🌑', color: '#555' };
      }
    }
  }
  
  // Repopulate the left columns (newly created empty columns after column clearing)
  const colsToRepopulate = linesCleared.cols.length;
  for (let i = 0; i < colsToRepopulate; i++) {
    const meteoriteCount = Math.floor(GRID_HEIGHT * 0.25); // 25% coverage
    for (let j = 0; j < meteoriteCount; j++) {
      const y = Math.floor(Math.random() * GRID_HEIGHT);
      if (newGrid[y][i] === null) { // Only place if cell is empty
        newGrid[y][i] = { emoji: '🌑', color: '#555' };
      }
    }
  }
  
  return newGrid;
}

export function canPlacePiece(
  grid: GameGrid,
  piece: PieceType,
  startX: number,
  startY: number
): boolean {
  for (let y = 0; y < piece.shape.length; y++) {
    for (let x = 0; x < piece.shape[y].length; x++) {
      if (piece.shape[y][x] === 1) {
        const gridX = startX + x;
        const gridY = startY + y;
        
        // Check bounds
        if (gridX < 0 || gridX >= GRID_WIDTH || gridY < 0 || gridY >= GRID_HEIGHT) {
          return false;
        }
        
        // Check collision
        if (grid[gridY][gridX] !== null) {
          return false;
        }
      }
    }
  }
  return true;
}

export function placePiece(
  grid: GameGrid,
  piece: PieceType,
  startX: number,
  startY: number
): GameGrid {
  const newGrid = grid.map(row => [...row]);
  
  for (let y = 0; y < piece.shape.length; y++) {
    for (let x = 0; x < piece.shape[y].length; x++) {
      if (piece.shape[y][x] === 1) {
        const gridX = startX + x;
        const gridY = startY + y;
        newGrid[gridY][gridX] = { emoji: piece.emoji, color: piece.color };
      }
    }
  }
  
  return newGrid;
}

export function checkCompleteLines(grid: GameGrid): { rows: number[], cols: number[] } {
  const completeRows: number[] = [];
  const completeCols: number[] = [];
  
  // Check rows
  for (let y = 0; y < GRID_HEIGHT; y++) {
    if (grid[y].every(cell => cell !== null)) {
      completeRows.push(y);
    }
  }
  
  // Check columns
  for (let x = 0; x < GRID_WIDTH; x++) {
    if (grid.every(row => row[x] !== null)) {
      completeCols.push(x);
    }
  }
  
  return { rows: completeRows, cols: completeCols };
}

export function clearLines(grid: GameGrid, linesToClear: { rows: number[], cols: number[] }): GameGrid {
  let newGrid = grid.map(row => [...row]);
  
  // Clear complete rows by removing them and adding empty rows at the top
  const sortedRows = linesToClear.rows.sort((a, b) => b - a); // Sort descending to remove from bottom up
  sortedRows.forEach(rowIndex => {
    newGrid.splice(rowIndex, 1); // Remove the complete row
    newGrid.unshift(Array(GRID_WIDTH).fill(null)); // Add empty row at top
  });
  
  // Clear complete columns by shifting everything right and adding empty columns on the left
  const sortedCols = linesToClear.cols.sort((a, b) => b - a); // Sort descending to remove from right to left
  sortedCols.forEach(colIndex => {
    // Remove the complete column
    for (let y = 0; y < GRID_HEIGHT; y++) {
      newGrid[y].splice(colIndex, 1);
    }
    // Add empty column on the left
    for (let y = 0; y < GRID_HEIGHT; y++) {
      newGrid[y].unshift(null);
    }
  });
  
  return newGrid;
}

export function calculateScore(linesCleared: { rows: number[], cols: number[] }): number {
  const totalLines = linesCleared.rows.length + linesCleared.cols.length;
  
  switch (totalLines) {
    case 1: return 100;
    case 2: return 300;
    case 3: return 500;
    case 4: return 800;
    default: return totalLines * 100;
  }
}

export function hasValidMoves(grid: GameGrid, availablePieces: PieceType[]): boolean {
  for (const piece of availablePieces) {
    for (let y = 0; y < GRID_HEIGHT; y++) {
      for (let x = 0; x < GRID_WIDTH; x++) {
        if (canPlacePiece(grid, piece, x, y)) {
          return true;
        }
      }
    }
  }
  return false;
}