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

// Matching game data - Letters to Pictures
const MATCH_LEVELS = [
  {
    leftItems: [
      { id: 'A', label: 'A', color: '#FF6B6B' },
      { id: 'B', label: 'B', color: '#4ECDC4' },
      { id: 'C', label: 'C', color: '#FFE66D' },
      { id: 'D', label: 'D', color: '#95E1D3' },
    ],
    rightItems: [
      { id: 'A', emoji: '🍎', name: 'Apple' },
      { id: 'B', emoji: '⚽', name: 'Ball' },
      { id: 'C', emoji: '🐱', name: 'Cat' },
      { id: 'D', emoji: '🐕', name: 'Dog' },
    ],
  },
  {
    leftItems: [
      { id: 'E', label: 'E', color: '#A8E6CF' },
      { id: 'F', label: 'F', color: '#DDA0DD' },
      { id: 'G', label: 'G', color: '#87CEEB' },
      { id: 'H', label: 'H', color: '#FFA07A' },
    ],
    rightItems: [
      { id: 'E', emoji: '🐘', name: 'Elephant' },
      { id: 'F', emoji: '🐸', name: 'Frog' },
      { id: 'G', emoji: '🍇', name: 'Grapes' },
      { id: 'H', emoji: '🏠', name: 'House' },
    ],
  },
  {
    leftItems: [
      { id: 'I', label: 'I', color: '#FFB6C1' },
      { id: 'J', label: 'J', color: '#98D8C8' },
      { id: 'K', label: 'K', color: '#F7DC6F' },
      { id: 'L', label: 'L', color: '#BB8FCE' },
    ],
    rightItems: [
      { id: 'I', emoji: '🍦', name: 'Ice cream' },
      { id: 'J', emoji: '🧃', name: 'Juice' },
      { id: 'K', emoji: '🪁', name: 'Kite' },
      { id: 'L', emoji: '🦁', name: 'Lion' },
    ],
  },
];

interface MatchLineGameProps {
  navigation: any;
}

const LINE_COLORS = ['#FF6B6B', '#4ECDC4', '#FFE66D', '#95E1D3', '#A8E6CF', '#DDA0DD'];

export const MatchLineGame: React.FC<MatchLineGameProps> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [currentLevel, setCurrentLevel] = useState(0);
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
  const [connections, setConnections] = useState<{ left: string; right: string; color: string }[]>([]);
  const [shuffledRight, setShuffledRight] = useState<typeof MATCH_LEVELS[0]['rightItems']>([]);
  const [score, setScore] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);
  
  const celebrationAnim = useRef(new Animated.Value(0)).current;
  const itemAnims = useRef(MATCH_LEVELS[0].leftItems.map(() => new Animated.Value(0))).current;
  
  // Position refs for drawing lines
  const leftPositions = useRef<{ [key: string]: { x: number; y: number } }>({});
  const rightPositions = useRef<{ [key: string]: { x: number; y: number } }>({});
  const containerRef = useRef<View>(null);
  const [containerLayout, setContainerLayout] = useState({ x: 0, y: 0, width: 0, height: 0 });

  const level = MATCH_LEVELS[currentLevel];

  const shuffleArray = <T,>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const initializeLevel = useCallback(() => {
    setConnections([]);
    setSelectedLeft(null);
    setShuffledRight(shuffleArray(MATCH_LEVELS[currentLevel].rightItems));
    setShowCelebration(false);
    celebrationAnim.setValue(0);
    
    // Animate items in
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
    
    speakWord('Match the letters to the pictures!');
  }, [currentLevel, celebrationAnim, itemAnims]);

  useEffect(() => {
    initializeLevel();
    return () => stopSpeaking();
  }, [currentLevel, initializeLevel]);

  const handleLeftPress = (id: string) => {
    // Check if already connected
    if (connections.find(c => c.left === id)) return;
    
    setSelectedLeft(id);
    speakWord(id);
  };

  const handleRightPress = (id: string) => {
    if (!selectedLeft) {
      speakWord('First tap a letter on the left!');
      return;
    }
    
    // Check if already connected
    if (connections.find(c => c.right === id)) return;
    
    const isCorrect = selectedLeft === id;
    const colorIndex = connections.length % LINE_COLORS.length;
    
    if (isCorrect) {
      const newConnections = [...connections, { left: selectedLeft, right: id, color: LINE_COLORS[colorIndex] }];
      setConnections(newConnections);
      setScore(score + 10);
      
      const rightItem = shuffledRight.find(item => item.id === id);
      speakWord(`Correct! ${selectedLeft} for ${rightItem?.name}`);
      
      // Check if level complete
      if (newConnections.length === level.leftItems.length) {
        setShowCelebration(true);
        speakCelebration();
        
        Animated.spring(celebrationAnim, {
          toValue: 1,
          friction: 3,
          tension: 40,
          useNativeDriver: true,
        }).start();
        
        // Auto advance after 2 seconds
        setTimeout(() => {
          if (currentLevel < MATCH_LEVELS.length - 1) {
            setCurrentLevel(currentLevel + 1);
          } else {
            setCurrentLevel(0);
          }
        }, 2000);
      }
    } else {
      speakWord('Try again!');
    }
    
    setSelectedLeft(null);
  };

  const resetGame = () => {
    setCurrentLevel(0);
    setScore(0);
    initializeLevel();
  };

  const ITEM_SIZE = 70;
  const GAME_AREA_HEIGHT = height * 0.55;
  const GAME_AREA_PADDING = 30;
  const COLUMN_WIDTH = 80;
  const GAME_AREA_WIDTH = width - 30; // Account for margins

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScreenHeader
        title="Match Lines"
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
          <Text style={styles.levelText}>Level {currentLevel + 1}/{MATCH_LEVELS.length}</Text>
        </View>
      </View>

      {/* Instructions */}
      <View style={styles.instructionBox}>
        <Text style={styles.instructionText}>
          👆 Tap a letter, then tap the matching picture!
        </Text>
      </View>

      {/* Game Area */}
      <View 
        ref={containerRef}
        style={[styles.gameArea, { height: GAME_AREA_HEIGHT }]}
        onLayout={(e) => {
          const { width: w, height: h } = e.nativeEvent.layout;
          setContainerLayout({ x: 0, y: 0, width: w, height: h });
        }}
      >
        {/* SVG Lines */}
        <Svg style={StyleSheet.absoluteFill}>
          {connections.map((conn, index) => {
            const leftPos = leftPositions.current[conn.left];
            const rightPos = rightPositions.current[conn.right];
            if (!leftPos || !rightPos) return null;
            
            // Calculate line start (right edge of left column) and end (left edge of right column)
            const gameWidth = containerLayout.width || (width - 30);
            const lineStartX = GAME_AREA_PADDING + COLUMN_WIDTH; // Right edge of left column
            const lineEndX = gameWidth - GAME_AREA_PADDING - COLUMN_WIDTH; // Left edge of right column
            
            return (
              <Line
                key={index}
                x1={lineStartX}
                y1={leftPos.y}
                x2={lineEndX}
                y2={rightPos.y}
                stroke={conn.color}
                strokeWidth={6}
                strokeLinecap="round"
              />
            );
          })}
        </Svg>

        {/* Left Column - Letters */}
        <View style={styles.leftColumn}>
          {level.leftItems.map((item, index) => {
            const isConnected = connections.find(c => c.left === item.id);
            const isSelected = selectedLeft === item.id;
            
            return (
              <Animated.View
                key={item.id}
                style={[
                  { transform: [{ scale: itemAnims[index] }] },
                ]}
                onLayout={(e) => {
                  const { y, height: h } = e.nativeEvent.layout;
                  leftPositions.current[item.id] = { x: 0, y: y + h / 2 };
                }}
              >
                <TouchableOpacity
                  onPress={() => handleLeftPress(item.id)}
                  style={[
                    styles.letterCard,
                    { backgroundColor: item.color },
                    isSelected && styles.selectedCard,
                    isConnected && styles.connectedCard,
                  ]}
                  disabled={!!isConnected}
                >
                  <Text style={styles.letterText}>{item.label}</Text>
                </TouchableOpacity>
              </Animated.View>
            );
          })}
        </View>

        {/* Right Column - Pictures */}
        <View style={styles.rightColumn}>
          {shuffledRight.map((item, index) => {
            const isConnected = connections.find(c => c.right === item.id);
            
            return (
              <Animated.View
                key={item.id}
                style={[
                  { transform: [{ scale: itemAnims[index] }] },
                ]}
                onLayout={(e) => {
                  const { y, height: h } = e.nativeEvent.layout;
                  rightPositions.current[item.id] = { x: 0, y: y + h / 2 };
                }}
              >
                <TouchableOpacity
                  onPress={() => handleRightPress(item.id)}
                  style={[
                    styles.pictureCard,
                    isConnected && styles.connectedCard,
                  ]}
                  disabled={!!isConnected}
                >
                  <Text style={styles.pictureEmoji}>{item.emoji}</Text>
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
            <Text style={styles.celebrationText}>Perfect!</Text>
            <Text style={styles.celebrationSubtext}>All matched correctly!</Text>
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
          onPress={() => {
            setCurrentLevel((currentLevel + 1) % MATCH_LEVELS.length);
          }} 
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
    backgroundColor: '#8B4513', // Wooden background color
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
    backgroundColor: '#A855F7',
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
    backgroundColor: '#87CEEB',
    marginHorizontal: 20,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginBottom: 15,
    alignItems: 'center',
  },
  instructionText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '700',
  },
  gameArea: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 30,
    backgroundColor: '#87CEEB',
    marginHorizontal: 15,
    borderRadius: 25,
    paddingVertical: 20,
  },
  leftColumn: {
    justifyContent: 'space-around',
    alignItems: 'center',
    width: 80,
  },
  rightColumn: {
    justifyContent: 'space-around',
    alignItems: 'center',
    width: 80,
  },
  letterCard: {
    width: 70,
    height: 70,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#FFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  selectedCard: {
    borderColor: '#333',
    borderWidth: 5,
    transform: [{ scale: 1.1 }],
  },
  connectedCard: {
    opacity: 0.6,
  },
  letterText: {
    fontSize: 36,
    fontWeight: '900',
    color: '#FFF',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  pictureCard: {
    width: 70,
    height: 70,
    borderRadius: 15,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#4CAF50',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  pictureEmoji: {
    fontSize: 40,
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
