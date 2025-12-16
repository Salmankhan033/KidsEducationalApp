import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  Animated,
  TouchableOpacity,
  Image,
  ImageSourcePropType,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '../constants/colors';
import { FloatingBubbles } from '../components/FloatingBubbles';
import { MENU_IMAGES } from '../assets/images';
import { ScreenHeader, MuteButton } from '../components';
import { switchBackgroundMusic } from '../utils/backgroundMusic';

const { width } = Dimensions.get('window');

interface ActivityCardProps {
  title: string;
  image: ImageSourcePropType;
  color: string;
  onPress: () => void;
  delay: number;
  emoji: string;
}

const ActivityCard: React.FC<ActivityCardProps> = ({
  title,
  image,
  color,
  onPress,
  delay,
  emoji,
}) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const bounceAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.delay(delay),
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 50,
        friction: 7,
      }),
    ]).start();

    // Subtle floating animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(bounceAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(bounceAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [scaleAnim, bounceAnim, delay]);

  const translateY = bounceAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -3],
  });

  const itemWidth = (width - 50) / 2;

  return (
    <Animated.View
      style={[
        styles.activityCard,
        {
          backgroundColor: color,
          width: itemWidth,
          transform: [{ scale: scaleAnim }],
        },
      ]}
    >
      <TouchableOpacity
        onPress={onPress}
        style={styles.activityCardTouchable}
        activeOpacity={0.85}
      >
        {/* Emoji Badge */}
        <View style={styles.emojiBadge}>
          <Text style={styles.emojiText}>{emoji}</Text>
        </View>

        {/* Image */}
        <Animated.View
          style={[
            styles.activityImageContainer,
            { transform: [{ translateY }] },
          ]}
        >
          <Image source={image} style={styles.activityImage} resizeMode="contain" />
        </Animated.View>

        {/* Title */}
        <Text style={styles.activityTitle}>{title}</Text>

        {/* Play indicator */}
        <View style={styles.playIndicator}>
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
}

const CategorySection: React.FC<CategorySectionProps> = ({
  title,
  emoji,
  activities,
  navigation,
  startDelay,
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
            delay={startDelay + index * 50}
            onPress={() => navigation.navigate(item.screen)}
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
  const titleAnim = useRef(new Animated.Value(0)).current;

  // Switch to game music when entering fun games
  useEffect(() => {
    switchBackgroundMusic('game');
    
    // Switch back to home music when leaving
    return () => {
      switchBackgroundMusic('home');
    };
  }, []);

  useEffect(() => {
    Animated.spring(titleAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 40,
      friction: 7,
    }).start();
  }, [titleAnim]);

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
    { title: 'Build', image: MENU_IMAGES.build, color: '#4D96FF', screen: 'BuildGame', emoji: '🏗️' },
    { title: 'Dress Up', image: MENU_IMAGES.dressUp, color: '#9B59B6', screen: 'DressUp', emoji: '👗' },
    { title: 'Juice Bar', image: MENU_IMAGES.juiceBar, color: '#FF8E53', screen: 'JuiceMaking', emoji: '🧃' },
    { title: 'Piano', image: MENU_IMAGES.piano, color: '#555', screen: 'PianoGame', emoji: '🎹' },
  ];

  // Life Skills
  const lifeSkills = [
    { title: 'Pet Care', image: MENU_IMAGES.petCare, color: '#FFA94D', screen: 'PetCare', emoji: '🐕' },
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
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <FloatingBubbles />
      
      {/* Mute Button - Top Right */}
      <MuteButton style={{ position: 'absolute', right: 15, top: insets.top + 15, zIndex: 100 }} size="medium" />
      
      {/* Header */}
      <ScreenHeader
        title="Fun Games"
        icon={MENU_IMAGES.fun}
        onBack={() => navigation.goBack()}
      />

      {/* Sub Header */}
      <View style={styles.subHeader}>
        <Text style={styles.subHeaderText}>🎮 Choose a game to play! 🎯</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Brain Games Section */}
        <CategorySection
          title="Brain Games"
          emoji="🧠"
          activities={brainGames}
          navigation={navigation}
          startDelay={0}
        />

        {/* Creative Section */}
        <CategorySection
          title="Creative Fun"
          emoji="🎨"
          activities={creativeActivities}
          navigation={navigation}
          startDelay={300}
        />

        {/* Life Skills Section */}
        <CategorySection
          title="Life Skills"
          emoji="⭐"
          activities={lifeSkills}
          navigation={navigation}
          startDelay={600}
        />

        {/* Fun & Discovery Section */}
        <CategorySection
          title="Fun & Discovery"
          emoji="🔍"
          activities={funDiscovery}
          navigation={navigation}
          startDelay={900}
        />

        {/* Bottom Fun Section */}
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF9E6',
  },
  subHeader: {
    paddingVertical: 10,
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  subHeaderText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#9B59B6',
  },
  scrollContent: {
    paddingHorizontal: 15,
    paddingBottom: 40,
    paddingTop: 15,
  },
  categorySection: {
    marginBottom: 25,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
    gap: 10,
  },
  categoryEmoji: {
    fontSize: 22,
  },
  categoryTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  activityGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  activityCard: {
    borderRadius: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
    overflow: 'hidden',
  },
  activityCardTouchable: {
    padding: 15,
    alignItems: 'center',
    position: 'relative',
  },
  emojiBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emojiText: {
    fontSize: 16,
  },
  activityImageContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  activityImage: {
    width: 45,
    height: 45,
  },
  activityTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: COLORS.white,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
    marginBottom: 8,
  },
  playIndicator: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 10,
  },
  playText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  bottomSection: {
    alignItems: 'center',
    paddingVertical: 25,
    marginTop: 10,
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
