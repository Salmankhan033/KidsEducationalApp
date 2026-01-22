import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Animated,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '../constants/colors';
import { speakWord, speakCelebration, stopSpeaking } from '../utils/speech';
import { ScreenHeader } from '../components';
import { SCREEN_ICONS } from '../assets/images';
import { useResponsiveLayout } from '../utils/useResponsiveLayout';

const { width, height } = Dimensions.get('window');

// Balloon data with different colors and emojis
const BALLOON_COLORS = [
  { color: '#FF6B6B', emoji: '🎈' },
  { color: '#4ECDC4', emoji: '🎈' },
  { color: '#FFE66D', emoji: '🎈' },
  { color: '#95E1D3', emoji: '🎈' },
  { color: '#F38181', emoji: '🎈' },
  { color: '#AA96DA', emoji: '🎈' },
  { color: '#FF9F43', emoji: '🎈' },
  { color: '#6BCB77', emoji: '🎈' },
];

// Special items that give bonus points
const SPECIAL_ITEMS = ['⭐', '🌟', '💎', '🎁', '🍬'];

interface Balloon {
  id: number;
  x: number;
  emoji: string;
  color: string;
  isSpecial: boolean;
  anim: Animated.Value;
  popAnim: Animated.Value;
  isPopped: boolean;
}

interface BuildGameScreenProps {
  navigation: any;
}

export const BuildGameScreen: React.FC<BuildGameScreenProps> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { isLandscape, width: screenWidth, height: screenHeight } = useResponsiveLayout();
  
  const [score, setScore] = useState(0);
  const [balloons, setBalloons] = useState<Balloon[]>([]);
  const [poppedCount, setPoppedCount] = useState(0);
  const [gameActive, setGameActive] = useState(true);
  const [showCelebration, setShowCelebration] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const [highScore, setHighScore] = useState(0);
  
  const balloonIdRef = useRef(0);
  const celebrationAnim = useRef(new Animated.Value(0)).current;

  const GAME_AREA_HEIGHT = isLandscape ? screenHeight * 0.65 : screenHeight * 0.55;
  const GAME_AREA_WIDTH = isLandscape ? screenWidth * 0.7 : screenWidth - 40;

  // Create a new balloon
  const createBalloon = useCallback(() => {
    const isSpecial = Math.random() < 0.15; // 15% chance for special item
    const balloonData = BALLOON_COLORS[Math.floor(Math.random() * BALLOON_COLORS.length)];
    const specialItem = SPECIAL_ITEMS[Math.floor(Math.random() * SPECIAL_ITEMS.length)];
    
    const newBalloon: Balloon = {
      id: balloonIdRef.current++,
      x: Math.random() * (GAME_AREA_WIDTH - 60) + 20,
      emoji: isSpecial ? specialItem : balloonData.emoji,
      color: isSpecial ? '#FFD700' : balloonData.color,
      isSpecial,
      anim: new Animated.Value(GAME_AREA_HEIGHT + 50),
      popAnim: new Animated.Value(1),
      isPopped: false,
    };

    setBalloons(prev => [...prev, newBalloon]);

    // Animate balloon floating up
    const duration = isSpecial ? 4000 : 3000 + Math.random() * 2000;
    Animated.timing(newBalloon.anim, {
      toValue: -100,
      duration,
      useNativeDriver: true,
    }).start(() => {
      // Remove balloon when it goes off screen
      setBalloons(prev => prev.filter(b => b.id !== newBalloon.id));
    });
  }, [GAME_AREA_HEIGHT, GAME_AREA_WIDTH]);

  // Game timer
  useEffect(() => {
    if (!gameActive || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setGameActive(false);
          if (score > highScore) {
            setHighScore(score);
          }
          setShowCelebration(true);
          speakCelebration();
          Animated.spring(celebrationAnim, {
            toValue: 1,
            friction: 4,
            tension: 50,
            useNativeDriver: true,
          }).start();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameActive, timeLeft, score, highScore, celebrationAnim]);

  // Spawn balloons
  useEffect(() => {
    if (!gameActive) return;

    const spawnInterval = setInterval(() => {
      if (balloons.length < 8) {
        createBalloon();
      }
    }, 800);

    return () => clearInterval(spawnInterval);
  }, [gameActive, balloons.length, createBalloon]);

  // Initial balloon spawn
  useEffect(() => {
    speakWord("Pop the balloons!");
    for (let i = 0; i < 3; i++) {
      setTimeout(() => createBalloon(), i * 300);
    }
    return () => stopSpeaking();
  }, [createBalloon]);

  const handlePopBalloon = (balloon: Balloon) => {
    if (balloon.isPopped || !gameActive) return;

    // Mark as popped
    setBalloons(prev => 
      prev.map(b => b.id === balloon.id ? { ...b, isPopped: true } : b)
    );

    // Pop animation
    Animated.sequence([
      Animated.timing(balloon.popAnim, {
        toValue: 1.5,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(balloon.popAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setBalloons(prev => prev.filter(b => b.id !== balloon.id));
    });

    // Update score
    const points = balloon.isSpecial ? 5 : 1;
    setScore(prev => prev + points);
    setPoppedCount(prev => prev + 1);

    // Feedback
    if (balloon.isSpecial) {
      speakWord('Bonus!');
    }
  };

  const resetGame = () => {
    setBalloons([]);
    setScore(0);
    setPoppedCount(0);
    setTimeLeft(30);
    setGameActive(true);
    setShowCelebration(false);
    celebrationAnim.setValue(0);
    balloonIdRef.current = 0;
    speakWord("Pop the balloons!");
    
    // Spawn initial balloons
    for (let i = 0; i < 3; i++) {
      setTimeout(() => createBalloon(), i * 300);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingLeft: insets.left, paddingRight: insets.right }]}>
      <ScreenHeader
        title="Pop It!"
        icon={SCREEN_ICONS.blocks}
        onBack={() => { stopSpeaking(); navigation.goBack(); }}
        compact={isLandscape}
      />

      <View style={[styles.content, isLandscape && styles.contentLandscape]}>
        {/* Stats Row */}
        <View style={[styles.statsRow, isLandscape && styles.statsRowLandscape]}>
          <View style={[styles.statBox, styles.scoreBox]}>
            <Text style={styles.statEmoji}>⭐</Text>
            <Text style={[styles.statValue, isLandscape && styles.statValueLandscape]}>{score}</Text>
          </View>
          
          <View style={[styles.statBox, styles.timerBox, timeLeft <= 10 && styles.timerWarning]}>
            <Text style={styles.statEmoji}>⏱️</Text>
            <Text style={[styles.statValue, isLandscape && styles.statValueLandscape]}>{timeLeft}s</Text>
          </View>
          
          <View style={[styles.statBox, styles.countBox]}>
            <Text style={styles.statEmoji}>🎈</Text>
            <Text style={[styles.statValue, isLandscape && styles.statValueLandscape]}>{poppedCount}</Text>
          </View>
        </View>

        {/* Game Area */}
        <View style={[
          styles.gameArea,
          { height: GAME_AREA_HEIGHT, width: GAME_AREA_WIDTH },
          isLandscape && styles.gameAreaLandscape,
        ]}>
          {/* Background decorations */}
          <View style={styles.cloudLeft}>
            <Text style={styles.cloudEmoji}>☁️</Text>
          </View>
          <View style={styles.cloudRight}>
            <Text style={styles.cloudEmoji}>☁️</Text>
          </View>
          
          {/* Balloons */}
          {balloons.map(balloon => (
            <Animated.View
              key={balloon.id}
              style={[
                styles.balloonWrapper,
                {
                  left: balloon.x,
                  transform: [
                    { translateY: balloon.anim },
                    { scale: balloon.popAnim },
                  ],
                },
              ]}
            >
              <TouchableOpacity
                onPress={() => handlePopBalloon(balloon)}
                style={[
                  styles.balloon,
                  { backgroundColor: balloon.color },
                  balloon.isSpecial && styles.specialBalloon,
                ]}
                activeOpacity={0.8}
              >
                <Text style={[styles.balloonEmoji, isLandscape && styles.balloonEmojiLandscape]}>
                  {balloon.emoji}
                </Text>
              </TouchableOpacity>
              {/* Balloon string */}
              <View style={[styles.balloonString, { backgroundColor: balloon.color }]} />
            </Animated.View>
          ))}

          {/* Game Over Overlay */}
          {!gameActive && (
            <View style={styles.gameOverOverlay}>
              <Text style={styles.gameOverText}>Time's Up!</Text>
            </View>
          )}
        </View>

        {/* Instructions / High Score */}
        <View style={[styles.infoRow, isLandscape && styles.infoRowLandscape]}>
          {gameActive ? (
            <Text style={[styles.hintText, isLandscape && styles.hintTextLandscape]}>
              💡 Tap balloons to pop them! ⭐ items give bonus points!
            </Text>
          ) : (
            <Text style={[styles.highScoreText, isLandscape && styles.highScoreTextLandscape]}>
              🏆 High Score: {highScore}
            </Text>
          )}
        </View>

        {/* Play Again Button */}
        {!gameActive && (
          <TouchableOpacity 
            onPress={resetGame} 
            style={[styles.playAgainButton, isLandscape && styles.playAgainButtonLandscape]}
          >
            <Text style={styles.playAgainEmoji}>🔄</Text>
            <Text style={[styles.playAgainText, isLandscape && styles.playAgainTextLandscape]}>
              Play Again
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Celebration Overlay */}
      {showCelebration && (
        <Animated.View 
          style={[
            styles.celebrationOverlay,
            { transform: [{ scale: celebrationAnim }] }
          ]}
        >
          <View style={[styles.celebrationCard, isLandscape && styles.celebrationCardLandscape]}>
            <Text style={[styles.celebrationEmoji, isLandscape && styles.celebrationEmojiLandscape]}>🎉</Text>
            <Text style={[styles.celebrationText, isLandscape && styles.celebrationTextLandscape]}>
              Great Job!
            </Text>
            <Text style={[styles.celebrationScore, isLandscape && styles.celebrationScoreLandscape]}>
              Score: {score}
            </Text>
            <Text style={[styles.celebrationSubtext, isLandscape && styles.celebrationSubtextLandscape]}>
              You popped {poppedCount} balloons!
            </Text>
          </View>
        </Animated.View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E6F7FF',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  contentLandscape: {
    paddingHorizontal: 15,
  },
  
  // Stats
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 15,
    gap: 12,
  },
  statsRowLandscape: {
    marginBottom: 8,
    maxWidth: '70%',
  },
  statBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 20,
    gap: 8,
  },
  scoreBox: {
    backgroundColor: '#FFD700',
  },
  timerBox: {
    backgroundColor: '#87CEEB',
  },
  timerWarning: {
    backgroundColor: '#FF6B6B',
  },
  countBox: {
    backgroundColor: '#98D8C8',
  },
  statEmoji: {
    fontSize: 20,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '900',
    color: '#333',
  },
  statValueLandscape: {
    fontSize: 18,
  },
  
  // Game Area
  gameArea: {
    backgroundColor: '#B8E4FF',
    borderRadius: 30,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 4,
    borderColor: '#7BC8F6',
  },
  gameAreaLandscape: {
    borderRadius: 20,
    borderWidth: 3,
  },
  cloudLeft: {
    position: 'absolute',
    top: 20,
    left: 20,
    opacity: 0.7,
  },
  cloudRight: {
    position: 'absolute',
    top: 40,
    right: 30,
    opacity: 0.7,
  },
  cloudEmoji: {
    fontSize: 40,
  },
  
  // Balloons
  balloonWrapper: {
    position: 'absolute',
    alignItems: 'center',
  },
  balloon: {
    width: 60,
    height: 75,
    borderRadius: 30,
    borderBottomLeftRadius: 35,
    borderBottomRightRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  specialBalloon: {
    borderWidth: 3,
    borderColor: '#FFF',
  },
  balloonEmoji: {
    fontSize: 35,
  },
  balloonEmojiLandscape: {
    fontSize: 28,
  },
  balloonString: {
    width: 2,
    height: 25,
    borderRadius: 1,
  },
  
  // Game Over
  gameOverOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  gameOverText: {
    fontSize: 36,
    fontWeight: '900',
    color: '#FFF',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 5,
  },
  
  // Info Row
  infoRow: {
    marginTop: 15,
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#E3F2FD',
    borderRadius: 20,
  },
  infoRowLandscape: {
    marginTop: 8,
    paddingVertical: 8,
    paddingHorizontal: 15,
  },
  hintText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1565C0',
    textAlign: 'center',
  },
  hintTextLandscape: {
    fontSize: 12,
  },
  highScoreText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FF6B00',
    textAlign: 'center',
  },
  highScoreTextLandscape: {
    fontSize: 14,
  },
  
  // Play Again Button
  playAgainButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4CAF50',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
    marginTop: 15,
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  playAgainButtonLandscape: {
    marginTop: 10,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  playAgainEmoji: {
    fontSize: 22,
  },
  playAgainText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
  },
  playAgainTextLandscape: {
    fontSize: 14,
  },
  
  // Celebration
  celebrationOverlay: {
    position: 'absolute',
    top: '30%',
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 100,
  },
  celebrationCard: {
    backgroundColor: '#FFD700',
    paddingHorizontal: 40,
    paddingVertical: 30,
    borderRadius: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
    borderWidth: 4,
    borderColor: '#FFF',
  },
  celebrationCardLandscape: {
    paddingHorizontal: 30,
    paddingVertical: 20,
  },
  celebrationEmoji: {
    fontSize: 60,
  },
  celebrationEmojiLandscape: {
    fontSize: 40,
  },
  celebrationText: {
    fontSize: 28,
    fontWeight: '900',
    color: '#333',
    marginTop: 10,
  },
  celebrationTextLandscape: {
    fontSize: 22,
    marginTop: 5,
  },
  celebrationScore: {
    fontSize: 24,
    fontWeight: '700',
    color: '#E65100',
    marginTop: 5,
  },
  celebrationScoreLandscape: {
    fontSize: 18,
  },
  celebrationSubtext: {
    fontSize: 16,
    fontWeight: '600',
    color: '#555',
    marginTop: 5,
  },
  celebrationSubtextLandscape: {
    fontSize: 13,
  },
});
