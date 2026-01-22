import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ScrollView,
  Animated,
  Image,
  Modal,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, RAINBOW_COLORS } from '../constants/colors';
import { STORIES } from '../constants/gameData';
import { speakWord, speakCelebration, speakFeedback, stopSpeaking } from '../utils/speech';
import { ScreenHeader } from '../components';
import { SCREEN_ICONS } from '../assets/images';
import { useResponsiveLayout } from '../utils/useResponsiveLayout';

const { width } = Dimensions.get('window');

interface StoryGameScreenProps {
  navigation: any;
}

export const StoryGameScreen: React.FC<StoryGameScreenProps> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { isLandscape, width: screenWidth } = useResponsiveLayout();
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [showQuestion, setShowQuestion] = useState(false);
  const [score, setScore] = useState(0);
  const [storyComplete, setStoryComplete] = useState(false);
  const [answeredCorrectly, setAnsweredCorrectly] = useState(false);
  const [showStoryPicker, setShowStoryPicker] = useState(true);
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const bounceAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  const currentStory = STORIES[currentStoryIndex];
  const currentPage = currentStory.pages[currentPageIndex];

  useEffect(() => {
    if (!showStoryPicker) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 1,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();
      
      speakWord(currentPage.text);
    }
    
    return () => stopSpeaking();
  }, [currentPageIndex, currentStoryIndex, showStoryPicker]);

  const handleContinue = () => {
    setShowQuestion(true);
  };

  const handleAnswer = (answer: string) => {
    const isCorrect = answer === currentPage.correct;
    
    if (isCorrect) {
      setScore(score + 10);
      setAnsweredCorrectly(true);
      speakCelebration();
      
      Animated.sequence([
        Animated.timing(bounceAnim, { toValue: 1.1, duration: 150, useNativeDriver: true }),
        Animated.spring(bounceAnim, { toValue: 1, friction: 3, useNativeDriver: true }),
      ]).start();
      
      setTimeout(() => {
        setShowQuestion(false);
        setAnsweredCorrectly(false);
        fadeAnim.setValue(0);
        slideAnim.setValue(0);
        
        if (currentPageIndex < currentStory.pages.length - 1) {
          setCurrentPageIndex(currentPageIndex + 1);
        } else {
          setStoryComplete(true);
        }
      }, 1200);
    } else {
      speakFeedback(false);
    }
  };

  const selectStory = (index: number) => {
    setCurrentStoryIndex(index);
    setCurrentPageIndex(0);
    setShowQuestion(false);
    setStoryComplete(false);
    setAnsweredCorrectly(false);
    setShowStoryPicker(false);
    fadeAnim.setValue(0);
    slideAnim.setValue(0);
  };

  const restartStory = () => {
    setCurrentPageIndex(0);
    setShowQuestion(false);
    setStoryComplete(false);
    setAnsweredCorrectly(false);
    fadeAnim.setValue(0);
    slideAnim.setValue(0);
  };

  const goToStoryPicker = () => {
    setShowStoryPicker(true);
    setStoryComplete(false);
  };

  const storyCardWidth = isLandscape ? (screenWidth - 80) / 5 - 8 : (width - 48) / 2 - 6;

  // Story Picker View
  if (showStoryPicker) {
    return (
      <View style={[styles.container, { paddingTop: insets.top, paddingLeft: insets.left, paddingRight: insets.right }]}>
        <ScreenHeader
          title="Stories"
          icon={SCREEN_ICONS.storybook}
          onBack={() => { stopSpeaking(); navigation.goBack(); }}
          compact={isLandscape}
        />

        <ScrollView 
          style={styles.scrollView} 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Welcome Section */}
          <View style={styles.welcomeSection}>
            <Text style={styles.welcomeEmoji}>📚✨</Text>
            <Text style={styles.welcomeTitle}>Story Time!</Text>
            <Text style={styles.welcomeText}>Choose a story to read and learn</Text>
          </View>

          {/* Story Categories */}
          <View style={styles.storiesContainer}>
            <Text style={styles.sectionLabel}>📖 All Stories ({STORIES.length})</Text>
            
            <View style={[styles.storiesGrid, isLandscape && styles.storiesGridLandscape]}>
              {STORIES.map((story, index) => (
                <TouchableOpacity
                  key={story.id}
                  onPress={() => selectStory(index)}
                  style={[styles.storyCard, { width: storyCardWidth }]}
                  activeOpacity={0.8}
                >
                  <View style={[styles.storyCardBg, { backgroundColor: story.color }]}>
                    <View style={styles.storyEmojiContainer}>
                      <Text style={styles.storyCardEmoji}>{story.emoji}</Text>
                    </View>
                  </View>
                  <View style={styles.storyCardInfo}>
                    <Text style={styles.storyCardTitle} numberOfLines={2}>{story.title}</Text>
                    <View style={styles.storyMeta}>
                      <Text style={styles.storyPages}>📄 {story.pages.length} pages</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Tip */}
          <View style={styles.tipContainer}>
            <Text style={styles.tipEmoji}>💡</Text>
            <Text style={styles.tipText}>
              Each story has questions to test your understanding. Answer correctly to earn points!
            </Text>
          </View>
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingLeft: insets.left, paddingRight: insets.right }]}>
      <ScreenHeader
        title={currentStory.title}
        icon={SCREEN_ICONS.storybook}
        onBack={goToStoryPicker}
        compact={isLandscape}
        rightElement={
          <View style={styles.scoreBox}>
            <Image source={SCREEN_ICONS.starGold} style={styles.scoreIcon} resizeMode="contain" />
            <Text style={styles.scoreText}>{score}</Text>
          </View>
        }
      />

      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {!storyComplete ? (
          <>
            {/* Progress Bar */}
            <View style={styles.progressContainer}>
              <View style={styles.progressHeader}>
                <Text style={styles.progressLabel}>
                  Page {currentPageIndex + 1} of {currentStory.pages.length}
                </Text>
                <TouchableOpacity 
                  onPress={() => speakWord(currentPage.text)}
                  style={styles.readButton}
                >
                  <Text style={styles.readButtonEmoji}>🔊</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.progressBar}>
                <View 
                  style={[
                    styles.progressFill, 
                    { 
                      width: `${((currentPageIndex + 1) / currentStory.pages.length) * 100}%`,
                      backgroundColor: currentStory.color,
                    }
                  ]} 
                />
              </View>
              <View style={styles.progressDots}>
                {currentStory.pages.map((_, index) => (
                  <View
                    key={index}
                    style={[
                      styles.progressDot,
                      index <= currentPageIndex && { backgroundColor: currentStory.color },
                    ]}
                  />
                ))}
              </View>
            </View>

            {/* Story Content */}
            <View style={[styles.storyContent, isLandscape && styles.storyContentLandscape]}>
              {/* Story Card */}
              <Animated.View style={[
                styles.mainStoryCard, 
                { 
                  backgroundColor: currentStory.color,
                  opacity: fadeAnim,
                  transform: [{ 
                    translateY: slideAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [30, 0],
                    })
                  }],
                },
                isLandscape && styles.mainStoryCardLandscape,
              ]}>
                <View style={styles.pageEmojiContainer}>
                  <Text style={[styles.pageEmoji, isLandscape && styles.pageEmojiLandscape]}>
                    {currentPage.emoji}
                  </Text>
                </View>
                
                <Text style={[styles.storyText, isLandscape && styles.storyTextLandscape]}>
                  {currentPage.text}
                </Text>
                
                {!showQuestion && (
                  <TouchableOpacity onPress={handleContinue} style={styles.continueButton}>
                    <Text style={styles.continueText}>Continue</Text>
                    <Text style={styles.continueArrow}>›</Text>
                  </TouchableOpacity>
                )}
              </Animated.View>

              {/* Question Panel */}
              {showQuestion && (
                <Animated.View style={[
                  styles.questionPanel,
                  isLandscape && styles.questionPanelLandscape,
                  { transform: [{ scale: bounceAnim }] }
                ]}>
                  <View style={styles.questionHeader}>
                    <Text style={styles.questionEmoji}>❓</Text>
                    <Text style={styles.questionTitle}>Question Time!</Text>
                  </View>
                  
                  <Text style={styles.questionText}>{currentPage.question}</Text>
                  
                  <View style={styles.answersGrid}>
                    {currentPage.options.map((option, index) => (
                      <TouchableOpacity
                        key={index}
                        onPress={() => handleAnswer(option)}
                        style={[
                          styles.answerButton, 
                          { backgroundColor: RAINBOW_COLORS[index % RAINBOW_COLORS.length] },
                          answeredCorrectly && option === currentPage.correct && styles.answerCorrect,
                        ]}
                        disabled={answeredCorrectly}
                      >
                        <Text style={styles.answerText}>{option}</Text>
                        {answeredCorrectly && option === currentPage.correct && (
                          <View style={styles.answerCheckBadge}>
                            <Text style={styles.answerCheck}>✓</Text>
                          </View>
                        )}
                      </TouchableOpacity>
                    ))}
                  </View>

                  {answeredCorrectly && (
                    <View style={styles.correctFeedback}>
                      <Text style={styles.correctFeedbackEmoji}>🎉</Text>
                      <Text style={styles.correctFeedbackText}>Correct! +10 points</Text>
                    </View>
                  )}
                </Animated.View>
              )}
            </View>
          </>
        ) : (
          <View style={styles.completeContainer}>
            <View style={[styles.completeCard, { borderColor: currentStory.color }]}>
              <View style={[styles.completeEmojiContainer, { backgroundColor: currentStory.color }]}>
                <Text style={styles.completeEmoji}>🎊📖✨</Text>
              </View>
              
              <Text style={styles.completeTitle}>Story Complete!</Text>
              
              <View style={styles.completeStoryInfo}>
                <Text style={styles.completeStoryEmoji}>{currentStory.emoji}</Text>
                <Text style={styles.completeStoryTitle}>"{currentStory.title}"</Text>
              </View>
              
              <View style={styles.completeScoreBox}>
                <Text style={styles.completeScoreLabel}>Your Score</Text>
                <Text style={styles.completeScoreValue}>{score}</Text>
                <Text style={styles.completeScoreStars}>⭐⭐⭐</Text>
              </View>
              
              <View style={styles.completeButtons}>
                <TouchableOpacity onPress={restartStory} style={[styles.completeButton, styles.restartButton]}>
                  <Text style={styles.completeButtonIcon}>🔄</Text>
                  <Text style={styles.completeButtonText}>Read Again</Text>
                </TouchableOpacity>
                
                <TouchableOpacity onPress={goToStoryPicker} style={[styles.completeButton, styles.moreStoriesButton]}>
                  <Text style={styles.completeButtonIcon}>📚</Text>
                  <Text style={styles.completeButtonText}>More Stories</Text>
                </TouchableOpacity>
              </View>
              
              {currentStoryIndex < STORIES.length - 1 && (
                <TouchableOpacity 
                  onPress={() => selectStory(currentStoryIndex + 1)}
                  style={[styles.nextStoryButton, { backgroundColor: currentStory.color }]}
                >
                  <Text style={styles.nextStoryText}>Next: {STORIES[currentStoryIndex + 1].title}</Text>
                  <Text style={styles.nextStoryArrow}>→</Text>
                </TouchableOpacity>
              )}
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
    backgroundColor: '#FFF8F0' 
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
    gap: 6,
  },
  scoreIcon: { width: 18, height: 18 },
  scoreText: { fontSize: 16, fontWeight: 'bold', color: COLORS.black },
  
  // Welcome Section
  welcomeSection: {
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 20,
  },
  welcomeEmoji: {
    fontSize: 50,
    marginBottom: 12,
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.purple,
    marginBottom: 8,
  },
  welcomeText: {
    fontSize: 16,
    color: COLORS.gray,
  },
  
  // Stories Container
  storiesContainer: {
    paddingHorizontal: 16,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.black,
    marginBottom: 16,
  },
  storiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  storiesGridLandscape: {
    gap: 10,
  },
  storyCard: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 5,
  },
  storyCardBg: {
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  storyEmojiContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  storyCardEmoji: {
    fontSize: 40,
  },
  storyCardInfo: {
    padding: 12,
  },
  storyCardTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.black,
    marginBottom: 6,
  },
  storyMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  storyPages: {
    fontSize: 11,
    color: COLORS.gray,
  },
  
  // Tip Container
  tipContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF9E6',
    marginHorizontal: 16,
    marginTop: 20,
    padding: 14,
    borderRadius: 16,
    gap: 10,
  },
  tipEmoji: {
    fontSize: 20,
  },
  tipText: {
    flex: 1,
    fontSize: 13,
    color: COLORS.gray,
    lineHeight: 18,
  },
  
  // Progress
  progressContainer: {
    backgroundColor: COLORS.white,
    marginHorizontal: 16,
    marginTop: 8,
    padding: 16,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  progressLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.gray,
  },
  readButton: {
    padding: 8,
    backgroundColor: '#F0F0F0',
    borderRadius: 12,
  },
  readButtonEmoji: {
    fontSize: 18,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 10,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  progressDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#E0E0E0',
  },
  
  // Story Content
  storyContent: {
    paddingHorizontal: 16,
    marginTop: 12,
    gap: 12,
  },
  storyContentLandscape: {
    flexDirection: 'row',
    gap: 16,
  },
  mainStoryCard: {
    borderRadius: 28,
    padding: 28,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  mainStoryCardLandscape: {
    flex: 1,
    padding: 20,
  },
  pageEmojiContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  pageEmoji: { 
    fontSize: 60,
  },
  pageEmojiLandscape: {
    fontSize: 45,
  },
  storyText: {
    fontSize: 22,
    color: COLORS.white,
    textAlign: 'center',
    lineHeight: 32,
    fontWeight: '500',
  },
  storyTextLandscape: {
    fontSize: 18,
    lineHeight: 26,
  },
  continueButton: {
    marginTop: 28,
    backgroundColor: COLORS.white,
    paddingHorizontal: 36,
    paddingVertical: 16,
    borderRadius: 30,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  continueText: { 
    fontSize: 18, 
    fontWeight: 'bold', 
    color: COLORS.purple 
  },
  continueArrow: {
    fontSize: 26,
    fontWeight: 'bold',
    color: COLORS.purple,
  },
  
  // Question Panel
  questionPanel: {
    backgroundColor: COLORS.white,
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 5,
  },
  questionPanelLandscape: {
    flex: 1,
  },
  questionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 16,
  },
  questionEmoji: {
    fontSize: 26,
  },
  questionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.purple,
  },
  questionText: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.black,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 26,
  },
  answersGrid: {
    gap: 12,
  },
  answerButton: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 20,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  answerCorrect: {
    borderWidth: 4,
    borderColor: COLORS.green,
  },
  answerText: { 
    fontSize: 17, 
    fontWeight: 'bold', 
    color: COLORS.white 
  },
  answerCheckBadge: {
    marginLeft: 10,
    backgroundColor: COLORS.green,
    width: 26,
    height: 26,
    borderRadius: 13,
    justifyContent: 'center',
    alignItems: 'center',
  },
  answerCheck: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: 'bold',
  },
  correctFeedback: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E6FFE6',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 16,
    marginTop: 16,
    gap: 10,
  },
  correctFeedbackEmoji: {
    fontSize: 22,
  },
  correctFeedbackText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.green,
  },
  
  // Complete Screen
  completeContainer: {
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  completeCard: {
    backgroundColor: COLORS.white,
    borderRadius: 30,
    padding: 28,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
    borderWidth: 3,
  },
  completeEmojiContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  completeEmoji: {
    fontSize: 40,
  },
  completeTitle: { 
    fontSize: 32, 
    fontWeight: 'bold', 
    color: COLORS.purple, 
    marginBottom: 16,
  },
  completeStoryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
    marginBottom: 20,
    gap: 10,
  },
  completeStoryEmoji: {
    fontSize: 28,
  },
  completeStoryTitle: { 
    fontSize: 16, 
    color: COLORS.gray,
    fontStyle: 'italic',
    fontWeight: '500',
  },
  completeScoreBox: {
    alignItems: 'center',
    backgroundColor: '#FFF9E6',
    paddingHorizontal: 40,
    paddingVertical: 20,
    borderRadius: 20,
    marginBottom: 24,
  },
  completeScoreLabel: {
    fontSize: 14,
    color: COLORS.gray,
    marginBottom: 4,
  },
  completeScoreValue: {
    fontSize: 48,
    fontWeight: 'bold',
    color: COLORS.orange,
  },
  completeScoreStars: {
    fontSize: 24,
    marginTop: 4,
  },
  completeButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  completeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 20,
    gap: 8,
  },
  restartButton: {
    backgroundColor: COLORS.orange,
  },
  moreStoriesButton: {
    backgroundColor: COLORS.blue,
  },
  completeButtonIcon: {
    fontSize: 18,
  },
  completeButtonText: { 
    fontSize: 14, 
    fontWeight: 'bold', 
    color: COLORS.white 
  },
  nextStoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 25,
    gap: 10,
    width: '100%',
  },
  nextStoryText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  nextStoryArrow: {
    fontSize: 18,
    color: COLORS.white,
    fontWeight: 'bold',
  },
});
