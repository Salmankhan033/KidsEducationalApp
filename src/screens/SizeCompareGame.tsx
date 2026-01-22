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
import { useResponsiveLayout } from '../utils/useResponsiveLayout';

const { width } = Dimensions.get('window');

// Size comparison puzzles
const SIZE_PUZZLES = [
  {
    emoji: '🐞',
    name: 'Ladybug',
    question: 'Select the BIGGEST one!',
    type: 'biggest',
    color: '#FF6B6B',
  },
  {
    emoji: '🌟',
    name: 'Star',
    question: 'Select the SMALLEST one!',
    type: 'smallest',
    color: '#FFD700',
  },
  {
    emoji: '🐻',
    name: 'Bear',
    question: 'Select the BIGGEST one!',
    type: 'biggest',
    color: '#8B4513',
  },
  {
    emoji: '🍎',
    name: 'Apple',
    question: 'Select the SMALLEST one!',
    type: 'smallest',
    color: '#E74C3C',
  },
  {
    emoji: '🐸',
    name: 'Frog',
    question: 'Select the BIGGEST one!',
    type: 'biggest',
    color: '#27AE60',
  },
  {
    emoji: '🦋',
    name: 'Butterfly',
    question: 'Select the SMALLEST one!',
    type: 'smallest',
    color: '#9B59B6',
  },
  {
    emoji: '🐘',
    name: 'Elephant',
    question: 'Select the BIGGEST one!',
    type: 'biggest',
    color: '#7F8C8D',
  },
  {
    emoji: '🌸',
    name: 'Flower',
    question: 'Select the SMALLEST one!',
    type: 'smallest',
    color: '#E91E63',
  },
];

// Different sizes for the 4 options
const SIZE_OPTIONS = [
  { scale: 0.6, label: 'tiny' },
  { scale: 0.85, label: 'small' },
  { scale: 1.1, label: 'medium' },
  { scale: 1.5, label: 'big' },
];

interface SizeCompareGameProps {
  navigation: any;
}

export const SizeCompareGame: React.FC<SizeCompareGameProps> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { isLandscape } = useResponsiveLayout();
  const [currentPuzzle, setCurrentPuzzle] = useState(0);
  const [shuffledSizes, setShuffledSizes] = useState<typeof SIZE_OPTIONS>([]);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [score, setScore] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);
  
  const celebrationAnim = useRef(new Animated.Value(0)).current;
  const cardAnims = useRef([0, 1, 2, 3].map(() => new Animated.Value(0))).current;
  const questionAnim = useRef(new Animated.Value(0)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;

  const puzzle = SIZE_PUZZLES[currentPuzzle];

  const shuffleArray = <T,>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const initializePuzzle = useCallback(() => {
    setShuffledSizes(shuffleArray(SIZE_OPTIONS));
    setSelectedIndex(null);
    setIsCorrect(null);
    setShowCelebration(false);
    celebrationAnim.setValue(0);
    
    // Animate question
    questionAnim.setValue(0);
    Animated.spring(questionAnim, {
      toValue: 1,
      friction: 4,
      tension: 50,
      useNativeDriver: true,
    }).start();
    
    // Animate cards in with stagger
    cardAnims.forEach((anim, index) => {
      anim.setValue(0);
      Animated.spring(anim, {
        toValue: 1,
        friction: 5,
        tension: 60,
        delay: index * 100 + 200,
        useNativeDriver: true,
      }).start();
    });
    
    speakWord(SIZE_PUZZLES[currentPuzzle].question);
  }, [currentPuzzle, celebrationAnim, cardAnims, questionAnim]);

  useEffect(() => {
    initializePuzzle();
    return () => stopSpeaking();
  }, [currentPuzzle, initializePuzzle]);

  const handleCardPress = (index: number) => {
    if (selectedIndex !== null) return;
    
    const selectedSize = shuffledSizes[index];
    const isBiggestQuestion = puzzle.type === 'biggest';
    
    // Find the correct answer
    const correctLabel = isBiggestQuestion ? 'big' : 'tiny';
    const correct = selectedSize.label === correctLabel;
    
    setSelectedIndex(index);
    setIsCorrect(correct);
    
    if (correct) {
      setScore(score + 10);
      speakCelebration();
      setShowCelebration(true);
      
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
    } else {
      speakWord('Not quite! Try again!');
      
      // Shake animation
      Animated.sequence([
        Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
      ]).start(() => {
        setSelectedIndex(null);
        setIsCorrect(null);
      });
    }
  };

  const nextPuzzle = () => {
    setCurrentPuzzle((currentPuzzle + 1) % SIZE_PUZZLES.length);
  };

  const resetGame = () => {
    setCurrentPuzzle(0);
    setScore(0);
    initializePuzzle();
  };

  const CARD_SIZE = isLandscape ? 100 : (width - 60) / 2;

  // Landscape layout
  if (isLandscape) {
    return (
      <View style={[styles.container, { paddingTop: insets.top, paddingLeft: insets.left, paddingRight: insets.right }]}>
        <ScreenHeader
          title="Size Compare"
          icon={SCREEN_ICONS.puzzle}
          onBack={() => { stopSpeaking(); navigation.goBack(); }}
          compact={true}
        />

        <View style={{ flex: 1, flexDirection: 'row', padding: 10, gap: 10 }}>
          {/* Left Panel - Question */}
          <Animated.View 
            style={{ 
              width: 220, 
              backgroundColor: puzzle.color, 
              borderRadius: 20, 
              padding: 15,
              justifyContent: 'center',
              alignItems: 'center',
              transform: [{ scale: questionAnim }],
            }}
          >
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginBottom: 15 }}>
              <View style={{ backgroundColor: '#FFD700', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12, flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <Text style={{ fontSize: 12, fontWeight: '700' }}>⭐ {score}</Text>
              </View>
              <View style={{ backgroundColor: '#A855F7', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12 }}>
                <Text style={{ color: '#fff', fontWeight: '700', fontSize: 12 }}>{currentPuzzle + 1}/{SIZE_PUZZLES.length}</Text>
              </View>
            </View>

            <Text style={{ fontSize: 40, marginBottom: 10 }}>❓</Text>
            <Text style={{ color: '#fff', fontSize: 18, fontWeight: '800', textAlign: 'center' }}>{puzzle.question}</Text>
            
            <Text style={{ fontSize: 60, marginTop: 15 }}>{puzzle.emoji}</Text>
            <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600', marginTop: 5 }}>{puzzle.name}</Text>
          </Animated.View>

          {/* Right Panel - Options */}
          <Animated.View 
            style={{ 
              flex: 1, 
              backgroundColor: '#fff', 
              borderRadius: 20, 
              padding: 15,
              justifyContent: 'center',
              transform: [{ translateX: shakeAnim }],
            }}
          >
            <Text style={{ fontSize: 14, fontWeight: '600', color: '#666', textAlign: 'center', marginBottom: 15 }}>
              Tap the {puzzle.type} one!
            </Text>

            <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 15 }}>
              {shuffledSizes.map((sizeOption, index) => {
                const isSelected = selectedIndex === index;
                const correctLabel = puzzle.type === 'biggest' ? 'big' : 'tiny';
                
                let borderColor = '#E0E0E0';
                let backgroundColor = '#F5F5F5';
                
                if (selectedIndex !== null && isSelected) {
                  if (isCorrect) {
                    borderColor = '#4CAF50';
                    backgroundColor = '#E8F5E9';
                  } else {
                    borderColor = '#F44336';
                    backgroundColor = '#FFEBEE';
                  }
                }
                
                return (
                  <Animated.View
                    key={index}
                    style={{ transform: [{ scale: cardAnims[index] }] }}
                  >
                    <TouchableOpacity
                      onPress={() => handleCardPress(index)}
                      style={{ 
                        width: CARD_SIZE, 
                        height: CARD_SIZE, 
                        backgroundColor, 
                        borderRadius: 15, 
                        borderWidth: 3, 
                        borderColor,
                        justifyContent: 'center', 
                        alignItems: 'center',
                      }}
                      disabled={selectedIndex !== null && isCorrect}
                      activeOpacity={0.7}
                    >
                      <Text style={{ fontSize: 40 * sizeOption.scale }}>
                        {puzzle.emoji}
                      </Text>
                      
                      {selectedIndex !== null && isSelected && (
                        <View style={{ position: 'absolute', top: -8, right: -8, backgroundColor: isCorrect ? '#4CAF50' : '#F44336', width: 24, height: 24, borderRadius: 12, justifyContent: 'center', alignItems: 'center' }}>
                          <Text style={{ color: '#fff', fontSize: 14, fontWeight: 'bold' }}>{isCorrect ? '✓' : '✗'}</Text>
                        </View>
                      )}
                    </TouchableOpacity>
                  </Animated.View>
                );
              })}
            </View>

            {/* Buttons */}
            <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 15, marginTop: 20 }}>
              <TouchableOpacity onPress={resetGame} style={{ backgroundColor: '#FF6B6B', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 15, flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                <Text style={{ fontSize: 16 }}>🔄</Text>
                <Text style={{ color: '#fff', fontWeight: '700', fontSize: 14 }}>Reset</Text>
              </TouchableOpacity>
              
              <TouchableOpacity onPress={nextPuzzle} style={{ backgroundColor: '#4CAF50', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 15, flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                <Text style={{ fontSize: 16 }}>➡️</Text>
                <Text style={{ color: '#fff', fontWeight: '700', fontSize: 14 }}>Next</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>

        {/* Celebration Overlay */}
        {showCelebration && (
          <Animated.View 
            style={[
              { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
              { transform: [{ scale: celebrationAnim }] }
            ]}
          >
            <View style={{ backgroundColor: '#fff', padding: 30, borderRadius: 25, alignItems: 'center' }}>
              <Text style={{ fontSize: 50 }}>🎉</Text>
              <Text style={{ fontSize: 24, fontWeight: '800', color: '#27AE60', marginTop: 10 }}>Correct!</Text>
              <Text style={{ fontSize: 14, color: '#666', marginTop: 5 }}>You found the {puzzle.type} {puzzle.name}!</Text>
            </View>
          </Animated.View>
        )}
      </View>
    );
  }

  // Portrait layout
  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingLeft: insets.left, paddingRight: insets.right }]}>
      <ScreenHeader
        title="Size Compare"
        icon={SCREEN_ICONS.puzzle}
        onBack={() => { stopSpeaking(); navigation.goBack(); }}
        compact={isLandscape}
      />

      {/* Score & Progress */}
      <View style={styles.topRow}>
        <View style={styles.scoreBox}>
          <Text style={styles.scoreLabel}>⭐ Score</Text>
          <Text style={styles.scoreValue}>{score}</Text>
        </View>
        <View style={styles.progressBox}>
          <Text style={styles.progressText}>{currentPuzzle + 1}/{SIZE_PUZZLES.length}</Text>
        </View>
      </View>

      {/* Question */}
      <Animated.View 
        style={[
          styles.questionBox,
          { 
            backgroundColor: puzzle.color,
            transform: [{ scale: questionAnim }],
          }
        ]}
      >
        <Text style={styles.questionMark}>❓</Text>
        <Text style={styles.questionText}>{puzzle.question}</Text>
      </Animated.View>

      {/* 2x2 Grid of Options */}
      <Animated.View 
        style={[
          styles.gridContainer,
          { transform: [{ translateX: shakeAnim }] }
        ]}
      >
        <View style={styles.grid}>
          {shuffledSizes.map((sizeOption, index) => {
            const isSelected = selectedIndex === index;
            const correctLabel = puzzle.type === 'biggest' ? 'big' : 'tiny';
            const isThisCorrect = sizeOption.label === correctLabel;
            
            let borderColor = '#E0E0E0';
            let backgroundColor = '#FFF';
            
            if (selectedIndex !== null) {
              if (isSelected) {
                if (isCorrect) {
                  borderColor = '#4CAF50';
                  backgroundColor = '#E8F5E9';
                } else {
                  borderColor = '#F44336';
                  backgroundColor = '#FFEBEE';
                }
              }
            }
            
            return (
              <Animated.View
                key={index}
                style={[
                  styles.cardWrapper,
                  { 
                    width: CARD_SIZE,
                    height: CARD_SIZE,
                    transform: [{ scale: cardAnims[index] }],
                  }
                ]}
              >
                <TouchableOpacity
                  onPress={() => handleCardPress(index)}
                  style={[
                    styles.card,
                    { borderColor, backgroundColor }
                  ]}
                  disabled={selectedIndex !== null && isCorrect}
                  activeOpacity={0.7}
                >
                  <Text style={[
                    styles.cardEmoji,
                    { fontSize: 50 * sizeOption.scale }
                  ]}>
                    {puzzle.emoji}
                  </Text>
                  
                  {/* Result badge */}
                  {selectedIndex !== null && isSelected && (
                    <View style={[
                      styles.resultBadge,
                      { backgroundColor: isCorrect ? '#4CAF50' : '#F44336' }
                    ]}>
                      <Text style={styles.resultText}>
                        {isCorrect ? '✓' : '✗'}
                      </Text>
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
            <Text style={styles.celebrationText}>Correct!</Text>
            <Text style={styles.celebrationSubtext}>
              You found the {puzzle.type} {puzzle.name}!
            </Text>
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
    backgroundColor: '#E8F6FF',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 15,
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
  questionBox: {
    flexDirection: 'row',
    marginHorizontal: 20,
    paddingVertical: 15,
    paddingHorizontal: 25,
    borderRadius: 25,
    marginBottom: 25,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 6,
  },
  questionMark: {
    fontSize: 30,
  },
  questionText: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFF',
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  gridContainer: {
    flex: 1,
    paddingHorizontal: 15,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 15,
  },
  cardWrapper: {
    // Size set dynamically
  },
  card: {
    flex: 1,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
  },
  cardEmoji: {
    // fontSize set dynamically based on scale
  },
  resultBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 35,
    height: 35,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  resultText: {
    fontSize: 20,
    fontWeight: '900',
    color: '#FFF',
  },
  celebrationOverlay: {
    position: 'absolute',
    top: '35%',
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
    fontSize: 14,
    fontWeight: '600',
    color: '#555',
    marginTop: 5,
    textAlign: 'center',
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


