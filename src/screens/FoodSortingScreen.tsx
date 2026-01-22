import React, { useState, useEffect, useCallback, useRef } from 'react';
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
import { FOOD_ITEMS } from '../constants/activityData';
import { speakWord, speakCelebration, speakFeedback, stopSpeaking } from '../utils/speech';
import { ScreenHeader } from '../components';
import { SCREEN_ICONS } from '../assets/images';
import { useResponsiveLayout } from '../utils/useResponsiveLayout';

const { width } = Dimensions.get('window');

interface FoodSortingScreenProps {
  navigation: any;
}

export const FoodSortingScreen: React.FC<FoodSortingScreenProps> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { isLandscape } = useResponsiveLayout();
  const [currentFood, setCurrentFood] = useState<typeof FOOD_ITEMS[0] | null>(null);
  const [remaining, setRemaining] = useState<typeof FOOD_ITEMS>([]);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [healthyCount, setHealthyCount] = useState(0);
  const [junkCount, setJunkCount] = useState(0);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const feedbackAnim = useRef(new Animated.Value(0)).current;
  const bounceAnim = useRef(new Animated.Value(1)).current;

  const initGame = useCallback(() => {
    const shuffled = [...FOOD_ITEMS].sort(() => Math.random() - 0.5);
    setRemaining(shuffled);
    setCurrentFood(shuffled[0]);
    setScore(0);
    setStreak(0);
    setHealthyCount(0);
    setJunkCount(0);
    speakWord('Sort the food! Healthy or Junk?');
  }, []);

  useEffect(() => {
    initGame();
    return () => stopSpeaking();
  }, [initGame]);

  useEffect(() => {
    if (currentFood) {
      Animated.sequence([
        Animated.timing(bounceAnim, { toValue: 1.1, duration: 200, useNativeDriver: true }),
        Animated.timing(bounceAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
      ]).start();
    }
  }, [currentFood, bounceAnim]);

  const handleSort = (type: 'healthy' | 'junk') => {
    if (!currentFood) return;

    const isCorrect = currentFood.type === type;
    setFeedback(isCorrect ? 'correct' : 'wrong');

    if (isCorrect) {
      setScore(score + 10 + streak * 2);
      setStreak(streak + 1);
      if (type === 'healthy') setHealthyCount(healthyCount + 1);
      else setJunkCount(junkCount + 1);
      speakCelebration();
    } else {
      setStreak(0);
      speakFeedback(false);
    }

    Animated.sequence([
      Animated.timing(feedbackAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
      Animated.delay(600),
      Animated.timing(feedbackAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
    ]).start(() => {
      setFeedback(null);
      if (isCorrect) {
        const newRemaining = remaining.slice(1);
        setRemaining(newRemaining);
        setCurrentFood(newRemaining[0] || null);
      }
    });
  };

  const progress = Math.round(((FOOD_ITEMS.length - remaining.length) / FOOD_ITEMS.length) * 100);

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingLeft: insets.left, paddingRight: insets.right }]}>
      <ScreenHeader
        title="Food Sort"
        icon={SCREEN_ICONS.apple}
        onBack={() => { stopSpeaking(); navigation.goBack(); }}
        compact={isLandscape}
      />

      {/* Stats Row */}
      <View style={styles.statsRow}>
        <View style={[styles.statBox, styles.healthyBox]}>
          <Text style={styles.statEmoji}>🥗</Text>
          <Text style={styles.statValue}>{healthyCount}</Text>
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
        <View style={[styles.statBox, styles.junkBox]}>
          <Text style={styles.statEmoji}>🍔</Text>
          <Text style={styles.statValue}>{junkCount}</Text>
        </View>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <Text style={styles.progressLabel}>{remaining.length} items left</Text>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>
      </View>

      {currentFood ? (
        <View style={styles.mainContent}>
          {/* Left Panel - Healthy Bin */}
          <TouchableOpacity
            style={[styles.binPanel, styles.healthyBin]}
            onPress={() => handleSort('healthy')}
            activeOpacity={0.8}
          >
            <Text style={styles.binEmoji}>🥗</Text>
            <Text style={styles.binTitle}>Healthy</Text>
            <Text style={styles.binDesc}>Tap here for healthy food!</Text>
            <View style={styles.binExamples}>
              <Text style={styles.exampleText}>🍎 🥕 🥦</Text>
            </View>
          </TouchableOpacity>

          {/* Center Panel - Current Food */}
          <View style={styles.centerPanel}>
            <Animated.View style={[styles.foodCard, { transform: [{ scale: bounceAnim }] }]}>
              <Text style={styles.foodEmoji}>{currentFood.emoji}</Text>
              <Text style={styles.foodName}>{currentFood.name}</Text>
              <TouchableOpacity 
                style={styles.soundBtn}
                onPress={() => speakWord(currentFood.name)}
              >
                <Text style={styles.soundText}>🔊</Text>
              </TouchableOpacity>
            </Animated.View>
            
            <Text style={styles.question}>Is this Healthy or Junk?</Text>
            
            {/* Feedback */}
            {feedback && (
              <Animated.View
                style={[
                  styles.feedbackBox,
                  { opacity: feedbackAnim },
                  feedback === 'correct' ? styles.feedbackCorrect : styles.feedbackWrong,
                ]}
              >
                <Text style={styles.feedbackEmoji}>
                  {feedback === 'correct' ? '✓' : '✗'}
                </Text>
                <Text style={styles.feedbackText}>
                  {feedback === 'correct' ? 'Correct!' : 'Try Again!'}
                </Text>
              </Animated.View>
            )}
          </View>

          {/* Right Panel - Junk Bin */}
          <TouchableOpacity
            style={[styles.binPanel, styles.junkBin]}
            onPress={() => handleSort('junk')}
            activeOpacity={0.8}
          >
            <Text style={styles.binEmoji}>🍔</Text>
            <Text style={styles.binTitle}>Junk</Text>
            <Text style={styles.binDesc}>Tap here for junk food!</Text>
            <View style={styles.binExamples}>
              <Text style={styles.exampleText}>🍕 🍟 🍩</Text>
            </View>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.completeContainer}>
          <Text style={styles.completeEmoji}>🎉</Text>
          <Text style={styles.completeTitle}>All Sorted!</Text>
          <Text style={styles.completeScore}>Score: {score} points</Text>
          
          <View style={styles.resultRow}>
            <View style={[styles.resultBox, styles.healthyResult]}>
              <Text style={styles.resultEmoji}>🥗</Text>
              <Text style={styles.resultValue}>{healthyCount}</Text>
              <Text style={styles.resultLabel}>Healthy</Text>
            </View>
            <View style={[styles.resultBox, styles.junkResult]}>
              <Text style={styles.resultEmoji}>🍔</Text>
              <Text style={styles.resultValue}>{junkCount}</Text>
              <Text style={styles.resultLabel}>Junk</Text>
            </View>
          </View>
          
          <View style={styles.tipBox}>
            <Text style={styles.tipText}>💡 Eat more healthy food for strong body!</Text>
          </View>
          
          <TouchableOpacity onPress={initGame} style={styles.playAgainButton}>
            <Text style={styles.playAgainText}>🔄 Play Again!</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF9E6' },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 15,
    marginBottom: 8,
  },
  statBox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    gap: 5,
  },
  healthyBox: { backgroundColor: '#E8F5E9' },
  junkBox: { backgroundColor: '#FFEBEE' },
  statEmoji: { fontSize: 18 },
  statValue: { fontSize: 14, fontWeight: 'bold', color: COLORS.black },
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
  
  progressContainer: {
    marginHorizontal: 15,
    marginBottom: 10,
  },
  progressLabel: { fontSize: 11, color: COLORS.gray, marginBottom: 4 },
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

  mainContent: {
    flex: 1,
    flexDirection: 'row',
    paddingHorizontal: 10,
    gap: 10,
  },
  
  binPanel: {
    flex: 0.8,
    borderRadius: 20,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 4,
  },
  healthyBin: { backgroundColor: '#4CAF50' },
  junkBin: { backgroundColor: '#FF5722' },
  binEmoji: { fontSize: 35 },
  binTitle: { fontSize: 14, fontWeight: 'bold', color: COLORS.white, marginTop: 6 },
  binDesc: { fontSize: 9, color: 'rgba(255,255,255,0.8)', marginTop: 4, textAlign: 'center' },
  binExamples: { marginTop: 8 },
  exampleText: { fontSize: 16 },
  
  centerPanel: {
    flex: 1.4,
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 4,
  },
  foodCard: {
    alignItems: 'center',
  },
  foodEmoji: { fontSize: 60 },
  foodName: { fontSize: 20, fontWeight: 'bold', color: COLORS.black, marginTop: 8 },
  soundBtn: { marginTop: 8 },
  soundText: { fontSize: 24 },
  question: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.purple,
    marginTop: 12,
  },
  
  feedbackBox: {
    marginTop: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  feedbackCorrect: { backgroundColor: '#E8F5E9' },
  feedbackWrong: { backgroundColor: '#FFEBEE' },
  feedbackEmoji: { fontSize: 18 },
  feedbackText: { fontSize: 13, fontWeight: 'bold' },
  
  completeContainer: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  completeEmoji: { fontSize: 50 },
  completeTitle: { fontSize: 26, fontWeight: 'bold', color: COLORS.purple, marginTop: 10 },
  completeScore: { fontSize: 16, fontWeight: '600', color: COLORS.orange, marginTop: 4 },
  
  resultRow: {
    flexDirection: 'row',
    marginTop: 20,
    gap: 20,
  },
  resultBox: {
    paddingHorizontal: 25,
    paddingVertical: 15,
    borderRadius: 15,
    alignItems: 'center',
  },
  healthyResult: { backgroundColor: '#E8F5E9' },
  junkResult: { backgroundColor: '#FFEBEE' },
  resultEmoji: { fontSize: 28 },
  resultValue: { fontSize: 22, fontWeight: 'bold', color: COLORS.black, marginTop: 4 },
  resultLabel: { fontSize: 12, color: COLORS.gray, marginTop: 2 },
  
  tipBox: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
    marginTop: 15,
  },
  tipText: { fontSize: 12, color: '#2E7D32' },
  
  playAgainButton: {
    marginTop: 15,
    backgroundColor: COLORS.green,
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 20,
  },
  playAgainText: { fontSize: 15, fontWeight: 'bold', color: COLORS.white },
});
