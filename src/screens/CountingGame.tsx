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

// Counting puzzles - Which has more/less
const COUNTING_PUZZLES = [
  { emoji: '🍇', name: 'Grapes', color: '#9B59B6' },
  { emoji: '🍎', name: 'Apples', color: '#E74C3C' },
  { emoji: '⭐', name: 'Stars', color: '#F39C12' },
  { emoji: '🐟', name: 'Fish', color: '#3498DB' },
  { emoji: '🌸', name: 'Flowers', color: '#E91E63' },
  { emoji: '🍪', name: 'Cookies', color: '#8B4513' },
  { emoji: '🎈', name: 'Balloons', color: '#E74C3C' },
  { emoji: '🦋', name: 'Butterflies', color: '#9B59B6' },
];

interface CountingGameProps {
  navigation: any;
}

export const CountingGame: React.FC<CountingGameProps> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [currentPuzzle, setCurrentPuzzle] = useState(0);
  const [leftCount, setLeftCount] = useState(0);
  const [rightCount, setRightCount] = useState(0);
  const [questionType, setQuestionType] = useState<'more' | 'less'>('more');
  const [selectedSide, setSelectedSide] = useState<'left' | 'right' | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [score, setScore] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);
  
  const celebrationAnim = useRef(new Animated.Value(0)).current;
  const cardAnims = useRef([new Animated.Value(0), new Animated.Value(0)]).current;
  const questionAnim = useRef(new Animated.Value(0)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;

  const puzzle = COUNTING_PUZZLES[currentPuzzle];

  const generateCounts = useCallback(() => {
    // Generate two different counts between 1-6
    let count1 = Math.floor(Math.random() * 5) + 1; // 1-5
    let count2: number;
    do {
      count2 = Math.floor(Math.random() * 5) + 1;
    } while (count2 === count1);
    
    // Randomly decide which side gets which count
    if (Math.random() > 0.5) {
      setLeftCount(count1);
      setRightCount(count2);
    } else {
      setLeftCount(count2);
      setRightCount(count1);
    }
    
    // Randomly pick question type
    setQuestionType(Math.random() > 0.5 ? 'more' : 'less');
  }, []);

  const initializePuzzle = useCallback(() => {
    generateCounts();
    setSelectedSide(null);
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
    
    // Animate cards
    cardAnims.forEach((anim, index) => {
      anim.setValue(0);
      Animated.spring(anim, {
        toValue: 1,
        friction: 5,
        tension: 60,
        delay: index * 150 + 200,
        useNativeDriver: true,
      }).start();
    });
  }, [generateCounts, celebrationAnim, cardAnims, questionAnim]);

  useEffect(() => {
    initializePuzzle();
    return () => stopSpeaking();
  }, [currentPuzzle, initializePuzzle]);

  useEffect(() => {
    const question = questionType === 'more' 
      ? `Which one has MORE ${puzzle.name}?`
      : `Which one has LESS ${puzzle.name}?`;
    speakWord(question);
  }, [leftCount, rightCount, questionType, puzzle.name]);

  const handleSidePress = (side: 'left' | 'right') => {
    if (selectedSide !== null) return;
    
    const selectedCount = side === 'left' ? leftCount : rightCount;
    const otherCount = side === 'left' ? rightCount : leftCount;
    
    let correct: boolean;
    if (questionType === 'more') {
      correct = selectedCount > otherCount;
    } else {
      correct = selectedCount < otherCount;
    }
    
    setSelectedSide(side);
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
      speakWord('Not quite! Count again!');
      
      // Shake animation
      Animated.sequence([
        Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
      ]).start(() => {
        setSelectedSide(null);
        setIsCorrect(null);
      });
    }
  };

  const nextPuzzle = () => {
    setCurrentPuzzle((currentPuzzle + 1) % COUNTING_PUZZLES.length);
  };

  const resetGame = () => {
    setCurrentPuzzle(0);
    setScore(0);
    initializePuzzle();
  };

  // Render emojis in a nice grid layout
  const renderEmojis = (count: number) => {
    const emojis = [];
    for (let i = 0; i < count; i++) {
      emojis.push(
        <Text key={i} style={styles.countEmoji}>
          {puzzle.emoji}
        </Text>
      );
    }
    return emojis;
  };

  const CARD_WIDTH = (width - 50) / 2;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScreenHeader
        title="Counting"
        icon={SCREEN_ICONS.puzzle}
        onBack={() => { stopSpeaking(); navigation.goBack(); }}
      />

      {/* Score & Progress */}
      <View style={styles.topRow}>
        <View style={styles.scoreBox}>
          <Text style={styles.scoreLabel}>⭐ Score</Text>
          <Text style={styles.scoreValue}>{score}</Text>
        </View>
        <View style={styles.progressBox}>
          <Text style={styles.progressText}>{currentPuzzle + 1}/{COUNTING_PUZZLES.length}</Text>
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
        <Text style={styles.questionText}>
          Which One Has {questionType === 'more' ? 'MORE' : 'LESS'}?
        </Text>
        <Text style={styles.handPointer}>👆</Text>
      </Animated.View>

      {/* Two Cards Side by Side */}
      <Animated.View 
        style={[
          styles.cardsContainer,
          { transform: [{ translateX: shakeAnim }] }
        ]}
      >
        {/* Left Card */}
        <Animated.View
          style={[
            styles.cardWrapper,
            { 
              width: CARD_WIDTH,
              transform: [{ scale: cardAnims[0] }],
            }
          ]}
        >
          <TouchableOpacity
            onPress={() => handleSidePress('left')}
            style={[
              styles.card,
              selectedSide === 'left' && (isCorrect ? styles.correctCard : styles.wrongCard),
            ]}
            disabled={selectedSide !== null && isCorrect}
            activeOpacity={0.7}
          >
            <View style={styles.emojiGrid}>
              {renderEmojis(leftCount)}
            </View>
            
            {/* Count badge */}
            <View style={[styles.countBadge, { backgroundColor: puzzle.color }]}>
              <Text style={styles.countBadgeText}>{leftCount}</Text>
            </View>
            
            {/* Result badge */}
            {selectedSide === 'left' && (
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

        {/* Right Card */}
        <Animated.View
          style={[
            styles.cardWrapper,
            { 
              width: CARD_WIDTH,
              transform: [{ scale: cardAnims[1] }],
            }
          ]}
        >
          <TouchableOpacity
            onPress={() => handleSidePress('right')}
            style={[
              styles.card,
              selectedSide === 'right' && (isCorrect ? styles.correctCard : styles.wrongCard),
            ]}
            disabled={selectedSide !== null && isCorrect}
            activeOpacity={0.7}
          >
            <View style={styles.emojiGrid}>
              {renderEmojis(rightCount)}
            </View>
            
            {/* Count badge */}
            <View style={[styles.countBadge, { backgroundColor: puzzle.color }]}>
              <Text style={styles.countBadgeText}>{rightCount}</Text>
            </View>
            
            {/* Result badge */}
            {selectedSide === 'right' && (
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
      </Animated.View>

      {/* Hint */}
      <View style={styles.hintBox}>
        <Text style={styles.hintText}>
          💡 Count the {puzzle.name} and tap the card with {questionType === 'more' ? 'MORE' : 'LESS'}!
        </Text>
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
            <Text style={styles.celebrationText}>Great Counting!</Text>
            <Text style={styles.celebrationSubtext}>
              {questionType === 'more' 
                ? `${Math.max(leftCount, rightCount)} is more than ${Math.min(leftCount, rightCount)}!`
                : `${Math.min(leftCount, rightCount)} is less than ${Math.max(leftCount, rightCount)}!`
              }
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
    backgroundColor: '#FFF9E6',
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
    marginHorizontal: 20,
    paddingVertical: 18,
    paddingHorizontal: 25,
    borderRadius: 25,
    marginBottom: 25,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 6,
  },
  questionText: {
    fontSize: 24,
    fontWeight: '900',
    color: '#FFF',
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
    textAlign: 'center',
  },
  handPointer: {
    fontSize: 30,
    marginTop: 5,
  },
  cardsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingHorizontal: 15,
    gap: 15,
    flex: 1,
  },
  cardWrapper: {
    height: '80%',
  },
  card: {
    flex: 1,
    backgroundColor: '#FFF',
    borderRadius: 25,
    borderWidth: 5,
    borderColor: '#E0E0E0',
    padding: 15,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
  },
  correctCard: {
    borderColor: '#4CAF50',
    backgroundColor: '#E8F5E9',
  },
  wrongCard: {
    borderColor: '#F44336',
    backgroundColor: '#FFEBEE',
  },
  emojiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  countEmoji: {
    fontSize: 45,
  },
  countBadge: {
    position: 'absolute',
    bottom: 15,
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  countBadgeText: {
    fontSize: 22,
    fontWeight: '900',
    color: '#FFF',
  },
  resultBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  resultText: {
    fontSize: 22,
    fontWeight: '900',
    color: '#FFF',
  },
  hintBox: {
    marginHorizontal: 20,
    marginBottom: 15,
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: '#E3F2FD',
    borderRadius: 15,
    alignItems: 'center',
  },
  hintText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1565C0',
    textAlign: 'center',
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
    paddingHorizontal: 35,
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
