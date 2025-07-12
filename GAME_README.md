# 🚀 Space Tetris Game 🌌

A space-themed puzzle game combining Tetris mechanics with drag-and-drop gameplay. Players fill a 10x15 grid with space-themed Tetris blocks to complete rows and columns.

## 🎮 How to Play

### Controls
- **Click & Drag**: Select a piece from the right panel and drag it to the grid
- **Right-click or R key**: Rotate pieces while dragging
- **ESC**: Pause/resume game
- **Space**: Resume from pause

### Game Mechanics
1. **Objective**: Fill complete rows or columns to clear them and score points
2. **Placement**: Drag pieces from the right panel to valid positions on the grid
3. **Obstacles**: Random meteorites (🌑) are pre-placed as obstacles
4. **Line Clearing**: Complete rows AND columns are cleared simultaneously
5. **Game Over**: When no more valid moves are available

### Scoring System
- **Single line**: 100 points
- **Double line**: 300 points  
- **Triple line**: 500 points
- **Quad line**: 800 points
- **Level increases** every 10 lines cleared

### Space-Themed Pieces
- 🚀 **I-Piece**: Rocket Trail (4×1 line)
- 🌍 **O-Piece**: Planet Cluster (2×2 square)
- ⭐ **T-Piece**: Star Constellation (T-shape)
- 🛸 **L-Piece**: UFO Formation (L-shape)
- 🛰️ **J-Piece**: Satellite Array (J-shape)
- ☄️ **S-Piece**: Comet Trail (S-shape)
- 👨‍🚀 **Z-Piece**: Astronaut Team (Z-shape)

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation & Running
```bash
# Install dependencies
npm install

# Start development server
npm start

# Build for production
npm run build
```

The game will open at `http://localhost:3000` (or `http://localhost:3001` if 3000 is busy).

## 🎯 Game Features

### ✅ Implemented Features
- ✅ 10×15 game grid with space theme
- ✅ All 7 classic Tetris piece types with space emojis
- ✅ Drag and drop functionality with React DnD
- ✅ Piece rotation (right-click or R key)
- ✅ Line clearing for both rows and columns
- ✅ Scoring system with level progression
- ✅ Random meteorite obstacles
- ✅ Smooth animations with Framer Motion
- ✅ Game states (menu, playing, paused, game over)
- ✅ Keyboard controls
- ✅ Responsive design
- ✅ Visual feedback (valid/invalid placement)

### 🔮 Future Enhancements
- Sound effects and background music
- Power-ups (black hole, supernova, wormhole)
- Progressive difficulty with more obstacles
- High score persistence
- Mobile touch controls optimization
- Particle effects for line clears

## 🛠️ Tech Stack

- **React 18** with TypeScript
- **react-dnd** for drag and drop
- **Framer Motion** for animations
- **Zustand** for state management
- **react-use** for utility hooks

## 🎨 Design

The game features a dark space theme with:
- Deep space black background with stars
- Colorful space-themed pieces
- Smooth animations and transitions
- Visual feedback for piece placement
- Responsive grid layout

Enjoy your space adventure! 🌌🚀