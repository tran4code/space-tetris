import React from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '../store/gameStore';
import { PALETTE } from '../utils/pieceDefinitions';

export const GameOver: React.FC = () => {
  const { score, linesCleared, best, resetGame, returnToMenu } = useGameStore();
  const isBest = score > 0 && score >= best;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: 'fixed',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(240, 238, 233, 0.88)',
        backdropFilter: 'blur(6px)',
        zIndex: 1000,
      }}
    >
      <motion.div
        initial={{ y: 20, scale: 0.95 }}
        animate={{ y: 0, scale: 1 }}
        transition={{ duration: 0.4 }}
        style={{
          backgroundColor: PALETTE.cardBg,
          border: `3px solid ${PALETTE.outline}`,
          borderRadius: 18,
          padding: '36px 48px',
          textAlign: 'center',
          maxWidth: 460,
          boxShadow: '0 20px 60px rgba(30,42,74,0.25)',
        }}
      >
        <div
          style={{
            fontFamily: '"JetBrains Mono", ui-monospace, SFMono-Regular, monospace',
            fontSize: 11,
            letterSpacing: 3,
            backgroundColor: PALETTE.badge,
            border: `1.5px solid ${PALETTE.outline}`,
            padding: '4px 10px',
            borderRadius: 4,
            display: 'inline-block',
            marginBottom: 16,
            fontWeight: 700,
          }}
        >
          SPLASHDOWN
        </div>

        <h2 style={{ fontSize: '2.2rem', fontWeight: 900, marginBottom: 8, color: PALETTE.ink }}>
          {isBest ? 'New Best!' : 'Mission Complete'}
        </h2>
        <p style={{ color: PALETTE.grayDk, marginBottom: 24, fontSize: 14 }}>
          No more pieces fit. The board is locked.
        </p>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 12,
            marginBottom: 28,
          }}
        >
          <div
            style={{
              padding: 12,
              border: `2px solid ${PALETTE.outline}`,
              borderRadius: 10,
              backgroundColor: '#fff',
            }}
          >
            <div style={{ fontSize: 10, color: PALETTE.grayDk, letterSpacing: 2, fontWeight: 700 }}>SCORE</div>
            <div style={{ fontSize: 22, fontWeight: 900, color: PALETTE.orangeDk }}>
              {score.toLocaleString()}
            </div>
          </div>
          <div
            style={{
              padding: 12,
              border: `2px solid ${PALETTE.outline}`,
              borderRadius: 10,
              backgroundColor: '#fff',
            }}
          >
            <div style={{ fontSize: 10, color: PALETTE.grayDk, letterSpacing: 2, fontWeight: 700 }}>LINES</div>
            <div style={{ fontSize: 22, fontWeight: 900 }}>{linesCleared}</div>
          </div>
          <div
            style={{
              padding: 12,
              border: `2px solid ${PALETTE.outline}`,
              borderRadius: 10,
              backgroundColor: '#fff',
            }}
          >
            <div style={{ fontSize: 10, color: PALETTE.grayDk, letterSpacing: 2, fontWeight: 700 }}>BEST</div>
            <div style={{ fontSize: 22, fontWeight: 900 }}>{Math.max(score, best).toLocaleString()}</div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
          <motion.button
            onClick={resetGame}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.96 }}
            style={{
              padding: '12px 24px',
              fontSize: 14,
              fontWeight: 800,
              letterSpacing: 1.5,
              textTransform: 'uppercase',
              backgroundColor: PALETTE.orange,
              color: PALETTE.ink,
              border: `2.5px solid ${PALETTE.outline}`,
              borderRadius: 8,
              cursor: 'pointer',
            }}
          >
            Relaunch
          </motion.button>
          <motion.button
            onClick={returnToMenu}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.96 }}
            style={{
              padding: '12px 24px',
              fontSize: 14,
              fontWeight: 800,
              letterSpacing: 1.5,
              textTransform: 'uppercase',
              backgroundColor: 'transparent',
              color: PALETTE.ink,
              border: `2.5px solid ${PALETTE.outline}`,
              borderRadius: 8,
              cursor: 'pointer',
            }}
          >
            Menu
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
};
