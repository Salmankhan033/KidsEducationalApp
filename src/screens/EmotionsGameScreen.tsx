import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ScrollView,
  Modal,
  Animated,
  Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, RAINBOW_COLORS } from '../constants/colors';
import { EMOTIONS } from '../constants/gameData';
import { speakWord, speakEmotion, speakCelebration, speakFeedback, stopSpeaking } from '../utils/speech';
import { ScreenHeader } from '../components';
import { SCREEN_ICONS } from '../assets/images';

const { width } = Dimensions.get('window');

interface EmotionsGameScreenProps {
  navigation: any;
}

export const EmotionsGameScreen: React.FC<EmotionsGameScreenProps> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [mode, setMode] = useState<'learn' | 'quiz'>('learn');
  const [selectedEmotion, setSelectedEmotion] = useState<typeof EMOTIONS[0] | null>(null);
  const [quizEmotion, setQuizEmotion] = useState<typeof EMOTIONS[0] | null>(null);
  const [options, setOptions] = useState<typeof EMOTIONS>([]);
  const [score, setScore] = useState(0);
  const modalAnim = useState(new Animated.Value(0))[0];

  const generateQuiz = useCallback(() => {
    const emotion = EMOTIONS[Math.floor(Math.random() * EMOTIONS.length)];
    setQuizEmotion(emotion);
    
    const opts = [emotion];
    while (opts.length < 4) {
      const random = EMOTIONS[Math.floor(Math.random() * EMOTIONS.length)];
      if (!opts.find(o => o.name === random.name)) {
        opts.push(random);
      }
    }
    for (let i = opts.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [opts[i], opts[j]] = [opts[j], opts[i]];
    }
    setOptions(opts);
    
    speakWord(emotion.situation);
  }, []);

  useEffect(() => {
    if (mode === 'quiz') {
      generateQuiz();
    }
    return () => stopSpeaking();
  }, [mode, generateQuiz]);

  const openModal = (emotion: typeof EMOTIONS[0]) => {
    setSelectedEmotion(emotion);
    speakEmotion(emotion.name);
    Animated.spring(modalAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 50,
      friction: 7,
    }).start();
  };

  const closeModal = () => {
    stopSpeaking();
    Animated.timing(modalAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => setSelectedEmotion(null));
  };

  const handleQuizAnswer = (emotion: typeof EMOTIONS[0]) => {
    if (!quizEmotion) return;
    
    if (emotion.name === quizEmotion.name) {
      setScore(score + 10);
      speakCelebration();
      setTimeout(generateQuiz, 1000);
    } else {
      speakFeedback(false);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <ScreenHeader
        title="Emotions"
        icon={SCREEN_ICONS.smile}
        onBack={() => { stopSpeaking(); navigation.goBack(); }}
      />

      {/* Mode Toggle */}
      <View style={styles.modeRow}>
        <TouchableOpacity
          style={[styles.modeButton, mode === 'learn' && styles.modeActive]}
          onPress={() => setMode('learn')}
        >
          <Image source={SCREEN_ICONS.book} style={[styles.modeIcon, mode === 'learn' && styles.modeIconActive]} resizeMode="contain" />
          <Text style={[styles.modeText, mode === 'learn' && styles.modeTextActive]}>Learn</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.modeButton, mode === 'quiz' && styles.modeActive]}
          onPress={() => setMode('quiz')}
        >
          <Image source={SCREEN_ICONS.gamepad} style={[styles.modeIcon, mode === 'quiz' && styles.modeIconActive]} resizeMode="contain" />
          <Text style={[styles.modeText, mode === 'quiz' && styles.modeTextActive]}>Quiz</Text>
        </TouchableOpacity>
      </View>

      {mode === 'learn' ? (
        <ScrollView contentContainerStyle={styles.emotionsGrid} showsVerticalScrollIndicator={false}>
          <View style={styles.instructionRow}>
            <Image source={SCREEN_ICONS.pencil} style={styles.instructionIcon} resizeMode="contain" />
            <Text style={styles.instruction}>Tap to learn about feelings!</Text>
          </View>
          <View style={styles.grid}>
            {EMOTIONS.map((emotion, index) => (
              <TouchableOpacity
                key={emotion.name}
                onPress={() => openModal(emotion)}
                style={[styles.emotionCard, { backgroundColor: emotion.color }]}
              >
                <Text style={styles.emotionEmoji}>{emotion.emoji}</Text>
                <Text style={styles.emotionName}>{emotion.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      ) : (
        <View style={styles.quizContainer}>
          <View style={styles.scoreBox}>
            <Image source={SCREEN_ICONS.starGold} style={styles.scoreIcon} resizeMode="contain" />
            <Text style={styles.scoreText}>{score}</Text>
          </View>

          {quizEmotion && (
            <>
              <Text style={styles.quizTitle}>How would you feel?</Text>
              <View style={styles.situationBox}>
                <Text style={styles.situationText}>{quizEmotion.situation}</Text>
              </View>

              <Text style={styles.chooseText}>Choose the feeling:</Text>
              <View style={styles.optionsGrid}>
                {options.map((opt, index) => (
                  <TouchableOpacity
                    key={index}
                    onPress={() => handleQuizAnswer(opt)}
                    style={[styles.optionCard, { backgroundColor: RAINBOW_COLORS[index] }]}
                  >
                    <Text style={styles.optionEmoji}>{opt.emoji}</Text>
                    <Text style={styles.optionName}>{opt.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </>
          )}
        </View>
      )}

      {/* Emotion Detail Modal */}
      <Modal visible={selectedEmotion !== null} transparent animationType="none">
        <View style={styles.modalOverlay}>
          <Animated.View
            style={[
              styles.modalContent,
              {
                backgroundColor: selectedEmotion?.color || COLORS.blue,
                transform: [{ scale: modalAnim }],
                opacity: modalAnim,
              },
            ]}
          >
            {selectedEmotion && (
              <>
                <Text style={styles.modalEmoji}>{selectedEmotion.emoji}</Text>
                <Text style={styles.modalName}>{selectedEmotion.name}</Text>
                <View style={styles.modalSituationBox}>
                  <Text style={styles.modalSituation}>{selectedEmotion.situation}</Text>
                </View>
                
                <TouchableOpacity onPress={() => speakEmotion(selectedEmotion.name)} style={styles.hearButton}>
                  <Image source={SCREEN_ICONS.speaker} style={styles.buttonIcon} resizeMode="contain" />
                  <Text style={styles.hearButtonText}>Hear Again</Text>
                </TouchableOpacity>
                
                <TouchableOpacity onPress={closeModal} style={styles.closeButton}>
                  <Image source={SCREEN_ICONS.correct} style={styles.buttonIconSmall} resizeMode="contain" />
                  <Text style={styles.closeButtonText}>Got It!</Text>
                </TouchableOpacity>
              </>
            )}
          </Animated.View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF9E6' },
  modeRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 15,
    gap: 15,
  },
  modeButton: {
    paddingHorizontal: 30,
    paddingVertical: 12,
    backgroundColor: '#E0E0E0',
    borderRadius: 25,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  modeActive: { backgroundColor: COLORS.orange },
  modeIcon: { width: 20, height: 20 },
  modeIconActive: { tintColor: COLORS.white },
  modeText: { fontSize: 16, fontWeight: '600', color: COLORS.gray },
  modeTextActive: { color: COLORS.white },
  emotionsGrid: { paddingHorizontal: 15, paddingBottom: 30 },
  instructionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
    gap: 8,
  },
  instructionIcon: { width: 20, height: 20, tintColor: COLORS.purple },
  instruction: {
    fontSize: 16,
    color: COLORS.purple,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  emotionCard: {
    width: (width - 50) / 2,
    paddingVertical: 25,
    borderRadius: 20,
    alignItems: 'center',
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 4,
  },
  emotionEmoji: { fontSize: 55 },
  emotionName: { fontSize: 18, fontWeight: 'bold', color: COLORS.white, marginTop: 10 },
  quizContainer: { flex: 1, paddingHorizontal: 20 },
  scoreBox: {
    alignSelf: 'flex-end',
    backgroundColor: COLORS.yellow,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    marginBottom: 15,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  scoreIcon: { width: 22, height: 22 },
  scoreText: { fontSize: 18, fontWeight: 'bold', color: COLORS.black },
  quizTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.purple,
    textAlign: 'center',
    marginBottom: 15,
  },
  situationBox: {
    backgroundColor: COLORS.white,
    paddingVertical: 25,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  situationText: {
    fontSize: 18,
    color: COLORS.black,
    textAlign: 'center',
    lineHeight: 26,
  },
  chooseText: {
    fontSize: 16,
    color: COLORS.gray,
    textAlign: 'center',
    marginBottom: 15,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  optionCard: {
    width: (width - 60) / 2,
    paddingVertical: 20,
    borderRadius: 20,
    alignItems: 'center',
    marginBottom: 15,
  },
  optionEmoji: { fontSize: 40 },
  optionName: { fontSize: 14, fontWeight: 'bold', color: COLORS.white, marginTop: 5 },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: width * 0.85,
    borderRadius: 30,
    padding: 30,
    alignItems: 'center',
  },
  modalEmoji: { fontSize: 80 },
  modalName: { fontSize: 32, fontWeight: 'bold', color: COLORS.white, marginTop: 10 },
  modalSituationBox: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 15,
    marginTop: 15,
  },
  modalSituation: { fontSize: 16, color: COLORS.black, textAlign: 'center' },
  hearButton: {
    marginTop: 20,
    backgroundColor: 'rgba(255,255,255,0.3)',
    paddingHorizontal: 25,
    paddingVertical: 12,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  buttonIcon: { width: 20, height: 20, tintColor: COLORS.white },
  hearButtonText: { fontSize: 16, fontWeight: 'bold', color: COLORS.white },
  closeButton: {
    marginTop: 15,
    backgroundColor: COLORS.white,
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  buttonIconSmall: { width: 18, height: 18, tintColor: COLORS.purple },
  closeButtonText: { fontSize: 18, fontWeight: 'bold', color: COLORS.purple },
});
