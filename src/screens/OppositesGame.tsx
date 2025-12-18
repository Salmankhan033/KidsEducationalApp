import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Animated,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '../constants/colors';
import { speakWord, speakCelebration, stopSpeaking } from '../utils/speech';
import { ScreenHeader } from '../components';
import { SCREEN_ICONS } from '../assets/images';
import Svg, { Line } from 'react-native-svg';

const { width, height } = Dimensions.get('window');

// Opposites matching data
const OPPOSITE_LEVELS = [
  {
    pairs: [
      { left: { emoji: '🔥', name: 'Hot' }, right: { emoji: '🧊', name: 'Cold' }, color: '#FF6B6B' },
      { left: { emoji: '😊', name: 'Happy' }, right: { emoji: '😢', name: 'Sad' }, color: '#4ECDC4' },
      { left: { emoji: '🐇', name: 'Fast' }, right: { emoji: '🐢', name: 'Slow' }, color: '#FFE66D' },
    ],
  },
  {
    pairs: [
      { left: { emoji: '☀️', name: 'Day' }, right: { emoji: '🌙', name: 'Night' }, color: '#FFA500' },
      { left: { emoji: '⬆️', name: 'Up' }, right: { emoji: '⬇️', name: 'Down' }, color: '#9B59B6' },
      { left: { emoji: '🐘', name: 'Big' }, right: { emoji: '🐜', name: 'Small' }, color: '#3498DB' },
    ],
  },
  {
    pairs: [
      { left: { emoji: '💪', name: 'Strong' }, right: { emoji: '🪶', name: 'Weak' }, color: '#E74C3C' },
      { left: { emoji: '🔊', name: 'Loud' }, right: { emoji: '🤫', name: 'Quiet' }, color: '#1ABC9C' },
      { left: { emoji: '🌞', name: 'Light' }, right: { emoji: '🌑', name: 'Dark' }, color: '#F39C12' },
    ],
  },
  {
    pairs: [
      { left: { emoji: '🥵', name: 'Warm' }, right: { emoji: '🥶', name: 'Cool' }, color: '#E91E63' },
      { left: { emoji: '😄', name: 'Laugh' }, right: { emoji: '😭', name: 'Cry' }, color: '#00BCD4' },
      { left: { emoji: '🏃', name: 'Run' }, right: { emoji: '🧘', name: 'Sit' }, color: '#8BC34A' },
    ],
  },
];

interface OppositesGameProps {
  navigation: any;
}

export const OppositesGame: React.FC<OppositesGameProps> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [currentLevel, setCurrentLevel] = useState(0);
  const [selectedLeft, setSelectedLeft] = useState<number | null>(null);
  const [connections, setConnections] = useState<{ leftIdx: number; rightIdx: number; color: string }[]>([]);
  const [shuffledRight, setShuffledRight] = useState<{ emoji: string; name: string; originalIdx: number }[]>([]);
  const [score, setScore] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);
  
  const celebrationAnim = useRef(new Animated.Value(0)).current;
  const itemAnims = useRef([0, 1, 2].map(() => new Animated.Value(0))).current;
  
  const leftPositions = useRef<{ [key: number]: { x: number; y: number } }>({});
  const rightPositions = useRef<{ [key: number]: { x: number; y: number } }>({});

  const level = OPPOSITE_LEVELS[currentLevel];

  const shuffleArray = <T extends { emoji: string; name: string }>(array: T[]): (T & { originalIdx: number })[] => {
    const withIndex = array.map((item, idx) => ({ ...item, originalIdx: idx }));
    for (let i = withIndex.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [withIndex[i], withIndex[j]] = [withIndex[j], withIndex[i]];
    }
    return withIndex;
  };

  const initializeLevel = useCallback(() => {
    setConnections([]);
    setSelectedLeft(null);
    setShuffledRight(shuffleArray(OPPOSITE_LEVELS[currentLevel].pairs.map(p => p.right)));
    setShowCelebration(false);
    celebrationAnim.setValue(0);
    leftPositions.current = {};
    rightPositions.current = {};
    
    itemAnims.forEach((anim, index) => {
      anim.setValue(0);
      Animated.spring(anim, {
        toValue: 1,
        friction: 5,
        tension: 60,
        delay: index * 100,
        useNativeDriver: true,
      }).start();
    });
    
    speakWord('Match the opposites!');
  }, [currentLevel, celebrationAnim, itemAnims]);

  useEffect(() => {
    initializeLevel();
    return () => stopSpeaking();
  }, [currentLevel, initializeLevel]);

  const handleLeftPress = (idx: number) => {
    if (connections.find(c => c.leftIdx === idx)) return;
    setSelectedLeft(idx);
    speakWord(level.pairs[idx].left.name);
  };

  const handleRightPress = (shuffledIdx: number) => {
    if (selectedLeft === null) {
      speakWord('First tap an item on the left!');
      return;
    }
    
    const rightItem = shuffledRight[shuffledIdx];
    if (connections.find(c => c.rightIdx === rightItem.originalIdx)) return;
    
    const isCorrect = selectedLeft === rightItem.originalIdx;
    
    if (isCorrect) {
      const newConnections = [...connections, { 
        leftIdx: selectedLeft, 
        rightIdx: rightItem.originalIdx, 
        color: level.pairs[selectedLeft].color 
      }];
      setConnections(newConnections);
      setScore(score + 10);
      
      speakWord(`Correct! ${level.pairs[selectedLeft].left.name} and ${rightItem.name} are opposites!`);
      
      if (newConnections.length === level.pairs.length) {
        setShowCelebration(true);
        speakCelebration();
        
        Animated.spring(celebrationAnim, {
          toValue: 1,
          friction: 3,
          tension: 40,
          useNativeDriver: true,
        }).start();
        
        setTimeout(() => {
          setCurrentLevel((currentLevel + 1) % OPPOSITE_LEVELS.length);
        }, 2000);
      }
    } else {
      speakWord('Try again! These are not opposites.');
    }
    
    setSelectedLeft(null);
  };

  const resetGame = () => {
    setCurrentLevel(0);
    setScore(0);
    initializeLevel();
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScreenHeader
        title="Opposites"
        icon={SCREEN_ICONS.puzzle}
        onBack={() => { stopSpeaking(); navigation.goBack(); }}
      />

      {/* Score & Progress */}
      <View style={styles.topRow}>
        <View style={styles.scoreBox}>
          <Text style={styles.scoreLabel}>⭐ Score</Text>
          <Text style={styles.scoreValue}>{score}</Text>
        </View>
        <View style={styles.levelBox}>
          <Text style={styles.levelText}>Level {currentLevel + 1}/{OPPOSITE_LEVELS.length}</Text>
        </View>
      </View>

      {/* Instructions */}
      <View style={styles.instructionBox}>
        <Text style={styles.instructionText}>
          🔄 Match the opposites!
        </Text>
      </View>

      {/* Game Area */}
      <View style={styles.gameArea}>
        {/* SVG Lines */}
        <Svg style={StyleSheet.absoluteFill}>
          {connections.map((conn, index) => {
            const leftPos = leftPositions.current[conn.leftIdx];
            const rightPos = rightPositions.current[conn.rightIdx];
            if (!leftPos || !rightPos) return null;
            
            // Calculate proper line positions
            const columnWidth = (width - 80) / 2;
            const lineStartX = columnWidth; // Right edge of left column
            const lineEndX = width - 60 - columnWidth; // Left edge of right column
            
            return (
              <Line
                key={index}
                x1={lineStartX}
                y1={leftPos.y}
                x2={lineEndX}
                y2={rightPos.y}
                stroke={conn.color}
                strokeWidth={8}
                strokeLinecap="round"
              />
            );
          })}
        </Svg>

        {/* Left Column */}
        <View style={styles.column}>
          {level.pairs.map((pair, index) => {
            const isConnected = connections.find(c => c.leftIdx === index);
            const isSelected = selectedLeft === index;
            
            return (
              <Animated.View
                key={index}
                style={[{ transform: [{ scale: itemAnims[index] }] }]}
                onLayout={(e) => {
                  const { y, height: h } = e.nativeEvent.layout;
                  leftPositions.current[index] = { x: 0, y: y + h / 2 };
                }}
              >
                <TouchableOpacity
                  onPress={() => handleLeftPress(index)}
                  style={[
                    styles.itemCard,
                    { borderColor: pair.color },
                    isSelected && styles.selectedCard,
                    isConnected && styles.connectedCard,
                  ]}
                  disabled={!!isConnected}
                >
                  <Text style={styles.itemEmoji}>{pair.left.emoji}</Text>
                  <Text style={styles.itemName}>{pair.left.name}</Text>
                </TouchableOpacity>
              </Animated.View>
            );
          })}
        </View>

        {/* Right Column */}
        <View style={styles.column}>
          {shuffledRight.map((item, shuffledIdx) => {
            const isConnected = connections.find(c => c.rightIdx === item.originalIdx);
            
            return (
              <Animated.View
                key={shuffledIdx}
                style={[{ transform: [{ scale: itemAnims[shuffledIdx] }] }]}
                onLayout={(e) => {
                  const { x, y, width: w, height: h } = e.nativeEvent.layout;
                  rightPositions.current[item.originalIdx] = { x: 0, y: y + h / 2 };
                }}
              >
                <TouchableOpacity
                  onPress={() => handleRightPress(shuffledIdx)}
                  style={[
                    styles.itemCard,
                    { borderColor: level.pairs[item.originalIdx].color },
                    isConnected && styles.connectedCard,
                  ]}
                  disabled={!!isConnected}
                >
                  <Text style={styles.itemEmoji}>{item.emoji}</Text>
                  <Text style={styles.itemName}>{item.name}</Text>
                </TouchableOpacity>
              </Animated.View>
            );
          })}
        </View>
      </View>

      {/* Celebration Overlay */}
      {showCelebration && (
        <Animated.View 
          style={[
            styles.celebrationOverlay,
            { transform: [{ scale: celebrationAnim }] }
          ]}
        >
          <View style={styles.celebrationCard}>
            <Text style={styles.celebrationEmoji}>🎉</Text>
            <Text style={styles.celebrationText}>Awesome!</Text>
            <Text style={styles.celebrationSubtext}>You know your opposites!</Text>
          </View>
        </Animated.View>
      )}

      {/* Bottom Buttons */}
      <View style={styles.buttonRow}>
        <TouchableOpacity onPress={resetGame} style={styles.resetButton}>
          <Text style={styles.buttonEmoji}>🔄</Text>
          <Text style={styles.buttonText}>Reset</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          onPress={() => setCurrentLevel((currentLevel + 1) % OPPOSITE_LEVELS.length)} 
          style={styles.nextButton}
        >
          <Text style={styles.buttonEmoji}>➡️</Text>
          <Text style={styles.buttonText}>Next</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#5D4037', // Brown wooden background
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  scoreBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFD700',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 8,
  },
  scoreLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
  },
  scoreValue: {
    fontSize: 22,
    fontWeight: '900',
    color: '#333',
  },
  levelBox: {
    backgroundColor: '#E91E63',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  levelText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFF',
  },
  instructionBox: {
    backgroundColor: '#FFC107',
    marginHorizontal: 20,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginBottom: 15,
    alignItems: 'center',
  },
  instructionText: {
    fontSize: 18,
    color: '#333',
    fontWeight: '700',
  },
  gameArea: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginHorizontal: 10,
  },
  column: {
    justifyContent: 'space-around',
    alignItems: 'center',
    width: (width - 80) / 2,
  },
  itemCard: {
    width: (width - 100) / 2,
    paddingVertical: 15,
    borderRadius: 20,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
  },
  selectedCard: {
    transform: [{ scale: 1.05 }],
    shadowOpacity: 0.5,
  },
  connectedCard: {
    opacity: 0.5,
  },
  itemEmoji: {
    fontSize: 50,
    marginBottom: 5,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
  },
  celebrationOverlay: {
    position: 'absolute',
    top: '40%',
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 100,
  },
  celebrationCard: {
    backgroundColor: '#FFD700',
    paddingHorizontal: 40,
    paddingVertical: 25,
    borderRadius: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
    borderWidth: 4,
    borderColor: '#FFF',
  },
  celebrationEmoji: {
    fontSize: 50,
  },
  celebrationText: {
    fontSize: 28,
    fontWeight: '900',
    color: '#333',
    marginTop: 5,
  },
  celebrationSubtext: {
    fontSize: 16,
    fontWeight: '600',
    color: '#555',
    marginTop: 5,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
    gap: 15,
  },
  resetButton: {
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 25,
    paddingVertical: 15,
    borderRadius: 25,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  nextButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  buttonEmoji: {
    fontSize: 20,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.white,
  },
});

