import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '../constants/colors';
import { PATTERNS } from '../constants/gameData';
import { speakWord, speakCelebration, speakFeedback, stopSpeaking } from '../utils/speech';
import { ScreenHeader } from '../components';
import { SCREEN_ICONS } from '../assets/images';

const { width } = Dimensions.get('window');

interface PatternGameScreenProps {
  navigation: any;
}

export const PatternGameScreen: React.FC<PatternGameScreenProps> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [currentPatternIndex, setCurrentPatternIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [showFeedback, setShowFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [completed, setCompleted] = useState(0);

  const currentPattern = PATTERNS[currentPatternIndex];

  useEffect(() => {
    speakWord('Complete the pattern!');
    return () => stopSpeaking();
  }, []);

  const handleAnswer = (answer: string) => {
    const isCorrect = answer === currentPattern.next;
    
    if (isCorrect) {
      setScore(score + 15);
      setCompleted(completed + 1);
      speakCelebration();
      setShowFeedback('correct');
      
      setTimeout(() => {
        setShowFeedback(null);
        if (currentPatternIndex < PATTERNS.length - 1) {
          setCurrentPatternIndex(currentPatternIndex + 1);
        } else {
          setCurrentPatternIndex(Math.floor(Math.random() * PATTERNS.length));
        }
      }, 1000);
    } else {
      speakFeedback(false);
      setShowFeedback('wrong');
      setTimeout(() => setShowFeedback(null), 800);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <ScreenHeader
        title="Patterns"
        icon={SCREEN_ICONS.patternIcon}
        onBack={() => { stopSpeaking(); navigation.goBack(); }}
      />

      {/* Score */}
      <View style={styles.statsRow}>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>Score</Text>
          <View style={styles.scoreValue}>
            <Image source={SCREEN_ICONS.starGold} style={styles.statIcon} resizeMode="contain" />
            <Text style={styles.statValueText}>{score}</Text>
          </View>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>Completed</Text>
          <Text style={styles.statValueText}>{completed}</Text>
        </View>
      </View>

      {/* Instructions */}
      <View style={styles.instructionBox}>
        <Image source={SCREEN_ICONS.brain} style={styles.instructionIcon} resizeMode="contain" />
        <Text style={styles.instructionText}>
          What comes next in the pattern?
        </Text>
      </View>

      {/* Pattern Display */}
      <View style={styles.patternContainer}>
        <View style={styles.patternRow}>
          {currentPattern.sequence.map((item, index) => (
            <View key={index} style={styles.patternItem}>
              <Text style={styles.patternEmoji}>{item}</Text>
            </View>
          ))}
          <View style={styles.questionMark}>
            <Image source={SCREEN_ICONS.question} style={styles.questionIcon} resizeMode="contain" />
          </View>
        </View>
      </View>

      {/* Options */}
      <Text style={styles.chooseText}>Choose the answer:</Text>
      <View style={styles.optionsRow}>
        {currentPattern.options.map((option, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => handleAnswer(option)}
            style={[
              styles.optionButton,
              showFeedback === 'correct' && option === currentPattern.next && styles.correctOption,
              showFeedback === 'wrong' && option === currentPattern.next && styles.showCorrectOption,
            ]}
          >
            <Text style={styles.optionEmoji}>{option}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Feedback */}
      {showFeedback && (
        <View style={[
          styles.feedbackBox,
          { backgroundColor: showFeedback === 'correct' ? COLORS.green : COLORS.red }
        ]}>
          <Image 
            source={showFeedback === 'correct' ? SCREEN_ICONS.correct : SCREEN_ICONS.wrong} 
            style={styles.feedbackIcon} 
            resizeMode="contain" 
          />
          <Text style={styles.feedbackText}>
            {showFeedback === 'correct' ? 'Correct!' : 'Try Again!'}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5E6FF' },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 15,
    gap: 40,
  },
  statBox: { alignItems: 'center' },
  statLabel: { fontSize: 14, color: COLORS.gray },
  scoreValue: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statIcon: { width: 22, height: 22 },
  statValueText: { fontSize: 22, fontWeight: 'bold', color: COLORS.purple },
  instructionBox: {
    flexDirection: 'row',
    backgroundColor: COLORS.purple,
    marginHorizontal: 20,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 15,
    marginBottom: 20,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  instructionIcon: { width: 24, height: 24, tintColor: COLORS.white },
  instructionText: {
    fontSize: 16,
    color: COLORS.white,
    fontWeight: '600',
  },
  patternContainer: {
    backgroundColor: COLORS.white,
    marginHorizontal: 20,
    paddingVertical: 30,
    paddingHorizontal: 15,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 5,
  },
  patternRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 10,
  },
  patternItem: {
    backgroundColor: '#F0F0F0',
    width: 55,
    height: 55,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  patternEmoji: { fontSize: 32 },
  questionMark: {
    backgroundColor: COLORS.yellow,
    width: 55,
    height: 55,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: COLORS.orange,
    borderStyle: 'dashed',
  },
  questionIcon: { width: 30, height: 30 },
  chooseText: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.purple,
    textAlign: 'center',
    marginTop: 30,
    marginBottom: 15,
  },
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    paddingHorizontal: 20,
  },
  optionButton: {
    backgroundColor: COLORS.white,
    width: 80,
    height: 80,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 4,
  },
  correctOption: {
    backgroundColor: COLORS.green,
    borderWidth: 3,
    borderColor: '#228B22',
  },
  showCorrectOption: {
    backgroundColor: COLORS.yellow,
    borderWidth: 3,
    borderColor: COLORS.orange,
  },
  optionEmoji: { fontSize: 40 },
  feedbackBox: {
    position: 'absolute',
    bottom: 100,
    alignSelf: 'center',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  feedbackIcon: { width: 24, height: 24, tintColor: COLORS.white },
  feedbackText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.white,
  },
});
