import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  PanResponder,
  Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, RAINBOW_COLORS } from '../constants/colors';
import { ALPHABETS } from '../constants/alphabets';
import { NUMBERS, SHAPES } from '../constants/gameData';
import { speakLetter, speakWord, speakCelebration, stopSpeaking } from '../utils/speech';
import { ScreenHeader } from '../components';
import { SCREEN_ICONS } from '../assets/images';
import { useResponsiveLayout } from '../utils/useResponsiveLayout';

const { width } = Dimensions.get('window');

type TracingMode = 'alphabet' | 'number' | 'shape';

interface TracingGameScreenProps {
  navigation: any;
}

export const TracingGameScreen: React.FC<TracingGameScreenProps> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { isLandscape } = useResponsiveLayout();
  const [mode, setMode] = useState<TracingMode>('alphabet');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [paths, setPaths] = useState<{ x: number; y: number }[][]>([]);
  const [currentPath, setCurrentPath] = useState<{ x: number; y: number }[]>([]);
  const [isTracing, setIsTracing] = useState(false);
  const [tracingProgress, setTracingProgress] = useState(0);

  const getCurrentItem = () => {
    switch (mode) {
      case 'alphabet':
        return { display: ALPHABETS[currentIndex].letter, name: ALPHABETS[currentIndex].letter };
      case 'number':
        return { display: NUMBERS[currentIndex].num.toString(), name: NUMBERS[currentIndex].word };
      case 'shape':
        return { display: SHAPES[currentIndex].emoji, name: SHAPES[currentIndex].name };
    }
  };

  const getMaxIndex = () => {
    switch (mode) {
      case 'alphabet': return ALPHABETS.length;
      case 'number': return NUMBERS.length;
      case 'shape': return SHAPES.length;
    }
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt) => {
        const { locationX, locationY } = evt.nativeEvent;
        setCurrentPath([{ x: locationX, y: locationY }]);
        setIsTracing(true);
      },
      onPanResponderMove: (evt) => {
        const { locationX, locationY } = evt.nativeEvent;
        setCurrentPath(prev => [...prev, { x: locationX, y: locationY }]);
        
        const newProgress = Math.min(100, tracingProgress + 0.5);
        setTracingProgress(newProgress);
      },
      onPanResponderRelease: () => {
        if (currentPath.length > 10) {
          setPaths(prev => [...prev, currentPath]);
        }
        setCurrentPath([]);
        setIsTracing(false);
        
        if (tracingProgress >= 80) {
          speakCelebration();
          setTimeout(() => {
            handleNext();
          }, 1000);
        }
      },
    })
  ).current;

  const handleNext = () => {
    setCurrentIndex((currentIndex + 1) % getMaxIndex());
    clearCanvas();
  };

  const handlePrev = () => {
    setCurrentIndex((currentIndex - 1 + getMaxIndex()) % getMaxIndex());
    clearCanvas();
  };

  const clearCanvas = () => {
    setPaths([]);
    setCurrentPath([]);
    setTracingProgress(0);
  };

  const speakItem = () => {
    const item = getCurrentItem();
    if (mode === 'alphabet') {
      speakLetter(item.name);
    } else {
      speakWord(item.name);
    }
  };

  const item = getCurrentItem();

  // Landscape layout
  if (isLandscape) {
    return (
      <View style={[styles.container, { paddingTop: insets.top, paddingLeft: insets.left, paddingRight: insets.right }]}>
        <ScreenHeader
          title="Tracing"
          icon={SCREEN_ICONS.pencil}
          onBack={() => { stopSpeaking(); navigation.goBack(); }}
          compact={true}
        />

        <View style={{ flex: 1, flexDirection: 'row', padding: 10, gap: 10 }}>
          {/* Left Panel - Controls */}
          <View style={{ width: 200, backgroundColor: '#fff', borderRadius: 20, padding: 15, justifyContent: 'space-between' }}>
            {/* Mode Selection */}
            <View style={{ gap: 8 }}>
              <Text style={{ fontSize: 12, fontWeight: '600', color: '#666', textAlign: 'center' }}>Mode:</Text>
              <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 8 }}>
                {(['alphabet', 'number', 'shape'] as TracingMode[]).map((m) => (
                  <TouchableOpacity
                    key={m}
                    style={{ padding: 10, borderRadius: 12, backgroundColor: mode === m ? COLORS.purple : '#E0E0E0' }}
                    onPress={() => { setMode(m); setCurrentIndex(0); clearCanvas(); }}
                  >
                    <Image 
                      source={m === 'alphabet' ? SCREEN_ICONS.abc : m === 'number' ? SCREEN_ICONS.numbers123 : SCREEN_ICONS.shapes} 
                      style={{ width: 24, height: 24, tintColor: mode === m ? '#fff' : '#666' }} 
                      resizeMode="contain" 
                    />
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Progress */}
            <View style={{ alignItems: 'center', marginVertical: 15 }}>
              <View style={{ width: 80, height: 80, borderRadius: 40, borderWidth: 6, borderColor: COLORS.purple, justifyContent: 'center', alignItems: 'center' }}>
                <Text style={{ fontSize: 22, fontWeight: '800', color: COLORS.purple }}>{Math.round(tracingProgress)}%</Text>
              </View>
            </View>

            {/* Navigation */}
            <View style={{ gap: 8 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 8 }}>
                <TouchableOpacity onPress={handlePrev} style={{ flex: 1, backgroundColor: '#E0E0E0', padding: 10, borderRadius: 12, alignItems: 'center' }}>
                  <Text style={{ fontSize: 16 }}>◀</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={clearCanvas} style={{ flex: 1, backgroundColor: '#FF6B6B', padding: 10, borderRadius: 12, alignItems: 'center' }}>
                  <Text style={{ color: '#fff', fontWeight: '700', fontSize: 12 }}>🧹 Clear</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleNext} style={{ flex: 1, backgroundColor: '#E0E0E0', padding: 10, borderRadius: 12, alignItems: 'center' }}>
                  <Text style={{ fontSize: 16 }}>▶</Text>
                </TouchableOpacity>
              </View>
              <View style={{ backgroundColor: COLORS.purple, padding: 8, borderRadius: 12, alignItems: 'center' }}>
                <Text style={{ color: '#fff', fontWeight: '700' }}>{currentIndex + 1} / {getMaxIndex()}</Text>
              </View>
            </View>
          </View>

          {/* Right Panel - Canvas */}
          <View style={{ flex: 1, backgroundColor: '#fff', borderRadius: 20, overflow: 'hidden' }}>
            <Text style={{ position: 'absolute', top: '50%', left: '50%', transform: [{ translateX: -60 }, { translateY: -80 }], fontSize: 150, fontWeight: '900', color: '#E8E8E8', zIndex: 0 }}>{item.display}</Text>
            
            <View style={{ flex: 1 }} {...panResponder.panHandlers}>
              <View style={StyleSheet.absoluteFill}>
                {paths.map((path, pathIndex) => (
                  <View key={pathIndex} style={StyleSheet.absoluteFill}>
                    {path.map((point, pointIndex) => (
                      <View
                        key={pointIndex}
                        style={{ position: 'absolute', width: 12, height: 12, borderRadius: 6, left: point.x - 6, top: point.y - 6, backgroundColor: RAINBOW_COLORS[pathIndex % RAINBOW_COLORS.length] }}
                      />
                    ))}
                  </View>
                ))}
                {currentPath.map((point, index) => (
                  <View
                    key={index}
                    style={{ position: 'absolute', width: 12, height: 12, borderRadius: 6, left: point.x - 6, top: point.y - 6, backgroundColor: COLORS.red }}
                  />
                ))}
              </View>
            </View>
            
            <TouchableOpacity onPress={speakItem} style={{ position: 'absolute', top: 10, right: 10, backgroundColor: '#FFD700', width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' }}>
              <Image source={SCREEN_ICONS.speaker} style={{ width: 22, height: 22 }} resizeMode="contain" />
            </TouchableOpacity>
            
            <View style={{ position: 'absolute', bottom: 10, left: 0, right: 0, alignItems: 'center' }}>
              <View style={{ backgroundColor: COLORS.purple, paddingHorizontal: 15, paddingVertical: 6, borderRadius: 12 }}>
                <Text style={{ color: '#fff', fontSize: 12, fontWeight: '600' }}>✏️ Trace with your finger!</Text>
              </View>
            </View>
          </View>
        </View>
      </View>
    );
  }

  // Portrait layout
  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingLeft: insets.left, paddingRight: insets.right }]}>
      {/* Header */}
      <ScreenHeader
        title="Tracing"
        icon={SCREEN_ICONS.pencil}
        onBack={() => { stopSpeaking(); navigation.goBack(); }}
        compact={isLandscape}
      />

      {/* Mode Selection */}
      <View style={styles.modeRow}>
        {(['alphabet', 'number', 'shape'] as TracingMode[]).map((m) => (
          <TouchableOpacity
            key={m}
            style={[styles.modeButton, mode === m && styles.modeButtonActive]}
            onPress={() => { setMode(m); setCurrentIndex(0); clearCanvas(); }}
          >
            <Image 
              source={m === 'alphabet' ? SCREEN_ICONS.abc : m === 'number' ? SCREEN_ICONS.numbers123 : SCREEN_ICONS.shapes} 
              style={[styles.modeIcon, mode === m && styles.modeIconActive]} 
              resizeMode="contain" 
            />
          </TouchableOpacity>
        ))}
      </View>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${tracingProgress}%` }]} />
        </View>
        <Text style={styles.progressText}>{Math.round(tracingProgress)}%</Text>
      </View>

      {/* Tracing Canvas */}
      <View style={styles.canvasContainer}>
        <Text style={styles.tracingGuide}>{item.display}</Text>
        
        <View style={styles.canvas} {...panResponder.panHandlers}>
          <View style={StyleSheet.absoluteFill}>
            {paths.map((path, pathIndex) => (
              <View key={pathIndex} style={StyleSheet.absoluteFill}>
                {path.map((point, pointIndex) => (
                  <View
                    key={pointIndex}
                    style={[
                      styles.pathPoint,
                      {
                        left: point.x - 8,
                        top: point.y - 8,
                        backgroundColor: RAINBOW_COLORS[pathIndex % RAINBOW_COLORS.length],
                      },
                    ]}
                  />
                ))}
              </View>
            ))}
            {currentPath.map((point, index) => (
              <View
                key={index}
                style={[
                  styles.pathPoint,
                  {
                    left: point.x - 8,
                    top: point.y - 8,
                    backgroundColor: COLORS.red,
                  },
                ]}
              />
            ))}
          </View>
        </View>
        
        <TouchableOpacity onPress={speakItem} style={styles.soundButton}>
          <Image source={SCREEN_ICONS.speaker} style={styles.soundIcon} resizeMode="contain" />
        </TouchableOpacity>
      </View>

      {/* Instructions */}
      <View style={styles.instructionBox}>
        <Image source={SCREEN_ICONS.pencil} style={styles.instructionIcon} resizeMode="contain" />
        <Text style={styles.instruction}>
          Trace the {mode === 'alphabet' ? 'letter' : mode === 'number' ? 'number' : 'shape'} with your finger!
        </Text>
      </View>

      {/* Navigation */}
      <View style={styles.navRow}>
        <TouchableOpacity onPress={handlePrev} style={styles.navButton}>
          <Image source={SCREEN_ICONS.back} style={styles.navIcon} resizeMode="contain" />
          <Text style={styles.navText}>Prev</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={clearCanvas} style={styles.clearButton}>
          <Image source={SCREEN_ICONS.refresh} style={styles.navIcon} resizeMode="contain" />
          <Text style={styles.clearText}>Clear</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleNext} style={styles.navButton}>
          <Text style={styles.navText}>Next</Text>
          <Image source={SCREEN_ICONS.next} style={styles.navIcon} resizeMode="contain" />
        </TouchableOpacity>
      </View>

      {/* Item Counter */}
      <Text style={styles.counter}>{currentIndex + 1} / {getMaxIndex()}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF9E6' },
  modeRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 15,
    gap: 15,
  },
  modeButton: {
    paddingHorizontal: 25,
    paddingVertical: 12,
    borderRadius: 20,
    backgroundColor: '#E0E0E0',
  },
  modeButtonActive: { backgroundColor: COLORS.purple },
  modeIcon: { width: 28, height: 28, tintColor: COLORS.gray },
  modeIconActive: { tintColor: COLORS.white },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 15,
    gap: 10,
  },
  progressBar: {
    flex: 1,
    height: 12,
    backgroundColor: '#E0E0E0',
    borderRadius: 6,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.green,
    borderRadius: 6,
  },
  progressText: { fontSize: 14, fontWeight: 'bold', color: COLORS.gray, width: 40 },
  canvasContainer: {
    marginHorizontal: 20,
    height: 300,
    backgroundColor: COLORS.white,
    borderRadius: 25,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 5,
    position: 'relative',
  },
  tracingGuide: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    fontSize: 200,
    fontWeight: '900',
    color: '#E0E0E0',
    textAlign: 'center',
    lineHeight: 300,
  },
  canvas: {
    flex: 1,
    position: 'relative',
  },
  pathPoint: {
    position: 'absolute',
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  soundButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: COLORS.yellow,
    width: 45,
    height: 45,
    borderRadius: 23,
    justifyContent: 'center',
    alignItems: 'center',
  },
  soundIcon: { width: 24, height: 24 },
  instructionBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 15,
    gap: 8,
  },
  instructionIcon: { width: 20, height: 20, tintColor: COLORS.purple },
  instruction: {
    fontSize: 16,
    color: COLORS.purple,
    fontWeight: '500',
  },
  navRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 20,
    marginTop: 20,
  },
  navButton: {
    backgroundColor: COLORS.blue,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  navIcon: { width: 18, height: 18, tintColor: COLORS.white },
  navText: { fontSize: 14, fontWeight: 'bold', color: COLORS.white },
  clearButton: {
    backgroundColor: COLORS.orange,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  clearText: { fontSize: 14, fontWeight: 'bold', color: COLORS.white },
  counter: {
    fontSize: 14,
    color: COLORS.gray,
    textAlign: 'center',
    marginTop: 15,
  },
});
