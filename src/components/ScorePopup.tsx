import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { ScorePopup as ScorePopupData, useGameStore } from '../store/gameStore';
import { PALETTE } from '../utils/pieceDefinitions';

const KIND_STYLES: Record<ScorePopupData['kind'], { color: string; size: number; weight: number; lift: number; duration: number }> = {
  place: { color: PALETTE.ink, size: 18, weight: 800, lift: 28, duration: 0.9 },
  clear: { color: PALETTE.orangeDk, size: 24, weight: 900, lift: 38, duration: 1.1 },
  combo: { color: PALETTE.red, size: 20, weight: 900, lift: 44, duration: 1.2 },
  bonus: { color: PALETTE.orangeDk, size: 22, weight: 900, lift: 36, duration: 1.0 },
  perfect: { color: PALETTE.orange, size: 36, weight: 900, lift: 0, duration: 1.6 },
};

interface Props {
  popup: ScorePopupData;
  cellSize: number;
}

export const ScorePopupView: React.FC<Props> = ({ popup, cellSize }) => {
  const removeScorePopup = useGameStore((s) => s.removeScorePopup);
  const style = KIND_STYLES[popup.kind];

  useEffect(() => {
    const t = setTimeout(() => removeScorePopup(popup.id), style.duration * 1000 + 100);
    return () => clearTimeout(t);
  }, [popup.id, removeScorePopup, style.duration]);

  // Center the popup on the given cell. (popup.x, popup.y) is in cell-units
  // pointing at the top-left of the cell, so add 0.5 cells to center.
  const left = (popup.x + 0.5) * cellSize;
  const top = (popup.y + 0.5) * cellSize;

  const isPerfect = popup.kind === 'perfect';

  return (
    <motion.div
      initial={{ opacity: 0, y: 4, scale: isPerfect ? 0.4 : 0.85 }}
      animate={{ opacity: 1, y: -style.lift, scale: 1 }}
      exit={{ opacity: 0, y: -style.lift - 10 }}
      transition={{ duration: style.duration, ease: 'easeOut' }}
      style={{
        position: 'absolute',
        left,
        top,
        transform: 'translate(-50%, -50%)',
        pointerEvents: 'none',
        textAlign: 'center',
        zIndex: 5,
        textShadow: isPerfect
          ? `0 2px 0 ${PALETTE.outline}, 0 0 22px rgba(255,122,61,0.55)`
          : `0 1px 0 ${PALETTE.cardBg}, 0 0 6px rgba(254,249,240,0.6)`,
      }}
    >
      {popup.label && (
        <div
          style={{
            color: style.color,
            fontWeight: style.weight,
            fontSize: style.size,
            letterSpacing: isPerfect ? 4 : 1.5,
            textTransform: 'uppercase',
            lineHeight: 1.05,
          }}
        >
          {popup.label}
        </div>
      )}
      {popup.value > 0 && (
        <div
          style={{
            color: style.color,
            fontWeight: style.weight,
            fontSize: style.size * (isPerfect ? 1.1 : 1),
            fontFamily: '"JetBrains Mono", ui-monospace, SFMono-Regular, monospace',
            lineHeight: 1.05,
          }}
        >
          +{popup.value}
        </div>
      )}
    </motion.div>
  );
};
