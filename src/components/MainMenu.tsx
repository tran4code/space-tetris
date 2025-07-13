import React from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '../store/gameStore';

export const MainMenu: React.FC = () => {
  const { startGame, toggleAdminMode } = useGameStore();

  return (
    <motion.div
      className="main-menu"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        backgroundColor: '#0a0a0a',
        color: '#fff',
        backgroundImage: `
          radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.3) 0%, transparent 50%),
          radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.15) 0%, transparent 50%),
          radial-gradient(circle at 40% 40%, rgba(120, 200, 255, 0.1) 0%, transparent 50%)
        `,
      }}
    >
      <motion.h1
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        style={{
          fontSize: '4rem',
          fontWeight: 'bold',
          marginBottom: '2rem',
          textAlign: 'center',
          background: 'linear-gradient(45deg, #4ecdc4, #44a08d)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}
      >
        🚀 Space Tetris 🌌
      </motion.h1>
      
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.5 }}
        style={{
          fontSize: '1.2rem',
          marginBottom: '3rem',
          textAlign: 'center',
          color: '#ccc',
          maxWidth: '600px',
          lineHeight: '1.6',
        }}
      >
        <p>🌍 Drag and drop space-themed pieces to fill rows and columns!</p>
        <p>
          <span 
            onClick={toggleAdminMode}
            style={{ cursor: 'pointer' }}
          >
            ⭐
          </span> Complete lines to score points and clear the galaxy!
        </p>
        <p>🛸 Pieces spawn with random rotations - hover and use arrow keys to rotate!</p>
        <p>🔄 ↑/→ = Clockwise | ↓/← = Counterclockwise</p>
      </motion.div>
      
      <motion.button
        onClick={startGame}
        whileHover={{ scale: 1.05, boxShadow: '0 10px 30px rgba(78, 205, 196, 0.3)' }}
        whileTap={{ scale: 0.95 }}
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.8 }}
        style={{
          padding: '16px 32px',
          fontSize: '1.5rem',
          fontWeight: 'bold',
          backgroundColor: '#4ecdc4',
          color: '#000',
          border: 'none',
          borderRadius: '12px',
          cursor: 'pointer',
          marginBottom: '2rem',
        }}
      >
        🚀 Start Mission
      </motion.button>
      
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 1.2 }}
        style={{
          fontSize: '0.9rem',
          color: '#666',
          textAlign: 'center',
        }}
      >
        <p>🎯 Score System: Single line (100) | Double (300) | Triple (500) | Quad (800)</p>
        <p>⌨️ Controls: Click & Drag | Arrow Keys to Rotate in Panel | ESC to Pause</p>
      </motion.div>
    </motion.div>
  );
};