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
import { speakWord, stopSpeaking } from '../utils/speech';
import { ScreenHeader } from '../components';
import { SCREEN_ICONS } from '../assets/images';

const { width, height } = Dimensions.get('window');

interface Note {
  id: number;
  lane: number;
  y: Animated.Value;
}

interface RhythmGameScreenProps {
  navigation: any;
}

export const RhythmGameScreen: React.FC<RhythmGameScreenProps> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [notes, setNotes] = useState<Note[]>([]);
  const noteIdRef = useRef(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const lanes = [
    { color: COLORS.red, sound: 'Clap!', emoji: '👏' },
    { color: COLORS.blue, sound: 'Tap!', emoji: '🥁' },
    { color: COLORS.green, sound: 'Ding!', emoji: '🔔' },
  ];

  const startGame = () => {
    setIsPlaying(true);
    setScore(0);
    setCombo(0);
    setNotes([]);
    speakWord('Tap when the circle reaches the line!');

    // Spawn notes
    intervalRef.current = setInterval(() => {
      const lane = Math.floor(Math.random() * 3);
      const newNote: Note = {
        id: noteIdRef.current++,
        lane,
        y: new Animated.Value(-50),
      };

      setNotes(prev => [...prev, newNote]);

      // Animate note falling
      Animated.timing(newNote.y, {
        toValue: height - 200,
        duration: 2000,
        useNativeDriver: true,
      }).start(() => {
        // Remove note after animation
        setNotes(prev => prev.filter(n => n.id !== newNote.id));
        // Miss penalty
        setCombo(0);
      });
    }, 1000);
  };

  const stopGame = () => {
    setIsPlaying(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    notes.forEach(note => note.y.stopAnimation());
    setNotes([]);
  };

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      stopSpeaking();
    };
  }, []);

  const handleLaneTap = (laneIndex: number) => {
    if (!isPlaying) return;

    // Find notes in this lane that are near the hit zone
    const hitNote = notes.find(note => {
      if (note.lane !== laneIndex) return false;
      
      // Check if note is in hit zone (near bottom)
      let noteY = 0;
      note.y.addListener(({ value }) => { noteY = value; });
      // Approximate check
      return true; // Simplified - in real game would check position
    });

    if (hitNote) {
      // Hit!
      hitNote.y.stopAnimation();
      setNotes(prev => prev.filter(n => n.id !== hitNote.id));
      setScore(score + 10 + combo * 2);
      setCombo(combo + 1);
      speakWord(lanes[laneIndex].sound);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScreenHeader
        title="Rhythm"
        icon={SCREEN_ICONS.notes}
        onBack={() => { stopGame(); stopSpeaking(); navigation.goBack(); }}
        rightElement={
          <View style={styles.scoreBox}>
            <Image source={SCREEN_ICONS.starGold} style={styles.scoreIcon} resizeMode="contain" />
            <Text style={styles.scoreText}>{score}</Text>
          </View>
        }
      />

      {/* Combo Display */}
      {combo > 0 && (
        <View style={styles.comboBox}>
          <Text style={styles.comboText}>🔥 {combo} Combo!</Text>
        </View>
      )}

      {/* Game Area */}
      <View style={styles.gameArea}>
        {/* Lanes */}
        <View style={styles.lanesContainer}>
          {lanes.map((lane, index) => (
            <View key={index} style={[styles.lane, { backgroundColor: lane.color + '20' }]}>
              {/* Notes in this lane */}
              {notes
                .filter(note => note.lane === index)
                .map(note => (
                  <Animated.View
                    key={note.id}
                    style={[
                      styles.note,
                      {
                        backgroundColor: lane.color,
                        transform: [{ translateY: note.y }],
                      },
                    ]}
                  />
                ))}
            </View>
          ))}
        </View>

        {/* Hit Line */}
        <View style={styles.hitLine} />

        {/* Tap Buttons */}
        <View style={styles.tapButtons}>
          {lanes.map((lane, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.tapButton, { backgroundColor: lane.color }]}
              onPress={() => handleLaneTap(index)}
              activeOpacity={0.7}
            >
              <Text style={styles.tapEmoji}>{lane.emoji}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Start/Stop Button */}
      <TouchableOpacity
        onPress={isPlaying ? stopGame : startGame}
        style={[styles.controlButton, { backgroundColor: isPlaying ? COLORS.red : COLORS.green }]}
      >
        <Text style={styles.controlText}>
          {isPlaying ? '⏹️ Stop' : '▶️ Start'}
        </Text>
      </TouchableOpacity>

      {/* Instructions */}
      <View style={styles.instructionBox}>
        <Text style={styles.instructionText}>
          🎵 Tap the buttons when circles reach the line!
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1a1a2e' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  backButton: { padding: 8 },
  backText: { fontSize: 16, color: COLORS.purple, fontWeight: '600' },
  title: { fontSize: 22, fontWeight: 'bold', color: COLORS.white },
  scoreBox: { backgroundColor: COLORS.yellow, paddingHorizontal: 15, paddingVertical: 8, borderRadius: 15, flexDirection: 'row', alignItems: 'center' },
  scoreIcon: { width: 20, height: 20, marginRight: 4, resizeMode: 'contain' },
  scoreText: { fontSize: 16, fontWeight: 'bold', color: COLORS.black },
  comboBox: {
    alignSelf: 'center',
    backgroundColor: COLORS.orange,
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 10,
  },
  comboText: { fontSize: 16, fontWeight: 'bold', color: COLORS.white },
  gameArea: {
    flex: 1,
    marginHorizontal: 20,
    position: 'relative',
  },
  lanesContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 10,
  },
  lane: {
    flex: 1,
    marginHorizontal: 5,
    borderRadius: 10,
    position: 'relative',
    overflow: 'hidden',
  },
  note: {
    position: 'absolute',
    width: 50,
    height: 50,
    borderRadius: 25,
    alignSelf: 'center',
  },
  hitLine: {
    position: 'absolute',
    bottom: 100,
    left: 0,
    right: 0,
    height: 5,
    backgroundColor: COLORS.white,
    opacity: 0.5,
  },
  tapButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 15,
  },
  tapButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 8,
  },
  tapEmoji: { fontSize: 35 },
  controlButton: {
    alignSelf: 'center',
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 25,
    marginVertical: 15,
  },
  controlText: { fontSize: 18, fontWeight: 'bold', color: COLORS.white },
  instructionBox: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginHorizontal: 20,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 15,
    marginBottom: 20,
  },
  instructionText: { fontSize: 14, color: COLORS.white, textAlign: 'center' },
});

