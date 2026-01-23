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
  ImageBackground,
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

// Background image
const primaryBgImage = require('../images/bgImage/primary.png');

// Simple Big Button Card for Kids
interface BigButtonProps {
  title: string;
  image: ImageSourcePropType;
  bgColor: string;
  onPress: () => void;
  delay: number;
  emoji: string;
  isLandscape: boolean;
  cardSize: number;
}

const BigButton: React.FC<BigButtonProps> = ({
  title,
  image,
  bgColor,
  onPress,
  delay,
  emoji,
  isLandscape,
  cardSize,
}) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const pressAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.delay(delay),
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 60,
        friction: 8,
      }),
    ]).start();
  }, [scaleAnim, delay]);

  const handlePressIn = () => {
    Animated.spring(pressAnim, {
      toValue: 0.92,
      useNativeDriver: true,
      tension: 100,
      friction: 5,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(pressAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 100,
      friction: 5,
    }).start();
  };

  const imageSize = isLandscape ? cardSize * 0.45 : cardSize * 0.5;

  return (
    <Animated.View
      style={[
        styles.bigButton,
        { 
          width: cardSize,
          height: cardSize,
          transform: [
            { scale: Animated.multiply(scaleAnim, pressAnim) }
          ],
        },
      ]}
    >
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[styles.bigButtonInner, { backgroundColor: bgColor }]}
        activeOpacity={1}
      >
        {/* Big emoji in corner */}
        <Text style={[styles.cornerEmoji, isLandscape && styles.cornerEmojiLandscape]}>
          {emoji}
        </Text>

        {/* Main icon */}
        <View style={styles.iconCircle}>
          <Image 
            source={image} 
            style={{ width: imageSize, height: imageSize }} 
            resizeMode="contain" 
          />
        </View>

        {/* Title */}
        <Text style={[styles.buttonTitle, isLandscape && styles.buttonTitleLandscape]}>
          {title}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

interface HomeScreenProps {
  navigation: any;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { gender, isFirstLaunch, childImages, theme } = useGender();
  const [showGenderModal, setShowGenderModal] = useState(false);
  const headerAnim = useRef(new Animated.Value(0)).current;
  
  const [dimensions, setDimensions] = useState(Dimensions.get('window'));
  
  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setDimensions(window);
    });
    return () => subscription?.remove();
  }, []);

  const isLandscape = dimensions.width > dimensions.height;
  const screenWidth = dimensions.width;

  // Calculate card size - bigger cards for easy tapping
  const cardSize = isLandscape 
    ? Math.min((screenWidth - insets.left - insets.right - 100) / 5, 140)
    : (screenWidth - 60) / 2;

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
    Animated.spring(headerAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 50,
      friction: 8,
    }).start();
  }, [headerAnim]);

  useEffect(() => {
    if (isFirstLaunch) {
      const timer = setTimeout(() => {
        setShowGenderModal(true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isFirstLaunch]);

  // Simple, colorful categories for kids
  const categories = [
    {
      title: 'ABC',
      image: MENU_IMAGES.learnABC,
      bgColor: '#FF6B6B',
      screen: 'Alphabets',
      emoji: '🔤',
    },
    {
      title: '123',
      image: MENU_IMAGES.numbers,
      bgColor: '#4ECDC4',
      screen: 'Numbers',
      emoji: '🔢',
    },
    {
      title: 'Shapes',
      image: MENU_IMAGES.shapes,
      bgColor: '#45B7D1',
      screen: 'Shapes',
      emoji: '⭐',
    },
    {
      title: 'Songs',
      image: MENU_IMAGES.abcSongs,
      bgColor: '#96CEB4',
      screen: 'Songs',
      emoji: '🎵',
    },
    {
      title: 'Games',
      image: MENU_IMAGES.fun,
      bgColor: '#FFEAA7',
      screen: 'Fun',
      emoji: '🎮',
    },
    {
      title: 'Challenge',
      image: MENU_IMAGES.trophy,
      bgColor: '#DDA0DD',
      screen: 'DailyChallenge',
      emoji: '🏆',
    },
  ];

  return (
    <ImageBackground 
      source={primaryBgImage} 
      style={styles.container}
      resizeMode="cover"
    >
      <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />
      
      {/* Gender Selection Modal */}
      <GenderSelectionModal
        visible={showGenderModal}
        onClose={() => setShowGenderModal(false)}
      />

      {/* Mute Button */}
      <MuteButton 
        style={{ 
          position: 'absolute', 
          right: insets.right + 16, 
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
            paddingLeft: insets.left + 20, 
            paddingRight: insets.right + 20,
            paddingTop: insets.top + 10,
          },
          isLandscape && styles.scrollContentLandscape,
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Simple Welcome Header */}
        <Animated.View 
          style={[
            styles.header, 
            { transform: [{ scale: headerAnim }] },
            isLandscape && styles.headerLandscape,
          ]}
        >
          {childImages ? (
            <Image
              source={childImages.avatar}
              style={[styles.avatar, isLandscape && styles.avatarLandscape]}
              resizeMode="cover"
            />
          ) : (
            <Text style={[styles.helloEmoji, isLandscape && styles.helloEmojiLandscape]}>
              👋
            </Text>
          )}
          <View style={styles.welcomeText}>
            <Text style={[styles.hello, isLandscape && styles.helloLandscape]}>
              Hello! {theme.emoji}
            </Text>
            <Text style={[styles.subtitle, isLandscape && styles.subtitleLandscape]}>
              What do you want to learn?
            </Text>
          </View>
        </Animated.View>

        {/* Big Colorful Buttons Grid */}
        <View style={[styles.grid, isLandscape && styles.gridLandscape]}>
          {categories.map((item, index) => (
            <BigButton
              key={item.title}
              title={item.title}
              image={item.image}
              bgColor={item.bgColor}
              emoji={item.emoji}
              delay={index * 80}
              onPress={() => navigation.navigate(item.screen)}
              isLandscape={isLandscape}
              cardSize={cardSize}
            />
          ))}
        </View>

        {/* Bottom space */}
        <View style={{ height: isLandscape ? 20 : 80 }} />
      </ScrollView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  scrollContentLandscape: {
    paddingBottom: 10,
  },
  
  // Header - Simple and friendly
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 25,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  headerLandscape: {
    marginBottom: 15,
    padding: 12,
    alignSelf: 'center',
    width: '60%',
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 3,
    borderColor: '#FFD93D',
  },
  avatarLandscape: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  helloEmoji: {
    fontSize: 50,
  },
  helloEmojiLandscape: {
    fontSize: 40,
  },
  welcomeText: {
    marginLeft: 15,
    flex: 1,
  },
  hello: {
    fontSize: 28,
    fontWeight: '800',
    color: '#333',
  },
  helloLandscape: {
    fontSize: 22,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
    fontWeight: '500',
  },
  subtitleLandscape: {
    fontSize: 14,
    marginTop: 2,
  },
  
  // Grid
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  gridLandscape: {
    justifyContent: 'center',
    gap: 15,
  },
  
  // Big Button - Easy for kids to tap
  bigButton: {
    marginBottom: 20,
  },
  bigButtonInner: {
    flex: 1,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 8,
    borderWidth: 4,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  cornerEmoji: {
    position: 'absolute',
    top: 12,
    right: 12,
    fontSize: 24,
  },
  cornerEmojiLandscape: {
    top: 8,
    right: 8,
    fontSize: 18,
  },
  iconCircle: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 100,
    padding: 12,
    marginBottom: 10,
  },
  buttonTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFF',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
    textAlign: 'center',
  },
  buttonTitleLandscape: {
    fontSize: 15,
    marginBottom: 0,
  },
});
