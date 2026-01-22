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
  isLandscape: boolean;
  cardWidth: number;
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
  isLandscape,
  cardWidth,
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
    outputRange: [0, -6],
  });

  const imageSize = isLandscape ? 70 : 90;

  return (
    <Animated.View
      style={[
        styles.learningCard,
        { width: cardWidth, transform: [{ scale: scaleAnim }] },
      ]}
    >
      <TouchableOpacity
        onPress={onPress}
        style={[
          styles.learningCardTouchable,
          { backgroundColor, borderColor },
          isLandscape && styles.learningCardTouchableLandscape,
        ]}
        activeOpacity={0.85}
      >
        <View style={[styles.emojiBadge, { backgroundColor: borderColor }, isLandscape && styles.emojiBadgeLandscape]}>
          <Text style={[styles.emojiText, isLandscape && styles.emojiTextLandscape]}>{emoji}</Text>
        </View>

        <Animated.View
          style={[
            styles.learningImageContainer,
            { 
              transform: [{ translateY }],
              width: imageSize,
              height: imageSize,
              borderRadius: isLandscape ? 18 : 25,
            },
          ]}
        >
          <Image source={image} style={{ width: imageSize - 20, height: imageSize - 20 }} resizeMode="contain" />
        </Animated.View>

        <View style={styles.learningTextContainer}>
          <Text style={[styles.learningTitle, isLandscape && styles.learningTitleLandscape]}>{title}</Text>
          <Text style={[styles.learningSubtitle, isLandscape && styles.learningSubtitleLandscape]}>{subtitle}</Text>
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
  
  const [dimensions, setDimensions] = useState(Dimensions.get('window'));
  
  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setDimensions(window);
    });
    return () => subscription?.remove();
  }, []);

  const isLandscape = dimensions.width > dimensions.height;
  const screenWidth = dimensions.width;
  const screenHeight = dimensions.height;

  // Calculate card width based on orientation
  const cardWidth = isLandscape 
    ? (screenWidth - insets.left - insets.right - 60) / 5  // 5 cards in landscape
    : (screenWidth - 45) / 2;  // 2 cards in portrait

  // Background music
  useEffect(() => {
    const musicTimer = setTimeout(() => {
      startBackgroundMusic('home');
    }, 500);

    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active') {
        resumeBackgroundMusic();
      } else if (nextAppState === 'background' || nextAppState === 'inactive') {
        pauseBackgroundMusic();
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      clearTimeout(musicTimer);
      subscription.remove();
    };
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      switchBackgroundMusic('home');
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

  useEffect(() => {
    if (isFirstLaunch) {
      const timer = setTimeout(() => {
        setShowGenderModal(true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isFirstLaunch]);

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
      
      {/* Sky Background */}
      <View style={[styles.skyBackground, { height: screenHeight * 0.75 }]}>
        <Image source={BG_IMAGES.sun} style={[styles.bgElement, { top: 20, right: 20, width: 40, height: 40 }]} />
        <Image source={BG_IMAGES.cloud} style={[styles.bgElement, { top: 40, left: 20, width: 30, height: 22 }]} />
        <Image source={BG_IMAGES.cloud} style={[styles.bgElement, { top: 60, right: 100, width: 28, height: 20 }]} />
        <Image source={BG_IMAGES.rainbow} style={[styles.bgElement, { top: 30, left: '30%', width: 35, height: 25 }]} />
        <Image source={BG_IMAGES.bird} style={[styles.bgElement, { top: 50, left: '55%', width: 20, height: 20 }]} />
        <Image source={BG_IMAGES.butterfly} style={[styles.bgElement, { top: 80, left: '20%', width: 18, height: 18 }]} />
        <Image source={BG_IMAGES.hotAirBalloon} style={[styles.bgElement, { top: 25, left: '45%', width: 28, height: 28 }]} />
        <Image source={BG_IMAGES.kite} style={[styles.bgElement, { top: 70, right: 40, width: 22, height: 22 }]} />
      </View>

      {/* Grass Background */}
      <View style={[styles.grassBackground, { height: screenHeight * 0.3 }]}>
        <Image source={BG_IMAGES.tree} style={[styles.bgElement, { bottom: '40%', left: 10, width: 35, height: 40 }]} />
        <Image source={BG_IMAGES.tree} style={[styles.bgElement, { bottom: '45%', right: 15, width: 30, height: 35 }]} />
        <Image source={BG_IMAGES.flower} style={[styles.bgElement, { bottom: '20%', left: 60, width: 18, height: 18 }]} />
        <Image source={BG_IMAGES.tulip} style={[styles.bgElement, { bottom: '25%', right: 50, width: 16, height: 16 }]} />
        <Image source={BG_IMAGES.bee} style={[styles.bgElement, { bottom: '55%', left: '40%', width: 18, height: 18 }]} />
        <Image source={BG_IMAGES.ladybug} style={[styles.bgElement, { bottom: '30%', right: '20%', width: 16, height: 16 }]} />
      </View>
      
      {/* Gender Selection Modal */}
      <GenderSelectionModal
        visible={showGenderModal}
        onClose={() => setShowGenderModal(false)}
      />

      {/* Mute Button */}
      <MuteButton 
        style={{ 
          position: 'absolute', 
          right: insets.right + 15, 
          top: insets.top + 10, 
          zIndex: 100 
        }} 
        size="medium" 
      />

      {/* Main Content */}
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { 
            paddingLeft: insets.left + 15, 
            paddingRight: insets.right + 15,
            paddingTop: insets.top + 10,
          },
          isLandscape && styles.scrollContentLandscape,
        ]}
        showsVerticalScrollIndicator={false}
        horizontal={false}
      >
        {/* Header */}
        <Animated.View style={[
          styles.header, 
          { transform: [{ scale: titleAnim }] },
          isLandscape && styles.headerLandscape,
        ]}>
          {childImages ? (
            <View style={[
              styles.childAvatarContainer, 
              { borderColor: theme.primary },
              isLandscape && styles.childAvatarContainerLandscape,
            ]}>
              <Image
                source={childImages.avatar}
                style={[styles.childAvatar, isLandscape && styles.childAvatarLandscape]}
                resizeMode="cover"
              />
            </View>
          ) : (
            <Text style={[styles.headerEmoji, isLandscape && styles.headerEmojiLandscape]}>🌟</Text>
          )}
          <View style={styles.titleContainer}>
            <Text style={[styles.title, gender && { color: theme.primary }, isLandscape && styles.titleLandscape]}>
              {theme.title}
            </Text>
            <Text style={[styles.titleSubtext, isLandscape && styles.titleSubtextLandscape]}>
              Let's explore together! {theme.emoji}
            </Text>
          </View>
          <Text style={[styles.headerEmoji, isLandscape && styles.headerEmojiLandscape]}>
            {gender === 'male' ? '🚀' : gender === 'female' ? '🌸' : '🌈'}
          </Text>
        </Animated.View>

        {/* Daily Challenge Banner */}
        <TouchableOpacity 
          style={[styles.dailyBanner, isLandscape && styles.dailyBannerLandscape]}
          onPress={() => navigation.navigate('DailyChallenge')}
          activeOpacity={0.9}
        >
          <View style={styles.dailyBannerGlow} />
          <Image source={MENU_IMAGES.trophy} style={[styles.dailyImage, isLandscape && styles.dailyImageLandscape]} resizeMode="contain" />
          <View style={styles.dailyText}>
            <Text style={[styles.dailyTitle, isLandscape && styles.dailyTitleLandscape]}>🏆 Daily Challenge!</Text>
            <Text style={[styles.dailySubtitle, isLandscape && styles.dailySubtitleLandscape]}>Complete & collect stickers! →</Text>
          </View>
          <Text style={[styles.dailyEmoji, isLandscape && styles.dailyEmojiLandscape]}>🎁</Text>
        </TouchableOpacity>

        {/* Learning Section */}
        <View style={[styles.learningGrid, isLandscape && styles.learningGridLandscape]}>
          {learningCategories.map((item, index) => (
            <LearningCard
              key={item.title}
              title={item.title}
              subtitle={item.subtitle}
              image={item.image}
              backgroundColor={item.backgroundColor}
              borderColor={item.borderColor}
              emoji={item.emoji}
              delay={index * 60}
              onPress={() => navigation.navigate(item.screen)}
              isLandscape={isLandscape}
              cardWidth={cardWidth}
            />
          ))}
        </View>

        {/* Bottom Section - Hidden in landscape for more space */}
        {!isLandscape && (
          <>
            <View style={styles.charactersRow}>
              <Image source={MENU_IMAGES.bear} style={styles.characterImage} resizeMode="contain" />
              <Image source={MENU_IMAGES.butterfly} style={styles.characterImage} resizeMode="contain" />
              <Image source={MENU_IMAGES.star} style={styles.characterImage} resizeMode="contain" />
              <Image source={MENU_IMAGES.balloon} style={styles.characterImage} resizeMode="contain" />
              <Image source={MENU_IMAGES.unicorn} style={styles.characterImage} resizeMode="contain" />
            </View>

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
          </>
        )}
      </ScrollView>
    </View>
  );
};

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
    backgroundColor: '#87CEEB',
  },
  grassBackground: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#7CCD7C',
    borderTopLeftRadius: 80,
    borderTopRightRadius: 80,
  },
  bgElement: {
    position: 'absolute',
    opacity: 0.75,
  },
  scrollContent: {
    paddingBottom: 30,
  },
  scrollContentLandscape: {
    paddingBottom: 15,
  },
  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 20,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
    gap: 10,
  },
  headerLandscape: {
    paddingVertical: 8,
    marginBottom: 8,
    alignSelf: 'center',
    width: '60%',
  },
  headerEmoji: {
    fontSize: 26,
  },
  headerEmojiLandscape: {
    fontSize: 22,
  },
  childAvatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
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
  childAvatarContainerLandscape: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
  },
  childAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
  },
  childAvatarLandscape: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  titleContainer: {
    alignItems: 'center',
  },
  title: {
    fontSize: 17,
    fontWeight: '900',
    color: '#9B59B6',
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  titleLandscape: {
    fontSize: 15,
  },
  titleSubtext: {
    fontSize: 10,
    color: '#FF6B6B',
    fontWeight: '600',
    marginTop: 1,
  },
  titleSubtextLandscape: {
    fontSize: 9,
  },
  // Daily Banner
  dailyBanner: {
    flexDirection: 'row',
    backgroundColor: '#FFD93D',
    padding: 14,
    borderRadius: 20,
    alignItems: 'center',
    marginBottom: 12,
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
  dailyBannerLandscape: {
    padding: 10,
    marginBottom: 10,
    borderRadius: 16,
    alignSelf: 'center',
    width: '70%',
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
    width: 50,
    height: 50,
  },
  dailyImageLandscape: {
    width: 40,
    height: 40,
  },
  dailyText: { marginLeft: 12, flex: 1 },
  dailyTitle: { fontSize: 13, fontWeight: '800', color: '#333' },
  dailyTitleLandscape: { fontSize: 12 },
  dailySubtitle: { fontSize: 10, color: '#555', marginTop: 2 },
  dailySubtitleLandscape: { fontSize: 9 },
  dailyEmoji: {
    fontSize: 32,
  },
  dailyEmojiLandscape: {
    fontSize: 26,
  },
  // Learning Grid
  learningGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
  },
  learningGridLandscape: {
    gap: 8,
    justifyContent: 'center',
  },
  // Learning Card
  learningCard: {
    marginBottom: 5,
  },
  learningCardTouchable: {
    borderRadius: 20,
    borderWidth: 3,
    paddingVertical: 10,
    paddingHorizontal: 8,
    alignItems: 'center',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  learningCardTouchableLandscape: {
    borderRadius: 16,
    borderWidth: 2,
    paddingVertical: 8,
    paddingHorizontal: 6,
  },
  learningImageContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
    marginTop: 6,
    marginBottom: 6,
  },
  emojiBadge: {
    position: 'absolute',
    top: -10,
    right: 8,
    borderRadius: 16,
    width: 32,
    height: 32,
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
  emojiBadgeLandscape: {
    top: -8,
    right: 6,
    width: 26,
    height: 26,
    borderRadius: 13,
  },
  emojiText: {
    fontSize: 16,
  },
  emojiTextLandscape: {
    fontSize: 13,
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
  learningTitleLandscape: {
    fontSize: 10,
  },
  learningSubtitle: {
    fontSize: 9,
    color: '#666',
    marginTop: 1,
    fontWeight: '600',
  },
  learningSubtitleLandscape: {
    fontSize: 8,
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
    width: 45,
    height: 45,
  },
  // Bottom Section
  bottomSection: {
    alignItems: 'center',
    paddingVertical: 18,
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
    fontSize: 35,
  },
});
