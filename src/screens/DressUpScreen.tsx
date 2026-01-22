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

// Cute animals that pop up
const ANIMALS = ['🐱', '🐶', '🐰', '🐻', '🐼', '🐨', '🦊', '🐸', '🐷', '🐮', '🦁', '🐯'];

// Grid configuration
const GRID_COLS = 3;
const GRID_ROWS = 3;
const TOTAL_HOLES = GRID_COLS * GRID_ROWS;

interface Hole {
  id: number;
  animal: string;
  isVisible: boolean;
  anim: Animated.Value;
}

interface DressUpScreenProps {
  navigation: any;
}

export const DressUpScreen: React.FC<DressUpScreenProps> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { isLandscape, width: screenWidth, height: screenHeight } = useResponsiveLayout();
  
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [gameActive, setGameActive] = useState(true);
  const [holes, setHoles] = useState<Hole[]>([]);
  const [tappedCount, setTappedCount] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);
  const [highScore, setHighScore] = useState(0);
  const [combo, setCombo] = useState(0);
  
  const celebrationAnim = useRef(new Animated.Value(0)).current;
  const lastTapTime = useRef(0);

  // Initialize holes
  useEffect(() => {
    const initialHoles: Hole[] = [];
    for (let i = 0; i < TOTAL_HOLES; i++) {
      initialHoles.push({
        id: i,
        animal: ANIMALS[Math.floor(Math.random() * ANIMALS.length)],
        isVisible: false,
        anim: new Animated.Value(0),
      });
    }
    setHoles(initialHoles);
    speakWord("Tap the animals!");
    return () => stopSpeaking();
  }, []);

  // Show random animal
  const showAnimal = useCallback(() => {
    if (!gameActive) return;

    const hiddenHoles = holes.filter(h => !h.isVisible);
    if (hiddenHoles.length === 0) return;

    const randomHole = hiddenHoles[Math.floor(Math.random() * hiddenHoles.length)];
    const newAnimal = ANIMALS[Math.floor(Math.random() * ANIMALS.length)];

    setHoles(prev => prev.map(h => {
      if (h.id === randomHole.id) {
        // Animate pop up
        Animated.spring(h.anim, {
          toValue: 1,
          friction: 5,
          tension: 100,
          useNativeDriver: true,
        }).start();
        
        return { ...h, animal: newAnimal, isVisible: true };
      }
      return h;
    }));

    // Auto hide after random time
    const hideTime = 1200 + Math.random() * 800;
    setTimeout(() => {
      hideAnimal(randomHole.id);
    }, hideTime);
  }, [holes, gameActive]);

  // Hide animal
  const hideAnimal = (holeId: number) => {
    setHoles(prev => prev.map(h => {
      if (h.id === holeId && h.isVisible) {
        Animated.timing(h.anim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }).start();
        return { ...h, isVisible: false };
      }
      return h;
    }));
  };

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

  // Spawn animals periodically
  useEffect(() => {
    if (!gameActive || holes.length === 0) return;

    const spawnInterval = setInterval(() => {
      showAnimal();
    }, 600);

    return () => clearInterval(spawnInterval);
  }, [gameActive, showAnimal, holes.length]);

  // Handle tap
  const handleTap = (hole: Hole) => {
    if (!hole.isVisible || !gameActive) return;

    const now = Date.now();
    const timeSinceLastTap = now - lastTapTime.current;
    lastTapTime.current = now;

    // Calculate combo
    let newCombo = combo;
    if (timeSinceLastTap < 1000) {
      newCombo = Math.min(combo + 1, 5);
    } else {
      newCombo = 1;
    }
    setCombo(newCombo);

    // Calculate points with combo bonus
    const points = 1 + Math.floor(newCombo / 2);
    setScore(prev => prev + points);
    setTappedCount(prev => prev + 1);

    // Hide the animal immediately
    setHoles(prev => prev.map(h => {
      if (h.id === hole.id) {
        Animated.sequence([
          Animated.timing(h.anim, {
            toValue: 1.3,
            duration: 50,
            useNativeDriver: true,
          }),
          Animated.timing(h.anim, {
            toValue: 0,
            duration: 100,
            useNativeDriver: true,
          }),
        ]).start();
        return { ...h, isVisible: false };
      }
      return h;
    }));

    // Sound feedback for combos
    if (newCombo >= 3) {
      speakWord('Combo!');
    }
  };

  const resetGame = () => {
    setScore(0);
    setTimeLeft(30);
    setGameActive(true);
    setTappedCount(0);
    setShowCelebration(false);
    setCombo(0);
    celebrationAnim.setValue(0);
    
    // Reset all holes
    setHoles(prev => prev.map(h => {
      h.anim.setValue(0);
      return { ...h, isVisible: false };
    }));
    
    speakWord("Tap the animals!");
  };

  const HOLE_SIZE = isLandscape ? 70 : 85;
  const GRID_GAP = isLandscape ? 12 : 15;

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingLeft: insets.left, paddingRight: insets.right }]}>
      <ScreenHeader
        title="Tap It!"
        icon={SCREEN_ICONS.mask}
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

          {combo >= 2 && (
            <View style={[styles.statBox, styles.comboBox]}>
              <Text style={styles.statEmoji}>🔥</Text>
              <Text style={[styles.statValue, isLandscape && styles.statValueLandscape]}>x{combo}</Text>
            </View>
          )}
        </View>

        {/* Game Grid */}
        <View style={[styles.gameArea, isLandscape && styles.gameAreaLandscape]}>
          <View style={[styles.grid, { gap: GRID_GAP }]}>
            {holes.map((hole) => (
            <TouchableOpacity
                key={hole.id}
                onPress={() => handleTap(hole)}
                style={[styles.hole, { width: HOLE_SIZE, height: HOLE_SIZE }]}
                activeOpacity={0.7}
              >
                {/* Hole background */}
                <View style={styles.holeInner}>
                  <Animated.View
                    style={[
                      styles.animalContainer,
                      {
                        transform: [
                          { scale: hole.anim },
                          {
                            translateY: hole.anim.interpolate({
                              inputRange: [0, 1],
                              outputRange: [30, 0],
                            }),
                          },
                        ],
                        opacity: hole.anim,
                      },
                    ]}
                  >
                    <Text style={[styles.animalEmoji, isLandscape && styles.animalEmojiLandscape]}>
                      {hole.animal}
              </Text>
                  </Animated.View>
                </View>
            </TouchableOpacity>
          ))}
          </View>
        </View>

        {/* Instructions / High Score */}
        <View style={[styles.infoRow, isLandscape && styles.infoRowLandscape]}>
          {gameActive ? (
            <Text style={[styles.hintText, isLandscape && styles.hintTextLandscape]}>
              💡 Tap animals quickly for combo bonus! 🔥
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
              Amazing!
            </Text>
            <Text style={[styles.celebrationScore, isLandscape && styles.celebrationScoreLandscape]}>
              Score: {score}
            </Text>
            <Text style={[styles.celebrationSubtext, isLandscape && styles.celebrationSubtextLandscape]}>
              You tapped {tappedCount} animals!
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
    backgroundColor: '#E8F5E9',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  contentLandscape: {
    paddingHorizontal: 15,
    flexDirection: 'column',
  },
  
  // Stats
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
    gap: 15,
  },
  statsRowLandscape: {
    marginBottom: 10,
    gap: 12,
  },
  statBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 20,
    gap: 8,
    minWidth: 90,
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
  comboBox: {
    backgroundColor: '#FF9800',
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
    backgroundColor: '#A5D6A7',
    borderRadius: 30,
    padding: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  gameAreaLandscape: {
    padding: 15,
    borderRadius: 20,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    width: 280,
  },
  hole: {
    backgroundColor: '#6B4423',
    borderRadius: 50,
    justifyContent: 'flex-end',
    alignItems: 'center',
    overflow: 'hidden',
    borderWidth: 4,
    borderColor: '#5D3A1A',
  },
  holeInner: {
    width: '100%',
    height: '100%',
    backgroundColor: '#4A3015',
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  animalContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  animalEmoji: {
    fontSize: 45,
  },
  animalEmojiLandscape: {
    fontSize: 35,
  },
  
  // Info Row
  infoRow: {
    marginTop: 20,
    paddingHorizontal: 25,
    paddingVertical: 12,
    backgroundColor: '#C8E6C9',
    borderRadius: 20,
  },
  infoRowLandscape: {
    marginTop: 10,
    paddingVertical: 8,
    paddingHorizontal: 20,
  },
  hintText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2E7D32',
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
    marginTop: 20,
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
