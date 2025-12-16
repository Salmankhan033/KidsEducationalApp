import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Animated,
  Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, RAINBOW_COLORS } from '../constants/colors';
import { BUILD_ITEMS } from '../constants/activityData';
import { speakWord, speakCelebration, stopSpeaking } from '../utils/speech';
import { ScreenHeader } from '../components';
import { SCREEN_ICONS } from '../assets/images';

const { width } = Dimensions.get('window');

type BuildType = 'house' | 'car' | 'train' | 'robot';

interface BuildGameScreenProps {
  navigation: any;
}

export const BuildGameScreen: React.FC<BuildGameScreenProps> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [buildType, setBuildType] = useState<BuildType>('house');
  const [placedParts, setPlacedParts] = useState<string[]>([]);
  const [isComplete, setIsComplete] = useState(false);
  const celebrateAnim = useState(new Animated.Value(0))[0];

  const currentBuild = BUILD_ITEMS[buildType];

  const handlePartTap = (part: string) => {
    if (placedParts.includes(part)) return;
    
    const newParts = [...placedParts, part];
    setPlacedParts(newParts);
    speakWord('Nice!');

    if (newParts.length === currentBuild.parts.length) {
      setIsComplete(true);
      speakCelebration();
      Animated.spring(celebrateAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 50,
        friction: 7,
      }).start();
    }
  };

  const resetBuild = () => {
    setPlacedParts([]);
    setIsComplete(false);
    celebrateAnim.setValue(0);
  };

  const changeBuildType = (type: BuildType) => {
    setBuildType(type);
    resetBuild();
    speakWord(`Let's build a ${type}!`);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScreenHeader
        title="Build It!"
        icon={SCREEN_ICONS.blocks}
        onBack={() => { stopSpeaking(); navigation.goBack(); }}
      />

      {/* Build Type Selection */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.typeScroll}>
        <View style={styles.typeRow}>
          {(Object.keys(BUILD_ITEMS) as BuildType[]).map((type) => (
            <TouchableOpacity
              key={type}
              style={[styles.typeButton, buildType === type && styles.typeActive]}
              onPress={() => changeBuildType(type)}
            >
              <Text style={styles.typeEmoji}>{BUILD_ITEMS[type].emoji}</Text>
              <Text style={[styles.typeName, buildType === type && styles.typeNameActive]}>
                {BUILD_ITEMS[type].name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Build Area */}
      <View style={styles.buildArea}>
        <Text style={styles.buildDescription}>{currentBuild.description}</Text>
        
        <View style={styles.buildZone}>
          {isComplete ? (
            <Animated.View style={{ transform: [{ scale: celebrateAnim }] }}>
              <Text style={styles.completeEmoji}>{currentBuild.emoji}</Text>
              <Text style={styles.completeText}>🎉 Complete!</Text>
            </Animated.View>
          ) : (
            <View style={styles.partsDisplay}>
              {placedParts.map((part, index) => (
                <Text key={index} style={styles.placedPart}>{part}</Text>
              ))}
              {placedParts.length === 0 && (
                <Text style={styles.emptyText}>Tap parts below to build!</Text>
              )}
            </View>
          )}
        </View>

        {/* Progress */}
        <View style={styles.progressRow}>
          <Text style={styles.progressText}>
            Parts: {placedParts.length} / {currentBuild.parts.length}
          </Text>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { width: `${(placedParts.length / currentBuild.parts.length) * 100}%` }
              ]} 
            />
          </View>
        </View>
      </View>

      {/* Available Parts */}
      <View style={styles.partsContainer}>
        <Text style={styles.partsTitle}>🔧 Parts</Text>
        <View style={styles.partsGrid}>
          {currentBuild.parts.map((part, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.partButton,
                { backgroundColor: RAINBOW_COLORS[index] },
                placedParts.includes(part) && styles.partUsed,
              ]}
              onPress={() => handlePartTap(part)}
              disabled={placedParts.includes(part)}
            >
              <Text style={styles.partEmoji}>{part}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Reset Button */}
      <TouchableOpacity onPress={resetBuild} style={styles.resetButton}>
        <Text style={styles.resetText}>🔄 Start Over</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#E6F0FF' },
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
  typeScroll: { maxHeight: 80 },
  typeRow: { flexDirection: 'row', paddingHorizontal: 15, gap: 12 },
  typeButton: {
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 10,
    backgroundColor: '#E0E0E0',
    borderRadius: 15,
  },
  typeActive: { backgroundColor: COLORS.blue },
  typeEmoji: { fontSize: 30 },
  typeName: { fontSize: 12, color: COLORS.gray, marginTop: 3 },
  typeNameActive: { color: COLORS.white },
  buildArea: {
    backgroundColor: COLORS.white,
    marginHorizontal: 20,
    marginTop: 15,
    borderRadius: 25,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 5,
  },
  buildDescription: {
    fontSize: 16,
    color: COLORS.purple,
    fontWeight: '600',
    marginBottom: 15,
  },
  buildZone: {
    width: '100%',
    height: 150,
    backgroundColor: '#F5F5F5',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderStyle: 'dashed',
    borderColor: '#DDD',
  },
  partsDisplay: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
  },
  placedPart: { fontSize: 45 },
  emptyText: { fontSize: 14, color: COLORS.gray },
  completeEmoji: { fontSize: 80, textAlign: 'center' },
  completeText: { fontSize: 20, fontWeight: 'bold', color: COLORS.green, textAlign: 'center', marginTop: 10 },
  progressRow: { marginTop: 15, width: '100%' },
  progressText: { fontSize: 14, color: COLORS.gray, marginBottom: 5 },
  progressBar: {
    height: 10,
    backgroundColor: '#E0E0E0',
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.green,
    borderRadius: 5,
  },
  partsContainer: {
    marginHorizontal: 20,
    marginTop: 20,
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 15,
  },
  partsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.purple,
    marginBottom: 10,
  },
  partsGrid: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 15,
  },
  partButton: {
    width: 70,
    height: 70,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  partUsed: { opacity: 0.3 },
  partEmoji: { fontSize: 35 },
  resetButton: {
    alignSelf: 'center',
    backgroundColor: COLORS.orange,
    paddingHorizontal: 25,
    paddingVertical: 12,
    borderRadius: 20,
    marginTop: 20,
  },
  resetText: { fontSize: 16, fontWeight: 'bold', color: COLORS.white },
});


