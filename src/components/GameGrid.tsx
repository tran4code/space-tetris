import React from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '../store/gameStore';
import { GridCell } from './GridCell';
import { GRID_WIDTH, GRID_HEIGHT } from '../utils/gameHelpers';

export const GameGrid: React.FC = () => {
  const { grid, lineClearAnimation, draggedPiece, previewPosition } = useGameStore();

  const isAnimatingCell = (x: number, y: number): boolean => {
    if (!lineClearAnimation) return false;
    return lineClearAnimation.rows.includes(y) || lineClearAnimation.cols.includes(x);
  };

  const isPreviewCell = (x: number, y: number): boolean => {
    if (!draggedPiece || !previewPosition) return false;
    
    for (let py = 0; py < draggedPiece.shape.length; py++) {
      for (let px = 0; px < draggedPiece.shape[py].length; px++) {
        if (draggedPiece.shape[py][px] === 1) {
          const gridX = previewPosition.x + px;
          const gridY = previewPosition.y + py;
          if (gridX === x && gridY === y) {
            return true;
          }
        }
      }
    }
    return false;
  };

  const getPreviewEmoji = (x: number, y: number): string | null => {
    if (!draggedPiece || !previewPosition) return null;
    
    for (let py = 0; py < draggedPiece.shape.length; py++) {
      for (let px = 0; px < draggedPiece.shape[py].length; px++) {
        if (draggedPiece.shape[py][px] === 1) {
          const gridX = previewPosition.x + px;
          const gridY = previewPosition.y + py;
          if (gridX === x && gridY === y) {
            return draggedPiece.emoji;
          }
        }
      }
    }
    return null;
  };

  return (
    <motion.div
      className="game-grid"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${GRID_WIDTH}, 40px)`,
        gridTemplateRows: `repeat(${GRID_HEIGHT}, 40px)`,
        gap: '1px',
        padding: '20px',
        backgroundColor: '#0a0a0a',
        border: '2px solid #1a1a3a',
        borderRadius: '8px',
        position: 'relative',
        backgroundImage: `
          radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.3) 0%, transparent 50%),
          radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.15) 0%, transparent 50%),
          radial-gradient(circle at 40% 40%, rgba(120, 200, 255, 0.1) 0%, transparent 50%)
        `,
      }}
    >
      {/* Stars background */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: `
            radial-gradient(1px 1px at 20px 30px, white, transparent),
            radial-gradient(1px 1px at 40px 70px, white, transparent),
            radial-gradient(2px 2px at 90px 40px, white, transparent),
            radial-gradient(1px 1px at 130px 80px, white, transparent),
            radial-gradient(2px 2px at 160px 30px, white, transparent)
          `,
          opacity: 0.4,
          pointerEvents: 'none',
        }}
      />
      
      {grid.map((row, y) =>
        row.map((cell, x) => {
          const previewEmoji = getPreviewEmoji(x, y);
          const displayContent = cell || (isPreviewCell(x, y) ? previewEmoji : null);
          
          return (
            <GridCell
              key={`${x}-${y}`}
              x={x}
              y={y}
              content={displayContent}
              isAnimating={isAnimatingCell(x, y)}
              isPreview={isPreviewCell(x, y)}
            />
          );
        })
      )}
    </motion.div>
  );
};