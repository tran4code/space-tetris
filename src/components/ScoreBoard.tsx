import React from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '../store/gameStore';

export const ScoreBoard: React.FC = () => {
  const { score, linesCleared, level, gameStatus } = useGameStore();

  return (
    <motion.div
      className="scoreboard"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '30px 40px',
        backgroundColor: '#0a0a0a',
        border: '2px solid #1a1a3a',
        borderRadius: '8px',
        color: '#fff',
        fontSize: '18px',
        fontWeight: 'bold',
        marginBottom: '20px',
        backgroundImage: `
          linear-gradient(45deg, rgba(120, 119, 198, 0.1) 0%, transparent 50%),
          linear-gradient(-45deg, rgba(255, 119, 198, 0.05) 0%, transparent 50%)
        `,
      }}
    >
      <div style={{ textAlign: 'center', minWidth: '120px' }}>
        <div style={{ fontSize: '14px', color: '#888', marginBottom: '8px' }}>
          Score
        </div>
        <motion.div
          key={score}
          initial={{ scale: 1.2, color: '#00ff00' }}
          animate={{ scale: 1, color: '#fff' }}
          transition={{ type: 'spring', stiffness: 300 }}
        >
          {score.toLocaleString()}
        </motion.div>
      </div>
      
      <div style={{ textAlign: 'center', minWidth: '120px' }}>
        <div style={{ fontSize: '14px', color: '#888', marginBottom: '8px' }}>
          Lines
        </div>
        <motion.div
          key={linesCleared}
          initial={{ scale: 1.2, color: '#00ff00' }}
          animate={{ scale: 1, color: '#fff' }}
          transition={{ type: 'spring', stiffness: 300 }}
        >
          {linesCleared}
        </motion.div>
      </div>
      
      <div style={{ textAlign: 'center', minWidth: '120px' }}>
        <div style={{ fontSize: '14px', color: '#888', marginBottom: '8px' }}>
          Level
        </div>
        <motion.div
          key={level}
          initial={{ scale: 1.2, color: '#00ff00' }}
          animate={{ scale: 1, color: '#fff' }}
          transition={{ type: 'spring', stiffness: 300 }}
        >
          {level}
        </motion.div>
      </div>
      
      <div style={{ textAlign: 'center', minWidth: '120px' }}>
        <div style={{ fontSize: '14px', color: '#888', marginBottom: '8px' }}>
          Status
        </div>
        <div
          style={{
            color: gameStatus === 'playing' ? '#00ff00' : 
                   gameStatus === 'paused' ? '#ffff00' : 
                   gameStatus === 'gameOver' ? '#ff0000' : '#888',
            textTransform: 'capitalize',
          }}
        >
          {gameStatus === 'gameOver' ? 'Game Over' : gameStatus}
        </div>
      </div>
    </motion.div>
  );
};