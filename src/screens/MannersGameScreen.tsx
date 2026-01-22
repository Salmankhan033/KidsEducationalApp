import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Animated,
  ScrollView,
  Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, RAINBOW_COLORS } from '../constants/colors';
import { MANNERS_SCENARIOS } from '../constants/activityData';
import { speakWord, speakCelebration, speakFeedback, stopSpeaking } from '../utils/speech';
import { ScreenHeader } from '../components';
import { SCREEN_ICONS } from '../assets/images';
import { useResponsiveLayout } from '../utils/useResponsiveLayout';

const { width } = Dimensions.get('window');

interface MannersGameScreenProps {
  navigation: any;
}

export const MannersGameScreen: React.FC<MannersGameScreenProps> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { isLandscape } = useResponsiveLayout();
  const [scenarios, setScenarios] = useState<typeof MANNERS_SCENARIOS>([]);
  const [current, setCurrent] = useState<typeof MANNERS_SCENARIOS[0] | null>(null);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [completed, setCompleted] = useState(0);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const feedbackAnim = useRef(new Animated.Value(0)).current;
  const bounceAnim = useRef(new Animated.Value(1)).current;

  const initGame = useCallback(() => {
    const shuffled = [...MANNERS_SCENARIOS].sort(() => Math.random() - 0.5);
    setScenarios(shuffled);
    setCurrent(shuffled[0]);
    setScore(0);
    setStreak(0);
    setCompleted(0);
    speakWord('Learn good manners! Choose the right response.');
  }, []);

  useEffect(() => {
    initGame();
    return () => stopSpeaking();
  }, [initGame]);

  useEffect(() => {
    if (current) {
      Animated.sequence([
        Animated.timing(bounceAnim, { toValue: 1.1, duration: 200, useNativeDriver: true }),
        Animated.timing(bounceAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
      ]).start();
    }
  }, [current, bounceAnim]);

  const handleAnswer = (answer: string) => {
    if (!current) return;

    const isCorrect = answer === current.correct;
    setFeedback(isCorrect ? 'correct' : 'wrong');

    if (isCorrect) {
      setScore(score + 10 + streak * 2);
      setStreak(streak + 1);
      setCompleted(completed + 1);
      speakCelebration();
    } else {
      setStreak(0);
      speakWord(`The correct answer is: ${current.correct}`);
    }

    Animated.sequence([
      Animated.timing(feedbackAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
      Animated.delay(1200),
      Animated.timing(feedbackAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
    ]).start(() => {
      setFeedback(null);
      if (isCorrect) {
        const remaining = scenarios.slice(1);
        setScenarios(remaining);
        if (remaining.length > 0) {
          setCurrent(remaining[0]);
          setTimeout(() => speakWord(remaining[0].situation), 300);
        } else {
          setCurrent(null);
        }
      }
    });
  };

  const progress = Math.round((completed / MANNERS_SCENARIOS.length) * 100);

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingLeft: insets.left, paddingRight: insets.right }]}>
      <ScreenHeader
        title="Manners"
        icon={SCREEN_ICONS.handshake}
        onBack={() => { stopSpeaking(); navigation.goBack(); }}
        compact={isLandscape}
      />

      {/* Stats Row */}
      <View style={styles.statsRow}>
        <View style={styles.progressBox}>
          <Text style={styles.progressLabel}>Question {completed + 1}/{MANNERS_SCENARIOS.length}</Text>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progress}%` }]} />
          </View>
        </View>
        <View style={styles.scoreStreak}>
          <View style={styles.streakBox}>
            <Text style={styles.streakEmoji}>🔥</Text>
            <Text style={styles.streakText}>{streak}</Text>
          </View>
          <View style={styles.scoreBox}>
            <Text style={styles.scoreEmoji}>⭐</Text>
            <Text style={styles.scoreText}>{score}</Text>
          </View>
        </View>
      </View>

      {current ? (
        <View style={styles.mainContent}>
          {/* Left Panel - Scenario */}
          <View style={styles.leftPanel}>
            <Animated.View style={[styles.scenarioCard, { transform: [{ scale: bounceAnim }] }]}>
              <Text style={styles.scenarioEmoji}>{current.emoji}</Text>
              <Text style={styles.scenarioText}>{current.situation}</Text>
              <Text style={styles.questionText}>What should you say?</Text>
              <TouchableOpacity 
                style={styles.hearButton}
                onPress={() => speakWord(current.situation)}
              >
                <Text style={styles.hearText}>🔊 Hear Again</Text>
              </TouchableOpacity>
            </Animated.View>
            
            {/* Feedback in left panel */}
            {feedback && (
              <Animated.View
                style={[
                  styles.feedbackBox,
                  { opacity: feedbackAnim },
                  feedback === 'correct' ? styles.feedbackCorrect : styles.feedbackWrong,
                ]}
              >
                <Text style={styles.feedbackEmoji}>
                  {feedback === 'correct' ? '🎉' : '💡'}
                </Text>
                <Text style={styles.feedbackText}>
                  {feedback === 'correct' ? 'Great manners!' : `Better: "${current.correct}"`}
                </Text>
              </Animated.View>
            )}
          </View>

          {/* Right Panel - Options */}
          <ScrollView 
            style={styles.rightPanel}
            contentContainerStyle={styles.rightPanelContent}
            showsVerticalScrollIndicator={false}
          >
            <Text style={styles.chooseText}>Choose your answer:</Text>
            {current.options.map((option, index) => (
              <TouchableOpacity
                key={index}
                style={[styles.optionButton, { backgroundColor: RAINBOW_COLORS[index] }]}
                onPress={() => handleAnswer(option)}
                disabled={feedback !== null}
              >
                <Text style={styles.optionText}>{option}</Text>
              </TouchableOpacity>
            ))}
            
            <View style={styles.tipBox}>
              <Text style={styles.tipText}>💡 Being polite makes everyone happy!</Text>
            </View>
          </ScrollView>
        </View>
      ) : (
        <View style={styles.completeContainer}>
          <Text style={styles.completeEmoji}>🎉🌟🤝</Text>
          <Text style={styles.completeTitle}>Amazing!</Text>
          <Text style={styles.completeScore}>Score: {score} points</Text>
          <Text style={styles.completeText}>You know your manners!</Text>
          <View style={styles.achievementBox}>
            <Text style={styles.achievementTitle}>🏆 Achievement</Text>
            <Text style={styles.achievementText}>Polite Champion!</Text>
          </View>
          <TouchableOpacity onPress={initGame} style={styles.playAgainButton}>
            <Text style={styles.playAgainText}>🔄 Practice Again!</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF5F5' },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 15,
    marginBottom: 10,
  },
  progressBox: {
    flex: 1,
    marginRight: 15,
  },
  progressLabel: { fontSize: 12, fontWeight: '600', color: COLORS.purple, marginBottom: 4 },
  progressBar: {
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 4,
  },
  scoreStreak: {
    flexDirection: 'row',
    gap: 8,
  },
  streakBox: {
    backgroundColor: '#FFE0B2',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  streakEmoji: { fontSize: 14 },
  streakText: { fontSize: 12, fontWeight: 'bold', color: '#E65100' },
  scoreBox: {
    backgroundColor: COLORS.yellow,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  scoreEmoji: { fontSize: 14 },
  scoreText: { fontSize: 12, fontWeight: 'bold', color: COLORS.black },
  
  mainContent: {
    flex: 1,
    flexDirection: 'row',
    paddingHorizontal: 10,
    gap: 10,
  },
  
  leftPanel: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 4,
  },
  scenarioCard: {
    alignItems: 'center',
  },
  scenarioEmoji: { fontSize: 50 },
  scenarioText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.black,
    textAlign: 'center',
    marginTop: 12,
    lineHeight: 22,
  },
  questionText: {
    fontSize: 13,
    color: COLORS.purple,
    marginTop: 12,
    fontWeight: '500',
  },
  hearButton: {
    marginTop: 12,
    backgroundColor: COLORS.orange,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 14,
  },
  hearText: { fontSize: 12, fontWeight: 'bold', color: COLORS.white },
  
  feedbackBox: {
    marginTop: 15,
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  feedbackCorrect: { backgroundColor: '#E8F5E9' },
  feedbackWrong: { backgroundColor: '#FFF3E0' },
  feedbackEmoji: { fontSize: 24 },
  feedbackText: { fontSize: 12, fontWeight: '600', color: COLORS.black, marginTop: 4, textAlign: 'center' },
  
  rightPanel: {
    flex: 1.2,
  },
  rightPanelContent: {
    paddingBottom: 15,
  },
  chooseText: {
    fontSize: 13,
    color: COLORS.gray,
    marginBottom: 10,
    fontWeight: '500',
  },
  optionButton: {
    paddingVertical: 14,
    paddingHorizontal: 15,
    borderRadius: 14,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
  },
  optionText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: COLORS.white,
    textAlign: 'center',
  },
  tipBox: {
    backgroundColor: '#E8F5E9',
    padding: 10,
    borderRadius: 10,
    marginTop: 5,
  },
  tipText: { fontSize: 11, color: '#2E7D32', textAlign: 'center' },
  
  completeContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  completeEmoji: { fontSize: 50 },
  completeTitle: { fontSize: 28, fontWeight: 'bold', color: COLORS.purple, marginTop: 12 },
  completeScore: { fontSize: 18, fontWeight: '600', color: COLORS.orange, marginTop: 5 },
  completeText: { fontSize: 15, color: COLORS.gray, marginTop: 5 },
  achievementBox: {
    backgroundColor: COLORS.yellow,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 15,
    marginTop: 15,
    alignItems: 'center',
  },
  achievementTitle: { fontSize: 12, fontWeight: 'bold', color: COLORS.black },
  achievementText: { fontSize: 14, fontWeight: 'bold', color: COLORS.purple, marginTop: 2 },
  playAgainButton: {
    marginTop: 20,
    backgroundColor: COLORS.green,
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 20,
  },
  playAgainText: { fontSize: 15, fontWeight: 'bold', color: COLORS.white },
});
