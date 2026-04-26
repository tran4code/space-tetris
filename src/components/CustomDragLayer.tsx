import React from 'react';
import { useDragLayer } from 'react-dnd';
import { PieceType, PALETTE } from '../utils/pieceDefinitions';
import { GridPiece } from './GridPiece';
import { CELL_SIZE } from './GridCell';

const layerStyles: React.CSSProperties = {
  position: 'fixed',
  pointerEvents: 'none',
  zIndex: 100,
  left: 0,
  top: 0,
  width: '100%',
  height: '100%',
};

function getItemStyles(currentOffset: { x: number; y: number } | null, piece?: PieceType) {
  if (!currentOffset || !piece) return { display: 'none' } as const;
  const anchorX = Math.floor(piece.w / 2);
  const anchorY = Math.floor(piece.h / 2);
  const offsetX = -anchorX * CELL_SIZE - CELL_SIZE / 2;
  const offsetY = -anchorY * CELL_SIZE - CELL_SIZE / 2;
  const transform = `translate(${currentOffset.x + offsetX}px, ${currentOffset.y + offsetY}px)`;
  return { transform, WebkitTransform: transform };
}

export const CustomDragLayer: React.FC = () => {
  const { itemType, isDragging, item, currentOffset } = useDragLayer((monitor) => ({
    item: monitor.getItem(),
    itemType: monitor.getItemType(),
    currentOffset: monitor.getClientOffset(),
    isDragging: monitor.isDragging(),
  }));

  if (!isDragging || itemType !== 'piece') return null;

  return (
    <div style={layerStyles}>
      <div
        style={{
          ...getItemStyles(currentOffset, item?.piece),
          filter: `drop-shadow(0 8px 14px rgba(30, 42, 74, 0.35))`,
        }}
      >
        <GridPiece shape={item.piece.shape} cellSize={CELL_SIZE} rotation={item.piece.rotation} rockyConfig={item.piece.customization?.rocky} />
        <div
          style={{
            position: 'absolute',
            top: -18,
            left: '50%',
            transform: 'translateX(-50%)',
            background: PALETTE.outline,
            color: PALETTE.cardBg,
            padding: '2px 8px',
            borderRadius: 4,
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: 1,
            whiteSpace: 'nowrap',
            textTransform: 'uppercase',
            opacity: 0.85,
          }}
        >
          {item.piece.name}
        </div>
      </div>
    </div>
  );
};
