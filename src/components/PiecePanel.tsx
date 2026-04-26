import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../store/gameStore';
import { DraggablePiece } from './DraggablePiece';
import { PALETTE, DEFAULT_ROCKY_CONFIG } from '../utils/pieceDefinitions';

const ARM_LABELS = ['UL', 'UR', 'LL', 'LM', 'LR'] as const;

const RockyArmEditor: React.FC = () => {
  const { bonusPiece, adjustBonusArm } = useGameStore();
  const cfg = bonusPiece?.customization?.rocky ?? DEFAULT_ROCKY_CONFIG;
  const totalCells = cfg.arms.reduce<number>((a, b) => a + b, 0) + 5;

  const ArmRow: React.FC<{ idx: number }> = ({ idx }) => {
    const len = cfg.arms[idx];
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 4,
          fontSize: 10,
          fontFamily: '"JetBrains Mono", ui-monospace, monospace',
        }}
      >
        <span style={{ color: PALETTE.ink, fontWeight: 700, width: 18, letterSpacing: 0.5 }}>{ARM_LABELS[idx]}</span>
        <button
          onClick={() => adjustBonusArm(idx, -1)}
          disabled={len === 0}
          style={{
            width: 18,
            height: 18,
            border: `1.5px solid ${PALETTE.outline}`,
            background: len === 0 ? '#eee' : PALETTE.cardBg,
            color: PALETTE.ink,
            borderRadius: 4,
            cursor: len === 0 ? 'not-allowed' : 'pointer',
            fontWeight: 800,
            fontSize: 12,
            lineHeight: 1,
            padding: 0,
          }}
          aria-label={`Shorten ${ARM_LABELS[idx]} arm`}
        >
          −
        </button>
        <span style={{ width: 12, textAlign: 'center', fontWeight: 800, color: PALETTE.ink }}>{len}</span>
        <button
          onClick={() => adjustBonusArm(idx, 1)}
          disabled={len === 2}
          style={{
            width: 18,
            height: 18,
            border: `1.5px solid ${PALETTE.outline}`,
            background: len === 2 ? '#eee' : PALETTE.cardBg,
            color: PALETTE.ink,
            borderRadius: 4,
            cursor: len === 2 ? 'not-allowed' : 'pointer',
            fontWeight: 800,
            fontSize: 12,
            lineHeight: 1,
            padding: 0,
          }}
          aria-label={`Extend ${ARM_LABELS[idx]} arm`}
        >
          +
        </button>
      </div>
    );
  };

  return (
    <div
      style={{
        marginTop: 6,
        padding: '8px 10px',
        background: 'rgba(255,122,61,0.07)',
        border: `1.5px dashed ${PALETTE.orange}`,
        borderRadius: 8,
        display: 'flex',
        flexDirection: 'column',
        gap: 4,
      }}
    >
      <div
        style={{
          fontSize: 9,
          letterSpacing: 1.2,
          color: PALETTE.orangeDk,
          fontWeight: 800,
          textTransform: 'uppercase',
          textAlign: 'center',
          marginBottom: 2,
        }}
      >
        Tweak limbs · {totalCells} cells
      </div>
      {[0, 1, 2, 3, 4].map((i) => (
        <ArmRow key={i} idx={i} />
      ))}
    </div>
  );
};

export const PiecePanel: React.FC = () => {
  const { availablePieces, bonusPiece, linesToNextBonus, bonusJustUnlocked } = useGameStore();

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      style={{
        width: 210,
        padding: 14,
        backgroundColor: PALETTE.cardBg,
        border: `3px solid ${PALETTE.outline}`,
        borderRadius: 16,
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        boxShadow: '0 10px 30px rgba(30,42,74,0.12)',
      }}
    >
      <div
        style={{
          textTransform: 'uppercase',
          fontSize: 11,
          letterSpacing: 2,
          fontWeight: 800,
          color: PALETTE.ink,
          textAlign: 'center',
          paddingBottom: 6,
          borderBottom: `2px solid ${PALETTE.outline}`,
        }}
      >
        Cargo Bay
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {availablePieces.map((piece, index) =>
          piece ? (
            <DraggablePiece key={piece.id} piece={piece} index={index} />
          ) : (
            <div
              key={`empty-${index}`}
              style={{
                minHeight: 110,
                borderRadius: 12,
                border: `2px dashed rgba(30,42,74,0.25)`,
                opacity: 0.4,
              }}
            />
          ),
        )}
      </div>

      {/* Bonus slot — milestone-gated ROCKY */}
      <div
        style={{
          marginTop: 6,
          paddingTop: 12,
          borderTop: `2px dashed ${PALETTE.outline}`,
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
        }}
      >
        <div
          style={{
            textTransform: 'uppercase',
            fontSize: 10,
            letterSpacing: 2,
            fontWeight: 800,
            color: PALETTE.orangeDk,
            textAlign: 'center',
          }}
        >
          Bonus Cargo
        </div>
        <AnimatePresence mode="wait">
          {bonusPiece ? (
            <motion.div
              key="unlocked"
              initial={
                bonusJustUnlocked
                  ? { scale: 0.6, opacity: 0, rotate: -8 }
                  : { opacity: 0 }
              }
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ type: 'spring', stiffness: 240, damping: 18 }}
              style={{
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                gap: 6,
              }}
            >
              <div
                style={{
                  borderRadius: 14,
                  boxShadow: `0 0 0 3px ${PALETTE.orange}, 0 8px 20px rgba(255,122,61,0.35)`,
                }}
              >
                <DraggablePiece piece={bonusPiece} index={999} />
              </div>
              {bonusPiece.shape === 'ROCKY' && <RockyArmEditor />}
            </motion.div>
          ) : (
            <motion.div
              key="locked"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{
                minHeight: 110,
                borderRadius: 12,
                border: `2px dashed ${PALETTE.orange}`,
                backgroundColor: 'rgba(255,122,61,0.06)',
                padding: 12,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                color: PALETTE.ink,
              }}
            >
              <div style={{ fontSize: 28, marginBottom: 4, opacity: 0.7 }}>✦</div>
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 800,
                  letterSpacing: 0.5,
                  marginBottom: 2,
                }}
              >
                {linesToNextBonus} line{linesToNextBonus === 1 ? '' : 's'} to go
              </div>
              <div style={{ fontSize: 9, color: PALETTE.grayDk, letterSpacing: 1 }}>
                ROCKY UNLOCKS
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};
