import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Animated,
  Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, RAINBOW_COLORS } from '../constants/colors';
import { speakWord, speakCelebration, stopSpeaking } from '../utils/speech';
import { ScreenHeader } from '../components';
import { SCREEN_ICONS } from '../assets/images';
import { useResponsiveLayout } from '../utils/useResponsiveLayout';

const { width, height } = Dimensions.get('window');

interface ReactionGameScreenProps {
  navigation: any;
}

export const ReactionGameScreen: React.FC<ReactionGameScreenProps> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { isLandscape } = useResponsiveLayout();
  const [gameState, setGameState] = useState<'ready' | 'waiting' | 'tap' | 'result'>('ready');
  const [reactionTime, setReactionTime] = useState(0);
  const [bestTime, setBestTime] = useState(999999);
  const [attempts, setAttempts] = useState(0);
  const [totalTime, setTotalTime] = useState(0);
  const startTimeRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      stopSpeaking();
    };
  }, []);

  const startGame = () => {
    setGameState('waiting');
    speakWord('Wait for the green light!');
    
    // Random delay between 2-5 seconds
    const delay = 2000 + Math.random() * 3000;
    
    timerRef.current = setTimeout(() => {
      setGameState('tap');
      startTimeRef.current = Date.now();
      
      // Pulse animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(scaleAnim, { toValue: 1.1, duration: 200, useNativeDriver: true }),
          Animated.timing(scaleAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
        ])
      ).start();
    }, delay);
  };

  const handleTap = () => {
    if (gameState === 'waiting') {
      // Too early!
      if (timerRef.current) clearTimeout(timerRef.current);
      setGameState('ready');
      speakWord('Too early! Wait for green!');
      return;
    }
    
    if (gameState === 'tap') {
      const time = Date.now() - startTimeRef.current;
      setReactionTime(time);
      setAttempts(attempts + 1);
      setTotalTime(totalTime + time);
      
      if (time < bestTime) {
        setBestTime(time);
        speakCelebration();
      } else {
        speakWord(`${time} milliseconds!`);
      }
      
      scaleAnim.stopAnimation();
      scaleAnim.setValue(1);
      setGameState('result');
    }
  };

  const getSpeedRating = (time: number) => {
    if (time < 300) return { emoji: '⚡', text: 'Lightning Fast!' };
    if (time < 400) return { emoji: '🚀', text: 'Super Quick!' };
    if (time < 500) return { emoji: '🏃', text: 'Fast!' };
    if (time < 700) return { emoji: '🐢', text: 'Good!' };
    return { emoji: '😴', text: 'Keep Practicing!' };
  };

  const getBackgroundColor = () => {
    switch (gameState) {
      case 'waiting': return '#FF6B6B';
      case 'tap': return '#6BCB77';
      default: return '#4D96FF';
    }
  };

  const rating = getSpeedRating(reactionTime);

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingLeft: insets.left, paddingRight: insets.right }]}>
      <ScreenHeader
        title="Reaction"
        icon={SCREEN_ICONS.lightning}
        onBack={() => { stopSpeaking(); navigation.goBack(); }}
        compact={isLandscape}
      />

      {/* Stats */}
      <View style={styles.statsRow}>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>Best</Text>
          <Text style={styles.statValue}>{bestTime < 999999 ? `${bestTime}ms` : '--'}</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>Avg</Text>
          <Text style={styles.statValue}>
            {attempts > 0 ? `${Math.round(totalTime / attempts)}ms` : '--'}
          </Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>Tries</Text>
          <Text style={styles.statValue}>{attempts}</Text>
        </View>
      </View>

      {/* Game Area */}
      <TouchableOpacity
        style={[styles.gameArea, { backgroundColor: getBackgroundColor() }]}
        onPress={gameState === 'ready' ? startGame : handleTap}
        activeOpacity={0.9}
      >
        {gameState === 'ready' && (
          <>
            <Text style={styles.readyEmoji}>👆</Text>
            <Text style={styles.readyText}>Tap to Start!</Text>
          </>
        )}
        
        {gameState === 'waiting' && (
          <>
            <Text style={styles.waitEmoji}>🔴</Text>
            <Text style={styles.waitText}>Wait...</Text>
            <Text style={styles.waitSubtext}>Don't tap yet!</Text>
          </>
        )}
        
        {gameState === 'tap' && (
          <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
            <Text style={styles.tapEmoji}>🟢</Text>
            <Text style={styles.tapText}>TAP NOW!</Text>
          </Animated.View>
        )}
        
        {gameState === 'result' && (
          <>
            <Text style={styles.resultEmoji}>{rating.emoji}</Text>
            <Text style={styles.resultTime}>{reactionTime} ms</Text>
            <Text style={styles.resultRating}>{rating.text}</Text>
            <Text style={styles.tapAgain}>Tap to try again!</Text>
          </>
        )}
      </TouchableOpacity>

      {/* Instructions */}
      <View style={styles.instructionBox}>
        <Text style={styles.instructionText}>
          🎯 Tap as fast as you can when the screen turns GREEN!
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F0F0FF' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  backButton: { padding: 8 },
  backText: { fontSize: 16, color: COLORS.blue, fontWeight: '600' },
  title: { fontSize: 22, fontWeight: 'bold', color: COLORS.purple },
  placeholder: { width: 50 },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 15,
    marginHorizontal: 20,
  },
  statBox: {
    backgroundColor: COLORS.white,
    paddingHorizontal: 25,
    paddingVertical: 12,
    borderRadius: 15,
    alignItems: 'center',
  },
  statLabel: { fontSize: 12, color: COLORS.gray },
  statValue: { fontSize: 18, fontWeight: 'bold', color: COLORS.purple, marginTop: 3 },
  gameArea: {
    flex: 1,
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  readyEmoji: { fontSize: 80 },
  readyText: { fontSize: 28, fontWeight: 'bold', color: COLORS.white, marginTop: 20 },
  waitEmoji: { fontSize: 80 },
  waitText: { fontSize: 32, fontWeight: 'bold', color: COLORS.white, marginTop: 20 },
  waitSubtext: { fontSize: 18, color: 'rgba(255,255,255,0.8)', marginTop: 10 },
  tapEmoji: { fontSize: 100, textAlign: 'center' },
  tapText: { fontSize: 36, fontWeight: '900', color: COLORS.white, marginTop: 20, textAlign: 'center' },
  resultEmoji: { fontSize: 80 },
  resultTime: { fontSize: 48, fontWeight: 'bold', color: COLORS.white, marginTop: 15 },
  resultRating: { fontSize: 24, color: COLORS.white, marginTop: 10 },
  tapAgain: { fontSize: 16, color: 'rgba(255,255,255,0.8)', marginTop: 30 },
  instructionBox: {
    backgroundColor: COLORS.yellow,
    marginHorizontal: 20,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 15,
    marginBottom: 20,
  },
  instructionText: { fontSize: 14, color: COLORS.black, textAlign: 'center' },
});

