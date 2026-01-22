import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Animated,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '../constants/colors';
import { speakWord, speakCelebration, stopSpeaking } from '../utils/speech';
import { ScreenHeader } from '../components';
import { SCREEN_ICONS } from '../assets/images';
import { useResponsiveLayout } from '../utils/useResponsiveLayout';

const { width } = Dimensions.get('window');

// Find the matching pair game - Animals and Objects
const PAIR_PUZZLES = [
  {
    type: 'animal',
    mainItems: [
      { emoji: '🐧', name: 'Penguin' },
      { emoji: '🦆', name: 'Duck' },
    ],
    options: ['🐔', '🐧', '🦆', '🐥'],
    correctIndices: [1, 2],
    bgColor: '#87CEEB',
  },
  {
    type: 'animal',
    mainItems: [
      { emoji: '🐱', name: 'Cat' },
      { emoji: '🐕', name: 'Dog' },
    ],
    options: ['🐕', '🐰', '🐱', '🐻'],
    correctIndices: [2, 0],
    bgColor: '#FFB6C1',
  },
  {
    type: 'animal',
    mainItems: [
      { emoji: '🦁', name: 'Lion' },
      { emoji: '🐘', name: 'Elephant' },
    ],
    options: ['🦒', '🐘', '🦁', '🐵'],
    correctIndices: [2, 1],
    bgColor: '#FFA500',
  },
  {
    type: 'animal',
    mainItems: [
      { emoji: '🐸', name: 'Frog' },
      { emoji: '🐢', name: 'Turtle' },
    ],
    options: ['🐢', '🦎', '🐸', '🐍'],
    correctIndices: [2, 0],
    bgColor: '#90EE90',
  },
  {
    type: 'fruit',
    mainItems: [
      { emoji: '🍎', name: 'Apple' },
      { emoji: '🍊', name: 'Orange' },
    ],
    options: ['🍋', '🍎', '🍇', '🍊'],
    correctIndices: [1, 3],
    bgColor: '#FF6347',
  },
  {
    type: 'fruit',
    mainItems: [
      { emoji: '🍓', name: 'Strawberry' },
      { emoji: '🍌', name: 'Banana' },
    ],
    options: ['🍌', '🍒', '🍓', '🥝'],
    correctIndices: [2, 0],
    bgColor: '#FF69B4',
  },
];

interface FindPairGameProps {
  navigation: any;
}

export const FindPairGame: React.FC<FindPairGameProps> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [currentPuzzle, setCurrentPuzzle] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState<number[]>([]);
  const [matchedItems, setMatchedItems] = useState<number[]>([]);
  const [score, setScore] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);
  
  const { isLandscape, width: screenWidth, height: screenHeight } = useResponsiveLayout();
  
  const celebrationAnim = useRef(new Animated.Value(0)).current;
  const cardAnims = useRef([0, 1, 2, 3].map(() => new Animated.Value(0))).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;

  const puzzle = PAIR_PUZZLES[currentPuzzle];

  const initializePuzzle = useCallback(() => {
    setSelectedOptions([]);
    setMatchedItems([]);
    setShowCelebration(false);
    celebrationAnim.setValue(0);
    
    // Animate cards in
    cardAnims.forEach((anim, index) => {
      anim.setValue(0);
      Animated.spring(anim, {
        toValue: 1,
        friction: 5,
        tension: 60,
        delay: index * 100,
        useNativeDriver: true,
      }).start();
    });
    
    speakWord(`Find the matching ${puzzle.mainItems[0].name} and ${puzzle.mainItems[1].name}!`);
  }, [currentPuzzle, celebrationAnim, cardAnims, puzzle]);

  useEffect(() => {
    initializePuzzle();
    return () => stopSpeaking();
  }, [currentPuzzle, initializePuzzle]);

  const handleOptionPress = (optionIndex: number) => {
    // Check if already matched
    if (matchedItems.includes(optionIndex)) return;
    
    // Check if this is a correct match
    const isCorrect = puzzle.correctIndices.includes(optionIndex);
    
    if (isCorrect) {
      const newMatched = [...matchedItems, optionIndex];
      setMatchedItems(newMatched);
      setScore(score + 5);
      
      const matchedName = puzzle.mainItems[puzzle.correctIndices.indexOf(optionIndex)]?.name || 'item';
      speakWord(`Great! You found the ${matchedName}!`);
      
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
      speakWord('Try again!');
      
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
    setCurrentPuzzle((currentPuzzle + 1) % PAIR_PUZZLES.length);
  };

  const resetGame = () => {
    setCurrentPuzzle(0);
    setScore(0);
    initializePuzzle();
  };

  const CARD_SIZE = isLandscape ? 60 : (width - 60) / 2;
  const mainItemSize = isLandscape ? 70 : 90;
  const optionSize = isLandscape ? 55 : 70;

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingLeft: insets.left, paddingRight: insets.right }]}>
      <ScreenHeader
        title="Find Pairs"
        icon={SCREEN_ICONS.puzzle}
        onBack={() => { stopSpeaking(); navigation.goBack(); }}
        compact={isLandscape}
      />

      <ScrollView 
        contentContainerStyle={[styles.scrollContent, isLandscape && { paddingVertical: 5 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Score & Progress */}
        <View style={[styles.topRow, isLandscape && { marginBottom: 5 }]}>
          <View style={[styles.scoreBox, isLandscape && { paddingHorizontal: 12, paddingVertical: 6 }]}>
            <Text style={[styles.scoreLabel, isLandscape && { fontSize: 11 }]}>⭐ Score</Text>
            <Text style={[styles.scoreValue, isLandscape && { fontSize: 18 }]}>{score}</Text>
          </View>
          <View style={[styles.progressBox, isLandscape && { paddingHorizontal: 12, paddingVertical: 6 }]}>
            <Text style={[styles.progressText, isLandscape && { fontSize: 12 }]}>{currentPuzzle + 1}/{PAIR_PUZZLES.length}</Text>
          </View>
        </View>

        {/* Instructions */}
        <View style={[styles.instructionBox, { backgroundColor: puzzle.bgColor }, isLandscape && { paddingVertical: 8, marginBottom: 8 }]}>
          <Text style={[styles.instructionText, isLandscape && { fontSize: 13 }]}>
            👆 Find the matching pairs below!
          </Text>
        </View>

        {/* Main Items to Match */}
        <View style={[styles.mainItemsRow, { backgroundColor: puzzle.bgColor }, isLandscape && { paddingVertical: 10, marginBottom: 10 }]}>
          {puzzle.mainItems.map((item, index) => (
            <View 
              key={index} 
              style={[
                styles.mainItemCard,
                { width: mainItemSize, height: mainItemSize, borderRadius: isLandscape ? 12 : 15 },
                matchedItems.includes(puzzle.correctIndices[index]) && styles.matchedMainCard,
              ]}
            >
              <Text style={[styles.mainItemEmoji, { fontSize: mainItemSize * 0.5 }]}>{item.emoji}</Text>
              {matchedItems.includes(puzzle.correctIndices[index]) && (
                <View style={[styles.checkBadge, isLandscape && { width: 20, height: 20 }]}>
                  <Text style={[styles.checkText, isLandscape && { fontSize: 10 }]}>✓</Text>
                </View>
              )}
            </View>
          ))}
        </View>

        {/* Options Grid */}
        <Animated.View 
          style={[
            styles.optionsContainer,
            { transform: [{ translateX: shakeAnim }] }
          ]}
        >
        <View style={[styles.optionsGrid, isLandscape && { gap: 8 }]}>
          {puzzle.options.map((option, index) => {
            const isMatched = matchedItems.includes(index);
            const isCorrectOption = puzzle.correctIndices.includes(index);
            
            return (
              <Animated.View
                key={index}
                style={[
                  styles.optionWrapper,
                  { transform: [{ scale: cardAnims[index] }], width: optionSize, height: optionSize }
                ]}
              >
                <TouchableOpacity
                  onPress={() => handleOptionPress(index)}
                  style={[
                    styles.optionCard,
                    { borderRadius: isLandscape ? 12 : 18 },
                    isMatched && styles.matchedOptionCard,
                  ]}
                  disabled={isMatched}
                  activeOpacity={0.7}
                >
                  <Text style={[
                    styles.optionEmoji,
                    { fontSize: optionSize * 0.5 },
                    isMatched && styles.matchedEmoji,
                  ]}>
                    {option}
                  </Text>
                  
                  {isMatched && (
                    <View style={[styles.matchedBadge, isLandscape && { width: 18, height: 18 }]}>
                      <Text style={[styles.matchedBadgeText, isLandscape && { fontSize: 10 }]}>✓</Text>
                    </View>
                  )}
                </TouchableOpacity>
              </Animated.View>
            );
          })}
        </View>
      </Animated.View>

        {/* Bottom Buttons */}
        <View style={[styles.buttonRow, isLandscape && { paddingVertical: 8, gap: 15 }]}>
          <TouchableOpacity onPress={resetGame} style={[styles.resetButton, isLandscape && { paddingHorizontal: 16, paddingVertical: 8 }]}>
            <Text style={[styles.buttonEmoji, isLandscape && { fontSize: 16 }]}>🔄</Text>
            <Text style={[styles.buttonText, isLandscape && { fontSize: 12 }]}>Reset</Text>
          </TouchableOpacity>
          
          <TouchableOpacity onPress={nextPuzzle} style={[styles.nextButton, isLandscape && { paddingHorizontal: 16, paddingVertical: 8 }]}>
            <Text style={[styles.buttonEmoji, isLandscape && { fontSize: 16 }]}>➡️</Text>
            <Text style={[styles.buttonText, isLandscape && { fontSize: 12 }]}>Next</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Celebration Overlay */}
      {showCelebration && (
        <Animated.View 
          style={[
            styles.celebrationOverlay,
            { transform: [{ scale: celebrationAnim }] }
          ]}
        >
          <View style={[styles.celebrationCard, isLandscape && { padding: 20 }]}>
            <Text style={[styles.celebrationEmoji, isLandscape && { fontSize: 50 }]}>🎉</Text>
            <Text style={[styles.celebrationText, isLandscape && { fontSize: 22 }]}>Perfect Match!</Text>
            <Text style={[styles.celebrationSubtext, isLandscape && { fontSize: 14 }]}>You found all pairs!</Text>
          </View>
        </Animated.View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#5D4037', // Brown wooden background
  },
  scrollContent: {
    paddingBottom: 20,
    alignItems: 'center',
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
    color: '#333',
    fontWeight: '700',
  },
  mainItemsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    paddingVertical: 20,
    marginHorizontal: 20,
    borderRadius: 25,
    marginBottom: 20,
  },
  mainItemCard: {
    width: 120,
    height: 120,
    backgroundColor: '#FFF',
    borderRadius: 20,
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
  matchedMainCard: {
    borderColor: '#4CAF50',
    backgroundColor: '#E8F5E9',
  },
  mainItemEmoji: {
    fontSize: 70,
  },
  checkBadge: {
    position: 'absolute',
    top: -10,
    right: -10,
    width: 30,
    height: 30,
    backgroundColor: '#4CAF50',
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkText: {
    fontSize: 18,
    color: '#FFF',
    fontWeight: '900',
  },
  optionsContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 15,
    backgroundColor: '#8BC34A',
    padding: 15,
    borderRadius: 25,
  },
  optionWrapper: {
    width: (width - 90) / 2,
    height: 100,
  },
  optionCard: {
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
  matchedOptionCard: {
    borderColor: '#4CAF50',
    backgroundColor: '#E8F5E9',
  },
  optionEmoji: {
    fontSize: 50,
  },
  matchedEmoji: {
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


