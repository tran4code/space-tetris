import React from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '../store/gameStore';

export const GameOver: React.FC = () => {
  const { score, linesCleared, level, resetGame } = useGameStore();

  return (
    <motion.div
      className="game-over"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(10, 10, 10, 0.95)',
        color: '#fff',
        zIndex: 1000,
        backdropFilter: 'blur(10px)',
      }}
    >
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        style={{
          textAlign: 'center',
          padding: '40px',
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          border: '2px solid #ff6b6b',
          borderRadius: '16px',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
        }}
      >
        <h1
          style={{
            fontSize: '3rem',
            fontWeight: 'bold',
            marginBottom: '1rem',
            color: '#ff6b6b',
          }}
        >
          🌌 Mission Failed 🌌
        </h1>
        
        <div
          style={{
            fontSize: '1.2rem',
            marginBottom: '2rem',
            color: '#ccc',
          }}
        >
          No more valid moves available!
        </div>
        
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '2rem',
            marginBottom: '2rem',
            fontSize: '1.1rem',
          }}
        >
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🏆</div>
            <div style={{ color: '#4ecdc4', fontWeight: 'bold', fontSize: '1.5rem' }}>
              {score.toLocaleString()}
            </div>
            <div style={{ color: '#888' }}>Final Score</div>
          </div>
          
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📊</div>
            <div style={{ color: '#ffe66d', fontWeight: 'bold', fontSize: '1.5rem' }}>
              {linesCleared}
            </div>
            <div style={{ color: '#888' }}>Lines Cleared</div>
          </div>
          
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🚀</div>
            <div style={{ color: '#74b9ff', fontWeight: 'bold', fontSize: '1.5rem' }}>
              {level}
            </div>
            <div style={{ color: '#888' }}>Level Reached</div>
          </div>
        </div>
        
        <motion.button
          onClick={resetGame}
          whileHover={{ scale: 1.05, boxShadow: '0 10px 30px rgba(78, 205, 196, 0.3)' }}
          whileTap={{ scale: 0.95 }}
          style={{
            padding: '16px 32px',
            fontSize: '1.2rem',
            fontWeight: 'bold',
            backgroundColor: '#4ecdc4',
            color: '#000',
            border: 'none',
            borderRadius: '12px',
            cursor: 'pointer',
            marginRight: '1rem',
          }}
        >
          🔄 Play Again
        </motion.button>
        
        <motion.button
          onClick={() => window.location.reload()}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          style={{
            padding: '16px 32px',
            fontSize: '1.2rem',
            fontWeight: 'bold',
            backgroundColor: 'transparent',
            color: '#fff',
            border: '2px solid #666',
            borderRadius: '12px',
            cursor: 'pointer',
          }}
        >
          🏠 Main Menu
        </motion.button>
      </motion.div>
    </motion.div>
  );
};