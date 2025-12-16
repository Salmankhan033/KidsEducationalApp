import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Dimensions,
  Image,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, RAINBOW_COLORS } from '../constants/colors';
import { SHAPES } from '../constants/gameData';
import { speakShape, speakWord, stopSpeaking, speakCelebration } from '../utils/speech';
import { SCREEN_ICONS } from '../assets/images';
import { MuteButton } from '../components';

const { width, height } = Dimensions.get('window');

// Decorative background images
const BG_IMAGES = {
  sun: { uri: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/2600.png' },
  cloud: { uri: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/2601.png' },
  rainbow: { uri: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f308.png' },
  star: { uri: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/2b50.png' },
  butterfly: { uri: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f98b.png' },
  flower: { uri: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f33c.png' },
  tulip: { uri: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f337.png' },
  tree: { uri: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f333.png' },
  bird: { uri: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f426.png' },
  bee: { uri: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f41d.png' },
  ladybug: { uri: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f41e.png' },
  sparkle: { uri: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/2728.png' },
};

// Card colors for shapes
const CARD_BORDER_COLORS = ['#FF6B6B', '#4D96FF', '#6BCB77', '#FFA94D', '#FFD93D', '#FF6B9D', '#4ECDC4', '#9B59B6'];

// Real life examples for each shape
const REAL_LIFE_EXAMPLES: Record<string, { emoji: string; text: string }[]> = {
  Circle: [
    { emoji: '🍕', text: 'Pizza' },
    { emoji: '⚽', text: 'Ball' },
    { emoji: '🍪', text: 'Cookie' },
  ],
  Square: [
    { emoji: '📺', text: 'TV Screen' },
    { emoji: '🧇', text: 'Waffle' },
    { emoji: '🖼️', text: 'Picture Frame' },
  ],
  Triangle: [
    { emoji: '🍕', text: 'Pizza Slice' },
    { emoji: '⛺', text: 'Tent' },
    { emoji: '📐', text: 'Ruler' },
  ],
  Rectangle: [
    { emoji: '📱', text: 'Phone' },
    { emoji: '🚪', text: 'Door' },
    { emoji: '📚', text: 'Book' },
  ],
  Star: [
    { emoji: '⭐', text: 'Night Sky Star' },
    { emoji: '🌟', text: 'Gold Star' },
    { emoji: '✨', text: 'Sparkle' },
  ],
  Heart: [
    { emoji: '❤️', text: 'Love Symbol' },
    { emoji: '💝', text: 'Gift Heart' },
    { emoji: '🫀', text: 'Our Heart' },
  ],
  Diamond: [
    { emoji: '💎', text: 'Gem Stone' },
    { emoji: '🪁', text: 'Kite' },
    { emoji: '♦️', text: 'Playing Card' },
  ],
  Oval: [
    { emoji: '🥚', text: 'Egg' },
    { emoji: '🏈', text: 'Football' },
    { emoji: '🥔', text: 'Potato' },
  ],
};

// Fun facts for each shape
const FUN_FACTS: Record<string, string> = {
  Circle: 'A circle has no corners! Wheels are circles so they roll smoothly! 🎡',
  Square: 'All 4 sides of a square are the same length! Windows are often squares! 🪟',
  Triangle: 'Triangles are super strong! Bridges use triangles to stay up! 🌉',
  Rectangle: 'A rectangle is like a stretched square! Your door is a rectangle! 🚪',
  Star: 'Stars twinkle in the night sky! Count the points - usually 5! ⭐',
  Heart: 'Hearts mean love! We draw hearts to show we care! 💕',
  Diamond: 'Diamonds are the hardest gems! Baseball fields are diamond shaped! ⚾',
  Oval: 'Ovals are like stretched circles! Eggs are oval shaped! 🥚',
};

// Objects that match each shape
const SHAPE_OBJECTS: Record<string, { emoji: string; name: string }[]> = {
  Circle: [
    { emoji: '🍎', name: 'Apple' },
    { emoji: '🏀', name: 'Basketball' },
    { emoji: '🍩', name: 'Donut' },
  ],
  Square: [
    { emoji: '🎲', name: 'Dice' },
    { emoji: '🧊', name: 'Ice Cube' },
    { emoji: '📦', name: 'Box' },
  ],
  Triangle: [
    { emoji: '🔺', name: 'Arrow' },
    { emoji: '🎪', name: 'Circus Tent' },
    { emoji: '🏔️', name: 'Mountain' },
  ],
  Rectangle: [
    { emoji: '💵', name: 'Money' },
    { emoji: '🎹', name: 'Piano Keys' },
    { emoji: '🚌', name: 'Bus' },
  ],
  Star: [
    { emoji: '🌟', name: 'Glowing Star' },
    { emoji: '⭐', name: 'Gold Star' },
    { emoji: '🎖️', name: 'Medal' },
  ],
  Heart: [
    { emoji: '💖', name: 'Sparkling Heart' },
    { emoji: '💗', name: 'Growing Heart' },
    { emoji: '💓', name: 'Beating Heart' },
  ],
  Diamond: [
    { emoji: '💠', name: 'Blue Diamond' },
    { emoji: '🔷', name: 'Blue Diamond Shape' },
    { emoji: '🔶', name: 'Orange Diamond' },
  ],
  Oval: [
    { emoji: '🥄', name: 'Spoon' },
    { emoji: '🪞', name: 'Mirror' },
    { emoji: '🏉', name: 'Rugby Ball' },
  ],
};

interface ShapeData {
  name: string;
  emoji: string;
  sides: number;
  color: string;
}

// Flashcard Component
interface FlashcardProps {
  shapeData: ShapeData;
  index: number;
  onPrevious: () => void;
  onNext: () => void;
  hasPrevious: boolean;
  hasNext: boolean;
}

const Flashcard: React.FC<FlashcardProps> = ({
  shapeData,
  index,
  onPrevious,
  onNext,
  hasPrevious,
  hasNext,
}) => {
  const cardAnim = useRef(new Animated.Value(0)).current;
  const balloonBounce = useRef(new Animated.Value(0)).current;
  const scrollViewRef = useRef<ScrollView>(null);

  const borderColor = CARD_BORDER_COLORS[index % CARD_BORDER_COLORS.length];

  useEffect(() => {
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

    speakShape(shapeData.name);
  }, [shapeData, cardAnim, balloonBounce]);

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
        {/* SECTION 1: Shape Card */}
        <View style={[styles.sectionCard, { borderColor: shapeData.color }]}>
          <Animated.View style={[styles.balloonContainer, { transform: [{ translateY: balloonBounce }] }]}>
            <View style={[styles.balloon, { backgroundColor: shapeData.color }]}>
              <Text style={styles.balloonEmoji}>{shapeData.emoji}</Text>
            </View>
            <View style={[styles.balloonTail, { borderTopColor: shapeData.color }]} />
            <View style={styles.balloonString} />
          </Animated.View>

          <Text style={styles.forText}>
            <Text style={[styles.shapeHighlight, { color: shapeData.color }]}>{shapeData.name}</Text>
          </Text>

          <View style={styles.emojiDisplayContainer}>
            <Text style={styles.emojiDisplay}>{shapeData.emoji}</Text>
          </View>

          <View style={styles.sidesInfoBox}>
            <Text style={styles.sidesInfoText}>
              {shapeData.sides > 0 ? `${shapeData.sides} sides` : 'No corners - Round!'}
            </Text>
          </View>

          <TouchableOpacity
            onPress={() => speakShape(shapeData.name)}
            style={[styles.listenBtn, { backgroundColor: shapeData.color }]}
          >
            <Image source={SCREEN_ICONS.speaker} style={styles.speakerIconLarge} />
          </TouchableOpacity>
        </View>

        {/* SECTION 2: Draw the Shape */}
        <View style={[styles.activityCard, { borderColor: '#E91E63' }]}>
          <Animated.View style={[styles.balloonContainer, { transform: [{ translateY: balloonBounce }] }]}>
            <View style={[styles.balloon, { backgroundColor: '#E91E63' }]}>
              <Text style={styles.balloonEmoji}>✏️</Text>
            </View>
            <View style={[styles.balloonTail, { borderTopColor: '#E91E63' }]} />
            <View style={styles.balloonString} />
          </Animated.View>

          <Text style={styles.activityTitle}>✏️ Draw the {shapeData.name}!</Text>
          
          <View style={styles.drawBox}>
            <Text style={styles.drawEmoji}>{shapeData.emoji}</Text>
            <Text style={styles.drawHint}>Trace with your finger!</Text>
          </View>

          <TouchableOpacity
            onPress={() => speakWord(`Draw a ${shapeData.name}`)}
            style={[styles.smallListenBtn, { backgroundColor: '#E91E63' }]}
          >
            <Image source={SCREEN_ICONS.speaker} style={styles.speakerIconSmall} />
          </TouchableOpacity>
        </View>

        {/* SECTION 3: Find Objects */}
        <View style={[styles.activityCard, { borderColor: '#27AE60' }]}>
          <Animated.View style={[styles.balloonContainer, { transform: [{ translateY: balloonBounce }] }]}>
            <View style={[styles.balloon, { backgroundColor: '#27AE60' }]}>
              <Text style={styles.balloonEmoji}>🔍</Text>
            </View>
            <View style={[styles.balloonTail, { borderTopColor: '#27AE60' }]} />
            <View style={styles.balloonString} />
          </Animated.View>

          <Text style={styles.activityTitle}>🔍 Things shaped like {shapeData.name}!</Text>

          <View style={styles.objectsContainer}>
            {SHAPE_OBJECTS[shapeData.name]?.map((obj, idx) => (
              <TouchableOpacity 
                key={idx} 
                style={styles.objectItem}
                onPress={() => speakWord(obj.name)}
              >
                <Text style={styles.objectEmoji}>{obj.emoji}</Text>
                <Text style={styles.objectText}>{obj.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* SECTION 4: Real Life Examples */}
        <View style={[styles.activityCard, { borderColor: '#3498DB' }]}>
          <Animated.View style={[styles.balloonContainer, { transform: [{ translateY: balloonBounce }] }]}>
            <View style={[styles.balloon, { backgroundColor: '#3498DB' }]}>
              <Text style={styles.balloonEmoji}>🌍</Text>
            </View>
            <View style={[styles.balloonTail, { borderTopColor: '#3498DB' }]} />
            <View style={styles.balloonString} />
          </Animated.View>

          <Text style={styles.activityTitle}>🌍 In Real Life!</Text>
          
          <View style={styles.examplesContainer}>
            {REAL_LIFE_EXAMPLES[shapeData.name]?.map((example, idx) => (
              <TouchableOpacity 
                key={idx} 
                style={styles.exampleItem}
                onPress={() => speakWord(example.text)}
              >
                <Text style={styles.exampleEmoji}>{example.emoji}</Text>
                <Text style={styles.exampleText}>{example.text}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* SECTION 5: Shape Info */}
        <View style={[styles.activityCard, { borderColor: '#9B59B6' }]}>
          <Animated.View style={[styles.balloonContainer, { transform: [{ translateY: balloonBounce }] }]}>
            <View style={[styles.balloon, { backgroundColor: '#9B59B6' }]}>
              <Text style={styles.balloonEmoji}>📐</Text>
            </View>
            <View style={[styles.balloonTail, { borderTopColor: '#9B59B6' }]} />
            <View style={styles.balloonString} />
          </Animated.View>

          <Text style={styles.activityTitle}>📐 Shape Facts!</Text>
          
          <View style={styles.infoContainer}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Name:</Text>
              <Text style={styles.infoValue}>{shapeData.name}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Sides:</Text>
              <Text style={styles.infoValue}>{shapeData.sides > 0 ? shapeData.sides : 'None (Round)'}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Corners:</Text>
              <Text style={styles.infoValue}>{shapeData.sides > 0 ? shapeData.sides : 'None'}</Text>
            </View>
          </View>

          <TouchableOpacity
            onPress={() => speakWord(`${shapeData.name} has ${shapeData.sides > 0 ? shapeData.sides + ' sides' : 'no sides, it is round'}`)}
            style={[styles.smallListenBtn, { backgroundColor: '#9B59B6' }]}
          >
            <Image source={SCREEN_ICONS.speaker} style={styles.speakerIconSmall} />
          </TouchableOpacity>
        </View>

        {/* SECTION 6: Fun Fact */}
        <View style={[styles.activityCard, { borderColor: '#FF5722', backgroundColor: '#FFF3E0' }]}>
          <Animated.View style={[styles.balloonContainer, { transform: [{ translateY: balloonBounce }] }]}>
            <View style={[styles.balloon, { backgroundColor: '#FF5722' }]}>
              <Text style={styles.balloonEmoji}>💡</Text>
            </View>
            <View style={[styles.balloonTail, { borderTopColor: '#FF5722' }]} />
            <View style={styles.balloonString} />
          </Animated.View>

          <Text style={styles.activityTitle}>💡 Fun Fact!</Text>
          
          <View style={styles.funFactBox}>
            <Text style={styles.funFactText}>{FUN_FACTS[shapeData.name]}</Text>
          </View>

          <TouchableOpacity
            onPress={() => speakWord(FUN_FACTS[shapeData.name])}
            style={[styles.smallListenBtn, { backgroundColor: '#FF5722' }]}
          >
            <Image source={SCREEN_ICONS.speaker} style={styles.speakerIconSmall} />
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
            <Text style={styles.progressText}>{index + 1} / {SHAPES.length}</Text>
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

// Grid Card Component
interface GridCardProps {
  shapeData: ShapeData;
  index: number;
  onPress: () => void;
}

const GridCard: React.FC<GridCardProps> = ({ shapeData, index, onPress }) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const borderColor = CARD_BORDER_COLORS[index % CARD_BORDER_COLORS.length];

  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      delay: index * 25,
      tension: 60,
      friction: 8,
    }).start();
  }, [scaleAnim, index]);

  return (
    <Animated.View style={[styles.gridCard, { transform: [{ scale: scaleAnim }] }]}>
      <TouchableOpacity
        onPress={onPress}
        style={[styles.gridCardInner, { borderColor: borderColor }]}
        activeOpacity={0.8}
      >
        <View style={[styles.gridBalloon, { backgroundColor: shapeData.color }]}>
          <Text style={styles.gridBalloonEmoji}>{shapeData.emoji}</Text>
        </View>

        <Text style={styles.gridName}>{shapeData.name}</Text>
        <Text style={styles.gridSides}>
          {shapeData.sides > 0 ? `${shapeData.sides} sides` : 'Round'}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

// Match Game Component
interface MatchGameProps {
  score: number;
  setScore: (score: number) => void;
}

const MatchGame: React.FC<MatchGameProps> = ({ score, setScore }) => {
  const [matchQuestion, setMatchQuestion] = useState<{ shape: ShapeData; options: ShapeData[] } | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  
  // Celebration animation values
  const celebrationAnim = useRef(new Animated.Value(0)).current;
  const starsScale = useRef(new Animated.Value(0)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const balloonAnims = useRef([
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
  ]).current;

  const generateMatchQuestion = () => {
    const shape = SHAPES[Math.floor(Math.random() * SHAPES.length)];
    const options = [shape];
    
    while (options.length < 4) {
      const wrong = SHAPES[Math.floor(Math.random() * SHAPES.length)];
      if (!options.find(o => o.name === wrong.name)) {
        options.push(wrong);
      }
    }
    for (let i = options.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [options[i], options[j]] = [options[j], options[i]];
    }
    
    // Reset states
    setSelectedAnswer(null);
    setIsCorrect(null);
    setShowCelebration(false);
    setIsLocked(false);
    celebrationAnim.setValue(0);
    starsScale.setValue(0);
    shakeAnim.setValue(0);
    balloonAnims.forEach(anim => anim.setValue(0));
    
    speakWord(`Find the ${shape.name}`);
    setMatchQuestion({ shape, options });
  };

  const handleMatchAnswer = (shape: ShapeData) => {
    if (!matchQuestion || isLocked) return;
    
    setSelectedAnswer(shape.name);
    setIsLocked(true);
    
    if (shape.name === matchQuestion.shape.name) {
      // Correct answer
      setIsCorrect(true);
      setScore(score + 10);
      speakCelebration();
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
      
      setTimeout(() => {
        generateMatchQuestion();
      }, 2000);
    } else {
      // Wrong answer
      setIsCorrect(false);
      speakWord('Try again!');
      
      // Shake animation for wrong answer
      Animated.sequence([
        Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
      ]).start();
      
      // Allow retry after shake animation
      setTimeout(() => {
        setSelectedAnswer(null);
        setIsCorrect(null);
        setIsLocked(false);
      }, 800);
    }
  };

  useEffect(() => {
    generateMatchQuestion();
  }, []);

  if (!matchQuestion) return null;

  const getOptionStyle = (shapeName: string, index: number) => {
    const baseColor = RAINBOW_COLORS[index % RAINBOW_COLORS.length];
    
    if (selectedAnswer === shapeName) {
      if (isCorrect === true) {
        return {
          backgroundColor: '#27AE60',
          borderColor: '#1E8449',
          borderWidth: 4,
          transform: [{ scale: 1.1 }],
        };
      } else if (isCorrect === false) {
        return {
          backgroundColor: '#E74C3C',
          borderColor: '#C0392B',
          borderWidth: 4,
        };
      }
    }
    
    // Show correct answer with green when wrong answer is selected
    if (isCorrect === false && shapeName === matchQuestion.shape.name) {
      return {
        backgroundColor: '#27AE60',
        borderColor: '#1E8449',
        borderWidth: 4,
      };
    }
    
    return { backgroundColor: baseColor };
  };

  return (
    <ScrollView style={styles.matchGameScroll} contentContainerStyle={styles.matchGameScrollContent}>
      <View style={styles.scoreBox}>
        <Image source={SCREEN_ICONS.starGold} style={styles.scoreIcon} resizeMode="contain" />
        <Text style={styles.scoreText}>{score}</Text>
      </View>

      <Animated.View 
        style={[
          styles.matchQuestionCard,
          { transform: [{ translateX: shakeAnim }] }
        ]}
      >
        <Text style={styles.matchInstruction}>Find the {matchQuestion.shape.name}!</Text>
        
        <View style={styles.targetEmojiContainer}>
          <Text style={styles.targetEmoji}>{matchQuestion.shape.emoji}</Text>
        </View>

        <View style={styles.optionsGrid}>
          {matchQuestion.options.map((shape, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => handleMatchAnswer(shape)}
              disabled={isLocked}
              style={[styles.optionButton, getOptionStyle(shape.name, index)]}
            >
              <Text style={styles.optionEmoji}>{shape.emoji}</Text>
              <Text style={styles.optionName}>{shape.name}</Text>
              {/* Show checkmark for correct, X for wrong */}
              {selectedAnswer === shape.name && isCorrect === true && (
                <Text style={styles.feedbackIcon}>✓</Text>
              )}
              {selectedAnswer === shape.name && isCorrect === false && (
                <Text style={styles.feedbackIcon}>✗</Text>
              )}
            </TouchableOpacity>
          ))}
        </View>
        
        {/* Celebration overlay when correct */}
        {showCelebration && (
          <>
            {/* Floating Balloons - rise from bottom */}
            {[
              { left: 10, color: '🎈' },
              { left: 50, color: '🎈' },
              { left: 90, color: '🎈' },
              { right: 90, color: '🎈' },
              { right: 50, color: '🎈' },
              { right: 10, color: '🎈' },
            ].map((balloon, i) => (
              <Animated.Text
                key={`balloon-${i}`}
                style={[
                  styles.celebrationBalloon,
                  { left: balloon.left, right: balloon.right },
                  {
                    transform: [
                      { 
                        translateY: balloonAnims[i].interpolate({
                          inputRange: [0, 1],
                          outputRange: [400, -100],
                        })
                      },
                      {
                        translateX: balloonAnims[i].interpolate({
                          inputRange: [0, 0.5, 1],
                          outputRange: [0, i % 2 === 0 ? 15 : -15, 0],
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
            
            {/* Stars around the card */}
            {[
              { top: 10, left: 20, emoji: '⭐' },
              { top: 30, right: 25, emoji: '🌟' },
              { top: 100, left: 10, emoji: '✨' },
              { top: 150, right: 15, emoji: '⭐' },
              { top: 200, left: 30, emoji: '🌟' },
              { top: 180, right: 35, emoji: '✨' },
            ].map((pos, i) => (
              <Animated.Text
                key={`star-${i}`}
                style={[
                  styles.celebrationStar,
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
                styles.celebrationBadge,
                {
                  transform: [{ scale: celebrationAnim }],
                  opacity: celebrationAnim,
                }
              ]}
            >
              <Text style={styles.celebrationEmoji}>🎉</Text>
              <Text style={styles.celebrationText}>Correct!</Text>
              <Text style={styles.celebrationEmoji}>🎉</Text>
            </Animated.View>
          </>
        )}
      </Animated.View>
      
      {/* Wrong answer feedback message */}
      {isCorrect === false && (
        <View style={styles.wrongFeedbackBox}>
          <Text style={styles.wrongFeedbackText}>❌ Oops! That's a {selectedAnswer}. Find the {matchQuestion.shape.name}! 💪</Text>
        </View>
      )}
    </ScrollView>
  );
};

interface ShapesScreenProps {
  navigation: any;
}

export const ShapesScreen: React.FC<ShapesScreenProps> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'flashcard' | 'match'>('grid');
  const [score, setScore] = useState(0);

  const openFlashcard = (index: number) => {
    setSelectedIndex(index);
    setViewMode('flashcard');
  };

  const closeFlashcard = () => {
    stopSpeaking();
    setSelectedIndex(null);
    setViewMode('grid');
  };

  const goToPrevious = () => {
    if (selectedIndex !== null && selectedIndex > 0) {
      setSelectedIndex(selectedIndex - 1);
    }
  };

  const goToNext = () => {
    if (selectedIndex !== null && selectedIndex < SHAPES.length - 1) {
      setSelectedIndex(selectedIndex + 1);
    }
  };

  useEffect(() => {
    return () => stopSpeaking();
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Beautiful Kid-Friendly Background */}
      <View style={styles.skyBackground}>
        <Image source={BG_IMAGES.sun} style={styles.bgSun} />
        <Image source={BG_IMAGES.cloud} style={styles.bgCloud1} />
        <Image source={BG_IMAGES.cloud} style={styles.bgCloud2} />
        <Image source={BG_IMAGES.cloud} style={styles.bgCloud3} />
        <Image source={BG_IMAGES.rainbow} style={styles.bgRainbow} />
        <Image source={BG_IMAGES.star} style={styles.bgStar1} />
        <Image source={BG_IMAGES.star} style={styles.bgStar2} />
        <Image source={BG_IMAGES.sparkle} style={styles.bgSparkle1} />
        <Image source={BG_IMAGES.sparkle} style={styles.bgSparkle2} />
        <Image source={BG_IMAGES.bird} style={styles.bgBird1} />
        <Image source={BG_IMAGES.bird} style={styles.bgBird2} />
        <Image source={BG_IMAGES.butterfly} style={styles.bgButterfly} />
      </View>

      {/* Grass with flowers */}
      <View style={styles.grassBackground}>
        <Image source={BG_IMAGES.tree} style={styles.bgTree1} />
        <Image source={BG_IMAGES.tree} style={styles.bgTree2} />
        <Image source={BG_IMAGES.flower} style={styles.bgFlower1} />
        <Image source={BG_IMAGES.tulip} style={styles.bgFlower2} />
        <Image source={BG_IMAGES.flower} style={styles.bgFlower3} />
        <Image source={BG_IMAGES.tulip} style={styles.bgFlower4} />
        <Image source={BG_IMAGES.bee} style={styles.bgBee} />
        <Image source={BG_IMAGES.ladybug} style={styles.bgLadybug} />
      </View>

      {/* Mute Button - Top Right */}
      <MuteButton style={{ position: 'absolute', right: 15, top: insets.top + 15, zIndex: 100 }} size="medium" />

      {viewMode === 'grid' ? (
        <>
          <View style={[styles.header, { marginTop: insets.top + 10 }]}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
              <Text style={styles.backText}>← Back</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>🔷 Shapes</Text>
            <View style={styles.headerSpace} />
          </View>

          {/* Mode Toggle */}
          <View style={styles.modeToggle}>
            <TouchableOpacity
              style={[styles.modeButton, viewMode === 'grid' && styles.modeButtonActive]}
              onPress={() => setViewMode('grid')}
            >
              <Image source={SCREEN_ICONS.book} style={[styles.modeIcon, viewMode === 'grid' && styles.modeIconActive]} resizeMode="contain" />
              <Text style={[styles.modeText, viewMode === 'grid' && styles.modeTextActive]}>Learn</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modeButton, viewMode === 'match' && styles.modeButtonActive]}
              onPress={() => setViewMode('match')}
            >
              <Image source={SCREEN_ICONS.gamepad} style={[styles.modeIcon, viewMode === 'match' && styles.modeIconActive]} resizeMode="contain" />
              <Text style={[styles.modeText, viewMode === 'match' && styles.modeTextActive]}>Match</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.instructionBox}>
            <Text style={styles.instructionText}>✨ Tap to learn shapes! ✨</Text>
          </View>

          <ScrollView contentContainerStyle={styles.gridContainer} showsVerticalScrollIndicator={false}>
            <View style={styles.gridWrapper}>
              {SHAPES.map((shape, index) => (
                <GridCard
                  key={shape.name}
                  shapeData={shape}
                  index={index}
                  onPress={() => openFlashcard(index)}
                />
              ))}
            </View>
          </ScrollView>
        </>
      ) : viewMode === 'match' ? (
        <>
          <View style={[styles.header, { marginTop: insets.top + 10 }]}>
            <TouchableOpacity onPress={() => setViewMode('grid')} style={styles.backBtn}>
              <Text style={styles.backText}>← Back</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>🎮 Match Game</Text>
            <View style={styles.headerSpace} />
          </View>

          <MatchGame score={score} setScore={setScore} />
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
              shapeData={SHAPES[selectedIndex]}
              index={selectedIndex}
              onPrevious={goToPrevious}
              onNext={goToNext}
              hasPrevious={selectedIndex > 0}
              hasNext={selectedIndex < SHAPES.length - 1}
            />
          )}
        </>
      )}
    </View>
  );
};

const CARD_WIDTH = (width - 40) / 2;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFB6C1',
  },
  skyBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: height * 0.75,
    backgroundColor: '#FFB6C1',
  },
  bgSun: {
    position: 'absolute',
    top: 40,
    right: 20,
    width: 60,
    height: 60,
  },
  bgCloud1: {
    position: 'absolute',
    top: 70,
    left: 10,
    width: 50,
    height: 50,
    opacity: 0.9,
  },
  bgCloud2: {
    position: 'absolute',
    top: 50,
    left: width * 0.35,
    width: 45,
    height: 45,
    opacity: 0.8,
  },
  bgCloud3: {
    position: 'absolute',
    top: 90,
    right: 80,
    width: 40,
    height: 40,
    opacity: 0.7,
  },
  bgRainbow: {
    position: 'absolute',
    top: 120,
    left: width * 0.3,
    width: 70,
    height: 70,
    opacity: 0.6,
  },
  bgStar1: {
    position: 'absolute',
    top: 100,
    left: 50,
    width: 25,
    height: 25,
    opacity: 0.7,
  },
  bgStar2: {
    position: 'absolute',
    top: 140,
    right: 40,
    width: 20,
    height: 20,
    opacity: 0.6,
  },
  bgSparkle1: {
    position: 'absolute',
    top: 160,
    left: 30,
    width: 22,
    height: 22,
    opacity: 0.7,
  },
  bgSparkle2: {
    position: 'absolute',
    top: 130,
    right: 120,
    width: 18,
    height: 18,
    opacity: 0.6,
  },
  bgBird1: {
    position: 'absolute',
    top: 80,
    left: width * 0.6,
    width: 30,
    height: 30,
  },
  bgBird2: {
    position: 'absolute',
    top: 110,
    left: width * 0.7,
    width: 25,
    height: 25,
    opacity: 0.8,
  },
  bgButterfly: {
    position: 'absolute',
    top: 180,
    right: 30,
    width: 35,
    height: 35,
  },
  grassBackground: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: height * 0.25,
    backgroundColor: '#98D8AA',
    borderTopLeftRadius: 50,
    borderTopRightRadius: 50,
  },
  bgTree1: {
    position: 'absolute',
    top: -30,
    left: 10,
    width: 50,
    height: 50,
  },
  bgTree2: {
    position: 'absolute',
    top: -25,
    right: 15,
    width: 45,
    height: 45,
  },
  bgFlower1: {
    position: 'absolute',
    top: 20,
    left: 60,
    width: 30,
    height: 30,
  },
  bgFlower2: {
    position: 'absolute',
    top: 30,
    left: 120,
    width: 28,
    height: 28,
  },
  bgFlower3: {
    position: 'absolute',
    top: 25,
    right: 80,
    width: 30,
    height: 30,
  },
  bgFlower4: {
    position: 'absolute',
    top: 35,
    right: 130,
    width: 26,
    height: 26,
  },
  bgBee: {
    position: 'absolute',
    top: 10,
    left: width * 0.4,
    width: 28,
    height: 28,
  },
  bgLadybug: {
    position: 'absolute',
    top: 45,
    right: 60,
    width: 25,
    height: 25,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    marginBottom: 10,
    zIndex: 10,
  },
  backBtn: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 20,
  },
  backText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.purple,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#fff',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  headerSpace: { width: 80 },
  modeToggle: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 10,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 25,
    padding: 4,
    zIndex: 10,
  },
  modeButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 22,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  modeButtonActive: {
    backgroundColor: COLORS.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  modeIcon: {
    width: 20,
    height: 20,
    tintColor: COLORS.gray,
  },
  modeIconActive: {
    tintColor: COLORS.purple,
  },
  modeText: { fontSize: 16, fontWeight: '600', color: COLORS.gray },
  modeTextActive: { color: COLORS.purple },
  instructionBox: {
    backgroundColor: '#FFD700',
    marginHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    alignItems: 'center',
    marginBottom: 10,
    zIndex: 10,
  },
  instructionText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#333',
  },
  gridContainer: {
    paddingHorizontal: 8,
    paddingBottom: 50,
  },
  gridWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  gridCard: {
    width: CARD_WIDTH,
    margin: 6,
  },
  gridCardInner: {
    backgroundColor: '#fff',
    borderRadius: 18,
    borderWidth: 4,
    padding: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 6,
  },
  gridBalloon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  gridBalloonEmoji: {
    fontSize: 32,
  },
  gridName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginBottom: 4,
  },
  gridSides: {
    fontSize: 12,
    fontWeight: '600',
    color: '#888',
  },
  // Flashcard styles
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
    paddingTop: 50,
  },
  flashcardContainer: {
    alignItems: 'center',
  },
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
  balloonEmoji: {
    fontSize: 28,
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
  shapeHighlight: {
    fontSize: 36,
    fontWeight: '900',
    textShadowColor: 'rgba(0,0,0,0.1)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  emojiDisplayContainer: {
    backgroundColor: '#F0F8FF',
    borderRadius: 20,
    padding: 25,
    marginBottom: 18,
    borderWidth: 3,
    borderColor: '#E0E8F0',
  },
  emojiDisplay: {
    fontSize: 80,
    textAlign: 'center',
  },
  sidesInfoBox: {
    backgroundColor: '#E8F8E8',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 15,
    marginBottom: 18,
  },
  sidesInfoText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#27AE60',
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
  // Activity Card styles
  activityCard: {
    width: width - 30,
    backgroundColor: '#fff',
    borderRadius: 22,
    borderWidth: 4,
    padding: 20,
    alignItems: 'center',
    marginBottom: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  activityTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#333',
    marginTop: 25,
    marginBottom: 15,
  },
  // Draw box
  drawBox: {
    backgroundColor: '#FFF0F5',
    paddingHorizontal: 50,
    paddingVertical: 30,
    borderRadius: 20,
    marginBottom: 12,
    borderWidth: 3,
    borderColor: '#FFB6C1',
    alignItems: 'center',
  },
  drawEmoji: {
    fontSize: 80,
  },
  drawHint: {
    fontSize: 14,
    fontWeight: '600',
    color: '#888',
    marginTop: 10,
  },
  // Objects container
  objectsContainer: {
    width: '100%',
    gap: 10,
  },
  objectItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F8E8',
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 15,
    gap: 12,
  },
  objectEmoji: {
    fontSize: 32,
  },
  objectText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    flex: 1,
  },
  // Small listen button
  smallListenBtn: {
    width: 55,
    height: 55,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 5,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  speakerIconSmall: {
    width: 26,
    height: 26,
    tintColor: '#fff',
  },
  // Real life examples
  examplesContainer: {
    width: '100%',
    gap: 10,
  },
  exampleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F4FF',
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 15,
    gap: 12,
  },
  exampleEmoji: {
    fontSize: 32,
  },
  exampleText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    flex: 1,
  },
  // Info container
  infoContainer: {
    width: '100%',
    backgroundColor: '#F8F0FF',
    borderRadius: 15,
    padding: 15,
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E8E0F0',
  },
  infoLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#9B59B6',
  },
  // Fun fact
  funFactBox: {
    backgroundColor: '#FFF8E1',
    paddingHorizontal: 18,
    paddingVertical: 15,
    borderRadius: 15,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#FFE0B2',
    borderStyle: 'dashed',
  },
  funFactText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#E65100',
    textAlign: 'center',
    lineHeight: 24,
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
  // Match Game Styles
  matchGameScroll: {
    flex: 1,
  },
  matchGameScrollContent: {
    paddingHorizontal: 15,
    paddingBottom: 50,
    paddingTop: 10,
  },
  scoreBox: {
    alignSelf: 'flex-end',
    backgroundColor: '#FFD700',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  scoreIcon: {
    width: 22,
    height: 22,
  },
  scoreText: { fontSize: 18, fontWeight: 'bold', color: COLORS.black },
  matchQuestionCard: {
    backgroundColor: '#fff',
    borderRadius: 25,
    borderWidth: 4,
    borderColor: '#9B59B6',
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  matchInstruction: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.purple,
    textAlign: 'center',
    marginBottom: 20,
  },
  targetEmojiContainer: {
    backgroundColor: '#F0F8FF',
    borderRadius: 20,
    padding: 25,
    marginBottom: 25,
    borderWidth: 3,
    borderColor: '#E0E8F0',
  },
  targetEmoji: {
    fontSize: 80,
    textAlign: 'center',
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
    width: '100%',
  },
  optionButton: {
    width: (width - 80) / 2,
    height: 90,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  optionEmoji: {
    fontSize: 40,
  },
  optionName: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.white,
    marginTop: 4,
  },
  feedbackIcon: {
    position: 'absolute',
    top: -5,
    right: -5,
    fontSize: 24,
    fontWeight: '900',
    color: '#fff',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  celebrationBalloon: {
    position: 'absolute',
    fontSize: 40,
    zIndex: 15,
  },
  celebrationStar: {
    position: 'absolute',
    fontSize: 30,
    zIndex: 10,
  },
  celebrationBadge: {
    position: 'absolute',
    top: '40%',
    alignSelf: 'center',
    backgroundColor: '#FFD700',
    paddingHorizontal: 25,
    paddingVertical: 15,
    borderRadius: 30,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
    zIndex: 20,
    gap: 8,
  },
  celebrationEmoji: {
    fontSize: 28,
  },
  celebrationText: {
    fontSize: 24,
    fontWeight: '900',
    color: '#333',
  },
  wrongFeedbackBox: {
    backgroundColor: '#FDEDEC',
    marginHorizontal: 10,
    marginTop: 15,
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 15,
    borderWidth: 3,
    borderColor: '#E74C3C',
    alignItems: 'center',
  },
  wrongFeedbackText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#C0392B',
    textAlign: 'center',
  },
});
