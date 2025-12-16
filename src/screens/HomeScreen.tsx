import React, { useRef, useEffect, useState } from 'react';
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
  StatusBar,
  AppState,
  AppStateStatus,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MENU_IMAGES } from '../assets/images';
import { GenderSelectionModal, MuteButton } from '../components';
import { useGender } from '../context/GenderContext';
import {
  startBackgroundMusic,
  pauseBackgroundMusic,
  resumeBackgroundMusic,
  switchBackgroundMusic,
  ensureMusicPlaying,
} from '../utils/backgroundMusic';

const { width, height } = Dimensions.get('window');

// Decorative background images - reliable CDN images
const BG_IMAGES = {
  sun: { uri: 'https://cdn-icons-png.flaticon.com/512/869/869869.png' },
  cloud: { uri: 'https://cdn-icons-png.flaticon.com/512/1163/1163661.png' },
  rainbow: { uri: 'https://cdn-icons-png.flaticon.com/512/2310/2310282.png' },
  star: { uri: 'https://cdn-icons-png.flaticon.com/512/1828/1828884.png' },
  butterfly: { uri: 'https://cdn-icons-png.flaticon.com/512/809/809052.png' },
  flower: { uri: 'https://cdn-icons-png.flaticon.com/512/2990/2990870.png' },
  tulip: { uri: 'https://cdn-icons-png.flaticon.com/512/2990/2990862.png' },
  tree: { uri: 'https://cdn-icons-png.flaticon.com/512/2713/2713505.png' },
  bird: { uri: 'https://cdn-icons-png.flaticon.com/512/3069/3069172.png' },
  bee: { uri: 'https://cdn-icons-png.flaticon.com/512/809/809110.png' },
  ladybug: { uri: 'https://cdn-icons-png.flaticon.com/512/809/809115.png' },
  sparkle: { uri: 'https://cdn-icons-png.flaticon.com/512/5765/5765112.png' },
  hotAirBalloon: { uri: 'https://cdn-icons-png.flaticon.com/512/3306/3306687.png' },
  plane: { uri: 'https://cdn-icons-png.flaticon.com/512/3125/3125713.png' },
  rocket: { uri: 'https://cdn-icons-png.flaticon.com/512/3306/3306571.png' },
  kite: { uri: 'https://cdn-icons-png.flaticon.com/512/3163/3163723.png' },
  mushroom: { uri: 'https://cdn-icons-png.flaticon.com/512/2909/2909763.png' },
  caterpillar: { uri: 'https://cdn-icons-png.flaticon.com/512/809/809119.png' },
  snail: { uri: 'https://cdn-icons-png.flaticon.com/512/809/809118.png' },
  dragonfly: { uri: 'https://cdn-icons-png.flaticon.com/512/809/809053.png' },
};

// Card border colors
const CARD_BORDER_COLORS = ['#FF6B6B', '#27AE60', '#3498DB', '#9B59B6', '#F39C12'];

// Large Learning Card Component - Kid-friendly design
interface LearningCardProps {
  title: string;
  subtitle: string;
  image: ImageSourcePropType;
  backgroundColor: string;
  borderColor: string;
  onPress: () => void;
  delay: number;
  emoji: string;
}

const LearningCard: React.FC<LearningCardProps> = ({
  title,
  subtitle,
  image,
  backgroundColor,
  borderColor,
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
        friction: 6,
      }),
    ]).start();

    // Continuous subtle bounce animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(bounceAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(bounceAnim, {
          toValue: 0,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [scaleAnim, bounceAnim, delay]);

  const translateY = bounceAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -8],
  });

  return (
    <Animated.View
      style={[
        styles.learningCard,
        {
          transform: [{ scale: scaleAnim }],
        },
      ]}
    >
      <TouchableOpacity
        onPress={onPress}
        style={[styles.learningCardTouchable, { backgroundColor, borderColor }]}
        activeOpacity={0.85}
      >
        {/* Emoji Badge - Top Right */}
        <View style={[styles.emojiBadge, { backgroundColor: borderColor }]}>
          <Text style={styles.emojiText}>{emoji}</Text>
        </View>

        {/* Main Image - Large */}
        <Animated.View
          style={[
            styles.learningImageContainer,
            { transform: [{ translateY }] },
          ]}
        >
          <Image source={image} style={styles.learningImage} resizeMode="contain" />
        </Animated.View>

        {/* Title Section - Smaller Text */}
        <View style={styles.learningTextContainer}>
          <Text style={styles.learningTitle}>{title}</Text>
          <Text style={styles.learningSubtitle}>{subtitle}</Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

interface HomeScreenProps {
  navigation: any;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const titleAnim = useRef(new Animated.Value(0)).current;
  const { gender, isFirstLaunch, childImages, theme } = useGender();
  const [showGenderModal, setShowGenderModal] = useState(false);

  // Background music - plays continuously and loops forever
  useEffect(() => {
    // Small delay to ensure TTS is initialized first
    const musicTimer = setTimeout(() => {
      // Start/switch to home music (ABC Song) when HomeScreen mounts
      startBackgroundMusic('home');
    }, 500);

    // Handle app state changes (pause when app goes to background)
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active') {
        resumeBackgroundMusic();
      } else if (nextAppState === 'background' || nextAppState === 'inactive') {
        pauseBackgroundMusic();
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    // Cleanup: only remove listener, don't stop music (let it play continuously across screens)
    return () => {
      clearTimeout(musicTimer);
      subscription.remove();
      // Note: Music continues playing when navigating to other screens
    };
  }, []);

  // When returning to HomeScreen, ensure home music is playing
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      switchBackgroundMusic('home');
      // Also ensure music is actually playing
      setTimeout(() => {
        ensureMusicPlaying();
      }, 500);
    });
    return unsubscribe;
  }, [navigation]);

  useEffect(() => {
    Animated.spring(titleAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 40,
      friction: 7,
    }).start();
  }, [titleAnim]);

  // Show gender selection modal on first launch
  useEffect(() => {
    if (isFirstLaunch) {
      // Delay showing modal slightly for smooth entrance
      const timer = setTimeout(() => {
        setShowGenderModal(true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isFirstLaunch]);

  // Learning Categories - Enhanced with more details
  const learningCategories = [
    {
      title: 'Learn ABC',
      subtitle: 'Letters & Words',
      image: MENU_IMAGES.learnABC,
      backgroundColor: '#FFE5E5',
      borderColor: '#FF6B6B',
      screen: 'Alphabets',
      emoji: '🔤',
    },
    {
      title: 'Numbers',
      subtitle: '1, 2, 3... Count!',
      image: MENU_IMAGES.numbers,
      backgroundColor: '#E5F3FF',
      borderColor: '#4D96FF',
      screen: 'Numbers',
      emoji: '🔢',
    },
    {
      title: 'Shapes',
      subtitle: 'Circle, Square...',
      image: MENU_IMAGES.shapes,
      backgroundColor: '#E8F8E8',
      borderColor: '#6BCB77',
      screen: 'Shapes',
      emoji: '🔷',
    },
    {
      title: 'ABC Songs',
      subtitle: 'Sing & Learn!',
      image: MENU_IMAGES.abcSongs,
      backgroundColor: '#F3E5FF',
      borderColor: '#9B59B6',
      screen: 'Songs',
      emoji: '🎵',
    },
    {
      title: 'Fun Games',
      subtitle: 'Play & Learn!',
      image: MENU_IMAGES.fun,
      backgroundColor: '#FFF3E5',
      borderColor: '#FF8E53',
      screen: 'Fun',
      emoji: '🎮',
    },
  ];


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
        <Image source={BG_IMAGES.hotAirBalloon} style={styles.bgHotAirBalloon} />
        <Image source={BG_IMAGES.kite} style={styles.bgKite} />
        <Image source={BG_IMAGES.dragonfly} style={styles.bgDragonfly} />
      </View>

      {/* Grass with flowers and creatures */}
      <View style={styles.grassBackground}>
        <Image source={BG_IMAGES.tree} style={styles.bgTree1} />
        <Image source={BG_IMAGES.tree} style={styles.bgTree2} />
        <Image source={BG_IMAGES.flower} style={styles.bgFlower1} />
        <Image source={BG_IMAGES.tulip} style={styles.bgFlower2} />
        <Image source={BG_IMAGES.flower} style={styles.bgFlower3} />
        <Image source={BG_IMAGES.tulip} style={styles.bgFlower4} />
        <Image source={BG_IMAGES.bee} style={styles.bgBee} />
        <Image source={BG_IMAGES.ladybug} style={styles.bgLadybug} />
        <Image source={BG_IMAGES.mushroom} style={styles.bgMushroom1} />
        <Image source={BG_IMAGES.mushroom} style={styles.bgMushroom2} />
        <Image source={BG_IMAGES.caterpillar} style={styles.bgCaterpillar} />
        <Image source={BG_IMAGES.snail} style={styles.bgSnail} />
      </View>
      
      {/* Gender Selection Modal */}
      <GenderSelectionModal
        visible={showGenderModal}
        onClose={() => setShowGenderModal(false)}
      />

      {/* Mute Button - Top Right */}
      <MuteButton style={{ position: 'absolute', right: 15, top: insets.top + 15, zIndex: 100 }} size="medium" />

      {/* Header */}
      <View style={[styles.header, { marginTop: insets.top + 10 }]}>
        <Animated.View style={[styles.headerContent, { transform: [{ scale: titleAnim }] }]}>
          {/* Child Avatar based on gender */}
          {childImages ? (
            <View style={[styles.childAvatarContainer, { borderColor: theme.primary }]}>
              <Image
                source={childImages.avatar}
                style={styles.childAvatar}
                resizeMode="cover"
              />
            </View>
          ) : (
            <Text style={styles.headerEmoji}>🌟</Text>
          )}
          <View style={styles.titleContainer}>
            <Text style={[styles.title, gender && { color: theme.primary }]}>
              {theme.title}
            </Text>
            <Text style={styles.titleSubtext}>
              Let's explore together! {theme.emoji}
            </Text>
          </View>
          <Text style={styles.headerEmoji}>{gender === 'male' ? '🚀' : gender === 'female' ? '🌸' : '🌈'}</Text>
        </Animated.View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Daily Challenge Banner - Enhanced */}
        <TouchableOpacity 
          style={styles.dailyBanner}
          onPress={() => navigation.navigate('DailyChallenge')}
          activeOpacity={0.9}
        >
          <View style={styles.dailyBannerGlow} />
          <Image source={MENU_IMAGES.trophy} style={styles.dailyImage} resizeMode="contain" />
          <View style={styles.dailyText}>
            <Text style={styles.dailyTitle}>🏆 Daily Challenge!</Text>
            <Text style={styles.dailySubtitle}>Complete & collect stickers! →</Text>
          </View>
          <Text style={styles.dailyEmoji}>🎁</Text>
        </TouchableOpacity>

        {/* Instruction Box */}
        <View style={styles.instructionBox}>
          <Text style={styles.instructionText}>✨ Tap to start your learning journey! ✨</Text>
        </View>

        {/* Learning Section - Grid Layout like AlphabetsScreen */}
        <View style={styles.section}>
          <View style={styles.learningGrid}>
            {learningCategories.map((item, index) => (
              <LearningCard
                key={item.title}
                title={item.title}
                subtitle={item.subtitle}
                image={item.image}
                backgroundColor={item.backgroundColor}
                borderColor={item.borderColor}
                emoji={item.emoji}
                delay={index * 80}
                onPress={() => navigation.navigate(item.screen)}
              />
            ))}
          </View>
        </View>

        {/* Fun Characters */}
        <View style={styles.charactersRow}>
          <Image source={MENU_IMAGES.bear} style={styles.characterImage} resizeMode="contain" />
          <Image source={MENU_IMAGES.butterfly} style={styles.characterImage} resizeMode="contain" />
          <Image source={MENU_IMAGES.star} style={styles.characterImage} resizeMode="contain" />
          <Image source={MENU_IMAGES.balloon} style={styles.characterImage} resizeMode="contain" />
          <Image source={MENU_IMAGES.unicorn} style={styles.characterImage} resizeMode="contain" />
        </View>

        {/* Bottom Fun Section */}
        <View style={styles.bottomSection}>
          <Text style={styles.bottomText}>🌟 Keep Learning, Keep Growing! 🌟</Text>
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
    backgroundColor: '#87CEEB',
  },
  // Sky Background
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
    width: 45,
    height: 45,
    opacity: 0.9,
  },
  bgCloud1: {
    position: 'absolute',
    top: 60,
    left: 20,
    width: 35,
    height: 25,
    opacity: 0.7,
  },
  bgCloud2: {
    position: 'absolute',
    top: 100,
    right: 80,
    width: 30,
    height: 22,
    opacity: 0.65,
  },
  bgCloud3: {
    position: 'absolute',
    top: 140,
    left: width * 0.4,
    width: 32,
    height: 24,
    opacity: 0.7,
  },
  bgRainbow: {
    position: 'absolute',
    top: 80,
    left: width * 0.28,
    width: 40,
    height: 28,
    opacity: 0.7,
  },
  bgStar1: {
    position: 'absolute',
    top: 180,
    left: 30,
    width: 18,
    height: 18,
    opacity: 0.6,
  },
  bgStar2: {
    position: 'absolute',
    top: 200,
    right: 40,
    width: 14,
    height: 14,
    opacity: 0.5,
  },
  bgSparkle1: {
    position: 'absolute',
    top: 120,
    left: 80,
    width: 16,
    height: 16,
    opacity: 0.55,
  },
  bgSparkle2: {
    position: 'absolute',
    top: 160,
    right: 60,
    width: 14,
    height: 14,
    opacity: 0.45,
  },
  bgBird1: {
    position: 'absolute',
    top: 100,
    left: width * 0.6,
    width: 22,
    height: 22,
    opacity: 0.75,
  },
  bgBird2: {
    position: 'absolute',
    top: 130,
    left: width * 0.72,
    width: 18,
    height: 18,
    opacity: 0.65,
    transform: [{ scaleX: -1 }],
  },
  bgButterfly: {
    position: 'absolute',
    top: 175,
    left: width * 0.18,
    width: 20,
    height: 20,
    opacity: 0.7,
  },
  bgHotAirBalloon: {
    position: 'absolute',
    top: 65,
    left: width * 0.48,
    width: 32,
    height: 32,
    opacity: 0.75,
  },
  bgKite: {
    position: 'absolute',
    top: 145,
    right: 30,
    width: 24,
    height: 24,
    opacity: 0.7,
  },
  bgDragonfly: {
    position: 'absolute',
    top: 195,
    left: width * 0.58,
    width: 18,
    height: 18,
    opacity: 0.65,
  },
  // Grass Background
  grassBackground: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: height * 0.35,
    backgroundColor: '#7CCD7C',
    borderTopLeftRadius: 100,
    borderTopRightRadius: 100,
  },
  bgTree1: {
    position: 'absolute',
    bottom: height * 0.15,
    left: 10,
    width: 40,
    height: 45,
    opacity: 0.85,
  },
  bgTree2: {
    position: 'absolute',
    bottom: height * 0.17,
    right: 15,
    width: 35,
    height: 40,
    opacity: 0.8,
  },
  bgFlower1: {
    position: 'absolute',
    bottom: height * 0.08,
    left: 60,
    width: 20,
    height: 20,
    opacity: 0.85,
  },
  bgFlower2: {
    position: 'absolute',
    bottom: height * 0.1,
    left: width * 0.3,
    width: 18,
    height: 18,
    opacity: 0.8,
  },
  bgFlower3: {
    position: 'absolute',
    bottom: height * 0.07,
    right: width * 0.3,
    width: 18,
    height: 18,
    opacity: 0.85,
  },
  bgFlower4: {
    position: 'absolute',
    bottom: height * 0.09,
    right: 50,
    width: 18,
    height: 18,
    opacity: 0.8,
  },
  bgBee: {
    position: 'absolute',
    bottom: height * 0.2,
    left: width * 0.4,
    width: 22,
    height: 22,
    opacity: 0.85,
  },
  bgLadybug: {
    position: 'absolute',
    bottom: height * 0.13,
    right: width * 0.18,
    width: 18,
    height: 18,
    opacity: 0.8,
  },
  bgMushroom1: {
    position: 'absolute',
    bottom: height * 0.06,
    left: width * 0.18,
    width: 18,
    height: 18,
    opacity: 0.8,
  },
  bgMushroom2: {
    position: 'absolute',
    bottom: height * 0.05,
    right: width * 0.22,
    width: 15,
    height: 15,
    opacity: 0.75,
  },
  bgCaterpillar: {
    position: 'absolute',
    bottom: height * 0.08,
    left: width * 0.48,
    width: 20,
    height: 20,
    opacity: 0.8,
  },
  bgSnail: {
    position: 'absolute',
    bottom: height * 0.11,
    right: width * 0.38,
    width: 18,
    height: 18,
    opacity: 0.75,
  },
  // Header
  header: {
    alignItems: 'center',
    paddingVertical: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    marginHorizontal: 15,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerEmoji: {
    fontSize: 28,
  },
  childAvatarContainer: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
    overflow: 'hidden',
  },
  childAvatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
  },
  titleContainer: {
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '900',
    color: '#9B59B6',
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  titleSubtext: {
    fontSize: 10,
    color: '#FF6B6B',
    fontWeight: '600',
    marginTop: 1,
  },
  scrollContent: {
    paddingHorizontal: 15,
    paddingBottom: 40,
    paddingTop: 15,
  },
  // Daily Banner
  dailyBanner: {
    flexDirection: 'row',
    backgroundColor: '#FFD93D',
    padding: 18,
    borderRadius: 25,
    alignItems: 'center',
    marginBottom: 15,
    shadowColor: '#FFD93D',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
    borderWidth: 3,
    borderColor: '#FFC107',
    position: 'relative',
    overflow: 'hidden',
  },
  dailyBannerGlow: {
    position: 'absolute',
    top: -50,
    right: -50,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  dailyImage: {
    width: 55,
    height: 55,
  },
  dailyText: { marginLeft: 12, flex: 1 },
  dailyTitle: { fontSize: 14, fontWeight: '800', color: '#333' },
  dailySubtitle: { fontSize: 10, color: '#555', marginTop: 2 },
  dailyEmoji: {
    fontSize: 35,
  },
  // Instruction Box
  instructionBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 18,
    marginBottom: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  instructionText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#9B59B6',
    textAlign: 'center',
  },
  // Section
  section: {
    marginBottom: 10,
  },
  learningGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
  },
  // Learning Card - Grid Style like AlphabetsScreen
  learningCard: {
    width: (width - 45) / 2, // 2 cards per row with spacing
    marginBottom: 5,
  },
  learningCardTouchable: {
    borderRadius: 22,
    borderWidth: 4,
    paddingVertical: 12,
    paddingHorizontal: 10,
    alignItems: 'center',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  learningImageContainer: {
    width: 110,
    height: 110,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
    marginTop: 8,
    marginBottom: 8,
  },
  learningImage: {
    width: 90,
    height: 90,
  },
  emojiBadge: {
    position: 'absolute',
    top: -12,
    right: 10,
    borderRadius: 18,
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.8)',
  },
  emojiText: {
    fontSize: 18,
  },
  learningTextContainer: {
    alignItems: 'center',
  },
  learningTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#333',
    textAlign: 'center',
  },
  learningSubtitle: {
    fontSize: 9,
    color: '#666',
    marginTop: 1,
    fontWeight: '600',
  },
  // Characters Row
  charactersRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 15,
    width: '100%',
    paddingHorizontal: 10,
    marginTop: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: 25,
  },
  characterImage: {
    width: 50,
    height: 50,
  },
  // Bottom Section
  bottomSection: {
    alignItems: 'center',
    paddingVertical: 20,
    marginTop: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: 25,
  },
  bottomText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#9B59B6',
    marginBottom: 10,
  },
  bottomEmojis: {
    flexDirection: 'row',
    gap: 12,
  },
  bottomEmoji: {
    fontSize: 38,
  },
});
