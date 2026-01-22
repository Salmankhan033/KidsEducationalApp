import React, { useState, useRef } from 'react';
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
import { COLORS } from '../constants/colors';
import { PIANO_KEYS } from '../constants/gameData';
import { speakWord, stopSpeaking } from '../utils/speech';
import { ScreenHeader } from '../components';
import { SCREEN_ICONS } from '../assets/images';
import { useResponsiveLayout } from '../utils/useResponsiveLayout';

const { width, height } = Dimensions.get('window');

const NOTES_COLORS = [
  '#FF6B6B', // C - Red
  '#FF8E53', // D - Orange
  '#FFD93D', // E - Yellow
  '#6BCB77', // F - Green
  '#4D96FF', // G - Blue
  '#9B59B6', // H - Purple
  '#FF6B9D', // B - Pink
];

interface PianoGameScreenProps {
  navigation: any;
}

export const PianoGameScreen: React.FC<PianoGameScreenProps> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { isLandscape } = useResponsiveLayout();
  const [playedNotes, setPlayedNotes] = useState<string[]>([]);
  const [mode, setMode] = useState<'free' | 'learn'>('free');
  const [currentLearnIndex, setCurrentLearnIndex] = useState(0);
  const scaleAnims = useRef(PIANO_KEYS.map(() => new Animated.Value(1))).current;

  const playNote = (note: string, sound: string, index: number) => {
    // Animate key press
    Animated.sequence([
      Animated.timing(scaleAnims[index], {
        toValue: 0.95,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnims[index], {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    // Speak the note
    speakWord(sound);
    
    // Add to played notes
    setPlayedNotes([...playedNotes.slice(-7), note]);

    // In learn mode, check if correct
    if (mode === 'learn') {
      if (index === currentLearnIndex) {
        setCurrentLearnIndex((currentLearnIndex + 1) % PIANO_KEYS.length);
      }
    }
  };

  const clearNotes = () => {
    setPlayedNotes([]);
  };

  // Play a simple melody
  const playMelody = async () => {
    const melody = ['do', 're', 'mi', 'fa', 'sol'];
    for (let i = 0; i < melody.length; i++) {
      setTimeout(() => {
        speakWord(melody[i]);
        setPlayedNotes(prev => [...prev.slice(-7), PIANO_KEYS[i].note]);
        
        // Animate
        Animated.sequence([
          Animated.timing(scaleAnims[i], {
            toValue: 0.95,
            duration: 50,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnims[i], {
            toValue: 1,
            duration: 100,
            useNativeDriver: true,
          }),
        ]).start();
      }, i * 500);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingLeft: insets.left, paddingRight: insets.right }]}>
      {/* Header */}
      <ScreenHeader
        title="Piano"
        icon={SCREEN_ICONS.keyboard}
        onBack={() => { stopSpeaking(); navigation.goBack(); }}
        compact={isLandscape}
      />

      {/* Mode Toggle */}
      <View style={[styles.modeRow, isLandscape && { marginBottom: 8 }]}>
        <TouchableOpacity
          style={[styles.modeButton, isLandscape && { paddingHorizontal: 15, paddingVertical: 6 }, mode === 'free' && styles.modeActive]}
          onPress={() => setMode('free')}
        >
          <Text style={[styles.modeText, isLandscape && { fontSize: 12 }, mode === 'free' && styles.modeTextActive]}>🎵 Free Play</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.modeButton, isLandscape && { paddingHorizontal: 15, paddingVertical: 6 }, mode === 'learn' && styles.modeActive]}
          onPress={() => { setMode('learn'); setCurrentLearnIndex(0); }}
        >
          <Text style={[styles.modeText, isLandscape && { fontSize: 12 }, mode === 'learn' && styles.modeTextActive]}>📖 Learn</Text>
        </TouchableOpacity>
      </View>

      {/* Notes Display */}
      <View style={[styles.notesDisplay, isLandscape && { marginHorizontal: 30, paddingVertical: 8, paddingHorizontal: 15, marginBottom: 10, minHeight: 50 }]}>
        <Text style={[styles.notesLabel, isLandscape && { fontSize: 12, marginBottom: 5 }]}>
          {mode === 'learn' ? `Play: ${PIANO_KEYS[currentLearnIndex].sound.toUpperCase()}` : 'Notes Played:'}
        </Text>
        <View style={styles.notesRow}>
          {playedNotes.map((note, index) => (
            <View key={index} style={[styles.noteTag, isLandscape && { paddingHorizontal: 8, paddingVertical: 4 }, { backgroundColor: NOTES_COLORS[PIANO_KEYS.findIndex(k => k.note === note)] }]}>
              <Text style={[styles.noteText, isLandscape && { fontSize: 12 }]}>{note}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Piano Keys */}
      <View style={[styles.pianoContainer, isLandscape && { flex: 1, paddingHorizontal: 20, marginBottom: 10 }]}>
        <View style={styles.keysRow}>
          {PIANO_KEYS.map((key, index) => (
            <Animated.View
              key={key.note}
              style={[
                styles.keyContainer,
                isLandscape && { width: (width - 80) / 7 },
                { transform: [{ scale: scaleAnims[index] }] },
              ]}
            >
              <TouchableOpacity
                onPress={() => playNote(key.note, key.sound, index)}
                style={[
                  styles.pianoKey,
                  isLandscape && { height: 140 },
                  { backgroundColor: NOTES_COLORS[index] },
                  mode === 'learn' && index === currentLearnIndex && styles.highlightKey,
                ]}
              >
                <Text style={[styles.keyNote, isLandscape && { fontSize: 18 }]}>{key.note}</Text>
                <Text style={[styles.keySound, isLandscape && { fontSize: 10 }]}>{key.sound}</Text>
              </TouchableOpacity>
            </Animated.View>
          ))}
        </View>
      </View>

      {/* Action Buttons */}
      <View style={[styles.actionsRow, isLandscape && { marginBottom: 8, paddingBottom: insets.bottom }]}>
        <TouchableOpacity onPress={playMelody} style={[styles.melodyButton, isLandscape && { paddingHorizontal: 15, paddingVertical: 8 }]}>
          <Text style={[styles.actionText, isLandscape && { fontSize: 12 }]}>🎶 Play Do Re Mi</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={clearNotes} style={[styles.clearButton, isLandscape && { paddingHorizontal: 15, paddingVertical: 8 }]}>
          <Text style={[styles.actionText, isLandscape && { fontSize: 12 }]}>🗑️ Clear</Text>
        </TouchableOpacity>
      </View>

      {/* Instructions - Hidden in landscape */}
      {!isLandscape && (
        <View style={styles.instructionBox}>
          <Text style={styles.instructionText}>
            {mode === 'free' 
              ? '🎵 Tap the colorful keys to make music!' 
              : '📖 Follow the notes in order: Do, Re, Mi, Fa, Sol, La, Si'}
          </Text>
        </View>
      )}

      {/* Fun Characters - Hidden in landscape */}
      {!isLandscape && (
        <View style={styles.charactersRow}>
          <Text style={styles.character}>🎤</Text>
          <Text style={styles.character}>🎸</Text>
          <Text style={styles.character}>🥁</Text>
          <Text style={styles.character}>🎺</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F0FF' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  backButton: { padding: 8 },
  backText: { fontSize: 16, color: COLORS.purple, fontWeight: '600' },
  title: { fontSize: 24, fontWeight: 'bold', color: COLORS.purple },
  placeholder: { width: 60 },
  modeRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 15,
    gap: 15,
  },
  modeButton: {
    paddingHorizontal: 25,
    paddingVertical: 10,
    backgroundColor: '#E0E0E0',
    borderRadius: 20,
  },
  modeActive: { backgroundColor: COLORS.purple },
  modeText: { fontSize: 14, fontWeight: '600', color: COLORS.gray },
  modeTextActive: { color: COLORS.white },
  notesDisplay: {
    backgroundColor: COLORS.white,
    marginHorizontal: 20,
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginBottom: 20,
    minHeight: 80,
  },
  notesLabel: {
    fontSize: 14,
    color: COLORS.gray,
    marginBottom: 10,
  },
  notesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  noteTag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  noteText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  pianoContainer: {
    paddingHorizontal: 10,
    marginBottom: 20,
  },
  keysRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 5,
  },
  keyContainer: {
    width: (width - 60) / 7,
  },
  pianoKey: {
    height: 150,
    borderRadius: 10,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  highlightKey: {
    borderWidth: 4,
    borderColor: '#FFD700',
  },
  keyNote: {
    fontSize: 20,
    fontWeight: '900',
    color: COLORS.white,
  },
  keySound: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 15,
    marginBottom: 15,
  },
  melodyButton: {
    backgroundColor: COLORS.green,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
  },
  clearButton: {
    backgroundColor: COLORS.orange,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
  },
  actionText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  instructionBox: {
    backgroundColor: COLORS.purple,
    marginHorizontal: 20,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 15,
  },
  instructionText: {
    fontSize: 14,
    color: COLORS.white,
    textAlign: 'center',
  },
  charactersRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
    gap: 20,
  },
  character: {
    fontSize: 35,
  },
});


