export interface PieceType {
  id: string;
  name: string;
  emoji: string;
  shape: number[][];
  color: string;
}

export interface AnchorPoint {
  x: number; // Column index (0-based)
  y: number; // Row index (0-based)
}

// Define only the edge cases - exceptions to the default rules
export const PIECE_ANCHOR_EXCEPTIONS: Record<string, Record<number, AnchorPoint>> = {
  // UFO Formation (L-piece) - special cases
  'L': {
    0: { x: 0, y: 2 }, // Bottom left corner (instead of default bottom middle)
    270: { x: 1, y: 0 }, // Bottom right (instead of default bottom middle)
  },
  
  // Planet Cluster (O-piece) - always bottom right (2 blocks wide)
  'O': {
    0: { x: 1, y: 1 }, // Bottom right (this matches the 2-block default, but explicit)
  },
  
  // Comet Trail (S-piece) - bottom right when normal (3 blocks wide, override default)
  'S': {
    0: { x: 2, y: 1 }, // Bottom right (instead of default bottom middle)
  },
  
  // Rocket Trail (I-piece) - bottom right when 180°
  'I': {
    180: { x: 1, y: 0 }, // Bottom right (instead of default bottom middle)
  },
  
  // Space Station (T2-piece) - top middle when 180°
  'T2': {
    180: { x: 1, y: 0 }, // Top middle (instead of default bottom middle)
  },
};

// Helper function to determine rotation angle from piece shape
function getPieceRotation(piece: PieceType): number {
  const originalShape = PIECE_TYPES.find(p => p.id === piece.id)?.shape;
  if (!originalShape) return 0;
  
  // Compare current shape with original to determine rotation
  // This is a simplified rotation detection - we could make it more robust
  const currentShape = piece.shape;
  
  if (JSON.stringify(currentShape) === JSON.stringify(originalShape)) {
    return 0; // No rotation
  }
  
  // Try 90-degree rotations to find match
  let testShape = originalShape;
  for (let rotation = 90; rotation <= 270; rotation += 90) {
    // Rotate the original shape
    // eslint-disable-next-line no-loop-func
    testShape = testShape[0].map((_, colIndex) =>
      testShape.map(row => row[colIndex]).reverse()
    );
    
    if (JSON.stringify(currentShape) === JSON.stringify(testShape)) {
      return rotation;
    }
  }
  
  return 0; // Default to 0 if no match found
}

// Helper function to get anchor point for a piece considering rotation
export function getPieceAnchorPoint(piece: PieceType): AnchorPoint {
  const rotation = getPieceRotation(piece);
  
  // First check for exceptions
  const exceptions = PIECE_ANCHOR_EXCEPTIONS[piece.id];
  if (exceptions && exceptions[rotation]) {
    return exceptions[rotation];
  }
  
  // Apply default rules:
  const pieceWidth = piece.shape[0].length;
  const pieceHeight = piece.shape.length;
  
  if (pieceWidth === 2) {
    // If only 2 blocks wide, default to bottom right
    return { x: 1, y: pieceHeight - 1 };
  } else {
    // Otherwise, default to bottom middle
    return { x: Math.floor(pieceWidth / 2), y: pieceHeight - 1 };
  }
}

export const PIECE_TYPES: PieceType[] = [
  {
    id: 'I',
    name: 'Rocket Trail',
    emoji: '🚀',
    color: '#c44569',
    shape: [
      [1, 1, 1, 1]
    ]
  },
  {
    id: 'O',
    name: 'Planet Cluster',
    emoji: '🌍',
    color: '#26a69a',
    shape: [
      [1, 1],
      [1, 1]
    ]
  },
  {
    id: 'T',
    name: 'Star Constellation',
    emoji: '⭐',
    color: '#f39801',
    shape: [
      [0, 1, 0],
      [1, 1, 1]
    ]
  },
  {
    id: 'L',
    name: 'UFO Formation',
    emoji: '🛸',
    color: '#55a3ff',
    shape: [
      [1, 0],
      [1, 0],
      [1, 1]
    ]
  },
  {
    id: 'J',
    name: 'Satellite Array',
    emoji: '🛰️',
    color: '#778beb',
    shape: [
      [0, 1],
      [0, 1],
      [1, 1]
    ]
  },
  {
    id: 'S',
    name: 'Comet Trail',
    emoji: '☄️',
    color: '#e55039',
    shape: [
      [0, 1, 1],
      [1, 1, 0]
    ]
  },
  {
    id: 'Z',
    name: 'Astronaut Team',
    emoji: '👨‍🚀',
    color: '#596275',
    shape: [
      [1, 1, 0],
      [0, 1, 1]
    ]
  },
  {
    id: 'T2',
    name: 'Space Station',
    emoji: '🌙',
    color: '#2c3e50',
    shape: [
      [0, 1, 0],
      [1, 1, 1]
    ]
  }
];

export const METEORITE = {
  emoji: '🌑',
  color: '#333333'
};

export function rotatePiece(piece: PieceType): PieceType {
  const rotatedShape = piece.shape[0].map((_, colIndex) =>
    piece.shape.map(row => row[colIndex]).reverse()
  );
  
  return {
    ...piece,
    shape: rotatedShape
  };
}

export function getRandomPiece(): PieceType {
  return PIECE_TYPES[Math.floor(Math.random() * PIECE_TYPES.length)];
}