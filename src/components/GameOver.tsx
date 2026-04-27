import React, { useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '../store/gameStore';
import { PALETTE } from '../utils/pieceDefinitions';
import {
  LeaderboardEntry,
  MAX_NAME_LEN,
  addEntry,
  loadLeaderboard,
  qualifiesForLeaderboard,
  sanitizeName,
} from '../utils/leaderboard';
import { Leaderboard } from './Leaderboard';

type Stage = 'entry' | 'board';

export const GameOver: React.FC = () => {
  const { score, linesCleared, best, resetGame, returnToMenu } = useGameStore();
  const qualifies = useMemo(() => qualifiesForLeaderboard(score), [score]);
  const [stage, setStage] = useState<Stage>(qualifies ? 'entry' : 'board');
  const [name, setName] = useState('');
  const [entries, setEntries] = useState<LeaderboardEntry[]>(() => loadLeaderboard());
  const [myRank, setMyRank] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const submit = () => {
    const cleaned = sanitizeName(name) || 'AAA';
    const entry: LeaderboardEntry = {
      name: cleaned,
      score,
      lines: linesCleared,
      date: new Date().toISOString(),
    };
    const result = addEntry(entry);
    setEntries(result.entries);
    setMyRank(result.rank);
    setStage('board');
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: 'fixed',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(240, 238, 233, 0.92)',
        backdropFilter: 'blur(6px)',
        zIndex: 1000,
        padding: 20,
      }}
    >
      <motion.div
        initial={{ y: 20, scale: 0.96 }}
        animate={{ y: 0, scale: 1 }}
        transition={{ duration: 0.4 }}
        style={{
          backgroundColor: PALETTE.cardBg,
          border: `3px solid ${PALETTE.outline}`,
          borderRadius: 18,
          padding: '28px 36px',
          textAlign: 'center',
          width: 'min(92vw, 480px)',
          boxShadow: '0 20px 60px rgba(30,42,74,0.25)',
        }}
      >
        <div
          style={{
            fontFamily: '"JetBrains Mono", ui-monospace, SFMono-Regular, monospace',
            fontSize: 11,
            letterSpacing: 3,
            backgroundColor: PALETTE.badge,
            border: `1.5px solid ${PALETTE.outline}`,
            padding: '4px 10px',
            borderRadius: 4,
            display: 'inline-block',
            marginBottom: 14,
            fontWeight: 700,
          }}
        >
          {stage === 'entry' ? 'NEW HIGH SCORE' : 'SPLASHDOWN'}
        </div>

        {stage === 'entry' ? (
          <>
            <h2
              style={{
                fontSize: '1.8rem',
                fontWeight: 900,
                marginBottom: 6,
                color: PALETTE.ink,
              }}
            >
              You made the leaderboard
            </h2>
            <p
              style={{
                color: PALETTE.grayDk,
                marginBottom: 20,
                fontSize: 13,
                letterSpacing: 0.5,
              }}
            >
              Enter your name for the records
            </p>

            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                gap: 14,
                marginBottom: 18,
              }}
            >
              <Stat label="Score" value={score.toLocaleString()} accent={PALETTE.orangeDk} />
              <Stat label="Lines" value={linesCleared} />
            </div>

            <input
              ref={inputRef}
              autoFocus
              value={name}
              maxLength={MAX_NAME_LEN}
              placeholder="AAA"
              onChange={(e) => setName(sanitizeName(e.target.value))}
              onKeyDown={(e) => {
                if (e.key === 'Enter') submit();
              }}
              style={{
                fontFamily: '"JetBrains Mono", ui-monospace, SFMono-Regular, monospace',
                fontSize: 30,
                fontWeight: 800,
                letterSpacing: 6,
                textAlign: 'center',
                width: 220,
                padding: '10px 14px',
                border: `2.5px solid ${PALETTE.outline}`,
                borderRadius: 10,
                background: '#fff',
                color: PALETTE.ink,
                outline: 'none',
                marginBottom: 18,
                textTransform: 'uppercase',
              }}
            />

            <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
              <ActionButton onClick={submit} primary>
                Submit
              </ActionButton>
              <ActionButton onClick={() => setStage('board')}>Skip</ActionButton>
            </div>
          </>
        ) : (
          <>
            <h2
              style={{
                fontSize: '1.8rem',
                fontWeight: 900,
                marginBottom: 6,
                color: PALETTE.ink,
              }}
            >
              {myRank !== null ? `Rank #${myRank + 1}` : 'Mission complete'}
            </h2>
            <p
              style={{
                color: PALETTE.grayDk,
                marginBottom: 16,
                fontSize: 13,
                letterSpacing: 0.5,
              }}
            >
              No more pieces fit. Final score{' '}
              <strong style={{ color: PALETTE.ink }}>{score.toLocaleString()}</strong>{' '}
              · best{' '}
              <strong style={{ color: PALETTE.ink }}>
                {Math.max(score, best).toLocaleString()}
              </strong>
            </p>

            <div
              style={{
                background: '#fff',
                border: `2px solid ${PALETTE.outline}`,
                borderRadius: 12,
                padding: 10,
                marginBottom: 18,
              }}
            >
              <Leaderboard entries={entries} highlightRank={myRank} />
            </div>

            <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
              <ActionButton onClick={resetGame} primary>
                Relaunch
              </ActionButton>
              <ActionButton onClick={returnToMenu}>Menu</ActionButton>
            </div>
          </>
        )}
      </motion.div>
    </motion.div>
  );
};

const Stat: React.FC<{ label: string; value: React.ReactNode; accent?: string }> = ({
  label,
  value,
  accent,
}) => (
  <div
    style={{
      padding: '8px 14px',
      border: `2px solid ${PALETTE.outline}`,
      borderRadius: 10,
      background: '#fff',
      minWidth: 90,
    }}
  >
    <div
      style={{
        fontSize: 9,
        letterSpacing: 2,
        color: PALETTE.grayDk,
        fontWeight: 700,
        textTransform: 'uppercase',
      }}
    >
      {label}
    </div>
    <div
      style={{
        fontSize: 20,
        fontWeight: 900,
        color: accent || PALETTE.ink,
        fontFamily: '"JetBrains Mono", ui-monospace, monospace',
      }}
    >
      {value}
    </div>
  </div>
);

const ActionButton: React.FC<{
  onClick: () => void;
  primary?: boolean;
  children: React.ReactNode;
}> = ({ onClick, primary, children }) => (
  <motion.button
    onClick={onClick}
    whileHover={{ y: -2 }}
    whileTap={{ scale: 0.96 }}
    style={{
      padding: '12px 22px',
      fontSize: 13,
      fontWeight: 800,
      letterSpacing: 1.5,
      textTransform: 'uppercase',
      backgroundColor: primary ? PALETTE.orange : 'transparent',
      color: PALETTE.ink,
      border: `2.5px solid ${PALETTE.outline}`,
      borderRadius: 8,
      cursor: 'pointer',
      fontFamily: 'inherit',
    }}
  >
    {children}
  </motion.button>
);
