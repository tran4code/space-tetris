import React, { useRef, useEffect } from 'react';
import { useDrag } from 'react-dnd';
import { getEmptyImage } from 'react-dnd-html5-backend';
import { motion } from 'framer-motion';
import { PieceType } from '../utils/pieceDefinitions';
import { useGameStore } from '../store/gameStore';

interface DraggablePieceProps {
  piece: PieceType;
  index: number;
}

export const DraggablePiece: React.FC<DraggablePieceProps> = ({ piece, index }) => {
  const { selectPiece, setDraggedPiece, selectedPiece } = useGameStore();
  const ref = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = React.useState(false);

  const [{ isDragging }, drag, preview] = useDrag(() => ({
    type: 'piece',
    item: { piece, pieceInstanceId: `${piece.id}-${index}` }, // Add unique instance ID
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }), [piece, index]);

  // Use empty image as drag preview to hide the default preview
  useEffect(() => {
    preview(getEmptyImage(), { captureDraggingState: true });
  }, [preview]);

  // Connect the drag ref
  drag(ref);

  React.useEffect(() => {
    if (isDragging) {
      setDraggedPiece(piece, `${piece.id}-${index}`);
    } else {
      setDraggedPiece(null);
    }
  }, [isDragging, piece, index, setDraggedPiece]);

  const isSelected = selectedPiece?.id === piece.id;

  const renderPieceShape = (isHovered: boolean) => {
    return (
      <div style={{ display: 'grid', gap: '1px' }}>
        {piece.shape.map((row, y) => (
          <div key={y} style={{ display: 'flex', gap: '1px' }}>
            {row.map((cell, x) => (
              <div
                key={x}
                style={{
                  width: '30px',
                  height: '30px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '20px',
                  backgroundColor: cell ? piece.color : 'transparent',
                  border: cell ? '2px solid rgba(255,255,255,0.4)' : 'none',
                  borderRadius: '4px',
                  boxShadow: cell ? '0 2px 8px rgba(0,0,0,0.3)' : 'none',
                  outline: cell && (isHovered || isSelected) ? '2px solid rgba(255,255,255,0.5)' : 'none',
                  outlineOffset: cell && (isHovered || isSelected) ? '2px' : '0px',
                  transition: 'all 0.2s ease',
                }}
              >
                {cell ? piece.emoji : ''}
              </div>
            ))}
          </div>
        ))}
      </div>
    );
  };

  return (
    <motion.div
      ref={ref}
      className={`draggable-piece ${isSelected ? 'selected' : ''}`}
      onClick={() => selectPiece(piece)}
      onMouseEnter={() => {
        selectPiece(piece);
        setIsHovered(true);
      }}
      onMouseLeave={() => {
        setIsHovered(false);
      }}
      whileTap={{ scale: 0.95 }}
      animate={{
        opacity: isDragging ? 0.3 : 1,
      }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      style={{
        margin: '8px',
        cursor: isDragging ? 'grabbing' : 'grab',
        userSelect: 'none',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '4px',
        padding: '4px',
        borderRadius: '4px',
        backgroundColor: 'transparent', // Remove card background
        border: '2px solid transparent', // Remove card border
      }}
    >
      {renderPieceShape(isHovered)}
      <div
        style={{
          fontSize: '10px',
          color: '#888',
          textAlign: 'center',
          fontWeight: 'bold',
        }}
      >
        {piece.name}
      </div>
    </motion.div>
  );
};