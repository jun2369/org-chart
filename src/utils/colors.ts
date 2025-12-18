// Color scheme for different levels
const LEVEL_COLORS = [
  // Level 0 (Root node)
  { from: '#4c63d2', to: '#5a3d8f' },
  // Level 1
  { from: '#d67ae8', to: '#d43d5c' },
  // Level 2
  { from: '#2d8fd6', to: '#00c8d6' },
  // Level 3
  { from: '#2dd169', to: '#2dd1b8' },
  // Level 4
  { from: '#e85a7a', to: '#e6c52d' },
  // Level 5
  { from: '#1fa8a9', to: '#1f0554' },
  // Level 6
  { from: '#7dd1c8', to: '#e6a8c0' },
  // Level 7+
  { from: '#e67a8a', to: '#e6a8d6' },
];

// Get color by level
export const getLevelColor = (level: number): { from: string; to: string } => {
  if (level < LEVEL_COLORS.length) {
    return LEVEL_COLORS[level];
  }
  // If level exceeds defined colors, cycle through them
  return LEVEL_COLORS[level % LEVEL_COLORS.length];
};

// Generate CSS gradient background
export const getGradientStyle = (level: number): { background: string } => {
  const color = getLevelColor(level);
  return {
    background: `linear-gradient(135deg, ${color.from} 0%, ${color.to} 100%)`,
  };
};

