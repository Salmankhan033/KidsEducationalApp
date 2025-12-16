import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Animated,
  Dimensions,
  Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useGender, Gender, CHILD_IMAGES, GENDER_THEMES } from '../context/GenderContext';
import { speak, setVoiceGender } from '../utils/speech';

const { width, height } = Dimensions.get('window');

interface GenderSelectionModalProps {
  visible: boolean;
  onClose: () => void;
}

const GenderSelectionModal: React.FC<GenderSelectionModalProps> = ({ visible, onClose }) => {
  const { setGender, setIsFirstLaunch } = useGender();
  const insets = useSafeAreaInsets();
  
  const slideAnim = useRef(new Animated.Value(height)).current;
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const bounceAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // Slide up animation
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 50,
        friction: 8,
      }).start();

      // Scale animation for content
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        delay: 200,
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
      Animated.timing(slideAnim, {
        toValue: height,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, slideAnim, scaleAnim, bounceAnim]);

  const handleGenderSelect = async (selectedGender: Gender) => {
    // Set the gender in context
    await setGender(selectedGender);
    
    // Set the voice based on gender and wait for it
    await setVoiceGender(selectedGender);
    
    // Small delay to ensure voice is set
    await new Promise(resolve => setTimeout(resolve, 200));
    
    // Play welcome message with appropriate voice
    if (selectedGender === 'male') {
      await speak('Hey champion! Let\'s learn and play together!');
    } else if (selectedGender === 'female') {
      await speak('Hello princess! Let\'s have fun learning!');
    }
    
    // Mark first launch as complete
    await setIsFirstLaunch(false);
    
    // Close modal
    onClose();
  };

  const translateY = bounceAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -10],
  });

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
          <Text style={[styles.floatingEmoji, styles.emoji1]}>⭐</Text>
          <Text style={[styles.floatingEmoji, styles.emoji2]}>🌈</Text>
          <Text style={[styles.floatingEmoji, styles.emoji3]}>🎈</Text>
          <Text style={[styles.floatingEmoji, styles.emoji4]}>🦋</Text>
          <Text style={[styles.floatingEmoji, styles.emoji5]}>🌟</Text>
          <Text style={[styles.floatingEmoji, styles.emoji6]}>🎉</Text>
        </View>

        <Animated.View
          style={[
            styles.bottomSheet,
            {
              transform: [{ translateY: slideAnim }],
              paddingBottom: insets.bottom + 20,
            },
          ]}
        >
          {/* Handle bar */}
          <View style={styles.handleBar} />

          {/* Title Section */}
          <Animated.View style={[styles.titleSection, { transform: [{ scale: scaleAnim }] }]}>
            <Text style={styles.welcomeEmoji}>👋</Text>
            <Text style={styles.title}>Welcome Little One!</Text>
            <Text style={styles.subtitle}>Who's going to learn today?</Text>
          </Animated.View>

          {/* Gender Selection Cards */}
          <Animated.View style={[styles.cardsContainer, { transform: [{ scale: scaleAnim }] }]}>
            {/* Boy Card */}
            <TouchableOpacity
              style={[styles.genderCard, styles.boyCard]}
              onPress={() => handleGenderSelect('male')}
              activeOpacity={0.85}
            >
              <View style={[styles.cardGlow, styles.boyGlow]} />
              <View style={styles.emojiContainer}>
                <Text style={styles.cardEmoji}>🚀</Text>
                <Text style={styles.cardEmoji}>⭐</Text>
              </View>
              <Animated.View style={[styles.imageContainer, styles.boyImageBg, { transform: [{ translateY }] }]}>
                <Image
                  source={CHILD_IMAGES.male.avatar}
                  style={styles.characterImage}
                  resizeMode="cover"
                />
              </Animated.View>
              <Text style={[styles.genderLabel, styles.boyLabel]}>I'm a Boy!</Text>
              <Text style={styles.genderDescription}>Adventure awaits! 🎮</Text>
              <View style={styles.sparkles}>
                <Text style={styles.sparkleEmoji}>✨</Text>
                <Text style={styles.sparkleEmoji}>💫</Text>
              </View>
            </TouchableOpacity>

            {/* Girl Card */}
            <TouchableOpacity
              style={[styles.genderCard, styles.girlCard]}
              onPress={() => handleGenderSelect('female')}
              activeOpacity={0.85}
            >
              <View style={[styles.cardGlow, styles.girlGlow]} />
              <View style={styles.emojiContainer}>
                <Text style={styles.cardEmoji}>🌸</Text>
                <Text style={styles.cardEmoji}>💖</Text>
              </View>
              <Animated.View style={[styles.imageContainer, styles.girlImageBg, { transform: [{ translateY }] }]}>
                <Image
                  source={CHILD_IMAGES.female.avatar}
                  style={styles.characterImage}
                  resizeMode="cover"
                />
              </Animated.View>
              <Text style={[styles.genderLabel, styles.girlLabel]}>I'm a Girl!</Text>
              <Text style={styles.genderDescription}>Magic awaits! ✨</Text>
              <View style={styles.sparkles}>
                <Text style={styles.sparkleEmoji}>🦋</Text>
                <Text style={styles.sparkleEmoji}>🌟</Text>
              </View>
            </TouchableOpacity>
          </Animated.View>

          {/* Fun message */}
          <Animated.View style={[styles.messageContainer, { transform: [{ scale: scaleAnim }] }]}>
            <Text style={styles.message}>🎨 Let's make learning fun together! 🎨</Text>
          </Animated.View>

          {/* Decorative bottom elements */}
          <View style={styles.bottomDecoration}>
            <Text style={styles.decorEmoji}>🌈</Text>
            <Text style={styles.decorEmoji}>⭐</Text>
            <Text style={styles.decorEmoji}>🎈</Text>
            <Text style={styles.decorEmoji}>🦄</Text>
            <Text style={styles.decorEmoji}>🌟</Text>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  decorationsContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  floatingEmoji: {
    position: 'absolute',
    fontSize: 30,
  },
  emoji1: {
    top: '10%',
    left: '10%',
  },
  emoji2: {
    top: '15%',
    right: '15%',
  },
  emoji3: {
    top: '25%',
    left: '20%',
  },
  emoji4: {
    top: '20%',
    right: '25%',
  },
  emoji5: {
    top: '30%',
    left: '8%',
  },
  emoji6: {
    top: '35%',
    right: '10%',
  },
  bottomSheet: {
    backgroundColor: '#FFFAF0',
    borderTopLeftRadius: 35,
    borderTopRightRadius: 35,
    paddingTop: 12,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -5 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 10,
  },
  handleBar: {
    width: 50,
    height: 5,
    backgroundColor: '#DDD',
    borderRadius: 3,
    alignSelf: 'center',
    marginBottom: 15,
  },
  titleSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  welcomeEmoji: {
    fontSize: 50,
    marginBottom: 10,
  },
  title: {
    fontSize: 26,
    fontWeight: '900',
    color: '#9B59B6',
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 5,
    fontWeight: '600',
  },
  cardsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    gap: 15,
  },
  genderCard: {
    flex: 1,
    alignItems: 'center',
    padding: 20,
    borderRadius: 25,
    borderWidth: 4,
    position: 'relative',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
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
    fontSize: 22,
  },
  imageContainer: {
    width: 110,
    height: 110,
    borderRadius: 55,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
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
    width: 102,
    height: 102,
    borderRadius: 51,
  },
  sparkles: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    marginTop: 5,
  },
  sparkleEmoji: {
    fontSize: 16,
  },
  genderLabel: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 4,
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
  messageContainer: {
    alignItems: 'center',
    marginBottom: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  message: {
    fontSize: 14,
    fontWeight: '700',
    color: '#9B59B6',
  },
  bottomDecoration: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
  },
  decorEmoji: {
    fontSize: 25,
  },
});

export default GenderSelectionModal;
