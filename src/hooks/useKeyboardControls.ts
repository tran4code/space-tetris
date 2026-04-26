import { useEffect } from 'react';
import { useGameStore } from '../store/gameStore';

export const useKeyboardControls = () => {
  const { gameStatus, pauseGame, resumeGame } = useGameStore();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' || event.key === ' ') {
        if (gameStatus === 'playing') pauseGame();
        else if (gameStatus === 'paused') resumeGame();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [gameStatus, pauseGame, resumeGame]);
};
