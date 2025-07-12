import React from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { AnimatePresence } from 'framer-motion';
import { useGameStore } from './store/gameStore';
import { useKeyboardControls } from './hooks/useKeyboardControls';
import { MainMenu } from './components/MainMenu';
import { GameGrid } from './components/GameGrid';
import { PiecePanel } from './components/PiecePanel';
import { ScoreBoard } from './components/ScoreBoard';
import { GameOver } from './components/GameOver';
import { CustomDragLayer } from './components/CustomDragLayer';
import { ProgressiveImage } from './components/ProgressiveImage';
import './App.css';

function App() {
  const { gameStatus, score, availablePoints, spendPoints } = useGameStore();
  useKeyboardControls();

  return (
    <div className="App">
      <AnimatePresence mode="wait">
        {gameStatus === 'menu' && <MainMenu key="menu" />}
        
        {(gameStatus === 'playing' || gameStatus === 'paused') && (
          <DndProvider backend={HTML5Backend} key="game">
            <div
              style={{
                minHeight: '100vh',
                backgroundColor: '#0a0a0a',
                color: '#fff',
                padding: '10px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
              }}
            >
              <ScoreBoard />
              
              <div
                style={{
                  display: 'flex',
                  gap: '30px',
                  alignItems: 'flex-start',
                  justifyContent: 'center',
                  flex: 1,
                }}
              >
                <ProgressiveImage 
                  score={score} 
                  availablePoints={availablePoints}
                  onPointsSpent={spendPoints}
                />
                <GameGrid />
                <PiecePanel />
              </div>
              
              {gameStatus === 'paused' && (
                <div
                  style={{
                    position: 'fixed',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    color: '#fff',
                    padding: '40px',
                    borderRadius: '16px',
                    textAlign: 'center',
                    fontSize: '1.5rem',
                    fontWeight: 'bold',
                    zIndex: 1000,
                  }}
                >
                  ⏸️ Game Paused
                  <div style={{ fontSize: '1rem', marginTop: '16px', color: '#ccc' }}>
                    Press ESC or SPACE to resume
                  </div>
                </div>
              )}
            </div>
            <CustomDragLayer />
          </DndProvider>
        )}
        
        {gameStatus === 'gameOver' && <GameOver key="gameOver" />}
      </AnimatePresence>
    </div>
  );
}

export default App;
