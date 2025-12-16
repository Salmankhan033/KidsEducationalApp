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
import { COLORS } from '../constants/colors';
import { FOOD_ITEMS } from '../constants/activityData';
import { speakWord, speakCelebration, speakFeedback, stopSpeaking } from '../utils/speech';
import { ScreenHeader } from '../components';
import { SCREEN_ICONS } from '../assets/images';

const { width } = Dimensions.get('window');

interface FoodSortingScreenProps {
  navigation: any;
}

export const FoodSortingScreen: React.FC<FoodSortingScreenProps> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [currentFood, setCurrentFood] = useState<typeof FOOD_ITEMS[0] | null>(null);
  const [remaining, setRemaining] = useState<typeof FOOD_ITEMS>([]);
  const [score, setScore] = useState(0);
  const [healthyCount, setHealthyCount] = useState(0);
  const [junkCount, setJunkCount] = useState(0);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const feedbackAnim = useState(new Animated.Value(0))[0];

  const initGame = useCallback(() => {
    const shuffled = [...FOOD_ITEMS].sort(() => Math.random() - 0.5);
    setRemaining(shuffled);
    setCurrentFood(shuffled[0]);
    setScore(0);
    setHealthyCount(0);
    setJunkCount(0);
    speakWord('Sort the food! Healthy or Junk?');
  }, []);

  useEffect(() => {
    initGame();
    return () => stopSpeaking();
  }, [initGame]);

  const handleSort = (type: 'healthy' | 'junk') => {
    if (!currentFood) return;

    const isCorrect = currentFood.type === type;
    setFeedback(isCorrect ? 'correct' : 'wrong');

    if (isCorrect) {
      setScore(score + 10);
      if (type === 'healthy') setHealthyCount(healthyCount + 1);
      else setJunkCount(junkCount + 1);
      speakCelebration();
    } else {
      speakFeedback(false);
    }

    Animated.sequence([
      Animated.timing(feedbackAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
      Animated.delay(500),
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

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScreenHeader
        title="Food Sort"
        icon={SCREEN_ICONS.apple}
        onBack={() => { stopSpeaking(); navigation.goBack(); }}
        rightElement={
          <View style={styles.scoreBox}>
            <Image source={SCREEN_ICONS.starGold} style={styles.scoreIcon} resizeMode="contain" />
            <Text style={styles.scoreText}>{score}</Text>
          </View>
        }
      />

      {/* Stats */}
      <View style={styles.statsRow}>
        <View style={[styles.statBox, { backgroundColor: COLORS.green }]}>
          <Text style={styles.statEmoji}>🥗</Text>
          <Text style={styles.statValue}>{healthyCount}</Text>
        </View>
        <View style={[styles.statBox, { backgroundColor: COLORS.orange }]}>
          <Text style={styles.statEmoji}>🍔</Text>
          <Text style={styles.statValue}>{junkCount}</Text>
        </View>
      </View>

      {currentFood ? (
        <>
          {/* Current Food */}
          <View style={styles.foodContainer}>
            <Text style={styles.foodEmoji}>{currentFood.emoji}</Text>
            <Text style={styles.foodName}>{currentFood.name}</Text>
            <TouchableOpacity onPress={() => speakWord(currentFood.name)} style={styles.soundBtn}>
              <Text style={styles.soundText}>🔊</Text>
            </TouchableOpacity>
          </View>

          {/* Question */}
          <Text style={styles.question}>Is this Healthy or Junk food?</Text>

          {/* Sorting Bins */}
          <View style={styles.binsRow}>
            <TouchableOpacity
              onPress={() => handleSort('healthy')}
              style={[styles.bin, { backgroundColor: COLORS.green }]}
            >
              <Text style={styles.binEmoji}>🥗</Text>
              <Text style={styles.binText}>Healthy</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => handleSort('junk')}
              style={[styles.bin, { backgroundColor: COLORS.red }]}
            >
              <Text style={styles.binEmoji}>🍔</Text>
              <Text style={styles.binText}>Junk</Text>
            </TouchableOpacity>
          </View>

          {/* Remaining */}
          <Text style={styles.remaining}>{remaining.length} items left</Text>
        </>
      ) : (
        <View style={styles.completeContainer}>
          <Text style={styles.completeEmoji}>🎉</Text>
          <Text style={styles.completeTitle}>All Sorted!</Text>
          <Text style={styles.completeText}>
            Healthy: {healthyCount} | Junk: {junkCount}
          </Text>
          <Text style={styles.tip}>💡 Tip: Eat more healthy food!</Text>
          <TouchableOpacity onPress={initGame} style={styles.playAgainButton}>
            <Text style={styles.playAgainText}>Play Again!</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Feedback */}
      {feedback && (
        <Animated.View
          style={[
            styles.feedbackBox,
            {
              opacity: feedbackAnim,
              backgroundColor: feedback === 'correct' ? COLORS.green : COLORS.red,
            },
          ]}
        >
          <Text style={styles.feedbackText}>
            {feedback === 'correct' ? '✓ Correct!' : '✗ Try Again!'}
          </Text>
        </Animated.View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF9E6' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  backButton: { padding: 8 },
  backText: { fontSize: 16, color: COLORS.green, fontWeight: '600' },
  title: { fontSize: 22, fontWeight: 'bold', color: COLORS.purple },
  scoreBox: { backgroundColor: COLORS.yellow, paddingHorizontal: 15, paddingVertical: 8, borderRadius: 15, flexDirection: 'row', alignItems: 'center' },
  scoreIcon: { width: 20, height: 20, marginRight: 4, resizeMode: 'contain' },
  scoreText: { fontSize: 16, fontWeight: 'bold' },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 30,
    marginVertical: 10,
  },
  statBox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    gap: 8,
  },
  statEmoji: { fontSize: 24 },
  statValue: { fontSize: 20, fontWeight: 'bold', color: COLORS.white },
  foodContainer: {
    alignItems: 'center',
    backgroundColor: COLORS.white,
    marginHorizontal: 40,
    paddingVertical: 30,
    borderRadius: 25,
    marginVertical: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 5,
  },
  foodEmoji: { fontSize: 80 },
  foodName: { fontSize: 28, fontWeight: 'bold', color: COLORS.black, marginTop: 10 },
  soundBtn: { marginTop: 10 },
  soundText: { fontSize: 30 },
  question: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.purple,
    textAlign: 'center',
    marginBottom: 20,
  },
  binsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 20,
  },
  bin: {
    width: (width - 60) / 2,
    height: 120,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
  },
  binEmoji: { fontSize: 40 },
  binText: { fontSize: 18, fontWeight: 'bold', color: COLORS.white, marginTop: 5 },
  remaining: { textAlign: 'center', color: COLORS.gray, marginTop: 20 },
  completeContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  completeEmoji: { fontSize: 80 },
  completeTitle: { fontSize: 32, fontWeight: 'bold', color: COLORS.purple, marginTop: 15 },
  completeText: { fontSize: 18, color: COLORS.gray, marginTop: 10 },
  tip: { fontSize: 16, color: COLORS.green, marginTop: 15, fontWeight: '500' },
  playAgainButton: {
    marginTop: 25,
    backgroundColor: COLORS.green,
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 25,
  },
  playAgainText: { fontSize: 18, fontWeight: 'bold', color: COLORS.white },
  feedbackBox: {
    position: 'absolute',
    bottom: 100,
    alignSelf: 'center',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
  },
  feedbackText: { fontSize: 20, fontWeight: 'bold', color: COLORS.white },
});


