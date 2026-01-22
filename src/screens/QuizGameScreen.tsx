import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Animated,
  Image,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, RAINBOW_COLORS } from '../constants/colors';
import { ALPHABETS } from '../constants/alphabets';
import { ANIMALS, FRUITS, SHAPES, NUMBERS } from '../constants/gameData';
import { speakWord, speakCelebration, speakFeedback, stopSpeaking } from '../utils/speech';
import { switchBackgroundMusic } from '../utils/backgroundMusic';
import { ScreenHeader } from '../components';
import { SCREEN_ICONS } from '../assets/images';
import { useResponsiveLayout } from '../utils/useResponsiveLayout';

const { width } = Dimensions.get('window');

type QuizCategory = 'alphabet' | 'animal' | 'fruit' | 'shape' | 'number';

interface QuizGameScreenProps {
  navigation: any;
}

export const QuizGameScreen: React.FC<QuizGameScreenProps> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [category, setCategory] = useState<QuizCategory>('alphabet');
  const [question, setQuestion] = useState<{
    text: string;
    emoji: string;
    correct: string;
    options: string[];
  } | null>(null);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const feedbackAnim = useState(new Animated.Value(0))[0];
  
  const { isLandscape, width: screenWidth } = useResponsiveLayout();

  const generateQuestion = useCallback(() => {
    let data: { name: string; emoji: string }[];
    let questionText = '';
    
    switch (category) {
      case 'alphabet':
        data = ALPHABETS.map(a => ({ name: a.letter, emoji: a.emoji }));
        const alpha = data[Math.floor(Math.random() * data.length)];
        questionText = `What letter does ${alpha.emoji} start with?`;
        setQuestion({
          text: questionText,
          emoji: alpha.emoji,
          correct: alpha.name,
          options: generateOptions(alpha.name, data.map(d => d.name)),
        });
        break;
      case 'animal':
        data = ANIMALS.map(a => ({ name: a.name, emoji: a.emoji }));
        const animal = data[Math.floor(Math.random() * data.length)];
        questionText = `What animal is this?`;
        setQuestion({
          text: questionText,
          emoji: animal.emoji,
          correct: animal.name,
          options: generateOptions(animal.name, data.map(d => d.name)),
        });
        break;
      case 'fruit':
        data = FRUITS.map(f => ({ name: f.name, emoji: f.emoji }));
        const fruit = data[Math.floor(Math.random() * data.length)];
        questionText = `What fruit is this?`;
        setQuestion({
          text: questionText,
          emoji: fruit.emoji,
          correct: fruit.name,
          options: generateOptions(fruit.name, data.map(d => d.name)),
        });
        break;
      case 'shape':
        data = SHAPES.map(s => ({ name: s.name, emoji: s.emoji }));
        const shape = data[Math.floor(Math.random() * data.length)];
        questionText = `What shape is this?`;
        setQuestion({
          text: questionText,
          emoji: shape.emoji,
          correct: shape.name,
          options: generateOptions(shape.name, data.map(d => d.name)),
        });
        break;
      case 'number':
        data = NUMBERS.map(n => ({ name: n.word, emoji: n.objects.slice(0, n.num).split('').slice(0, 5).join('') || n.emoji }));
        const num = NUMBERS[Math.floor(Math.random() * NUMBERS.length)];
        questionText = `How many objects are there?`;
        setQuestion({
          text: questionText,
          emoji: num.objects,
          correct: num.num.toString(),
          options: generateNumberOptions(num.num),
        });
        break;
    }
    
    speakWord(questionText);
  }, [category]);

  const generateOptions = (correct: string, all: string[]): string[] => {
    const options = [correct];
    while (options.length < 4) {
      const random = all[Math.floor(Math.random() * all.length)];
      if (!options.includes(random)) {
        options.push(random);
      }
    }
    for (let i = options.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [options[i], options[j]] = [options[j], options[i]];
    }
    return options;
  };

  const generateNumberOptions = (correct: number): string[] => {
    const options = [correct.toString()];
    while (options.length < 4) {
      const random = Math.floor(Math.random() * 10) + 1;
      if (!options.includes(random.toString())) {
        options.push(random.toString());
      }
    }
    for (let i = options.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [options[i], options[j]] = [options[j], options[i]];
    }
    return options;
  };

  // Switch to game music
  useEffect(() => {
    switchBackgroundMusic('game');
    return () => switchBackgroundMusic('home');
  }, []);

  useEffect(() => {
    generateQuestion();
    return () => stopSpeaking();
  }, [generateQuestion, category]);

  const handleAnswer = (answer: string) => {
    if (!question) return;
    
    const isCorrect = answer === question.correct;
    setFeedback(isCorrect ? 'correct' : 'wrong');
    
    if (isCorrect) {
      setScore(score + 10 + streak * 2);
      setStreak(streak + 1);
      speakCelebration();
    } else {
      setStreak(0);
      speakFeedback(false);
    }

    Animated.sequence([
      Animated.timing(feedbackAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.delay(800),
      Animated.timing(feedbackAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setFeedback(null);
      if (isCorrect) {
        generateQuestion();
      }
    });
  };

  const categories: { id: QuizCategory; icon: any }[] = [
    { id: 'alphabet', icon: SCREEN_ICONS.abc },
    { id: 'animal', icon: SCREEN_ICONS.lion },
    { id: 'fruit', icon: SCREEN_ICONS.apple },
    { id: 'shape', icon: SCREEN_ICONS.shapes },
    { id: 'number', icon: SCREEN_ICONS.numbers123 },
  ];

  const optionSize = isLandscape ? 60 : 80;

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingLeft: insets.left, paddingRight: insets.right }]}>
      {/* Header */}
      <View style={[styles.header, isLandscape && { marginBottom: -5 }]}>
        <ScreenHeader
          title="Quiz"
          icon={SCREEN_ICONS.question}
          onBack={() => { stopSpeaking(); navigation.goBack(); }}
          compact={isLandscape}
          rightElement={
            <View style={[styles.scoreBox, isLandscape && { paddingHorizontal: 10, paddingVertical: 4 }]}>
              <Image source={SCREEN_ICONS.starGold} style={[styles.scoreIcon, isLandscape && { width: 16, height: 16 }]} resizeMode="contain" />
              <Text style={[styles.scoreText, isLandscape && { fontSize: 14 }]}>{score}</Text>
            </View>
          }
        />
      </View>

      <ScrollView 
        contentContainerStyle={[styles.scrollContent, isLandscape && { paddingVertical: 5 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Category Selection */}
        <View style={[styles.categoryRow, isLandscape && { marginBottom: 8 }]}>
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              style={[
                styles.categoryButton, 
                category === cat.id && styles.categoryActive,
                isLandscape && { width: 40, height: 40, borderRadius: 10 }
              ]}
              onPress={() => { setCategory(cat.id); setStreak(0); }}
            >
              <Image 
                source={cat.icon} 
                style={[
                  styles.categoryIcon, 
                  category === cat.id && styles.categoryIconActive,
                  isLandscape && { width: 20, height: 20 }
                ]} 
                resizeMode="contain" 
              />
            </TouchableOpacity>
          ))}
        </View>

        {/* Streak Display */}
        {streak > 0 && (
          <View style={[styles.streakBox, isLandscape && { paddingVertical: 4, paddingHorizontal: 12, marginBottom: 8 }]}>
            <Image source={SCREEN_ICONS.lightning} style={[styles.streakIcon, isLandscape && { width: 16, height: 16 }]} resizeMode="contain" />
            <Text style={[styles.streakText, isLandscape && { fontSize: 12 }]}>{streak} in a row!</Text>
          </View>
        )}

        {/* Question */}
        {question && (
          <>
            <View style={[styles.questionContainer, isLandscape && { paddingVertical: 12, marginBottom: 10 }]}>
              <Text style={[styles.questionText, isLandscape && { fontSize: 14 }]}>{question.text}</Text>
              <Text style={[styles.questionEmoji, isLandscape && { fontSize: 40 }]}>{question.emoji}</Text>
            </View>

            {/* Options */}
            <View style={[styles.optionsGrid, isLandscape && { gap: 8 }]}>
              {question.options.map((option, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => !feedback && handleAnswer(option)}
                  style={[
                    styles.optionButton,
                    { backgroundColor: RAINBOW_COLORS[index], width: optionSize, height: optionSize },
                    isLandscape && { borderRadius: 12 },
                    feedback === 'correct' && option === question.correct && styles.correctOption,
                    feedback === 'wrong' && option === question.correct && styles.showCorrectOption,
                  ]}
                >
                  <Text style={[styles.optionText, isLandscape && { fontSize: 20 }]}>{option}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}

        {/* Feedback */}
        {feedback && (
          <Animated.View
            style={[
              styles.feedbackContainer,
              {
                opacity: feedbackAnim,
                transform: [{ scale: feedbackAnim }],
              },
              isLandscape && { marginTop: 10 }
            ]}
          >
            <Image 
              source={feedback === 'correct' ? SCREEN_ICONS.celebration : SCREEN_ICONS.wrong} 
              style={[styles.feedbackImage, isLandscape && { width: 50, height: 50 }]} 
              resizeMode="contain" 
            />
            <Text style={[styles.feedbackText, { color: feedback === 'correct' ? COLORS.green : COLORS.red }, isLandscape && { fontSize: 16 }]}>
              {feedback === 'correct' ? 'Correct!' : `It's ${question?.correct}!`}
            </Text>
          </Animated.View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#E6F0FF' },
  scrollContent: { paddingBottom: 20, alignItems: 'center' },
  header: { marginBottom: -10 },
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
  categoryRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 15,
    marginTop: 10,
    gap: 10,
  },
  categoryButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryActive: {
    backgroundColor: COLORS.purple,
    transform: [{ scale: 1.1 }],
  },
  categoryIcon: { width: 28, height: 28 },
  categoryIconActive: { tintColor: COLORS.white },
  streakBox: {
    alignSelf: 'center',
    backgroundColor: COLORS.orange,
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 15,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  streakIcon: { width: 20, height: 20, tintColor: COLORS.white },
  streakText: { fontSize: 16, fontWeight: 'bold', color: COLORS.white },
  questionContainer: {
    backgroundColor: COLORS.white,
    marginHorizontal: 20,
    paddingVertical: 30,
    paddingHorizontal: 20,
    borderRadius: 25,
    alignItems: 'center',
    marginBottom: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 5,
  },
  questionText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.purple,
    textAlign: 'center',
    marginBottom: 15,
  },
  questionEmoji: { fontSize: 60, textAlign: 'center' },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  optionButton: {
    width: (width - 60) / 2,
    paddingVertical: 20,
    borderRadius: 20,
    alignItems: 'center',
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 5,
  },
  optionText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  correctOption: {
    borderWidth: 4,
    borderColor: '#228B22',
  },
  showCorrectOption: {
    backgroundColor: COLORS.yellow,
    borderWidth: 4,
    borderColor: COLORS.orange,
  },
  feedbackContainer: {
    position: 'absolute',
    top: '45%',
    alignSelf: 'center',
    backgroundColor: COLORS.white,
    paddingHorizontal: 40,
    paddingVertical: 25,
    borderRadius: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
  },
  feedbackImage: { width: 60, height: 60, marginBottom: 10 },
  feedbackText: { fontSize: 24, fontWeight: 'bold' },
});
