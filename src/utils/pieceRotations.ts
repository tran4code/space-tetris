import { PieceType, PIECE_TYPES } from './pieceDefinitions';

// Generate all 4 rotations of a piece
export function generateAllRotations(basePiece: PieceType): PieceType[] {
  const rotations: PieceType[] = [basePiece];
  let currentShape = basePiece.shape;
  
  // Generate 3 more rotations (90°, 180°, 270°)
  for (let i = 1; i < 4; i++) {
    // eslint-disable-next-line no-loop-func
    const newShape = currentShape[0].map((_, colIndex) =>
      currentShape.map(row => row[colIndex]).reverse()
    );
    currentShape = newShape;
    
    rotations.push({
      ...basePiece,
      id: `${basePiece.id}_${i}`,
      name: `${basePiece.name} (${i * 90}°)`,
      shape: newShape.map(row => [...row]) // Deep copy
    });
  }
  
  return rotations;
}

// Generate a set of pre-rotated pieces for the panel
export function generateRandomRotatedPieces(count: number = 6): PieceType[] {
  const pieces: PieceType[] = [];
  
  for (let i = 0; i < count; i++) {
    // Pick a random base piece
    const basePiece = PIECE_TYPES[Math.floor(Math.random() * PIECE_TYPES.length)];
    
    // Generate all rotations
    const allRotations = generateAllRotations(basePiece);
    
    // Pick a random rotation
    const randomRotation = allRotations[Math.floor(Math.random() * allRotations.length)];
    
    pieces.push({
      ...randomRotation,
      id: `${randomRotation.id}_${i}` // Ensure unique ID
    });
  }
  
  return pieces;
}