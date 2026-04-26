import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../store/gameStore';
import { GridCellView, CELL_SIZE } from './GridCell';
import {
  GRID_WIDTH,
  GRID_HEIGHT,
  canPlacePiece,
  getPieceInstancesOnGrid,
} from '../utils/gameHelpers';
import { PALETTE } from '../utils/pieceDefinitions';
import { TOKENS } from '../utils/theme';
import { GridPieceShape } from './GridPiece';
import { ScorePopupView } from './ScorePopup';

export const GameGrid: React.FC = () => {
  const { grid, lineClearAnimation, draggedPiece, previewPosition, theme, scorePopups, perfectClearAt } = useGameStore();
  const tokens = TOKENS[theme];
  const showPerfectFlash = perfectClearAt !== null && Date.now() - perfectClearAt < 1400;

  const previewCells = useMemo(() => {
    if (!draggedPiece || !previewPosition) return null;
    const valid = canPlacePiece(grid, draggedPiece, previewPosition.x, previewPosition.y);
    const map = new Map<string, string>();
    for (const [cx, cy] of draggedPiece.cells) {
      const gx = previewPosition.x + cx;
      const gy = previewPosition.y + cy;
      map.set(`${gx},${gy}`, valid ? PALETTE.outline : PALETTE.red);
    }
    return { map, valid };
  }, [draggedPiece, previewPosition, grid]);

  const pieceInstances = useMemo(() => getPieceInstancesOnGrid(grid), [grid]);

  const cellAnimating = (x: number, y: number): boolean => {
    if (!lineClearAnimation) return false;
    return lineClearAnimation.rows.includes(y) || lineClearAnimation.cols.includes(x);
  };

  const gridPixelW = GRID_WIDTH * CELL_SIZE;
  const gridPixelH = GRID_HEIGHT * CELL_SIZE;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      style={{
        display: 'inline-block',
        padding: 14,
        backgroundColor: tokens.gridBg,
        border: `3px solid ${tokens.gridBorder}`,
        borderRadius: 16,
        boxShadow:
          theme === 'dark'
            ? '0 10px 30px rgba(0, 0, 0, 0.4)'
            : '0 10px 30px rgba(30, 42, 74, 0.12), 0 2px 8px rgba(30, 42, 74, 0.08)',
      }}
    >
      <div
        style={{
          position: 'relative',
          padding: 6,
          backgroundColor: tokens.gridInner,
          borderRadius: 10,
          border: `2px solid ${tokens.gridBorder}`,
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${GRID_WIDTH}, ${CELL_SIZE}px)`,
            gridTemplateRows: `repeat(${GRID_HEIGHT}, ${CELL_SIZE}px)`,
            gap: 0,
          }}
        >
          {grid.map((row, y) =>
            row.map((cell, x) => {
              const previewKey = `${x},${y}`;
              const hasPreview = previewCells?.map.get(previewKey);
              return (
                <GridCellView
                  key={`${x}-${y}`}
                  x={x}
                  y={y}
                  cell={cell}
                  previewColor={hasPreview ? PALETTE.outline : null}
                  previewInvalid={previewCells ? !previewCells.valid : false}
                  isAnimating={cellAnimating(x, y)}
                  theme={theme}
                />
              );
            }),
          )}
        </div>

        {/* Illustrated-piece overlay. One clipPath per placed piece, clipped to
            the cells that remain after any line clears. */}
        <svg
          width={gridPixelW}
          height={gridPixelH}
          viewBox={`0 0 ${gridPixelW} ${gridPixelH}`}
          style={{
            position: 'absolute',
            top: 6,
            left: 6,
            pointerEvents: 'none',
            overflow: 'visible',
          }}
        >
          <defs>
            {pieceInstances.map((inst) => (
              <clipPath key={inst.pieceInstanceId} id={`clip-${inst.pieceInstanceId}`}>
                {inst.occupiedCells.map(([gx, gy], i) => {
                  const px = gx * CELL_SIZE;
                  const py = gy * CELL_SIZE;
                  return (
                    <rect key={i} x={px} y={py} width={CELL_SIZE} height={CELL_SIZE} />
                  );
                })}
              </clipPath>
            ))}
          </defs>
          {pieceInstances.map((inst) => {
            const tx = inst.originX * CELL_SIZE;
            const ty = inst.originY * CELL_SIZE;
            return (
              <g key={inst.pieceInstanceId} clipPath={`url(#clip-${inst.pieceInstanceId})`}>
                <g transform={`translate(${tx}, ${ty})`}>
                  <GridPieceShape shape={inst.shape} cellSize={CELL_SIZE} rotation={inst.rotation} rockyConfig={inst.rockyConfig} />
                </g>
              </g>
            );
          })}
        </svg>

        {/* Floating score popups */}
        <div
          style={{
            position: 'absolute',
            top: 6,
            left: 6,
            width: gridPixelW,
            height: gridPixelH,
            pointerEvents: 'none',
            overflow: 'visible',
          }}
        >
          <AnimatePresence>
            {scorePopups.map((p) => (
              <ScorePopupView key={p.id} popup={p} cellSize={CELL_SIZE} />
            ))}
          </AnimatePresence>
        </div>

        {/* Perfect-clear glow overlay */}
        <AnimatePresence>
          {showPerfectFlash && (
            <motion.div
              key={`perfect-${perfectClearAt}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.7, 0] }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.4, times: [0, 0.25, 1] }}
              style={{
                position: 'absolute',
                inset: 6,
                pointerEvents: 'none',
                borderRadius: 8,
                background:
                  'radial-gradient(circle at center, rgba(255,201,61,0.45) 0%, rgba(255,122,61,0.25) 40%, transparent 75%)',
                boxShadow: 'inset 0 0 60px rgba(255,201,61,0.5)',
              }}
            />
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};
