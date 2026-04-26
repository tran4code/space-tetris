import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../store/gameStore';
import { PALETTE } from '../utils/pieceDefinitions';

const Stat: React.FC<{ label: string; value: React.ReactNode; accent?: string }> = ({
  label,
  value,
  accent,
}) => (
  <div
    style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-start',
      padding: '8px 18px',
      borderRight: `2px solid ${PALETTE.outline}`,
      minWidth: 110,
    }}
  >
    <div
      style={{
        fontSize: 10,
        letterSpacing: 2,
        fontWeight: 700,
        color: PALETTE.grayDk,
        textTransform: 'uppercase',
        marginBottom: 4,
      }}
    >
      {label}
    </div>
    <div
      style={{
        fontSize: 22,
        fontWeight: 900,
        color: accent || PALETTE.ink,
        fontFamily: '"JetBrains Mono", ui-monospace, SFMono-Regular, monospace',
      }}
    >
      {value}
    </div>
  </div>
);

const SoundToggle: React.FC = () => {
  const { soundOn, toggleSound } = useGameStore();
  return (
    <button
      onClick={toggleSound}
      aria-label={soundOn ? 'Mute sound' : 'Unmute sound'}
      title={soundOn ? 'Mute' : 'Unmute'}
      style={{
        width: 36,
        height: 36,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: PALETTE.cardBg,
        color: PALETTE.ink,
        border: `2px solid ${PALETTE.outline}`,
        borderRadius: 8,
        cursor: 'pointer',
        padding: 0,
      }}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <path
          d="M5 9h3l5-4v14l-5-4H5z"
          fill={PALETTE.white}
          stroke={PALETTE.outline}
          strokeWidth="2"
          strokeLinejoin="round"
        />
        {soundOn ? (
          <>
            <path d="M16 9c1.5 1 1.5 5 0 6" stroke={PALETTE.outline} strokeWidth="2" strokeLinecap="round" fill="none" />
            <path d="M19 6c3 2.5 3 9.5 0 12" stroke={PALETTE.outline} strokeWidth="2" strokeLinecap="round" fill="none" />
          </>
        ) : (
          <>
            <line x1="16" y1="8" x2="22" y2="14" stroke={PALETTE.red} strokeWidth="2.5" strokeLinecap="round" />
            <line x1="22" y1="8" x2="16" y2="14" stroke={PALETTE.red} strokeWidth="2.5" strokeLinecap="round" />
          </>
        )}
      </svg>
    </button>
  );
};

const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useGameStore();
  const isDark = theme === 'dark';
  return (
    <button
      onClick={toggleTheme}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      style={{
        width: 36,
        height: 36,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: isDark ? PALETTE.night : PALETTE.badge,
        color: PALETTE.ink,
        border: `2px solid ${PALETTE.outline}`,
        borderRadius: 8,
        cursor: 'pointer',
        padding: 0,
      }}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {isDark ? (
        // moon icon
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <path
            d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5Z"
            fill={PALETTE.white}
            stroke={PALETTE.outline}
            strokeWidth="2"
            strokeLinejoin="round"
          />
        </svg>
      ) : (
        // sun icon
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="4" fill={PALETTE.yellow} stroke={PALETTE.outline} strokeWidth="2" />
          {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => {
            const r = (deg * Math.PI) / 180;
            const x1 = 12 + Math.cos(r) * 7;
            const y1 = 12 + Math.sin(r) * 7;
            const x2 = 12 + Math.cos(r) * 10;
            const y2 = 12 + Math.sin(r) * 10;
            return (
              <line
                key={deg}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke={PALETTE.outline}
                strokeWidth="2"
                strokeLinecap="round"
              />
            );
          })}
        </svg>
      )}
    </button>
  );
};

export const ScoreBoard: React.FC = () => {
  const { score, best, linesCleared, combo, lastClearLines } = useGameStore();

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: PALETTE.cardBg,
        border: `3px solid ${PALETTE.outline}`,
        borderRadius: 14,
        padding: '6px 12px',
        marginBottom: 16,
        minWidth: 780,
        boxShadow: '0 8px 18px rgba(30,42,74,0.1)',
        gap: 8,
      }}
    >
      <div
        style={{
          fontFamily: '"JetBrains Mono", ui-monospace, SFMono-Regular, monospace',
          fontSize: 11,
          letterSpacing: 3,
          padding: '6px 12px',
          backgroundColor: PALETTE.badge,
          border: `1.5px solid ${PALETTE.outline}`,
          borderRadius: 6,
          fontWeight: 700,
        }}
      >
        ARTEMIS II
      </div>

      <div style={{ display: 'flex', alignItems: 'stretch' }}>
        <motion.div key={score} initial={{ scale: 1.15 }} animate={{ scale: 1 }}>
          <Stat label="Score" value={score.toLocaleString()} accent={PALETTE.orangeDk} />
        </motion.div>
        <Stat label="Best" value={best.toLocaleString()} />
        <Stat label="Lines" value={linesCleared} />
        <Stat label="Combo" value={combo > 0 ? `×${combo}` : '—'} accent={combo > 1 ? PALETTE.red : undefined} />
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          minWidth: 140,
          justifyContent: 'flex-end',
        }}
      >
        <div style={{ position: 'relative', minWidth: 70 }}>
          <AnimatePresence>
            {lastClearLines > 0 && (
              <motion.div
                key={`flash-${linesCleared}`}
                initial={{ opacity: 0, y: 10, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.4 }}
                style={{
                  backgroundColor: PALETTE.orange,
                  color: PALETTE.ink,
                  padding: '4px 10px',
                  border: `1.5px solid ${PALETTE.outline}`,
                  borderRadius: 6,
                  fontWeight: 800,
                  fontSize: 11,
                  letterSpacing: 1.5,
                  textAlign: 'center',
                }}
              >
                {lastClearLines > 1 ? `COMBO ${lastClearLines}×` : 'CLEAR'}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <SoundToggle />
        <ThemeToggle />
      </div>
    </motion.div>
  );
};
