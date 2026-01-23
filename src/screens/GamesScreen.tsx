import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  ScrollView,
  Image,
  ImageBackground,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, RAINBOW_COLORS } from '../constants/colors';
import { ALPHABETS } from '../constants/alphabets';
import { speakFeedback, speakCelebration, stopSpeaking } from '../utils/speech';
import { switchBackgroundMusic } from '../utils/backgroundMusic';
import { SCREEN_ICONS } from '../assets/images';

// Background Image
const GAMES_BG_IMAGE = require('../images/bgImage/GamesImageBG.png');

// Colorful card backgrounds
const CARD_BG_COLORS = [
  '#FFE5E5', '#E5FFE8', '#E5F6FF', '#F0E5FF',
];

const { width } = Dimensions.get('window');

type GameType = 'menu' | 'match' | 'find' | 'order' | 'quiz';

interface GamesScreenProps {
  navigation: any;
  route?: {
    params?: {
      startGame?: string;
    };
  };
}

// Game Menu Component
const GameMenu: React.FC<{ onSelectGame: (game: GameType) => void }> = ({ onSelectGame }) => {
  const games = [
    { id: 'match' as GameType, title: 'Match the Letter', icon: SCREEN_ICONS.target, color: '#FF6B6B', description: 'Match letters with pictures!' },
    { id: 'find' as GameType, title: 'Find the Letter', icon: SCREEN_ICONS.magnifier, color: '#4ECDC4', description: 'Find the correct letter!' },
    { id: 'order' as GameType, title: 'ABC Order', icon: SCREEN_ICONS.pencil, color: '#6BCB77', description: 'Put letters in order!' },
    { id: 'quiz' as GameType, title: 'Letter Quiz', icon: SCREEN_ICONS.question, color: '#9B59B6', description: 'Answer letter questions!' },
  ];

  return (
    <View style={styles.menuContainer}>
      <View style={styles.instructionBox}>
        <Text style={styles.instructionText}>🎮 Choose a game to play! 🎯</Text>
      </View>
      {games.map((game, index) => (
        <GameMenuItem key={game.id} game={game} index={index} onPress={() => onSelectGame(game.id)} />
      ))}
    </View>
  );
};

const GameMenuItem: React.FC<{
  game: { id: GameType; title: string; icon: any; color: string; description: string };
  index: number;
  onPress: () => void;
}> = ({ game, index, onPress }) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;
  const bgColor = CARD_BG_COLORS[index % CARD_BG_COLORS.length];

  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      delay: index * 80,
      tension: 80,
      friction: 6,
    }).start();

    // Floating animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, { toValue: -2, duration: 1200, useNativeDriver: true }),
        Animated.timing(floatAnim, { toValue: 0, duration: 1200, useNativeDriver: true }),
      ])
    ).start();
  }, [scaleAnim, floatAnim, index]);

  return (
    <Animated.View style={[styles.menuItemWrapper, { transform: [{ scale: scaleAnim }, { translateY: floatAnim }] }]}>
      <TouchableOpacity
        onPress={onPress}
        style={[styles.gameMenuItem, { backgroundColor: bgColor, borderColor: game.color }]}
        activeOpacity={0.9}
      >
        {/* Sparkles */}
        <Text style={styles.sparkleLeft}>✨</Text>
        <Text style={styles.sparkleRight}>⭐</Text>

        {/* Icon with colored background */}
        <View style={[styles.gameMenuIconContainer, { backgroundColor: game.color }]}>
          <View style={styles.iconShine} />
          <Image source={game.icon} style={styles.gameMenuIcon} resizeMode="contain" />
        </View>

        <View style={styles.gameMenuText}>
          <Text style={[styles.gameMenuTitle, { color: game.color }]}>{game.title}</Text>
          <Text style={styles.gameMenuDesc}>{game.description}</Text>
        </View>

        {/* Play button */}
        <View style={[styles.playButton, { backgroundColor: game.color }]}>
          <Text style={styles.playButtonText}>▶ Play</Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

// Match Game Component
const MatchGame: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [score, setScore] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedLetter, setSelectedLetter] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [options, setOptions] = useState<string[]>([]);

  const currentLetter = ALPHABETS[currentIndex];
  const feedbackAnim = useRef(new Animated.Value(0)).current;

  const generateOptions = useCallback(() => {
    const correctLetter = currentLetter.letter;
    const wrongLetters: string[] = [];
    
    while (wrongLetters.length < 3) {
      const randomIndex = Math.floor(Math.random() * ALPHABETS.length);
      const letter = ALPHABETS[randomIndex].letter;
      if (letter !== correctLetter && !wrongLetters.includes(letter)) {
        wrongLetters.push(letter);
      }
    }
    
    const allOptions = [correctLetter, ...wrongLetters];
    // Shuffle
    for (let i = allOptions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [allOptions[i], allOptions[j]] = [allOptions[j], allOptions[i]];
    }
    
    setOptions(allOptions);
  }, [currentLetter.letter]);

  useEffect(() => {
    generateOptions();
  }, [generateOptions]);

  const checkAnswer = (letter: string) => {
    setSelectedLetter(letter);
    const isCorrect = letter === currentLetter.letter;
    setFeedback(isCorrect ? 'correct' : 'wrong');
    
    // Speak feedback
    speakFeedback(isCorrect);
    
    if (isCorrect) {
      setScore(score + 10);
    }

    // Animate feedback
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
      setSelectedLetter(null);
      if (isCorrect) {
        setCurrentIndex((prev) => (prev + 1) % ALPHABETS.length);
      }
    });
  };

  return (
    <View style={styles.gameContainer}>
      <View style={styles.gameHeader}>
        <TouchableOpacity onPress={onBack} style={styles.gameBackBtn}>
          <Text style={styles.gameBackText}>← Games</Text>
        </TouchableOpacity>
        <View style={styles.scoreContainer}>
          <Text style={styles.scoreText}>⭐ {score}</Text>
        </View>
      </View>

      <Text style={styles.gameInstruction}>Which letter is for "{currentLetter.word}"?</Text>
      
      <View style={styles.emojiContainer}>
        <Text style={styles.largeEmoji}>{currentLetter.emoji}</Text>
        <Text style={styles.wordHint}>{currentLetter.word}</Text>
      </View>

      <View style={styles.optionsGrid}>
        {options.map((letter, index) => (
          <TouchableOpacity
            key={`${letter}-${index}`}
            onPress={() => !feedback && checkAnswer(letter)}
            style={[
              styles.optionButton,
              { backgroundColor: RAINBOW_COLORS[index] },
              selectedLetter === letter && feedback === 'correct' && styles.correctOption,
              selectedLetter === letter && feedback === 'wrong' && styles.wrongOption,
            ]}
          >
            <Text style={styles.optionLetter}>{letter}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {feedback && (
        <Animated.View
          style={[
            styles.feedbackContainer,
            {
              opacity: feedbackAnim,
              transform: [{ scale: feedbackAnim }],
            },
          ]}
        >
          <Text style={styles.feedbackEmoji}>
            {feedback === 'correct' ? '🎉' : '😅'}
          </Text>
          <Text style={[styles.feedbackText, { color: feedback === 'correct' ? COLORS.correct : COLORS.wrong }]}>
            {feedback === 'correct' ? 'Great Job!' : 'Try Again!'}
          </Text>
        </Animated.View>
      )}
    </View>
  );
};

// Find Letter Game Component
const FindGame: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [score, setScore] = useState(0);
  const [targetLetter, setTargetLetter] = useState('');
  const [gridLetters, setGridLetters] = useState<string[]>([]);
  const [found, setFound] = useState<number[]>([]);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const feedbackAnim = useRef(new Animated.Value(0)).current;

  const generateGrid = useCallback(() => {
    const target = ALPHABETS[Math.floor(Math.random() * ALPHABETS.length)].letter;
    setTargetLetter(target);
    setFound([]);
    
    const grid: string[] = [];
    const targetCount = 3 + Math.floor(Math.random() * 3); // 3-5 targets
    
    // Add target letters
    for (let i = 0; i < targetCount; i++) {
      grid.push(target);
    }
    
    // Fill rest with random letters
    while (grid.length < 16) {
      const randomLetter = ALPHABETS[Math.floor(Math.random() * ALPHABETS.length)].letter;
      if (randomLetter !== target) {
        grid.push(randomLetter);
      }
    }
    
    // Shuffle
    for (let i = grid.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [grid[i], grid[j]] = [grid[j], grid[i]];
    }
    
    setGridLetters(grid);
  }, []);

  useEffect(() => {
    generateGrid();
  }, [generateGrid]);

  const handleTap = (index: number) => {
    if (found.includes(index)) return;
    
    if (gridLetters[index] === targetLetter) {
      setFound([...found, index]);
      setScore(score + 5);
      setFeedback('correct');
      speakFeedback(true);
    } else {
      setFeedback('wrong');
      speakFeedback(false);
    }

    Animated.sequence([
      Animated.timing(feedbackAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.delay(300),
      Animated.timing(feedbackAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => setFeedback(null));

    // Check if all targets found
    const allTargets = gridLetters.filter(l => l === targetLetter).length;
    if (found.length + 1 >= allTargets && gridLetters[index] === targetLetter) {
      speakCelebration();
      setTimeout(generateGrid, 1000);
    }
  };

  const targetsRemaining = gridLetters.filter(l => l === targetLetter).length - found.length;

  return (
    <View style={styles.gameContainer}>
      <View style={styles.gameHeader}>
        <TouchableOpacity onPress={onBack} style={styles.gameBackBtn}>
          <Text style={styles.gameBackText}>← Games</Text>
        </TouchableOpacity>
        <View style={styles.scoreContainer}>
          <Text style={styles.scoreText}>⭐ {score}</Text>
        </View>
      </View>

      <Text style={styles.gameInstruction}>
        Find all the letter <Text style={styles.highlightLetter}>{targetLetter}</Text>!
      </Text>
      <Text style={styles.subInstruction}>🔍 {targetsRemaining} left to find!</Text>

      <View style={styles.letterGrid}>
        {gridLetters.map((letter, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => handleTap(index)}
            style={[
              styles.gridCell,
              { backgroundColor: RAINBOW_COLORS[index % RAINBOW_COLORS.length] },
              found.includes(index) && styles.foundCell,
            ]}
          >
            <Text style={[styles.gridLetter, found.includes(index) && styles.foundLetter]}>
              {letter}
            </Text>
            {found.includes(index) && <Text style={styles.checkMark}>✓</Text>}
          </TouchableOpacity>
        ))}
      </View>

      {feedback && (
        <Animated.View
          style={[
            styles.miniFeedback,
            {
              opacity: feedbackAnim,
              backgroundColor: feedback === 'correct' ? COLORS.correct : COLORS.wrong,
            },
          ]}
        >
          <Text style={styles.miniFeedbackText}>
            {feedback === 'correct' ? '✓' : '✗'}
          </Text>
        </Animated.View>
      )}
    </View>
  );
};

// Order Game Component
const OrderGame: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [score, setScore] = useState(0);
  const [letters, setLetters] = useState<string[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [correctOrder, setCorrectOrder] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const feedbackAnim = useRef(new Animated.Value(0)).current;

  const generatePuzzle = useCallback(() => {
    const startIndex = Math.floor(Math.random() * (ALPHABETS.length - 5));
    const correct = ALPHABETS.slice(startIndex, startIndex + 5).map(a => a.letter);
    setCorrectOrder(correct);
    
    // Shuffle
    const shuffled = [...correct];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    
    setLetters(shuffled);
    setSelected([]);
  }, []);

  useEffect(() => {
    generatePuzzle();
  }, [generatePuzzle]);

  const handleSelect = (letter: string) => {
    if (selected.includes(letter)) return;
    
    const newSelected = [...selected, letter];
    setSelected(newSelected);
    
    // Check if order is correct so far
    const isCorrectSoFar = newSelected.every((l, i) => l === correctOrder[i]);
    
    if (!isCorrectSoFar) {
      setFeedback('wrong');
      speakFeedback(false);
      Animated.sequence([
        Animated.timing(feedbackAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.delay(500),
        Animated.timing(feedbackAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setFeedback(null);
        setSelected([]);
      });
    } else if (newSelected.length === correctOrder.length) {
      setScore(score + 20);
      setFeedback('correct');
      speakCelebration();
      Animated.sequence([
        Animated.timing(feedbackAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.delay(1000),
        Animated.timing(feedbackAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setFeedback(null);
        generatePuzzle();
      });
    }
  };

  return (
    <View style={styles.gameContainer}>
      <View style={styles.gameHeader}>
        <TouchableOpacity onPress={onBack} style={styles.gameBackBtn}>
          <Text style={styles.gameBackText}>← Games</Text>
        </TouchableOpacity>
        <View style={styles.scoreContainer}>
          <Text style={styles.scoreText}>⭐ {score}</Text>
        </View>
      </View>

      <Text style={styles.gameInstruction}>Put these letters in ABC order!</Text>

      {/* Selected letters display */}
      <View style={styles.selectedContainer}>
        {correctOrder.map((_, index) => (
          <View key={index} style={styles.selectedSlot}>
            {selected[index] ? (
              <Text style={styles.selectedLetter}>{selected[index]}</Text>
            ) : (
              <Text style={styles.slotNumber}>{index + 1}</Text>
            )}
          </View>
        ))}
      </View>

      {/* Available letters */}
      <View style={styles.availableContainer}>
        {letters.map((letter, index) => (
          <TouchableOpacity
            key={`${letter}-${index}`}
            onPress={() => handleSelect(letter)}
            style={[
              styles.availableLetter,
              { backgroundColor: RAINBOW_COLORS[index] },
              selected.includes(letter) && styles.usedLetter,
            ]}
            disabled={selected.includes(letter)}
          >
            <Text style={styles.availableLetterText}>{letter}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {feedback && (
        <Animated.View
          style={[
            styles.feedbackContainer,
            {
              opacity: feedbackAnim,
              transform: [{ scale: feedbackAnim }],
            },
          ]}
        >
          <Text style={styles.feedbackEmoji}>
            {feedback === 'correct' ? '🎉' : '😅'}
          </Text>
          <Text style={[styles.feedbackText, { color: feedback === 'correct' ? COLORS.correct : COLORS.wrong }]}>
            {feedback === 'correct' ? 'Perfect!' : 'Oops! Try again!'}
          </Text>
        </Animated.View>
      )}
    </View>
  );
};

// Quiz Game Component
const QuizGame: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [score, setScore] = useState(0);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<{
    question: string;
    correct: string;
    options: string[];
    emoji: string;
  } | null>(null);
  const feedbackAnim = useRef(new Animated.Value(0)).current;

  const generateQuestion = useCallback(() => {
    const types = ['next', 'before', 'starts'];
    const type = types[Math.floor(Math.random() * types.length)];
    const randomIndex = Math.floor(Math.random() * (ALPHABETS.length - 2)) + 1;
    const alphabet = ALPHABETS[randomIndex];
    
    let question = '';
    let correct = '';
    let emoji = '';
    
    switch (type) {
      case 'next':
        question = `What comes after ${alphabet.letter}?`;
        correct = ALPHABETS[randomIndex + 1].letter;
        emoji = '➡️';
        break;
      case 'before':
        question = `What comes before ${alphabet.letter}?`;
        correct = ALPHABETS[randomIndex - 1].letter;
        emoji = '⬅️';
        break;
      case 'starts':
        question = `Which letter does ${alphabet.word} start with?`;
        correct = alphabet.letter;
        emoji = alphabet.emoji;
        break;
    }
    
    const options = [correct];
    while (options.length < 4) {
      const randomLetter = ALPHABETS[Math.floor(Math.random() * ALPHABETS.length)].letter;
      if (!options.includes(randomLetter)) {
        options.push(randomLetter);
      }
    }
    
    // Shuffle
    for (let i = options.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [options[i], options[j]] = [options[j], options[i]];
    }
    
    setCurrentQuestion({ question, correct, options, emoji });
  }, []);

  useEffect(() => {
    generateQuestion();
  }, [generateQuestion, questionIndex]);

  const handleAnswer = (answer: string) => {
    if (!currentQuestion) return;
    
    const isCorrect = answer === currentQuestion.correct;
    setFeedback(isCorrect ? 'correct' : 'wrong');
    
    // Speak feedback
    if (isCorrect) {
      speakCelebration();
      setScore(score + 15);
    } else {
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
        setQuestionIndex(prev => prev + 1);
      }
    });
  };

  if (!currentQuestion) return null;

  return (
    <View style={styles.gameContainer}>
      <View style={styles.gameHeader}>
        <TouchableOpacity onPress={onBack} style={styles.gameBackBtn}>
          <Text style={styles.gameBackText}>← Games</Text>
        </TouchableOpacity>
        <View style={styles.scoreContainer}>
          <Text style={styles.scoreText}>⭐ {score}</Text>
        </View>
      </View>

      <View style={styles.quizContainer}>
        <Text style={styles.quizEmoji}>{currentQuestion.emoji}</Text>
        <Text style={styles.quizQuestion}>{currentQuestion.question}</Text>
      </View>

      <View style={styles.quizOptions}>
        {currentQuestion.options.map((option, index) => (
          <TouchableOpacity
            key={`${option}-${index}`}
            onPress={() => !feedback && handleAnswer(option)}
            style={[
              styles.quizOption,
              { backgroundColor: RAINBOW_COLORS[index] },
            ]}
          >
            <Text style={styles.quizOptionText}>{option}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.questionCounter}>
        <Text style={styles.counterText}>Question {questionIndex + 1}</Text>
      </View>

      {feedback && (
        <Animated.View
          style={[
            styles.feedbackContainer,
            {
              opacity: feedbackAnim,
              transform: [{ scale: feedbackAnim }],
            },
          ]}
        >
          <Text style={styles.feedbackEmoji}>
            {feedback === 'correct' ? '🎉' : '😅'}
          </Text>
          <Text style={[styles.feedbackText, { color: feedback === 'correct' ? COLORS.correct : COLORS.wrong }]}>
            {feedback === 'correct' ? 'Correct!' : `It's ${currentQuestion.correct}!`}
          </Text>
        </Animated.View>
      )}
    </View>
  );
};

// Main Games Screen
export const GamesScreen: React.FC<GamesScreenProps> = ({ navigation, route }) => {
  const insets = useSafeAreaInsets();
  const [currentGame, setCurrentGame] = useState<GameType>('menu');

  // Check if we should start a specific game (from Coloring screen)
  useEffect(() => {
    if (route?.params?.startGame) {
      const gameToStart = route.params.startGame as GameType;
      if (['match', 'find', 'order', 'quiz'].includes(gameToStart)) {
        setCurrentGame(gameToStart);
      }
    }
  }, [route?.params?.startGame]);

  // Switch to game music when entering ABC Games
  useEffect(() => {
    switchBackgroundMusic('game');
    
    // Switch back to home music and cleanup when leaving
    return () => {
      stopSpeaking();
      switchBackgroundMusic('home');
    };
  }, []);

  const handleBackToMenu = () => {
    stopSpeaking();
    setCurrentGame('menu');
  };

  const renderGame = () => {
    switch (currentGame) {
      case 'match':
        return <MatchGame onBack={handleBackToMenu} />;
      case 'find':
        return <FindGame onBack={handleBackToMenu} />;
      case 'order':
        return <OrderGame onBack={handleBackToMenu} />;
      case 'quiz':
        return <QuizGame onBack={handleBackToMenu} />;
      default:
        return <GameMenu onSelectGame={setCurrentGame} />;
    }
  };

  return (
    <ImageBackground 
      source={GAMES_BG_IMAGE} 
      style={styles.container}
      resizeMode="cover"
    >
      <StatusBar barStyle="dark-content" />

      {/* Header - only show on menu */}
      {currentGame === 'menu' && (
        <View style={[styles.header, { marginTop: insets.top + 10 }]}>
          <TouchableOpacity 
            onPress={() => { stopSpeaking(); navigation.goBack(); }} 
            style={styles.backBtn}
          >
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>🔤 ABC Games</Text>
          <View style={styles.headerSpace} />
        </View>
      )}

      <ScrollView 
        contentContainerStyle={styles.scrollContent} 
        showsVerticalScrollIndicator={false}
      >
        {renderGame()}
      </ScrollView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  // Header styles - matching other screens
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    marginBottom: 10,
  },
  backBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  backText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FF6B6B',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#9B59B6',
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  headerSpace: {
    width: 70,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 30,
  },
  
  // Game Menu Styles
  menuContainer: {
    paddingHorizontal: 15,
    paddingTop: 10,
  },
  instructionBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginBottom: 15,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFD93D',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  instructionText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#9B59B6',
    textAlign: 'center',
  },
  menuItemWrapper: {
    marginBottom: 12,
  },
  gameMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 22,
    borderWidth: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
    position: 'relative',
    overflow: 'visible',
  },
  sparkleLeft: {
    position: 'absolute',
    top: 8,
    left: 10,
    fontSize: 14,
  },
  sparkleRight: {
    position: 'absolute',
    top: 8,
    right: 10,
    fontSize: 14,
  },
  gameMenuIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
    overflow: 'hidden',
  },
  iconShine: {
    position: 'absolute',
    top: 5,
    left: 8,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  gameMenuIcon: {
    width: 28,
    height: 28,
    tintColor: COLORS.white,
  },
  gameMenuText: {
    flex: 1,
  },
  gameMenuTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  gameMenuDesc: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  playButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  playButtonText: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.white,
  },

  // Game Common Styles
  gameContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  gameHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingTop: 10,
  },
  gameBackBtn: {
    padding: 8,
  },
  gameBackText: {
    fontSize: 16,
    color: COLORS.blue,
    fontWeight: '600',
  },
  scoreContainer: {
    backgroundColor: COLORS.yellow,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  scoreText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.black,
  },
  gameInstruction: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.purple,
    textAlign: 'center',
    marginBottom: 10,
  },
  subInstruction: {
    fontSize: 16,
    color: COLORS.gray,
    textAlign: 'center',
    marginBottom: 20,
  },
  highlightLetter: {
    color: COLORS.red,
    fontSize: 28,
    fontWeight: '900',
  },

  // Match Game Styles
  emojiContainer: {
    alignItems: 'center',
    marginBottom: 30,
    backgroundColor: COLORS.white,
    paddingVertical: 30,
    paddingHorizontal: 40,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  largeEmoji: {
    fontSize: 80,
    marginBottom: 10,
  },
  wordHint: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.black,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  optionButton: {
    width: (width - 60) / 2,
    height: 80,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 5,
  },
  optionLetter: {
    fontSize: 40,
    fontWeight: '900',
    color: COLORS.white,
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  correctOption: {
    borderWidth: 4,
    borderColor: COLORS.correct,
  },
  wrongOption: {
    borderWidth: 4,
    borderColor: COLORS.wrong,
  },

  // Find Game Styles
  letterGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
  },
  gridCell: {
    width: (width - 80) / 4,
    height: (width - 80) / 4,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  gridLetter: {
    fontSize: 32,
    fontWeight: '900',
    color: COLORS.white,
  },
  foundCell: {
    backgroundColor: COLORS.correct,
    opacity: 0.7,
  },
  foundLetter: {
    textDecorationLine: 'line-through',
  },
  checkMark: {
    position: 'absolute',
    top: 5,
    right: 5,
    fontSize: 16,
    color: COLORS.white,
  },
  miniFeedback: {
    position: 'absolute',
    bottom: 100,
    alignSelf: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  miniFeedbackText: {
    fontSize: 24,
    color: COLORS.white,
    fontWeight: 'bold',
  },

  // Order Game Styles
  selectedContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 30,
    gap: 10,
  },
  selectedSlot: {
    width: 55,
    height: 55,
    backgroundColor: COLORS.white,
    borderRadius: 15,
    borderWidth: 3,
    borderColor: COLORS.purple,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedLetter: {
    fontSize: 28,
    fontWeight: '900',
    color: COLORS.purple,
  },
  slotNumber: {
    fontSize: 16,
    color: COLORS.gray,
  },
  availableContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: 15,
  },
  availableLetter: {
    width: 65,
    height: 65,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 5,
  },
  availableLetterText: {
    fontSize: 32,
    fontWeight: '900',
    color: COLORS.white,
  },
  usedLetter: {
    opacity: 0.3,
  },

  // Quiz Game Styles
  quizContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 25,
    padding: 30,
    alignItems: 'center',
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  quizEmoji: {
    fontSize: 60,
    marginBottom: 15,
  },
  quizQuestion: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.black,
    textAlign: 'center',
  },
  quizOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quizOption: {
    width: (width - 60) / 2,
    height: 70,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 5,
  },
  quizOptionText: {
    fontSize: 36,
    fontWeight: '900',
    color: COLORS.white,
  },
  questionCounter: {
    alignItems: 'center',
    marginTop: 20,
  },
  counterText: {
    fontSize: 16,
    color: COLORS.gray,
  },

  // Feedback Styles
  feedbackContainer: {
    position: 'absolute',
    top: '40%',
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
  feedbackEmoji: {
    fontSize: 50,
    marginBottom: 10,
  },
  feedbackText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
});
