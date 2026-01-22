import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
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
import { useResponsiveLayout } from '../utils/useResponsiveLayout';

interface ActivityCardProps {
  title: string;
  image: ImageSourcePropType;
  color: string;
  onPress: () => void;
  delay: number;
  emoji: string;
  cardWidth: number;
  isLandscape: boolean;
}

const ActivityCard: React.FC<ActivityCardProps> = ({
  title,
  image,
  color,
  onPress,
  delay,
  emoji,
  cardWidth,
  isLandscape,
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

  const imageSize = isLandscape ? 35 : 45;
  const containerSize = isLandscape ? 45 : 60;

  return (
    <Animated.View
      style={[
        styles.activityCard,
        {
          backgroundColor: color,
          width: cardWidth,
          transform: [{ scale: scaleAnim }],
        },
        isLandscape && styles.activityCardLandscape,
      ]}
    >
      <TouchableOpacity
        onPress={onPress}
        style={[styles.activityCardTouchable, isLandscape && styles.activityCardTouchableLandscape]}
        activeOpacity={0.85}
      >
        <View style={[styles.emojiBadge, isLandscape && styles.emojiBadgeLandscape]}>
          <Text style={[styles.emojiText, isLandscape && styles.emojiTextLandscape]}>{emoji}</Text>
        </View>

        <Animated.View
          style={[
            styles.activityImageContainer,
            { 
              transform: [{ translateY }],
              width: containerSize,
              height: containerSize,
              borderRadius: containerSize / 2,
            },
          ]}
        >
          <Image source={image} style={{ width: imageSize, height: imageSize }} resizeMode="contain" />
        </Animated.View>

        <Text style={[styles.activityTitle, isLandscape && styles.activityTitleLandscape]}>{title}</Text>

        <View style={[styles.playIndicator, isLandscape && styles.playIndicatorLandscape]}>
          <Text style={[styles.playText, isLandscape && styles.playTextLandscape]}>▶ Play</Text>
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
  cardWidth: number;
  isLandscape: boolean;
}

const CategorySection: React.FC<CategorySectionProps> = ({
  title,
  emoji,
  activities,
  navigation,
  startDelay,
  cardWidth,
  isLandscape,
}) => {
  return (
    <View style={[styles.categorySection, isLandscape && styles.categorySectionLandscape]}>
      <View style={[styles.categoryHeader, isLandscape && styles.categoryHeaderLandscape]}>
        <Text style={[styles.categoryEmoji, isLandscape && styles.categoryEmojiLandscape]}>{emoji}</Text>
        <Text style={[styles.categoryTitle, isLandscape && styles.categoryTitleLandscape]}>{title}</Text>
        <Text style={[styles.categoryEmoji, isLandscape && styles.categoryEmojiLandscape]}>{emoji}</Text>
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
            cardWidth={cardWidth}
            isLandscape={isLandscape}
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
  const { width, isLandscape, cardWidth } = useResponsiveLayout();
  const titleAnim = useRef(new Animated.Value(0)).current;

  // Calculate responsive card width
  const columns = isLandscape ? 6 : 2;
  const gap = isLandscape ? 8 : 10;
  const padding = isLandscape ? 10 : 15;
  const responsiveCardWidth = cardWidth(columns, gap, padding + insets.left + insets.right);

  useEffect(() => {
    switchBackgroundMusic('game');
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
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <FloatingBubbles />
      
      <MuteButton 
        style={{ 
          position: 'absolute', 
          right: insets.right + 15, 
          top: insets.top + 10, 
          zIndex: 100 
        }} 
        size={isLandscape ? 'small' : 'medium'} 
      />
      
      <ScreenHeader
        title="Fun Games"
        icon={MENU_IMAGES.fun}
        onBack={() => navigation.goBack()}
      />

      <View style={[styles.subHeader, isLandscape && styles.subHeaderLandscape]}>
        <Text style={[styles.subHeaderText, isLandscape && styles.subHeaderTextLandscape]}>
          🎮 Choose a game to play! 🎯
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { 
            paddingLeft: insets.left + padding, 
            paddingRight: insets.right + padding 
          },
          isLandscape && styles.scrollContentLandscape,
        ]}
        showsVerticalScrollIndicator={false}
      >
        <CategorySection
          title="Brain Games"
          emoji="🧠"
          activities={brainGames}
          navigation={navigation}
          startDelay={0}
          cardWidth={responsiveCardWidth}
          isLandscape={isLandscape}
        />

        <CategorySection
          title="Creative Fun"
          emoji="🎨"
          activities={creativeActivities}
          navigation={navigation}
          startDelay={100}
          cardWidth={responsiveCardWidth}
          isLandscape={isLandscape}
        />

        <CategorySection
          title="Life Skills"
          emoji="⭐"
          activities={lifeSkills}
          navigation={navigation}
          startDelay={200}
          cardWidth={responsiveCardWidth}
          isLandscape={isLandscape}
        />

        <CategorySection
          title="Fun & Discovery"
          emoji="🔍"
          activities={funDiscovery}
          navigation={navigation}
          startDelay={300}
          cardWidth={responsiveCardWidth}
          isLandscape={isLandscape}
        />

        {!isLandscape && (
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
        )}
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
  subHeaderLandscape: {
    paddingVertical: 6,
  },
  subHeaderText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#9B59B6',
  },
  subHeaderTextLandscape: {
    fontSize: 14,
  },
  scrollContent: {
    paddingBottom: 40,
    paddingTop: 15,
  },
  scrollContentLandscape: {
    paddingBottom: 20,
    paddingTop: 10,
  },
  categorySection: {
    marginBottom: 25,
  },
  categorySectionLandscape: {
    marginBottom: 15,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
    gap: 10,
  },
  categoryHeaderLandscape: {
    marginBottom: 10,
    gap: 8,
  },
  categoryEmoji: {
    fontSize: 22,
  },
  categoryEmojiLandscape: {
    fontSize: 18,
  },
  categoryTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  categoryTitleLandscape: {
    fontSize: 16,
  },
  activityGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    gap: 8,
  },
  activityCard: {
    borderRadius: 20,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
    overflow: 'hidden',
  },
  activityCardLandscape: {
    borderRadius: 14,
    marginBottom: 6,
  },
  activityCardTouchable: {
    padding: 15,
    alignItems: 'center',
    position: 'relative',
  },
  activityCardTouchableLandscape: {
    padding: 10,
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
  emojiBadgeLandscape: {
    top: 5,
    right: 5,
    width: 22,
    height: 22,
    borderRadius: 11,
  },
  emojiText: {
    fontSize: 16,
  },
  emojiTextLandscape: {
    fontSize: 12,
  },
  activityImageContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
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
  activityTitleLandscape: {
    fontSize: 11,
    marginBottom: 5,
  },
  playIndicator: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 10,
  },
  playIndicatorLandscape: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  playText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  playTextLandscape: {
    fontSize: 10,
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
