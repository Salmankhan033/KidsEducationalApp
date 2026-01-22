import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Image,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '../constants/colors';
import { PATTERNS } from '../constants/gameData';
import { speakWord, speakCelebration, speakFeedback, stopSpeaking } from '../utils/speech';
import { ScreenHeader } from '../components';
import { SCREEN_ICONS } from '../assets/images';
import { useResponsiveLayout } from '../utils/useResponsiveLayout';

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
  
  const { isLandscape, width: screenWidth } = useResponsiveLayout();

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

  const patternItemSize = isLandscape ? 55 : 70;
  const optionSize = isLandscape ? 60 : 70;

  // Landscape layout with two panels
  if (isLandscape) {
    return (
      <View style={[styles.container, { paddingTop: insets.top, paddingLeft: insets.left, paddingRight: insets.right }]}>
        <ScreenHeader
          title="Patterns"
          icon={SCREEN_ICONS.patternIcon}
          onBack={() => { stopSpeaking(); navigation.goBack(); }}
          compact={true}
        />

        <View style={{ flex: 1, flexDirection: 'row', padding: 10, gap: 10 }}>
          {/* Left Panel - Pattern Display */}
          <View style={{ 
            flex: 1, 
            backgroundColor: '#fff', 
            borderRadius: 20, 
            padding: 15,
            justifyContent: 'center',
          }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 }}>
              <View style={{ backgroundColor: '#FFD700', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 15, flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                <Image source={SCREEN_ICONS.starGold} style={{ width: 18, height: 18 }} resizeMode="contain" />
                <Text style={{ fontSize: 14, fontWeight: '700' }}>{score}</Text>
              </View>
              <View style={{ backgroundColor: COLORS.purple, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 15 }}>
                <Text style={{ color: '#fff', fontWeight: '700', fontSize: 14 }}>{completed} done</Text>
              </View>
            </View>

            <View style={{ backgroundColor: COLORS.purple, paddingVertical: 8, paddingHorizontal: 15, borderRadius: 12, alignSelf: 'center', marginBottom: 15 }}>
              <Text style={{ color: '#fff', fontSize: 14, fontWeight: '600' }}>🧠 What comes next?</Text>
            </View>

            <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8 }}>
              {currentPattern.sequence.map((item, index) => (
                <View key={index} style={{ width: patternItemSize, height: patternItemSize, backgroundColor: '#F0E6FF', borderRadius: 12, justifyContent: 'center', alignItems: 'center' }}>
                  <Text style={{ fontSize: patternItemSize * 0.55 }}>{item}</Text>
                </View>
              ))}
              <View style={{ width: patternItemSize, height: patternItemSize, backgroundColor: '#E8E8E8', borderRadius: 12, justifyContent: 'center', alignItems: 'center', borderWidth: 3, borderColor: COLORS.purple, borderStyle: 'dashed' }}>
                <Image source={SCREEN_ICONS.question} style={{ width: patternItemSize * 0.5, height: patternItemSize * 0.5, tintColor: COLORS.purple }} resizeMode="contain" />
              </View>
            </View>
          </View>

          {/* Right Panel - Options */}
          <View style={{ 
            width: 280, 
            backgroundColor: '#fff', 
            borderRadius: 20, 
            padding: 15,
            justifyContent: 'center',
          }}>
            <Text style={{ fontSize: 14, fontWeight: '600', color: '#666', textAlign: 'center', marginBottom: 15 }}>
              Choose the answer:
            </Text>

            <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 12 }}>
              {currentPattern.options.map((option, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => handleAnswer(option)}
                  style={[
                    { 
                      width: optionSize, height: optionSize, 
                      backgroundColor: '#F5F5F5', 
                      borderRadius: 12, 
                      justifyContent: 'center', 
                      alignItems: 'center',
                      borderWidth: 3,
                      borderColor: '#E0E0E0',
                    },
                    showFeedback === 'correct' && option === currentPattern.next && { backgroundColor: '#E8F5E9', borderColor: '#4CAF50' },
                    showFeedback === 'wrong' && option === currentPattern.next && { backgroundColor: '#E8F5E9', borderColor: '#4CAF50' },
                  ]}
                >
                  <Text style={{ fontSize: optionSize * 0.55 }}>{option}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Feedback */}
            {showFeedback && (
              <View style={{ 
                marginTop: 15, 
                backgroundColor: showFeedback === 'correct' ? COLORS.green : COLORS.red, 
                paddingVertical: 10, 
                paddingHorizontal: 20, 
                borderRadius: 15, 
                flexDirection: 'row', 
                alignItems: 'center', 
                justifyContent: 'center',
                gap: 8,
              }}>
                <Image 
                  source={showFeedback === 'correct' ? SCREEN_ICONS.correct : SCREEN_ICONS.wrong} 
                  style={{ width: 22, height: 22, tintColor: '#fff' }} 
                  resizeMode="contain" 
                />
                <Text style={{ color: '#fff', fontSize: 16, fontWeight: '700' }}>
                  {showFeedback === 'correct' ? 'Correct!' : 'Try Again!'}
                </Text>
              </View>
            )}
          </View>
        </View>
      </View>
    );
  }

  // Portrait layout
  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingLeft: insets.left, paddingRight: insets.right }]}>
      {/* Header */}
      <ScreenHeader
        title="Patterns"
        icon={SCREEN_ICONS.patternIcon}
        onBack={() => { stopSpeaking(); navigation.goBack(); }}
        compact={isLandscape}
      />

      <ScrollView 
        contentContainerStyle={[styles.scrollContent, isLandscape && { paddingVertical: 5 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Score */}
        <View style={[styles.statsRow, isLandscape && { marginBottom: 8 }]}>
          <View style={styles.statBox}>
            <Text style={[styles.statLabel, isLandscape && { fontSize: 11 }]}>Score</Text>
            <View style={styles.scoreValue}>
              <Image source={SCREEN_ICONS.starGold} style={[styles.statIcon, isLandscape && { width: 18, height: 18 }]} resizeMode="contain" />
              <Text style={[styles.statValueText, isLandscape && { fontSize: 20 }]}>{score}</Text>
            </View>
          </View>
          <View style={styles.statBox}>
            <Text style={[styles.statLabel, isLandscape && { fontSize: 11 }]}>Completed</Text>
            <Text style={[styles.statValueText, isLandscape && { fontSize: 20 }]}>{completed}</Text>
          </View>
        </View>

        {/* Instructions */}
        <View style={[styles.instructionBox, isLandscape && { paddingVertical: 8, paddingHorizontal: 15, marginBottom: 8 }]}>
          <Image source={SCREEN_ICONS.brain} style={[styles.instructionIcon, isLandscape && { width: 22, height: 22 }]} resizeMode="contain" />
          <Text style={[styles.instructionText, isLandscape && { fontSize: 14 }]}>
            What comes next in the pattern?
          </Text>
        </View>

        {/* Pattern Display */}
        <View style={[styles.patternContainer, isLandscape && { paddingVertical: 15, marginBottom: 10 }]}>
          <View style={styles.patternRow}>
            {currentPattern.sequence.map((item, index) => (
              <View key={index} style={[styles.patternItem, { width: patternItemSize, height: patternItemSize }]}>
                <Text style={[styles.patternEmoji, { fontSize: patternItemSize * 0.55 }]}>{item}</Text>
              </View>
            ))}
            <View style={[styles.questionMark, { width: patternItemSize, height: patternItemSize }]}>
              <Image source={SCREEN_ICONS.question} style={[styles.questionIcon, { width: patternItemSize * 0.5, height: patternItemSize * 0.5 }]} resizeMode="contain" />
            </View>
          </View>
        </View>

        {/* Options */}
        <Text style={[styles.chooseText, isLandscape && { fontSize: 14, marginBottom: 8 }]}>Choose the answer:</Text>
        <View style={styles.optionsRow}>
          {currentPattern.options.map((option, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => handleAnswer(option)}
              style={[
                styles.optionButton,
                { width: optionSize, height: optionSize },
                showFeedback === 'correct' && option === currentPattern.next && styles.correctOption,
                showFeedback === 'wrong' && option === currentPattern.next && styles.showCorrectOption,
              ]}
            >
              <Text style={[styles.optionEmoji, { fontSize: optionSize * 0.55 }]}>{option}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Feedback */}
        {showFeedback && (
          <View style={[
            styles.feedbackBox,
            { backgroundColor: showFeedback === 'correct' ? COLORS.green : COLORS.red },
            isLandscape && { paddingVertical: 8, paddingHorizontal: 20, borderRadius: 15 }
          ]}>
            <Image 
              source={showFeedback === 'correct' ? SCREEN_ICONS.correct : SCREEN_ICONS.wrong} 
              style={[styles.feedbackIcon, isLandscape && { width: 22, height: 22 }]} 
              resizeMode="contain" 
            />
            <Text style={[styles.feedbackText, isLandscape && { fontSize: 14 }]}>
              {showFeedback === 'correct' ? 'Correct!' : 'Try Again!'}
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5E6FF' },
  scrollContent: { paddingBottom: 20, alignItems: 'center' },
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
