// Vibrant colors for kids - Rainbow palette
export const COLORS = {
  // Primary Colors
  red: '#FF6B6B',
  orange: '#FFA94D',
  yellow: '#FFD93D',
  green: '#6BCB77',
  blue: '#4D96FF',
  purple: '#9B59B6',
  pink: '#FF6B9D',
  
  // Background Colors
  lightPink: '#FFE5EC',
  lightBlue: '#E3F2FD',
  lightGreen: '#E8F5E9',
  lightYellow: '#FFF9C4',
  lightPurple: '#F3E5F5',
  lightOrange: '#FFF3E0',
  
  // UI Colors
  white: '#FFFFFF',
  black: '#333333',
  gray: '#9E9E9E',
  lightGray: '#F5F5F5',
  
  // Gradient Colors
  gradientStart: '#FF9A9E',
  gradientEnd: '#FECFEF',
  
  // Game Colors
  correct: '#4CAF50',
  wrong: '#F44336',
  star: '#FFD700',
};

// Rainbow colors for alphabets
export const RAINBOW_COLORS = [
  '#FF6B6B', // Red
  '#FF8E53', // Orange-Red
  '#FFA94D', // Orange
  '#FFD93D', // Yellow
  '#6BCB77', // Green
  '#4ECDC4', // Teal
  '#4D96FF', // Blue
  '#9B59B6', // Purple
  '#FF6B9D', // Pink
  '#E91E63', // Deep Pink
];

// Get color for alphabet based on index
export const getAlphabetColor = (index: number): string => {
  return RAINBOW_COLORS[index % RAINBOW_COLORS.length];
};


