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

const { width } = Dimensions.get('window');

// Shape matching game - Find which shape fits in the object
const SHAPE_PUZZLES = [
  {
    objects: [
      { emoji: '🫑', name: 'Pepper', shape: '⬡', shapeName: 'Hexagon' },
      { emoji: '🍉', name: 'Watermelon', shape: '⭐', shapeName: 'Star' },
    ],
    shapeOptions: ['⭐', '⬡', '⬢', '◆'],
    correctIndices: [1, 0], // Maps to which option matches which object
    bgColor: '#E91E63',
  },
  {
    objects: [
      { emoji: '🍪', name: 'Cookie', shape: '●', shapeName: 'Circle' },
      { emoji: '🎁', name: 'Gift', shape: '■', shapeName: 'Square' },
    ],
    shapeOptions: ['●', '▲', '■', '◆'],
    correctIndices: [0, 2],
    bgColor: '#FF9800',
  },
  {
    objects: [
      { emoji: '🔔', name: 'Bell', shape: '▲', shapeName: 'Triangle' },
      { emoji: '📱', name: 'Phone', shape: '▬', shapeName: 'Rectangle' },
    ],
    shapeOptions: ['●', '▲', '▬', '⬡'],
    correctIndices: [1, 2],
    bgColor: '#9C27B0',
  },
  {
    objects: [
      { emoji: '💎', name: 'Diamond', shape: '◆', shapeName: 'Diamond' },
      { emoji: '⚽', name: 'Ball', shape: '●', shapeName: 'Circle' },
    ],
    shapeOptions: ['■', '◆', '●', '▲'],
    correctIndices: [1, 2],
    bgColor: '#2196F3',
  },
  {
    objects: [
      { emoji: '🏠', name: 'House', shape: '▲', shapeName: 'Triangle' },
      { emoji: '📺', name: 'TV', shape: '■', shapeName: 'Square' },
    ],
    shapeOptions: ['●', '▲', '◆', '■'],
    correctIndices: [1, 3],
    bgColor: '#4CAF50',
  },
];

interface ShapeInObjectGameProps {
  navigation: any;
}

export const ShapeInObjectGame: React.FC<ShapeInObjectGameProps> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [currentPuzzle, setCurrentPuzzle] = useState(0);
  const [matchedShapes, setMatchedShapes] = useState<number[]>([]);
  const [score, setScore] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);
  
  const celebrationAnim = useRef(new Animated.Value(0)).current;
  const cardAnims = useRef([0, 1, 2, 3].map(() => new Animated.Value(0))).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const objectAnims = useRef([new Animated.Value(0), new Animated.Value(0)]).current;

  const puzzle = SHAPE_PUZZLES[currentPuzzle];

  const initializePuzzle = useCallback(() => {
    setMatchedShapes([]);
    setShowCelebration(false);
    celebrationAnim.setValue(0);
    
    // Animate objects
    objectAnims.forEach((anim, index) => {
      anim.setValue(0);
      Animated.spring(anim, {
        toValue: 1,
        friction: 4,
        tension: 50,
        delay: index * 150,
        useNativeDriver: true,
      }).start();
    });
    
    // Animate shape options
    cardAnims.forEach((anim, index) => {
      anim.setValue(0);
      Animated.spring(anim, {
        toValue: 1,
        friction: 5,
        tension: 60,
        delay: index * 100 + 300,
        useNativeDriver: true,
      }).start();
    });
    
    speakWord('Find the matching shapes!');
  }, [currentPuzzle, celebrationAnim, cardAnims, objectAnims]);

  useEffect(() => {
    initializePuzzle();
    return () => stopSpeaking();
  }, [currentPuzzle, initializePuzzle]);

  const handleShapePress = (shapeIndex: number) => {
    // Check if already matched
    if (matchedShapes.includes(shapeIndex)) return;
    
    // Check if this is a correct match
    const isCorrect = puzzle.correctIndices.includes(shapeIndex);
    
    if (isCorrect) {
      const newMatched = [...matchedShapes, shapeIndex];
      setMatchedShapes(newMatched);
      setScore(score + 5);
      
      const matchedObjectIndex = puzzle.correctIndices.indexOf(shapeIndex);
      const shapeName = puzzle.objects[matchedObjectIndex]?.shapeName || 'shape';
      speakWord(`Great! That's the ${shapeName}!`);
      
      // Check if all matched
      if (newMatched.length === puzzle.correctIndices.length) {
        setShowCelebration(true);
        speakCelebration();
        
        Animated.spring(celebrationAnim, {
          toValue: 1,
          friction: 3,
          tension: 40,
          useNativeDriver: true,
        }).start();
        
        // Auto advance
        setTimeout(() => {
          nextPuzzle();
        }, 1500);
      }
    } else {
      speakWord('Not quite! Try another shape.');
      
      // Shake animation
      Animated.sequence([
        Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
      ]).start();
    }
  };

  const nextPuzzle = () => {
    setCurrentPuzzle((currentPuzzle + 1) % SHAPE_PUZZLES.length);
  };

  const resetGame = () => {
    setCurrentPuzzle(0);
    setScore(0);
    initializePuzzle();
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScreenHeader
        title="Shape Match"
        icon={SCREEN_ICONS.shapes}
        onBack={() => { stopSpeaking(); navigation.goBack(); }}
      />

      {/* Score & Progress */}
      <View style={styles.topRow}>
        <View style={styles.scoreBox}>
          <Text style={styles.scoreLabel}>⭐ Score</Text>
          <Text style={styles.scoreValue}>{score}</Text>
        </View>
        <View style={styles.progressBox}>
          <Text style={styles.progressText}>{currentPuzzle + 1}/{SHAPE_PUZZLES.length}</Text>
        </View>
      </View>

      {/* Instructions */}
      <View style={[styles.instructionBox, { backgroundColor: puzzle.bgColor }]}>
        <Text style={styles.instructionText}>
          🔷 Find the shape that matches!
        </Text>
      </View>

      {/* Objects with Shapes */}
      <View style={[styles.objectsRow, { backgroundColor: puzzle.bgColor }]}>
        {puzzle.objects.map((obj, index) => {
          const isMatched = matchedShapes.includes(puzzle.correctIndices[index]);
          
          return (
            <Animated.View 
              key={index}
              style={[
                styles.objectCard,
                { transform: [{ scale: objectAnims[index] }] },
                isMatched && styles.matchedObjectCard,
              ]}
            >
              <Text style={styles.objectEmoji}>{obj.emoji}</Text>
              <View style={[
                styles.shapeHole,
                isMatched && styles.matchedShapeHole,
              ]}>
                <Text style={[
                  styles.shapeInHole,
                  isMatched && styles.matchedShapeText,
                ]}>
                  {obj.shape}
                </Text>
              </View>
              {isMatched && (
                <View style={styles.checkBadge}>
                  <Text style={styles.checkText}>✓</Text>
                </View>
              )}
            </Animated.View>
          );
        })}
      </View>

      {/* Shape Options */}
      <Animated.View 
        style={[
          styles.shapesContainer,
          { transform: [{ translateX: shakeAnim }] }
        ]}
      >
        <View style={styles.shapesGrid}>
          {puzzle.shapeOptions.map((shape, index) => {
            const isMatched = matchedShapes.includes(index);
            const isCorrectShape = puzzle.correctIndices.includes(index);
            
            return (
              <Animated.View
                key={index}
                style={[
                  styles.shapeWrapper,
                  { transform: [{ scale: cardAnims[index] }] }
                ]}
              >
                <TouchableOpacity
                  onPress={() => handleShapePress(index)}
                  style={[
                    styles.shapeCard,
                    isMatched && styles.matchedShapeCard,
                  ]}
                  disabled={isMatched}
                  activeOpacity={0.7}
                >
                  <Text style={[
                    styles.shapeEmoji,
                    isMatched && styles.matchedShapeEmoji,
                  ]}>
                    {shape}
                  </Text>
                  
                  {isMatched && (
                    <View style={styles.matchedBadge}>
                      <Text style={styles.matchedBadgeText}>✓</Text>
                    </View>
                  )}
                </TouchableOpacity>
              </Animated.View>
            );
          })}
        </View>
      </Animated.View>

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
            <Text style={styles.celebrationText}>Great Job!</Text>
            <Text style={styles.celebrationSubtext}>All shapes matched!</Text>
          </View>
        </Animated.View>
      )}

      {/* Bottom Buttons */}
      <View style={styles.buttonRow}>
        <TouchableOpacity onPress={resetGame} style={styles.resetButton}>
          <Text style={styles.buttonEmoji}>🔄</Text>
          <Text style={styles.buttonText}>Reset</Text>
        </TouchableOpacity>
        
        <TouchableOpacity onPress={nextPuzzle} style={styles.nextButton}>
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
    backgroundColor: '#5D4037',
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
  progressBox: {
    backgroundColor: '#A855F7',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  progressText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFF',
  },
  instructionBox: {
    marginHorizontal: 20,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginBottom: 15,
    alignItems: 'center',
  },
  instructionText: {
    fontSize: 18,
    color: '#FFF',
    fontWeight: '700',
  },
  objectsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    paddingVertical: 25,
    marginHorizontal: 20,
    borderRadius: 25,
    marginBottom: 20,
  },
  objectCard: {
    width: 130,
    height: 150,
    backgroundColor: '#FFF',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
  },
  matchedObjectCard: {
    borderColor: '#4CAF50',
    backgroundColor: '#E8F5E9',
  },
  objectEmoji: {
    fontSize: 60,
    marginBottom: 10,
  },
  shapeHole: {
    width: 50,
    height: 50,
    backgroundColor: '#333',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  matchedShapeHole: {
    backgroundColor: '#4CAF50',
  },
  shapeInHole: {
    fontSize: 30,
    color: '#666',
  },
  matchedShapeText: {
    color: '#FFF',
  },
  checkBadge: {
    position: 'absolute',
    top: -10,
    right: -10,
    width: 35,
    height: 35,
    backgroundColor: '#4CAF50',
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkText: {
    fontSize: 20,
    color: '#FFF',
    fontWeight: '900',
  },
  shapesContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  shapesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 15,
    backgroundColor: '#2196F3',
    padding: 20,
    borderRadius: 25,
  },
  shapeWrapper: {
    width: (width - 100) / 2,
    height: 90,
  },
  shapeCard: {
    flex: 1,
    backgroundColor: '#FFF',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  matchedShapeCard: {
    borderColor: '#4CAF50',
    backgroundColor: '#E8F5E9',
  },
  shapeEmoji: {
    fontSize: 45,
    color: '#333',
  },
  matchedShapeEmoji: {
    opacity: 0.7,
  },
  matchedBadge: {
    position: 'absolute',
    top: 5,
    right: 5,
    width: 28,
    height: 28,
    backgroundColor: '#4CAF50',
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  matchedBadgeText: {
    fontSize: 16,
    color: '#FFF',
    fontWeight: '900',
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
    fontSize: 26,
    fontWeight: '900',
    color: '#333',
    marginTop: 5,
  },
  celebrationSubtext: {
    fontSize: 14,
    fontWeight: '600',
    color: '#555',
    marginTop: 5,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingBottom: 30,
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
