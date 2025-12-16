import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Dimensions, View } from 'react-native';
import { RAINBOW_COLORS } from '../constants/colors';

const { width, height } = Dimensions.get('window');

interface Bubble {
  id: number;
  x: number;
  size: number;
  color: string;
  duration: number;
}

const generateBubbles = (count: number): Bubble[] => {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * (width - 40),
    size: 20 + Math.random() * 40,
    color: RAINBOW_COLORS[i % RAINBOW_COLORS.length],
    duration: 3000 + Math.random() * 4000,
  }));
};

export const FloatingBubbles: React.FC = () => {
  const bubbles = useRef(generateBubbles(8)).current;
  const animations = useRef(
    bubbles.map(() => new Animated.Value(height + 100))
  ).current;

  useEffect(() => {
    const animateBubble = (index: number) => {
      animations[index].setValue(height + 100);
      Animated.timing(animations[index], {
        toValue: -100,
        duration: bubbles[index].duration,
        useNativeDriver: true,
      }).start(() => animateBubble(index));
    };

    bubbles.forEach((_, index) => {
      setTimeout(() => animateBubble(index), index * 500);
    });
  }, [animations, bubbles]);

  return (
    <View style={styles.container} pointerEvents="none">
      {bubbles.map((bubble, index) => (
        <Animated.View
          key={bubble.id}
          style={[
            styles.bubble,
            {
              width: bubble.size,
              height: bubble.size,
              left: bubble.x,
              backgroundColor: bubble.color,
              opacity: 0.3,
              transform: [{ translateY: animations[index] }],
            },
          ]}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  bubble: {
    position: 'absolute',
    borderRadius: 100,
  },
});


