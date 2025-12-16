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
import { COLORS, RAINBOW_COLORS } from '../constants/colors';
import { SHADOW_ITEMS } from '../constants/activityData';
import { speakWord, speakCelebration, speakFeedback, stopSpeaking } from '../utils/speech';
import { ScreenHeader } from '../components';
import { SCREEN_ICONS } from '../assets/images';

const { width } = Dimensions.get('window');

interface ShadowMatchScreenProps {
  navigation: any;
}

export const ShadowMatchScreen: React.FC<ShadowMatchScreenProps> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [items, setItems] = useState<typeof SHADOW_ITEMS>([]);
  const [currentShadow, setCurrentShadow] = useState<typeof SHADOW_ITEMS[0] | null>(null);
  const [options, setOptions] = useState<typeof SHADOW_ITEMS>([]);
  const [score, setScore] = useState(0);
  const [matched, setMatched] = useState(0);

  const initGame = useCallback(() => {
    const shuffled = [...SHADOW_ITEMS].sort(() => Math.random() - 0.5);
    setItems(shuffled);
    generateQuestion(shuffled[0], shuffled);
    setScore(0);
    setMatched(0);
    speakWord('Match the shadow with the correct object!');
  }, []);

  const generateQuestion = (item: typeof SHADOW_ITEMS[0], allItems: typeof SHADOW_ITEMS) => {
    setCurrentShadow(item);
    
    const opts = [item];
    while (opts.length < 4) {
      const random = allItems[Math.floor(Math.random() * allItems.length)];
      if (!opts.find(o => o.name === random.name)) {
        opts.push(random);
      }
    }
    
    setOptions(opts.sort(() => Math.random() - 0.5));
  };

  useEffect(() => {
    initGame();
    return () => stopSpeaking();
  }, [initGame]);

  const handleAnswer = (item: typeof SHADOW_ITEMS[0]) => {
    if (!currentShadow) return;

    if (item.name === currentShadow.name) {
      setScore(score + 10);
      setMatched(matched + 1);
      speakCelebration();

      const remaining = items.slice(1);
      setItems(remaining);
      
      if (remaining.length > 0) {
        setTimeout(() => generateQuestion(remaining[0], SHADOW_ITEMS), 500);
      } else {
        setCurrentShadow(null);
      }
    } else {
      speakFeedback(false);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScreenHeader
        title="Shadows"
        icon={SCREEN_ICONS.shadowIcon}
        onBack={() => { stopSpeaking(); navigation.goBack(); }}
        rightElement={
          <View style={styles.scoreBox}>
            <Image source={SCREEN_ICONS.starGold} style={styles.scoreIcon} resizeMode="contain" />
            <Text style={styles.scoreText}>{score}</Text>
          </View>
        }
      />

      <Text style={styles.progressText}>
        Matched: {matched} / {SHADOW_ITEMS.length}
      </Text>

      {currentShadow ? (
        <>
          {/* Shadow Display */}
          <View style={styles.shadowContainer}>
            <Text style={styles.instruction}>What object makes this shadow?</Text>
            <View style={styles.shadowBox}>
              <Text style={styles.shadowEmoji}>{currentShadow.emoji}</Text>
              <View style={styles.shadowOverlay} />
            </View>
          </View>

          {/* Options */}
          <View style={styles.optionsGrid}>
            {options.map((opt, index) => (
              <TouchableOpacity
                key={index}
                style={[styles.optionButton, { backgroundColor: RAINBOW_COLORS[index] }]}
                onPress={() => handleAnswer(opt)}
              >
                <Text style={styles.optionEmoji}>{opt.emoji}</Text>
                <Text style={styles.optionName}>{opt.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </>
      ) : (
        <View style={styles.completeContainer}>
          <Text style={styles.completeEmoji}>🎉💡🧠</Text>
          <Text style={styles.completeTitle}>All Matched!</Text>
          <Text style={styles.completeText}>Great shadow detective!</Text>
          <TouchableOpacity onPress={initGame} style={styles.playAgainButton}>
            <Text style={styles.playAgainText}>Play Again!</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1a1a2e' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  backButton: { padding: 8 },
  backText: { fontSize: 16, color: COLORS.yellow, fontWeight: '600' },
  title: { fontSize: 22, fontWeight: 'bold', color: COLORS.yellow },
  scoreBox: { backgroundColor: COLORS.yellow, paddingHorizontal: 15, paddingVertical: 8, borderRadius: 15, flexDirection: 'row', alignItems: 'center' },
  scoreIcon: { width: 20, height: 20, marginRight: 4, resizeMode: 'contain' },
  scoreText: { fontSize: 16, fontWeight: 'bold', color: COLORS.black },
  progressText: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    marginVertical: 10,
  },
  shadowContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  instruction: { fontSize: 18, color: COLORS.white, marginBottom: 20 },
  shadowBox: {
    width: 150,
    height: 150,
    backgroundColor: '#333',
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  shadowEmoji: { fontSize: 80 },
  shadowOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000',
    opacity: 0.85,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  optionButton: {
    width: (width - 60) / 2,
    paddingVertical: 25,
    borderRadius: 20,
    alignItems: 'center',
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  optionEmoji: { fontSize: 45 },
  optionName: { fontSize: 16, fontWeight: 'bold', color: COLORS.white, marginTop: 8 },
  completeContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  completeEmoji: { fontSize: 60 },
  completeTitle: { fontSize: 28, fontWeight: 'bold', color: COLORS.yellow, marginTop: 15 },
  completeText: { fontSize: 16, color: '#888', marginTop: 10 },
  playAgainButton: {
    marginTop: 25,
    backgroundColor: COLORS.yellow,
    paddingHorizontal: 35,
    paddingVertical: 15,
    borderRadius: 25,
  },
  playAgainText: { fontSize: 18, fontWeight: 'bold', color: COLORS.black },
});


