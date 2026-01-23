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
  ImageBackground,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, RAINBOW_COLORS } from '../constants/colors';
import { SHAPES } from '../constants/gameData';
import { speakShape, speakWord, stopSpeaking, speakCelebration } from '../utils/speech';
import { SCREEN_ICONS } from '../assets/images';
import { useResponsiveLayout } from '../utils/useResponsiveLayout';

// Background Image
const SHAPES_BG_IMAGE = require('../images/bgImage/ShapsImageBG.png');

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
const CARD_BG_COLORS = [
  '#FFE5E5', '#E5F6FF', '#E5FFE8', '#FFF5E5', 
  '#FFFDE5', '#FFE5F0', '#E5FFFF', '#F0E5FF',
];

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
  const { isLandscape, width: screenWidth, height: screenHeight } = useResponsiveLayout();

  const borderColor = CARD_BORDER_COLORS[index % CARD_BORDER_COLORS.length];

  useEffect(() => {
    scrollViewRef.current?.scrollTo({ y: 0, x: 0, animated: false });

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

  // Landscape layout
  if (isLandscape) {
    return (
      <View style={{ flex: 1, flexDirection: 'row', padding: 10 }}>
        {/* Left Panel - Shape Display */}
        <View style={{ 
          width: 220, 
          backgroundColor: '#fff', 
          borderRadius: 20, 
          borderWidth: 4, 
          borderColor: shapeData.color,
          padding: 15,
          marginRight: 10,
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <Animated.View style={{ transform: [{ translateY: balloonBounce }] }}>
            <View style={{ backgroundColor: shapeData.color, width: 70, height: 70, borderRadius: 35, justifyContent: 'center', alignItems: 'center', marginBottom: 5 }}>
              <Text style={{ fontSize: 40 }}>{shapeData.emoji}</Text>
            </View>
          </Animated.View>
          
          <Text style={{ fontSize: 28, fontWeight: '800', color: shapeData.color, marginTop: 5 }}>{shapeData.name}</Text>
          
          <View style={{ backgroundColor: shapeData.color + '20', paddingHorizontal: 15, paddingVertical: 6, borderRadius: 15, marginTop: 8 }}>
            <Text style={{ color: shapeData.color, fontSize: 14, fontWeight: '700' }}>
              {shapeData.sides > 0 ? `${shapeData.sides} sides` : 'No corners - Round!'}
            </Text>
          </View>

          <TouchableOpacity
            onPress={() => speakShape(shapeData.name)}
            style={{ backgroundColor: shapeData.color, padding: 10, borderRadius: 20, marginTop: 10 }}
          >
            <Image source={SCREEN_ICONS.speaker} style={{ width: 24, height: 24, tintColor: '#fff' }} />
          </TouchableOpacity>

          {/* Navigation */}
          <View style={{ flexDirection: 'row', marginTop: 15, gap: 10 }}>
            <TouchableOpacity
              onPress={() => { stopSpeaking(); onPrevious(); }}
              disabled={!hasPrevious}
              style={{ 
                width: 40, height: 40, borderRadius: 20, 
                backgroundColor: hasPrevious ? shapeData.color : '#ddd',
                justifyContent: 'center', alignItems: 'center',
              }}
            >
              <Text style={{ color: '#fff', fontSize: 18, fontWeight: 'bold' }}>◀</Text>
            </TouchableOpacity>
            <View style={{ backgroundColor: 'rgba(0,0,0,0.1)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 }}>
              <Text style={{ fontSize: 14, fontWeight: '600' }}>{index + 1}/{SHAPES.length}</Text>
            </View>
            <TouchableOpacity
              onPress={() => { stopSpeaking(); onNext(); }}
              disabled={!hasNext}
              style={{ 
                width: 40, height: 40, borderRadius: 20, 
                backgroundColor: hasNext ? shapeData.color : '#ddd',
                justifyContent: 'center', alignItems: 'center',
              }}
            >
              <Text style={{ color: '#fff', fontSize: 18, fontWeight: 'bold' }}>▶</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Right Panel - Activity Cards */}
        <ScrollView 
          ref={scrollViewRef}
          style={{ flex: 1 }}
          horizontal={true}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ flexDirection: 'row', gap: 10, paddingRight: 20 }}
        >
          {/* Draw the Shape Card */}
          <View style={{ 
            width: screenWidth * 0.28, 
            backgroundColor: '#fff', 
            borderRadius: 18, 
            borderWidth: 3, 
            borderColor: '#E91E63',
            padding: 12,
          }}>
            <View style={{ backgroundColor: '#E91E63', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 12, alignSelf: 'center', marginBottom: 10 }}>
              <Text style={{ color: '#fff', fontSize: 13, fontWeight: '700' }}>✏️ Draw It!</Text>
            </View>
            
            <View style={{ backgroundColor: '#FCE4EC', borderRadius: 15, padding: 15, alignItems: 'center', flex: 1, justifyContent: 'center' }}>
              <Text style={{ fontSize: 60, opacity: 0.3 }}>{shapeData.emoji}</Text>
              <Text style={{ fontSize: 12, color: '#E91E63', marginTop: 8, textAlign: 'center' }}>Trace with your finger!</Text>
            </View>

            <TouchableOpacity
              onPress={() => speakWord(`Draw a ${shapeData.name}`)}
              style={{ backgroundColor: '#E91E63', padding: 8, borderRadius: 15, alignSelf: 'center', marginTop: 8 }}
            >
              <Image source={SCREEN_ICONS.speaker} style={{ width: 18, height: 18, tintColor: '#fff' }} />
            </TouchableOpacity>
          </View>

          {/* Find Objects Card */}
          <View style={{ 
            width: screenWidth * 0.28, 
            backgroundColor: '#fff', 
            borderRadius: 18, 
            borderWidth: 3, 
            borderColor: '#27AE60',
            padding: 12,
          }}>
            <View style={{ backgroundColor: '#27AE60', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 12, alignSelf: 'center', marginBottom: 10 }}>
              <Text style={{ color: '#fff', fontSize: 13, fontWeight: '700' }}>🔍 Find Objects</Text>
            </View>
            
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 8 }}>
              {SHAPE_OBJECTS[shapeData.name]?.map((obj, idx) => (
                <TouchableOpacity 
                  key={idx} 
                  style={{ backgroundColor: '#E8F5E9', padding: 10, borderRadius: 12, alignItems: 'center', width: '45%' }}
                  onPress={() => speakWord(obj.name)}
                >
                  <Text style={{ fontSize: 32 }}>{obj.emoji}</Text>
                  <Text style={{ fontSize: 11, color: '#27AE60', fontWeight: '600', marginTop: 4 }}>{obj.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Real Life Examples Card */}
          <View style={{ 
            width: screenWidth * 0.28, 
            backgroundColor: '#fff', 
            borderRadius: 18, 
            borderWidth: 3, 
            borderColor: '#3498DB',
            padding: 12,
          }}>
            <View style={{ backgroundColor: '#3498DB', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 12, alignSelf: 'center', marginBottom: 10 }}>
              <Text style={{ color: '#fff', fontSize: 13, fontWeight: '700' }}>🌍 Real Life</Text>
            </View>
            
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 8 }}>
              {REAL_LIFE_EXAMPLES[shapeData.name]?.map((example, idx) => (
                <TouchableOpacity 
                  key={idx} 
                  style={{ backgroundColor: '#E3F2FD', padding: 10, borderRadius: 12, alignItems: 'center', width: '45%' }}
                  onPress={() => speakWord(example.text)}
                >
                  <Text style={{ fontSize: 32 }}>{example.emoji}</Text>
                  <Text style={{ fontSize: 11, color: '#3498DB', fontWeight: '600', marginTop: 4 }}>{example.text}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Shape Facts Card */}
          <View style={{ 
            width: screenWidth * 0.28, 
            backgroundColor: '#fff', 
            borderRadius: 18, 
            borderWidth: 3, 
            borderColor: '#9B59B6',
            padding: 12,
          }}>
            <View style={{ backgroundColor: '#9B59B6', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 12, alignSelf: 'center', marginBottom: 10 }}>
              <Text style={{ color: '#fff', fontSize: 13, fontWeight: '700' }}>📐 Facts</Text>
            </View>
            
            <View style={{ backgroundColor: '#F3E5F5', borderRadius: 12, padding: 12 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: '#E1BEE7' }}>
                <Text style={{ fontSize: 13, color: '#666' }}>Name:</Text>
                <Text style={{ fontSize: 13, fontWeight: '700', color: '#9B59B6' }}>{shapeData.name}</Text>
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: '#E1BEE7' }}>
                <Text style={{ fontSize: 13, color: '#666' }}>Sides:</Text>
                <Text style={{ fontSize: 13, fontWeight: '700', color: '#9B59B6' }}>{shapeData.sides > 0 ? shapeData.sides : 'None'}</Text>
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 }}>
                <Text style={{ fontSize: 13, color: '#666' }}>Corners:</Text>
                <Text style={{ fontSize: 13, fontWeight: '700', color: '#9B59B6' }}>{shapeData.sides > 0 ? shapeData.sides : 'None'}</Text>
              </View>
            </View>

            <TouchableOpacity
              onPress={() => speakWord(`${shapeData.name} has ${shapeData.sides > 0 ? shapeData.sides + ' sides' : 'no sides, it is round'}`)}
              style={{ backgroundColor: '#9B59B6', padding: 8, borderRadius: 15, alignSelf: 'center', marginTop: 8 }}
            >
              <Image source={SCREEN_ICONS.speaker} style={{ width: 18, height: 18, tintColor: '#fff' }} />
            </TouchableOpacity>
          </View>

          {/* Fun Fact Card */}
          <View style={{ 
            width: screenWidth * 0.32, 
            backgroundColor: '#FFF3E0', 
            borderRadius: 18, 
            borderWidth: 3, 
            borderColor: '#FF5722',
            padding: 12,
          }}>
            <View style={{ backgroundColor: '#FF5722', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 12, alignSelf: 'center', marginBottom: 10 }}>
              <Text style={{ color: '#fff', fontSize: 13, fontWeight: '700' }}>💡 Fun Fact!</Text>
            </View>
            
            <View style={{ backgroundColor: '#FFE0B2', borderRadius: 12, padding: 12, flex: 1, justifyContent: 'center' }}>
              <Text style={{ fontSize: 14, color: '#E65100', lineHeight: 20, textAlign: 'center' }}>{FUN_FACTS[shapeData.name]}</Text>
            </View>

            <TouchableOpacity
              onPress={() => speakWord(FUN_FACTS[shapeData.name])}
              style={{ backgroundColor: '#FF5722', padding: 8, borderRadius: 15, alignSelf: 'center', marginTop: 8 }}
            >
              <Image source={SCREEN_ICONS.speaker} style={{ width: 18, height: 18, tintColor: '#fff' }} />
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    );
  }

  // Portrait layout - original
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
  cardWidth: number;
  isLandscape: boolean;
}

const GridCard: React.FC<GridCardProps> = ({ shapeData, index, onPress }) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const bounceAnim = useRef(new Animated.Value(0)).current;
  const borderColor = CARD_BORDER_COLORS[index % CARD_BORDER_COLORS.length];
  const bgColor = CARD_BG_COLORS[index % CARD_BG_COLORS.length];

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
        
        {/* Big colorful shape circle */}
        <View style={[styles.gridBalloon, { backgroundColor: shapeData.color }]}>
          <View style={styles.balloonShine} />
          <Text style={styles.gridBalloonEmoji}>{shapeData.emoji}</Text>
        </View>

        <Text style={[styles.gridName, { color: shapeData.color }]}>{shapeData.name}</Text>
        
        {/* Sides info in bubble */}
        <View style={[styles.sidesCircle, { borderColor: `${shapeData.color}40` }]}>
          <Text style={styles.gridSides}>
            {shapeData.sides > 0 ? `${shapeData.sides} sides` : 'Round'}
          </Text>
        </View>

        {/* Fun tap button */}
        <View style={[styles.tapButton, { backgroundColor: shapeData.color }]}>
          <Text style={styles.tapButtonText}>🎯 TAP ME!</Text>
        </View>
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
  const { isLandscape, width: screenWidth, height: screenHeight } = useResponsiveLayout();
  
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

  // Landscape layout for Match Game
  if (isLandscape) {
    return (
      <View style={{ flex: 1, flexDirection: 'row', padding: 10 }}>
        {/* Left Panel - Question Shape */}
        <Animated.View 
          style={{ 
            width: screenWidth * 0.35, 
            backgroundColor: '#fff', 
            borderRadius: 20, 
            borderWidth: 4, 
            borderColor: matchQuestion.shape.color,
            padding: 15,
            marginRight: 10,
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            transform: [{ translateX: shakeAnim }],
          }}
        >
          <Text style={{ fontSize: 18, fontWeight: '700', color: '#333', marginBottom: 10 }}>
            Find the {matchQuestion.shape.name}!
          </Text>
          
          <View style={{ 
            width: 120, height: 120, borderRadius: 20, 
            backgroundColor: matchQuestion.shape.color + '20', 
            justifyContent: 'center', alignItems: 'center' 
          }}>
            <Text style={{ fontSize: 70 }}>{matchQuestion.shape.emoji}</Text>
          </View>
          
          <View style={{ backgroundColor: matchQuestion.shape.color, paddingHorizontal: 20, paddingVertical: 8, borderRadius: 15, marginTop: 15 }}>
            <Text style={{ color: '#fff', fontSize: 18, fontWeight: '800' }}>{matchQuestion.shape.name}</Text>
          </View>
          
          {/* Celebration in left panel */}
          {showCelebration && (
            <>
              {[{ left: 10 }, { right: 10 }, { left: 40 }, { right: 40 }].map((pos, i) => (
                <Animated.Text
                  key={`balloon-l-${i}`}
                  style={[
                    { position: 'absolute', fontSize: 28, bottom: 0, ...pos },
                    {
                      transform: [{ translateY: balloonAnims[i].interpolate({ inputRange: [0, 1], outputRange: [150, -30] }) }],
                      opacity: balloonAnims[i],
                    }
                  ]}
                >
                  🎈
                </Animated.Text>
              ))}
            </>
          )}
        </Animated.View>

        {/* Right Panel - Answer Options */}
        <View style={{ 
          flex: 1, 
          backgroundColor: '#fff', 
          borderRadius: 20, 
          borderWidth: 3, 
          borderColor: '#E0E0E0',
          padding: 15,
          overflow: 'hidden',
        }}>
          {/* Score badge */}
          <View style={{ position: 'absolute', top: 10, right: 10, flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFD700', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 15, zIndex: 10 }}>
            <Image source={SCREEN_ICONS.starGold} style={{ width: 20, height: 20, marginRight: 5 }} resizeMode="contain" />
            <Text style={{ fontSize: 16, fontWeight: '800', color: '#333' }}>{score}</Text>
          </View>

          <Text style={{ fontSize: 16, fontWeight: '600', color: '#666', textAlign: 'center', marginBottom: 10 }}>Tap the correct shape!</Text>

          {/* 2x2 Options Grid */}
          <View style={{ flex: 1, justifyContent: 'center' }}>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 15 }}>
              {matchQuestion.options.map((shape, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => handleMatchAnswer(shape)}
                  disabled={isLocked}
                  style={[
                    { 
                      width: (screenWidth * 0.6 - 60) / 2, 
                      height: 100, 
                      borderRadius: 15, 
                      justifyContent: 'center', 
                      alignItems: 'center',
                      borderWidth: 3,
                      borderColor: 'transparent',
                    },
                    getOptionStyle(shape.name, index)
                  ]}
                >
                  <Text style={{ fontSize: 40 }}>{shape.emoji}</Text>
                  <Text style={{ fontSize: 14, fontWeight: '700', color: '#fff', marginTop: 5 }}>{shape.name}</Text>
                  {selectedAnswer === shape.name && isCorrect === true && (
                    <Text style={{ position: 'absolute', top: 5, right: 5, fontSize: 18 }}>✓</Text>
                  )}
                  {selectedAnswer === shape.name && isCorrect === false && (
                    <Text style={{ position: 'absolute', top: 5, right: 5, fontSize: 18 }}>✗</Text>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Celebration in right panel */}
          {showCelebration && (
            <>
              {[{ left: 20 }, { right: 20 }, { left: 60 }, { right: 60 }].map((pos, i) => (
                <Animated.Text
                  key={`balloon-r-${i}`}
                  style={[
                    { position: 'absolute', fontSize: 28, bottom: 0, ...pos },
                    {
                      transform: [{ translateY: balloonAnims[i + 2].interpolate({ inputRange: [0, 1], outputRange: [150, -30] }) }],
                      opacity: balloonAnims[i + 2],
                    }
                  ]}
                >
                  🎈
                </Animated.Text>
              ))}
              
              {/* Stars */}
              {['⭐', '🌟', '✨', '⭐'].map((star, i) => (
                <Animated.Text
                  key={`star-${i}`}
                  style={[
                    { position: 'absolute', fontSize: 20 },
                    { top: 30 + i * 25, left: i % 2 === 0 ? 15 : undefined, right: i % 2 === 1 ? 15 : undefined },
                    { transform: [{ scale: starsScale }], opacity: starsScale }
                  ]}
                >
                  {star}
                </Animated.Text>
              ))}
              
              {/* Celebration badge */}
              <Animated.View 
                style={[
                  { position: 'absolute', top: '40%', alignSelf: 'center', backgroundColor: '#27AE60', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 25, flexDirection: 'row', alignItems: 'center' },
                  { transform: [{ scale: celebrationAnim }], opacity: celebrationAnim }
                ]}
              >
                <Text style={{ fontSize: 22 }}>🎉</Text>
                <Text style={{ color: '#fff', fontSize: 20, fontWeight: '800', marginHorizontal: 8 }}>Correct!</Text>
                <Text style={{ fontSize: 22 }}>🎉</Text>
              </Animated.View>
            </>
          )}
          
          {/* Wrong feedback */}
          {isCorrect === false && (
            <View style={{ position: 'absolute', bottom: 10, left: 10, right: 10, backgroundColor: '#FFEBEE', padding: 10, borderRadius: 10 }}>
              <Text style={{ fontSize: 13, color: '#C62828', textAlign: 'center' }}>❌ That's a {selectedAnswer}. Find the {matchQuestion.shape.name}! 💪</Text>
            </View>
          )}
        </View>
      </View>
    );
  }

  // Portrait layout
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
  
  // Responsive layout
  const { width: screenWidth, isLandscape, cardWidth } = useResponsiveLayout();
  const columns = isLandscape ? 4 : 2;
  const gap = isLandscape ? 10 : 12;
  const padding = isLandscape ? 15 : 15;
  const gridCardWidth = cardWidth(columns, gap, padding + insets.left + insets.right);

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
    <ImageBackground 
      source={SHAPES_BG_IMAGE} 
      style={styles.container}
      resizeMode="cover"
    >
      <StatusBar barStyle="dark-content" />

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
              <Text style={[styles.modeText, viewMode === 'grid' && styles.modeTextActive]}>📚 Learn</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modeButton, viewMode === 'match' && styles.modeButtonActive]}
              onPress={() => setViewMode('match')}
            >
              <Image source={SCREEN_ICONS.gamepad} style={[styles.modeIcon, viewMode === 'match' && styles.modeIconActive]} resizeMode="contain" />
              <Text style={[styles.modeText, viewMode === 'match' && styles.modeTextActive]}>🎮 Match</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.instructionBox}>
            <Text style={styles.instructionText}>✨ Tap to learn shapes! ✨</Text>
          </View>

          <ScrollView 
            contentContainerStyle={styles.gridContainer}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.gridWrapper}>
              {SHAPES.map((shape, index) => (
                <GridCard
                  key={shape.name}
                  shapeData={shape}
                  index={index}
                  onPress={() => openFlashcard(index)}
                  cardWidth={gridCardWidth}
                  isLandscape={isLandscape}
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
    </ImageBackground>
  );
};

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
  modeToggle: {
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
  modeButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 20,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  modeButtonActive: {
    backgroundColor: '#FFD700',
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
  gridBalloonEmoji: {
    fontSize: 18,
    textShadowColor: 'rgba(0,0,0,0.1)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  gridName: {
    fontSize: 10,
    fontWeight: '700',
    marginBottom: 4,
  },
  sidesCircle: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderWidth: 1,
    marginBottom: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  gridSides: {
    fontSize: 8,
    fontWeight: '600',
    color: '#666',
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
