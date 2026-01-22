import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ScrollView,
  Image,
  Animated,
  Modal,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, RAINBOW_COLORS } from '../constants/colors';
import { ANIMALS, VEHICLES } from '../constants/gameData';
import { speakWord, speakAnimalSound, speakCelebration, speakFeedback, stopSpeaking } from '../utils/speech';
import { ScreenHeader } from '../components';
import { SCREEN_ICONS } from '../assets/images';
import { useResponsiveLayout } from '../utils/useResponsiveLayout';

const { width } = Dimensions.get('window');

type SoundCategory = 'animals' | 'vehicles';

interface SoundGameScreenProps {
  navigation: any;
}

export const SoundGameScreen: React.FC<SoundGameScreenProps> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { isLandscape, width: screenWidth } = useResponsiveLayout();
  const [category, setCategory] = useState<SoundCategory>('animals');
  const [mode, setMode] = useState<'learn' | 'quiz'>('learn');
  const [selectedItem, setSelectedItem] = useState<typeof ANIMALS[0] | null>(null);
  const [currentItem, setCurrentItem] = useState<typeof ANIMALS[0] | null>(null);
  const [options, setOptions] = useState<typeof ANIMALS>([]);
  const [score, setScore] = useState(0);
  const [quizCount, setQuizCount] = useState(0);
  const [showCorrect, setShowCorrect] = useState(false);
  const [showModal, setShowModal] = useState(false);
  
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const bounceAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const getData = useCallback(() => {
    return category === 'animals' ? ANIMALS : VEHICLES;
  }, [category]);

  const generateQuiz = useCallback(() => {
    const data = getData();
    const item = data[Math.floor(Math.random() * data.length)];
    setCurrentItem(item);
    setShowCorrect(false);
    
    const opts = [item];
    while (opts.length < 4) {
      const random = data[Math.floor(Math.random() * data.length)];
      if (!opts.find(o => o.name === random.name)) {
        opts.push(random);
      }
    }
    for (let i = opts.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [opts[i], opts[j]] = [opts[j], opts[i]];
    }
    setOptions(opts);
    
    fadeAnim.setValue(0);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
    
    setTimeout(() => {
      speakAnimalSound(item.name, item.sound);
      startPulseAnimation();
    }, 500);
  }, [getData, fadeAnim]);

  const startPulseAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.1, duration: 500, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
      ])
    ).start();
  };

  useEffect(() => {
    if (mode === 'quiz') {
      setScore(0);
      setQuizCount(0);
      generateQuiz();
    } else {
      pulseAnim.stopAnimation();
    }
    return () => stopSpeaking();
  }, [mode, category]);

  const handleItemPress = (item: typeof ANIMALS[0], index: number) => {
    setSelectedItem(item);
    setShowModal(true);
    speakAnimalSound(item.name, item.sound);
    
    Animated.sequence([
      Animated.timing(bounceAnim, { toValue: 1.1, duration: 150, useNativeDriver: true }),
      Animated.spring(bounceAnim, { toValue: 1, friction: 3, useNativeDriver: true }),
    ]).start();
  };

  const handleQuizAnswer = (item: typeof ANIMALS[0]) => {
    if (!currentItem || showCorrect) return;
    
    pulseAnim.stopAnimation();
    pulseAnim.setValue(1);
    
    if (item.name === currentItem.name) {
      setScore(score + 10);
      setQuizCount(quizCount + 1);
      setShowCorrect(true);
      speakCelebration();
      
      Animated.sequence([
        Animated.timing(bounceAnim, { toValue: 1.2, duration: 200, useNativeDriver: true }),
        Animated.spring(bounceAnim, { toValue: 1, friction: 3, useNativeDriver: true }),
      ]).start();
      
      setTimeout(generateQuiz, 1200);
    } else {
      speakFeedback(false);
    }
  };

  const playCurrentSound = () => {
    if (currentItem) {
      speakAnimalSound(currentItem.name, currentItem.sound);
      startPulseAnimation();
    }
  };

  const data = getData();
  const cardWidth = isLandscape ? (screenWidth - 80) / 4 - 8 : (width - 48) / 2;

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingLeft: insets.left, paddingRight: insets.right }]}>
      <ScreenHeader
        title="Sounds"
        icon={SCREEN_ICONS.volume}
        onBack={() => { stopSpeaking(); navigation.goBack(); }}
        compact={isLandscape}
        rightElement={mode === 'quiz' ? (
          <View style={styles.scoreBox}>
            <Image source={SCREEN_ICONS.starGold} style={styles.scoreIcon} resizeMode="contain" />
            <Text style={styles.scoreText}>{score}</Text>
          </View>
        ) : undefined}
      />

      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Category Selection */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionLabel}>Choose Category:</Text>
          <View style={styles.categoryRow}>
            <TouchableOpacity
              style={[styles.categoryCard, category === 'animals' && styles.categoryCardActive]}
              onPress={() => setCategory('animals')}
            >
              <View style={[styles.categoryIconBg, category === 'animals' && styles.categoryIconBgActive]}>
                <Text style={styles.categoryEmoji}>🦁</Text>
              </View>
              <Text style={[styles.categoryText, category === 'animals' && styles.categoryTextActive]}>
                Animals
              </Text>
              <Text style={styles.categoryCount}>{ANIMALS.length} sounds</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.categoryCard, category === 'vehicles' && styles.categoryCardActive]}
              onPress={() => setCategory('vehicles')}
            >
              <View style={[styles.categoryIconBg, category === 'vehicles' && styles.categoryIconBgActive]}>
                <Text style={styles.categoryEmoji}>🚗</Text>
              </View>
              <Text style={[styles.categoryText, category === 'vehicles' && styles.categoryTextActive]}>
                Vehicles
              </Text>
              <Text style={styles.categoryCount}>{VEHICLES.length} sounds</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Mode Toggle */}
        <View style={styles.modeContainer}>
          <TouchableOpacity
            style={[styles.modeButton, mode === 'learn' && styles.modeButtonActive]}
            onPress={() => setMode('learn')}
          >
            <Text style={styles.modeEmoji}>📚</Text>
            <View>
              <Text style={[styles.modeTitle, mode === 'learn' && styles.modeTitleActive]}>Learn</Text>
              <Text style={[styles.modeDesc, mode === 'learn' && styles.modeDescActive]}>Explore sounds</Text>
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.modeButton, mode === 'quiz' && styles.modeButtonActiveQuiz]}
            onPress={() => setMode('quiz')}
          >
            <Text style={styles.modeEmoji}>🎯</Text>
            <View>
              <Text style={[styles.modeTitle, mode === 'quiz' && styles.modeTitleActive]}>Quiz</Text>
              <Text style={[styles.modeDesc, mode === 'quiz' && styles.modeDescActive]}>Test yourself</Text>
            </View>
          </TouchableOpacity>
        </View>

        {mode === 'learn' ? (
          <>
            {/* Instruction */}
            <View style={styles.instructionBox}>
              <Text style={styles.instructionEmoji}>👆</Text>
              <Text style={styles.instructionText}>
                Tap any card to hear the {category === 'animals' ? 'animal' : 'vehicle'} sound!
              </Text>
            </View>

            {/* Items Grid */}
            <View style={[styles.itemsGrid, isLandscape && styles.itemsGridLandscape]}>
              {data.map((item, index) => (
                <TouchableOpacity
                  key={item.name}
                  onPress={() => handleItemPress(item, index)}
                  style={[
                    styles.itemCard, 
                    { backgroundColor: RAINBOW_COLORS[index % RAINBOW_COLORS.length], width: cardWidth }
                  ]}
                  activeOpacity={0.8}
                >
                  <View style={styles.itemEmojiContainer}>
                    <Text style={[styles.itemEmoji, isLandscape && styles.itemEmojiLandscape]}>
                      {item.emoji}
                    </Text>
                  </View>
                  <Text style={[styles.itemName, isLandscape && styles.itemNameLandscape]}>
                    {item.name}
                  </Text>
                  <View style={styles.soundBadge}>
                    <Text style={styles.soundBadgeIcon}>🔊</Text>
                    <Text style={styles.itemSound}>"{item.sound}"</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </>
        ) : (
          <Animated.View style={[styles.quizContainer, { opacity: fadeAnim }]}>
            {/* Quiz Progress */}
            <View style={styles.quizProgress}>
              <Text style={styles.quizProgressText}>Question {quizCount + 1}</Text>
              <View style={styles.quizProgressBar}>
                <View style={[styles.quizProgressFill, { width: `${Math.min(quizCount * 10, 100)}%` }]} />
              </View>
            </View>

            {/* Sound Button */}
            <View style={styles.soundSection}>
              <Text style={styles.quizQuestion}>
                Which {category === 'animals' ? 'animal' : 'vehicle'} makes this sound?
              </Text>
              
              <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
                <TouchableOpacity onPress={playCurrentSound} style={styles.playButton}>
                  <View style={styles.playButtonInner}>
                    <Text style={styles.playButtonEmoji}>🔊</Text>
                  </View>
                  <Text style={styles.playButtonText}>Play Sound</Text>
                </TouchableOpacity>
              </Animated.View>
              
              {currentItem && (
                <View style={styles.soundHint}>
                  <Text style={styles.soundHintText}>"{currentItem.sound}"</Text>
                </View>
              )}
            </View>

            {/* Quiz Options */}
            <View style={styles.optionsContainer}>
              <Text style={styles.optionsLabel}>Choose the correct answer:</Text>
              <View style={[styles.optionsGrid, isLandscape && styles.optionsGridLandscape]}>
                {options.map((opt, index) => (
                  <Animated.View 
                    key={index}
                    style={[
                      showCorrect && opt.name === currentItem?.name && { transform: [{ scale: bounceAnim }] }
                    ]}
                  >
                    <TouchableOpacity
                      onPress={() => handleQuizAnswer(opt)}
                      style={[
                        styles.optionCard, 
                        { backgroundColor: RAINBOW_COLORS[index] },
                        showCorrect && opt.name === currentItem?.name && styles.optionCorrect,
                      ]}
                      disabled={showCorrect}
                    >
                      <Text style={styles.optionEmoji}>{opt.emoji}</Text>
                      <Text style={styles.optionName}>{opt.name}</Text>
                      {showCorrect && opt.name === currentItem?.name && (
                        <View style={styles.correctBadge}>
                          <Text style={styles.correctCheck}>✓</Text>
                        </View>
                      )}
                    </TouchableOpacity>
                  </Animated.View>
                ))}
              </View>
            </View>
          </Animated.View>
        )}
      </ScrollView>

      {/* Detail Modal */}
      <Modal
        visible={showModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowModal(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay} 
          activeOpacity={1} 
          onPress={() => setShowModal(false)}
        >
          <Animated.View style={[styles.modalContent, { transform: [{ scale: bounceAnim }] }]}>
            {selectedItem && (
              <>
                <View style={[
                  styles.modalEmojiContainer, 
                  { backgroundColor: RAINBOW_COLORS[data.indexOf(selectedItem) % RAINBOW_COLORS.length] }
                ]}>
                  <Text style={styles.modalEmoji}>{selectedItem.emoji}</Text>
                </View>
                
                <Text style={styles.modalName}>{selectedItem.name}</Text>
                
                <View style={styles.modalSoundBox}>
                  <Text style={styles.modalSoundLabel}>Sound:</Text>
                  <Text style={styles.modalSound}>"{selectedItem.sound}"</Text>
                </View>
                
                <TouchableOpacity 
                  style={styles.modalPlayButton}
                  onPress={() => speakAnimalSound(selectedItem.name, selectedItem.sound)}
                >
                  <Text style={styles.modalPlayIcon}>🔊</Text>
                  <Text style={styles.modalPlayText}>Hear Again</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.modalCloseButton}
                  onPress={() => setShowModal(false)}
                >
                  <Text style={styles.modalCloseText}>Got it!</Text>
                </TouchableOpacity>
              </>
            )}
          </Animated.View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#E6FFF5' 
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 30,
  },
  scoreBox: { 
    backgroundColor: COLORS.yellow, 
    paddingHorizontal: 15, 
    paddingVertical: 8, 
    borderRadius: 15, 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 6 
  },
  scoreIcon: { width: 18, height: 18 },
  scoreText: { fontSize: 16, fontWeight: 'bold' },
  sectionContainer: {
    paddingHorizontal: 16,
    marginTop: 8,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.gray,
    marginBottom: 10,
  },
  categoryRow: {
    flexDirection: 'row',
    gap: 12,
  },
  categoryCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  categoryCardActive: {
    borderColor: COLORS.green,
    backgroundColor: '#E6FFE6',
  },
  categoryIconBg: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  categoryIconBgActive: {
    backgroundColor: COLORS.green,
  },
  categoryEmoji: {
    fontSize: 30,
  },
  categoryText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.black,
  },
  categoryTextActive: {
    color: COLORS.green,
  },
  categoryCount: {
    fontSize: 12,
    color: COLORS.gray,
    marginTop: 4,
  },
  modeContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginTop: 16,
    gap: 12,
  },
  modeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 14,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  modeButtonActive: {
    backgroundColor: COLORS.blue,
    borderColor: COLORS.blue,
  },
  modeButtonActiveQuiz: {
    backgroundColor: COLORS.orange,
    borderColor: COLORS.orange,
  },
  modeEmoji: {
    fontSize: 28,
  },
  modeTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.black,
  },
  modeTitleActive: {
    color: COLORS.white,
  },
  modeDesc: {
    fontSize: 11,
    color: COLORS.gray,
    marginTop: 2,
  },
  modeDescActive: {
    color: 'rgba(255,255,255,0.8)',
  },
  instructionBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF9E6',
    marginHorizontal: 16,
    marginTop: 16,
    padding: 14,
    borderRadius: 16,
    gap: 10,
  },
  instructionEmoji: {
    fontSize: 22,
  },
  instructionText: {
    flex: 1,
    fontSize: 14,
    color: COLORS.gray,
  },
  itemsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    marginTop: 16,
    gap: 12,
  },
  itemsGridLandscape: {
    gap: 10,
  },
  itemCard: {
    borderRadius: 24,
    paddingVertical: 20,
    paddingHorizontal: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  itemEmojiContainer: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  itemEmoji: { 
    fontSize: 44 
  },
  itemEmojiLandscape: {
    fontSize: 36,
  },
  itemName: { 
    fontSize: 18, 
    fontWeight: 'bold', 
    color: COLORS.white, 
    marginTop: 4 
  },
  itemNameLandscape: {
    fontSize: 14,
  },
  soundBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.25)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginTop: 10,
    gap: 6,
  },
  soundBadgeIcon: {
    fontSize: 12,
  },
  itemSound: { 
    fontSize: 12, 
    color: COLORS.white,
    fontStyle: 'italic',
  },
  quizContainer: {
    paddingHorizontal: 16,
    marginTop: 16,
  },
  quizProgress: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 14,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  quizProgressText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.orange,
    marginBottom: 8,
  },
  quizProgressBar: {
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  quizProgressFill: {
    height: '100%',
    backgroundColor: COLORS.orange,
    borderRadius: 4,
  },
  soundSection: {
    backgroundColor: COLORS.white,
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 5,
  },
  quizQuestion: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.purple,
    textAlign: 'center',
    marginBottom: 20,
  },
  playButton: {
    alignItems: 'center',
  },
  playButtonInner: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.green,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.green,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  playButtonEmoji: {
    fontSize: 44,
  },
  playButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.green,
    marginTop: 12,
  },
  soundHint: {
    backgroundColor: '#FFF9E6',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 15,
    marginTop: 16,
  },
  soundHintText: {
    fontSize: 18,
    fontStyle: 'italic',
    color: COLORS.orange,
    fontWeight: '600',
  },
  optionsContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 24,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  optionsLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.gray,
    textAlign: 'center',
    marginBottom: 16,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  optionsGridLandscape: {
    gap: 10,
  },
  optionCard: {
    width: (width - 64) / 2 - 6,
    paddingVertical: 20,
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 4,
  },
  optionCorrect: {
    borderWidth: 4,
    borderColor: COLORS.green,
  },
  optionEmoji: { 
    fontSize: 42 
  },
  optionName: { 
    fontSize: 16, 
    fontWeight: 'bold', 
    color: COLORS.white, 
    marginTop: 8 
  },
  correctBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: COLORS.green,
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  correctCheck: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderRadius: 30,
    padding: 30,
    alignItems: 'center',
    width: '100%',
    maxWidth: 320,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 15,
  },
  modalEmojiContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalEmoji: {
    fontSize: 70,
  },
  modalName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.black,
    marginBottom: 16,
  },
  modalSoundBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 15,
    marginBottom: 20,
    gap: 8,
  },
  modalSoundLabel: {
    fontSize: 14,
    color: COLORS.gray,
  },
  modalSound: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.purple,
    fontStyle: 'italic',
  },
  modalPlayButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.green,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 25,
    marginBottom: 12,
    gap: 10,
  },
  modalPlayIcon: {
    fontSize: 20,
  },
  modalPlayText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  modalCloseButton: {
    backgroundColor: COLORS.blue,
    paddingHorizontal: 40,
    paddingVertical: 14,
    borderRadius: 25,
  },
  modalCloseText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.white,
  },
});
