import { create } from 'zustand';
import { PieceType } from '../utils/pieceDefinitions';
import { generateRandomRotatedPieces } from '../utils/pieceRotations';
import {
  GameGrid,
  createGridWithMeteorities,
  canPlacePiece,
  placePiece,
  checkCompleteLines,
  clearLines,
  calculateScore,
  hasValidMoves,
  repopulateMeteorities,
  updateMeteoriteColors,
} from '../utils/gameHelpers';

export interface GameState {
  grid: GameGrid;
  score: number;
  linesCleared: number;
  level: number;
  gameStatus: 'menu' | 'playing' | 'paused' | 'gameOver';
  availablePieces: PieceType[];
  selectedPiece: PieceType | null;
  draggedPiece: PieceType | null;
  draggedPieceInstanceId: string | null;
  previewPosition: { x: number; y: number } | null;
  lineClearAnimation: { rows: number[]; cols: number[] } | null;
  availablePoints: number; // Points available to spend on revealing image
  adminMode: boolean; // Secret admin mode for free comet destruction
}

export interface GameActions {
  startGame: () => void;
  resetGame: () => void;
  pauseGame: () => void;
  resumeGame: () => void;
  selectPiece: (piece: PieceType) => void;
  setDraggedPiece: (piece: PieceType | null, instanceId?: string | null) => void;
  setPreviewPosition: (position: { x: number; y: number } | null) => void;
  placePieceOnGrid: (piece: PieceType, x: number, y: number) => boolean;
  rotateSelectedPiece: (direction: 'clockwise' | 'counterclockwise') => void;
  generateNewPieces: () => void;
  spendPoints: (pointsSpent: number) => void;
  toggleAdminMode: () => void;
}

export const useGameStore = create<GameState & GameActions>((set, get) => ({
  // Initial state
  grid: createGridWithMeteorities(),
  score: 0,
  linesCleared: 0,
  level: 1,
  gameStatus: 'menu',
  availablePieces: generateRandomRotatedPieces(6),
  selectedPiece: null,
  draggedPiece: null,
  draggedPieceInstanceId: null,
  previewPosition: null,
  lineClearAnimation: null,
  availablePoints: 0,
  adminMode: false,

  // Actions
  startGame: () => {
    const { adminMode } = get(); // Preserve admin mode
    const initialGrid = updateMeteoriteColors(createGridWithMeteorities());
    set({
      grid: initialGrid,
      score: 0,
      linesCleared: 0,
      level: 1,
      gameStatus: 'playing',
      availablePieces: generateRandomRotatedPieces(6),
      selectedPiece: null,
      draggedPiece: null,
      draggedPieceInstanceId: null,
      previewPosition: null,
      lineClearAnimation: null,
      availablePoints: 0,
      adminMode, // Keep the current admin mode state
    });
  },

  resetGame: () => {
    get().startGame();
  },

  pauseGame: () => {
    const { gameStatus } = get();
    if (gameStatus === 'playing') {
      set({ gameStatus: 'paused' });
    }
  },

  resumeGame: () => {
    const { gameStatus } = get();
    if (gameStatus === 'paused') {
      set({ gameStatus: 'playing' });
    }
  },

  selectPiece: (piece: PieceType) => {
    set({ selectedPiece: piece });
  },

  setDraggedPiece: (piece: PieceType | null, instanceId?: string | null) => {
    set({ 
      draggedPiece: piece,
      draggedPieceInstanceId: instanceId || null
    });
  },

  setPreviewPosition: (position: { x: number; y: number } | null) => {
    set({ previewPosition: position });
  },


  rotateSelectedPiece: (direction: 'clockwise' | 'counterclockwise') => {
    const { selectedPiece, availablePieces } = get();
    if (selectedPiece) {
      const rotatedShape = direction === 'clockwise' 
        ? selectedPiece.shape[0].map((_, colIndex) =>
            selectedPiece.shape.map(row => row[colIndex]).reverse()
          )
        : selectedPiece.shape[0].map((_, colIndex) =>
            selectedPiece.shape.map(row => row[row.length - 1 - colIndex])
          );
      
      const rotatedPiece = {
        ...selectedPiece,
        shape: rotatedShape
      };

      // Update the piece in availablePieces array
      const newAvailablePieces = availablePieces.map(piece => 
        piece === selectedPiece ? rotatedPiece : piece
      );

      set({
        selectedPiece: rotatedPiece,
        availablePieces: newAvailablePieces
      });
    }
  },

  placePieceOnGrid: (piece: PieceType, x: number, y: number): boolean => {
    const { grid, score, linesCleared, level, availablePieces, availablePoints } = get();
    
    if (!canPlacePiece(grid, piece, x, y)) {
      return false;
    }

    // Place the piece
    const newGrid = placePiece(grid, piece, x, y);
    
    // Check for complete lines
    const completedLines = checkCompleteLines(newGrid);
    const hasCompletedLines = completedLines.rows.length > 0 || completedLines.cols.length > 0;
    
    let finalGrid = newGrid;
    let newScore = score;
    let newLinesCleared = linesCleared;
    let newLevel = level;
    let newAvailablePoints = availablePoints;
    
    if (hasCompletedLines) {
      // Set animation state
      set({ lineClearAnimation: completedLines });
      
      // Calculate score
      const lineScore = calculateScore(completedLines);
      newScore = score + lineScore;
      newLinesCleared = linesCleared + completedLines.rows.length + completedLines.cols.length;
      newLevel = Math.floor(newLinesCleared / 10) + 1;
      
      // Add points for image reveal (50% of score earned goes to available points)
      newAvailablePoints = availablePoints + Math.floor(lineScore * 0.5);
      
      // Clear lines after animation (in real app, this would be delayed)
      finalGrid = clearLines(newGrid, completedLines);
      
      // Repopulate meteorites after clearing lines
      finalGrid = repopulateMeteorities(finalGrid, completedLines);
      
      // Clear animation state after processing
      setTimeout(() => {
        set({ lineClearAnimation: null });
      }, 500);
    }

    // Generate new piece to replace the used one
    const pieceIndex = availablePieces.findIndex(p => p.id === piece.id);
    const newAvailablePieces = [...availablePieces];
    if (pieceIndex !== -1) {
      const newPieces = generateRandomRotatedPieces(1);
      newAvailablePieces[pieceIndex] = newPieces[0];
    }

    // Check for game over
    const gameOver = !hasValidMoves(finalGrid, newAvailablePieces);

    set({
      grid: finalGrid,
      score: newScore,
      linesCleared: newLinesCleared,
      level: newLevel,
      availablePieces: newAvailablePieces,
      availablePoints: newAvailablePoints,
      selectedPiece: null,
      draggedPiece: null,
      draggedPieceInstanceId: null,
      previewPosition: null,
      gameStatus: gameOver ? 'gameOver' : 'playing',
    });

    return true;
  },

  generateNewPieces: () => {
    set({
      availablePieces: generateRandomRotatedPieces(6)
    });
  },

  spendPoints: (pointsSpent: number) => {
    const { availablePoints } = get();
    set({
      availablePoints: Math.max(0, availablePoints - pointsSpent)
    });
  },

  toggleAdminMode: () => {
    const { adminMode } = get();
    set({
      adminMode: !adminMode
    });
  },
}));