import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ScrollView,
  Animated,
  Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, RAINBOW_COLORS } from '../constants/colors';
import { EMOTIONS } from '../constants/gameData';
import { speakWord, speakEmotion, speakCelebration, speakFeedback, stopSpeaking } from '../utils/speech';
import { ScreenHeader } from '../components';
import { SCREEN_ICONS } from '../assets/images';
import { useResponsiveLayout } from '../utils/useResponsiveLayout';

const { width } = Dimensions.get('window');

interface EmotionsGameScreenProps {
  navigation: any;
}

export const EmotionsGameScreen: React.FC<EmotionsGameScreenProps> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { isLandscape } = useResponsiveLayout();
  const [mode, setMode] = useState<'learn' | 'quiz'>('learn');
  const [selectedEmotion, setSelectedEmotion] = useState<typeof EMOTIONS[0] | null>(null);
  const [quizEmotion, setQuizEmotion] = useState<typeof EMOTIONS[0] | null>(null);
  const [options, setOptions] = useState<typeof EMOTIONS>([]);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [showFeedback, setShowFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [learnedEmotions, setLearnedEmotions] = useState<string[]>([]);
  const bounceAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const feedbackAnim = useRef(new Animated.Value(0)).current;

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
    
    setTimeout(() => speakWord(emotion.situation), 300);
  }, []);

  useEffect(() => {
    if (mode === 'quiz') {
      generateQuiz();
    }
    return () => stopSpeaking();
  }, [mode, generateQuiz]);

  useEffect(() => {
    if (selectedEmotion) {
      Animated.sequence([
        Animated.timing(bounceAnim, { toValue: 1.15, duration: 200, useNativeDriver: true }),
        Animated.timing(bounceAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
      ]).start();
      
      Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }).start();
    }
  }, [selectedEmotion, bounceAnim, fadeAnim]);

  const handleEmotionPress = (emotion: typeof EMOTIONS[0]) => {
    setSelectedEmotion(emotion);
    speakEmotion(emotion.name);
    
    if (!learnedEmotions.includes(emotion.name)) {
      setLearnedEmotions([...learnedEmotions, emotion.name]);
    }
  };

  const handleQuizAnswer = (emotion: typeof EMOTIONS[0]) => {
    if (!quizEmotion) return;
    
    if (emotion.name === quizEmotion.name) {
      setScore(score + 10 + streak * 2);
      setStreak(streak + 1);
      setShowFeedback('correct');
      speakCelebration();
      
      Animated.sequence([
        Animated.timing(feedbackAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
        Animated.delay(800),
        Animated.timing(feedbackAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
      ]).start(() => {
        setShowFeedback(null);
        generateQuiz();
      });
    } else {
      setStreak(0);
      setShowFeedback('wrong');
      speakFeedback(false);
      
      Animated.sequence([
        Animated.timing(feedbackAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
        Animated.delay(800),
        Animated.timing(feedbackAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
      ]).start(() => setShowFeedback(null));
    }
  };

  const progress = Math.round((learnedEmotions.length / EMOTIONS.length) * 100);

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingLeft: insets.left, paddingRight: insets.right }]}>
      <ScreenHeader
        title="Emotions"
        icon={SCREEN_ICONS.smile}
        onBack={() => { stopSpeaking(); navigation.goBack(); }}
        compact={isLandscape}
      />

      {/* Mode Toggle */}
      <View style={styles.modeRow}>
        <TouchableOpacity
          style={[styles.modeButton, mode === 'learn' && styles.modeActive]}
          onPress={() => setMode('learn')}
        >
          <Text style={styles.modeEmoji}>📚</Text>
          <Text style={[styles.modeText, mode === 'learn' && styles.modeTextActive]}>Learn</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.modeButton, mode === 'quiz' && styles.modeActive]}
          onPress={() => setMode('quiz')}
        >
          <Text style={styles.modeEmoji}>🎯</Text>
          <Text style={[styles.modeText, mode === 'quiz' && styles.modeTextActive]}>Quiz</Text>
        </TouchableOpacity>
      </View>

      {mode === 'learn' ? (
        <>
          {/* Progress Bar for Learn Mode */}
          <View style={styles.progressContainer}>
            <Text style={styles.progressLabel}>Learning Progress: {progress}%</Text>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${progress}%` }]} />
            </View>
          </View>

          {/* Side by Side Layout */}
          <View style={styles.mainContent}>
            {/* Left Panel - Selected Emotion */}
            <ScrollView 
              style={styles.leftPanel}
              contentContainerStyle={styles.leftPanelContent}
              showsVerticalScrollIndicator={false}
            >
              {selectedEmotion ? (
                <Animated.View style={[styles.selectedContainer, { opacity: fadeAnim }]}>
                  <Animated.Text style={[styles.selectedEmoji, { transform: [{ scale: bounceAnim }] }]}>
                    {selectedEmotion.emoji}
                  </Animated.Text>
                  <Text style={[styles.selectedName, { color: selectedEmotion.color }]}>
                    {selectedEmotion.name}
                  </Text>
                  
                  <View style={[styles.situationCard, { backgroundColor: selectedEmotion.color + '20' }]}>
                    <Text style={styles.situationLabel}>When do we feel this?</Text>
                    <Text style={styles.situationText}>{selectedEmotion.situation}</Text>
                  </View>
                  
                  <TouchableOpacity 
                    style={[styles.hearButton, { backgroundColor: selectedEmotion.color }]} 
                    onPress={() => speakEmotion(selectedEmotion.name)}
                  >
                    <Text style={styles.hearButtonText}>🔊 Hear Again</Text>
                  </TouchableOpacity>
                  
                  <View style={styles.tipCard}>
                    <Text style={styles.tipTitle}>💡 It's okay to feel {selectedEmotion.name.toLowerCase()}!</Text>
                    <Text style={styles.tipText}>All feelings are important.</Text>
                  </View>
                </Animated.View>
              ) : (
                <View style={styles.placeholderContainer}>
                  <Text style={styles.placeholderEmoji}>🤔</Text>
                  <Text style={styles.placeholderText}>Tap an emotion to learn about it!</Text>
                </View>
              )}
            </ScrollView>

            {/* Right Panel - Emotions Grid */}
            <ScrollView 
              style={styles.rightPanel}
              contentContainerStyle={styles.rightPanelContent}
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.emotionsGrid}>
                {EMOTIONS.map((emotion) => {
                  const isLearned = learnedEmotions.includes(emotion.name);
                  const isSelected = selectedEmotion?.name === emotion.name;
                  
                  return (
                    <TouchableOpacity
                      key={emotion.name}
                      onPress={() => handleEmotionPress(emotion)}
                      style={[
                        styles.emotionCard, 
                        { backgroundColor: emotion.color },
                        isSelected && styles.emotionCardSelected,
                      ]}
                    >
                      <Text style={styles.emotionEmoji}>{emotion.emoji}</Text>
                      <Text style={styles.emotionName}>{emotion.name}</Text>
                      {isLearned && (
                        <View style={styles.learnedBadge}>
                          <Text style={styles.learnedText}>✓</Text>
                        </View>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </ScrollView>
          </View>
        </>
      ) : (
        /* Quiz Mode */
        <View style={styles.quizMainContent}>
          {/* Score and Streak */}
          <View style={styles.quizHeader}>
            <View style={styles.streakBox}>
              <Text style={styles.streakEmoji}>🔥</Text>
              <Text style={styles.streakText}>{streak}</Text>
            </View>
            <View style={styles.scoreBox}>
              <Text style={styles.scoreEmoji}>⭐</Text>
              <Text style={styles.scoreText}>{score}</Text>
            </View>
          </View>

          {/* Feedback Overlay */}
          {showFeedback && (
            <Animated.View style={[
              styles.feedbackOverlay,
              { opacity: feedbackAnim },
              showFeedback === 'correct' ? styles.feedbackCorrect : styles.feedbackWrong
            ]}>
              <Text style={styles.feedbackEmoji}>
                {showFeedback === 'correct' ? '🎉' : '😅'}
              </Text>
              <Text style={styles.feedbackText}>
                {showFeedback === 'correct' ? 'Great Job!' : 'Try Again!'}
              </Text>
            </Animated.View>
          )}

          {quizEmotion && (
            <View style={styles.quizContent}>
              {/* Left - Question */}
              <View style={styles.quizLeftPanel}>
                <Text style={styles.quizTitle}>How would you feel?</Text>
                <View style={styles.questionBox}>
                  <Text style={styles.questionEmoji}>🤔</Text>
                  <Text style={styles.questionText}>{quizEmotion.situation}</Text>
                </View>
                <TouchableOpacity 
                  style={styles.hearQuestionButton}
                  onPress={() => speakWord(quizEmotion.situation)}
                >
                  <Text style={styles.hearQuestionText}>🔊 Hear Question</Text>
                </TouchableOpacity>
              </View>

              {/* Right - Options */}
              <ScrollView 
                style={styles.quizRightPanel}
                contentContainerStyle={styles.quizRightContent}
                showsVerticalScrollIndicator={false}
              >
                <Text style={styles.chooseText}>Choose the feeling:</Text>
                <View style={styles.optionsGrid}>
                  {options.map((opt, index) => (
                    <TouchableOpacity
                      key={index}
                      onPress={() => handleQuizAnswer(opt)}
                      style={[styles.optionCard, { backgroundColor: opt.color }]}
                      disabled={showFeedback !== null}
                    >
                      <Text style={styles.optionEmoji}>{opt.emoji}</Text>
                      <Text style={styles.optionName}>{opt.name}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF9E6' },
  modeRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 10,
    gap: 12,
  },
  modeButton: {
    paddingHorizontal: 24,
    paddingVertical: 10,
    backgroundColor: '#E8E8E8',
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  modeActive: { backgroundColor: COLORS.orange },
  modeEmoji: { fontSize: 18 },
  modeText: { fontSize: 15, fontWeight: '600', color: COLORS.gray },
  modeTextActive: { color: COLORS.white },
  
  // Progress
  progressContainer: {
    marginHorizontal: 15,
    marginBottom: 8,
    padding: 10,
    backgroundColor: COLORS.white,
    borderRadius: 12,
  },
  progressLabel: { fontSize: 12, fontWeight: 'bold', color: COLORS.purple, marginBottom: 5 },
  progressBar: {
    width: '100%',
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 4,
  },
  
  // Main Content - Side by Side
  mainContent: {
    flex: 1,
    flexDirection: 'row',
    paddingHorizontal: 10,
    gap: 10,
  },
  
  // Left Panel
  leftPanel: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 4,
  },
  leftPanelContent: {
    padding: 15,
    alignItems: 'center',
    minHeight: '100%',
  },
  selectedContainer: {
    alignItems: 'center',
    width: '100%',
  },
  selectedEmoji: { fontSize: 55 },
  selectedName: { 
    fontSize: 22, 
    fontWeight: 'bold', 
    marginTop: 8,
  },
  situationCard: {
    marginTop: 12,
    padding: 12,
    borderRadius: 12,
    width: '100%',
  },
  situationLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.gray,
    marginBottom: 4,
  },
  situationText: {
    fontSize: 13,
    color: COLORS.black,
    lineHeight: 18,
  },
  hearButton: {
    marginTop: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
  },
  hearButtonText: { fontSize: 13, fontWeight: 'bold', color: COLORS.white },
  tipCard: {
    marginTop: 12,
    backgroundColor: '#E8F5E9',
    padding: 10,
    borderRadius: 10,
    width: '100%',
  },
  tipTitle: { fontSize: 11, fontWeight: 'bold', color: '#2E7D32' },
  tipText: { fontSize: 10, color: '#388E3C', marginTop: 2 },
  
  placeholderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  placeholderEmoji: { fontSize: 45, marginBottom: 10 },
  placeholderText: { 
    fontSize: 13, 
    color: COLORS.gray, 
    textAlign: 'center',
    fontWeight: '500',
  },
  
  // Right Panel
  rightPanel: {
    flex: 1.2,
  },
  rightPanelContent: {
    paddingBottom: 10,
  },
  emotionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 8,
  },
  emotionCard: {
    width: '48%',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
    marginBottom: 2,
  },
  emotionCardSelected: {
    borderWidth: 3,
    borderColor: COLORS.white,
  },
  emotionEmoji: { fontSize: 28 },
  emotionName: { fontSize: 11, fontWeight: 'bold', color: COLORS.white, marginTop: 4 },
  learnedBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#4CAF50',
    width: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  learnedText: { color: COLORS.white, fontWeight: 'bold', fontSize: 10 },
  
  // Quiz Mode
  quizMainContent: {
    flex: 1,
    paddingHorizontal: 10,
  },
  quizHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  streakBox: {
    backgroundColor: '#FFE0B2',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  streakEmoji: { fontSize: 16 },
  streakText: { fontSize: 14, fontWeight: 'bold', color: '#E65100' },
  scoreBox: {
    backgroundColor: COLORS.yellow,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  scoreEmoji: { fontSize: 16 },
  scoreText: { fontSize: 14, fontWeight: 'bold', color: COLORS.black },
  
  feedbackOverlay: {
    position: 'absolute',
    top: 60,
    left: 20,
    right: 20,
    zIndex: 10,
    padding: 15,
    borderRadius: 15,
    alignItems: 'center',
  },
  feedbackCorrect: { backgroundColor: '#4CAF50' },
  feedbackWrong: { backgroundColor: '#FF5722' },
  feedbackEmoji: { fontSize: 30 },
  feedbackText: { fontSize: 16, fontWeight: 'bold', color: COLORS.white, marginTop: 4 },
  
  quizContent: {
    flex: 1,
    flexDirection: 'row',
    gap: 10,
  },
  quizLeftPanel: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: 18,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 4,
  },
  quizTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.purple,
    textAlign: 'center',
    marginBottom: 12,
  },
  questionBox: {
    backgroundColor: '#FFF3E0',
    padding: 15,
    borderRadius: 14,
    alignItems: 'center',
  },
  questionEmoji: { fontSize: 35, marginBottom: 8 },
  questionText: {
    fontSize: 14,
    color: COLORS.black,
    textAlign: 'center',
    lineHeight: 20,
  },
  hearQuestionButton: {
    marginTop: 12,
    backgroundColor: COLORS.orange,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 14,
    alignSelf: 'center',
  },
  hearQuestionText: { fontSize: 12, fontWeight: 'bold', color: COLORS.white },
  
  quizRightPanel: {
    flex: 1.2,
  },
  quizRightContent: {
    paddingBottom: 10,
  },
  chooseText: {
    fontSize: 13,
    color: COLORS.gray,
    textAlign: 'center',
    marginBottom: 10,
    fontWeight: '500',
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 8,
  },
  optionCard: {
    width: '48%',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
    marginBottom: 2,
  },
  optionEmoji: { fontSize: 28 },
  optionName: { fontSize: 11, fontWeight: 'bold', color: COLORS.white, marginTop: 4 },
});
