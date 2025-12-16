import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ScrollView,
  Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, RAINBOW_COLORS } from '../constants/colors';
import { ANIMALS, VEHICLES } from '../constants/gameData';
import { speakWord, speakAnimalSound, speakCelebration, speakFeedback, stopSpeaking } from '../utils/speech';
import { ScreenHeader } from '../components';
import { SCREEN_ICONS } from '../assets/images';

const { width } = Dimensions.get('window');

type SoundCategory = 'animals' | 'vehicles';

interface SoundGameScreenProps {
  navigation: any;
}

export const SoundGameScreen: React.FC<SoundGameScreenProps> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [category, setCategory] = useState<SoundCategory>('animals');
  const [mode, setMode] = useState<'learn' | 'quiz'>('learn');
  const [currentItem, setCurrentItem] = useState<typeof ANIMALS[0] | null>(null);
  const [options, setOptions] = useState<typeof ANIMALS>([]);
  const [score, setScore] = useState(0);

  const getData = useCallback(() => {
    return category === 'animals' ? ANIMALS : VEHICLES;
  }, [category]);

  const generateQuiz = useCallback(() => {
    const data = getData();
    const item = data[Math.floor(Math.random() * data.length)];
    setCurrentItem(item);
    
    const opts = [item];
    while (opts.length < 4) {
      const random = data[Math.floor(Math.random() * data.length)];
      if (!opts.find(o => o.name === random.name)) {
        opts.push(random);
      }
    }
    for (let i = opts.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [opts[i], opts[j]] = [opts[j], opts[i]];
    }
    setOptions(opts);
    
    setTimeout(() => {
      speakAnimalSound(item.name, item.sound);
    }, 500);
  }, [getData]);

  useEffect(() => {
    if (mode === 'quiz') {
      generateQuiz();
    }
    return () => stopSpeaking();
  }, [mode, category, generateQuiz]);

  const handleItemPress = (item: typeof ANIMALS[0]) => {
    speakAnimalSound(item.name, item.sound);
  };

  const handleQuizAnswer = (item: typeof ANIMALS[0]) => {
    if (!currentItem) return;
    
    if (item.name === currentItem.name) {
      setScore(score + 10);
      speakCelebration();
      setTimeout(generateQuiz, 1000);
    } else {
      speakFeedback(false);
    }
  };

  const playCurrentSound = () => {
    if (currentItem) {
      speakAnimalSound(currentItem.name, currentItem.sound);
    }
  };

  const data = getData();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <ScreenHeader
        title="Sounds"
        icon={SCREEN_ICONS.volume}
        onBack={() => { stopSpeaking(); navigation.goBack(); }}
      />

      {/* Category & Mode Toggle */}
      <View style={styles.toggleRow}>
        <TouchableOpacity
          style={[styles.toggleButton, category === 'animals' && styles.toggleActive]}
          onPress={() => setCategory('animals')}
        >
          <Image source={SCREEN_ICONS.lion} style={[styles.toggleIcon, category === 'animals' && styles.toggleIconActive]} resizeMode="contain" />
          <Text style={[styles.toggleText, category === 'animals' && styles.toggleTextActive]}>Animals</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.toggleButton, category === 'vehicles' && styles.toggleActive]}
          onPress={() => setCategory('vehicles')}
        >
          <Image source={SCREEN_ICONS.blocks} style={[styles.toggleIcon, category === 'vehicles' && styles.toggleIconActive]} resizeMode="contain" />
          <Text style={[styles.toggleText, category === 'vehicles' && styles.toggleTextActive]}>Vehicles</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.toggleRow}>
        <TouchableOpacity
          style={[styles.modeButton, mode === 'learn' && styles.modeActive]}
          onPress={() => setMode('learn')}
        >
          <Image source={SCREEN_ICONS.book} style={[styles.modeIcon, mode === 'learn' && styles.modeIconActive]} resizeMode="contain" />
          <Text style={[styles.modeText, mode === 'learn' && styles.modeTextActive]}>Learn</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.modeButton, mode === 'quiz' && styles.modeActive]}
          onPress={() => setMode('quiz')}
        >
          <Image source={SCREEN_ICONS.gamepad} style={[styles.modeIcon, mode === 'quiz' && styles.modeIconActive]} resizeMode="contain" />
          <Text style={[styles.modeText, mode === 'quiz' && styles.modeTextActive]}>Quiz</Text>
        </TouchableOpacity>
      </View>

      {mode === 'learn' ? (
        <ScrollView contentContainerStyle={styles.gridContainer} showsVerticalScrollIndicator={false}>
          <View style={styles.instructionRow}>
            <Image source={SCREEN_ICONS.pencil} style={styles.instructionIcon} resizeMode="contain" />
            <Text style={styles.instruction}>Tap to hear the sound!</Text>
          </View>
          <View style={styles.itemsGrid}>
            {data.map((item, index) => (
              <TouchableOpacity
                key={item.name}
                onPress={() => handleItemPress(item)}
                style={[styles.itemCard, { backgroundColor: RAINBOW_COLORS[index % RAINBOW_COLORS.length] }]}
              >
                <Text style={styles.itemEmoji}>{item.emoji}</Text>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemSound}>"{item.sound}"</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      ) : (
        <View style={styles.quizContainer}>
          <View style={styles.scoreBox}>
            <Image source={SCREEN_ICONS.starGold} style={styles.scoreIcon} resizeMode="contain" />
            <Text style={styles.scoreText}>{score}</Text>
          </View>

          <Text style={styles.quizInstruction}>Which {category === 'animals' ? 'animal' : 'vehicle'} makes this sound?</Text>
          
          <TouchableOpacity onPress={playCurrentSound} style={styles.soundButton}>
            <Image source={SCREEN_ICONS.volume} style={styles.soundButtonIcon} resizeMode="contain" />
            <Text style={styles.soundButtonText}>Play Sound</Text>
          </TouchableOpacity>

          <View style={styles.optionsGrid}>
            {options.map((opt, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => handleQuizAnswer(opt)}
                style={[styles.optionCard, { backgroundColor: RAINBOW_COLORS[index] }]}
              >
                <Text style={styles.optionEmoji}>{opt.emoji}</Text>
                <Text style={styles.optionName}>{opt.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#E6FFF5' },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 10,
    gap: 10,
  },
  toggleButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#E0E0E0',
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  toggleActive: { backgroundColor: COLORS.green },
  toggleIcon: { width: 20, height: 20 },
  toggleIconActive: { tintColor: COLORS.white },
  toggleText: { fontSize: 14, fontWeight: '600', color: COLORS.gray },
  toggleTextActive: { color: COLORS.white },
  modeButton: {
    paddingHorizontal: 25,
    paddingVertical: 10,
    backgroundColor: '#E0E0E0',
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  modeActive: { backgroundColor: COLORS.blue },
  modeIcon: { width: 20, height: 20 },
  modeIconActive: { tintColor: COLORS.white },
  modeText: { fontSize: 14, fontWeight: '600', color: COLORS.gray },
  modeTextActive: { color: COLORS.white },
  gridContainer: { paddingHorizontal: 15, paddingBottom: 30 },
  instructionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 15,
    gap: 8,
  },
  instructionIcon: { width: 20, height: 20, tintColor: COLORS.purple },
  instruction: {
    fontSize: 16,
    color: COLORS.purple,
  },
  itemsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  itemCard: {
    width: (width - 50) / 2,
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
  itemEmoji: { fontSize: 50 },
  itemName: { fontSize: 16, fontWeight: 'bold', color: COLORS.white, marginTop: 8 },
  itemSound: { fontSize: 12, color: 'rgba(255,255,255,0.8)', marginTop: 4 },
  quizContainer: { flex: 1, paddingHorizontal: 20 },
  scoreBox: {
    alignSelf: 'flex-end',
    backgroundColor: COLORS.yellow,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  scoreIcon: { width: 22, height: 22 },
  scoreText: { fontSize: 18, fontWeight: 'bold', color: COLORS.black },
  quizInstruction: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.purple,
    textAlign: 'center',
    marginBottom: 20,
  },
  soundButton: {
    backgroundColor: COLORS.green,
    paddingVertical: 20,
    paddingHorizontal: 40,
    borderRadius: 30,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
  },
  soundButtonIcon: { width: 28, height: 28, tintColor: COLORS.white },
  soundButtonText: { fontSize: 18, fontWeight: 'bold', color: COLORS.white },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  optionCard: {
    width: (width - 60) / 2,
    paddingVertical: 25,
    borderRadius: 20,
    alignItems: 'center',
    marginBottom: 15,
  },
  optionEmoji: { fontSize: 45 },
  optionName: { fontSize: 16, fontWeight: 'bold', color: COLORS.white, marginTop: 8 },
});
