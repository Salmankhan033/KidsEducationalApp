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
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useGender, Gender } from '../context/GenderContext';
import { speak, setVoiceGender } from '../utils/speech';

// Import character images from bgImage folder
const SelectBoyImage = require('../images/bgImage/SelectBoy.png');
const SelectGirlImage = require('../images/bgImage/SelectGirl.png');

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
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const bounceAnim = useRef(new Animated.Value(0)).current;
  const boySlideAnim = useRef(new Animated.Value(-150)).current;
  const girlSlideAnim = useRef(new Animated.Value(150)).current;
  const titleScaleAnim = useRef(new Animated.Value(0)).current;
  const starRotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // Reset animations
      boySlideAnim.setValue(-150);
      girlSlideAnim.setValue(150);
      titleScaleAnim.setValue(0);
      
      // Fade in animation
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }).start();

      // Title bounce in
      Animated.spring(titleScaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        delay: 150,
        tension: 60,
        friction: 6,
      }).start();

      // Slide in characters
      Animated.parallel([
        Animated.spring(boySlideAnim, {
          toValue: 0,
          useNativeDriver: true,
          delay: 250,
          tension: 45,
          friction: 8,
        }),
        Animated.spring(girlSlideAnim, {
          toValue: 0,
          useNativeDriver: true,
          delay: 350,
          tension: 45,
          friction: 8,
        }),
      ]).start();

      // Continuous bounce animation for characters
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

      // Star rotation animation
      Animated.loop(
        Animated.timing(starRotateAnim, {
          toValue: 1,
          duration: 5000,
          useNativeDriver: true,
        })
      ).start();
    } else {
      fadeAnim.setValue(0);
      boySlideAnim.setValue(-150);
      girlSlideAnim.setValue(150);
    }
  }, [visible, bounceAnim, fadeAnim, boySlideAnim, girlSlideAnim, titleScaleAnim, starRotateAnim]);

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
    outputRange: [0, -10],
  });

  const starRotate = starRotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  // Calculate responsive sizes
  const cardWidth = isLandscape 
    ? Math.min((dimensions.width - 100) / 2.5, 220)
    : Math.min((dimensions.width - 60) / 2, 180);
  
  const characterHeight = isLandscape 
    ? Math.min(dimensions.height * 0.5, 200) 
    : Math.min(dimensions.height * 0.32, 260);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <Animated.View
          style={[
            styles.container,
            {
              opacity: fadeAnim,
              paddingLeft: insets.left + 16,
              paddingRight: insets.right + 16,
              paddingTop: insets.top + 10,
              paddingBottom: insets.bottom + 10,
            },
          ]}
        >
          {/* Floating decorative elements */}
          <View style={styles.decorationsContainer}>
            <Animated.Text style={[styles.floatingEmoji, styles.emoji1, { transform: [{ rotate: starRotate }] }]}>⭐</Animated.Text>
            <Text style={[styles.floatingEmoji, styles.emoji2]}>🌈</Text>
            <Animated.Text style={[styles.floatingEmoji, styles.emoji3, { transform: [{ rotate: starRotate }] }]}>✨</Animated.Text>
            <Text style={[styles.floatingEmoji, styles.emoji4]}>🎈</Text>
            <Animated.Text style={[styles.floatingEmoji, styles.emoji5, { transform: [{ rotate: starRotate }] }]}>🌟</Animated.Text>
            <Text style={[styles.floatingEmoji, styles.emoji6]}>🦋</Text>
            <Text style={[styles.floatingEmoji, styles.emoji7]}>🎉</Text>
            <Animated.Text style={[styles.floatingEmoji, styles.emoji8, { transform: [{ rotate: starRotate }] }]}>💫</Animated.Text>
            <Text style={[styles.floatingEmoji, styles.emoji9]}>🎀</Text>
            <Text style={[styles.floatingEmoji, styles.emoji10]}>🚀</Text>
          </View>

          {/* Title Section */}
          <Animated.View style={[
            styles.titleSection,
            isLandscape && styles.titleSectionLandscape,
            { transform: [{ scale: titleScaleAnim }] }
          ]}>
            <View style={styles.titleContainer}>
              <Text style={[styles.welcomeEmoji, isLandscape && styles.welcomeEmojiLandscape]}>🎊</Text>
              <View style={styles.titleTextContainer}>
                <Text style={[styles.title, isLandscape && styles.titleLandscape]}>Welcome!</Text>
                <Text style={[styles.subtitle, isLandscape && styles.subtitleLandscape]}>Who's learning today?</Text>
              </View>
              <Text style={[styles.welcomeEmoji, isLandscape && styles.welcomeEmojiLandscape]}>🎊</Text>
            </View>
          </Animated.View>

          {/* Character Cards Container */}
          <View style={[
            styles.cardsContainer,
            isLandscape && styles.cardsContainerLandscape
          ]}>
            {/* Boy Card */}
            <Animated.View style={[
              styles.cardWrapper,
              { 
                transform: [{ translateX: boySlideAnim }],
                width: cardWidth,
              }
            ]}>
              <TouchableOpacity
                style={[styles.genderCard, styles.boyCard]}
                onPress={() => handleGenderSelect('male')}
                activeOpacity={0.9}
              >
                {/* Background decoration circles */}
                <View style={[styles.bgCircle, styles.boyBgCircle1]} />
                <View style={[styles.bgCircle, styles.boyBgCircle2]} />
                
                {/* Decorative corner elements */}
                <View style={[styles.cornerDecor, styles.topLeftDecor]}>
                  <Text style={styles.cornerEmoji}>🚀</Text>
                </View>
                <View style={[styles.cornerDecor, styles.topRightDecor]}>
                  <Text style={styles.cornerEmoji}>⭐</Text>
                </View>

                {/* Character Image */}
                <Animated.View style={[
                  styles.characterContainer,
                  { transform: [{ translateY }] }
                ]}>
                  <Image
                    source={SelectBoyImage}
                    style={[
                      styles.characterImage,
                      { height: characterHeight, width: cardWidth - 20 }
                    ]}
                    resizeMode="contain"
                  />
                </Animated.View>

                {/* Label Section */}
                <View style={styles.labelSection}>
                  <View style={[styles.labelBadge, styles.boyBadge]}>
                    <Text style={[styles.genderLabel, isLandscape && styles.genderLabelLandscape]}>
                      I'm a Boy! 🎮
                    </Text>
                  </View>
                  <Text style={[styles.genderDescription, isLandscape && styles.genderDescriptionLandscape]}>
                    Adventure awaits!
                  </Text>
                </View>

                {/* Bottom sparkles */}
                <View style={styles.sparklesRow}>
                  <Text style={styles.sparkle}>✨</Text>
                  <Text style={styles.sparkle}>💫</Text>
                  <Text style={styles.sparkle}>⚡</Text>
                </View>
              </TouchableOpacity>
            </Animated.View>

            {/* Girl Card */}
            <Animated.View style={[
              styles.cardWrapper,
              { 
                transform: [{ translateX: girlSlideAnim }],
                width: cardWidth,
              }
            ]}>
              <TouchableOpacity
                style={[styles.genderCard, styles.girlCard]}
                onPress={() => handleGenderSelect('female')}
                activeOpacity={0.9}
              >
                {/* Background decoration circles */}
                <View style={[styles.bgCircle, styles.girlBgCircle1]} />
                <View style={[styles.bgCircle, styles.girlBgCircle2]} />
                
                {/* Decorative corner elements */}
                <View style={[styles.cornerDecor, styles.topLeftDecor]}>
                  <Text style={styles.cornerEmoji}>🌸</Text>
                </View>
                <View style={[styles.cornerDecor, styles.topRightDecor]}>
                  <Text style={styles.cornerEmoji}>💖</Text>
                </View>

                {/* Character Image */}
                <Animated.View style={[
                  styles.characterContainer,
                  { transform: [{ translateY }] }
                ]}>
                  <Image
                    source={SelectGirlImage}
                    style={[
                      styles.characterImage,
                      { height: characterHeight, width: cardWidth - 20 }
                    ]}
                    resizeMode="contain"
                  />
                </Animated.View>

                {/* Label Section */}
                <View style={styles.labelSection}>
                  <View style={[styles.labelBadge, styles.girlBadge]}>
                    <Text style={[styles.genderLabel, isLandscape && styles.genderLabelLandscape]}>
                      I'm a Girl! 👑
                    </Text>
                  </View>
                  <Text style={[styles.genderDescription, isLandscape && styles.genderDescriptionLandscape]}>
                    Magic awaits!
                  </Text>
                </View>

                {/* Bottom sparkles */}
                <View style={styles.sparklesRow}>
                  <Text style={styles.sparkle}>🌟</Text>
                  <Text style={styles.sparkle}>💕</Text>
                  <Text style={styles.sparkle}>✨</Text>
                </View>
              </TouchableOpacity>
            </Animated.View>
          </View>

          {/* Bottom Message */}
          <Animated.View style={[
            styles.bottomMessage,
            isLandscape && styles.bottomMessageLandscape,
            { transform: [{ scale: titleScaleAnim }] }
          ]}>
            <View style={styles.messageContainer}>
              <Text style={[styles.messageText, isLandscape && styles.messageTextLandscape]}>
                🎨 Let's make learning fun together! 🎨
              </Text>
            </View>
          </Animated.View>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: '#FFF9E6',
  },
  container: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
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
    fontSize: 32,
    opacity: 0.85,
  },
  emoji1: { top: '6%', left: '6%' },
  emoji2: { top: '4%', right: '6%' },
  emoji3: { top: '18%', left: '12%' },
  emoji4: { bottom: '15%', left: '4%' },
  emoji5: { bottom: '22%', right: '5%' },
  emoji6: { top: '50%', left: '2%' },
  emoji7: { top: '2%', left: '48%' },
  emoji8: { bottom: '8%', right: '12%' },
  emoji9: { bottom: '35%', left: '8%' },
  emoji10: { top: '35%', right: '3%' },
  titleSection: {
    alignItems: 'center',
    zIndex: 1,
    marginTop: 12,
  },
  titleSectionLandscape: {
    marginTop: 6,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.95)',
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 35,
    shadowColor: '#9B59B6',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 3,
    borderColor: '#E8D4F8',
  },
  titleTextContainer: {
    alignItems: 'center',
    marginHorizontal: 14,
  },
  welcomeEmoji: {
    fontSize: 40,
  },
  welcomeEmojiLandscape: {
    fontSize: 30,
  },
  title: {
    fontSize: 36,
    fontWeight: '900',
    color: '#9B59B6',
    textShadowColor: 'rgba(155, 89, 182, 0.3)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  titleLandscape: {
    fontSize: 28,
  },
  subtitle: {
    fontSize: 18,
    color: '#7B68EE',
    fontWeight: '700',
    marginTop: 3,
  },
  subtitleLandscape: {
    fontSize: 15,
    marginTop: 2,
  },
  cardsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
    flex: 1,
    zIndex: 1,
  },
  cardsContainerLandscape: {
    gap: 35,
  },
  cardWrapper: {
    alignItems: 'center',
  },
  genderCard: {
    borderRadius: 28,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
    paddingTop: 14,
    paddingBottom: 16,
    paddingHorizontal: 10,
    alignItems: 'center',
    position: 'relative',
    borderWidth: 4,
  },
  boyCard: {
    backgroundColor: '#E3F2FD',
    borderColor: '#42A5F5',
  },
  girlCard: {
    backgroundColor: '#FCE4EC',
    borderColor: '#F06292',
  },
  bgCircle: {
    position: 'absolute',
    borderRadius: 100,
    opacity: 0.4,
  },
  boyBgCircle1: {
    width: 120,
    height: 120,
    backgroundColor: '#90CAF9',
    top: -30,
    right: -30,
  },
  boyBgCircle2: {
    width: 80,
    height: 80,
    backgroundColor: '#64B5F6',
    bottom: 60,
    left: -25,
  },
  girlBgCircle1: {
    width: 120,
    height: 120,
    backgroundColor: '#F8BBD9',
    top: -30,
    right: -30,
  },
  girlBgCircle2: {
    width: 80,
    height: 80,
    backgroundColor: '#F48FB1',
    bottom: 60,
    left: -25,
  },
  cornerDecor: {
    position: 'absolute',
    zIndex: 2,
  },
  topLeftDecor: {
    top: 10,
    left: 12,
  },
  topRightDecor: {
    top: 10,
    right: 12,
  },
  cornerEmoji: {
    fontSize: 24,
  },
  characterContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    marginBottom: 8,
  },
  characterImage: {
    // Dynamic sizing applied inline
  },
  labelSection: {
    alignItems: 'center',
    marginTop: 6,
  },
  labelBadge: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 25,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  boyBadge: {
    backgroundColor: '#1E88E5',
  },
  girlBadge: {
    backgroundColor: '#E91E63',
  },
  genderLabel: {
    fontSize: 18,
    fontWeight: '900',
    color: '#fff',
    textShadowColor: 'rgba(0,0,0,0.25)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  genderLabelLandscape: {
    fontSize: 16,
  },
  genderDescription: {
    fontSize: 15,
    color: '#555',
    fontWeight: '700',
  },
  genderDescriptionLandscape: {
    fontSize: 13,
  },
  sparklesRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginTop: 6,
  },
  sparkle: {
    fontSize: 16,
  },
  bottomMessage: {
    marginBottom: 12,
    zIndex: 1,
  },
  bottomMessageLandscape: {
    marginBottom: 6,
  },
  messageContainer: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 30,
    shadowColor: '#9B59B6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
    borderWidth: 2,
    borderColor: '#E8D4F8',
  },
  messageText: {
    fontSize: 17,
    fontWeight: '800',
    color: '#9B59B6',
  },
  messageTextLandscape: {
    fontSize: 14,
  },
});

export default GenderSelectionModal;
