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
import { ROOM_ITEMS } from '../constants/activityData';
import { speakWord, speakCelebration, speakFeedback, stopSpeaking } from '../utils/speech';
import { ScreenHeader } from '../components';
import { SCREEN_ICONS } from '../assets/images';

const { width } = Dimensions.get('window');

interface CleanRoomScreenProps {
  navigation: any;
}

export const CleanRoomScreen: React.FC<CleanRoomScreenProps> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [items, setItems] = useState<typeof ROOM_ITEMS>([]);
  const [currentItem, setCurrentItem] = useState<typeof ROOM_ITEMS[0] | null>(null);
  const [score, setScore] = useState(0);
  const [cleaned, setCleaned] = useState(0);
  const celebrateAnim = useState(new Animated.Value(0))[0];

  const initGame = useCallback(() => {
    const shuffled = [...ROOM_ITEMS].sort(() => Math.random() - 0.5);
    setItems(shuffled);
    setCurrentItem(shuffled[0]);
    setScore(0);
    setCleaned(0);
    speakWord('Help clean the room! Put items in the right place!');
  }, []);

  useEffect(() => {
    initGame();
    return () => stopSpeaking();
  }, [initGame]);

  const destinations = [
    { id: 'toybox', emoji: '🧸', name: 'Toy Box' },
    { id: 'closet', emoji: '🚪', name: 'Closet' },
    { id: 'shelf', emoji: '📖', name: 'Shelf' },
    { id: 'desk', emoji: '🖊️', name: 'Desk' },
  ];

  const handleDestination = (destinationId: string) => {
    if (!currentItem) return;

    if (currentItem.destination === destinationId) {
      setScore(score + 10);
      setCleaned(cleaned + 1);
      speakCelebration();

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
    } else {
      speakFeedback(false);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScreenHeader
        title="Clean Room"
        icon={SCREEN_ICONS.broom}
        onBack={() => { stopSpeaking(); navigation.goBack(); }}
        rightElement={
          <View style={styles.scoreBox}>
            <Image source={SCREEN_ICONS.starGold} style={styles.scoreIcon} resizeMode="contain" />
            <Text style={styles.scoreText}>{score}</Text>
          </View>
        }
      />

      {/* Progress */}
      <View style={styles.progressBox}>
        <Text style={styles.progressText}>
          Cleaned: {cleaned} / {ROOM_ITEMS.length} items
        </Text>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${(cleaned / ROOM_ITEMS.length) * 100}%` }]} />
        </View>
      </View>

      {currentItem ? (
        <>
          {/* Current Item */}
          <View style={styles.itemContainer}>
            <Text style={styles.instruction}>Where does this go?</Text>
            <Text style={styles.itemEmoji}>{currentItem.emoji}</Text>
            <Text style={styles.itemName}>{currentItem.name}</Text>
            <TouchableOpacity onPress={() => speakWord(currentItem.name)} style={styles.soundBtn}>
              <Text style={styles.soundText}>🔊</Text>
            </TouchableOpacity>
          </View>

          {/* Destinations */}
          <View style={styles.destinationsContainer}>
            <Text style={styles.destTitle}>Tap the right place:</Text>
            <View style={styles.destGrid}>
              {destinations.map((dest, index) => (
                <TouchableOpacity
                  key={dest.id}
                  style={[styles.destButton, { backgroundColor: RAINBOW_COLORS[index] }]}
                  onPress={() => handleDestination(dest.id)}
                >
                  <Text style={styles.destEmoji}>{dest.emoji}</Text>
                  <Text style={styles.destName}>{dest.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </>
      ) : (
        <Animated.View style={[styles.completeContainer, { opacity: celebrateAnim }]}>
          <Text style={styles.completeEmoji}>🎉✨🏠</Text>
          <Text style={styles.completeTitle}>Room is Clean!</Text>
          <Text style={styles.completeText}>Great job organizing!</Text>
          <TouchableOpacity onPress={initGame} style={styles.playAgainButton}>
            <Text style={styles.playAgainText}>Clean Again!</Text>
          </TouchableOpacity>
        </Animated.View>
      )}

      {/* Room Visual */}
      <View style={styles.roomVisual}>
        {items.length > 0 && (
          <View style={styles.messyItems}>
            {items.slice(0, 4).map((item, index) => (
              <Text key={index} style={[styles.messyEmoji, { left: `${20 + index * 20}%` }]}>
                {item.emoji}
              </Text>
            ))}
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F0FFF0' },
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
  scoreBox: { backgroundColor: COLORS.yellow, paddingHorizontal: 15, paddingVertical: 8, borderRadius: 15, flexDirection: 'row', alignItems: 'center', gap: 6 },
  scoreIcon: { width: 18, height: 18 },
  scoreText: { fontSize: 16, fontWeight: 'bold' },
  progressBox: {
    marginHorizontal: 20,
    marginBottom: 15,
  },
  progressText: { fontSize: 14, color: COLORS.gray, marginBottom: 5 },
  progressBar: {
    height: 12,
    backgroundColor: '#E0E0E0',
    borderRadius: 6,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.green,
    borderRadius: 6,
  },
  itemContainer: {
    alignItems: 'center',
    backgroundColor: COLORS.white,
    marginHorizontal: 20,
    paddingVertical: 25,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 5,
  },
  instruction: { fontSize: 16, color: COLORS.purple, marginBottom: 10 },
  itemEmoji: { fontSize: 70 },
  itemName: { fontSize: 22, fontWeight: 'bold', color: COLORS.black, marginTop: 10 },
  soundBtn: { marginTop: 10 },
  soundText: { fontSize: 26 },
  destinationsContainer: {
    marginHorizontal: 20,
    marginTop: 20,
  },
  destTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.purple,
    marginBottom: 10,
  },
  destGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  destButton: {
    width: (width - 60) / 2,
    paddingVertical: 20,
    borderRadius: 20,
    alignItems: 'center',
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 4,
  },
  destEmoji: { fontSize: 35 },
  destName: { fontSize: 14, fontWeight: 'bold', color: COLORS.white, marginTop: 5 },
  completeContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  completeEmoji: { fontSize: 60 },
  completeTitle: { fontSize: 28, fontWeight: 'bold', color: COLORS.green, marginTop: 15 },
  completeText: { fontSize: 16, color: COLORS.gray, marginTop: 10 },
  playAgainButton: {
    marginTop: 25,
    backgroundColor: COLORS.green,
    paddingHorizontal: 35,
    paddingVertical: 15,
    borderRadius: 25,
  },
  playAgainText: { fontSize: 18, fontWeight: 'bold', color: COLORS.white },
  roomVisual: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    height: 60,
    marginHorizontal: 20,
    backgroundColor: '#DEB887',
    borderRadius: 15,
    overflow: 'hidden',
  },
  messyItems: {
    position: 'relative',
    height: '100%',
    justifyContent: 'center',
  },
  messyEmoji: {
    position: 'absolute',
    fontSize: 30,
    top: 10,
  },
});


