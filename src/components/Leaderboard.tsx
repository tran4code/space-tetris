import React from 'react';
import { motion } from 'framer-motion';
import { LeaderboardEntry, MAX_ENTRIES } from '../utils/leaderboard';
import { PALETTE } from '../utils/pieceDefinitions';

interface Props {
  entries: LeaderboardEntry[];
  highlightRank?: number | null;
}

const RANK_BADGE: Record<number, { bg: string; fg: string }> = {
  0: { bg: '#ffd24a', fg: PALETTE.outline }, // gold
  1: { bg: '#d8d8e0', fg: PALETTE.outline }, // silver
  2: { bg: '#cd8b56', fg: PALETTE.outline }, // bronze
};

export const Leaderboard: React.FC<Props> = ({ entries, highlightRank }) => {
  const rows: (LeaderboardEntry | null)[] = Array.from(
    { length: MAX_ENTRIES },
    (_, i) => entries[i] ?? null,
  );

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 4,
        fontFamily: '"JetBrains Mono", ui-monospace, SFMono-Regular, monospace',
      }}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '34px 1fr 80px 60px',
          padding: '4px 8px',
          fontSize: 9,
          letterSpacing: 1.5,
          color: PALETTE.grayDk,
          fontWeight: 700,
          textTransform: 'uppercase',
          borderBottom: `1.5px solid ${PALETTE.outline}`,
        }}
      >
        <div>#</div>
        <div>Name</div>
        <div style={{ textAlign: 'right' }}>Score</div>
        <div style={{ textAlign: 'right' }}>Lines</div>
      </div>
      {rows.map((entry, i) => {
        const isMine = highlightRank === i;
        const badge = RANK_BADGE[i];
        return (
          <motion.div
            key={i}
            initial={isMine ? { scale: 1.05, x: -4, backgroundColor: '#fff5d6' } : false}
            animate={isMine ? { scale: 1, x: 0, backgroundColor: '#fff5d6' } : {}}
            transition={{ delay: 0.2 + i * 0.04, duration: 0.4 }}
            style={{
              display: 'grid',
              gridTemplateColumns: '34px 1fr 80px 60px',
              padding: '6px 8px',
              alignItems: 'center',
              borderRadius: 6,
              backgroundColor: isMine ? '#fff5d6' : 'transparent',
              border: isMine ? `2px solid ${PALETTE.orange}` : `1px solid transparent`,
              minHeight: 28,
              fontSize: 13,
              fontWeight: entry ? 700 : 400,
              color: entry ? PALETTE.ink : 'rgba(30,42,74,0.3)',
            }}
          >
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 22,
                height: 22,
                borderRadius: 4,
                background: badge ? badge.bg : 'transparent',
                color: badge ? badge.fg : 'inherit',
                border: badge ? `1.5px solid ${PALETTE.outline}` : 'none',
                fontWeight: 800,
                fontSize: 11,
              }}
            >
              {i + 1}
            </div>
            <div style={{ letterSpacing: 1.5 }}>{entry ? entry.name : '—'}</div>
            <div style={{ textAlign: 'right' }}>
              {entry ? entry.score.toLocaleString() : '—'}
            </div>
            <div
              style={{
                textAlign: 'right',
                color: entry ? PALETTE.grayDk : 'rgba(30,42,74,0.3)',
              }}
            >
              {entry ? entry.lines : '—'}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};
