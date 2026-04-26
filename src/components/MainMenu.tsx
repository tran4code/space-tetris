import React from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '../store/gameStore';
import { PALETTE } from '../utils/pieceDefinitions';
import { TOKENS } from '../utils/theme';
import { GridPiece } from './GridPiece';

export const MainMenu: React.FC = () => {
  const { startGame, best, theme, toggleTheme } = useGameStore();
  const tokens = TOKENS[theme];

  const previewShapes = ['PLANET', 'ROCKET', 'ASTRONAUT', 'STATION', 'COMET', 'MOON'] as const;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        minHeight: '100vh',
        backgroundColor: tokens.pageBg,
        color: tokens.pageInk,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 40,
        position: 'relative',
      }}
    >
      <button
        onClick={toggleTheme}
        aria-label="Toggle theme"
        style={{
          position: 'absolute',
          top: 20,
          right: 20,
          padding: '8px 14px',
          fontSize: 10,
          letterSpacing: 2,
          fontWeight: 700,
          textTransform: 'uppercase',
          background: PALETTE.cardBg,
          color: PALETTE.ink,
          border: `2px solid ${PALETTE.outline}`,
          borderRadius: 8,
          cursor: 'pointer',
        }}
      >
        {theme === 'dark' ? '☀ Light' : '☾ Dark'}
      </button>
      <motion.div
        initial={{ y: -12, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.5 }}
        style={{
          fontFamily: '"JetBrains Mono", ui-monospace, SFMono-Regular, monospace',
          fontSize: 11,
          letterSpacing: 3,
          backgroundColor: PALETTE.badge,
          border: `1.5px solid ${PALETTE.outline}`,
          padding: '4px 10px',
          borderRadius: 4,
          marginBottom: 18,
          fontWeight: 700,
        }}
      >
        MISSION: ARTEMIS II
      </motion.div>

      <motion.h1
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.6 }}
        style={{
          fontSize: '3.8rem',
          fontWeight: 900,
          marginBottom: 8,
          textAlign: 'center',
          letterSpacing: -1,
          color: tokens.pageInk,
        }}
      >
        Orbit Blocks
      </motion.h1>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.35, duration: 0.5 }}
        style={{
          fontSize: '1.1rem',
          color: tokens.pageMutedInk,
          textAlign: 'center',
          maxWidth: 560,
          marginBottom: 32,
          lineHeight: 1.5,
        }}
      >
        A chill drag-to-fit puzzle. Pack spacecraft, planets and astronauts into
        a 10&times;10 grid. Clear rows and columns to deep-space-clean the board.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.5 }}
        style={{
          display: 'flex',
          gap: 18,
          flexWrap: 'wrap',
          justifyContent: 'center',
          alignItems: 'center',
          marginBottom: 36,
          maxWidth: 620,
        }}
      >
        {previewShapes.map((s) => (
          <div
            key={s}
            style={{
              padding: 10,
              backgroundColor: PALETTE.cardBg,
              border: `2px solid ${PALETTE.outline}`,
              borderRadius: 10,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minWidth: 70,
              minHeight: 70,
            }}
          >
            <GridPiece shape={s} cellSize={22} />
          </div>
        ))}
      </motion.div>

      <motion.button
        onClick={startGame}
        whileHover={{ y: -2, boxShadow: '0 10px 24px rgba(30,42,74,0.25)' }}
        whileTap={{ scale: 0.97 }}
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.7, duration: 0.5 }}
        style={{
          padding: '14px 38px',
          fontSize: '1.1rem',
          fontWeight: 800,
          letterSpacing: 2,
          textTransform: 'uppercase',
          backgroundColor: PALETTE.orange,
          color: PALETTE.ink,
          border: `2.5px solid ${PALETTE.outline}`,
          borderRadius: 10,
          cursor: 'pointer',
          marginBottom: 18,
          boxShadow: '0 6px 16px rgba(30,42,74,0.18)',
        }}
      >
        Launch
      </motion.button>

      {best > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
          style={{
            fontSize: 13,
            color: tokens.pageMutedInk,
            letterSpacing: 1,
          }}
        >
          Personal best: <strong style={{ color: tokens.pageInk }}>{best.toLocaleString()}</strong>
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.0 }}
        style={{
          marginTop: 28,
          fontSize: 12,
          color: tokens.pageMutedInk,
          textAlign: 'center',
          lineHeight: 1.6,
        }}
      >
        Drag pieces from Cargo Bay &bull; clear full rows/cols for bonus &bull; ESC to pause
      </motion.div>
    </motion.div>
  );
};
