import React, { useState, useEffect } from 'react';
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
import { STORIES } from '../constants/gameData';
import { speakWord, speakCelebration, speakFeedback, stopSpeaking } from '../utils/speech';
import { ScreenHeader } from '../components';
import { SCREEN_ICONS } from '../assets/images';

const { width } = Dimensions.get('window');

interface StoryGameScreenProps {
  navigation: any;
}

export const StoryGameScreen: React.FC<StoryGameScreenProps> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [showQuestion, setShowQuestion] = useState(false);
  const [score, setScore] = useState(0);
  const [storyComplete, setStoryComplete] = useState(false);
  const fadeAnim = useState(new Animated.Value(0))[0];

  const currentStory = STORIES[currentStoryIndex];
  const currentPage = currentStory.pages[currentPageIndex];

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
    
    speakWord(currentPage.text);
    
    return () => stopSpeaking();
  }, [currentPageIndex, currentStoryIndex]);

  const handleContinue = () => {
    setShowQuestion(true);
  };

  const handleAnswer = (answer: string) => {
    const isCorrect = answer === currentPage.correct;
    
    if (isCorrect) {
      setScore(score + 10);
      speakCelebration();
      
      setTimeout(() => {
        setShowQuestion(false);
        fadeAnim.setValue(0);
        
        if (currentPageIndex < currentStory.pages.length - 1) {
          setCurrentPageIndex(currentPageIndex + 1);
        } else {
          setStoryComplete(true);
        }
      }, 1000);
    } else {
      speakFeedback(false);
    }
  };

  const selectStory = (index: number) => {
    setCurrentStoryIndex(index);
    setCurrentPageIndex(0);
    setShowQuestion(false);
    setStoryComplete(false);
    fadeAnim.setValue(0);
  };

  const restartStory = () => {
    setCurrentPageIndex(0);
    setShowQuestion(false);
    setStoryComplete(false);
    fadeAnim.setValue(0);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.headerRow}>
        <ScreenHeader
          title="Stories"
          icon={SCREEN_ICONS.storybook}
          onBack={() => { stopSpeaking(); navigation.goBack(); }}
          rightElement={
            <View style={styles.scoreBox}>
              <Image source={SCREEN_ICONS.starGold} style={styles.scoreIcon} resizeMode="contain" />
              <Text style={styles.scoreText}>{score}</Text>
            </View>
          }
        />
      </View>

      {/* Story Selection */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.storiesScroll}>
        <View style={styles.storiesRow}>
          {STORIES.map((story, index) => (
            <TouchableOpacity
              key={story.id}
              onPress={() => selectStory(index)}
              style={[
                styles.storyTab,
                { backgroundColor: story.color },
                currentStoryIndex === index && styles.storyTabActive,
              ]}
            >
              <Text style={styles.storyTabEmoji}>{story.emoji}</Text>
              <Text style={styles.storyTabTitle}>{story.title}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {!storyComplete ? (
        <ScrollView contentContainerStyle={styles.storyContainer} showsVerticalScrollIndicator={false}>
          {/* Story Card */}
          <Animated.View style={[styles.storyCard, { opacity: fadeAnim, backgroundColor: currentStory.color }]}>
            <Text style={styles.pageEmoji}>{currentPage.emoji}</Text>
            <Text style={styles.storyText}>{currentPage.text}</Text>
            
            {!showQuestion ? (
              <TouchableOpacity onPress={handleContinue} style={styles.continueButton}>
                <Text style={styles.continueText}>Continue</Text>
                <Image source={SCREEN_ICONS.next} style={styles.continueIcon} resizeMode="contain" />
              </TouchableOpacity>
            ) : (
              <View style={styles.questionContainer}>
                <Text style={styles.questionText}>{currentPage.question}</Text>
                <View style={styles.answersRow}>
                  {currentPage.options.map((option, index) => (
                    <TouchableOpacity
                      key={index}
                      onPress={() => handleAnswer(option)}
                      style={[styles.answerButton, { backgroundColor: RAINBOW_COLORS[index] }]}
                    >
                      <Text style={styles.answerText}>{option}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}
          </Animated.View>

          {/* Progress */}
          <View style={styles.progressContainer}>
            <Text style={styles.progressText}>
              Page {currentPageIndex + 1} of {currentStory.pages.length}
            </Text>
            <View style={styles.progressDots}>
              {currentStory.pages.map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.dot,
                    index <= currentPageIndex && { backgroundColor: currentStory.color },
                  ]}
                />
              ))}
            </View>
          </View>

          {/* Read Again Button */}
          <TouchableOpacity onPress={() => speakWord(currentPage.text)} style={styles.readAgainButton}>
            <Image source={SCREEN_ICONS.speaker} style={styles.readAgainIcon} resizeMode="contain" />
            <Text style={styles.readAgainText}>Read Again</Text>
          </TouchableOpacity>
        </ScrollView>
      ) : (
        <View style={styles.completeContainer}>
          <Image source={SCREEN_ICONS.celebration} style={styles.completeImage} resizeMode="contain" />
          <Text style={styles.completeTitle}>Story Complete!</Text>
          <Text style={styles.completeText}>Great job reading "{currentStory.title}"!</Text>
          <View style={styles.completeButtons}>
            <TouchableOpacity onPress={restartStory} style={styles.restartButton}>
              <Image source={SCREEN_ICONS.refresh} style={styles.buttonIcon} resizeMode="contain" />
              <Text style={styles.buttonText}>Read Again</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={() => selectStory((currentStoryIndex + 1) % STORIES.length)} 
              style={styles.nextStoryButton}
            >
              <Image source={SCREEN_ICONS.storybook} style={styles.buttonIcon} resizeMode="contain" />
              <Text style={styles.buttonText}>Next Story</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF5F0' },
  headerRow: { marginBottom: -10 },
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
  storiesScroll: { maxHeight: 90, marginBottom: 10, marginTop: 10 },
  storiesRow: {
    flexDirection: 'row',
    paddingHorizontal: 15,
    gap: 10,
  },
  storyTab: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 20,
    alignItems: 'center',
    opacity: 0.7,
  },
  storyTabActive: { opacity: 1, transform: [{ scale: 1.05 }] },
  storyTabEmoji: { fontSize: 28 },
  storyTabTitle: { fontSize: 12, fontWeight: '600', color: COLORS.white, marginTop: 4 },
  storyContainer: { paddingHorizontal: 20, paddingBottom: 30 },
  storyCard: {
    borderRadius: 25,
    padding: 25,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  pageEmoji: { fontSize: 70, marginBottom: 15 },
  storyText: {
    fontSize: 20,
    color: COLORS.white,
    textAlign: 'center',
    lineHeight: 30,
    fontWeight: '500',
  },
  continueButton: {
    marginTop: 25,
    backgroundColor: COLORS.white,
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  continueIcon: { width: 18, height: 18, tintColor: COLORS.purple },
  continueText: { fontSize: 18, fontWeight: 'bold', color: COLORS.purple },
  questionContainer: {
    marginTop: 25,
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 20,
    padding: 20,
    width: '100%',
  },
  questionText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.black,
    textAlign: 'center',
    marginBottom: 15,
  },
  answersRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
  },
  answerButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
    minWidth: 80,
    alignItems: 'center',
  },
  answerText: { fontSize: 16, fontWeight: 'bold', color: COLORS.white },
  progressContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  progressText: { fontSize: 14, color: COLORS.gray, marginBottom: 10 },
  progressDots: {
    flexDirection: 'row',
    gap: 8,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#DDD',
  },
  readAgainButton: {
    marginTop: 20,
    alignSelf: 'center',
    backgroundColor: COLORS.blue,
    paddingHorizontal: 25,
    paddingVertical: 12,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  readAgainIcon: { width: 20, height: 20, tintColor: COLORS.white },
  readAgainText: { fontSize: 16, fontWeight: 'bold', color: COLORS.white },
  completeContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  completeImage: { width: 100, height: 100 },
  completeTitle: { fontSize: 32, fontWeight: 'bold', color: COLORS.purple, marginTop: 15 },
  completeText: { fontSize: 18, color: COLORS.gray, marginTop: 10, textAlign: 'center' },
  completeButtons: {
    flexDirection: 'row',
    marginTop: 30,
    gap: 15,
  },
  restartButton: {
    backgroundColor: COLORS.orange,
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  nextStoryButton: {
    backgroundColor: COLORS.green,
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  buttonIcon: { width: 20, height: 20, tintColor: COLORS.white },
  buttonText: { fontSize: 14, fontWeight: 'bold', color: COLORS.white },
});
