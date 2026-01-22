import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Animated,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '../constants/colors';
import { speakWord, stopSpeaking } from '../utils/speech';
import { ScreenHeader } from '../components';
import { SCREEN_ICONS } from '../assets/images';
import { useResponsiveLayout } from '../utils/useResponsiveLayout';

const { width, height } = Dimensions.get('window');

interface Note {
  id: number;
  lane: number;
  y: Animated.Value;
  currentY: number;
  hit: boolean;
  startTime: number;
}

type GameMode = 'easy' | 'medium' | 'hard';

interface RhythmGameScreenProps {
  navigation: any;
}

export const RhythmGameScreen: React.FC<RhythmGameScreenProps> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { isLandscape, height: screenHeight } = useResponsiveLayout();
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showMenu, setShowMenu] = useState(true);
  const [gameMode, setGameMode] = useState<GameMode>('easy');
  const [notes, setNotes] = useState<Note[]>([]);
  const [hitCount, setHitCount] = useState(0);
  const [missCount, setMissCount] = useState(0);
  const [showGameOver, setShowGameOver] = useState(false);
  const [gameTime, setGameTime] = useState(30);
  const [lastHitLane, setLastHitLane] = useState<number | null>(null);
  
  const noteIdRef = useRef(0);
  const notesRef = useRef<Note[]>([]);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const positionUpdateRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const comboAnim = useRef(new Animated.Value(1)).current;
  const flashAnims = useRef([new Animated.Value(0), new Animated.Value(0), new Animated.Value(0)]).current;
  const buttonScaleAnims = useRef([new Animated.Value(1), new Animated.Value(1), new Animated.Value(1)]).current;

  const lanes = [
    { color: '#FF6B6B', darkColor: '#CC5555', sound: 'Clap!', emoji: '👏', name: 'Clap' },
    { color: '#4D96FF', darkColor: '#3D78CC', sound: 'Drum!', emoji: '🥁', name: 'Drum' },
    { color: '#6BCB77', darkColor: '#55A260', sound: 'Bell!', emoji: '🔔', name: 'Bell' },
  ];

  const modeConfig = {
    easy: { speed: 3000, interval: 1500, label: 'Easy', emoji: '🌟', color: '#6BCB77' },
    medium: { speed: 2500, interval: 1100, label: 'Medium', emoji: '⚡', color: '#FFA94D' },
    hard: { speed: 2000, interval: 800, label: 'Hard', emoji: '🔥', color: '#FF6B6B' },
  };

  const config = modeConfig[gameMode];
  const gameAreaHeight = isLandscape ? screenHeight * 0.55 : height * 0.5;
  const hitZoneY = gameAreaHeight - 80; // Position the hit line higher up

  // Keep notesRef in sync
  useEffect(() => {
    notesRef.current = notes;
  }, [notes]);

  const startGame = useCallback(() => {
    setShowMenu(false);
    setIsPlaying(true);
    setScore(0);
    setCombo(0);
    setMaxCombo(0);
    setHitCount(0);
    setMissCount(0);
    setNotes([]);
    notesRef.current = [];
    setGameTime(30);
    setShowGameOver(false);
    noteIdRef.current = 0;
    speakWord('Get ready!');

    // Game timer
    timerRef.current = setInterval(() => {
      setGameTime(prev => {
        if (prev <= 1) {
          endGame();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Position update loop - track where each note is
    positionUpdateRef.current = setInterval(() => {
      const now = Date.now();
      notesRef.current.forEach(note => {
        if (!note.hit) {
          const elapsed = now - note.startTime;
          const progress = elapsed / config.speed;
          note.currentY = -60 + (hitZoneY + 150 + 60) * progress;
        }
      });
    }, 16);

    // Spawn notes after a short delay
    setTimeout(() => {
    intervalRef.current = setInterval(() => {
      const lane = Math.floor(Math.random() * 3);
      const newNote: Note = {
        id: noteIdRef.current++,
        lane,
          y: new Animated.Value(-60),
          currentY: -60,
          hit: false,
          startTime: Date.now(),
      };

      setNotes(prev => [...prev, newNote]);
        notesRef.current = [...notesRef.current, newNote];

        // Animate the note falling
      Animated.timing(newNote.y, {
          toValue: hitZoneY + 150,
          duration: config.speed,
        useNativeDriver: true,
      }).start(() => {
          // Note reached the bottom
          if (!newNote.hit) {
            setMissCount(m => m + 1);
            setCombo(0);
          }
        setNotes(prev => prev.filter(n => n.id !== newNote.id));
          notesRef.current = notesRef.current.filter(n => n.id !== newNote.id);
        });
      }, config.interval);
    }, 1500);
  }, [config.speed, config.interval, hitZoneY]);

  const endGame = useCallback(() => {
    setIsPlaying(false);
    setShowGameOver(true);
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (timerRef.current) clearInterval(timerRef.current);
    if (positionUpdateRef.current) clearInterval(positionUpdateRef.current);
    notesRef.current.forEach(note => note.y.stopAnimation());
    setNotes([]);
    notesRef.current = [];
  }, []);

  const stopGame = useCallback(() => {
    setIsPlaying(false);
    setShowMenu(true);
    setShowGameOver(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (timerRef.current) clearInterval(timerRef.current);
    if (positionUpdateRef.current) clearInterval(positionUpdateRef.current);
    notesRef.current.forEach(note => note.y.stopAnimation());
    setNotes([]);
    notesRef.current = [];
  }, []);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (timerRef.current) clearInterval(timerRef.current);
      if (positionUpdateRef.current) clearInterval(positionUpdateRef.current);
      stopSpeaking();
    };
  }, []);

  const handleLaneTap = useCallback((laneIndex: number) => {
    if (!isPlaying) return;

    // Button animation
    Animated.sequence([
      Animated.timing(buttonScaleAnims[laneIndex], { toValue: 0.85, duration: 50, useNativeDriver: true }),
      Animated.spring(buttonScaleAnims[laneIndex], { toValue: 1, friction: 3, useNativeDriver: true }),
    ]).start();

    // Flash effect
    flashAnims[laneIndex].setValue(1);
    Animated.timing(flashAnims[laneIndex], {
      toValue: 0,
      duration: 150,
      useNativeDriver: true,
    }).start();

    // Find notes in this lane that are in the hit zone
    const hitZoneMin = hitZoneY - 80;
    const hitZoneMax = hitZoneY + 80;
    
    const hitNote = notesRef.current.find(note => {
      if (note.lane !== laneIndex || note.hit) return false;
      return note.currentY >= hitZoneMin && note.currentY <= hitZoneMax;
    });

    if (hitNote) {
      // HIT!
      hitNote.hit = true;
      hitNote.y.stopAnimation();
      
      // Remove the note
      setNotes(prev => prev.filter(n => n.id !== hitNote.id));
      notesRef.current = notesRef.current.filter(n => n.id !== hitNote.id);
      
      // Update score
      setScore(prev => {
        const comboBonus = combo >= 5 ? 15 : combo >= 3 ? 10 : 0;
        return prev + 10 + comboBonus;
      });
      
      setCombo(prev => {
        const newCombo = prev + 1;
        setMaxCombo(max => Math.max(max, newCombo));
        return newCombo;
      });
      
      setHitCount(prev => prev + 1);
      setLastHitLane(laneIndex);
      
      // Combo animation
      if (combo >= 2) {
        Animated.sequence([
          Animated.timing(comboAnim, { toValue: 1.4, duration: 100, useNativeDriver: true }),
          Animated.spring(comboAnim, { toValue: 1, friction: 3, useNativeDriver: true }),
        ]).start();
      }

      speakWord(lanes[laneIndex].sound);
      
      // Clear hit indicator after a moment
      setTimeout(() => setLastHitLane(null), 200);
    }
  }, [isPlaying, combo, hitZoneY, lanes, buttonScaleAnims, flashAnims, comboAnim]);

  // Menu Screen
  if (showMenu) {
    return (
      <View style={[styles.container, { paddingTop: insets.top, paddingLeft: insets.left, paddingRight: insets.right }]}>
        <ScreenHeader
          title="Rhythm"
          icon={SCREEN_ICONS.notes}
          onBack={() => { stopSpeaking(); navigation.goBack(); }}
        />
        
        <ScrollView contentContainerStyle={styles.menuContent}>
          <View style={styles.menuHeader}>
            <Text style={styles.menuEmoji}>🎵🎶🎵</Text>
            <Text style={styles.menuTitle}>Rhythm Game</Text>
            <Text style={styles.menuSubtitle}>Tap to the beat!</Text>
          </View>

          <View style={styles.howToPlay}>
            <Text style={styles.howToPlayTitle}>🎮 How to Play</Text>
            <View style={styles.howToPlayItem}>
              <View style={styles.howToPlayBullet}><Text style={styles.bulletText}>1</Text></View>
              <Text style={styles.howToPlayText}>Notes fall down the colored lanes</Text>
            </View>
            <View style={styles.howToPlayItem}>
              <View style={styles.howToPlayBullet}><Text style={styles.bulletText}>2</Text></View>
              <Text style={styles.howToPlayText}>Tap the matching button when notes reach the white line</Text>
            </View>
            <View style={styles.howToPlayItem}>
              <View style={styles.howToPlayBullet}><Text style={styles.bulletText}>3</Text></View>
              <Text style={styles.howToPlayText}>Build combos for bonus points!</Text>
            </View>
          </View>

          <View style={styles.modeSection}>
            <Text style={styles.modeSectionTitle}>⚡ Select Difficulty</Text>
            <View style={styles.modeCards}>
              {(Object.keys(modeConfig) as GameMode[]).map((mode) => {
                const m = modeConfig[mode];
                const isSelected = gameMode === mode;
                return (
                  <TouchableOpacity
                    key={mode}
                    style={[
                      styles.modeCard,
                      isSelected && [styles.modeCardActive, { borderColor: m.color, backgroundColor: m.color + '20' }],
                    ]}
                    onPress={() => setGameMode(mode)}
                  >
                    <Text style={styles.modeCardEmoji}>{m.emoji}</Text>
                    <Text style={[styles.modeCardLabel, isSelected && { color: m.color }]}>
                      {m.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          <View style={styles.instrumentsPreview}>
            <Text style={styles.instrumentsTitle}>🎹 Instruments</Text>
            <View style={styles.instrumentsRow}>
              {lanes.map((lane, idx) => (
                <View key={idx} style={[styles.instrumentPreview, { backgroundColor: lane.color }]}>
                  <Text style={styles.instrumentEmoji}>{lane.emoji}</Text>
                  <Text style={styles.instrumentName}>{lane.name}</Text>
                </View>
              ))}
            </View>
          </View>

          <TouchableOpacity
            onPress={startGame}
            style={[styles.startButton, { backgroundColor: config.color }]}
          >
            <Text style={styles.startButtonEmoji}>▶️</Text>
            <Text style={styles.startButtonText}>Start Game</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    );
  }

  // Game Over Screen
  if (showGameOver) {
    const accuracy = hitCount + missCount > 0 ? Math.round((hitCount / (hitCount + missCount)) * 100) : 0;
    const stars = accuracy >= 90 ? 3 : accuracy >= 70 ? 2 : accuracy >= 50 ? 1 : 0;

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingLeft: insets.left, paddingRight: insets.right }]}>
      <ScreenHeader
        title="Rhythm"
        icon={SCREEN_ICONS.notes}
          onBack={() => { stopSpeaking(); navigation.goBack(); }}
        />
        
        <ScrollView contentContainerStyle={styles.gameOverContent}>
          <View style={styles.gameOverCard}>
            <Text style={styles.gameOverEmoji}>🎉</Text>
            <Text style={styles.gameOverTitle}>Time's Up!</Text>
            
            <View style={styles.starsRow}>
              {[1, 2, 3].map((s) => (
                <Text key={s} style={[styles.star, s <= stars && styles.starActive]}>⭐</Text>
              ))}
            </View>

            <View style={styles.statsGrid}>
              <View style={[styles.statBox, { backgroundColor: '#FFD93D20' }]}>
                <Text style={[styles.statValue, { color: '#FFD93D' }]}>{score}</Text>
                <Text style={styles.statLabel}>Score</Text>
              </View>
              <View style={[styles.statBox, { backgroundColor: '#FF6B6B20' }]}>
                <Text style={[styles.statValue, { color: '#FF6B6B' }]}>{maxCombo}x</Text>
                <Text style={styles.statLabel}>Max Combo</Text>
              </View>
              <View style={[styles.statBox, { backgroundColor: '#6BCB7720' }]}>
                <Text style={[styles.statValue, { color: '#6BCB77' }]}>{accuracy}%</Text>
                <Text style={styles.statLabel}>Accuracy</Text>
              </View>
            </View>

            <View style={styles.hitMissRow}>
              <View style={styles.hitMissItem}>
                <Text style={styles.hitEmoji}>✅</Text>
                <Text style={styles.hitMissValue}>{hitCount}</Text>
                <Text style={styles.hitMissLabel}>Hits</Text>
              </View>
              <View style={styles.hitMissItem}>
                <Text style={styles.missEmoji}>❌</Text>
                <Text style={styles.hitMissValue}>{missCount}</Text>
                <Text style={styles.hitMissLabel}>Misses</Text>
              </View>
            </View>

            <View style={styles.gameOverButtons}>
              <TouchableOpacity
                onPress={startGame}
                style={[styles.gameOverButton, { backgroundColor: config.color }]}
              >
                <Text style={styles.gameOverButtonEmoji}>🔄</Text>
                <Text style={styles.gameOverButtonText}>Play Again</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={stopGame}
                style={[styles.gameOverButton, styles.menuButton]}
              >
                <Text style={styles.gameOverButtonEmoji}>📋</Text>
                <Text style={styles.gameOverButtonText}>Menu</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </View>
    );
  }

  // Game Screen
  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingLeft: insets.left, paddingRight: insets.right }]}>
      {/* Header */}
      <View style={styles.gameHeader}>
        <TouchableOpacity onPress={stopGame} style={styles.backBtn}>
          <Text style={styles.backBtnText}>✕</Text>
        </TouchableOpacity>
        
        <View style={styles.timerBox}>
          <Text style={styles.timerEmoji}>⏱️</Text>
          <Text style={[styles.timerText, gameTime <= 10 && styles.timerLow]}>{gameTime}s</Text>
        </View>
        
        <View style={styles.scoreDisplay}>
          <Text style={styles.scoreLabel}>Score</Text>
          <Text style={styles.scoreValue}>{score}</Text>
        </View>
      </View>

      {/* Combo Display */}
      {combo >= 3 && (
        <Animated.View style={[styles.comboBox, { transform: [{ scale: comboAnim }] }]}>
          <Text style={styles.comboFire}>🔥</Text>
          <Text style={styles.comboText}>{combo}x Combo!</Text>
        </Animated.View>
      )}

      {/* Game Area */}
      <View style={[styles.gameArea, { height: gameAreaHeight }]}>
        {/* Lanes */}
        <View style={styles.lanesContainer}>
          {lanes.map((lane, index) => (
            <View key={index} style={styles.laneWrapper}>
              <View style={[styles.lane, { backgroundColor: lane.darkColor + '40' }]}>
                {/* Notes */}
              {notes
                .filter(note => note.lane === index)
                .map(note => (
                  <Animated.View
                    key={note.id}
                    style={[
                      styles.note,
                      {
                        backgroundColor: lane.color,
                          borderColor: lane.darkColor,
                        transform: [{ translateY: note.y }],
                        },
                      ]}
                    >
                      <Text style={styles.noteEmoji}>{lane.emoji}</Text>
                    </Animated.View>
                  ))}
              </View>
              
              {/* Tap Flash */}
              <Animated.View
                style={[
                  styles.tapFlash,
                  {
                    backgroundColor: lane.color,
                    opacity: flashAnims[index],
                      },
                    ]}
                  />
            </View>
          ))}
        </View>

        {/* Hit Line */}
        <View style={[styles.hitLine, { top: hitZoneY }]}>
          <View style={styles.hitLineInner} />
        </View>
      </View>

      {/* Hit Feedback */}
      {lastHitLane !== null && (
        <View style={styles.hitFeedback}>
          <Text style={styles.hitFeedbackText}>Perfect! 🎯</Text>
        </View>
      )}

        {/* Tap Buttons */}
        <View style={styles.tapButtons}>
          {lanes.map((lane, index) => (
          <Animated.View 
            key={index}
            style={{ transform: [{ scale: buttonScaleAnims[index] }] }}
          >
            <TouchableOpacity
              style={[
                styles.tapButton,
                { backgroundColor: lane.color, borderColor: lane.darkColor },
              ]}
              onPress={() => handleLaneTap(index)}
              activeOpacity={0.9}
            >
              <Text style={styles.tapEmoji}>{lane.emoji}</Text>
              <Text style={styles.tapLabel}>{lane.name}</Text>
            </TouchableOpacity>
          </Animated.View>
          ))}
      </View>

      {/* Instructions */}
      <View style={styles.instructionBar}>
        <Text style={styles.instructionText}>👆 Tap when notes reach the line!</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#0D1B2A' 
  },
  
  // Menu Styles
  menuContent: {
    padding: 20,
    alignItems: 'center',
  },
  menuHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  menuEmoji: {
    fontSize: 40,
    marginBottom: 12,
  },
  menuTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.white,
    marginBottom: 8,
  },
  menuSubtitle: {
    fontSize: 16,
    color: '#888',
  },
  howToPlay: {
    backgroundColor: '#1B2838',
    borderRadius: 20,
    padding: 20,
    width: '100%',
    marginBottom: 20,
  },
  howToPlayTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.white,
    marginBottom: 16,
  },
  howToPlayItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  howToPlayBullet: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#4D96FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bulletText: {
    color: COLORS.white,
    fontWeight: 'bold',
    fontSize: 14,
  },
  howToPlayText: {
    fontSize: 14,
    color: '#CCC',
    flex: 1,
  },
  modeSection: {
    width: '100%',
    marginBottom: 20,
  },
  modeSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.white,
    marginBottom: 12,
  },
  modeCards: {
    flexDirection: 'row',
    gap: 12,
  },
  modeCard: {
    flex: 1,
    backgroundColor: '#1B2838',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  modeCardActive: {
    borderWidth: 2,
  },
  modeCardEmoji: {
    fontSize: 28,
    marginBottom: 8,
  },
  modeCardLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#888',
  },
  instrumentsPreview: {
    width: '100%',
    marginBottom: 24,
  },
  instrumentsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.white,
    marginBottom: 12,
  },
  instrumentsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  instrumentPreview: {
    flex: 1,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
  },
  instrumentEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  instrumentName: {
    fontSize: 12,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingVertical: 16,
    borderRadius: 30,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  startButtonEmoji: {
    fontSize: 20,
  },
  startButtonText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  
  // Game Over Styles
  gameOverContent: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  gameOverCard: {
    backgroundColor: '#1B2838',
    borderRadius: 28,
    padding: 28,
    alignItems: 'center',
    width: '100%',
  },
  gameOverEmoji: {
    fontSize: 50,
    marginBottom: 12,
  },
  gameOverTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.white,
    marginBottom: 16,
  },
  starsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  star: {
    fontSize: 36,
    opacity: 0.3,
  },
  starActive: {
    opacity: 1,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
    width: '100%',
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 16,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 11,
    color: '#888',
    marginTop: 4,
  },
  hitMissRow: {
    flexDirection: 'row',
    gap: 40,
    marginBottom: 24,
  },
  hitMissItem: {
    alignItems: 'center',
  },
  hitEmoji: {
    fontSize: 24,
  },
  missEmoji: {
    fontSize: 24,
  },
  hitMissValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.white,
    marginTop: 4,
  },
  hitMissLabel: {
    fontSize: 12,
    color: '#888',
  },
  gameOverButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  gameOverButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 25,
    gap: 10,
  },
  menuButton: {
    backgroundColor: '#415A77',
  },
  gameOverButtonEmoji: {
    fontSize: 18,
  },
  gameOverButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  
  // Game Styles
  gameHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#1B2838',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backBtnText: {
    fontSize: 20,
    color: COLORS.white,
    fontWeight: 'bold',
  },
  timerBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1B2838',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 25,
    gap: 8,
  },
  timerEmoji: {
    fontSize: 18,
  },
  timerText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  timerLow: {
    color: '#FF6B6B',
  },
  scoreDisplay: {
    alignItems: 'center',
    backgroundColor: COLORS.yellow,
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  scoreLabel: {
    fontSize: 10,
    color: '#000',
    fontWeight: '600',
  },
  scoreValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#000',
  },
  comboBox: {
    position: 'absolute',
    top: 70,
    alignSelf: 'center',
    zIndex: 100,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 25,
    gap: 8,
    shadowColor: '#FF6B6B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 10,
  },
  comboFire: {
    fontSize: 20,
  },
  comboText: { 
    fontSize: 18, 
    fontWeight: 'bold', 
    color: COLORS.white 
  },
  gameArea: {
    marginHorizontal: 12,
    position: 'relative',
  },
  lanesContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 4,
  },
  laneWrapper: {
    flex: 1,
    marginHorizontal: 6,
    position: 'relative',
  },
  lane: {
    flex: 1,
    borderRadius: 16,
    position: 'relative',
    overflow: 'hidden',
  },
  note: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 8,
  },
  noteEmoji: {
    fontSize: 28,
  },
  tapFlash: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 16,
  },
  hitLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  hitLineInner: {
    width: '100%',
    height: 6,
    backgroundColor: '#FFF',
    borderRadius: 3,
    shadowColor: '#FFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 15,
    elevation: 10,
  },
  hitFeedback: {
    position: 'absolute',
    top: '40%',
    alignSelf: 'center',
    backgroundColor: '#6BCB77',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  hitFeedbackText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  tapButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  tapButton: {
    width: 95,
    height: 95,
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 12,
  },
  tapEmoji: { 
    fontSize: 38 
  },
  tapLabel: {
    fontSize: 11,
    fontWeight: 'bold',
    color: COLORS.white,
    marginTop: 2,
  },
  instructionBar: {
    backgroundColor: '#1B2838',
    paddingVertical: 12,
    alignItems: 'center',
    marginHorizontal: 12,
    borderRadius: 12,
    marginBottom: 8,
  },
  instructionText: {
    fontSize: 14,
    color: '#AAA',
  },
});
