import React, { useRef } from 'react';
import { useDrop } from 'react-dnd';
import { motion } from 'framer-motion';
import { useGameStore } from '../store/gameStore';
import { canPlacePiece } from '../utils/gameHelpers';
import { PieceType, getPieceAnchorPoint } from '../utils/pieceDefinitions';

interface GridCellProps {
  x: number;
  y: number;
  content: string | null;
  color?: string | null;
  isAnimating?: boolean;
  isPreview?: boolean;
}

export const GridCell: React.FC<GridCellProps> = ({ x, y, content, color, isAnimating, isPreview }) => {
  const { grid, draggedPiece, draggedPieceInstanceId, placePieceOnGrid, setPreviewPosition } = useGameStore();
  const ref = useRef<HTMLDivElement>(null);


  const [{ isOver, canDrop }, drop] = useDrop(() => ({
    accept: 'piece',
    drop: (item: { piece: PieceType; pieceInstanceId: string }) => {
      // Find the best placement position based on where the user is dropping
      const bestPosition = findBestPlacementPosition(item.piece, x, y);
      if (bestPosition) {
        placePieceOnGrid(item.piece, bestPosition.x, bestPosition.y);
      }
    },
    canDrop: (item: { piece: PieceType; pieceInstanceId: string }) => {
      if (!draggedPiece) return false;
      const bestPosition = findBestPlacementPosition(draggedPiece, x, y);
      return bestPosition !== null;
    },
    hover: (item: { piece: PieceType; pieceInstanceId: string }, monitor) => {
      // Only respond to hover if this is the currently dragged piece instance
      if (draggedPiece && draggedPieceInstanceId === item.pieceInstanceId) {
        const bestPosition = findBestPlacementPosition(draggedPiece, x, y);
        if (bestPosition) {
          setPreviewPosition(bestPosition);
        } else {
          setPreviewPosition(null);
        }
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  }), [x, y, draggedPiece, draggedPieceInstanceId, grid, placePieceOnGrid, setPreviewPosition]);

  // Helper function to find the best placement position for a piece
  const findBestPlacementPosition = (piece: PieceType, hoverX: number, hoverY: number) => {
    if (!piece) return null;

    // Use piece-specific anchor point to calculate where the piece origin should be
    const anchorPoint = getPieceAnchorPoint(piece);
    
    // Calculate where the piece's top-left (origin) should be placed
    // so that the anchor point aligns with the mouse cursor
    const pieceOriginX = hoverX - anchorPoint.x;
    const pieceOriginY = hoverY - anchorPoint.y;
    
    if (pieceOriginX >= 0 && pieceOriginY >= 0 && canPlacePiece(grid, piece, pieceOriginX, pieceOriginY)) {
      return { x: pieceOriginX, y: pieceOriginY };
    }

    // If the direct position doesn't work, don't show any highlighting
    return null;
  };

  // Connect the drop ref
  drop(ref);


  const getCellClass = () => {
    let classes = 'grid-cell';
    
    if (isPreview && draggedPiece) {
      // If it's a preview cell, it's already validated as placeable
      classes += ' preview-valid';
    } else if (isOver) {
      // Only show drop feedback on non-preview cells
      if (canDrop) {
        classes += ' can-drop';
      } else {
        classes += ' cannot-drop';
      }
    }
    
    if (content && !isPreview) {
      classes += ' occupied';
    }
    
    return classes;
  };

  return (
    <motion.div
      ref={ref}
      className={getCellClass()}
      initial={false}
      animate={isAnimating ? {
        backgroundColor: ['#ffffff', '#000000'],
        opacity: [1, 0]
      } : {}}
      transition={{ duration: 0.5 }}
      style={{
        width: '40px',
        height: '40px',
        border: '1px solid #1a1a3a',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '24px',
        backgroundColor: content ? (isPreview ? 'transparent' : color ? `${color}99` : '#2a2a2a') : 'transparent',
        position: 'relative',
        opacity: isPreview ? 0.8 : 1,
      }}
    >
      {content}
    </motion.div>
  );
};