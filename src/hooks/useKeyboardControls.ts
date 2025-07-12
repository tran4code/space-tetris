import { useEffect } from 'react';
import { useGameStore } from '../store/gameStore';

export const useKeyboardControls = () => {
  const { gameStatus, pauseGame, resumeGame, selectedPiece, rotateSelectedPiece } = useGameStore();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.key) {
        case 'Escape':
          if (gameStatus === 'playing') {
            pauseGame();
          } else if (gameStatus === 'paused') {
            resumeGame();
          }
          break;
        
        case 'ArrowUp':
        case 'ArrowRight':
          // Rotate clockwise
          if (gameStatus === 'playing' && selectedPiece) {
            rotateSelectedPiece('clockwise');
            event.preventDefault();
          }
          break;
        
        case 'ArrowDown':
        case 'ArrowLeft':
          // Rotate counterclockwise
          if (gameStatus === 'playing' && selectedPiece) {
            rotateSelectedPiece('counterclockwise');
            event.preventDefault();
          }
          break;
        
        case ' ': // Spacebar
          if (gameStatus === 'paused') {
            resumeGame();
            event.preventDefault();
          }
          break;
          
        default:
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [gameStatus, selectedPiece, pauseGame, resumeGame, rotateSelectedPiece]);
};