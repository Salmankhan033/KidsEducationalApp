import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Animated,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, RAINBOW_COLORS } from '../constants/colors';
import { speakWord, stopSpeaking } from '../utils/speech';
import { ScreenHeader } from '../components';
import { SCREEN_ICONS } from '../assets/images';
import { useResponsiveLayout } from '../utils/useResponsiveLayout';

const { width, height } = Dimensions.get('window');

interface BodyPartsScreenProps {
  navigation: any;
}

const BODY_PARTS_DATA = [
  { id: 'head', name: 'Head', emoji: '🧠', description: 'You think with your head!', funFact: 'Your brain is inside your head!' },
  { id: 'eyes', name: 'Eyes', emoji: '👀', description: 'You see with your eyes!', funFact: 'Your eyes blink about 15-20 times per minute!' },
  { id: 'ears', name: 'Ears', emoji: '👂', description: 'You hear with your ears!', funFact: 'Your ears never stop working, even when you sleep!' },
  { id: 'nose', name: 'Nose', emoji: '👃', description: 'You smell with your nose!', funFact: 'Your nose can remember 50,000 different smells!' },
  { id: 'mouth', name: 'Mouth', emoji: '👄', description: 'You eat and talk with your mouth!', funFact: 'Your tongue has about 10,000 taste buds!' },
  { id: 'hands', name: 'Hands', emoji: '🖐️', description: 'You touch and hold with your hands!', funFact: 'You have 27 bones in each hand!' },
  { id: 'feet', name: 'Feet', emoji: '🦶', description: 'You walk and run with your feet!', funFact: 'Your feet have 26 bones each!' },
  { id: 'heart', name: 'Heart', emoji: '❤️', description: 'Your heart pumps blood!', funFact: 'Your heart beats about 100,000 times a day!' },
  { id: 'tummy', name: 'Tummy', emoji: '😊', description: 'Food goes to your tummy!', funFact: 'Your tummy makes funny noises when hungry!' },
  { id: 'legs', name: 'Legs', emoji: '🦵', description: 'You walk and jump with your legs!', funFact: 'Your legs have the biggest muscles in your body!' },
  { id: 'arms', name: 'Arms', emoji: '💪', description: 'You hug with your arms!', funFact: 'Your arm is as long as your leg at birth!' },
  { id: 'fingers', name: 'Fingers', emoji: '👆', description: 'You point and grab with your fingers!', funFact: 'You have 10 fingers - 5 on each hand!' },
];

export const BodyPartsScreen: React.FC<BodyPartsScreenProps> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { isLandscape } = useResponsiveLayout();
  const [selectedPart, setSelectedPart] = useState<typeof BODY_PARTS_DATA[0] | null>(null);
  const [learnedParts, setLearnedParts] = useState<string[]>([]);
  const bounceAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    return () => stopSpeaking();
  }, []);

  useEffect(() => {
    if (selectedPart) {
      Animated.sequence([
        Animated.timing(bounceAnim, { toValue: 1.2, duration: 200, useNativeDriver: true }),
        Animated.timing(bounceAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
      ]).start();
      
      Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }).start();
    }
  }, [selectedPart, bounceAnim, fadeAnim]);

  const handlePartPress = (part: typeof BODY_PARTS_DATA[0]) => {
    setSelectedPart(part);
    speakWord(`${part.name}. ${part.description}`);
    
    if (!learnedParts.includes(part.id)) {
      setLearnedParts([...learnedParts, part.id]);
    }
  };

  const handleFunFact = () => {
    if (selectedPart) {
      speakWord(selectedPart.funFact);
    }
  };

  const progress = Math.round((learnedParts.length / BODY_PARTS_DATA.length) * 100);

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingLeft: insets.left, paddingRight: insets.right }]}>
      <ScreenHeader
        title="Body Parts"
        icon={SCREEN_ICONS.smile}
        onBack={() => { stopSpeaking(); navigation.goBack(); }}
        compact={isLandscape}
      />

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <Text style={styles.progressLabel}>Learning Progress: {progress}%</Text>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>
        <Text style={styles.progressText}>{learnedParts.length} of {BODY_PARTS_DATA.length} learned! 🎉</Text>
      </View>

      {/* Main Content - Side by Side */}
      <View style={styles.mainContent}>
        {/* Left Side - Selected Part Display */}
        <ScrollView 
          style={styles.leftPanel}
          contentContainerStyle={styles.leftPanelContent}
          showsVerticalScrollIndicator={false}
        >
          {selectedPart ? (
            <Animated.View style={[styles.selectedContainer, { opacity: fadeAnim }]}>
              <Animated.Text style={[styles.selectedEmoji, { transform: [{ scale: bounceAnim }] }]}>
                {selectedPart.emoji}
              </Animated.Text>
              <Text style={styles.selectedName}>{selectedPart.name}</Text>
              <Text style={styles.selectedDescription}>{selectedPart.description}</Text>
              <TouchableOpacity style={styles.funFactButton} onPress={handleFunFact}>
                <Text style={styles.funFactButtonText}>🌟 Fun Fact!</Text>
              </TouchableOpacity>
              <View style={styles.funFactBox}>
                <Text style={styles.funFactTitle}>Did you know?</Text>
                <Text style={styles.funFactText}>{selectedPart.funFact}</Text>
              </View>
            </Animated.View>
          ) : (
            <View style={styles.placeholderContainer}>
              <Text style={styles.placeholderEmoji}>👆</Text>
              <Text style={styles.placeholderText}>Tap a body part to learn!</Text>
            </View>
          )}
        </ScrollView>

        {/* Right Side - Body Parts Grid */}
        <ScrollView 
          style={styles.rightPanel}
          contentContainerStyle={styles.rightPanelContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.partsGrid}>
            {BODY_PARTS_DATA.map((part, index) => {
              const isLearned = learnedParts.includes(part.id);
              const isSelected = selectedPart?.id === part.id;
              
              return (
                <TouchableOpacity
                  key={part.id}
                  style={[
                    styles.partCard,
                    { backgroundColor: RAINBOW_COLORS[index % RAINBOW_COLORS.length] },
                    isSelected && styles.partCardSelected,
                  ]}
                  onPress={() => handlePartPress(part)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.partEmoji}>{part.emoji}</Text>
                  <Text style={styles.partName}>{part.name}</Text>
                  {isLearned && (
                    <View style={styles.learnedBadge}>
                      <Text style={styles.learnedText}>✓</Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
          
          {/* Tip at bottom of right panel */}
          <View style={styles.tipBox}>
            <Text style={styles.tipText}>💡 Learn all parts to become an expert!</Text>
          </View>
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF0F5' },
  progressContainer: {
    marginHorizontal: 15,
    marginTop: 8,
    marginBottom: 8,
    padding: 10,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  progressLabel: { fontSize: 13, fontWeight: 'bold', color: COLORS.purple, marginBottom: 5 },
  progressBar: {
    width: '100%',
    height: 10,
    backgroundColor: '#E0E0E0',
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 5,
  },
  progressText: { fontSize: 11, color: COLORS.gray, marginTop: 4, textAlign: 'center' },
  
  // Main Content - Side by Side
  mainContent: {
    flex: 1,
    flexDirection: 'row',
    paddingHorizontal: 10,
    gap: 10,
  },
  
  // Left Panel - Selection Display
  leftPanel: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  leftPanelContent: {
    padding: 15,
    alignItems: 'center',
    minHeight: '100%',
  },
  
  // Selected Part
  selectedContainer: {
    alignItems: 'center',
    width: '100%',
  },
  selectedEmoji: { fontSize: 60 },
  selectedName: { 
    fontSize: 24, 
    fontWeight: 'bold', 
    color: COLORS.purple, 
    marginTop: 8,
    textAlign: 'center',
  },
  selectedDescription: { 
    fontSize: 14, 
    color: COLORS.gray, 
    marginTop: 5, 
    textAlign: 'center',
    lineHeight: 20,
  },
  funFactButton: {
    marginTop: 12,
    backgroundColor: COLORS.yellow,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
  },
  funFactButtonText: { fontSize: 13, fontWeight: 'bold', color: COLORS.black },
  funFactBox: {
    marginTop: 15,
    backgroundColor: '#E8F5E9',
    padding: 12,
    borderRadius: 12,
    width: '100%',
  },
  funFactTitle: { 
    fontSize: 12, 
    fontWeight: 'bold', 
    color: '#2E7D32',
    marginBottom: 4,
  },
  funFactText: { 
    fontSize: 12, 
    color: '#388E3C',
    lineHeight: 18,
  },
  
  // Placeholder when nothing selected
  placeholderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  placeholderEmoji: { fontSize: 50, marginBottom: 10 },
  placeholderText: { 
    fontSize: 14, 
    color: COLORS.gray, 
    textAlign: 'center',
    fontWeight: '600',
  },
  
  // Right Panel - Parts Grid
  rightPanel: {
    flex: 1.2,
  },
  rightPanelContent: {
    paddingBottom: 15,
  },
  partsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 8,
  },
  partCard: {
    width: '48%',
    paddingVertical: 12,
    borderRadius: 15,
    alignItems: 'center',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
    marginBottom: 2,
  },
  partCardSelected: {
    borderWidth: 3,
    borderColor: COLORS.white,
    transform: [{ scale: 1.02 }],
  },
  partEmoji: { fontSize: 28 },
  partName: { fontSize: 11, fontWeight: 'bold', color: COLORS.white, marginTop: 4 },
  learnedBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#4CAF50',
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
  },
  learnedText: { color: COLORS.white, fontWeight: 'bold', fontSize: 10 },
  tipBox: {
    backgroundColor: COLORS.yellow,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginTop: 10,
  },
  tipText: { fontSize: 11, color: COLORS.black, textAlign: 'center', fontWeight: '500' },
});
