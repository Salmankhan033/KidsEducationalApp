import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Animated,
  Image,
  ImageBackground,
  StatusBar,
  ScrollView,
  PanResponder,
  GestureResponderEvent,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '../constants/colors';
import { ALPHABETS, AlphabetData } from '../constants/alphabets';
import { speak, stopSpeaking } from '../utils/speech';
import { SCREEN_ICONS } from '../assets/images';

// Background Image
const ABC_BG_IMAGE = require('../images/bgImage/ABC_BGimage.png');

const { width, height } = Dimensions.get('window');

// Tab Type
type TabType = 'learn' | 'write';

// Twemoji images for first word
const ALPHABET_IMAGE_1: Record<string, { uri: string }> = {
  A: { uri: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f34e.png' }, // 🍎 Apple
  B: { uri: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f43b.png' }, // 🐻 Bear
  C: { uri: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f431.png' }, // 🐱 Cat
  D: { uri: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f415.png' }, // 🐕 Dog
  E: { uri: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f418.png' }, // 🐘 Elephant
  F: { uri: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f41f.png' }, // 🐟 Fish
  G: { uri: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f347.png' }, // 🍇 Grapes
  H: { uri: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f40e.png' }, // 🐎 Horse
  I: { uri: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f366.png' }, // 🍦 Ice Cream
  J: { uri: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f9c3.png' }, // 🧃 Juice
  K: { uri: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f428.png' }, // 🐨 Koala
  L: { uri: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f981.png' }, // 🦁 Lion
  M: { uri: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f435.png' }, // 🐵 Monkey
  N: { uri: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1faba.png' }, // 🪺 Nest
  O: { uri: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f34a.png' }, // 🍊 Orange
  P: { uri: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f43c.png' }, // 🐼 Panda
  Q: { uri: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f478.png' }, // 👸 Queen
  R: { uri: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f430.png' }, // 🐰 Rabbit
  S: { uri: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/2600.png' }, // ☀️ Sun
  T: { uri: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f42f.png' }, // 🐯 Tiger
  U: { uri: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/2602.png' }, // ☂️ Umbrella
  V: { uri: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f690.png' }, // 🚐 Van
  W: { uri: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f349.png' }, // 🍉 Watermelon
  X: { uri: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f98a.png' }, // 🦊 Fox
  Y: { uri: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f9f6.png' }, // 🧶 Yarn
  Z: { uri: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f993.png' }, // 🦓 Zebra
};

// Twemoji images for second word
const ALPHABET_IMAGE_2: Record<string, { uri: string }> = {
  A: { uri: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f41c.png' }, // 🐜 Ant
  B: { uri: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/26bd.png' }, // ⚽ Ball
  C: { uri: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f382.png' }, // 🎂 Cake
  D: { uri: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f986.png' }, // 🦆 Duck
  E: { uri: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f95a.png' }, // 🥚 Egg
  F: { uri: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f438.png' }, // 🐸 Frog
  G: { uri: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f992.png' }, // 🦒 Giraffe
  H: { uri: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f3e0.png' }, // 🏠 House
  I: { uri: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f9ca.png' }, // 🧊 Ice (for Igloo)
  J: { uri: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f383.png' }, // 🎃 Jack-o-lantern (for J)
  K: { uri: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1fa81.png' }, // 🪁 Kite
  L: { uri: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f34b.png' }, // 🍋 Lemon
  M: { uri: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f319.png' }, // 🌙 Moon
  N: { uri: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f95c.png' }, // 🥜 Nut
  O: { uri: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f989.png' }, // 🦉 Owl
  P: { uri: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f355.png' }, // 🍕 Pizza
  Q: { uri: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f6cf.png' }, // 🛏️ Quilt
  R: { uri: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f308.png' }, // 🌈 Rainbow
  S: { uri: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/2b50.png' }, // ⭐ Star
  T: { uri: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f333.png' }, // 🌳 Tree
  U: { uri: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f984.png' }, // 🦄 Unicorn
  V: { uri: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f3bb.png' }, // 🎻 Violin
  W: { uri: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f40b.png' }, // 🐋 Whale
  X: { uri: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f4e6.png' }, // 📦 Box
  Y: { uri: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1fa80.png' }, // 🪀 Yoyo
  Z: { uri: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f3aa.png' }, // 🎪 Zoo (Circus tent)
};

// Colors
const BALLOON_COLORS = ['#E74C3C', '#27AE60', '#3498DB', '#9B59B6', '#F39C12', '#1ABC9C', '#E91E63', '#FF5722'];
const CARD_BORDER_COLORS = ['#FF6B6B', '#3498DB', '#9B59B6', '#27AE60', '#F39C12', '#E91E63', '#1ABC9C', '#FF5722'];

interface FlashcardProps {
  alphabet: AlphabetData;
  index: number;
  onPrevious: () => void;
  onNext: () => void;
  hasPrevious: boolean;
  hasNext: boolean;
}

const Flashcard: React.FC<FlashcardProps> = ({
  alphabet,
  index,
  onPrevious,
  onNext,
  hasPrevious,
  hasNext,
}) => {
  const cardAnim = useRef(new Animated.Value(0)).current;
  const balloonBounce = useRef(new Animated.Value(0)).current;
  const scrollViewRef = useRef<ScrollView>(null);

  const balloonColor = BALLOON_COLORS[index % BALLOON_COLORS.length];
  const borderColor = CARD_BORDER_COLORS[index % CARD_BORDER_COLORS.length];
  const image1 = ALPHABET_IMAGE_1[alphabet.letter];
  const image2 = ALPHABET_IMAGE_2[alphabet.letter];

  useEffect(() => {
    // Scroll to top when alphabet changes
    scrollViewRef.current?.scrollTo({ y: 0, animated: false });

    cardAnim.setValue(0);
    Animated.spring(cardAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 50,
      friction: 8,
    }).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(balloonBounce, { toValue: -8, duration: 800, useNativeDriver: true }),
        Animated.timing(balloonBounce, { toValue: 0, duration: 800, useNativeDriver: true }),
      ])
    ).start();

    speak(`${alphabet.letter} for ${alphabet.word1}`);
  }, [alphabet, cardAnim, balloonBounce]);

  return (
    <ScrollView 
      ref={scrollViewRef}
      style={styles.flashcardScroll}
      contentContainerStyle={styles.flashcardScrollContent}
      showsVerticalScrollIndicator={false}
    >
      <Animated.View
        style={[styles.flashcardContainer, { transform: [{ scale: cardAnim }], opacity: cardAnim }]}
      >
        {/* SECTION 1: A for Apple */}
        <View style={[styles.sectionCard, { borderColor: borderColor }]}>
          <Animated.View style={[styles.balloonContainer, { transform: [{ translateY: balloonBounce }] }]}>
            <View style={[styles.balloon, { backgroundColor: balloonColor }]}>
              <Text style={styles.balloonLetter}>{alphabet.letter}</Text>
            </View>
            <View style={[styles.balloonTail, { borderTopColor: balloonColor }]} />
            <View style={styles.balloonString} />
          </Animated.View>

          <Text style={styles.forText}>
            <Text style={[styles.letterHighlight, { color: balloonColor }]}>{alphabet.letter}</Text>
            {' for '}
            <Text style={styles.wordHighlight}>{alphabet.word1}</Text>
          </Text>

          <View style={styles.imageContainer}>
            <Image source={image1} style={styles.mainImage} resizeMode="contain" />
          </View>

          <TouchableOpacity 
            onPress={() => speak(`${alphabet.letter} for ${alphabet.word1}`)} 
            style={[styles.listenBtn, { backgroundColor: balloonColor }]}
          >
            <Image source={SCREEN_ICONS.speaker} style={styles.speakerIconLarge} />
          </TouchableOpacity>
        </View>

        {/* SECTION 2: A for Ant */}
        <View style={[styles.sectionCard, { borderColor: CARD_BORDER_COLORS[(index + 1) % CARD_BORDER_COLORS.length] }]}>
          <Animated.View style={[styles.balloonContainer, { transform: [{ translateY: balloonBounce }] }]}>
            <View style={[styles.balloon, { backgroundColor: BALLOON_COLORS[(index + 1) % BALLOON_COLORS.length] }]}>
              <Text style={styles.balloonLetter}>{alphabet.letter}</Text>
            </View>
            <View style={[styles.balloonTail, { borderTopColor: BALLOON_COLORS[(index + 1) % BALLOON_COLORS.length] }]} />
            <View style={styles.balloonString} />
          </Animated.View>

          <Text style={styles.forText}>
            <Text style={[styles.letterHighlight, { color: BALLOON_COLORS[(index + 1) % BALLOON_COLORS.length] }]}>{alphabet.letter}</Text>
            {' for '}
            <Text style={styles.wordHighlight}>{alphabet.word2}</Text>
          </Text>

          <View style={styles.imageContainer}>
            <Image source={image2} style={styles.mainImage} resizeMode="contain" />
          </View>

          <TouchableOpacity 
            onPress={() => speak(`${alphabet.letter} for ${alphabet.word2}`)} 
            style={[styles.listenBtn, { backgroundColor: BALLOON_COLORS[(index + 1) % BALLOON_COLORS.length] }]}
          >
            <Image source={SCREEN_ICONS.speaker} style={styles.speakerIconLarge} />
          </TouchableOpacity>
        </View>

        {/* SECTION 3: Make Sentence */}
        <View style={[styles.sentenceCard, { borderColor: '#FFD700' }]}>
          <Animated.View style={[styles.balloonContainer, { transform: [{ translateY: balloonBounce }] }]}>
            <View style={[styles.balloon, { backgroundColor: '#FFD700' }]}>
              <Text style={styles.balloonLetter}>{alphabet.letter}</Text>
            </View>
            <View style={[styles.balloonTail, { borderTopColor: '#FFD700' }]} />
            <View style={styles.balloonString} />
          </Animated.View>

          <Text style={styles.sentenceTitle}>📝 Make Sentence</Text>
          
          <View style={styles.sentenceImagesRow}>
            <View style={styles.sentenceImageBox}>
              <Image source={image2} style={styles.sentenceImage} resizeMode="contain" />
              <Text style={styles.sentenceImageLabel}>{alphabet.word2}</Text>
            </View>
            <Text style={styles.sentencePlus}>+</Text>
            <View style={styles.sentenceImageBox}>
              <Image source={image1} style={styles.sentenceImage} resizeMode="contain" />
              <Text style={styles.sentenceImageLabel}>{alphabet.word1}</Text>
            </View>
          </View>

          <View style={styles.sentenceTextBox}>
            <Text style={styles.sentenceText}>" {alphabet.sentence} "</Text>
          </View>

          <TouchableOpacity 
            onPress={() => speak(alphabet.sentence)} 
            style={styles.listenBtnLarge}
          >
            <Image source={SCREEN_ICONS.speaker} style={styles.speakerIconXL} />
          </TouchableOpacity>
        </View>

        {/* Navigation */}
        <View style={styles.navigationRow}>
          <TouchableOpacity
            onPress={() => { stopSpeaking(); onPrevious(); }}
            style={[styles.navArrowBtn, !hasPrevious && styles.navArrowDisabled]}
            disabled={!hasPrevious}
          >
            <Text style={styles.navArrowText}>◀</Text>
          </TouchableOpacity>

          <View style={styles.progressBox}>
            <Text style={styles.progressText}>{index + 1} / 26</Text>
          </View>

          <TouchableOpacity
            onPress={() => { stopSpeaking(); onNext(); }}
            style={[styles.navArrowBtn, !hasNext && styles.navArrowDisabled]}
            disabled={!hasNext}
          >
            <Text style={styles.navArrowText}>▶</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </ScrollView>
  );
};

// Grid card
interface GridCardProps {
  alphabet: AlphabetData;
  index: number;
  onPress: () => void;
}

// Colorful background colors for cards
const CARD_BG_COLORS = [
  '#FFE5E5', '#E5F6FF', '#F0E5FF', '#E5FFE8', 
  '#FFF5E5', '#FFE5F5', '#E5FFFF', '#FFF0E5',
];

const GridCard: React.FC<GridCardProps> = ({ alphabet, index, onPress }) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const bounceAnim = useRef(new Animated.Value(0)).current;
  const balloonColor = BALLOON_COLORS[index % BALLOON_COLORS.length];
  const borderColor = CARD_BORDER_COLORS[index % CARD_BORDER_COLORS.length];
  const bgColor = CARD_BG_COLORS[index % CARD_BG_COLORS.length];
  const image1 = ALPHABET_IMAGE_1[alphabet.letter];
  const image2 = ALPHABET_IMAGE_2[alphabet.letter];

  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      delay: index * 30,
      tension: 80,
      friction: 6,
    }).start();

    // Floating animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(bounceAnim, { toValue: -3, duration: 1200, useNativeDriver: true }),
        Animated.timing(bounceAnim, { toValue: 0, duration: 1200, useNativeDriver: true }),
      ])
    ).start();
  }, [scaleAnim, bounceAnim, index]);

  return (
    <Animated.View style={[
      styles.gridCard, 
      { transform: [{ scale: scaleAnim }, { translateY: bounceAnim }] }
    ]}>
      <TouchableOpacity
        onPress={onPress}
        style={[styles.gridCardInner, { borderColor: borderColor, backgroundColor: bgColor }]}
        activeOpacity={0.9}
      >
        {/* Sparkle decorations */}
        <Text style={styles.sparkleLeft}>✨</Text>
        <Text style={styles.sparkleRight}>⭐</Text>
        
        {/* Big colorful letter circle */}
        <View style={[styles.gridBalloon, { backgroundColor: balloonColor }]}>
          <View style={styles.balloonShine} />
          <Text style={styles.gridBalloonLetter}>{alphabet.letter}</Text>
        </View>

        {/* Images in colorful bubbles */}
        <View style={styles.gridImagesRow}>
          <View style={styles.gridImageBox}>
            <View style={[styles.imageCircle, { borderColor: `${balloonColor}40` }]}>
              <Image source={image1} style={styles.gridImage} resizeMode="contain" />
            </View>
            <Text style={[styles.gridImageLabel, { color: balloonColor }]}>{alphabet.word1}</Text>
          </View>
          <View style={styles.gridImageBox}>
            <View style={[styles.imageCircle, { borderColor: `${balloonColor}40` }]}>
              <Image source={image2} style={styles.gridImage} resizeMode="contain" />
            </View>
            <Text style={[styles.gridImageLabel, { color: balloonColor }]}>{alphabet.word2}</Text>
          </View>
        </View>

        {/* Fun tap button */}
        <View style={[styles.tapButton, { backgroundColor: balloonColor }]}>
          <Text style={styles.tapButtonText}>🎯 TAP ME!</Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

// ===== WRITING PRACTICE COMPONENT =====

// Circle the letter activity - random letters with current letter mixed in
const getCircleLetterOptions = (currentLetter: string): { letter: string; isCorrect: boolean }[] => {
  const allLetters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
  const otherLetters = allLetters.filter(l => l !== currentLetter);
  
  // Shuffle and pick 5 random letters
  const shuffled = otherLetters.sort(() => Math.random() - 0.5).slice(0, 5);
  
  // Add 2 correct letters at random positions
  const options = [...shuffled, currentLetter, currentLetter];
  
  return options.sort(() => Math.random() - 0.5).map(letter => ({
    letter,
    isCorrect: letter === currentLetter,
  }));
};

interface WritingPracticeProps {
  alphabet: AlphabetData;
  index: number;
  onPrevious: () => void;
  onNext: () => void;
  hasPrevious: boolean;
  hasNext: boolean;
}

interface PathPoint {
  x: number;
  y: number;
}

const WritingPractice: React.FC<WritingPracticeProps> = ({
  alphabet,
  index,
  onPrevious,
  onNext,
  hasPrevious,
  hasNext,
}) => {
  const scrollViewRef = useRef<ScrollView>(null);
  const [circleOptions, setCircleOptions] = useState<{ letter: string; isCorrect: boolean }[]>([]);
  const [selectedCircles, setSelectedCircles] = useState<Set<number>>(new Set());
  
  // Use refs to store drawing data to avoid closure issues
  const allPathsRef = useRef<PathPoint[][]>([]);
  const currentPathRef = useRef<PathPoint[]>([]);
  
  // State only for triggering re-renders
  const [drawingVersion, setDrawingVersion] = useState(0);
  const [currentDrawing, setCurrentDrawing] = useState<PathPoint[]>([]);
  
  // Color It section state - multi-color trace to fill
  const [selectedColor, setSelectedColor] = useState('#E74C3C'); // Default red
  const [colorSegments, setColorSegments] = useState<{start: number, end: number, color: string}[]>([]);
  const [currentFill, setCurrentFill] = useState(0); // Current fill position 0-100
  const [showCelebration, setShowCelebration] = useState(false);
  const lastY = useRef(0);
  const currentColorRef = useRef('#E74C3C');
  
  // Celebration animation values
  const celebrationAnim = useRef(new Animated.Value(0)).current;
  const starsScale = useRef(new Animated.Value(0)).current;
  const celebrationTriggered = useRef(false);
  
  // Countdown state
  const [countdown, setCountdown] = useState<number | null>(null);
  const countdownAnim = useRef(new Animated.Value(1)).current;
  
  // Balloon animations - float up from bottom
  const balloonAnims = useRef([
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
  ]).current;
  
  // Trigger celebration when 100% reached
  useEffect(() => {
    if (currentFill >= 100 && !celebrationTriggered.current) {
      celebrationTriggered.current = true;
      setShowCelebration(true);
      
      // Play celebration animation
      Animated.parallel([
        Animated.spring(celebrationAnim, {
          toValue: 1,
          friction: 3,
          tension: 40,
          useNativeDriver: true,
        }),
        Animated.spring(starsScale, {
          toValue: 1,
          friction: 4,
          tension: 50,
          useNativeDriver: true,
        }),
        // Balloons float up with staggered timing
        ...balloonAnims.map((anim, i) => 
          Animated.sequence([
            Animated.delay(i * 80),
            Animated.timing(anim, {
              toValue: 1,
              duration: 1200,
              useNativeDriver: true,
            }),
          ])
        ),
      ]).start();
      
      // Hide celebration after 1 second, then start countdown
      setTimeout(() => {
        setShowCelebration(false);
        // Start countdown from 5
        setCountdown(5);
      }, 1000);
    }
  }, [currentFill]);
  
  // Countdown effect with animation
  useEffect(() => {
    if (countdown !== null && countdown > 0) {
      // Bounce animation for each number
      countdownAnim.setValue(0);
      Animated.spring(countdownAnim, {
        toValue: 1,
        friction: 3,
        tension: 100,
        useNativeDriver: true,
      }).start();
      
      // Decrease countdown after 1 second
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      
      return () => clearTimeout(timer);
    } else if (countdown === 0) {
      // Time's up! Clear the coloring
      setTimeout(() => {
        setColorSegments([]);
        setCurrentFill(0);
        setCountdown(null);
        celebrationTriggered.current = false;
        celebrationAnim.setValue(0);
        starsScale.setValue(0);
        balloonAnims.forEach(anim => anim.setValue(0));
      }, 500);
    }
  }, [countdown]);
  
  const COLOR_PALETTE = [
    '#E74C3C', // Red
    '#E67E22', // Orange
    '#F1C40F', // Yellow
    '#27AE60', // Green
    '#3498DB', // Blue
    '#9B59B6', // Purple
    '#E91E63', // Pink
    '#1ABC9C', // Teal
    '#8B4513', // Brown
    '#2C3E50', // Dark
  ];
  
  const bounceAnim = useRef(new Animated.Value(0)).current;
  
  const image1 = ALPHABET_IMAGE_1[alphabet.letter];
  const borderColor = CARD_BORDER_COLORS[index % CARD_BORDER_COLORS.length];
  const primaryColor = BALLOON_COLORS[index % BALLOON_COLORS.length];

  useEffect(() => {
    scrollViewRef.current?.scrollTo({ y: 0, animated: false });
    setCircleOptions(getCircleLetterOptions(alphabet.letter));
    setSelectedCircles(new Set());
    // Clear drawing when letter changes
    allPathsRef.current = [];
    currentPathRef.current = [];
    setDrawingVersion(0);
    setCurrentDrawing([]);
    // Clear coloring when letter changes
    setColorSegments([]);
    setCurrentFill(0);
    setShowCelebration(false);
    setCountdown(null);
    celebrationTriggered.current = false;
    celebrationAnim.setValue(0);
    starsScale.setValue(0);
    countdownAnim.setValue(1);
    balloonAnims.forEach(anim => anim.setValue(0));
    
    speak(`Let's write the letter ${alphabet.letter}`);
    
    Animated.loop(
      Animated.sequence([
        Animated.timing(bounceAnim, { toValue: -5, duration: 600, useNativeDriver: true }),
        Animated.timing(bounceAnim, { toValue: 0, duration: 600, useNativeDriver: true }),
      ])
    ).start();
  }, [alphabet, bounceAnim]);

  const handleCirclePress = (idx: number, isCorrect: boolean) => {
    const newSelected = new Set(selectedCircles);
    if (newSelected.has(idx)) {
      newSelected.delete(idx);
    } else {
      newSelected.add(idx);
    }
    setSelectedCircles(newSelected);
    
    if (isCorrect) {
      speak('Correct!');
    }
  };

  const clearTracing = () => {
    allPathsRef.current = [];
    currentPathRef.current = [];
    setDrawingVersion(v => v + 1);
    setCurrentDrawing([]);
  };

  // Pan responder for drawing - all data stored in refs
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt: GestureResponderEvent) => {
        const { locationX, locationY } = evt.nativeEvent;
        currentPathRef.current = [{ x: locationX, y: locationY }];
        setCurrentDrawing([...currentPathRef.current]);
      },
      onPanResponderMove: (evt: GestureResponderEvent) => {
        const { locationX, locationY } = evt.nativeEvent;
        currentPathRef.current.push({ x: locationX, y: locationY });
        setCurrentDrawing([...currentPathRef.current]);
      },
      onPanResponderRelease: () => {
        // Save completed path to allPathsRef
        if (currentPathRef.current.length >= 1) {
          allPathsRef.current.push([...currentPathRef.current]);
          setDrawingVersion(v => v + 1); // Trigger re-render to show saved path
        }
        currentPathRef.current = [];
        setCurrentDrawing([]);
      },
    })
  ).current;
  
  // Get all saved paths for rendering
  const savedPaths = allPathsRef.current;
  
  // Color It section functions
  const clearColoring = () => {
    setColorSegments([]);
    setCurrentFill(0);
    setShowCelebration(false);
    setCountdown(null);
    celebrationTriggered.current = false;
    celebrationAnim.setValue(0);
    starsScale.setValue(0);
    countdownAnim.setValue(1);
    balloonAnims.forEach(anim => anim.setValue(0));
  };
  
  const handleColorSelect = (color: string) => {
    setSelectedColor(color);
    currentColorRef.current = color;
  };
  
  // Pan responder for multi-color trace-to-fill
  const segmentStartRef = useRef(0);
  
  const fillPanResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt: GestureResponderEvent) => {
        lastY.current = evt.nativeEvent.locationY;
        // Remember where this segment starts
        setCurrentFill(prev => {
          segmentStartRef.current = prev;
          return prev;
        });
      },
      onPanResponderMove: (evt: GestureResponderEvent) => {
        const currentY = evt.nativeEvent.locationY;
        const deltaY = currentY - lastY.current;
        
        if (deltaY > 0) {
          setCurrentFill(prev => Math.min(100, prev + deltaY * 0.5));
        }
        lastY.current = currentY;
      },
      onPanResponderRelease: () => {
        // Save this color segment
        setCurrentFill(current => {
          if (current > segmentStartRef.current) {
            setColorSegments(prev => [
              ...prev,
              { start: segmentStartRef.current, end: current, color: currentColorRef.current }
            ]);
          }
          return current;
        });
      },
    })
  ).current;

  // Render dotted letter for tracing
  const renderDottedLetter = (letter: string, size: number, isLowercase: boolean = false) => {
    const displayLetter = isLowercase ? letter.toLowerCase() : letter;
    return (
      <View style={[writingStyles.dottedLetterBox, { width: size, height: size }]}>
        <Text style={[
          writingStyles.dottedLetterText, 
          { fontSize: size * 0.7, color: '#ccc' },
          { fontFamily: 'System' }
        ]}>
          {displayLetter}
        </Text>
        <View style={writingStyles.dottedOverlay}>
          <Text style={[
            writingStyles.dottedLetterText, 
            { fontSize: size * 0.7 },
            writingStyles.dottedTextStyle
          ]}>
            {displayLetter}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <ScrollView 
      ref={scrollViewRef}
      style={writingStyles.container}
      contentContainerStyle={writingStyles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* Main Worksheet Card */}
      <View style={[writingStyles.worksheetCard, { borderColor: primaryColor }]}>
        
        {/* Header Section - Letter with Image */}
        <View style={writingStyles.headerSection}>
          <View style={writingStyles.letterDisplay}>
            <Animated.View style={{ transform: [{ translateY: bounceAnim }] }}>
              <Text style={[writingStyles.mainLetter, { color: primaryColor }]}>
                {alphabet.letter}
                <Text style={writingStyles.lowercaseLetter}>{alphabet.letter.toLowerCase()}</Text>
              </Text>
            </Animated.View>
          </View>
          
          <View style={writingStyles.imageSection}>
            <Image source={image1} style={writingStyles.objectImage} resizeMode="contain" />
            <View style={[writingStyles.isForBadge, { backgroundColor: primaryColor }]}>
              <Text style={writingStyles.isForText}>is for {alphabet.word1}</Text>
            </View>
          </View>
        </View>

        {/* Tracing Section Title */}
        <View style={[writingStyles.sectionTitleBox, { backgroundColor: primaryColor }]}>
          <Text style={writingStyles.sectionTitleText}>✏️ Trace the Letter</Text>
        </View>

        {/* Uppercase Tracing Lines */}
        <View style={writingStyles.tracingSection}>
          <Text style={writingStyles.tracingLabel}>Uppercase {alphabet.letter}</Text>
          <View style={writingStyles.tracingLinesContainer}>
            {/* First Row - Large letters */}
            <View style={writingStyles.tracingRow}>
              {[...Array(5)].map((_, i) => (
                <View key={`upper1-${i}`} style={writingStyles.tracingCell}>
                  {renderDottedLetter(alphabet.letter, 50)}
                </View>
              ))}
            </View>
            {/* Second Row - Medium letters */}
            <View style={writingStyles.tracingRow}>
              {[...Array(6)].map((_, i) => (
                <View key={`upper2-${i}`} style={writingStyles.tracingCell}>
                  {renderDottedLetter(alphabet.letter, 40)}
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* Lowercase Tracing Lines */}
        <View style={writingStyles.tracingSection}>
          <Text style={writingStyles.tracingLabel}>Lowercase {alphabet.letter.toLowerCase()}</Text>
          <View style={writingStyles.tracingLinesContainer}>
            {/* First Row */}
            <View style={writingStyles.tracingRow}>
              {[...Array(6)].map((_, i) => (
                <View key={`lower1-${i}`} style={writingStyles.tracingCell}>
                  {renderDottedLetter(alphabet.letter, 40, true)}
                </View>
              ))}
            </View>
            {/* Second Row */}
            <View style={writingStyles.tracingRow}>
              {[...Array(7)].map((_, i) => (
                <View key={`lower2-${i}`} style={writingStyles.tracingCell}>
                  {renderDottedLetter(alphabet.letter, 35, true)}
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* Drawing Canvas */}
        <View style={writingStyles.canvasSection}>
          <View style={writingStyles.canvasHeader}>
            <Text style={writingStyles.canvasTitle}>✍️ Practice Writing Here</Text>
            <TouchableOpacity onPress={clearTracing} style={writingStyles.eraserBtn}>
              <Image 
                source={{ uri: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f9f9.png' }} 
                style={writingStyles.eraserIcon} 
              />
              <Text style={writingStyles.eraserText}>Erase</Text>
            </TouchableOpacity>
          </View>
          <View style={writingStyles.canvas} {...panResponder.panHandlers}>
            {/* Guide lines */}
            <View style={writingStyles.guideLine} />
            <View style={[writingStyles.guideLine, { top: '50%' }]} />
            <View style={[writingStyles.guideLine, { bottom: 20 }]} />
            
            {/* Drawing dots - saved paths */}
            {savedPaths.map((path, pathIndex) => (
              path.map((point, pointIndex) => (
                <View
                  key={`saved-${drawingVersion}-${pathIndex}-${pointIndex}`}
                  style={[
                    writingStyles.drawingDot,
                    {
                      left: point.x - 3,
                      top: point.y - 3,
                      backgroundColor: primaryColor,
                    },
                  ]}
                />
              ))
            ))}
            {/* Current drawing path */}
            {currentDrawing.map((point, pointIndex) => (
              <View
                key={`current-point-${pointIndex}`}
                style={[
                  writingStyles.drawingDot,
                  {
                    left: point.x - 3,
                    top: point.y - 3,
                    backgroundColor: primaryColor,
                  },
                ]}
              />
            ))}
            
            {/* Ghost letter as guide */}
            <Text style={[writingStyles.ghostLetter, { color: `${primaryColor}20` }]}>
              {alphabet.letter}{alphabet.letter.toLowerCase()}
            </Text>
          </View>
        </View>
      </View>

      {/* Circle the Letter Activity */}
      <View style={[writingStyles.activityCard, { borderColor: '#27AE60' }]}>
        <View style={[writingStyles.activityHeader, { backgroundColor: '#27AE60' }]}>
          <Text style={writingStyles.activityTitle}>🔍 Circle the letter {alphabet.letter}</Text>
        </View>
        
        <View style={writingStyles.circleLettersGrid}>
          {circleOptions.map((option, idx) => (
            <TouchableOpacity
              key={idx}
              onPress={() => handleCirclePress(idx, option.isCorrect)}
              style={[
                writingStyles.circleLetterItem,
                selectedCircles.has(idx) && (option.isCorrect ? writingStyles.correctCircle : writingStyles.wrongCircle),
              ]}
            >
              <Text style={[
                writingStyles.circleLetterText,
                selectedCircles.has(idx) && option.isCorrect && { color: '#27AE60' },
                selectedCircles.has(idx) && !option.isCorrect && { color: '#E74C3C' },
              ]}>
                {option.letter}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Color It Section - Trace to Fill Like Images */}
      <View style={[writingStyles.activityCard, { borderColor: primaryColor }]}>
        <View style={[writingStyles.activityHeader, { backgroundColor: primaryColor }]}>
          <Text style={writingStyles.activityTitle}>🎨 Color the Letter!</Text>
        </View>
        
        <View style={writingStyles.colorItSection}>
          {/* Color Palette */}
          <View style={writingStyles.colorPalette}>
            {COLOR_PALETTE.map((color, idx) => (
              <TouchableOpacity
                key={idx}
                onPress={() => handleColorSelect(color)}
                style={[
                  writingStyles.colorOption,
                  { backgroundColor: color },
                  selectedColor === color && writingStyles.colorOptionSelected,
                ]}
              />
            ))}
            {/* Eraser/Reset Button */}
            <TouchableOpacity onPress={clearColoring} style={writingStyles.colorEraserBtn}>
              <Image 
                source={{ uri: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f9f9.png' }} 
                style={writingStyles.colorEraserIcon} 
              />
            </TouchableOpacity>
          </View>
          
          {/* Letter Canvas - Multi-Color Trace to Fill */}
          <View 
            style={writingStyles.traceCanvas}
            {...fillPanResponder.panHandlers}
          >
            {/* Layer 1: Light gray unfilled letter (no shadow) */}
            <Text style={writingStyles.letterUnfilledClean}>
              {alphabet.letter}
            </Text>
            
            {/* Layer 2: Color segments - each saved segment with its color */}
            {colorSegments.map((segment, idx) => (
              <View 
                key={idx}
                style={[
                  writingStyles.colorSegmentClip, 
                  { top: `${segment.start}%`, height: `${segment.end - segment.start}%` }
                ]}
              >
                <Text style={[writingStyles.letterSegment, { color: segment.color }]}>
                  {alphabet.letter}
                </Text>
              </View>
            ))}
            
            {/* Current active segment being drawn */}
            <View style={[writingStyles.colorFillClip, { height: `${currentFill}%` }]}>
              <Text style={[writingStyles.letterFilled, { color: selectedColor }]}>
                {alphabet.letter}
              </Text>
            </View>
            
            {/* Hand pointer - at top pointing down */}
            <Image 
              source={{ uri: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f447.png' }}
              style={writingStyles.handPointerTop}
            />
            
            {/* Progress indicator */}
            <View style={[writingStyles.progressBadge, { backgroundColor: selectedColor }]}>
              <Text style={writingStyles.progressBadgeText}>{Math.round(currentFill)}%</Text>
            </View>
            
            {/* Celebration overlay when 100% complete */}
            {showCelebration && (
              <>
                {/* Floating Balloons - rise from bottom */}
                {[
                  { left: 20, color: '🎈' },
                  { left: 60, color: '🎈' },
                  { left: 100, color: '🎈' },
                  { right: 100, color: '🎈' },
                  { right: 60, color: '🎈' },
                  { right: 20, color: '🎈' },
                ].map((balloon, i) => (
                  <Animated.Text
                    key={`balloon-${i}`}
                    style={[
                      writingStyles.celebrationBalloon,
                      { left: balloon.left, right: balloon.right },
                      {
                        transform: [
                          { 
                            translateY: balloonAnims[i].interpolate({
                              inputRange: [0, 1],
                              outputRange: [350, -50], // Float from bottom to top
                            })
                          },
                          {
                            translateX: balloonAnims[i].interpolate({
                              inputRange: [0, 0.5, 1],
                              outputRange: [0, i % 2 === 0 ? 15 : -15, 0], // Slight sway
                            })
                          },
                        ],
                        opacity: balloonAnims[i].interpolate({
                          inputRange: [0, 0.1, 0.9, 1],
                          outputRange: [0, 1, 1, 0],
                        }),
                      }
                    ]}
                  >
                    {balloon.color}
                  </Animated.Text>
                ))}
                
                {/* Stars around the letter */}
                {[
                  { top: 15, left: 25, emoji: '⭐' },
                  { top: 35, right: 35, emoji: '🌟' },
                  { top: 110, left: 15, emoji: '✨' },
                  { top: 170, right: 20, emoji: '⭐' },
                  { top: 250, left: 45, emoji: '🌟' },
                  { top: 230, right: 50, emoji: '✨' },
                ].map((pos, i) => (
                  <Animated.Text
                    key={`star-${i}`}
                    style={[
                      writingStyles.celebrationStar,
                      { top: pos.top, left: pos.left, right: pos.right },
                      {
                        transform: [{ scale: starsScale }],
                        opacity: starsScale,
                      }
                    ]}
                  >
                    {pos.emoji}
                  </Animated.Text>
                ))}
                
                {/* Big celebration badge */}
                <Animated.View 
                  style={[
                    writingStyles.celebrationBadge,
                    {
                      transform: [{ scale: celebrationAnim }],
                      opacity: celebrationAnim,
                    }
                  ]}
                >
                  <Text style={writingStyles.celebrationEmoji}>🎉</Text>
                  <Text style={writingStyles.celebrationText}>Great Job!</Text>
                </Animated.View>
              </>
            )}
            
            {/* Countdown Timer - Beautiful child-friendly */}
            {countdown !== null && countdown > 0 && (
              <View style={writingStyles.countdownContainer}>
                <Text style={writingStyles.countdownLabel}>🎨 Color again in...</Text>
                <Animated.View 
                  style={[
                    writingStyles.countdownCircle,
                    {
                      transform: [{ scale: countdownAnim }],
                      backgroundColor: countdown > 3 ? '#4CAF50' : countdown > 1 ? '#FF9800' : '#F44336',
                    }
                  ]}
                >
                  <Text style={writingStyles.countdownNumber}>{countdown}</Text>
                </Animated.View>
                <View style={writingStyles.countdownStars}>
                  {Array(countdown).fill(0).map((_, i) => (
                    <Text key={i} style={writingStyles.countdownStar}>⭐</Text>
                  ))}
                </View>
              </View>
            )}
            
            {/* Ready message when countdown hits 0 */}
            {countdown === 0 && (
              <View style={writingStyles.readyContainer}>
                <Text style={writingStyles.readyEmoji}>🌈</Text>
                <Text style={writingStyles.readyText}>Ready!</Text>
              </View>
            )}
          </View>
          
          <Text style={writingStyles.colorItHint}>
            {showCelebration 
              ? '🌟 Amazing! You colored the letter! 🌟' 
              : countdown !== null 
                ? `✨ Get ready to color again! ✨`
                : '👆 Pick a color & drag down to fill!'}
          </Text>
        </View>
      </View>

      {/* Navigation */}
      <View style={writingStyles.navigationRow}>
        <TouchableOpacity
          onPress={() => { stopSpeaking(); onPrevious(); }}
          style={[writingStyles.navArrowBtn, !hasPrevious && writingStyles.navArrowDisabled]}
          disabled={!hasPrevious}
        >
          <Text style={writingStyles.navArrowText}>◀</Text>
        </TouchableOpacity>

        <View style={[writingStyles.progressBox, { backgroundColor: primaryColor }]}>
          <Text style={writingStyles.progressText}>{index + 1} / 26</Text>
        </View>

        <TouchableOpacity
          onPress={() => { stopSpeaking(); onNext(); }}
          style={[writingStyles.navArrowBtn, !hasNext && writingStyles.navArrowDisabled]}
          disabled={!hasNext}
        >
          <Text style={writingStyles.navArrowText}>▶</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

// Writing Grid Card for selection
interface WritingGridCardProps {
  alphabet: AlphabetData;
  index: number;
  onPress: () => void;
}

const WritingGridCard: React.FC<WritingGridCardProps> = ({ alphabet, index, onPress }) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const bounceAnim = useRef(new Animated.Value(0)).current;
  const borderColor = CARD_BORDER_COLORS[index % CARD_BORDER_COLORS.length];
  const balloonColor = BALLOON_COLORS[index % BALLOON_COLORS.length];
  const cardBgColor = CARD_BG_COLORS[index % CARD_BG_COLORS.length];

  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      delay: index * 25,
      tension: 80,
      friction: 6,
    }).start();

    // Floating animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(bounceAnim, { toValue: -2, duration: 1200, useNativeDriver: true }),
        Animated.timing(bounceAnim, { toValue: 0, duration: 1200, useNativeDriver: true }),
      ])
    ).start();
  }, [scaleAnim, bounceAnim, index]);

  return (
    <Animated.View style={[
      writingStyles.gridCard, 
      { transform: [{ scale: scaleAnim }, { translateY: bounceAnim }] }
    ]}>
      <TouchableOpacity
        onPress={onPress}
        style={[writingStyles.gridCardInner, { borderColor, backgroundColor: cardBgColor }]}
        activeOpacity={0.9}
      >
        {/* Sparkle decorations */}
        <Text style={writingStyles.sparkleLeft}>✨</Text>
        <Text style={writingStyles.sparkleRight}>⭐</Text>
        
        {/* Colorful letter circle */}
        <View style={[writingStyles.letterCircle, { backgroundColor: balloonColor }]}>
          <View style={writingStyles.letterShine} />
          <Text style={writingStyles.gridLetter}>{alphabet.letter}</Text>
        </View>
        
        {/* Lowercase letter */}
        <Text style={[writingStyles.gridLetterLower, { color: balloonColor }]}>
          {alphabet.letter.toLowerCase()}
        </Text>
        
        {/* Colorful write button */}
        <View style={[writingStyles.writeButton, { backgroundColor: balloonColor }]}>
          <Text style={writingStyles.writeButtonText}>✏️ WRITE</Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

interface AlphabetsScreenProps {
  navigation: any;
}

export const AlphabetsScreen: React.FC<AlphabetsScreenProps> = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState<TabType>('learn');
  const insets = useSafeAreaInsets();
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'flashcard'>('grid');
  const [writingSelectedIndex, setWritingSelectedIndex] = useState<number | null>(null);
  const [writingViewMode, setWritingViewMode] = useState<'grid' | 'practice'>('grid');

  const openFlashcard = (index: number) => {
    setSelectedIndex(index);
    setViewMode('flashcard');
  };

  const closeFlashcard = () => {
    stopSpeaking();
    setSelectedIndex(null);
    setViewMode('grid');
  };

  const openWritingPractice = (index: number) => {
    setWritingSelectedIndex(index);
    setWritingViewMode('practice');
  };

  const closeWritingPractice = () => {
    stopSpeaking();
    setWritingSelectedIndex(null);
    setWritingViewMode('grid');
  };

  const goToPrevious = () => {
    if (selectedIndex !== null && selectedIndex > 0) {
      setSelectedIndex(selectedIndex - 1);
    }
  };

  const goToNext = () => {
    if (selectedIndex !== null && selectedIndex < ALPHABETS.length - 1) {
      setSelectedIndex(selectedIndex + 1);
    }
  };

  const goToWritingPrevious = () => {
    if (writingSelectedIndex !== null && writingSelectedIndex > 0) {
      setWritingSelectedIndex(writingSelectedIndex - 1);
    }
  };

  const goToWritingNext = () => {
    if (writingSelectedIndex !== null && writingSelectedIndex < ALPHABETS.length - 1) {
      setWritingSelectedIndex(writingSelectedIndex + 1);
    }
  };

  useEffect(() => {
    return () => stopSpeaking();
  }, []);

  // Determine if we're in a detail view (flashcard or writing practice)
  const isInDetailView = (activeTab === 'learn' && viewMode === 'flashcard') || 
                          (activeTab === 'write' && writingViewMode === 'practice');

  return (
    <ImageBackground source={ABC_BG_IMAGE} style={styles.container} resizeMode="cover">
      <StatusBar barStyle="dark-content" />

      {/* Main Header with Back Button */}
      {!isInDetailView && (
        <View style={[styles.header, { marginTop: insets.top + 10 }]}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>🎈 ABC</Text>
          <View style={styles.headerSpace} />
        </View>
      )}

      {/* Tab Navigation - Only show when not in detail view */}
      {!isInDetailView && (
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'learn' && styles.tabButtonActive]}
            onPress={() => setActiveTab('learn')}
          >
            <Text style={[styles.tabText, activeTab === 'learn' && styles.tabTextActive]}>
              📚 Learn ABC
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'write' && styles.tabButtonActive]}
            onPress={() => setActiveTab('write')}
          >
            <Text style={[styles.tabText, activeTab === 'write' && styles.tabTextActive]}>
              ✏️ Write ABC
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* LEARN ABC TAB */}
      {activeTab === 'learn' && (
        <>
          {viewMode === 'grid' ? (
            <>
              <View style={styles.instructionBox}>
                <Text style={styles.instructionText}>✨ Tap to learn 2 words + sentence! ✨</Text>
              </View>

              <ScrollView contentContainerStyle={styles.gridContainer} showsVerticalScrollIndicator={false}>
                <View style={styles.gridWrapper}>
                  {ALPHABETS.map((alphabet, idx) => (
                    <GridCard
                      key={alphabet.letter}
                      alphabet={alphabet}
                      index={idx}
                      onPress={() => openFlashcard(idx)}
                    />
                  ))}
                </View>
              </ScrollView>
            </>
          ) : (
            <>
              <View style={[styles.flashcardHeader, { marginTop: insets.top + 10 }]}>
                <TouchableOpacity onPress={closeFlashcard} style={styles.backArrowBtn}>
                  <Text style={styles.backArrowText}>↩</Text>
                </TouchableOpacity>
              </View>

              {selectedIndex !== null && (
                <Flashcard
                  alphabet={ALPHABETS[selectedIndex]}
                  index={selectedIndex}
                  onPrevious={goToPrevious}
                  onNext={goToNext}
                  hasPrevious={selectedIndex > 0}
                  hasNext={selectedIndex < ALPHABETS.length - 1}
                />
              )}
            </>
          )}
        </>
      )}

      {/* WRITE ABC TAB */}
      {activeTab === 'write' && (
        <>
          {writingViewMode === 'grid' ? (
            <>
              <View style={styles.instructionBox}>
                <Text style={styles.instructionText}>✏️ Select a letter to practice writing! ✏️</Text>
              </View>

              <ScrollView contentContainerStyle={styles.gridContainer} showsVerticalScrollIndicator={false}>
                <View style={styles.gridWrapper}>
                  {ALPHABETS.map((alphabet, idx) => (
                    <WritingGridCard
                      key={`write-${alphabet.letter}`}
                      alphabet={alphabet}
                      index={idx}
                      onPress={() => openWritingPractice(idx)}
                    />
                  ))}
                </View>
              </ScrollView>
            </>
          ) : (
            <>
              <View style={[styles.flashcardHeader, { marginTop: insets.top + 10 }]}>
                <TouchableOpacity onPress={closeWritingPractice} style={styles.backArrowBtn}>
                  <Text style={styles.backArrowText}>↩</Text>
                </TouchableOpacity>
                <Text style={styles.writingHeaderTitle}>✏️ Writing Practice</Text>
                <View style={{ width: 65 }} />
              </View>

              {writingSelectedIndex !== null && (
                <WritingPractice
                  alphabet={ALPHABETS[writingSelectedIndex]}
                  index={writingSelectedIndex}
                  onPrevious={goToWritingPrevious}
                  onNext={goToWritingNext}
                  hasPrevious={writingSelectedIndex > 0}
                  hasNext={writingSelectedIndex < ALPHABETS.length - 1}
                />
              )}
            </>
          )}
        </>
      )}
    </ImageBackground>
  );
};

// Calculate card width for 2 cards per row
const CARD_WIDTH = (width - 40) / 2;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    marginBottom: 6,
    zIndex: 10,
  },
  backBtn: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: '#FFE5E5',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 8,
  },
  backText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FF6B6B',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#fff',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  headerSpace: { width: 60 },
  instructionBox: {
    backgroundColor: '#FFFBEB',
    marginHorizontal: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 18,
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 2,
    borderColor: '#FFD700',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 8,
  },
  instructionText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#D97706',
  },
  gridContainer: {
    paddingHorizontal: 10,
    paddingBottom: 100,
    paddingTop: 10,
    flexGrow: 1,
  },
  gridWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  gridCard: {
    width: CARD_WIDTH,
    margin: 4,
  },
  gridCardInner: {
    backgroundColor: '#fff',
    borderRadius: 14,
    borderWidth: 2,
    padding: 8,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 6,
    position: 'relative',
    overflow: 'visible',
  },
  sparkleLeft: {
    position: 'absolute',
    top: 2,
    left: 4,
    fontSize: 8,
    zIndex: 10,
  },
  sparkleRight: {
    position: 'absolute',
    top: 2,
    right: 4,
    fontSize: 8,
    zIndex: 10,
  },
  gridBalloon: {
    width: 36,
    height: 40,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.5)',
    overflow: 'hidden',
  },
  balloonShine: {
    position: 'absolute',
    top: 3,
    left: 5,
    width: 10,
    height: 5,
    backgroundColor: 'rgba(255,255,255,0.5)',
    borderRadius: 5,
    transform: [{ rotate: '-25deg' }],
  },
  gridBalloonLetter: {
    fontSize: 18,
    fontWeight: '900',
    color: '#fff',
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  gridImagesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 4,
  },
  gridImageBox: {
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 1,
  },
  imageCircle: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 3,
    borderWidth: 1,
    marginBottom: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  gridImage: {
    width: 26,
    height: 26,
  },
  gridImageLabel: {
    fontSize: 8,
    fontWeight: '700',
    textAlign: 'center',
  },
  tapButton: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 2,
  },
  tapButtonText: {
    fontSize: 8,
    fontWeight: '800',
    color: '#fff',
  },
  // Flashcard
  flashcardHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    paddingHorizontal: 15,
    marginBottom: 5,
    zIndex: 10,
  },
  backArrowBtn: {
    width: 65,
    height: 65,
    borderRadius: 33,
    backgroundColor: '#A855F7',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 10,
    borderWidth: 4,
    borderColor: '#C4B5FD',
  },
  backArrowText: {
    fontSize: 36,
    color: '#fff',
    marginTop: -4,
    marginLeft: -2,
  },
  flashcardScroll: {
    flex: 1,
  },
  flashcardScrollContent: {
    paddingHorizontal: 15,
    paddingBottom: 40,
    paddingTop: 50, // Space for balloon
  },
  flashcardContainer: {
    alignItems: 'center',
  },
  // Section Cards
  sectionCard: {
    width: width - 30,
    backgroundColor: '#fff',
    borderRadius: 25,
    borderWidth: 6,
    padding: 22,
    alignItems: 'center',
    marginBottom: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
  },
  balloonContainer: {
    position: 'absolute',
    top: -35,
    left: 15,
    alignItems: 'center',
  },
  balloon: {
    width: 55,
    height: 65,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  balloonLetter: {
    fontSize: 32,
    fontWeight: '900',
    color: '#fff',
  },
  balloonTail: {
    width: 0,
    height: 0,
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderTopWidth: 12,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    marginTop: -1,
  },
  balloonString: {
    width: 2,
    height: 20,
    backgroundColor: '#888',
  },
  forText: {
    fontSize: 28,
    fontWeight: '600',
    color: '#333',
    marginTop: 28,
    marginBottom: 18,
    textShadowColor: 'rgba(0,0,0,0.05)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  letterHighlight: {
    fontSize: 36,
    fontWeight: '900',
    textShadowColor: 'rgba(0,0,0,0.1)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  wordHighlight: {
    fontSize: 30,
    fontWeight: '800',
    color: '#2C3E50',
  },
  imageContainer: {
    width: 140,
    height: 140,
    backgroundColor: '#F0F8FF',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 18,
    borderWidth: 3,
    borderColor: '#E0E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  mainImage: {
    width: 100,
    height: 100,
  },
  listenBtn: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
    borderWidth: 4,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  speakerIconLarge: {
    width: 34,
    height: 34,
    tintColor: '#fff',
  },
  // Sentence Section
  sentenceCard: {
    width: width - 30,
    backgroundColor: '#FFFBEB',
    borderRadius: 22,
    borderWidth: 4,
    padding: 20,
    alignItems: 'center',
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  sentenceTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#E67E22',
    marginTop: 25,
    marginBottom: 15,
  },
  sentenceImagesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
  },
  sentenceImageBox: {
    alignItems: 'center',
  },
  sentenceImage: {
    width: 60,
    height: 60,
  },
  sentenceImageLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    marginTop: 4,
  },
  sentencePlus: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#27AE60',
    marginHorizontal: 20,
  },
  sentenceTextBox: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderRadius: 15,
    marginBottom: 15,
    borderWidth: 2,
    borderColor: '#FFD700',
  },
  sentenceText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2C3E50',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  listenBtnLarge: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#9B59B6',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
  },
  speakerIconXL: {
    width: 36,
    height: 36,
    tintColor: '#fff',
  },
  // Navigation
  navigationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 10,
    paddingHorizontal: 20,
  },
  navArrowBtn: {
    width: 55,
    height: 55,
    borderRadius: 28,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  navArrowDisabled: {
    opacity: 0.4,
  },
  navArrowText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.purple,
  },
  progressBox: {
    backgroundColor: 'rgba(0,0,0,0.15)',
    paddingHorizontal: 25,
    paddingVertical: 10,
    borderRadius: 20,
  },
  progressText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  // Tab Navigation Styles
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: 12,
    marginBottom: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 8,
    zIndex: 10,
    borderWidth: 2,
    borderColor: '#FFE5E5',
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 16,
  },
  tabButtonActive: {
    backgroundColor: '#FF6B6B',
    shadowColor: '#FF6B6B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFACAC',
  },
  tabTextActive: {
    color: '#fff',
    fontWeight: '800',
  },
  writingHeaderTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: '800',
    color: '#fff',
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
});

// Writing Practice Styles
const WRITING_CARD_WIDTH = (width - 40) / 2;

const writingStyles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 15,
    paddingBottom: 50,
    paddingTop: 10,
  },
  // Worksheet Card
  worksheetCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    borderWidth: 5,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 6,
  },
  // Header Section
  headerSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  letterDisplay: {
    flex: 1,
  },
  mainLetter: {
    fontSize: 80,
    fontWeight: '900',
    textShadowColor: 'rgba(0,0,0,0.1)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  lowercaseLetter: {
    fontSize: 60,
    fontWeight: '800',
  },
  imageSection: {
    alignItems: 'center',
  },
  objectImage: {
    width: 80,
    height: 80,
    marginBottom: 8,
  },
  isForBadge: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 15,
  },
  isForText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  // Section Title
  sectionTitleBox: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 15,
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitleText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '800',
  },
  // Tracing Section
  tracingSection: {
    marginBottom: 15,
  },
  tracingLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#666',
    marginBottom: 8,
  },
  tracingLinesContainer: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 10,
    borderWidth: 2,
    borderColor: '#E9ECEF',
  },
  tracingRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#DEE2E6',
    paddingVertical: 5,
  },
  tracingCell: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Dotted Letter Box
  dottedLetterBox: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  dottedLetterText: {
    fontWeight: '900',
    textAlign: 'center',
  },
  dottedOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dottedTextStyle: {
    color: 'transparent',
    textShadowColor: '#999',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 0,
    // Simulate dotted using dashed text decoration workaround
    letterSpacing: 2,
  },
  // Canvas Section
  canvasSection: {
    marginTop: 10,
  },
  canvasHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  canvasTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
  },
  clearBtn: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 12,
  },
  clearBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  eraserBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  eraserIcon: {
    width: 24,
    height: 24,
    marginRight: 6,
  },
  eraserText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  canvas: {
    height: 180,
    backgroundColor: '#FAFAFA',
    borderRadius: 15,
    borderWidth: 3,
    borderColor: '#E0E0E0',
    borderStyle: 'dashed',
    position: 'relative',
    overflow: 'hidden',
  },
  guideLine: {
    position: 'absolute',
    left: 10,
    right: 10,
    top: 20,
    height: 1,
    backgroundColor: '#E0E0E0',
  },
  ghostLetter: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -60 }, { translateY: -50 }],
    fontSize: 100,
    fontWeight: '900',
  },
  drawingDot: {
    position: 'absolute',
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  // Activity Cards
  activityCard: {
    backgroundColor: '#fff',
    borderRadius: 18,
    borderWidth: 4,
    marginBottom: 15,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 5,
  },
  activityHeader: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  activityTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '800',
  },
  // Circle Letters Grid
  circleLettersGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    padding: 15,
    gap: 10,
  },
  circleLetterItem: {
    width: 55,
    height: 55,
    borderRadius: 28,
    borderWidth: 3,
    borderColor: '#333',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  correctCircle: {
    borderColor: '#27AE60',
    borderWidth: 4,
    borderStyle: 'solid',
    backgroundColor: '#E8F8F0',
  },
  wrongCircle: {
    borderColor: '#E74C3C',
    borderWidth: 4,
    borderStyle: 'solid',
    backgroundColor: '#FDEDEC',
  },
  circleLetterText: {
    fontSize: 24,
    fontWeight: '900',
    color: '#333',
  },
  // Color It Section
  colorItSection: {
    alignItems: 'center',
    padding: 15,
  },
  colorPalette: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 15,
    gap: 8,
  },
  colorOption: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  colorOptionSelected: {
    borderWidth: 4,
    borderColor: '#333',
    transform: [{ scale: 1.15 }],
  },
  colorEraserBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#ddd',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  colorEraserIcon: {
    width: 22,
    height: 22,
  },
  coloringCanvas: {
    width: width - 60,
    height: 200,
    backgroundColor: '#fff',
    borderRadius: 15,
    borderWidth: 4,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  coloringCanvasLarge: {
    width: width - 50,
    height: 280,
    backgroundColor: '#fff',
    borderRadius: 20,
    borderWidth: 5,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    position: 'relative',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 5,
  },
  // Trace to fill styles - like the images
  traceCanvas: {
    width: width - 40,
    height: 300,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    position: 'relative',
    backgroundColor: 'transparent',
  },
  letterUnfilledClean: {
    fontSize: 250,
    fontWeight: '900',
    color: '#E0E0E0', // Light gray unfilled - no shadow
    position: 'absolute',
  },
  colorFillClip: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    overflow: 'hidden',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  letterFilled: {
    fontSize: 250,
    fontWeight: '900',
  },
  colorSegmentClip: {
    position: 'absolute',
    left: 0,
    right: 0,
    overflow: 'hidden',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  letterSegment: {
    fontSize: 250,
    fontWeight: '900',
  },
  handPointerTop: {
    position: 'absolute',
    top: 0,
    left: '50%',
    marginLeft: -22, // Half of width to center
    width: 45,
    height: 45,
    zIndex: 5,
  },
  progressBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  progressBadgeText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
  },
  celebrationStar: {
    position: 'absolute',
    fontSize: 35,
    zIndex: 10,
  },
  celebrationBalloon: {
    position: 'absolute',
    fontSize: 45,
    zIndex: 15,
  },
  countdownContainer: {
    position: 'absolute',
    top: '30%',
    alignSelf: 'center',
    alignItems: 'center',
    zIndex: 25,
  },
  countdownLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: '#666',
    marginBottom: 10,
    textShadowColor: '#fff',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  countdownCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
    borderWidth: 4,
    borderColor: '#fff',
  },
  countdownNumber: {
    fontSize: 42,
    fontWeight: '900',
    color: '#fff',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  countdownStars: {
    flexDirection: 'row',
    marginTop: 10,
  },
  countdownStar: {
    fontSize: 22,
    marginHorizontal: 2,
  },
  readyContainer: {
    position: 'absolute',
    top: '35%',
    alignSelf: 'center',
    alignItems: 'center',
    zIndex: 25,
  },
  readyEmoji: {
    fontSize: 50,
  },
  readyText: {
    fontSize: 24,
    fontWeight: '800',
    color: '#4CAF50',
    marginTop: 5,
  },
  celebrationBadge: {
    position: 'absolute',
    bottom: 60,
    alignSelf: 'center',
    backgroundColor: '#FFD700',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 20,
  },
  celebrationEmoji: {
    fontSize: 28,
    marginRight: 8,
  },
  celebrationText: {
    fontSize: 20,
    fontWeight: '800',
    color: '#333',
  },
  fillLetterContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  fillLetterButton: {
    paddingHorizontal: 5,
  },
  letterWrapper: {
    position: 'relative',
  },
  fillLetter: {
    fontSize: 120,
    fontWeight: '900',
  },
  fillLetterSmall: {
    fontSize: 90,
    fontWeight: '900',
  },
  letterOutline: {
    color: '#E8E8E8',
    textShadowColor: '#333',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  letterFill: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  outlineLetterContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    position: 'absolute',
  },
  outlineLetter: {
    fontSize: 120,
    fontWeight: '900',
    textShadowColor: '#333',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 0,
  },
  outlineLetterSmall: {
    fontSize: 90,
    fontWeight: '900',
    textShadowColor: '#333',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 0,
    marginLeft: 5,
  },
  colorItHint: {
    fontSize: 14,
    fontWeight: '600',
    color: '#888',
    fontStyle: 'italic',
  },
  // Navigation
  navigationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    marginTop: 10,
    marginBottom: 20,
  },
  navArrowBtn: {
    width: 55,
    height: 55,
    borderRadius: 28,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  navArrowDisabled: {
    opacity: 0.4,
  },
  navArrowText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.purple,
  },
  progressBox: {
    paddingHorizontal: 25,
    paddingVertical: 10,
    borderRadius: 20,
  },
  progressText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  // Writing Grid Card - Colorful design (compact)
  gridCard: {
    width: WRITING_CARD_WIDTH,
    margin: 4,
  },
  gridCardInner: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 2,
    padding: 8,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 6,
    position: 'relative',
    overflow: 'visible',
  },
  sparkleLeft: {
    position: 'absolute',
    top: 2,
    left: 4,
    fontSize: 8,
    zIndex: 10,
  },
  sparkleRight: {
    position: 'absolute',
    top: 2,
    right: 4,
    fontSize: 8,
    zIndex: 10,
  },
  letterCircle: {
    width: 34,
    height: 38,
    borderRadius: 17,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.5)',
    overflow: 'hidden',
  },
  letterShine: {
    position: 'absolute',
    top: 3,
    left: 5,
    width: 9,
    height: 5,
    backgroundColor: 'rgba(255,255,255,0.5)',
    borderRadius: 4,
    transform: [{ rotate: '-25deg' }],
  },
  gridLetter: {
    fontSize: 16,
    fontWeight: '900',
    color: '#fff',
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  gridLetterLower: {
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 4,
  },
  gridWriteHint: {
    fontSize: 8,
    fontWeight: '700',
    color: '#888',
  },
  writeButton: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 2,
  },
  writeButtonText: {
    fontSize: 7,
    fontWeight: '800',
    color: '#fff',
  },
});
