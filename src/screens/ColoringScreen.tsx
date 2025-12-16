import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Dimensions,
  Modal,
  Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, RAINBOW_COLORS } from '../constants/colors';
import { ALPHABETS } from '../constants/alphabets';
import { speakCelebration, speakLetter, stopSpeaking } from '../utils/speech';
import { ScreenHeader } from '../components';
import { SCREEN_ICONS } from '../assets/images';

const { width } = Dimensions.get('window');

const COLOR_PALETTE = [
  '#FF6B6B', '#FF8E53', '#FFA94D', '#FFD93D', '#6BCB77', '#4ECDC4',
  '#4D96FF', '#9B59B6', '#FF6B9D', '#E91E63', '#8B4513', '#333333',
  '#FFFFFF', '#00BCD4', '#CDDC39', '#FF5722',
];

const GAME_SCREENS = [
  'MemoryGame', 'PuzzleGame', 'MazeGame', 'PatternGame', 'SortingGame', 'QuizGame',
];

interface ColoringScreenProps {
  navigation: any;
}

export const ColoringScreen: React.FC<ColoringScreenProps> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [currentLetterIndex, setCurrentLetterIndex] = useState(0);
  const [selectedColor, setSelectedColor] = useState(COLOR_PALETTE[0]);
  const [letterColor, setLetterColor] = useState('#E0E0E0');
  const [isColored, setIsColored] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [lastGameIndex, setLastGameIndex] = useState(-1);
  
  const letterAnim = useRef(new Animated.Value(0)).current;
  const sparkleAnim = useRef(new Animated.Value(0)).current;
  const celebrationAnim = useRef(new Animated.Value(0)).current;

  const currentLetter = ALPHABETS[currentLetterIndex];

  useEffect(() => {
    letterAnim.setValue(0);
    Animated.spring(letterAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 50,
      friction: 7,
    }).start();
    setIsColored(false);
    setLetterColor('#E0E0E0');
  }, [currentLetterIndex, letterAnim]);

  useEffect(() => {
    if (isColored) {
      const sparkle = () => {
        Animated.sequence([
          Animated.timing(sparkleAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(sparkleAnim, {
            toValue: 0,
            duration: 500,
            useNativeDriver: true,
          }),
        ]).start(() => {
          if (isColored) sparkle();
        });
      };
      sparkle();
    }
  }, [isColored, sparkleAnim]);

  const getRandomGame = () => {
    let newIndex;
    do {
      newIndex = Math.floor(Math.random() * GAME_SCREENS.length);
    } while (newIndex === lastGameIndex && GAME_SCREENS.length > 1);
    setLastGameIndex(newIndex);
    return GAME_SCREENS[newIndex];
  };

  const applyColor = () => {
    if (isColored) return;
    
    setLetterColor(selectedColor);
    setIsColored(true);
    speakLetter(currentLetter.letter);
    
    Animated.sequence([
      Animated.timing(letterAnim, {
        toValue: 1.2,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.spring(letterAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 50,
        friction: 7,
      }),
    ]).start();

    setTimeout(() => {
      speakCelebration();
      setShowCelebration(true);
      Animated.spring(celebrationAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 50,
        friction: 7,
      }).start();
    }, 500);
  };

  const goToGame = () => {
    stopSpeaking();
    setShowCelebration(false);
    celebrationAnim.setValue(0);
    const randomGame = getRandomGame();
    navigation.navigate(randomGame);
  };

  const continueColoring = () => {
    setShowCelebration(false);
    celebrationAnim.setValue(0);
    nextLetter();
  };

  const nextLetter = () => {
    setCurrentLetterIndex((prev) => (prev + 1) % ALPHABETS.length);
  };

  const prevLetter = () => {
    setCurrentLetterIndex((prev) => (prev - 1 + ALPHABETS.length) % ALPHABETS.length);
  };

  const resetColor = () => {
    setLetterColor('#E0E0E0');
    setIsColored(false);
  };

  useEffect(() => {
    return () => {
      stopSpeaking();
    };
  }, []);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <ScreenHeader
        title="Color ABC"
        icon={SCREEN_ICONS.palette}
        onBack={() => { stopSpeaking(); navigation.goBack(); }}
      />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Letter Display Area */}
        <View style={styles.letterArea}>
          {/* Sparkles */}
          {isColored && (
            <>
              {[0, 1, 2, 3].map((i) => (
                <Animated.View
                  key={i}
                  style={[
                    styles.sparkle,
                    {
                      top: 20 + (i * 30),
                      left: i % 2 === 0 ? 30 : undefined,
                      right: i % 2 === 1 ? 30 : undefined,
                      opacity: sparkleAnim,
                      transform: [
                        {
                          scale: sparkleAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: [0.5, 1.5],
                          }),
                        },
                      ],
                    },
                  ]}
                >
                  <Image source={SCREEN_ICONS.starGold} style={styles.sparkleIcon} resizeMode="contain" />
                </Animated.View>
              ))}
            </>
          )}

          {/* Main Letter */}
          <TouchableOpacity onPress={applyColor} disabled={isColored}>
            <Animated.View
              style={[
                styles.letterContainer,
                {
                  transform: [{ scale: letterAnim }],
                  borderColor: isColored ? letterColor : '#E0E0E0',
                },
              ]}
            >
              <Text
                style={[
                  styles.bigLetter,
                  {
                    color: letterColor,
                    textShadowColor: isColored ? 'rgba(0,0,0,0.3)' : 'transparent',
                  },
                ]}
              >
                {currentLetter.letter}
              </Text>
            </Animated.View>
          </TouchableOpacity>

          {/* Word and Emoji */}
          <View style={styles.wordRow}>
            <Text style={styles.emoji}>{currentLetter.emoji}</Text>
            <Text style={styles.word}>{currentLetter.word}</Text>
          </View>

          {/* Tap instruction */}
          <View style={styles.tapInstruction}>
            <Image source={isColored ? SCREEN_ICONS.celebration : SCREEN_ICONS.pencil} style={styles.tapIcon} resizeMode="contain" />
            <Text style={styles.tapText}>
              {isColored ? 'Great job! Choose what to do next!' : 'Tap the letter to color it!'}
            </Text>
          </View>
        </View>

        {/* Navigation Arrows */}
        <View style={styles.navigationRow}>
          <TouchableOpacity onPress={prevLetter} style={styles.navButton}>
            <Image source={SCREEN_ICONS.back} style={styles.navIcon} resizeMode="contain" />
            <Text style={styles.navText}>Prev</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={resetColor} style={styles.resetButton}>
            <Image source={SCREEN_ICONS.refresh} style={styles.navIcon} resizeMode="contain" />
            <Text style={styles.resetText}>Reset</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={nextLetter} style={styles.navButton}>
            <Text style={styles.navText}>Next</Text>
            <Image source={SCREEN_ICONS.next} style={styles.navIcon} resizeMode="contain" />
          </TouchableOpacity>
        </View>

        {/* Color Palette */}
        <View style={styles.paletteContainer}>
          <View style={styles.paletteHeader}>
            <Image source={SCREEN_ICONS.palette} style={styles.paletteIcon} resizeMode="contain" />
            <Text style={styles.paletteTitle}>Pick a Color</Text>
          </View>
          <View style={styles.palette}>
            {COLOR_PALETTE.map((color, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => setSelectedColor(color)}
                style={[
                  styles.colorOption,
                  {
                    backgroundColor: color,
                    borderWidth: selectedColor === color ? 4 : 2,
                    borderColor: selectedColor === color ? COLORS.black : '#DDDDDD',
                    transform: [{ scale: selectedColor === color ? 1.2 : 1 }],
                  },
                ]}
              />
            ))}
          </View>
        </View>

        {/* Progress Indicator */}
        <View style={styles.progressContainer}>
          <Text style={styles.progressText}>
            Letter {currentLetterIndex + 1} of {ALPHABETS.length}
          </Text>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${((currentLetterIndex + 1) / ALPHABETS.length) * 100}%`,
                },
              ]}
            />
          </View>
        </View>
      </ScrollView>

      {/* Celebration Modal */}
      <Modal visible={showCelebration} transparent animationType="none">
        <View style={styles.celebrationOverlay}>
          <Animated.View
            style={[
              styles.celebrationContent,
              {
                transform: [{ scale: celebrationAnim }],
                opacity: celebrationAnim,
              },
            ]}
          >
            <Image source={SCREEN_ICONS.celebration} style={styles.celebrationImage} resizeMode="contain" />
            <Text style={styles.celebrationTitle}>Amazing!</Text>
            <Text style={styles.celebrationText}>
              You colored the letter {currentLetter.letter}!
            </Text>
            
            <View style={styles.celebrationStars}>
              <Image source={SCREEN_ICONS.starGold} style={styles.starIcon} resizeMode="contain" />
              <Image source={SCREEN_ICONS.trophy} style={styles.starIcon} resizeMode="contain" />
              <Image source={SCREEN_ICONS.starGold} style={styles.starIcon} resizeMode="contain" />
            </View>

            <TouchableOpacity onPress={goToGame} style={styles.gameButton}>
              <Image source={SCREEN_ICONS.gamepad} style={styles.gameButtonIcon} resizeMode="contain" />
              <Text style={styles.gameButtonText}>Play a Game!</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={continueColoring} style={styles.continueButton}>
              <Image source={SCREEN_ICONS.palette} style={styles.continueButtonIcon} resizeMode="contain" />
              <Text style={styles.continueButtonText}>Color Next Letter</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF0F5',
  },
  content: {
    paddingBottom: 40,
  },
  letterArea: {
    backgroundColor: COLORS.white,
    marginHorizontal: 20,
    borderRadius: 30,
    paddingVertical: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 5,
    position: 'relative',
    overflow: 'hidden',
  },
  sparkle: {
    position: 'absolute',
    zIndex: 10,
  },
  sparkleIcon: {
    width: 28,
    height: 28,
  },
  letterContainer: {
    width: 180,
    height: 180,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
    borderRadius: 90,
    borderWidth: 5,
    borderStyle: 'dashed',
  },
  bigLetter: {
    fontSize: 120,
    fontWeight: '900',
    textShadowOffset: { width: 3, height: 3 },
    textShadowRadius: 5,
  },
  wordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
  },
  emoji: {
    fontSize: 40,
    marginRight: 10,
  },
  word: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.black,
  },
  tapInstruction: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 15,
    gap: 8,
    paddingHorizontal: 20,
  },
  tapIcon: {
    width: 22,
    height: 22,
  },
  tapText: {
    fontSize: 16,
    color: COLORS.gray,
    fontStyle: 'italic',
  },
  navigationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 20,
    marginTop: 20,
  },
  navButton: {
    backgroundColor: COLORS.blue,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  navIcon: {
    width: 18,
    height: 18,
    tintColor: COLORS.white,
  },
  navText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  resetButton: {
    backgroundColor: COLORS.orange,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  resetText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  paletteContainer: {
    marginTop: 25,
    marginHorizontal: 20,
    backgroundColor: COLORS.white,
    borderRadius: 25,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  paletteHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
    gap: 8,
  },
  paletteIcon: {
    width: 24,
    height: 24,
  },
  paletteTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.purple,
  },
  palette: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
  },
  colorOption: {
    width: 45,
    height: 45,
    borderRadius: 23,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  progressContainer: {
    marginTop: 25,
    marginHorizontal: 20,
    alignItems: 'center',
  },
  progressText: {
    fontSize: 14,
    color: COLORS.gray,
    marginBottom: 8,
  },
  progressBar: {
    width: '100%',
    height: 10,
    backgroundColor: '#E0E0E0',
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.green,
    borderRadius: 5,
  },
  celebrationOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  celebrationContent: {
    width: width * 0.85,
    backgroundColor: COLORS.white,
    borderRadius: 30,
    padding: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 15,
  },
  celebrationImage: {
    width: 100,
    height: 100,
  },
  celebrationTitle: {
    fontSize: 36,
    fontWeight: '900',
    color: COLORS.purple,
    marginTop: 10,
  },
  celebrationText: {
    fontSize: 18,
    color: COLORS.black,
    textAlign: 'center',
    marginTop: 10,
  },
  celebrationStars: {
    flexDirection: 'row',
    marginTop: 15,
    gap: 15,
  },
  starIcon: {
    width: 45,
    height: 45,
  },
  gameButton: {
    marginTop: 25,
    backgroundColor: COLORS.green,
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  gameButtonIcon: {
    width: 24,
    height: 24,
    tintColor: COLORS.white,
  },
  gameButtonText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  continueButton: {
    marginTop: 15,
    backgroundColor: COLORS.blue,
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  continueButtonIcon: {
    width: 20,
    height: 20,
    tintColor: COLORS.white,
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.white,
  },
});
