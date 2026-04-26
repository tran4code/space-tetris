import React from 'react';
import {
  PALETTE,
  PIECE_DEFS,
  PieceShape,
  Rotation,
  RockyConfig,
  DEFAULT_ROCKY_CONFIG,
  rockyGeometry,
} from '../utils/pieceDefinitions';

function rotationTransform(rotation: Rotation, W0: number, H0: number): string | undefined {
  switch (rotation) {
    case 0:
      return undefined;
    case 90:
      return `translate(${H0} 0) rotate(90)`;
    case 180:
      return `translate(${W0} ${H0}) rotate(180)`;
    case 270:
      return `translate(0 ${W0}) rotate(270)`;
  }
}

const P = PALETTE;

function footprintPath(cells: [number, number][], s: number, r: number): string {
  const set = new Set(cells.map(([x, y]) => `${x},${y}`));
  const has = (x: number, y: number) => set.has(`${x},${y}`);
  return cells.map(([cx, cy]) => {
    const x = cx * s;
    const y = cy * s;
    const tl = !has(cx - 1, cy) && !has(cx, cy - 1) ? r : 0;
    const tr = !has(cx + 1, cy) && !has(cx, cy - 1) ? r : 0;
    const br = !has(cx + 1, cy) && !has(cx, cy + 1) ? r : 0;
    const bl = !has(cx - 1, cy) && !has(cx, cy + 1) ? r : 0;
    return [
      `M ${x + tl} ${y}`,
      `L ${x + s - tr} ${y}`,
      tr ? `A ${tr} ${tr} 0 0 1 ${x + s} ${y + tr}` : '',
      `L ${x + s} ${y + s - br}`,
      br ? `A ${br} ${br} 0 0 1 ${x + s - br} ${y + s}` : '',
      `L ${x + bl} ${y + s}`,
      bl ? `A ${bl} ${bl} 0 0 1 ${x} ${y + s - bl}` : '',
      `L ${x} ${y + tl}`,
      tl ? `A ${tl} ${tl} 0 0 1 ${x + tl} ${y}` : '',
      'Z',
    ].join(' ');
  }).join(' ');
}

const CUSTOM_SILHOUETTE = new Set<PieceShape>(['ROCKET']);
const SKIP_CELL_BOUNDARIES = new Set<PieceShape>(['ROCKET', 'ROCKY']);
const UPPER_COLS = [1, 3] as const;
const LOWER_COLS = [0, 2, 4] as const;

interface GridPieceShapeProps {
  shape: PieceShape;
  cellSize?: number;
  rotation?: Rotation;
  rockyConfig?: RockyConfig;
}

/**
 * Inner SVG content of a piece (no <svg> wrapper). Used by GridPiece for
 * standalone rendering and by GameGrid for clipped illustrations on placed pieces.
 *
 * `rotation` applies a compound transform (rotate + translate) so the rotated
 * bbox starts at (0, 0), matching the rotated `cells` layout.
 *
 * `rockyConfig` controls ROCKY's per-limb lengths so the bonus piece can
 * shrink to fit tighter spaces.
 */
export const GridPieceShape: React.FC<GridPieceShapeProps> = ({
  shape,
  cellSize = 40,
  rotation = 0,
  rockyConfig,
}) => {
  const def = PIECE_DEFS[shape];
  if (!def) return null;
  const s = cellSize;
  // ROCKY's footprint depends on its config; everyone else uses the static def.
  const rockyCfg = shape === 'ROCKY' ? rockyConfig ?? DEFAULT_ROCKY_CONFIG : null;
  const rockyGeom = rockyCfg ? rockyGeometry(rockyCfg) : null;
  const cells = rockyGeom ? rockyGeom.cells : def.cells;
  const w = rockyGeom ? rockyGeom.w : def.w;
  const h = rockyGeom ? rockyGeom.h : def.h;
  const W = w * s;
  const H = h * s;
  const outline = P.outline;
  const sw = Math.max(2.5, s / 20);
  const radius = s * 0.18;

  const bodyColor: Record<PieceShape, string> = {
    PLANET: P.blue,
    COMET: P.yellow,
    ROCKET: P.white,
    SATELLITE: P.white,
    ASTRONAUT: P.white,
    STATION: P.white,
    METEOR: P.gray,
    UFO: P.teal,
    SUN: P.night,
    MOON: P.night,
    NASA: P.white,
    ROCKY: '#7a4a28',
  };

  const body = CUSTOM_SILHOUETTE.has(shape) ? null : (
    <path
      d={footprintPath(cells, s, radius)}
      fill={bodyColor[shape]}
      stroke={outline}
      strokeWidth={sw}
      strokeLinejoin="round"
    />
  );

  const cellSet = new Set(cells.map(([x, y]) => `${x},${y}`));
  const interiorLines: Array<{ x1: number; y1: number; x2: number; y2: number }> = [];
  cells.forEach(([cx, cy]) => {
    if (cellSet.has(`${cx + 1},${cy}`)) {
      interiorLines.push({ x1: (cx + 1) * s, y1: cy * s, x2: (cx + 1) * s, y2: (cy + 1) * s });
    }
    if (cellSet.has(`${cx},${cy + 1}`)) {
      interiorLines.push({ x1: cx * s, y1: (cy + 1) * s, x2: (cx + 1) * s, y2: (cy + 1) * s });
    }
  });
  const cellBoundaries = (
    <g opacity="0.85">
      {interiorLines.map((l, i) => (
        <line
          key={i}
          x1={l.x1}
          y1={l.y1}
          x2={l.x2}
          y2={l.y2}
          stroke={outline}
          strokeWidth={sw * 0.7}
          strokeLinecap="round"
        />
      ))}
    </g>
  );

  const details = (): React.ReactNode => {
    switch (shape) {
      case 'PLANET':
        return (
          <g>
            <rect x={0} y={s * 0.85} width={W} height={s * 0.3} fill={P.cream} opacity="0.95" />
            <rect x={0} y={s * 0.85} width={W} height={s * 0.04} fill={outline} />
            <rect x={0} y={s * 1.12} width={W} height={s * 0.04} fill={outline} />
            <path d={`M ${s * 0.2} ${s * 0.5} Q ${s * 1} ${s * 0.35} ${s * 1.8} ${s * 0.5}`} stroke={P.white} strokeWidth={sw * 0.9} fill="none" opacity="0.55" />
            <path d={`M ${s * 0.2} ${s * 1.5} Q ${s * 1} ${s * 1.65} ${s * 1.8} ${s * 1.5}`} stroke={P.white} strokeWidth={sw * 0.9} fill="none" opacity="0.55" />
            <circle cx={s * 0.55} cy={s * 0.55} r={s * 0.1} fill={P.white} opacity="0.3" />
            <circle cx={s * 1.5} cy={s * 1.55} r={s * 0.08} fill={P.white} opacity="0.3" />
            <circle cx={s * 1.3} cy={s * 0.45} r={s * 0.06} fill={P.white} opacity="0.25" />
          </g>
        );

      case 'COMET':
        return (
          <g>
            <rect x={s * 1} y={0} width={s} height={s} fill={P.orange} />
            <rect x={s * 2} y={0} width={s} height={s} fill={P.orangeDk} opacity="0.75" />
            <rect x={s * 3} y={0} width={s} height={s} fill={P.red} opacity="0.55" />
            <line x1={s * 1} y1={s * 0.3} x2={s * 4} y2={s * 0.25} stroke={outline} strokeWidth={sw * 0.5} opacity="0.4" />
            <line x1={s * 1} y1={s * 0.7} x2={s * 4} y2={s * 0.75} stroke={outline} strokeWidth={sw * 0.5} opacity="0.4" />
            <circle cx={s * 1.5} cy={s * 0.5} r={s * 0.06} fill={P.white} />
            <circle cx={s * 2.5} cy={s * 0.3} r={s * 0.05} fill={P.white} />
            <circle cx={s * 3.3} cy={s * 0.7} r={s * 0.04} fill={P.white} />
            <circle cx={s * 0.5} cy={s * 0.5} r={s * 0.38} fill={P.red} stroke={outline} strokeWidth={sw} />
            <circle cx={s * 0.4} cy={s * 0.4} r={s * 0.1} fill={P.white} opacity="0.7" />
          </g>
        );

      case 'ROCKET': {
        const bodyLeft = s * 0.22;
        const bodyRight = s * 0.78;
        return (
          <g>
            <path
              d={`M ${bodyLeft} ${s * 0.55}
                  Q ${bodyLeft} ${s * 0.18} ${s * 0.5} ${s * 0.12}
                  Q ${bodyRight} ${s * 0.18} ${bodyRight} ${s * 0.55}
                  L ${bodyRight} ${s * 3.72}
                  L ${bodyLeft} ${s * 3.72} Z`}
              fill={P.white}
              stroke={outline}
              strokeWidth={sw * 0.9}
              strokeLinejoin="round"
            />
            <path
              d={`M ${s * 0.5} ${s * 0.18}
                  L ${bodyLeft + s * 0.02} ${s * 0.82}
                  L ${bodyRight - s * 0.02} ${s * 0.82} Z`}
              fill={P.orange}
              stroke={outline}
              strokeWidth={sw * 0.9}
              strokeLinejoin="round"
            />
            <circle cx={s * 0.5} cy={s * 1.5} r={s * 0.22} fill={P.blue} stroke={outline} strokeWidth={sw * 0.9} />
            <circle cx={s * 0.42} cy={s * 1.43} r={s * 0.07} fill={P.white} opacity="0.8" />
            <rect x={bodyLeft} y={s * 2.35} width={bodyRight - bodyLeft} height={s * 0.24} fill={P.orange} />
            <line x1={bodyLeft} y1={s * 2.35} x2={bodyRight} y2={s * 2.35} stroke={outline} strokeWidth={sw * 0.7} />
            <line x1={bodyLeft} y1={s * 2.59} x2={bodyRight} y2={s * 2.59} stroke={outline} strokeWidth={sw * 0.7} />
            <path
              d={`M ${bodyLeft} ${s * 3.3}
                  L ${s * 0.05} ${s * 3.85}
                  L ${bodyLeft} ${s * 3.85} Z`}
              fill={P.orange}
              stroke={outline}
              strokeWidth={sw * 0.9}
              strokeLinejoin="round"
            />
            <path
              d={`M ${bodyRight} ${s * 3.3}
                  L ${s * 0.95} ${s * 3.85}
                  L ${bodyRight} ${s * 3.85} Z`}
              fill={P.orange}
              stroke={outline}
              strokeWidth={sw * 0.9}
              strokeLinejoin="round"
            />
            <path
              d={`M ${s * 0.42} ${s * 3.72}
                  L ${s * 0.5} ${s * 3.92}
                  L ${s * 0.58} ${s * 3.72} Z`}
              fill={P.orangeDk}
              stroke={outline}
              strokeWidth={sw * 0.9}
              strokeLinejoin="round"
            />
            <rect x={0} y={0} width={s} height={s * 4} rx={radius} ry={radius} fill="none" stroke={outline} strokeWidth={sw} strokeLinejoin="round" />
            <line x1={0} y1={s * 1} x2={s} y2={s * 1} stroke={outline} strokeWidth={sw * 0.7} strokeLinecap="round" />
            <line x1={0} y1={s * 2} x2={s} y2={s * 2} stroke={outline} strokeWidth={sw * 0.7} strokeLinecap="round" />
            <line x1={0} y1={s * 3} x2={s} y2={s * 3} stroke={outline} strokeWidth={sw * 0.7} strokeLinecap="round" />
          </g>
        );
      }

      case 'SATELLITE':
        return (
          <g>
            <path
              d={`M ${s * 0.15} ${s * 0.2} Q ${s * 0.5} ${s * -0.05} ${s * 0.85} ${s * 0.2} L ${s * 0.7} ${s * 0.5} L ${s * 0.3} ${s * 0.5} Z`}
              fill={P.cream}
              stroke={outline}
              strokeWidth={sw * 0.9}
              strokeLinejoin="round"
            />
            <line x1={s * 0.5} y1={s * 0.5} x2={s * 0.5} y2={s * 0.75} stroke={outline} strokeWidth={sw * 0.9} />
            <rect x={s * 0.2} y={s * 1.15} width={s * 0.6} height={s * 0.4} fill={P.blue} stroke={outline} strokeWidth={sw * 0.9} />
            <circle cx={s * 0.35} cy={s * 1.35} r={s * 0.055} fill={P.yellow} stroke={outline} strokeWidth={sw * 0.4} />
            <circle cx={s * 0.5} cy={s * 1.35} r={s * 0.055} fill={P.red} stroke={outline} strokeWidth={sw * 0.4} />
            <circle cx={s * 0.65} cy={s * 1.35} r={s * 0.055} fill={P.yellow} stroke={outline} strokeWidth={sw * 0.4} />
            <rect x={s * 0.15} y={s * 2.35} width={s * 0.7} height={s * 0.12} fill={P.red} stroke={outline} strokeWidth={sw * 0.6} />
            <rect x={s * 1.15} y={s * 2.15} width={s * 0.7} height={s * 0.7} fill={P.blue} stroke={outline} strokeWidth={sw * 0.9} />
            <line x1={s * 1.5} y1={s * 2.15} x2={s * 1.5} y2={s * 2.85} stroke={outline} strokeWidth={sw * 0.5} />
            <line x1={s * 1.15} y1={s * 2.5} x2={s * 1.85} y2={s * 2.5} stroke={outline} strokeWidth={sw * 0.5} />
          </g>
        );

      case 'ASTRONAUT':
        return (
          <g>
            <circle cx={s * 1.5} cy={s * 0.5} r={s * 0.38} fill={P.white} stroke={outline} strokeWidth={sw} />
            <path
              d={`M ${s * 1.22} ${s * 0.42} Q ${s * 1.5} ${s * 0.3} ${s * 1.78} ${s * 0.42} Q ${s * 1.72} ${s * 0.62} ${s * 1.5} ${s * 0.62} Q ${s * 1.28} ${s * 0.62} ${s * 1.22} ${s * 0.42} Z`}
              fill={P.dark}
              stroke={outline}
              strokeWidth={sw * 0.8}
            />
            <ellipse cx={s * 1.38} cy={s * 0.43} rx={s * 0.07} ry={s * 0.05} fill={P.white} opacity="0.9" />
            <rect x={s * 1.18} y={s * 1.1} width={s * 0.64} height={s * 0.75} fill={P.white} stroke={outline} strokeWidth={sw * 0.9} />
            <rect x={s * 1.18} y={s * 1.1} width={s * 0.22} height={s * 0.28} fill={P.red} stroke={outline} strokeWidth={sw * 0.7} />
            <rect x={s * 1.45} y={s * 1.22} width={s * 0.32} height={s * 0.28} fill={P.blue} stroke={outline} strokeWidth={sw * 0.7} />
            <circle cx={s * 1.54} cy={s * 1.36} r={s * 0.045} fill={P.yellow} stroke={outline} strokeWidth={sw * 0.35} />
            <circle cx={s * 1.68} cy={s * 1.36} r={s * 0.045} fill={P.red} stroke={outline} strokeWidth={sw * 0.35} />
            <rect x={s * 1.14} y={s * 1.82} width={s * 0.72} height={s * 0.15} fill={P.orange} stroke={outline} strokeWidth={sw * 0.7} />
            <rect x={s * 1.2} y={s * 2.1} width={s * 0.6} height={s * 0.78} fill={P.white} stroke={outline} strokeWidth={sw * 0.9} />
            <line x1={s * 1.5} y1={s * 2.45} x2={s * 1.5} y2={s * 2.88} stroke={outline} strokeWidth={sw * 0.7} />
            <rect x={s * 0.35} y={s * 2.2} width={s * 0.85} height={s * 0.5} fill={P.white} stroke={outline} strokeWidth={sw * 0.9} />
            <circle cx={s * 0.35} cy={s * 2.45} r={s * 0.28} fill={P.orange} stroke={outline} strokeWidth={sw} />
          </g>
        );

      case 'STATION': {
        const panelBlue = '#4a7cb8';
        const panelGlint = '#8ab0dc';
        return (
          <g>
            <rect x={s * 0.05} y={s * 0.42} width={s * 2.9} height={s * 0.18} fill={P.gray} stroke={outline} strokeWidth={sw * 0.6} />
            {[0.3, 0.7, 1.1, 1.5, 1.9, 2.3, 2.7].map((x, i) => (
              <line key={i} x1={s * x} y1={s * 0.42} x2={s * x} y2={s * 0.6} stroke={outline} strokeWidth={sw * 0.35} />
            ))}
            <rect x={s * 0.08} y={s * 0.08} width={s * 0.8} height={s * 0.28} fill={panelBlue} stroke={outline} strokeWidth={sw * 0.55} />
            <line x1={s * 0.48} y1={s * 0.08} x2={s * 0.48} y2={s * 0.36} stroke={outline} strokeWidth={sw * 0.3} />
            <line x1={s * 0.08} y1={s * 0.22} x2={s * 0.88} y2={s * 0.22} stroke={outline} strokeWidth={sw * 0.3} />
            <rect x={s * 0.12} y={s * 0.11} width={s * 0.3} height={s * 0.06} fill={panelGlint} opacity="0.6" />
            <rect x={s * 0.08} y={s * 0.66} width={s * 0.8} height={s * 0.28} fill={panelBlue} stroke={outline} strokeWidth={sw * 0.55} />
            <line x1={s * 0.48} y1={s * 0.66} x2={s * 0.48} y2={s * 0.94} stroke={outline} strokeWidth={sw * 0.3} />
            <line x1={s * 0.08} y1={s * 0.8} x2={s * 0.88} y2={s * 0.8} stroke={outline} strokeWidth={sw * 0.3} />
            <rect x={s * 0.12} y={s * 0.69} width={s * 0.3} height={s * 0.06} fill={panelGlint} opacity="0.6" />
            <rect x={s * 2.12} y={s * 0.08} width={s * 0.8} height={s * 0.28} fill={panelBlue} stroke={outline} strokeWidth={sw * 0.55} />
            <line x1={s * 2.52} y1={s * 0.08} x2={s * 2.52} y2={s * 0.36} stroke={outline} strokeWidth={sw * 0.3} />
            <line x1={s * 2.12} y1={s * 0.22} x2={s * 2.92} y2={s * 0.22} stroke={outline} strokeWidth={sw * 0.3} />
            <rect x={s * 2.16} y={s * 0.11} width={s * 0.3} height={s * 0.06} fill={panelGlint} opacity="0.6" />
            <rect x={s * 2.12} y={s * 0.66} width={s * 0.8} height={s * 0.28} fill={panelBlue} stroke={outline} strokeWidth={sw * 0.55} />
            <line x1={s * 2.52} y1={s * 0.66} x2={s * 2.52} y2={s * 0.94} stroke={outline} strokeWidth={sw * 0.3} />
            <line x1={s * 2.12} y1={s * 0.8} x2={s * 2.92} y2={s * 0.8} stroke={outline} strokeWidth={sw * 0.3} />
            <rect x={s * 2.16} y={s * 0.69} width={s * 0.3} height={s * 0.06} fill={panelGlint} opacity="0.6" />
            <rect x={s * 1.18} y={s * 0.2} width={s * 0.64} height={s * 0.6} fill={P.cream} stroke={outline} strokeWidth={sw * 0.75} rx={s * 0.08} />
            <line x1={s * 1.18} y1={s * 0.38} x2={s * 1.82} y2={s * 0.38} stroke={outline} strokeWidth={sw * 0.3} opacity="0.7" />
            <line x1={s * 1.18} y1={s * 0.62} x2={s * 1.82} y2={s * 0.62} stroke={outline} strokeWidth={sw * 0.3} opacity="0.7" />
            <rect x={s * 1.38} y={s * 0.44} width={s * 0.24} height={s * 0.12} fill={P.blue} stroke={outline} strokeWidth={sw * 0.35} rx={s * 0.02} />
            <rect x={s * 1.18} y={s * 1.05} width={s * 0.64} height={s * 0.75} fill={P.cream} stroke={outline} strokeWidth={sw * 0.8} rx={s * 0.32} />
            <line x1={s * 1.18} y1={s * 1.25} x2={s * 1.82} y2={s * 1.25} stroke={outline} strokeWidth={sw * 0.35} opacity="0.7" />
            <line x1={s * 1.18} y1={s * 1.6} x2={s * 1.82} y2={s * 1.6} stroke={outline} strokeWidth={sw * 0.35} opacity="0.7" />
            <circle cx={s * 1.5} cy={s * 1.42} r={s * 0.13} fill={P.blue} stroke={outline} strokeWidth={sw * 0.55} />
            <circle cx={s * 1.46} cy={s * 1.38} r={s * 0.04} fill={panelGlint} opacity="0.8" />
            <rect x={s * 1.38} y={s * 1.82} width={s * 0.24} height={s * 0.1} fill={P.gray} stroke={outline} strokeWidth={sw * 0.5} />
            <line x1={s * 1.5} y1={s * 0.95} x2={s * 1.5} y2={s * 1.05} stroke={outline} strokeWidth={sw * 0.5} />
          </g>
        );
      }

      case 'METEOR':
        return (
          <g>
            <circle cx={s * 1.5} cy={s * 0.4} r={s * 0.12} fill={P.grayDk} opacity="0.4" />
            <circle cx={s * 2.3} cy={s * 0.6} r={s * 0.1} fill={P.grayDk} opacity="0.4" />
            <circle cx={s * 1.9} cy={s * 0.75} r={s * 0.07} fill={P.grayDk} opacity="0.4" />
            <circle cx={s * 0.4} cy={s * 1.4} r={s * 0.14} fill={P.grayDk} opacity="0.4" />
            <circle cx={s * 1.2} cy={s * 1.6} r={s * 0.11} fill={P.grayDk} opacity="0.4" />
            <circle cx={s * 0.8} cy={s * 1.25} r={s * 0.08} fill={P.grayDk} opacity="0.4" />
            <circle cx={s * 1.3} cy={s * 0.2} r={s * 0.06} fill={P.white} opacity="0.5" />
            <circle cx={s * 0.2} cy={s * 1.15} r={s * 0.06} fill={P.white} opacity="0.5" />
          </g>
        );

      case 'UFO':
        return (
          <g>
            <path
              d={`M ${s * 0.15} ${s * 0.7} Q ${s * 0.5} ${s * 0.1} ${s * 0.85} ${s * 0.7} Z`}
              fill={P.yellow}
              stroke={outline}
              strokeWidth={sw * 0.8}
            />
            <circle cx={s * 1.25} cy={s * 0.75} r={s * 0.06} fill={P.orange} />
            <circle cx={s * 1.55} cy={s * 0.8} r={s * 0.06} fill={P.red} />
            <circle cx={s * 1.85} cy={s * 0.75} r={s * 0.06} fill={P.orange} />
            <rect x={s * 1} y={s * 1} width={s * 2} height={s} fill={P.yellow} opacity="0.55" />
            <line x1={s * 1} y1={s * 1} x2={s * 1} y2={s * 2} stroke={P.yellowDk} strokeWidth={sw * 0.5} />
            <line x1={s * 1.5} y1={s * 1} x2={s * 1.5} y2={s * 2} stroke={P.yellowDk} strokeWidth={sw * 0.5} opacity="0.7" />
            <line x1={s * 2} y1={s * 1} x2={s * 2} y2={s * 2} stroke={P.yellowDk} strokeWidth={sw * 0.5} opacity="0.7" />
            <line x1={s * 2.5} y1={s * 1} x2={s * 2.5} y2={s * 2} stroke={P.yellowDk} strokeWidth={sw * 0.5} opacity="0.7" />
            <ellipse cx={s * 2.3} cy={s * 1.7} rx={s * 0.22} ry={s * 0.12} fill={P.pink} stroke={outline} strokeWidth={sw * 0.6} />
            <circle cx={s * 2.18} cy={s * 1.7} r={s * 0.05} fill={outline} />
          </g>
        );

      case 'SUN':
        return (
          <g>
            <circle cx={s * 0.25} cy={s * 0.3} r={s * 0.03} fill={P.white} />
            <circle cx={s * 1.75} cy={s * 0.25} r={s * 0.035} fill={P.yellow} />
            <circle cx={s * 1.85} cy={s * 1.7} r={s * 0.03} fill={P.white} />
            <circle cx={s * 0.2} cy={s * 1.75} r={s * 0.03} fill={P.white} />
            <circle cx={s * 0.15} cy={s * 0.9} r={s * 0.02} fill={P.white} opacity="0.7" />
            {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => {
              const rad = (deg * Math.PI) / 180;
              const cx = s;
              const cy = s;
              const x1 = cx + Math.cos(rad) * s * 0.7;
              const y1 = cy + Math.sin(rad) * s * 0.7;
              const x2 = cx + Math.cos(rad) * s * 0.92;
              const y2 = cy + Math.sin(rad) * s * 0.92;
              return <line key={deg} x1={x1} y1={y1} x2={x2} y2={y2} stroke={P.yellow} strokeWidth={sw * 1.2} strokeLinecap="round" />;
            })}
            <circle cx={s} cy={s} r={s * 0.55} fill={P.yellow} stroke={outline} strokeWidth={sw} />
            <circle cx={s * 0.85} cy={s * 0.92} r={s * 0.06} fill={outline} />
            <circle cx={s * 1.15} cy={s * 0.92} r={s * 0.06} fill={outline} />
            <path
              d={`M ${s * 0.85} ${s * 1.12} Q ${s} ${s * 1.25} ${s * 1.15} ${s * 1.12}`}
              stroke={outline}
              strokeWidth={sw * 0.8}
              fill="none"
              strokeLinecap="round"
            />
            <circle cx={s * 0.78} cy={s * 1.05} r={s * 0.06} fill={P.orange} opacity="0.7" />
            <circle cx={s * 1.22} cy={s * 1.05} r={s * 0.06} fill={P.orange} opacity="0.7" />
          </g>
        );

      case 'MOON':
        return (
          <g>
            <circle cx={s * 0.25} cy={s * 0.3} r={s * 0.03} fill={P.white} />
            <circle cx={s * 1.75} cy={s * 0.25} r={s * 0.035} fill={P.white} />
            <circle cx={s * 1.85} cy={s * 1.7} r={s * 0.03} fill={P.white} />
            <circle cx={s * 0.2} cy={s * 1.75} r={s * 0.03} fill={P.white} />
            <circle cx={s * 0.15} cy={s * 0.9} r={s * 0.02} fill={P.white} opacity="0.7" />
            {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => {
              const rad = (deg * Math.PI) / 180;
              const cx = s;
              const cy = s;
              const x1 = cx + Math.cos(rad) * s * 0.7;
              const y1 = cy + Math.sin(rad) * s * 0.7;
              const x2 = cx + Math.cos(rad) * s * 0.92;
              const y2 = cy + Math.sin(rad) * s * 0.92;
              return <line key={deg} x1={x1} y1={y1} x2={x2} y2={y2} stroke={P.white} strokeWidth={sw * 1.1} strokeLinecap="round" opacity="0.9" />;
            })}
            <circle cx={s} cy={s} r={s * 0.55} fill={P.gray} stroke={outline} strokeWidth={sw} />
            <circle cx={s * 0.82} cy={s * 0.82} r={s * 0.11} fill={P.grayDk} stroke={outline} strokeWidth={sw * 0.6} />
            <circle cx={s * 0.82} cy={s * 0.82} r={s * 0.05} fill={P.dark} opacity="0.5" />
            <circle cx={s * 1.22} cy={s * 1.15} r={s * 0.09} fill={P.grayDk} stroke={outline} strokeWidth={sw * 0.6} />
            <circle cx={s * 0.95} cy={s * 1.3} r={s * 0.06} fill={P.grayDk} stroke={outline} strokeWidth={sw * 0.6} />
          </g>
        );

      case 'NASA':
        return (
          <g>
            <circle cx={s} cy={s} r={s * 0.88} fill={P.blueDk} stroke={outline} strokeWidth={sw} />
            <ellipse cx={s} cy={s} rx={s * 0.75} ry={s * 0.22} fill="none" stroke={P.white} strokeWidth={sw * 0.7} transform={`rotate(-22 ${s} ${s})`} />
            <path
              d={`M ${s * 0.28} ${s * 1.25} Q ${s * 1.1} ${s * 0.35} ${s * 1.75} ${s * 0.95}`}
              stroke={P.red}
              strokeWidth={sw * 1.8}
              fill="none"
              strokeLinecap="round"
            />
            <circle cx={s * 0.55} cy={s * 0.65} r={s * 0.04} fill={P.white} />
            <circle cx={s * 1.3} cy={s * 1.35} r={s * 0.035} fill={P.white} />
            <circle cx={s * 1.45} cy={s * 0.55} r={s * 0.03} fill={P.white} />
            <text
              x={s}
              y={s * 1.15}
              fontSize={s * 0.32}
              textAnchor="middle"
              fill={P.white}
              fontWeight="900"
              fontFamily="Inter, sans-serif"
              letterSpacing={s * 0.015}
            >
              NASA
            </text>
          </g>
        );

      case 'ROCKY': {
        const rockDark = '#5a3418';
        const rockMid = '#7a4a28';
        const rockLight = '#a06838';
        const mossGreen = '#8fb04a';
        const eyeWhite = '#fef9f0';
        const cfg = rockyCfg!;
        const upperMax = Math.max(cfg.arms[0], cfg.arms[1]);
        const bodyR = upperMax;
        // Body footprint: row=bodyR, cols 1.7..3.3 (rounded rhombus).
        const bodyTopY = (bodyR + 0.08) * s;
        const bodyBotY = (bodyR + 0.92) * s;
        const bodyMidY = (bodyR + 0.5) * s;

        const renderUpperArm = (col: number, len: number) => {
          if (len === 0) return null;
          const ax = s * (col + 0.5);
          const armTop = (bodyR - len) * s + s * 0.15;
          const armBot = bodyR * s + s * 0.10;
          const armH = armBot - armTop;
          // Segment lines: 1 for length 1, 3 for length 2.
          const segCount = len === 2 ? 3 : 1;
          const segs = Array.from({ length: segCount }, (_, i) => armTop + (armH * (i + 1)) / (segCount + 1));
          // Moss positions (skip on stub arms — too cluttered).
          const moss = len === 2 ? [
            { dx: 0.1, dy: armTop + armH * 0.3, r: 0.08, op: 0.8 },
            { dx: -0.1, dy: armTop + armH * 0.6, r: 0.06, op: 0.6 },
          ] : [
            { dx: 0.08, dy: armTop + armH * 0.5, r: 0.06, op: 0.7 },
          ];
          // Claw tip apex sits 0.08s above arm top.
          const clawApexY = armTop - s * 0.05 - s * 0.08;
          const clawBaseY = armTop + s * 0.05;
          return (
            <g key={`ua-${col}`}>
              <rect x={ax - s * 0.22} y={armTop} width={s * 0.44} height={armH} fill={rockMid} stroke={outline} strokeWidth={sw * 0.8} />
              {segs.map((y, i) => (
                <line key={i} x1={ax - s * 0.22} y1={y} x2={ax + s * 0.22} y2={y} stroke={outline} strokeWidth={sw * 0.5} />
              ))}
              {moss.map((m, i) => (
                <circle key={i} cx={ax + s * m.dx} cy={m.dy} r={s * m.r} fill={mossGreen} opacity={m.op} />
              ))}
              <path
                d={`M ${ax - s * 0.22} ${clawBaseY} L ${ax - s * 0.32} ${clawApexY + s * 0.05} L ${ax - s * 0.1} ${clawApexY + s * 0.18} L ${ax} ${clawApexY} L ${ax + s * 0.1} ${clawApexY + s * 0.18} L ${ax + s * 0.32} ${clawApexY + s * 0.05} L ${ax + s * 0.22} ${clawBaseY} Z`}
                fill={rockDark}
                stroke={outline}
                strokeWidth={sw * 0.7}
                strokeLinejoin="round"
              />
            </g>
          );
        };

        const renderLowerArm = (col: number, len: number) => {
          if (len === 0) return null;
          const ax = s * (col + 0.5);
          const armTop = (bodyR + 1) * s - s * 0.10;
          const armBot = (bodyR + 1 + len) * s - s * 0.15;
          const armH = armBot - armTop;
          const segCount = len === 2 ? 3 : 1;
          const segs = Array.from({ length: segCount }, (_, i) => armTop + (armH * (i + 1)) / (segCount + 1));
          const moss = len === 2 ? [
            { dx: 0.1, dy: armTop + armH * 0.3, r: 0.08, op: 0.8 },
            { dx: -0.1, dy: armTop + armH * 0.6, r: 0.06, op: 0.6 },
          ] : [
            { dx: 0.08, dy: armTop + armH * 0.5, r: 0.06, op: 0.7 },
          ];
          const clawBaseY = armBot - s * 0.05;
          const clawApexY = armBot + s * 0.08;
          return (
            <g key={`ll-${col}`}>
              <rect x={ax - s * 0.22} y={armTop} width={s * 0.44} height={armH} fill={rockMid} stroke={outline} strokeWidth={sw * 0.8} />
              {segs.map((y, i) => (
                <line key={i} x1={ax - s * 0.22} y1={y} x2={ax + s * 0.22} y2={y} stroke={outline} strokeWidth={sw * 0.5} />
              ))}
              {moss.map((m, i) => (
                <circle key={i} cx={ax + s * m.dx} cy={m.dy} r={s * m.r} fill={mossGreen} opacity={m.op} />
              ))}
              <path
                d={`M ${ax - s * 0.22} ${clawBaseY} L ${ax - s * 0.32} ${clawApexY - s * 0.03} L ${ax - s * 0.1} ${clawApexY - s * 0.18} L ${ax} ${clawApexY} L ${ax + s * 0.1} ${clawApexY - s * 0.18} L ${ax + s * 0.32} ${clawApexY - s * 0.03} L ${ax + s * 0.22} ${clawBaseY} Z`}
                fill={rockDark}
                stroke={outline}
                strokeWidth={sw * 0.7}
                strokeLinejoin="round"
              />
            </g>
          );
        };

        return (
          <g>
            {UPPER_COLS.map((col, i) => renderUpperArm(col, cfg.arms[i]))}

            {/* Body */}
            <g>
              <path
                d={`M ${s * 1.7} ${bodyTopY} L ${s * 3.3} ${bodyTopY} L ${s * 3.55} ${bodyMidY} L ${s * 3.3} ${bodyBotY} L ${s * 1.7} ${bodyBotY} L ${s * 1.45} ${bodyMidY} Z`}
                fill={rockMid}
                stroke={outline}
                strokeWidth={sw * 1.1}
                strokeLinejoin="round"
              />
              <line x1={s * 1.7} y1={bodyTopY} x2={s * 1.45} y2={bodyMidY} stroke={outline} strokeWidth={sw * 0.7} />
              <line x1={s * 3.3} y1={bodyTopY} x2={s * 3.55} y2={bodyMidY} stroke={outline} strokeWidth={sw * 0.7} />
              <path
                d={`M ${s * 1.7} ${bodyTopY} L ${s * 3.3} ${bodyTopY} L ${s * 3.0} ${bodyTopY + s * 0.22} L ${s * 2.0} ${bodyTopY + s * 0.22} Z`}
                fill={rockLight}
                opacity="0.55"
              />
              <path
                d={`M ${s * 1.7} ${bodyBotY} L ${s * 3.3} ${bodyBotY} L ${s * 3.0} ${bodyBotY - s * 0.17} L ${s * 2.0} ${bodyBotY - s * 0.17} Z`}
                fill={rockDark}
                opacity="0.4"
              />
              <circle cx={s * 1.9} cy={bodyTopY + s * 0.14} r={s * 0.1} fill={mossGreen} opacity="0.8" />
              <circle cx={s * 3.15} cy={bodyTopY + s * 0.27} r={s * 0.08} fill={mossGreen} opacity="0.75" />
              <circle cx={s * 2.1} cy={bodyBotY - s * 0.12} r={s * 0.07} fill={mossGreen} opacity="0.7" />
              <circle cx={s * 2.25} cy={bodyMidY + s * 0.05} r={s * 0.13} fill={eyeWhite} stroke={outline} strokeWidth={sw * 0.6} />
              <circle cx={s * 2.75} cy={bodyMidY + s * 0.05} r={s * 0.13} fill={eyeWhite} stroke={outline} strokeWidth={sw * 0.6} />
              <circle cx={s * 2.27} cy={bodyMidY + s * 0.07} r={s * 0.06} fill={outline} />
              <circle cx={s * 2.77} cy={bodyMidY + s * 0.07} r={s * 0.06} fill={outline} />
              <circle cx={s * 2.3} cy={bodyMidY + s * 0.04} r={s * 0.02} fill={eyeWhite} />
              <circle cx={s * 2.8} cy={bodyMidY + s * 0.04} r={s * 0.02} fill={eyeWhite} />
              <path
                d={`M ${s * 2.35} ${bodyMidY + s * 0.28} Q ${s * 2.5} ${bodyMidY + s * 0.38} ${s * 2.65} ${bodyMidY + s * 0.28}`}
                stroke={outline}
                strokeWidth={sw * 0.7}
                fill="none"
                strokeLinecap="round"
              />
              <rect x={s * 2.46} y={bodyMidY + s * 0.28} width={s * 0.08} height={s * 0.07} fill={eyeWhite} stroke={outline} strokeWidth={sw * 0.4} />
            </g>

            {LOWER_COLS.map((col, i) => renderLowerArm(col, cfg.arms[i + 2]))}
          </g>
        );
      }

      default:
        return null;
    }
  };

  const xform = rotationTransform(rotation, W, H);
  return (
    <g {...(xform ? { transform: xform } : {})}>
      {body}
      {details()}
      {!SKIP_CELL_BOUNDARIES.has(shape) && cellBoundaries}
    </g>
  );
};

interface GridPieceProps {
  shape: PieceShape;
  cellSize?: number;
  showGrid?: boolean;
  dimmed?: boolean;
  rotation?: Rotation;
  rockyConfig?: RockyConfig;
}

export const GridPiece: React.FC<GridPieceProps> = ({
  shape,
  cellSize = 40,
  showGrid = false,
  dimmed = false,
  rotation = 0,
  rockyConfig,
}) => {
  const def = PIECE_DEFS[shape];
  if (!def) return null;
  const s = cellSize;
  // ROCKY's bbox depends on its config; everyone else uses the static def.
  const rockyGeom = shape === 'ROCKY' ? rockyGeometry(rockyConfig ?? DEFAULT_ROCKY_CONFIG) : null;
  const baseW = rockyGeom ? rockyGeom.w : def.w;
  const baseH = rockyGeom ? rockyGeom.h : def.h;
  const baseCells = rockyGeom ? rockyGeom.cells : def.cells;
  const rotW = rotation === 90 || rotation === 270 ? baseH : baseW;
  const rotH = rotation === 90 || rotation === 270 ? baseW : baseH;
  const W = rotW * s;
  const H = rotH * s;

  const rotatedCells: [number, number][] = rotation === 0
    ? baseCells
    : (() => {
        switch (rotation) {
          case 90:
            return baseCells.map(([x, y]) => [baseH - 1 - y, x] as [number, number]);
          case 180:
            return baseCells.map(([x, y]) => [baseW - 1 - x, baseH - 1 - y] as [number, number]);
          case 270:
            return baseCells.map(([x, y]) => [y, baseW - 1 - x] as [number, number]);
          default:
            return baseCells;
        }
      })();

  return (
    <svg
      width={W + s * 0.7}
      height={H + s * 0.7}
      viewBox={`${-s * 0.35} ${-s * 0.35} ${W + s * 0.7} ${H + s * 0.7}`}
      style={{ display: 'block', overflow: 'visible', opacity: dimmed ? 0.45 : 1 }}
    >
      {showGrid && (
        <g>
          {rotatedCells.map(([cx, cy], i) => (
            <rect
              key={i}
              x={cx * s}
              y={cy * s}
              width={s}
              height={s}
              fill="rgba(30,42,74,0.04)"
              stroke="rgba(30,42,74,0.12)"
              strokeDasharray="3 3"
              strokeWidth="1"
            />
          ))}
        </g>
      )}
      <GridPieceShape shape={shape} cellSize={cellSize} rotation={rotation} rockyConfig={rockyConfig} />
    </svg>
  );
};
