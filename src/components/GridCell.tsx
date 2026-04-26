import React, { useRef } from 'react';
import { useDrop } from 'react-dnd';
import { motion } from 'framer-motion';
import { useGameStore } from '../store/gameStore';
import { canPlacePiece, GridCell as Cell } from '../utils/gameHelpers';
import { PieceType, PALETTE } from '../utils/pieceDefinitions';
import { TOKENS, Theme } from '../utils/theme';

export const CELL_SIZE = 44;

interface GridCellProps {
  x: number;
  y: number;
  cell: Cell;
  previewColor: string | null;
  previewInvalid: boolean;
  isAnimating: boolean;
  theme: Theme;
}

export const GridCellView: React.FC<GridCellProps> = ({
  x,
  y,
  cell,
  previewColor,
  previewInvalid,
  isAnimating,
  theme,
}) => {
  const { grid, draggedPiece, draggedPieceInstanceId, placePieceOnGrid, setPreviewPosition } =
    useGameStore();
  const ref = useRef<HTMLDivElement>(null);
  const tokens = TOKENS[theme];

  const findBestPlacement = (piece: PieceType, hoverX: number, hoverY: number) => {
    const anchorX = Math.floor(piece.w / 2);
    const anchorY = Math.floor(piece.h / 2);
    const ox = hoverX - anchorX;
    const oy = hoverY - anchorY;
    if (canPlacePiece(grid, piece, ox, oy)) return { x: ox, y: oy };
    return null;
  };

  const [, drop] = useDrop(
    () => ({
      accept: 'piece',
      drop: (item: { piece: PieceType; pieceInstanceId: string }) => {
        const pos = findBestPlacement(item.piece, x, y);
        if (pos) placePieceOnGrid(item.piece, pos.x, pos.y);
      },
      canDrop: (item: { piece: PieceType; pieceInstanceId: string }) => {
        return findBestPlacement(item.piece, x, y) !== null;
      },
      hover: (item: { piece: PieceType; pieceInstanceId: string }) => {
        if (draggedPiece && draggedPieceInstanceId === item.pieceInstanceId) {
          const pos = findBestPlacement(draggedPiece, x, y);
          setPreviewPosition(pos);
        }
      },
      collect: () => ({}),
    }),
    [x, y, draggedPiece, draggedPieceInstanceId, grid, placePieceOnGrid, setPreviewPosition],
  );

  drop(ref);

  const emptyBg = (x + y) % 2 === 0 ? tokens.cellEven : tokens.cellOdd;

  return (
    <motion.div
      ref={ref}
      initial={false}
      animate={
        isAnimating && cell
          ? {
              backgroundColor: [cell.color, PALETTE.outline, '#ffffff', cell.color],
              scale: [1, 1.08, 1, 1],
            }
          : {}
      }
      transition={{ duration: 0.4 }}
      style={{
        width: CELL_SIZE,
        height: CELL_SIZE,
        position: 'relative',
        backgroundColor: cell ? cell.color : emptyBg,
        border: previewColor
          ? `2px dashed ${previewInvalid ? PALETTE.red : PALETTE.outline}`
          : `1px solid ${tokens.cellBorder}`,
        boxSizing: 'border-box',
        opacity: !cell && previewColor ? 0.7 : 1,
      }}
    />
  );
};
