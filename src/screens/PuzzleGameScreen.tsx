import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Image,
  Animated,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, RAINBOW_COLORS } from '../constants/colors';
import { speakWord, speakCelebration, stopSpeaking } from '../utils/speech';
import { switchBackgroundMusic } from '../utils/backgroundMusic';
import { ScreenHeader } from '../components';
import { SCREEN_ICONS } from '../assets/images';
import { useResponsiveLayout } from '../utils/useResponsiveLayout';

const { width } = Dimensions.get('window');

// Simple matching puzzles - Find the matching picture
const PUZZLE_DATA = [
  {
    question: '🐱',
    questionName: 'Cat',
    options: ['🐱', '🐕', '🐰', '🐻'],
    correctIndex: 0,
    color: '#FFB6C1',
  },
  {
    question: '🐕',
    questionName: 'Dog',
    options: ['🐱', '🐕', '🦁', '🐸'],
    correctIndex: 1,
    color: '#87CEEB',
  },
  {
    question: '🦁',
    questionName: 'Lion',
    options: ['🐯', '🐻', '🦁', '🐰'],
    correctIndex: 2,
    color: '#FFA500',
  },
  {
    question: '🐘',
    questionName: 'Elephant',
    options: ['🐘', '🐬', '🦒', '🐊'],
    correctIndex: 0,
    color: '#A9A9A9',
  },
  {
    question: '🦋',
    questionName: 'Butterfly',
    options: ['🐝', '🐞', '🦋', '🐛'],
    correctIndex: 2,
    color: '#DDA0DD',
  },
  {
    question: '🌸',
    questionName: 'Flower',
    options: ['🌵', '🌸', '🌲', '🍀'],
    correctIndex: 1,
    color: '#FFB6C1',
  },
  {
    question: '🍎',
    questionName: 'Apple',
    options: ['🍊', '🍋', '🍇', '🍎'],
    correctIndex: 3,
    color: '#FF6347',
  },
  {
    question: '🚗',
    questionName: 'Car',
    options: ['🚗', '✈️', '🚢', '🚂'],
    correctIndex: 0,
    color: '#4169E1',
  },
  {
    question: '⭐',
    questionName: 'Star',
    options: ['🌙', '☀️', '⭐', '🌈'],
    correctIndex: 2,
    color: '#FFD700',
  },
  {
    question: '🐸',
    questionName: 'Frog',
    options: ['🐍', '🐸', '🦎', '🐢'],
    correctIndex: 1,
    color: '#32CD32',
  },
  {
    question: '🐰',
    questionName: 'Rabbit',
    options: ['🐹', '🐭', '🐰', '🐿️'],
    correctIndex: 2,
    color: '#F5F5DC',
  },
  {
    question: '🌈',
    questionName: 'Rainbow',
    options: ['☁️', '🌈', '🌧️', '❄️'],
    correctIndex: 1,
    color: '#FF69B4',
  },
];

interface PuzzleGameScreenProps {
  navigation: any;
}

export const PuzzleGameScreen: React.FC<PuzzleGameScreenProps> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [currentPuzzle, setCurrentPuzzle] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [score, setScore] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);
  
  const { isLandscape, width: screenWidth, height: screenHeight } = useResponsiveLayout();
  
  // Animations
  const questionScale = useRef(new Animated.Value(0)).current;
  const optionAnims = useRef(PUZZLE_DATA[0].options.map(() => new Animated.Value(0))).current;
  const bounceAnim = useRef(new Animated.Value(0)).current;
  const celebrationScale = useRef(new Animated.Value(0)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;

  const puzzle = PUZZLE_DATA[currentPuzzle];

  const animateIn = useCallback(() => {
    // Reset animations
    questionScale.setValue(0);
    optionAnims.forEach(anim => anim.setValue(0));
    
    // Animate question
    Animated.spring(questionScale, {
      toValue: 1,
      friction: 4,
      tension: 50,
      useNativeDriver: true,
    }).start();
    
    // Animate options with stagger
    optionAnims.forEach((anim, index) => {
      Animated.spring(anim, {
        toValue: 1,
        friction: 5,
        tension: 60,
        delay: index * 100 + 200,
        useNativeDriver: true,
      }).start();
    });
    
    // Continuous bounce for question
    Animated.loop(
      Animated.sequence([
        Animated.timing(bounceAnim, { toValue: -10, duration: 600, useNativeDriver: true }),
        Animated.timing(bounceAnim, { toValue: 0, duration: 600, useNativeDriver: true }),
      ])
    ).start();
  }, [questionScale, optionAnims, bounceAnim]);

  // Switch to game music
  useEffect(() => {
    switchBackgroundMusic('game');
    return () => switchBackgroundMusic('home');
  }, []);

  useEffect(() => {
    animateIn();
    speakWord(`Find the matching ${puzzle.questionName}!`);
    return () => stopSpeaking();
  }, [currentPuzzle, animateIn, puzzle.questionName]);

  const handleOptionPress = (index: number) => {
    if (selectedOption !== null) return; // Already answered
    
    setSelectedOption(index);
    const correct = index === puzzle.correctIndex;
    setIsCorrect(correct);
    
    if (correct) {
      setScore(score + 1);
      speakCelebration();
      setShowCelebration(true);
      
      // Celebration animation
      Animated.spring(celebrationScale, {
        toValue: 1,
        friction: 3,
        tension: 40,
        useNativeDriver: true,
      }).start();
      
      // Auto advance after celebration
      setTimeout(() => {
        nextPuzzle();
      }, 1500);
    } else {
      speakWord('Try again!');
      
      // Shake animation for wrong answer
      Animated.sequence([
        Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
      ]).start(() => {
        // Reset after shake so they can try again
        setSelectedOption(null);
        setIsCorrect(null);
      });
    }
  };

  const nextPuzzle = () => {
    setSelectedOption(null);
    setIsCorrect(null);
    setShowCelebration(false);
    celebrationScale.setValue(0);
    setCurrentPuzzle((currentPuzzle + 1) % PUZZLE_DATA.length);
  };

  const resetGame = () => {
    setCurrentPuzzle(0);
    setScore(0);
    setSelectedOption(null);
    setIsCorrect(null);
    setShowCelebration(false);
    celebrationScale.setValue(0);
  };

  const questionSize = isLandscape ? 90 : 130;
  const optionSize = isLandscape ? 65 : 80;

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingLeft: insets.left, paddingRight: insets.right }]}>
      {/* Header */}
      <ScreenHeader
        title="Match Puzzle"
        icon={SCREEN_ICONS.puzzle}
        onBack={() => { stopSpeaking(); navigation.goBack(); }}
        compact={isLandscape}
      />

      <ScrollView 
        contentContainerStyle={[styles.scrollContent, isLandscape && { paddingVertical: 5 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Score */}
        <View style={[styles.scoreRow, isLandscape && { marginBottom: 5 }]}>
          <View style={[styles.scoreBox, isLandscape && { paddingHorizontal: 12, paddingVertical: 6 }]}>
            <Text style={[styles.scoreLabel, isLandscape && { fontSize: 11 }]}>⭐ Score</Text>
            <Text style={[styles.scoreValue, isLandscape && { fontSize: 18 }]}>{score}</Text>
          </View>
          <View style={[styles.progressBox, isLandscape && { paddingHorizontal: 12, paddingVertical: 6 }]}>
            <Text style={[styles.progressText, isLandscape && { fontSize: 12 }]}>{currentPuzzle + 1} / {PUZZLE_DATA.length}</Text>
          </View>
        </View>

        {/* Instructions */}
        <View style={[styles.instructionBox, { backgroundColor: puzzle.color }, isLandscape && { paddingVertical: 8, marginBottom: 8 }]}>
          <Text style={[styles.instructionText, isLandscape && { fontSize: 13 }]}>
            👆 Find the matching picture!
          </Text>
        </View>

        {/* Question - The picture to match */}
        <View style={[styles.questionSection, isLandscape && { marginBottom: 10 }]}>
          <Text style={[styles.findLabel, isLandscape && { fontSize: 14, marginBottom: 6 }]}>Find this:</Text>
          <Animated.View 
            style={[
              styles.questionCard,
              { 
                backgroundColor: puzzle.color,
                width: questionSize,
                height: questionSize,
                borderRadius: isLandscape ? 16 : 25,
                transform: [
                  { scale: questionScale },
                  { translateY: bounceAnim },
                ],
              }
            ]}
          >
            <Text style={[styles.questionEmoji, { fontSize: questionSize * 0.55 }]}>{puzzle.question}</Text>
          </Animated.View>
          <Text style={[styles.questionName, isLandscape && { fontSize: 16 }]}>{puzzle.questionName}</Text>
        </View>

        {/* Options Grid - 2x2 or 4x1 in landscape */}
        <View style={[styles.optionsContainer, isLandscape && { marginBottom: 10 }]}>
          <Animated.View 
            style={[
              styles.optionsGrid,
              { transform: [{ translateX: shakeAnim }] },
              isLandscape && { flexDirection: 'row', flexWrap: 'nowrap', gap: 8 }
            ]}
          >
            {puzzle.options.map((option, index) => {
              const isSelected = selectedOption === index;
              const isCorrectOption = index === puzzle.correctIndex;
              const showResult = selectedOption !== null;
              
              let borderColor = '#E0E0E0';
              let backgroundColor = '#FFFFFF';
              
              if (showResult && isSelected) {
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
                  style={[
                    styles.optionWrapper,
                    { 
                      transform: [{ scale: optionAnims[index] }],
                      opacity: optionAnims[index],
                      width: optionSize,
                      height: optionSize,
                    }
                  ]}
                >
                  <TouchableOpacity
                    onPress={() => handleOptionPress(index)}
                    style={[
                      styles.optionCard,
                      { 
                        borderColor,
                        backgroundColor,
                        borderRadius: isLandscape ? 14 : 20,
                      },
                    ]}
                    disabled={selectedOption !== null && isCorrect}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.optionEmoji, { fontSize: optionSize * 0.5 }]}>{option}</Text>
                    
                    {/* Checkmark or X indicator */}
                    {showResult && isSelected && (
                      <View style={[
                        styles.resultBadge,
                        { backgroundColor: isCorrect ? '#4CAF50' : '#F44336' },
                        isLandscape && { width: 20, height: 20 }
                      ]}>
                        <Text style={[styles.resultBadgeText, isLandscape && { fontSize: 10 }]}>
                          {isCorrect ? '✓' : '✗'}
                        </Text>
                      </View>
                    )}
                  </TouchableOpacity>
                </Animated.View>
              );
            })}
          </Animated.View>
        </View>

        {/* Bottom Buttons */}
        <View style={[styles.buttonRow, isLandscape && { gap: 15 }]}>
          <TouchableOpacity onPress={resetGame} style={[styles.resetButton, isLandscape && { paddingHorizontal: 16, paddingVertical: 8 }]}>
            <Text style={[styles.buttonEmoji, isLandscape && { fontSize: 16 }]}>🔄</Text>
            <Text style={[styles.buttonText, isLandscape && { fontSize: 12 }]}>Start Over</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            onPress={nextPuzzle} 
            style={[styles.nextButton, isLandscape && { paddingHorizontal: 16, paddingVertical: 8 }]}
          >
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
            { transform: [{ scale: celebrationScale }] }
          ]}
        >
          <View style={[styles.celebrationCard, isLandscape && { padding: 20 }]}>
            <Text style={[styles.celebrationEmoji, isLandscape && { fontSize: 50 }]}>🎉</Text>
            <Text style={[styles.celebrationText, isLandscape && { fontSize: 22 }]}>Great Job!</Text>
            <Text style={[styles.celebrationSubtext, isLandscape && { fontSize: 14 }]}>You found the {puzzle.questionName}!</Text>
          </View>
        </Animated.View>
      )}

      {/* Decorative elements */}
      {!isLandscape && (
        <View style={styles.decorContainer}>
          <Text style={styles.decorEmoji1}>🧩</Text>
          <Text style={styles.decorEmoji2}>✨</Text>
          <Text style={styles.decorEmoji3}>🌟</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#E8F6FF',
  },
  scrollContent: {
    paddingBottom: 20,
    alignItems: 'center',
  },
  scoreRow: {
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
    marginBottom: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  instructionText: {
    fontSize: 18,
    color: '#333',
    fontWeight: '700',
  },
  questionSection: {
    alignItems: 'center',
    marginBottom: 25,
  },
  findLabel: {
    fontSize: 20,
    fontWeight: '700',
    color: '#666',
    marginBottom: 10,
  },
  questionCard: {
    width: 140,
    height: 140,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 5,
    borderColor: '#FFF',
  },
  questionEmoji: {
    fontSize: 80,
  },
  questionName: {
    fontSize: 24,
    fontWeight: '800',
    color: '#333',
    marginTop: 12,
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
  },
  optionWrapper: {
    width: (width - 70) / 2,
    aspectRatio: 1,
  },
  optionCard: {
    flex: 1,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  optionEmoji: {
    fontSize: 60,
  },
  resultBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  resultBadgeText: {
    fontSize: 18,
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
    fontSize: 16,
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
  decorContainer: {
    position: 'absolute',
    top: 100,
    left: 0,
    right: 0,
    zIndex: -1,
  },
  decorEmoji1: {
    position: 'absolute',
    top: 20,
    left: 15,
    fontSize: 30,
    opacity: 0.3,
  },
  decorEmoji2: {
    position: 'absolute',
    top: 80,
    right: 20,
    fontSize: 25,
    opacity: 0.3,
  },
  decorEmoji3: {
    position: 'absolute',
    top: 140,
    left: 25,
    fontSize: 22,
    opacity: 0.3,
  },
});
