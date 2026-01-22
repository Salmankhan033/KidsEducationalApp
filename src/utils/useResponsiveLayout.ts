import { useState, useEffect } from 'react';
import { Dimensions, ScaledSize } from 'react-native';

interface ResponsiveLayout {
  width: number;
  height: number;
  isLandscape: boolean;
  // Responsive sizes
  cardWidth: (columns: number, gap?: number, padding?: number) => number;
  fontSize: (base: number) => number;
  spacing: (base: number) => number;
  iconSize: (base: number) => number;
  // Presets for common layouts
  gridColumns: number;
  headerHeight: number;
  cardPadding: number;
  contentPadding: number;
}

export const useResponsiveLayout = (): ResponsiveLayout => {
  const [dimensions, setDimensions] = useState<ScaledSize>(Dimensions.get('window'));

  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setDimensions(window);
    });
    return () => subscription?.remove();
  }, []);

  const { width, height } = dimensions;
  const isLandscape = width > height;

  // Calculate card width based on columns
  const cardWidth = (columns: number, gap: number = 10, padding: number = 15) => {
    const totalGaps = gap * (columns - 1);
    const totalPadding = padding * 2;
    return (width - totalGaps - totalPadding) / columns;
  };

  // Scale font size based on orientation
  const fontSize = (base: number) => {
    if (isLandscape) {
      return Math.round(base * 0.85);
    }
    return base;
  };

  // Scale spacing based on orientation
  const spacing = (base: number) => {
    if (isLandscape) {
      return Math.round(base * 0.75);
    }
    return base;
  };

  // Scale icon size based on orientation
  const iconSize = (base: number) => {
    if (isLandscape) {
      return Math.round(base * 0.8);
    }
    return base;
  };

  // Presets
  const gridColumns = isLandscape ? 5 : 2;
  const headerHeight = isLandscape ? 50 : 60;
  const cardPadding = isLandscape ? 10 : 15;
  const contentPadding = isLandscape ? 10 : 15;

  return {
    width,
    height,
    isLandscape,
    cardWidth,
    fontSize,
    spacing,
    iconSize,
    gridColumns,
    headerHeight,
    cardPadding,
    contentPadding,
  };
};

// Static helper for getting initial dimensions (for StyleSheet)
export const getInitialDimensions = () => {
  const { width, height } = Dimensions.get('window');
  return { width, height, isLandscape: width > height };
};

