import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Image,
  ScrollView,
  Animated,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, RAINBOW_COLORS } from '../constants/colors';
import { ANIMAL_HABITATS } from '../constants/activityData';
import { speakWord, speakCelebration, speakFeedback, stopSpeaking } from '../utils/speech';
import { ScreenHeader } from '../components';
import { SCREEN_ICONS } from '../assets/images';
import { useResponsiveLayout } from '../utils/useResponsiveLayout';

const { width } = Dimensions.get('window');

interface AnimalHabitatScreenProps {
  navigation: any;
}

export const AnimalHabitatScreen: React.FC<AnimalHabitatScreenProps> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { isLandscape, width: screenWidth } = useResponsiveLayout();
  const [animals, setAnimals] = useState<typeof ANIMAL_HABITATS>([]);
  const [currentAnimal, setCurrentAnimal] = useState<typeof ANIMAL_HABITATS[0] | null>(null);
  const [options, setOptions] = useState<typeof ANIMAL_HABITATS>([]);
  const [score, setScore] = useState(0);
  const [matched, setMatched] = useState(0);
  const [showCorrect, setShowCorrect] = useState(false);
  const bounceAnim = useState(new Animated.Value(1))[0];
  const fadeAnim = useState(new Animated.Value(0))[0];

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
    setShowCorrect(false);
    
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
    
    // Animate in
    fadeAnim.setValue(0);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
    
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
      setShowCorrect(true);
      speakCelebration();
      
      // Bounce animation
      Animated.sequence([
        Animated.timing(bounceAnim, { toValue: 1.1, duration: 150, useNativeDriver: true }),
        Animated.spring(bounceAnim, { toValue: 1, friction: 3, useNativeDriver: true }),
      ]).start();

      const remaining = animals.slice(1);
      setAnimals(remaining);
      
      if (remaining.length > 0) {
        setTimeout(() => generateQuestion(remaining[0], remaining), 800);
      } else {
        setTimeout(() => setCurrentAnimal(null), 800);
      }
    } else {
      speakFeedback(false);
    }
  };

  const optionWidth = isLandscape ? (screenWidth - 200) / 4 - 10 : (width - 60) / 2;

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingLeft: insets.left, paddingRight: insets.right }]}>
      <ScreenHeader
        title="Habitats"
        icon={SCREEN_ICONS.lion}
        onBack={() => { stopSpeaking(); navigation.goBack(); }}
        compact={isLandscape}
        rightElement={
          <View style={styles.scoreBox}>
            <Image source={SCREEN_ICONS.starGold} style={styles.scoreIcon} resizeMode="contain" />
            <Text style={styles.scoreText}>{score}</Text>
          </View>
        }
      />

      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressLabel}>Progress</Text>
            <Text style={styles.progressText}>{matched} / {ANIMAL_HABITATS.length}</Text>
          </View>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${(matched / ANIMAL_HABITATS.length) * 100}%` }]} />
          </View>
        </View>

        {currentAnimal ? (
          <View style={[styles.gameContent, isLandscape && styles.gameContentLandscape]}>
            {/* Animal Display */}
            <Animated.View style={[
              styles.animalContainer, 
              isLandscape && styles.animalContainerLandscape,
              { opacity: fadeAnim, transform: [{ scale: bounceAnim }] }
            ]}>
              <View style={styles.questionBadge}>
                <Text style={styles.questionText}>Where does this animal live?</Text>
              </View>
              <Text style={[styles.animalEmoji, isLandscape && styles.animalEmojiLandscape]}>
                {currentAnimal.animal}
              </Text>
              <Text style={[styles.animalName, isLandscape && styles.animalNameLandscape]}>
                {currentAnimal.name}
              </Text>
              
              {showCorrect && (
                <View style={styles.correctBadge}>
                  <Text style={styles.correctEmoji}>🏠</Text>
                  <Text style={styles.correctText}>{currentAnimal.habitatName}</Text>
                </View>
              )}
            </Animated.View>

            {/* Habitat Options */}
            <View style={[styles.optionsContainer, isLandscape && styles.optionsContainerLandscape]}>
              <Text style={styles.optionsTitle}>Choose the habitat:</Text>
              <View style={[styles.optionsGrid, isLandscape && styles.optionsGridLandscape]}>
                {options.map((opt, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.optionButton, 
                      { backgroundColor: RAINBOW_COLORS[index], width: optionWidth },
                      isLandscape && styles.optionButtonLandscape,
                      showCorrect && opt.habitat === currentAnimal?.habitat && styles.optionCorrect,
                    ]}
                    onPress={() => handleAnswer(opt.habitat)}
                    disabled={showCorrect}
                  >
                    <Text style={[styles.optionEmoji, isLandscape && styles.optionEmojiLandscape]}>
                      {opt.habitatEmoji}
                    </Text>
                    <Text style={[styles.optionName, isLandscape && styles.optionNameLandscape]}>
                      {opt.habitatName}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        ) : (
          <View style={styles.completeContainer}>
            <View style={styles.completeCard}>
              <Text style={styles.completeEmoji}>🎉🦁🏠</Text>
              <Text style={styles.completeTitle}>All Matched!</Text>
              <Text style={styles.completeScore}>Score: {score} points</Text>
              <Text style={styles.completeText}>You learned where animals live!</Text>
              <TouchableOpacity onPress={initGame} style={styles.playAgainButton}>
                <Text style={styles.playAgainIcon}>🔄</Text>
                <Text style={styles.playAgainText}>Play Again!</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Tip */}
        {currentAnimal && (
          <View style={styles.tipContainer}>
            <Text style={styles.tipEmoji}>💡</Text>
            <Text style={styles.tipText}>
              Tap the habitat where the {currentAnimal.name} lives!
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#E6FFE6' 
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 30,
  },
  scoreBox: { 
    backgroundColor: COLORS.yellow, 
    paddingHorizontal: 15, 
    paddingVertical: 8, 
    borderRadius: 15, 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 6 
  },
  scoreIcon: { width: 18, height: 18 },
  scoreText: { fontSize: 16, fontWeight: 'bold' },
  progressContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 14,
    marginTop: 8,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.green,
  },
  progressText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.gray,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.green,
    borderRadius: 4,
  },
  gameContent: {
    gap: 12,
  },
  gameContentLandscape: {
    flexDirection: 'row',
    gap: 16,
  },
  animalContainer: {
    alignItems: 'center',
    backgroundColor: COLORS.white,
    paddingVertical: 24,
    paddingHorizontal: 20,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 5,
  },
  animalContainerLandscape: {
    flex: 1,
    paddingVertical: 16,
  },
  questionBadge: {
    backgroundColor: '#F0E6FF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    marginBottom: 16,
  },
  questionText: { 
    fontSize: 16, 
    color: COLORS.purple, 
    fontWeight: '600',
  },
  animalEmoji: { 
    fontSize: 80 
  },
  animalEmojiLandscape: {
    fontSize: 60,
  },
  animalName: { 
    fontSize: 26, 
    fontWeight: 'bold', 
    color: COLORS.black, 
    marginTop: 10 
  },
  animalNameLandscape: {
    fontSize: 20,
    marginTop: 6,
  },
  correctBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E6FFE6',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 15,
    marginTop: 16,
    gap: 8,
  },
  correctEmoji: {
    fontSize: 20,
  },
  correctText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.green,
  },
  optionsContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 24,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  optionsContainerLandscape: {
    flex: 1,
  },
  optionsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.gray,
    textAlign: 'center',
    marginBottom: 12,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  optionsGridLandscape: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  optionButton: {
    paddingVertical: 20,
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 4,
  },
  optionButtonLandscape: {
    paddingVertical: 14,
    borderRadius: 16,
  },
  optionCorrect: {
    borderWidth: 4,
    borderColor: COLORS.green,
  },
  optionEmoji: { 
    fontSize: 36 
  },
  optionEmojiLandscape: {
    fontSize: 28,
  },
  optionName: { 
    fontSize: 14, 
    fontWeight: 'bold', 
    color: COLORS.white, 
    marginTop: 6 
  },
  optionNameLandscape: {
    fontSize: 12,
    marginTop: 4,
  },
  completeContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  completeCard: {
    backgroundColor: COLORS.white,
    borderRadius: 30,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 15,
    elevation: 8,
  },
  completeEmoji: { 
    fontSize: 50 
  },
  completeTitle: { 
    fontSize: 32, 
    fontWeight: 'bold', 
    color: COLORS.green, 
    marginTop: 12 
  },
  completeScore: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.orange,
    marginTop: 8,
  },
  completeText: { 
    fontSize: 16, 
    color: COLORS.gray, 
    marginTop: 6,
    textAlign: 'center',
  },
  playAgainButton: {
    marginTop: 24,
    backgroundColor: COLORS.green,
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 25,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    shadowColor: COLORS.green,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  playAgainIcon: {
    fontSize: 18,
  },
  playAgainText: { 
    fontSize: 18, 
    fontWeight: 'bold', 
    color: COLORS.white 
  },
  tipContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF9E6',
    padding: 14,
    borderRadius: 16,
    marginTop: 12,
    gap: 10,
  },
  tipEmoji: {
    fontSize: 20,
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    color: COLORS.gray,
  },
});
