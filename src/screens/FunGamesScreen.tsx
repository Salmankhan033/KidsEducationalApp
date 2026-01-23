import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Animated,
  TouchableOpacity,
  Image,
  ImageBackground,
  ImageSourcePropType,
  Dimensions,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '../constants/colors';
import { MENU_IMAGES } from '../assets/images';
import { switchBackgroundMusic } from '../utils/backgroundMusic';

// Background Image
const GAMES_BG_IMAGE = require('../images/bgImage/GamesImageBG.png');

const { width } = Dimensions.get('window');

// Card background colors for colorful UI
const CARD_BG_COLORS = [
  '#FFE5E5', '#E5F6FF', '#F0E5FF', '#E5FFE8', 
  '#FFF5E5', '#FFE5F5', '#E5FFFF', '#FFF0E5',
  '#F5FFE5', '#E5FFFA', '#FFE8E5', '#E5E8FF',
];

interface ActivityCardProps {
  title: string;
  image: ImageSourcePropType;
  color: string;
  onPress: () => void;
  delay: number;
  emoji: string;
  index: number;
}

const CARD_WIDTH = (width - 40) / 2;

const ActivityCard: React.FC<ActivityCardProps> = ({
  title,
  image,
  color,
  onPress,
  delay,
  emoji,
  index,
}) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;
  const bgColor = CARD_BG_COLORS[index % CARD_BG_COLORS.length];

  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      delay: delay,
      tension: 80,
      friction: 6,
    }).start();

    // Floating animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, { toValue: -3, duration: 1200, useNativeDriver: true }),
        Animated.timing(floatAnim, { toValue: 0, duration: 1200, useNativeDriver: true }),
      ])
    ).start();
  }, [scaleAnim, floatAnim, delay]);

  return (
    <Animated.View
      style={[
        styles.activityCard,
        {
          backgroundColor: bgColor,
          borderColor: color,
          transform: [{ scale: scaleAnim }, { translateY: floatAnim }],
        },
      ]}
    >
      <TouchableOpacity
        onPress={onPress}
        style={styles.activityCardTouchable}
        activeOpacity={0.9}
      >
        {/* Sparkle decorations */}
        <Text style={styles.sparkleLeft}>✨</Text>
        <Text style={styles.sparkleRight}>⭐</Text>

        {/* Colored icon circle with shine */}
        <View style={[styles.activityImageContainer, { backgroundColor: color }]}>
          <View style={styles.iconShine} />
          <Image source={image} style={styles.activityImage} resizeMode="contain" />
        </View>

        <Text style={[styles.activityTitle, { color: color }]}>{title}</Text>

        {/* Fun play button */}
        <View style={[styles.playIndicator, { backgroundColor: color }]}>
          <Text style={styles.playText}>▶ Play</Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

interface CategorySectionProps {
  title: string;
  emoji: string;
  activities: Array<{
    title: string;
    image: ImageSourcePropType;
    color: string;
    screen: string;
    emoji: string;
  }>;
  navigation: any;
  startDelay: number;
  startIndex: number;
}

const CategorySection: React.FC<CategorySectionProps> = ({
  title,
  emoji,
  activities,
  navigation,
  startDelay,
  startIndex,
}) => {
  return (
    <View style={styles.categorySection}>
      <View style={styles.categoryHeader}>
        <Text style={styles.categoryEmoji}>{emoji}</Text>
        <Text style={styles.categoryTitle}>{title}</Text>
        <Text style={styles.categoryEmoji}>{emoji}</Text>
      </View>
      <View style={styles.activityGrid}>
        {activities.map((item, index) => (
          <ActivityCard
            key={item.title}
            title={item.title}
            image={item.image}
            color={item.color}
            emoji={item.emoji}
            delay={startDelay + index * 30}
            onPress={() => navigation.navigate(item.screen)}
            index={startIndex + index}
          />
        ))}
      </View>
    </View>
  );
};

interface FunGamesScreenProps {
  navigation: any;
}

export const FunGamesScreen: React.FC<FunGamesScreenProps> = ({ navigation }) => {
  const insets = useSafeAreaInsets();

  useEffect(() => {
    switchBackgroundMusic('game');
    return () => {
      switchBackgroundMusic('home');
    };
  }, []);

  // Brain Games
  const brainGames = [
    { title: 'Memory', image: MENU_IMAGES.memory, color: '#FF8E53', screen: 'MemoryGame', emoji: '🧠' },
    { title: 'Puzzles', image: MENU_IMAGES.puzzles, color: '#4ECDC4', screen: 'PuzzleGame', emoji: '🧩' },
    { title: 'Patterns', image: MENU_IMAGES.patterns, color: '#9B59B6', screen: 'PatternGame', emoji: '🔷' },
    { title: 'Shadows', image: MENU_IMAGES.shadows, color: '#555', screen: 'ShadowMatch', emoji: '👤' },
    { title: 'Maze', image: MENU_IMAGES.maze, color: '#6BCB77', screen: 'MazeGame', emoji: '🌀' },
    { title: 'Quiz', image: MENU_IMAGES.quiz, color: '#FF6B6B', screen: 'QuizGame', emoji: '❓' },
    { title: 'Match Lines', image: MENU_IMAGES.puzzles, color: '#3498DB', screen: 'MatchLine', emoji: '🔗' },
    { title: 'Opposites', image: MENU_IMAGES.patterns, color: '#E91E63', screen: 'Opposites', emoji: '🔄' },
    { title: 'Size Compare', image: MENU_IMAGES.sorting, color: '#FF9800', screen: 'SizeCompare', emoji: '📏' },
    { title: 'Counting', image: MENU_IMAGES.numbers, color: '#8BC34A', screen: 'CountingGame', emoji: '🔢' },
    { title: 'Find Pairs', image: MENU_IMAGES.memory, color: '#00BCD4', screen: 'FindPair', emoji: '🐧' },
    { title: 'Shape Match', image: MENU_IMAGES.shapes, color: '#673AB7', screen: 'ShapeInObject', emoji: '🔷' },
  ];

  // Creative Activities
  const creativeActivities = [
    { title: 'Coloring', image: MENU_IMAGES.coloring, color: '#FF6B9D', screen: 'Coloring', emoji: '🎨' },
    { title: 'Tracing', image: MENU_IMAGES.tracing, color: '#FFD93D', screen: 'TracingGame', emoji: '✏️' },
    { title: 'Pop It!', image: MENU_IMAGES.build, color: '#FF6B6B', screen: 'BuildGame', emoji: '🎈' },
    { title: 'Tap It!', image: MENU_IMAGES.dressUp, color: '#4CAF50', screen: 'DressUp', emoji: '🐱' },
    { title: 'Juice Bar', image: MENU_IMAGES.juiceBar, color: '#FF8E53', screen: 'JuiceMaking', emoji: '🧃' },
    { title: 'Piano', image: MENU_IMAGES.piano, color: '#555', screen: 'PianoGame', emoji: '🎹' },
  ];

  // Life Skills
  const lifeSkills = [
    { title: 'Body Parts', image: MENU_IMAGES.emotions, color: '#FF6B9D', screen: 'BodyParts', emoji: '🧍' },
    { title: 'Clean Room', image: MENU_IMAGES.cleanRoom, color: '#6BCB77', screen: 'CleanRoom', emoji: '🧹' },
    { title: 'Manners', image: MENU_IMAGES.manners, color: '#FF6B9D', screen: 'MannersGame', emoji: '🤝' },
    { title: 'Steps', image: MENU_IMAGES.steps, color: '#4ECDC4', screen: 'StepByStep', emoji: '📝' },
    { title: 'Food Sort', image: MENU_IMAGES.foodSort, color: '#FF6B6B', screen: 'FoodSorting', emoji: '🍎' },
    { title: 'Emotions', image: MENU_IMAGES.emotions, color: '#FFD93D', screen: 'EmotionsGame', emoji: '😊' },
  ];

  // Fun & Discovery
  const funDiscovery = [
    { title: 'Find It', image: MENU_IMAGES.findIt, color: '#4D96FF', screen: 'FindObject', emoji: '🔍' },
    { title: 'Animals', image: MENU_IMAGES.animals, color: '#6BCB77', screen: 'AnimalHabitat', emoji: '🦁' },
    { title: 'Sounds', image: MENU_IMAGES.sounds, color: '#9B59B6', screen: 'SoundGame', emoji: '🔊' },
    { title: 'Stories', image: MENU_IMAGES.stories, color: '#FF8E53', screen: 'StoryGame', emoji: '📖' },
    { title: 'Sorting', image: MENU_IMAGES.sorting, color: '#4ECDC4', screen: 'SortingGame', emoji: '📦' },
    { title: 'Rhythm', image: MENU_IMAGES.rhythm, color: '#FF6B6B', screen: 'RhythmGame', emoji: '🥁' },
  ];

  return (
    <ImageBackground 
      source={GAMES_BG_IMAGE} 
      style={styles.container}
      resizeMode="cover"
    >
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={[styles.header, { marginTop: insets.top + 10 }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>🎮 Fun Games</Text>
        <View style={styles.headerSpace} />
      </View>

      {/* Instructions */}
      <View style={styles.instructionBox}>
        <Text style={styles.instructionText}>🎮 Choose a game to play! 🎯</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <CategorySection
          title="Brain Games"
          emoji="🧠"
          activities={brainGames}
          navigation={navigation}
          startDelay={0}
          startIndex={0}
        />

        <CategorySection
          title="Creative Fun"
          emoji="🎨"
          activities={creativeActivities}
          navigation={navigation}
          startDelay={100}
          startIndex={12}
        />

        <CategorySection
          title="Life Skills"
          emoji="⭐"
          activities={lifeSkills}
          navigation={navigation}
          startDelay={200}
          startIndex={18}
        />

        <CategorySection
          title="Fun & Discovery"
          emoji="🔍"
          activities={funDiscovery}
          navigation={navigation}
          startDelay={300}
          startIndex={24}
        />

        <View style={styles.bottomSection}>
          <Text style={styles.bottomText}>🌟 Have Fun Learning! 🌟</Text>
          <View style={styles.bottomEmojis}>
            <Text style={styles.bottomEmoji}>🎈</Text>
            <Text style={styles.bottomEmoji}>🎪</Text>
            <Text style={styles.bottomEmoji}>🎠</Text>
            <Text style={styles.bottomEmoji}>🎡</Text>
            <Text style={styles.bottomEmoji}>🎢</Text>
          </View>
        </View>
      </ScrollView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  // Header styles - matching AlphabetsScreen
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    marginBottom: 10,
  },
  backBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  backText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FF6B6B',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#9B59B6',
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  headerSpace: {
    width: 70,
  },
  // Instruction box
  instructionBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    marginHorizontal: 15,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginBottom: 10,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFD93D',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  instructionText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#9B59B6',
    textAlign: 'center',
  },
  scrollContent: {
    paddingBottom: 40,
    paddingTop: 10,
    paddingHorizontal: 15,
  },
  // Category section
  categorySection: {
    marginBottom: 20,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    gap: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginHorizontal: 20,
  },
  categoryEmoji: {
    fontSize: 20,
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  activityGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 10,
  },
  // Activity card - colorful style
  activityCard: {
    width: CARD_WIDTH,
    borderRadius: 22,
    marginBottom: 10,
    borderWidth: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
    overflow: 'visible',
  },
  activityCardTouchable: {
    padding: 12,
    paddingTop: 15,
    paddingBottom: 12,
    alignItems: 'center',
    position: 'relative',
  },
  // Sparkle decorations
  sparkleLeft: {
    position: 'absolute',
    top: 5,
    left: 5,
    fontSize: 14,
  },
  sparkleRight: {
    position: 'absolute',
    top: 5,
    right: 5,
    fontSize: 14,
  },
  // Icon container with shine
  activityImageContainer: {
    width: 55,
    height: 55,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
    overflow: 'hidden',
  },
  iconShine: {
    position: 'absolute',
    top: 5,
    left: 8,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  activityImage: {
    width: 32,
    height: 32,
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 8,
  },
  // Play button
  playIndicator: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  playText: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.white,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
  // Bottom section
  bottomSection: {
    alignItems: 'center',
    paddingVertical: 25,
    marginTop: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    borderRadius: 20,
    marginHorizontal: 10,
  },
  bottomText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#9B59B6',
    marginBottom: 15,
  },
  bottomEmojis: {
    flexDirection: 'row',
    gap: 15,
  },
  bottomEmoji: {
    fontSize: 28,
  },
});
