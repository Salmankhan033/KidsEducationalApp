import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Animated,
  Dimensions,
  Image,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useGender, Gender, CHILD_IMAGES } from '../context/GenderContext';
import { speak, setVoiceGender } from '../utils/speech';

interface GenderSelectionModalProps {
  visible: boolean;
  onClose: () => void;
}

const GenderSelectionModal: React.FC<GenderSelectionModalProps> = ({ visible, onClose }) => {
  const { setGender, setIsFirstLaunch } = useGender();
  const insets = useSafeAreaInsets();
  
  const [dimensions, setDimensions] = useState(Dimensions.get('window'));
  
  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setDimensions(window);
    });
    return () => subscription?.remove();
  }, []);

  const isLandscape = dimensions.width > dimensions.height;
  
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const bounceAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // Fade in animation
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();

      // Scale animation for content
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        delay: 100,
        tension: 60,
        friction: 7,
      }).start();

      // Bounce animation for characters
      Animated.loop(
        Animated.sequence([
          Animated.timing(bounceAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(bounceAnim, {
            toValue: 0,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      fadeAnim.setValue(0);
      scaleAnim.setValue(0);
    }
  }, [visible, scaleAnim, bounceAnim, fadeAnim]);

  const handleGenderSelect = async (selectedGender: Gender) => {
    await setGender(selectedGender);
    await setVoiceGender(selectedGender);
    await new Promise(resolve => setTimeout(resolve, 200));
    
    if (selectedGender === 'male') {
      await speak('Hey champion! Let\'s learn and play together!');
    } else if (selectedGender === 'female') {
      await speak('Hello princess! Let\'s have fun learning!');
    }
    
    await setIsFirstLaunch(false);
    onClose();
  };

  const translateY = bounceAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -8],
  });

  const cardSize = isLandscape ? 90 : 110;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        {/* Decorative background elements */}
        <View style={styles.decorationsContainer}>
          <Text style={[styles.floatingEmoji, { top: '8%', left: '5%' }]}>⭐</Text>
          <Text style={[styles.floatingEmoji, { top: '12%', right: '8%' }]}>🌈</Text>
          <Text style={[styles.floatingEmoji, { bottom: '15%', left: '8%' }]}>🎈</Text>
          <Text style={[styles.floatingEmoji, { top: '40%', left: '3%' }]}>🦋</Text>
          <Text style={[styles.floatingEmoji, { bottom: '20%', right: '5%' }]}>🌟</Text>
          <Text style={[styles.floatingEmoji, { top: '5%', left: '45%' }]}>🎉</Text>
        </View>

        <Animated.View
          style={[
            styles.contentContainer,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
              paddingLeft: insets.left + 20,
              paddingRight: insets.right + 20,
              paddingTop: insets.top + 10,
              paddingBottom: insets.bottom + 10,
            },
          ]}
        >
          <ScrollView 
            contentContainerStyle={[
              styles.scrollContent,
              isLandscape && styles.scrollContentLandscape
            ]}
            showsVerticalScrollIndicator={false}
          >
            {/* Left side - Title Section */}
            <View style={[
              styles.titleSection,
              isLandscape && styles.titleSectionLandscape
            ]}>
              <Text style={[styles.welcomeEmoji, isLandscape && styles.welcomeEmojiLandscape]}>👋</Text>
              <Text style={[styles.title, isLandscape && styles.titleLandscape]}>Welcome!</Text>
              <Text style={[styles.subtitle, isLandscape && styles.subtitleLandscape]}>Who's learning today?</Text>
              <View style={[styles.messageContainer, isLandscape && styles.messageContainerLandscape]}>
                <Text style={[styles.message, isLandscape && styles.messageLandscape]}>🎨 Let's make learning fun! 🎨</Text>
              </View>
            </View>

            {/* Right side - Gender Cards */}
            <View style={[
              styles.cardsContainer,
              isLandscape && styles.cardsContainerLandscape
            ]}>
              {/* Boy Card */}
              <TouchableOpacity
                style={[
                  styles.genderCard, 
                  styles.boyCard,
                  isLandscape && styles.genderCardLandscape
                ]}
                onPress={() => handleGenderSelect('male')}
                activeOpacity={0.85}
              >
                <View style={[styles.cardGlow, styles.boyGlow]} />
                <View style={styles.emojiContainer}>
                  <Text style={[styles.cardEmoji, isLandscape && styles.cardEmojiLandscape]}>🚀</Text>
                  <Text style={[styles.cardEmoji, isLandscape && styles.cardEmojiLandscape]}>⭐</Text>
                </View>
                <Animated.View style={[
                  styles.imageContainer, 
                  styles.boyImageBg, 
                  { 
                    transform: [{ translateY }],
                    width: cardSize,
                    height: cardSize,
                    borderRadius: cardSize / 2,
                  }
                ]}>
                  <Image
                    source={CHILD_IMAGES.male.avatar}
                    style={[
                      styles.characterImage,
                      {
                        width: cardSize - 8,
                        height: cardSize - 8,
                        borderRadius: (cardSize - 8) / 2,
                      }
                    ]}
                    resizeMode="cover"
                  />
                </Animated.View>
                <Text style={[styles.genderLabel, styles.boyLabel, isLandscape && styles.genderLabelLandscape]}>I'm a Boy!</Text>
                <Text style={[styles.genderDescription, isLandscape && styles.genderDescriptionLandscape]}>Adventure awaits! 🎮</Text>
                <View style={styles.sparkles}>
                  <Text style={styles.sparkleEmoji}>✨</Text>
                  <Text style={styles.sparkleEmoji}>💫</Text>
                </View>
              </TouchableOpacity>

              {/* Girl Card */}
              <TouchableOpacity
                style={[
                  styles.genderCard, 
                  styles.girlCard,
                  isLandscape && styles.genderCardLandscape
                ]}
                onPress={() => handleGenderSelect('female')}
                activeOpacity={0.85}
              >
                <View style={[styles.cardGlow, styles.girlGlow]} />
                <View style={styles.emojiContainer}>
                  <Text style={[styles.cardEmoji, isLandscape && styles.cardEmojiLandscape]}>🌸</Text>
                  <Text style={[styles.cardEmoji, isLandscape && styles.cardEmojiLandscape]}>💖</Text>
                </View>
                <Animated.View style={[
                  styles.imageContainer, 
                  styles.girlImageBg, 
                  { 
                    transform: [{ translateY }],
                    width: cardSize,
                    height: cardSize,
                    borderRadius: cardSize / 2,
                  }
                ]}>
                  <Image
                    source={CHILD_IMAGES.female.avatar}
                    style={[
                      styles.characterImage,
                      {
                        width: cardSize - 8,
                        height: cardSize - 8,
                        borderRadius: (cardSize - 8) / 2,
                      }
                    ]}
                    resizeMode="cover"
                  />
                </Animated.View>
                <Text style={[styles.genderLabel, styles.girlLabel, isLandscape && styles.genderLabelLandscape]}>I'm a Girl!</Text>
                <Text style={[styles.genderDescription, isLandscape && styles.genderDescriptionLandscape]}>Magic awaits! ✨</Text>
                <View style={styles.sparkles}>
                  <Text style={styles.sparkleEmoji}>🦋</Text>
                  <Text style={styles.sparkleEmoji}>🌟</Text>
                </View>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: '#FFFAF0',
  },
  decorationsContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 0,
  },
  floatingEmoji: {
    position: 'absolute',
    fontSize: 28,
  },
  contentContainer: {
    flex: 1,
    zIndex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
  },
  scrollContentLandscape: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 30,
  },
  titleSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  titleSectionLandscape: {
    marginBottom: 0,
    marginRight: 20,
    flex: 0.35,
    justifyContent: 'center',
  },
  welcomeEmoji: {
    fontSize: 50,
    marginBottom: 8,
  },
  welcomeEmojiLandscape: {
    fontSize: 40,
    marginBottom: 5,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: '#9B59B6',
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  titleLandscape: {
    fontSize: 24,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 5,
    fontWeight: '600',
  },
  subtitleLandscape: {
    fontSize: 14,
    marginTop: 3,
  },
  cardsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 15,
  },
  cardsContainerLandscape: {
    flex: 0.65,
    gap: 20,
  },
  genderCard: {
    alignItems: 'center',
    padding: 18,
    borderRadius: 25,
    borderWidth: 4,
    position: 'relative',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
    minWidth: 150,
  },
  genderCardLandscape: {
    padding: 14,
    borderRadius: 20,
    minWidth: 140,
    flex: 1,
    maxWidth: 200,
  },
  boyCard: {
    backgroundColor: '#E6F3FF',
    borderColor: '#4A90D9',
  },
  girlCard: {
    backgroundColor: '#FFF0F5',
    borderColor: '#FF69B4',
  },
  cardGlow: {
    position: 'absolute',
    top: -30,
    right: -30,
    width: 80,
    height: 80,
    borderRadius: 40,
    opacity: 0.3,
  },
  boyGlow: {
    backgroundColor: '#4A90D9',
  },
  girlGlow: {
    backgroundColor: '#FF69B4',
  },
  emojiContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 5,
    marginBottom: 5,
  },
  cardEmoji: {
    fontSize: 20,
  },
  cardEmojiLandscape: {
    fontSize: 16,
  },
  imageContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 4,
    borderColor: 'rgba(255,255,255,0.8)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
    overflow: 'hidden',
  },
  boyImageBg: {
    backgroundColor: '#B8E2FF',
  },
  girlImageBg: {
    backgroundColor: '#FFD1E8',
  },
  characterImage: {
    // Dynamic sizing applied inline
  },
  sparkles: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginTop: 4,
  },
  sparkleEmoji: {
    fontSize: 14,
  },
  genderLabel: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 3,
  },
  genderLabelLandscape: {
    fontSize: 16,
    marginBottom: 2,
  },
  boyLabel: {
    color: '#4A90D9',
  },
  girlLabel: {
    color: '#FF69B4',
  },
  genderDescription: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
  },
  genderDescriptionLandscape: {
    fontSize: 11,
  },
  messageContainer: {
    alignItems: 'center',
    marginTop: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 15,
    shadowColor: '#9B59B6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  messageContainerLandscape: {
    marginTop: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  message: {
    fontSize: 14,
    fontWeight: '700',
    color: '#9B59B6',
  },
  messageLandscape: {
    fontSize: 12,
  },
});

export default GenderSelectionModal;
