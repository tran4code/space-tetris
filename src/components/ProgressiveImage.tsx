import React, { useState } from 'react';

interface ProgressiveImageProps {
  score: number;
  availablePoints: number; // Points available to spend on revealing blocks
  onPointsSpent: (pointsSpent: number) => void;
}

const GRID_WIDTH = 25;
const GRID_HEIGHT = 30;
const BLOCK_SIZE = 14; // Slightly bigger blocks for better image size
const POINTS_PER_BLOCK = 10; // Cost to reveal one block

export const ProgressiveImage: React.FC<ProgressiveImageProps> = ({ 
  score, 
  availablePoints,
  onPointsSpent
}) => {
  // Initialize grid with all blocks covered (true = covered, false = revealed)
  const [cometBlocks, setCometBlocks] = useState<boolean[][]>(() => 
    Array(GRID_HEIGHT).fill(null).map(() => Array(GRID_WIDTH).fill(true))
  );

  // Click-based destruction with preset options
  const destructionOptions = [
    { count: 1, cost: 10, enabled: availablePoints >= 10 },
    { count: 3, cost: 25, enabled: availablePoints >= 25 },
    { count: 5, cost: 40, enabled: availablePoints >= 40 },
    { count: 10, cost: 75, enabled: availablePoints >= 75 },
  ];

  const handleCometClick = (rowIndex: number, colIndex: number) => {
    // Only allow clicking if the block is covered
    if (!cometBlocks[rowIndex][colIndex]) return;

    // Check if we have enough points for single destruction
    if (availablePoints < POINTS_PER_BLOCK) return;

    // Remove the clicked block
    setCometBlocks(prev => {
      const newGrid = prev.map(row => [...row]);
      newGrid[rowIndex][colIndex] = false;
      return newGrid;
    });

    // Spend points for single block
    onPointsSpent(POINTS_PER_BLOCK);
  };

  const handleRandomDestruction = (count: number, cost: number) => {
    if (availablePoints < cost) return;

    setCometBlocks(prev => {
      const newGrid = prev.map(row => [...row]);
      let destroyed = 0;
      
      // Find all covered blocks
      const coveredBlocks: {row: number, col: number}[] = [];
      for (let row = 0; row < GRID_HEIGHT; row++) {
        for (let col = 0; col < GRID_WIDTH; col++) {
          if (newGrid[row][col]) {
            coveredBlocks.push({row, col});
          }
        }
      }
      
      // Randomly destroy blocks
      while (destroyed < count && coveredBlocks.length > 0) {
        const randomIndex = Math.floor(Math.random() * coveredBlocks.length);
        const block = coveredBlocks.splice(randomIndex, 1)[0];
        newGrid[block.row][block.col] = false;
        destroyed++;
      }
      
      return newGrid;
    });

    // Spend the points
    onPointsSpent(cost);
  };

  const totalBlocks = GRID_WIDTH * GRID_HEIGHT;
  const revealedBlocks = cometBlocks.flat().filter(block => !block).length;
  const revealPercentage = (revealedBlocks / totalBlocks) * 100;

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '10px',
      alignItems: 'center',
    }}>
      {/* Image with comet block overlay */}
      <div style={{
        width: `${GRID_WIDTH * BLOCK_SIZE}px`,
        height: `${GRID_HEIGHT * BLOCK_SIZE}px`,
        position: 'relative',
        border: '3px solid #333',
        borderRadius: '8px',
        overflow: 'hidden',
        backgroundColor: '#000',
      }}>
        {/* The Sally Ride image */}
        <img
          src="/sally-ride.png"
          alt="Sally Ride"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            position: 'absolute',
            top: 0,
            left: 0,
          }}
        />
        
        {/* Comet block overlay */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          display: 'grid',
          gridTemplateColumns: `repeat(${GRID_WIDTH}, ${BLOCK_SIZE}px)`,
          gridTemplateRows: `repeat(${GRID_HEIGHT}, ${BLOCK_SIZE}px)`,
        }}>
          {cometBlocks.map((row, rowIndex) =>
            row.map((isCovered, colIndex) => (
              <div
                key={`${rowIndex}-${colIndex}`}
                onClick={() => handleCometClick(rowIndex, colIndex)}
                style={{
                  width: `${BLOCK_SIZE}px`,
                  height: `${BLOCK_SIZE}px`,
                  backgroundColor: isCovered ? '#000000' : 'transparent',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '8px',
                  transition: 'all 0.3s ease',
                  cursor: isCovered && availablePoints >= POINTS_PER_BLOCK ? 'pointer' : 'default',
                  opacity: 1, // Always fully opaque to hide Sally completely
                  filter: isCovered && availablePoints >= POINTS_PER_BLOCK ? 'brightness(1.2)' : (isCovered ? 'brightness(0.8)' : 'brightness(1)'),
                }}
              >
                {isCovered ? '☄️' : ''}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Controls */}
      <div style={{
        backgroundColor: 'rgba(0,0,0,0.8)',
        padding: '12px',
        borderRadius: '8px',
        border: '2px solid #333',
        textAlign: 'center',
        minWidth: '180px',
      }}>
        <div style={{ fontSize: '12px', marginBottom: '10px', color: '#ccc' }}>
          {Math.round(revealPercentage)}% revealed ({revealedBlocks}/{totalBlocks})
        </div>
        
        <div style={{ fontSize: '10px', marginBottom: '12px', color: '#aaa' }}>
          Available Points: {availablePoints}
        </div>

        <div style={{ fontSize: '9px', marginBottom: '8px', color: '#888' }}>
          Click comet blocks to destroy (10 pts each)
        </div>

        <div style={{ fontSize: '10px', marginBottom: '10px', color: '#bbb', fontWeight: 'bold' }}>
          Random Destruction:
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {destructionOptions.map((option) => (
            <button
              key={option.count}
              onClick={() => handleRandomDestruction(option.count, option.cost)}
              disabled={!option.enabled}
              style={{
                padding: '6px 10px',
                backgroundColor: option.enabled ? '#ff6b6b' : '#444',
                color: option.enabled ? '#fff' : '#888',
                border: 'none',
                borderRadius: '4px',
                cursor: option.enabled ? 'pointer' : 'not-allowed',
                fontSize: '10px',
                transition: 'all 0.2s ease',
              }}
            >
              {option.count} blocks ({option.cost} pts)
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};