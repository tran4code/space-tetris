import React from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '../store/gameStore';
import { DraggablePiece } from './DraggablePiece';

export const PiecePanel: React.FC = () => {
  const { availablePieces, generateNewPieces } = useGameStore();

  return (
    <motion.div
      className="piece-panel"
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      style={{
        width: '350px',
        height: '650px',
        padding: '20px',
        backgroundColor: '#0a0a0a',
        border: '2px solid #1a1a3a',
        borderRadius: '8px',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
      }}
    >
      <h3
        style={{
          color: '#fff',
          textAlign: 'center',
          margin: '0 0 16px 0',
          fontSize: '18px',
          fontWeight: 'bold',
        }}
      >
        Available Pieces
      </h3>
      
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '12px',
          flex: 1,
          alignContent: 'start',
        }}
      >
        {availablePieces.map((piece, index) => (
          <DraggablePiece key={`piece-${index}`} piece={piece} index={index} />
        ))}
      </div>
      
      <motion.button
        onClick={generateNewPieces}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        style={{
          padding: '12px',
          backgroundColor: '#4ecdc4',
          color: '#000',
          border: 'none',
          borderRadius: '6px',
          fontSize: '14px',
          fontWeight: 'bold',
          cursor: 'pointer',
          marginTop: 'auto',
        }}
      >
        🔄 Refresh Pieces
      </motion.button>
    </motion.div>
  );
};