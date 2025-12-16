import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Animated,
  Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, RAINBOW_COLORS } from '../constants/colors';
import { MANNERS_SCENARIOS } from '../constants/activityData';
import { speakWord, speakCelebration, speakFeedback, stopSpeaking } from '../utils/speech';
import { ScreenHeader } from '../components';
import { SCREEN_ICONS } from '../assets/images';

const { width } = Dimensions.get('window');

interface MannersGameScreenProps {
  navigation: any;
}

export const MannersGameScreen: React.FC<MannersGameScreenProps> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [scenarios, setScenarios] = useState<typeof MANNERS_SCENARIOS>([]);
  const [current, setCurrent] = useState<typeof MANNERS_SCENARIOS[0] | null>(null);
  const [score, setScore] = useState(0);
  const [completed, setCompleted] = useState(0);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const feedbackAnim = useState(new Animated.Value(0))[0];

  const initGame = useCallback(() => {
    const shuffled = [...MANNERS_SCENARIOS].sort(() => Math.random() - 0.5);
    setScenarios(shuffled);
    setCurrent(shuffled[0]);
    setScore(0);
    setCompleted(0);
    speakWord('Learn good manners! Choose the right response.');
  }, []);

  useEffect(() => {
    initGame();
    return () => stopSpeaking();
  }, [initGame]);

  const handleAnswer = (answer: string) => {
    if (!current) return;

    const isCorrect = answer === current.correct;
    setFeedback(isCorrect ? 'correct' : 'wrong');

    if (isCorrect) {
      setScore(score + 10);
      setCompleted(completed + 1);
      speakCelebration();
    } else {
      speakWord(`The correct answer is: ${current.correct}`);
    }

    Animated.sequence([
      Animated.timing(feedbackAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
      Animated.delay(1500),
      Animated.timing(feedbackAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
    ]).start(() => {
      setFeedback(null);
      if (isCorrect) {
        const remaining = scenarios.slice(1);
        setScenarios(remaining);
        if (remaining.length > 0) {
          setCurrent(remaining[0]);
          speakWord(remaining[0].situation);
        } else {
          setCurrent(null);
        }
      }
    });
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScreenHeader
        title="Manners"
        icon={SCREEN_ICONS.handshake}
        onBack={() => { stopSpeaking(); navigation.goBack(); }}
        rightElement={
          <View style={styles.scoreBox}>
            <Image source={SCREEN_ICONS.starGold} style={styles.scoreIcon} resizeMode="contain" />
            <Text style={styles.scoreText}>{score}</Text>
          </View>
        }
      />

      {/* Progress */}
      <Text style={styles.progressText}>
        Question: {completed + 1} / {MANNERS_SCENARIOS.length}
      </Text>

      {current ? (
        <>
          {/* Scenario */}
          <View style={styles.scenarioContainer}>
            <Text style={styles.scenarioEmoji}>{current.emoji}</Text>
            <Text style={styles.scenarioText}>{current.situation}</Text>
            <Text style={styles.questionText}>What should you say?</Text>
          </View>

          {/* Options */}
          <View style={styles.optionsContainer}>
            {current.options.map((option, index) => (
              <TouchableOpacity
                key={index}
                style={[styles.optionButton, { backgroundColor: RAINBOW_COLORS[index] }]}
                onPress={() => handleAnswer(option)}
              >
                <Text style={styles.optionText}>{option}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Feedback */}
          {feedback && (
            <Animated.View
              style={[
                styles.feedbackBox,
                {
                  opacity: feedbackAnim,
                  backgroundColor: feedback === 'correct' ? COLORS.green : COLORS.orange,
                },
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
        </>
      ) : (
        <View style={styles.completeContainer}>
          <Text style={styles.completeEmoji}>🎉🌟🤝</Text>
          <Text style={styles.completeTitle}>Amazing!</Text>
          <Text style={styles.completeText}>You know your manners!</Text>
          <Text style={styles.tipText}>💡 Remember: Being polite makes everyone happy!</Text>
          <TouchableOpacity onPress={initGame} style={styles.playAgainButton}>
            <Text style={styles.playAgainText}>Practice Again!</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF5F5' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  backButton: { padding: 8 },
  backText: { fontSize: 16, color: COLORS.pink, fontWeight: '600' },
  title: { fontSize: 22, fontWeight: 'bold', color: COLORS.purple },
  scoreBox: { backgroundColor: COLORS.yellow, paddingHorizontal: 15, paddingVertical: 8, borderRadius: 15, flexDirection: 'row', alignItems: 'center' },
  scoreIcon: { width: 20, height: 20, marginRight: 4, resizeMode: 'contain' },
  scoreText: { fontSize: 16, fontWeight: 'bold' },
  progressText: {
    fontSize: 14,
    color: COLORS.gray,
    textAlign: 'center',
    marginVertical: 10,
  },
  scenarioContainer: {
    backgroundColor: COLORS.white,
    marginHorizontal: 20,
    paddingVertical: 30,
    paddingHorizontal: 20,
    borderRadius: 25,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 5,
    marginBottom: 20,
  },
  scenarioEmoji: { fontSize: 60 },
  scenarioText: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.black,
    textAlign: 'center',
    marginTop: 15,
    lineHeight: 28,
  },
  questionText: {
    fontSize: 16,
    color: COLORS.purple,
    marginTop: 15,
  },
  optionsContainer: {
    paddingHorizontal: 20,
  },
  optionButton: {
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  optionText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.white,
    textAlign: 'center',
  },
  feedbackBox: {
    position: 'absolute',
    bottom: 100,
    alignSelf: 'center',
    paddingHorizontal: 25,
    paddingVertical: 15,
    borderRadius: 25,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  feedbackEmoji: { fontSize: 24 },
  feedbackText: { fontSize: 16, fontWeight: 'bold', color: COLORS.white },
  completeContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  completeEmoji: { fontSize: 60 },
  completeTitle: { fontSize: 32, fontWeight: 'bold', color: COLORS.purple, marginTop: 15 },
  completeText: { fontSize: 18, color: COLORS.gray, marginTop: 10 },
  tipText: { fontSize: 14, color: COLORS.green, marginTop: 20, textAlign: 'center' },
  playAgainButton: {
    marginTop: 25,
    backgroundColor: COLORS.green,
    paddingHorizontal: 35,
    paddingVertical: 15,
    borderRadius: 25,
  },
  playAgainText: { fontSize: 18, fontWeight: 'bold', color: COLORS.white },
});


