import React from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { AnimatePresence, motion } from 'framer-motion';
import { useGameStore } from './store/gameStore';
import { useKeyboardControls } from './hooks/useKeyboardControls';
import { MainMenu } from './components/MainMenu';
import { GameGrid } from './components/GameGrid';
import { PiecePanel } from './components/PiecePanel';
import { ScoreBoard } from './components/ScoreBoard';
import { GameOver } from './components/GameOver';
import { CustomDragLayer } from './components/CustomDragLayer';
import { PALETTE } from './utils/pieceDefinitions';
import { TOKENS } from './utils/theme';
import './App.css';

function App() {
  const { gameStatus, returnToMenu, resumeGame, theme } = useGameStore();
  const tokens = TOKENS[theme];
  useKeyboardControls();

  return (
    <div className="App" style={{ backgroundColor: tokens.pageBg, minHeight: '100vh', color: tokens.pageInk }}>
      <AnimatePresence mode="wait">
        {gameStatus === 'menu' && <MainMenu key="menu" />}

        {(gameStatus === 'playing' || gameStatus === 'paused') && (
          <DndProvider backend={HTML5Backend} key="game">
            <div
              style={{
                minHeight: '100vh',
                color: tokens.pageInk,
                padding: '20px 24px 40px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
              }}
            >
              <ScoreBoard />

              <div
                style={{
                  display: 'flex',
                  gap: 28,
                  alignItems: 'flex-start',
                  justifyContent: 'center',
                }}
              >
                <GameGrid />
                <PiecePanel />
              </div>

              <div
                style={{
                  marginTop: 14,
                  fontSize: 11,
                  color: tokens.pageMutedInk,
                  letterSpacing: 1.5,
                  textTransform: 'uppercase',
                }}
              >
                Drag pieces onto the grid • ESC to pause
              </div>

              <button
                onClick={returnToMenu}
                style={{
                  marginTop: 14,
                  padding: '6px 12px',
                  fontSize: 10,
                  letterSpacing: 1.5,
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  background: 'transparent',
                  color: tokens.pageMutedInk,
                  border: `1.5px solid ${tokens.pageMutedInk}`,
                  borderRadius: 4,
                  cursor: 'pointer',
                }}
              >
                Abort Mission
              </button>
            </div>

            {gameStatus === 'paused' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onClick={resumeGame}
                style={{
                  position: 'fixed',
                  inset: 0,
                  backgroundColor: tokens.overlayBg,
                  backdropFilter: 'blur(4px)',
                  zIndex: 900,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                }}
              >
                <div
                  style={{
                    backgroundColor: PALETTE.cardBg,
                    border: `3px solid ${PALETTE.outline}`,
                    borderRadius: 16,
                    padding: '28px 44px',
                    textAlign: 'center',
                  }}
                >
                  <div
                    style={{
                      fontSize: 11,
                      letterSpacing: 3,
                      color: PALETTE.grayDk,
                      fontWeight: 700,
                      marginBottom: 6,
                    }}
                  >
                    MISSION PAUSED
                  </div>
                  <div style={{ fontSize: 22, fontWeight: 900 }}>Tap to resume</div>
                </div>
              </motion.div>
            )}

            <CustomDragLayer />
          </DndProvider>
        )}

        {gameStatus === 'gameOver' && <GameOver key="gameOver" />}
      </AnimatePresence>
    </div>
  );
}

export default App;
