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
  PanResponder,
  GestureResponderEvent,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '../constants/colors';
import { NUMBERS } from '../constants/gameData';
import { speakNumber, stopSpeaking, speakCelebration, speakWord } from '../utils/speech';
import { SCREEN_ICONS } from '../assets/images';
import { MuteButton } from '../components';

// Tab Type
type TabType = 'learn' | 'write' | 'count';

const { width, height } = Dimensions.get('window');

// Twemoji images for numbers
const NUMBER_IMAGES: Record<number, { uri: string }> = {
  1: { uri: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/31-fe0f-20e3.png' }, // 1️⃣
  2: { uri: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/32-fe0f-20e3.png' }, // 2️⃣
  3: { uri: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/33-fe0f-20e3.png' }, // 3️⃣
  4: { uri: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/34-fe0f-20e3.png' }, // 4️⃣
  5: { uri: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/35-fe0f-20e3.png' }, // 5️⃣
  6: { uri: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/36-fe0f-20e3.png' }, // 6️⃣
  7: { uri: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/37-fe0f-20e3.png' }, // 7️⃣
  8: { uri: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/38-fe0f-20e3.png' }, // 8️⃣
  9: { uri: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/39-fe0f-20e3.png' }, // 9️⃣
  10: { uri: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f51f.png' }, // 🔟
};

// Object images for counting
const OBJECT_IMAGES: Record<string, { uri: string }> = {
  '🍎': { uri: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f34e.png' },
  '⭐': { uri: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/2b50.png' },
  '🌸': { uri: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f338.png' },
  '🐱': { uri: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f431.png' },
  '🎈': { uri: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f388.png' },
  '💎': { uri: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f48e.png' },
  '🦋': { uri: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f98b.png' },
  '🌻': { uri: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f33b.png' },
  '🍪': { uri: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f36a.png' },
  '🎁': { uri: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f381.png' },
};

// Colors
const BALLOON_COLORS = ['#E74C3C', '#27AE60', '#3498DB', '#9B59B6', '#F39C12', '#1ABC9C', '#E91E63', '#FF5722', '#00BCD4', '#8BC34A'];
const CARD_BORDER_COLORS = ['#FF6B6B', '#27AE60', '#3498DB', '#9B59B6', '#F39C12', '#1ABC9C', '#E91E63', '#FF5722', '#00BCD4', '#8BC34A'];

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

interface NumberData {
  num: number;
  word: string;
  objects: string;
  objectName?: string;
}

// Hand/Finger emojis for counting
const FINGER_COUNT: Record<number, string> = {
  1: '☝️',
  2: '✌️',
  3: '🤟',
  4: '🖖',
  5: '🖐️',
  6: '🖐️☝️',
  7: '🖐️✌️',
  8: '🖐️🤟',
  9: '🖐️🖖',
  10: '🖐️🖐️',
};

// Real life examples for each number
const REAL_LIFE_EXAMPLES: Record<number, { emoji: string; text: string }[]> = {
  1: [
    { emoji: '☀️', text: '1 Sun' },
    { emoji: '👃', text: '1 Nose' },
    { emoji: '🌙', text: '1 Moon' },
  ],
  2: [
    { emoji: '👀', text: '2 Eyes' },
    { emoji: '👂', text: '2 Ears' },
    { emoji: '🦶', text: '2 Feet' },
  ],
  3: [
    { emoji: '🚦', text: '3 Traffic Lights' },
    { emoji: '🎄', text: '3 Decorations' },
    { emoji: '🏅', text: '3 Medals (Gold, Silver, Bronze)' },
  ],
  4: [
    { emoji: '🚗', text: '4 Car Wheels' },
    { emoji: '🐕', text: '4 Dog Legs' },
    { emoji: '🍀', text: '4 Leaf Clover' },
  ],
  5: [
    { emoji: '✋', text: '5 Fingers' },
    { emoji: '⭐', text: '5 Star Points' },
    { emoji: '🦶', text: '5 Toes' },
  ],
  6: [
    { emoji: '🐜', text: '6 Ant Legs' },
    { emoji: '🎲', text: '6 Dice Sides' },
    { emoji: '🍯', text: '6 Honeycomb Sides' },
  ],
  7: [
    { emoji: '🌈', text: '7 Rainbow Colors' },
    { emoji: '📅', text: '7 Days in Week' },
    { emoji: '🎵', text: '7 Music Notes' },
  ],
  8: [
    { emoji: '🐙', text: '8 Octopus Arms' },
    { emoji: '🕷️', text: '8 Spider Legs' },
    { emoji: '🎱', text: '8 Ball' },
  ],
  9: [
    { emoji: '🎳', text: '9 Bowling Pins' },
    { emoji: '⚾', text: '9 Baseball Players' },
    { emoji: '🪐', text: '9 Planets (with Pluto!)' },
  ],
  10: [
    { emoji: '🖐️', text: '10 Fingers (Both Hands)' },
    { emoji: '🦶', text: '10 Toes (Both Feet)' },
    { emoji: '🎳', text: '10 Bowling Pins' },
  ],
};

// Fun facts for each number
const FUN_FACTS: Record<number, string> = {
  1: 'One is the loneliest number, but also the first! Everything starts with ONE! 🌟',
  2: 'Two makes a pair! Like your shoes, socks, and gloves! 👟👟',
  3: 'Three Little Pigs, Three Bears, Three is a magic number! ✨',
  4: 'A square has 4 sides! Tables and chairs have 4 legs! 🪑',
  5: 'High five! ✋ You have 5 fingers on each hand!',
  6: 'Bees make honeycombs with 6 sides! 🐝 Hexagon is a 6-sided shape!',
  7: 'There are 7 colors in a rainbow! 🌈 VIBGYOR!',
  8: 'Turn 8 sideways and it looks like infinity! ∞',
  9: 'A cat has 9 lives! 🐱 9 is the biggest single digit!',
  10: 'Perfect 10! 🎯 We have 10 fingers and 10 toes!',
};

// Different counting objects for each number - Fruits & Vegetables
const COUNTING_OBJECTS: Record<number, { emoji: string; name: string; color: string }> = {
  1: { emoji: '🍎', name: 'apple', color: '#E74C3C' },
  2: { emoji: '🍌', name: 'banana', color: '#F1C40F' },
  3: { emoji: '🍊', name: 'orange', color: '#E67E22' },
  4: { emoji: '🍇', name: 'grape', color: '#9B59B6' },
  5: { emoji: '🍓', name: 'strawberry', color: '#E91E63' },
  6: { emoji: '🥕', name: 'carrot', color: '#E67E22' },
  7: { emoji: '🍉', name: 'watermelon', color: '#27AE60' },
  8: { emoji: '🥒', name: 'cucumber', color: '#27AE60' },
  9: { emoji: '🍋', name: 'lemon', color: '#F1C40F' },
  10: { emoji: '🍅', name: 'tomato', color: '#E74C3C' },
};

// Different items for different activities - More Fruits, Veggies & Animals
const ACTIVITY_ITEMS: Record<number, { 
  count: { emoji: string; name: string };
  collect: { emoji: string; name: string };
  share: { emoji: string; name: string };
}> = {
  1: { 
    count: { emoji: '🐰', name: 'bunny' },
    collect: { emoji: '🥭', name: 'mango' },
    share: { emoji: '🧁', name: 'cupcake' },
  },
  2: { 
    count: { emoji: '🐱', name: 'cat' },
    collect: { emoji: '🍑', name: 'peach' },
    share: { emoji: '🍩', name: 'donut' },
  },
  3: { 
    count: { emoji: '🐶', name: 'puppy' },
    collect: { emoji: '🍐', name: 'pear' },
    share: { emoji: '🍕', name: 'pizza slice' },
  },
  4: { 
    count: { emoji: '🐸', name: 'frog' },
    collect: { emoji: '🥝', name: 'kiwi' },
    share: { emoji: '🍦', name: 'ice cream' },
  },
  5: { 
    count: { emoji: '🦄', name: 'unicorn' },
    collect: { emoji: '🍒', name: 'cherry' },
    share: { emoji: '🍫', name: 'chocolate' },
  },
  6: { 
    count: { emoji: '🐝', name: 'bee' },
    collect: { emoji: '🥦', name: 'broccoli' },
    share: { emoji: '🧃', name: 'juice box' },
  },
  7: { 
    count: { emoji: '🦁', name: 'lion' },
    collect: { emoji: '🌽', name: 'corn' },
    share: { emoji: '🥤', name: 'smoothie' },
  },
  8: { 
    count: { emoji: '🐙', name: 'octopus' },
    collect: { emoji: '🥬', name: 'lettuce' },
    share: { emoji: '🍿', name: 'popcorn' },
  },
  9: { 
    count: { emoji: '🦊', name: 'fox' },
    collect: { emoji: '🫐', name: 'blueberry' },
    share: { emoji: '🥧', name: 'pie' },
  },
  10: { 
    count: { emoji: '🐼', name: 'panda' },
    collect: { emoji: '🍆', name: 'eggplant' },
    share: { emoji: '🎂', name: 'birthday cake' },
  },
};

// Flashcard Component
interface FlashcardProps {
  numberData: NumberData;
  index: number;
  onPrevious: () => void;
  onNext: () => void;
  hasPrevious: boolean;
  hasNext: boolean;
}

const Flashcard: React.FC<FlashcardProps> = ({
  numberData,
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
  const num = numberData.num;

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

    speakNumber(numberData.num);
  }, [numberData, cardAnim, balloonBounce]);

  // Get addition examples for the number
  const getAdditionExamples = () => {
    const examples = [];
    for (let i = 0; i <= Math.floor(num / 2); i++) {
      if (i + (num - i) === num) {
        examples.push({ a: i, b: num - i });
      }
    }
    return examples.slice(0, 3); // Max 3 examples
  };

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
        {/* SECTION 1: Number Card */}
        <View style={[styles.sectionCard, { borderColor: borderColor }]}>
          <Animated.View style={[styles.balloonContainer, { transform: [{ translateY: balloonBounce }] }]}>
            <View style={[styles.balloon, { backgroundColor: balloonColor }]}>
              <Text style={styles.balloonNumber}>{numberData.num}</Text>
            </View>
            <View style={[styles.balloonTail, { borderTopColor: balloonColor }]} />
            <View style={styles.balloonString} />
          </Animated.View>

          <Text style={styles.forText}>
            <Text style={[styles.numberHighlight, { color: balloonColor }]}>{numberData.num}</Text>
            {' = '}
            <Text style={styles.wordHighlight}>{numberData.word}</Text>
          </Text>

          <View style={styles.objectsDisplayContainer}>
            <Text style={styles.objectsDisplay}>{numberData.objects}</Text>
          </View>

          <TouchableOpacity
            onPress={() => speakNumber(numberData.num)}
            style={[styles.listenBtn, { backgroundColor: balloonColor }]}
          >
            <Image source={SCREEN_ICONS.speaker} style={styles.speakerIconLarge} />
          </TouchableOpacity>
        </View>

        {/* SECTION 2: Finger Counting */}
        <View style={[styles.activityCard, { borderColor: '#E91E63' }]}>
          <Animated.View style={[styles.balloonContainer, { transform: [{ translateY: balloonBounce }] }]}>
            <View style={[styles.balloon, { backgroundColor: '#E91E63' }]}>
              <Text style={styles.balloonNumber}>✋</Text>
            </View>
            <View style={[styles.balloonTail, { borderTopColor: '#E91E63' }]} />
            <View style={styles.balloonString} />
          </Animated.View>

          <Text style={styles.activityTitle}>✋ Show with Fingers!</Text>
          
          <View style={styles.fingerDisplayBox}>
            <Text style={styles.fingerEmoji}>{FINGER_COUNT[num]}</Text>
          </View>
          
          <Text style={styles.activitySubtext}>
            Hold up {num} {num === 1 ? 'finger' : 'fingers'}!
          </Text>

          <TouchableOpacity
            onPress={() => speakWord(`Show ${num} ${num === 1 ? 'finger' : 'fingers'}`)}
            style={[styles.smallListenBtn, { backgroundColor: '#E91E63' }]}
          >
            <Image source={SCREEN_ICONS.speaker} style={styles.speakerIconSmall} />
          </TouchableOpacity>
        </View>

        {/* SECTION 3: Count with me */}
        <View style={[styles.activityCard, { borderColor: COUNTING_OBJECTS[num].color }]}>
          <Animated.View style={[styles.balloonContainer, { transform: [{ translateY: balloonBounce }] }]}>
            <View style={[styles.balloon, { backgroundColor: COUNTING_OBJECTS[num].color }]}>
              <Text style={styles.balloonNumber}>{COUNTING_OBJECTS[num].emoji}</Text>
            </View>
            <View style={[styles.balloonTail, { borderTopColor: COUNTING_OBJECTS[num].color }]} />
            <View style={styles.balloonString} />
          </Animated.View>

          <Text style={styles.activityTitle}>🎯 Count the {COUNTING_OBJECTS[num].name}s!</Text>

          <View style={styles.countingRow}>
            {Array.from({ length: num }, (_, i) => (
              <View key={i} style={styles.countingItem}>
                <Text style={styles.countingEmoji}>{COUNTING_OBJECTS[num].emoji}</Text>
                <Text style={styles.countingNumber}>{i + 1}</Text>
              </View>
            ))}
          </View>

          <View style={styles.resultTextBox}>
            <Text style={styles.resultText}>
              " {num} {num === 1 ? COUNTING_OBJECTS[num].name : COUNTING_OBJECTS[num].name + 's'}! "
            </Text>
          </View>

          <TouchableOpacity
            onPress={() => speakWord(`${num} ${num === 1 ? COUNTING_OBJECTS[num].name : COUNTING_OBJECTS[num].name + 's'}`)}
            style={[styles.smallListenBtn, { backgroundColor: COUNTING_OBJECTS[num].color }]}
          >
            <Image source={SCREEN_ICONS.speaker} style={styles.speakerIconSmall} />
          </TouchableOpacity>
        </View>

        {/* SECTION 3.5: Collect Items */}
        <View style={[styles.activityCard, { borderColor: '#1ABC9C' }]}>
          <Animated.View style={[styles.balloonContainer, { transform: [{ translateY: balloonBounce }] }]}>
            <View style={[styles.balloon, { backgroundColor: '#1ABC9C' }]}>
              <Text style={styles.balloonNumber}>🧺</Text>
            </View>
            <View style={[styles.balloonTail, { borderTopColor: '#1ABC9C' }]} />
            <View style={styles.balloonString} />
          </Animated.View>

          <Text style={styles.activityTitle}>🧺 Collect {num} {ACTIVITY_ITEMS[num].collect.name}s!</Text>

          <View style={styles.collectContainer}>
            <View style={styles.basketRow}>
              {Array.from({ length: num }, (_, i) => (
                <Text key={i} style={styles.collectEmoji}>{ACTIVITY_ITEMS[num].collect.emoji}</Text>
              ))}
            </View>
            <View style={styles.basketIcon}>
              <Text style={styles.basketEmoji}>🧺</Text>
            </View>
          </View>

          <View style={styles.resultTextBox}>
            <Text style={styles.resultText}>
              I collected {num} {ACTIVITY_ITEMS[num].collect.name}{num > 1 ? 's' : ''}!
            </Text>
          </View>

          <TouchableOpacity
            onPress={() => speakWord(`I collected ${num} ${ACTIVITY_ITEMS[num].collect.name}${num > 1 ? 's' : ''}`)}
            style={[styles.smallListenBtn, { backgroundColor: '#1ABC9C' }]}
          >
            <Image source={SCREEN_ICONS.speaker} style={styles.speakerIconSmall} />
          </TouchableOpacity>
        </View>

        {/* SECTION 3.7: Count Animals */}
        <View style={[styles.activityCard, { borderColor: '#F39C12' }]}>
          <Animated.View style={[styles.balloonContainer, { transform: [{ translateY: balloonBounce }] }]}>
            <View style={[styles.balloon, { backgroundColor: '#F39C12' }]}>
              <Text style={styles.balloonNumber}>🐾</Text>
            </View>
            <View style={[styles.balloonTail, { borderTopColor: '#F39C12' }]} />
            <View style={styles.balloonString} />
          </Animated.View>

          <Text style={styles.activityTitle}>🐾 Count {num} {ACTIVITY_ITEMS[num].count.name}{num > 1 ? 's' : ''}!</Text>

          <View style={styles.animalContainer}>
            {Array.from({ length: num }, (_, i) => (
              <View key={i} style={styles.animalItem}>
                <Text style={styles.animalEmoji}>{ACTIVITY_ITEMS[num].count.emoji}</Text>
              </View>
            ))}
          </View>

          <TouchableOpacity
            onPress={() => speakWord(`${num} ${ACTIVITY_ITEMS[num].count.name}${num > 1 ? 's' : ''}`)}
            style={[styles.smallListenBtn, { backgroundColor: '#F39C12' }]}
          >
            <Image source={SCREEN_ICONS.speaker} style={styles.speakerIconSmall} />
          </TouchableOpacity>
        </View>

        {/* SECTION 4: Yummy Food */}
        <View style={[styles.activityCard, { borderColor: '#E91E63' }]}>
          <Animated.View style={[styles.balloonContainer, { transform: [{ translateY: balloonBounce }] }]}>
            <View style={[styles.balloon, { backgroundColor: '#E91E63' }]}>
              <Text style={styles.balloonNumber}>🍽️</Text>
            </View>
            <View style={[styles.balloonTail, { borderTopColor: '#E91E63' }]} />
            <View style={styles.balloonString} />
          </Animated.View>

          <Text style={styles.activityTitle}>🍽️ Yummy! {num} {ACTIVITY_ITEMS[num].share.name}{num > 1 ? 's' : ''}!</Text>

          <View style={styles.foodContainer}>
            <View style={styles.plateIcon}>
              <Text style={styles.plateEmoji}>🍽️</Text>
            </View>
            <View style={styles.foodRow}>
              {Array.from({ length: num }, (_, i) => (
                <Text key={i} style={styles.foodEmoji}>{ACTIVITY_ITEMS[num].share.emoji}</Text>
              ))}
            </View>
          </View>

          <View style={[styles.resultTextBox, { borderColor: '#E91E63' }]}>
            <Text style={styles.resultText}>
              Yum! {num} yummy {ACTIVITY_ITEMS[num].share.name}{num > 1 ? 's' : ''}! 😋
            </Text>
          </View>

          <TouchableOpacity
            onPress={() => speakWord(`Yum! ${num} yummy ${ACTIVITY_ITEMS[num].share.name}${num > 1 ? 's' : ''}`)}
            style={[styles.smallListenBtn, { backgroundColor: '#E91E63' }]}
          >
            <Image source={SCREEN_ICONS.speaker} style={styles.speakerIconSmall} />
          </TouchableOpacity>
        </View>

        {/* SECTION 5: Real Life Examples */}
        <View style={[styles.activityCard, { borderColor: '#27AE60' }]}>
          <Animated.View style={[styles.balloonContainer, { transform: [{ translateY: balloonBounce }] }]}>
            <View style={[styles.balloon, { backgroundColor: '#27AE60' }]}>
              <Text style={styles.balloonNumber}>🌍</Text>
            </View>
            <View style={[styles.balloonTail, { borderTopColor: '#27AE60' }]} />
            <View style={styles.balloonString} />
          </Animated.View>

          <Text style={styles.activityTitle}>🌍 In Real Life!</Text>
          
          <View style={styles.examplesContainer}>
            {REAL_LIFE_EXAMPLES[num]?.map((example, idx) => (
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

        {/* SECTION 5: Simple Addition */}
        <View style={[styles.activityCard, { borderColor: '#3498DB' }]}>
          <Animated.View style={[styles.balloonContainer, { transform: [{ translateY: balloonBounce }] }]}>
            <View style={[styles.balloon, { backgroundColor: '#3498DB' }]}>
              <Text style={styles.balloonNumber}>➕</Text>
            </View>
            <View style={[styles.balloonTail, { borderTopColor: '#3498DB' }]} />
            <View style={styles.balloonString} />
          </Animated.View>

          <Text style={styles.activityTitle}>➕ Make {num}!</Text>
          
          <View style={styles.mathContainer}>
            {getAdditionExamples().map((ex, idx) => (
              <TouchableOpacity 
                key={idx} 
                style={styles.mathRow}
                onPress={() => speakWord(`${ex.a} plus ${ex.b} equals ${num}`)}
              >
                <View style={[styles.mathBubble, { backgroundColor: '#E74C3C' }]}>
                  <Text style={styles.mathNumber}>{ex.a}</Text>
                </View>
                <Text style={styles.mathOperator}>+</Text>
                <View style={[styles.mathBubble, { backgroundColor: '#27AE60' }]}>
                  <Text style={styles.mathNumber}>{ex.b}</Text>
                </View>
                <Text style={styles.mathOperator}>=</Text>
                <View style={[styles.mathBubble, { backgroundColor: '#3498DB' }]}>
                  <Text style={styles.mathNumber}>{num}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* SECTION 6: Number Neighbors */}
        <View style={[styles.activityCard, { borderColor: '#9B59B6' }]}>
          <Animated.View style={[styles.balloonContainer, { transform: [{ translateY: balloonBounce }] }]}>
            <View style={[styles.balloon, { backgroundColor: '#9B59B6' }]}>
              <Text style={styles.balloonNumber}>🔢</Text>
            </View>
            <View style={[styles.balloonTail, { borderTopColor: '#9B59B6' }]} />
            <View style={styles.balloonString} />
          </Animated.View>

          <Text style={styles.activityTitle}>🔢 Number Neighbors!</Text>
          
          <View style={styles.neighborsContainer}>
            <View style={styles.neighborBox}>
              <Text style={styles.neighborLabel}>Before</Text>
              <View style={[styles.neighborCircle, { backgroundColor: '#95A5A6' }]}>
                <Text style={styles.neighborNumber}>{num > 1 ? num - 1 : '—'}</Text>
              </View>
            </View>
            
            <View style={styles.neighborBox}>
              <Text style={styles.neighborLabel}>Number</Text>
              <View style={[styles.neighborCircle, { backgroundColor: balloonColor }]}>
                <Text style={styles.neighborNumber}>{num}</Text>
              </View>
            </View>
            
            <View style={styles.neighborBox}>
              <Text style={styles.neighborLabel}>After</Text>
              <View style={[styles.neighborCircle, { backgroundColor: '#95A5A6' }]}>
                <Text style={styles.neighborNumber}>{num < 10 ? num + 1 : '—'}</Text>
              </View>
            </View>
          </View>

          <TouchableOpacity
            onPress={() => speakWord(`${num > 1 ? num - 1 : ''}, ${num}, ${num < 10 ? num + 1 : ''}`)}
            style={[styles.smallListenBtn, { backgroundColor: '#9B59B6' }]}
          >
            <Image source={SCREEN_ICONS.speaker} style={styles.speakerIconSmall} />
          </TouchableOpacity>
        </View>

        {/* SECTION 7: Fun Fact */}
        <View style={[styles.activityCard, { borderColor: '#FF5722', backgroundColor: '#FFF3E0' }]}>
          <Animated.View style={[styles.balloonContainer, { transform: [{ translateY: balloonBounce }] }]}>
            <View style={[styles.balloon, { backgroundColor: '#FF5722' }]}>
              <Text style={styles.balloonNumber}>💡</Text>
            </View>
            <View style={[styles.balloonTail, { borderTopColor: '#FF5722' }]} />
            <View style={styles.balloonString} />
          </Animated.View>

          <Text style={styles.activityTitle}>💡 Fun Fact!</Text>
          
          <View style={styles.funFactBox}>
            <Text style={styles.funFactText}>{FUN_FACTS[num]}</Text>
          </View>

          <TouchableOpacity
            onPress={() => speakWord(FUN_FACTS[num])}
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
            <Text style={styles.progressText}>{index + 1} / {NUMBERS.length}</Text>
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
  numberData: NumberData;
  index: number;
  onPress: () => void;
}

const GridCard: React.FC<GridCardProps> = ({ numberData, index, onPress }) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const balloonColor = BALLOON_COLORS[index % BALLOON_COLORS.length];
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
        <View style={[styles.gridBalloon, { backgroundColor: balloonColor }]}>
          <Text style={styles.gridBalloonNumber}>{numberData.num}</Text>
        </View>

        <Text style={styles.gridWord}>{numberData.word}</Text>
        <Text style={styles.gridObjects}>{numberData.objects}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

// Count Game Component
interface CountGameProps {
  score: number;
  setScore: (score: number) => void;
}

const CountGame: React.FC<CountGameProps> = ({ score, setScore }) => {
  const [countQuestion, setCountQuestion] = useState<{ count: number; emoji: string; options: number[] } | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
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

  const generateCountQuestion = () => {
    const count = Math.floor(Math.random() * 10) + 1;
    const emojis = Object.keys(OBJECT_IMAGES);
    const emoji = emojis[Math.floor(Math.random() * emojis.length)];

    const options = [count];
    while (options.length < 4) {
      const wrong = Math.floor(Math.random() * 10) + 1;
      if (!options.includes(wrong)) {
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
    
    setCountQuestion({ count, emoji, options });
  };

  const handleCountAnswer = (answer: number) => {
    if (!countQuestion || isLocked) return;

    setSelectedAnswer(answer);
    setIsLocked(true);

    if (answer === countQuestion.count) {
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
        generateCountQuestion();
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
    generateCountQuestion();
  }, []);

  if (!countQuestion) return null;

  const objectImage = OBJECT_IMAGES[countQuestion.emoji];

  const getOptionStyle = (opt: number, index: number) => {
    const baseColor = BALLOON_COLORS[index % BALLOON_COLORS.length];
    
    if (selectedAnswer === opt) {
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
    if (isCorrect === false && opt === countQuestion.count) {
      return {
        backgroundColor: '#27AE60',
        borderColor: '#1E8449',
        borderWidth: 4,
      };
    }
    
    return { backgroundColor: baseColor };
  };

  return (
    <ScrollView style={styles.countGameScroll} contentContainerStyle={styles.countGameScrollContent}>
      <View style={styles.scoreBox}>
        <Image source={SCREEN_ICONS.starGold} style={styles.scoreIcon} resizeMode="contain" />
        <Text style={styles.scoreText}>{score}</Text>
      </View>

      <Animated.View 
        style={[
          styles.countQuestionCard,
          { transform: [{ translateX: shakeAnim }] }
        ]}
      >
        <Text style={styles.countInstruction}>How many are there?</Text>
        
        <View style={styles.objectsContainer}>
          <View style={styles.objectsGrid}>
            {Array.from({ length: countQuestion.count }, (_, i) => (
              <Image key={i} source={objectImage} style={styles.countObjectImage} resizeMode="contain" />
            ))}
          </View>
        </View>

        <View style={styles.optionsGrid}>
          {countQuestion.options.map((opt, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => handleCountAnswer(opt)}
              disabled={isLocked}
              style={[styles.optionButton, getOptionStyle(opt, index)]}
            >
              <Text style={styles.optionText}>{opt}</Text>
              {/* Show checkmark for correct, X for wrong */}
              {selectedAnswer === opt && isCorrect === true && (
                <Text style={styles.feedbackIcon}>✓</Text>
              )}
              {selectedAnswer === opt && isCorrect === false && (
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
          <Text style={styles.wrongFeedbackText}>❌ Oops! The answer is {countQuestion.count}. Try again! 💪</Text>
        </View>
      )}
    </ScrollView>
  );
};

// ===== NUMBER WRITING PRACTICE COMPONENT =====

interface PathPoint {
  x: number;
  y: number;
}

interface NumberWritingPracticeProps {
  numberData: NumberData;
  index: number;
  onPrevious: () => void;
  onNext: () => void;
  hasPrevious: boolean;
  hasNext: boolean;
}

const NumberWritingPractice: React.FC<NumberWritingPracticeProps> = ({
  numberData,
  index,
  onPrevious,
  onNext,
  hasPrevious,
  hasNext,
}) => {
  const scrollViewRef = useRef<ScrollView>(null);
  const num = numberData.num;
  const balloonColor = BALLOON_COLORS[index % BALLOON_COLORS.length];
  const borderColor = CARD_BORDER_COLORS[index % CARD_BORDER_COLORS.length];
  
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

  useEffect(() => {
    scrollViewRef.current?.scrollTo({ y: 0, animated: false });
    // Clear drawing when number changes
    allPathsRef.current = [];
    currentPathRef.current = [];
    setDrawingVersion(0);
    setCurrentDrawing([]);
    // Clear coloring when number changes
    setColorSegments([]);
    setCurrentFill(0);
    setShowCelebration(false);
    setCountdown(null);
    celebrationTriggered.current = false;
    celebrationAnim.setValue(0);
    starsScale.setValue(0);
    countdownAnim.setValue(1);
    balloonAnims.forEach(anim => anim.setValue(0));
    
    speakWord(`Let's write the number ${num}`);
    
    Animated.loop(
      Animated.sequence([
        Animated.timing(bounceAnim, { toValue: -5, duration: 600, useNativeDriver: true }),
        Animated.timing(bounceAnim, { toValue: 0, duration: 600, useNativeDriver: true }),
      ])
    ).start();
  }, [numberData, bounceAnim]);

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

  // Render dotted number for tracing
  const renderDottedNumber = (number: number, size: number) => {
    return (
      <View style={[writingStyles.dottedNumberBox, { width: size, height: size }]}>
        <Text style={[
          writingStyles.dottedNumberText, 
          { fontSize: size * 0.7, color: '#ccc' },
          { fontFamily: 'System' }
        ]}>
          {number}
        </Text>
        <View style={writingStyles.dottedOverlay}>
          <Text style={[
            writingStyles.dottedNumberText, 
            { fontSize: size * 0.7 },
            writingStyles.dottedTextStyle
          ]}>
            {number}
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
      <View style={[writingStyles.worksheetCard, { borderColor: balloonColor }]}>
        
        {/* Header Section - Number with Objects */}
        <View style={writingStyles.headerSection}>
          <View style={writingStyles.numberDisplay}>
            <Animated.View style={{ transform: [{ translateY: bounceAnim }] }}>
              <Text style={[writingStyles.mainNumber, { color: balloonColor }]}>
                {num}
              </Text>
            </Animated.View>
          </View>
          
          <View style={writingStyles.objectSection}>
            <Text style={writingStyles.objectEmoji}>{numberData.objects}</Text>
            <View style={[writingStyles.isForBadge, { backgroundColor: balloonColor }]}>
              <Text style={writingStyles.isForText}>{numberData.word}</Text>
            </View>
          </View>
        </View>

        {/* Tracing Section Title */}
        <View style={[writingStyles.sectionTitleBox, { backgroundColor: balloonColor }]}>
          <Text style={writingStyles.sectionTitleText}>✏️ Trace the Number</Text>
        </View>

        {/* Number Tracing Lines */}
        <View style={writingStyles.tracingSection}>
          <Text style={writingStyles.tracingLabel}>Number {num}</Text>
          <View style={writingStyles.tracingLinesContainer}>
            {/* First Row - Large numbers */}
            <View style={writingStyles.tracingRow}>
              {[...Array(5)].map((_, i) => (
                <View key={`num1-${i}`} style={writingStyles.tracingCell}>
                  {renderDottedNumber(num, 50)}
                </View>
              ))}
            </View>
            {/* Second Row - Medium numbers */}
            <View style={writingStyles.tracingRow}>
              {[...Array(6)].map((_, i) => (
                <View key={`num2-${i}`} style={writingStyles.tracingCell}>
                  {renderDottedNumber(num, 40)}
                </View>
              ))}
            </View>
            {/* Third Row - Smaller numbers */}
            <View style={writingStyles.tracingRow}>
              {[...Array(7)].map((_, i) => (
                <View key={`num3-${i}`} style={writingStyles.tracingCell}>
                  {renderDottedNumber(num, 35)}
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
                      backgroundColor: balloonColor,
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
                    backgroundColor: balloonColor,
                  },
                ]}
              />
            ))}
            
            {/* Ghost number as guide */}
            <Text style={[writingStyles.ghostNumber, { color: `${balloonColor}20` }]}>
              {num}
            </Text>
          </View>
        </View>
      </View>

      {/* Counting Practice Activity */}
      <View style={[writingStyles.activityCard, { borderColor: '#27AE60' }]}>
        <View style={[writingStyles.activityHeader, { backgroundColor: '#27AE60' }]}>
          <Text style={writingStyles.activityTitle}>🔢 Count and Write {num}</Text>
        </View>
        
        <View style={writingStyles.countingPractice}>
          <View style={writingStyles.countingObjectsRow}>
            {Array.from({ length: num }, (_, i) => (
              <Text key={i} style={writingStyles.countingObject}>{COUNTING_OBJECTS[num].emoji}</Text>
            ))}
          </View>
          <Text style={writingStyles.countingText}>
            Count: {Array.from({ length: num }, (_, i) => i + 1).join(', ')}
          </Text>
          <Text style={writingStyles.countingResult}>
            Total = {num} ({numberData.word})
          </Text>
        </View>
      </View>

      {/* Color It Section - Trace to Fill */}
      <View style={[writingStyles.activityCard, { borderColor: balloonColor }]}>
        <View style={[writingStyles.activityHeader, { backgroundColor: balloonColor }]}>
          <Text style={writingStyles.activityTitle}>🎨 Color the Number!</Text>
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
          
          {/* Number Canvas - Multi-Color Trace to Fill */}
          <View 
            style={writingStyles.traceCanvas}
            {...fillPanResponder.panHandlers}
          >
            {/* Layer 1: Light gray unfilled number */}
            <Text style={writingStyles.numberUnfilledClean}>
              {num}
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
                <Text style={[writingStyles.numberSegment, { color: segment.color }]}>
                  {num}
                </Text>
              </View>
            ))}
            
            {/* Current active segment being drawn */}
            <View style={[writingStyles.colorFillClip, { height: `${currentFill}%` }]}>
              <Text style={[writingStyles.numberFilled, { color: selectedColor }]}>
                {num}
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
                              outputRange: [350, -50],
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
                
                {/* Stars around the number */}
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
            
            {/* Countdown Timer */}
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
              ? '🌟 Amazing! You colored the number! 🌟' 
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

        <View style={[writingStyles.progressBox, { backgroundColor: balloonColor }]}>
          <Text style={writingStyles.progressText}>{index + 1} / {NUMBERS.length}</Text>
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

// Writing Grid Card for number selection
interface WritingGridCardProps {
  numberData: NumberData;
  index: number;
  onPress: () => void;
}

const WritingGridCard: React.FC<WritingGridCardProps> = ({ numberData, index, onPress }) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const borderColor = CARD_BORDER_COLORS[index % CARD_BORDER_COLORS.length];
  const bgColor = BALLOON_COLORS[index % BALLOON_COLORS.length];

  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      delay: index * 20,
      tension: 60,
      friction: 8,
    }).start();
  }, [scaleAnim, index]);

  return (
    <Animated.View style={[writingStyles.gridCard, { transform: [{ scale: scaleAnim }] }]}>
      <TouchableOpacity
        onPress={onPress}
        style={[writingStyles.gridCardInner, { borderColor }]}
        activeOpacity={0.8}
      >
        <View style={[writingStyles.numberCircle, { backgroundColor: bgColor }]}>
          <Text style={writingStyles.gridNumber}>{numberData.num}</Text>
        </View>
        <Text style={writingStyles.gridWord}>{numberData.word}</Text>
        <Text style={writingStyles.gridWriteHint}>✏️ Write</Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

interface NumbersScreenProps {
  navigation: any;
}

export const NumbersScreen: React.FC<NumbersScreenProps> = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState<TabType>('learn');
  const insets = useSafeAreaInsets();
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'flashcard'>('grid');
  const [writingSelectedIndex, setWritingSelectedIndex] = useState<number | null>(null);
  const [writingViewMode, setWritingViewMode] = useState<'grid' | 'practice'>('grid');
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
    if (selectedIndex !== null && selectedIndex < NUMBERS.length - 1) {
      setSelectedIndex(selectedIndex + 1);
    }
  };

  const goToWritingPrevious = () => {
    if (writingSelectedIndex !== null && writingSelectedIndex > 0) {
      setWritingSelectedIndex(writingSelectedIndex - 1);
    }
  };

  const goToWritingNext = () => {
    if (writingSelectedIndex !== null && writingSelectedIndex < NUMBERS.length - 1) {
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

      {/* Main Header with Back Button */}
      {!isInDetailView && (
        <View style={[styles.header, { marginTop: insets.top + 10 }]}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>🔢 Numbers</Text>
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
              📚 Learn
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'write' && styles.tabButtonActive]}
            onPress={() => setActiveTab('write')}
          >
            <Text style={[styles.tabText, activeTab === 'write' && styles.tabTextActive]}>
              ✏️ Write
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'count' && styles.tabButtonActive]}
            onPress={() => setActiveTab('count')}
          >
            <Text style={[styles.tabText, activeTab === 'count' && styles.tabTextActive]}>
              🎮 Count
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* LEARN 123 TAB */}
      {activeTab === 'learn' && (
        <>
          {viewMode === 'grid' ? (
            <>
              <View style={styles.instructionBox}>
                <Text style={styles.instructionText}>✨ Tap to learn numbers! ✨</Text>
              </View>

              <ScrollView contentContainerStyle={styles.gridContainer} showsVerticalScrollIndicator={false}>
                <View style={styles.gridWrapper}>
                  {NUMBERS.map((num, index) => (
                    <GridCard
                      key={num.num}
                      numberData={num}
                      index={index}
                      onPress={() => openFlashcard(index)}
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
                  numberData={NUMBERS[selectedIndex]}
                  index={selectedIndex}
                  onPrevious={goToPrevious}
                  onNext={goToNext}
                  hasPrevious={selectedIndex > 0}
                  hasNext={selectedIndex < NUMBERS.length - 1}
                />
              )}
            </>
          )}
        </>
      )}

      {/* WRITE 123 TAB */}
      {activeTab === 'write' && (
        <>
          {writingViewMode === 'grid' ? (
            <>
              <View style={styles.instructionBox}>
                <Text style={styles.instructionText}>✏️ Select a number to practice writing! ✏️</Text>
              </View>

              <ScrollView contentContainerStyle={styles.gridContainer} showsVerticalScrollIndicator={false}>
                <View style={styles.gridWrapper}>
                  {NUMBERS.map((num, idx) => (
                    <WritingGridCard
                      key={`write-${num.num}`}
                      numberData={num}
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
                <NumberWritingPractice
                  numberData={NUMBERS[writingSelectedIndex]}
                  index={writingSelectedIndex}
                  onPrevious={goToWritingPrevious}
                  onNext={goToWritingNext}
                  hasPrevious={writingSelectedIndex > 0}
                  hasNext={writingSelectedIndex < NUMBERS.length - 1}
                />
              )}
            </>
          )}
        </>
      )}

      {/* COUNT GAME TAB */}
      {activeTab === 'count' && (
        <>
          <View style={styles.instructionBox}>
            <Text style={styles.instructionText}>🎮 Count the objects and pick the right number! 🎮</Text>
          </View>

          <CountGame score={score} setScore={setScore} />
        </>
      )}
    </View>
  );
};

const CARD_WIDTH = (width - 40) / 2;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#87CEEB',
  },
  skyBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: height * 0.75,
    backgroundColor: '#87CEEB',
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
    backgroundColor: '#7CCD7C',
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
  // Tab Navigation Styles
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: 15,
    marginBottom: 10,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 25,
    padding: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
    zIndex: 10,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 20,
  },
  tabButtonActive: {
    backgroundColor: '#FFD700',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  tabText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#888',
  },
  tabTextActive: {
    color: '#333',
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
    width: 50,
    height: 58,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  gridBalloonNumber: {
    fontSize: 28,
    fontWeight: '900',
    color: '#fff',
  },
  gridWord: {
    fontSize: 14,
    fontWeight: '700',
    color: '#555',
    marginBottom: 4,
  },
  gridObjects: {
    fontSize: 20,
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
  balloonNumber: {
    fontSize: 28,
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
  numberHighlight: {
    fontSize: 48,
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
  objectsDisplayContainer: {
    backgroundColor: '#F0F8FF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 18,
    borderWidth: 3,
    borderColor: '#E0E8F0',
  },
  objectsDisplay: {
    fontSize: 36,
    textAlign: 'center',
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
  activitySubtext: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
    marginBottom: 12,
  },
  // Finger counting
  fingerDisplayBox: {
    backgroundColor: '#FFF0F5',
    paddingHorizontal: 40,
    paddingVertical: 20,
    borderRadius: 20,
    marginBottom: 12,
    borderWidth: 3,
    borderColor: '#FFB6C1',
  },
  fingerEmoji: {
    fontSize: 60,
    textAlign: 'center',
  },
  // Counting row
  countingRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 15,
    gap: 10,
  },
  countingItem: {
    alignItems: 'center',
  },
  countingEmoji: {
    fontSize: 32,
  },
  countingNumber: {
    fontSize: 14,
    fontWeight: '700',
    color: '#27AE60',
    marginTop: 2,
  },
  resultTextBox: {
    backgroundColor: '#FFFBEB',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 15,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#FFD700',
  },
  resultText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2C3E50',
    textAlign: 'center',
    fontStyle: 'italic',
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
    backgroundColor: '#E8F8E8',
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
  // Math/Addition
  mathContainer: {
    width: '100%',
    gap: 12,
  },
  mathRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E8F4FF',
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 15,
    gap: 8,
  },
  mathBubble: {
    width: 45,
    height: 45,
    borderRadius: 23,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mathNumber: {
    fontSize: 22,
    fontWeight: '900',
    color: '#fff',
  },
  mathOperator: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  // Number neighbors
  neighborsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 15,
  },
  neighborBox: {
    alignItems: 'center',
  },
  neighborLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#888',
    marginBottom: 8,
  },
  neighborCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  neighborNumber: {
    fontSize: 28,
    fontWeight: '900',
    color: '#fff',
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
  // Collect items
  collectContainer: {
    alignItems: 'center',
    marginBottom: 15,
  },
  basketRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 10,
  },
  collectEmoji: {
    fontSize: 36,
  },
  basketIcon: {
    marginTop: 5,
  },
  basketEmoji: {
    fontSize: 50,
  },
  // Animal counting
  animalContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 15,
    paddingHorizontal: 10,
  },
  animalItem: {
    backgroundColor: '#FFF9E6',
    borderRadius: 15,
    padding: 10,
    borderWidth: 2,
    borderColor: '#FFE0B2',
  },
  animalEmoji: {
    fontSize: 40,
  },
  // Food/Yummy section
  foodContainer: {
    alignItems: 'center',
    marginBottom: 15,
  },
  plateIcon: {
    marginBottom: 5,
  },
  plateEmoji: {
    fontSize: 60,
  },
  foodRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
    marginTop: -20,
  },
  foodEmoji: {
    fontSize: 34,
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
  // Count Game Styles
  countGameScroll: {
    flex: 1,
  },
  countGameScrollContent: {
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
  countQuestionCard: {
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
  countInstruction: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.purple,
    textAlign: 'center',
    marginBottom: 20,
  },
  objectsContainer: {
    backgroundColor: '#F0F8FF',
    borderRadius: 20,
    padding: 25,
    marginBottom: 25,
    borderWidth: 3,
    borderColor: '#E0E8F0',
    width: '100%',
  },
  objectsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
  },
  countObjectImage: {
    width: 50,
    height: 50,
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
    height: 70,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  optionText: { fontSize: 32, fontWeight: '900', color: COLORS.white },
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

// Writing Practice Styles
const WRITING_CARD_WIDTH = (width - 40) / 3;

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
  numberDisplay: {
    flex: 1,
  },
  mainNumber: {
    fontSize: 100,
    fontWeight: '900',
    textShadowColor: 'rgba(0,0,0,0.1)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  objectSection: {
    alignItems: 'center',
  },
  objectEmoji: {
    fontSize: 40,
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
  // Dotted Number Box
  dottedNumberBox: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  dottedNumberText: {
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
  ghostNumber: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -40 }, { translateY: -50 }],
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
  // Counting Practice
  countingPractice: {
    padding: 15,
    alignItems: 'center',
  },
  countingObjectsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 15,
  },
  countingObject: {
    fontSize: 36,
  },
  countingText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  countingResult: {
    fontSize: 20,
    fontWeight: '800',
    color: '#27AE60',
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
  // Trace to fill styles
  traceCanvas: {
    width: width - 40,
    height: 300,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    position: 'relative',
    backgroundColor: 'transparent',
  },
  numberUnfilledClean: {
    fontSize: 250,
    fontWeight: '900',
    color: '#E0E0E0',
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
  numberFilled: {
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
  numberSegment: {
    fontSize: 250,
    fontWeight: '900',
  },
  handPointerTop: {
    position: 'absolute',
    top: 0,
    left: '50%',
    marginLeft: -22,
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
  // Writing Grid Card
  gridCard: {
    width: WRITING_CARD_WIDTH,
    margin: 6,
  },
  gridCardInner: {
    backgroundColor: '#fff',
    borderRadius: 15,
    borderWidth: 3,
    padding: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 4,
  },
  numberCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 5,
  },
  gridNumber: {
    fontSize: 26,
    fontWeight: '900',
    color: '#fff',
  },
  gridWord: {
    fontSize: 12,
    fontWeight: '700',
    color: '#666',
    marginBottom: 5,
  },
  gridWriteHint: {
    fontSize: 11,
    fontWeight: '600',
    color: '#888',
  },
});
