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
import { COLORS, RAINBOW_COLORS } from '../constants/colors';
import { ROOM_ITEMS } from '../constants/activityData';
import { speakWord, speakCelebration, speakFeedback, stopSpeaking } from '../utils/speech';
import { ScreenHeader } from '../components';
import { SCREEN_ICONS } from '../assets/images';
import { useResponsiveLayout } from '../utils/useResponsiveLayout';

const { width } = Dimensions.get('window');

interface CleanRoomScreenProps {
  navigation: any;
}

export const CleanRoomScreen: React.FC<CleanRoomScreenProps> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { isLandscape } = useResponsiveLayout();
  const [items, setItems] = useState<typeof ROOM_ITEMS>([]);
  const [currentItem, setCurrentItem] = useState<typeof ROOM_ITEMS[0] | null>(null);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [cleaned, setCleaned] = useState(0);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const celebrateAnim = useRef(new Animated.Value(0)).current;
  const bounceAnim = useRef(new Animated.Value(1)).current;
  const feedbackAnim = useRef(new Animated.Value(0)).current;

  const initGame = useCallback(() => {
    const shuffled = [...ROOM_ITEMS].sort(() => Math.random() - 0.5);
    setItems(shuffled);
    setCurrentItem(shuffled[0]);
    setScore(0);
    setStreak(0);
    setCleaned(0);
    celebrateAnim.setValue(0);
    speakWord('Help clean the room! Put items in the right place!');
  }, [celebrateAnim]);

  useEffect(() => {
    initGame();
    return () => stopSpeaking();
  }, [initGame]);

  useEffect(() => {
    if (currentItem) {
      Animated.sequence([
        Animated.timing(bounceAnim, { toValue: 1.1, duration: 200, useNativeDriver: true }),
        Animated.timing(bounceAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
      ]).start();
    }
  }, [currentItem, bounceAnim]);

  const destinations = [
    { id: 'toybox', emoji: '🧸', name: 'Toy Box', color: '#FF6B6B' },
    { id: 'closet', emoji: '👕', name: 'Closet', color: '#4ECDC4' },
    { id: 'shelf', emoji: '📚', name: 'Shelf', color: '#9B59B6' },
    { id: 'desk', emoji: '✏️', name: 'Desk', color: '#3498DB' },
  ];

  const handleDestination = (destinationId: string) => {
    if (!currentItem) return;

    const isCorrect = currentItem.destination === destinationId;
    setFeedback(isCorrect ? 'correct' : 'wrong');

    if (isCorrect) {
      setScore(score + 10 + streak * 2);
      setStreak(streak + 1);
      setCleaned(cleaned + 1);
      speakCelebration();

      Animated.sequence([
        Animated.timing(feedbackAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
        Animated.delay(600),
        Animated.timing(feedbackAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
      ]).start(() => {
        setFeedback(null);
        const remaining = items.slice(1);
        setItems(remaining);
        
        if (remaining.length > 0) {
          setCurrentItem(remaining[0]);
        } else {
          setCurrentItem(null);
          Animated.spring(celebrateAnim, {
            toValue: 1,
            useNativeDriver: true,
          }).start();
        }
      });
    } else {
      setStreak(0);
      speakFeedback(false);
      
      Animated.sequence([
        Animated.timing(feedbackAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
        Animated.delay(600),
        Animated.timing(feedbackAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
      ]).start(() => setFeedback(null));
    }
  };

  const progress = Math.round((cleaned / ROOM_ITEMS.length) * 100);

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingLeft: insets.left, paddingRight: insets.right }]}>
      <ScreenHeader
        title="Clean Room"
        icon={SCREEN_ICONS.broom}
        onBack={() => { stopSpeaking(); navigation.goBack(); }}
        compact={isLandscape}
      />

      {/* Stats Row */}
      <View style={styles.statsRow}>
        <View style={styles.progressBox}>
          <Text style={styles.progressLabel}>Cleaned: {cleaned}/{ROOM_ITEMS.length}</Text>
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

      {currentItem ? (
        <View style={styles.mainContent}>
          {/* Left Panel - Current Item */}
          <View style={styles.leftPanel}>
            <Text style={styles.instruction}>Where does this go?</Text>
            
            <Animated.View style={[styles.itemCard, { transform: [{ scale: bounceAnim }] }]}>
              <Text style={styles.itemEmoji}>{currentItem.emoji}</Text>
              <Text style={styles.itemName}>{currentItem.name}</Text>
              <TouchableOpacity 
                style={styles.soundBtn}
                onPress={() => speakWord(currentItem.name)}
              >
                <Text style={styles.soundText}>🔊 Hear</Text>
              </TouchableOpacity>
            </Animated.View>
            
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
                  {feedback === 'correct' ? 'Great!' : 'Try Again!'}
                </Text>
              </Animated.View>
            )}
            
            {/* Remaining items preview */}
            <View style={styles.remainingBox}>
              <Text style={styles.remainingTitle}>Items left:</Text>
              <View style={styles.remainingItems}>
                {items.slice(1, 5).map((item, index) => (
                  <Text key={index} style={styles.remainingEmoji}>{item.emoji}</Text>
                ))}
                {items.length > 5 && <Text style={styles.remainingMore}>+{items.length - 5}</Text>}
              </View>
            </View>
          </View>

          {/* Right Panel - Destinations */}
          <ScrollView 
            style={styles.rightPanel}
            contentContainerStyle={styles.rightPanelContent}
            showsVerticalScrollIndicator={false}
          >
            <Text style={styles.destTitle}>Tap the right place:</Text>
            <View style={styles.destGrid}>
              {destinations.map((dest) => (
                <TouchableOpacity
                  key={dest.id}
                  style={[styles.destButton, { backgroundColor: dest.color }]}
                  onPress={() => handleDestination(dest.id)}
                  disabled={feedback !== null}
                >
                  <Text style={styles.destEmoji}>{dest.emoji}</Text>
                  <Text style={styles.destName}>{dest.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
            
            <View style={styles.tipBox}>
              <Text style={styles.tipText}>💡 Put things where they belong!</Text>
            </View>
          </ScrollView>
        </View>
      ) : (
        <Animated.View style={[styles.completeContainer, { opacity: celebrateAnim }]}>
          <Text style={styles.completeEmoji}>🎉✨🏠</Text>
          <Text style={styles.completeTitle}>Room is Clean!</Text>
          <Text style={styles.completeScore}>Score: {score} points</Text>
          <Text style={styles.completeText}>Great job organizing!</Text>
          
          <View style={styles.achievementBox}>
            <Text style={styles.achievementTitle}>🏆 Achievement</Text>
            <Text style={styles.achievementText}>Tidy Champion!</Text>
          </View>
          
          <TouchableOpacity onPress={initGame} style={styles.playAgainButton}>
            <Text style={styles.playAgainText}>🔄 Clean Again!</Text>
          </TouchableOpacity>
        </Animated.View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F0FFF0' },
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
  progressLabel: { fontSize: 11, fontWeight: '600', color: COLORS.purple, marginBottom: 4 },
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
  instruction: { fontSize: 14, color: COLORS.purple, textAlign: 'center', marginBottom: 10 },
  
  itemCard: {
    alignItems: 'center',
  },
  itemEmoji: { fontSize: 55 },
  itemName: { fontSize: 18, fontWeight: 'bold', color: COLORS.black, marginTop: 8 },
  soundBtn: { 
    marginTop: 10,
    backgroundColor: COLORS.orange,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 12,
  },
  soundText: { fontSize: 12, fontWeight: 'bold', color: COLORS.white },
  
  feedbackBox: {
    marginTop: 12,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  feedbackCorrect: { backgroundColor: '#E8F5E9' },
  feedbackWrong: { backgroundColor: '#FFEBEE' },
  feedbackEmoji: { fontSize: 18 },
  feedbackText: { fontSize: 13, fontWeight: 'bold' },
  
  remainingBox: {
    marginTop: 15,
    backgroundColor: '#F5F5F5',
    padding: 10,
    borderRadius: 12,
  },
  remainingTitle: { fontSize: 10, color: COLORS.gray, marginBottom: 6 },
  remainingItems: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
  },
  remainingEmoji: { fontSize: 20 },
  remainingMore: { fontSize: 11, color: COLORS.gray },
  
  rightPanel: {
    flex: 1.2,
  },
  rightPanelContent: {
    paddingBottom: 15,
  },
  destTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: COLORS.purple,
    marginBottom: 10,
  },
  destGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 8,
  },
  destButton: {
    width: '48%',
    paddingVertical: 18,
    borderRadius: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
    marginBottom: 2,
  },
  destEmoji: { fontSize: 28 },
  destName: { fontSize: 12, fontWeight: 'bold', color: COLORS.white, marginTop: 4 },
  
  tipBox: {
    backgroundColor: '#E8F5E9',
    padding: 10,
    borderRadius: 10,
    marginTop: 10,
  },
  tipText: { fontSize: 11, color: '#2E7D32', textAlign: 'center' },
  
  completeContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  completeEmoji: { fontSize: 50 },
  completeTitle: { fontSize: 26, fontWeight: 'bold', color: COLORS.green, marginTop: 12 },
  completeScore: { fontSize: 16, fontWeight: '600', color: COLORS.orange, marginTop: 4 },
  completeText: { fontSize: 14, color: COLORS.gray, marginTop: 4 },
  achievementBox: {
    backgroundColor: COLORS.yellow,
    paddingHorizontal: 25,
    paddingVertical: 12,
    borderRadius: 15,
    marginTop: 15,
    alignItems: 'center',
  },
  achievementTitle: { fontSize: 12, fontWeight: 'bold', color: COLORS.black },
  achievementText: { fontSize: 14, fontWeight: 'bold', color: COLORS.purple, marginTop: 2 },
  playAgainButton: {
    marginTop: 15,
    backgroundColor: COLORS.green,
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 20,
  },
  playAgainText: { fontSize: 15, fontWeight: 'bold', color: COLORS.white },
});
