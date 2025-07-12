import React from 'react';
import { useDragLayer } from 'react-dnd';
import { PieceType, getPieceAnchorPoint } from '../utils/pieceDefinitions';

const layerStyles: React.CSSProperties = {
  position: 'fixed',
  pointerEvents: 'none',
  zIndex: 100,
  left: 0,
  top: 0,
  width: '100%',
  height: '100%',
};

function getItemStyles(initialOffset: any, currentOffset: any, piece?: PieceType) {
  if (!currentOffset) {
    return {
      display: 'none',
    };
  }

  // Simply use the current mouse position
  const { x, y } = currentOffset;
  
  // Calculate piece offset using piece-specific anchor points
  let centerOffsetX = 0;
  let centerOffsetY = 0;
  
  if (piece) {
    const anchorPoint = getPieceAnchorPoint(piece);
    const cellSize = 40; // 40px per cell
    
    // Calculate offset based on the anchor point
    centerOffsetX = -anchorPoint.x * cellSize;
    centerOffsetY = -anchorPoint.y * cellSize;
  }

  const transform = `translate(${x + centerOffsetX}px, ${y + centerOffsetY}px)`;
  return {
    transform,
    WebkitTransform: transform,
  };
}

const PiecePreview: React.FC<{ piece: PieceType }> = ({ piece }) => {
  return (
    <div 
      style={{ 
        display: 'grid', 
        gap: '1px',
        filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.4))',
      }}
    >
      {piece.shape.map((row, y) => (
        <div key={y} style={{ display: 'flex', gap: '1px' }}>
          {row.map((cell, x) => (
            <div
              key={x}
              style={{
                width: '40px', // Same size as grid cells
                height: '40px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '24px', // Same size as grid cells
                backgroundColor: cell ? piece.color : 'transparent',
                border: cell ? '2px solid rgba(255,255,255,0.6)' : 'none',
                borderRadius: '4px',
                boxShadow: cell ? '0 2px 8px rgba(0,0,0,0.3)' : 'none',
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

export const CustomDragLayer: React.FC = () => {
  const { itemType, isDragging, item, initialOffset, currentOffset } = useDragLayer((monitor) => ({
    item: monitor.getItem(),
    itemType: monitor.getItemType(),
    initialOffset: monitor.getInitialSourceClientOffset(),
    currentOffset: monitor.getClientOffset(), // Use actual mouse position
    isDragging: monitor.isDragging(),
  }));

  function renderItem() {
    switch (itemType) {
      case 'piece':
        return <PiecePreview piece={item.piece} />;
      default:
        return null;
    }
  }

  if (!isDragging) {
    return null;
  }

  return (
    <div style={layerStyles}>
      <div style={getItemStyles(initialOffset, currentOffset, item?.piece)}>
        {renderItem()}
      </div>
    </div>
  );
};