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
import { ANIMAL_HABITATS } from '../constants/activityData';
import { speakWord, speakCelebration, speakFeedback, stopSpeaking } from '../utils/speech';
import { ScreenHeader } from '../components';
import { SCREEN_ICONS } from '../assets/images';

const { width } = Dimensions.get('window');

interface AnimalHabitatScreenProps {
  navigation: any;
}

export const AnimalHabitatScreen: React.FC<AnimalHabitatScreenProps> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [animals, setAnimals] = useState<typeof ANIMAL_HABITATS>([]);
  const [currentAnimal, setCurrentAnimal] = useState<typeof ANIMAL_HABITATS[0] | null>(null);
  const [options, setOptions] = useState<typeof ANIMAL_HABITATS>([]);
  const [score, setScore] = useState(0);
  const [matched, setMatched] = useState(0);

  const initGame = useCallback(() => {
    const shuffled = [...ANIMAL_HABITATS].sort(() => Math.random() - 0.5);
    setAnimals(shuffled);
    generateQuestion(shuffled[0], shuffled);
    setScore(0);
    setMatched(0);
    speakWord('Match animals to their homes!');
  }, []);

  const generateQuestion = (animal: typeof ANIMAL_HABITATS[0], allAnimals: typeof ANIMAL_HABITATS) => {
    setCurrentAnimal(animal);
    
    // Get unique habitats
    const habitats = [animal];
    const usedHabitats = [animal.habitat];
    
    for (const a of allAnimals) {
      if (habitats.length >= 4) break;
      if (!usedHabitats.includes(a.habitat)) {
        habitats.push(a);
        usedHabitats.push(a.habitat);
      }
    }
    
    // Shuffle options
    setOptions(habitats.sort(() => Math.random() - 0.5));
    speakWord(`Where does the ${animal.name} live?`);
  };

  useEffect(() => {
    initGame();
    return () => stopSpeaking();
  }, [initGame]);

  const handleAnswer = (habitat: string) => {
    if (!currentAnimal) return;

    if (habitat === currentAnimal.habitat) {
      setScore(score + 10);
      setMatched(matched + 1);
      speakCelebration();

      const remaining = animals.slice(1);
      setAnimals(remaining);
      
      if (remaining.length > 0) {
        setTimeout(() => generateQuestion(remaining[0], remaining), 500);
      } else {
        setCurrentAnimal(null);
      }
    } else {
      speakFeedback(false);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScreenHeader
        title="Habitats"
        icon={SCREEN_ICONS.lion}
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
        Matched: {matched} / {ANIMAL_HABITATS.length}
      </Text>

      {currentAnimal ? (
        <>
          {/* Animal Display */}
          <View style={styles.animalContainer}>
            <Text style={styles.question}>Where does this animal live?</Text>
            <Text style={styles.animalEmoji}>{currentAnimal.animal}</Text>
            <Text style={styles.animalName}>{currentAnimal.name}</Text>
          </View>

          {/* Habitat Options */}
          <View style={styles.optionsGrid}>
            {options.map((opt, index) => (
              <TouchableOpacity
                key={index}
                style={[styles.optionButton, { backgroundColor: RAINBOW_COLORS[index] }]}
                onPress={() => handleAnswer(opt.habitat)}
              >
                <Text style={styles.optionEmoji}>{opt.habitatEmoji}</Text>
                <Text style={styles.optionName}>{opt.habitatName}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </>
      ) : (
        <View style={styles.completeContainer}>
          <Text style={styles.completeEmoji}>🎉🦁🏠</Text>
          <Text style={styles.completeTitle}>All Matched!</Text>
          <Text style={styles.completeText}>You learned where animals live!</Text>
          <TouchableOpacity onPress={initGame} style={styles.playAgainButton}>
            <Text style={styles.playAgainText}>Play Again!</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#E6FFE6' },
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
  progressText: {
    fontSize: 14,
    color: COLORS.gray,
    textAlign: 'center',
    marginVertical: 10,
  },
  animalContainer: {
    alignItems: 'center',
    backgroundColor: COLORS.white,
    marginHorizontal: 20,
    paddingVertical: 30,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 5,
    marginBottom: 20,
  },
  question: { fontSize: 18, color: COLORS.purple, marginBottom: 15 },
  animalEmoji: { fontSize: 80 },
  animalName: { fontSize: 24, fontWeight: 'bold', color: COLORS.black, marginTop: 10 },
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
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 4,
  },
  optionEmoji: { fontSize: 40 },
  optionName: { fontSize: 16, fontWeight: 'bold', color: COLORS.white, marginTop: 8 },
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
});


