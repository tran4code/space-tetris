import React, { useRef, useEffect } from 'react';
import { useDrag } from 'react-dnd';
import { getEmptyImage } from 'react-dnd-html5-backend';
import { motion } from 'framer-motion';
import { PieceType, PALETTE } from '../utils/pieceDefinitions';
import { useGameStore } from '../store/gameStore';
import { GridPiece } from './GridPiece';
import { playPickup, unlockAudio } from '../utils/sound';

interface DraggablePieceProps {
  piece: PieceType;
  index: number;
}

const TRAY_CELL_SIZE = 28;

export const DraggablePiece: React.FC<DraggablePieceProps> = ({ piece, index }) => {
  const { setDraggedPiece } = useGameStore();
  const ref = useRef<HTMLDivElement>(null);
  const instanceId = `${piece.id}-${index}`;

  const [{ isDragging }, drag, preview] = useDrag(
    () => ({
      type: 'piece',
      item: { piece, pieceInstanceId: instanceId },
      collect: (monitor) => ({ isDragging: monitor.isDragging() }),
    }),
    [piece, index],
  );

  useEffect(() => {
    preview(getEmptyImage(), { captureDraggingState: true });
  }, [preview]);

  drag(ref);

  useEffect(() => {
    if (isDragging) {
      unlockAudio();
      playPickup();
      setDraggedPiece(piece, instanceId);
    } else {
      setDraggedPiece(null);
    }
  }, [isDragging, piece, instanceId, setDraggedPiece]);

  return (
    <motion.div
      ref={ref}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.97 }}
      animate={{ opacity: isDragging ? 0.25 : 1 }}
      transition={{ type: 'spring', stiffness: 320, damping: 22 }}
      style={{
        position: 'relative',
        cursor: isDragging ? 'grabbing' : 'grab',
        userSelect: 'none',
        padding: 12,
        paddingTop: 20,
        borderRadius: 12,
        backgroundColor: PALETTE.cardBg,
        border: `2px solid ${PALETTE.outline}`,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 6,
        minHeight: 110,
        justifyContent: 'center',
        boxShadow: '0 4px 12px rgba(30,42,74,0.08)',
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: 6,
          left: 8,
          backgroundColor: PALETTE.badge,
          color: PALETTE.ink,
          fontFamily: '"JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, monospace',
          fontWeight: 600,
          fontSize: 9,
          letterSpacing: 1.5,
          padding: '2px 6px',
          borderRadius: 4,
          border: `1px solid ${PALETTE.outline}`,
        }}
      >
        {piece.tetromino}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1 }}>
        <GridPiece shape={piece.shape} cellSize={TRAY_CELL_SIZE} rotation={piece.rotation} rockyConfig={piece.customization?.rocky} />
      </div>
      <div
        style={{
          fontSize: 11,
          fontWeight: 700,
          color: PALETTE.ink,
          textTransform: 'uppercase',
          letterSpacing: 0.5,
        }}
      >
        {piece.name}
      </div>
    </motion.div>
  );
};
