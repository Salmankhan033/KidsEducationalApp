import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Animated,
  Image,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '../constants/colors';
import { FIND_OBJECT_SCENES } from '../constants/activityData';
import { speakWord, speakCelebration, stopSpeaking } from '../utils/speech';
import { ScreenHeader } from '../components';
import { SCREEN_ICONS } from '../assets/images';
import { useResponsiveLayout } from '../utils/useResponsiveLayout';

const { width, height } = Dimensions.get('window');

interface FindObjectScreenProps {
  navigation: any;
}

export const FindObjectScreen: React.FC<FindObjectScreenProps> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { isLandscape, width: screenWidth, height: screenHeight } = useResponsiveLayout();
  const [currentScene, setCurrentScene] = useState(0);
  const [targetObject, setTargetObject] = useState<string>('');
  const [foundObjects, setFoundObjects] = useState<string[]>([]);
  const [score, setScore] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const successAnim = useRef(new Animated.Value(0)).current;
  const bounceAnim = useRef(new Animated.Value(1)).current;
  const isInitialized = useRef(false);

  // Get current scene data directly from state
  const scene = FIND_OBJECT_SCENES[currentScene];

  // Pick a new target from the CURRENT scene's objects
  const pickNewTarget = (sceneIndex: number, alreadyFound: string[]) => {
    const currentSceneData = FIND_OBJECT_SCENES[sceneIndex];
    const available = currentSceneData.objects.filter(obj => !alreadyFound.includes(obj.name));
    
    if (available.length > 0) {
      const target = available[Math.floor(Math.random() * available.length)];
      setTargetObject(target.name);
      speakWord(`Find the ${target.name}`);
      
      // Bounce animation for new target
      Animated.sequence([
        Animated.timing(bounceAnim, { toValue: 1.1, duration: 150, useNativeDriver: true }),
        Animated.spring(bounceAnim, { toValue: 1, friction: 3, useNativeDriver: true }),
      ]).start();
      
      return true;
    }
    return false;
  };

  // Initialize game on mount
  useEffect(() => {
    if (!isInitialized.current) {
      isInitialized.current = true;
      pickNewTarget(0, []);
    }
    return () => stopSpeaking();
  }, []);

  // Handle scene changes - pick new target when scene changes
  useEffect(() => {
    if (isInitialized.current && foundObjects.length === 0) {
      // Scene changed and foundObjects was reset, pick new target for new scene
      pickNewTarget(currentScene, []);
    }
  }, [currentScene]);

  const handleObjectTap = (objectName: string) => {
    if (objectName === targetObject) {
      const newScore = score + 10;
      setScore(newScore);
      
      const newFoundObjects = [...foundObjects, objectName];
      setFoundObjects(newFoundObjects);
      
      speakCelebration();
      
      setShowSuccess(true);
      Animated.sequence([
        Animated.timing(successAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.delay(500),
        Animated.timing(successAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
      ]).start(() => {
        setShowSuccess(false);
        
        // Check if all objects in current scene are found
        if (newFoundObjects.length >= scene.objects.length) {
          // Move to next scene
          if (currentScene < FIND_OBJECT_SCENES.length - 1) {
            const nextScene = currentScene + 1;
            setCurrentScene(nextScene);
            setFoundObjects([]);
            // Pick target for next scene immediately
            setTimeout(() => pickNewTarget(nextScene, []), 100);
          }
        } else {
          // Pick next target in current scene
          pickNewTarget(currentScene, newFoundObjects);
        }
      });
    } else {
      speakWord('Try again! Find the ' + targetObject);
    }
  };

  const resetGame = () => {
    setCurrentScene(0);
    setFoundObjects([]);
    setScore(0);
    setTargetObject('');
    setTimeout(() => pickNewTarget(0, []), 100);
  };

  const sceneHeight = isLandscape ? screenHeight * 0.45 : height * 0.4;

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingLeft: insets.left, paddingRight: insets.right }]}>
      <ScreenHeader
        title="Find It!"
        icon={SCREEN_ICONS.magnifier}
        onBack={() => { stopSpeaking(); navigation.goBack(); }}
        compact={isLandscape}
        rightElement={
          <View style={styles.scoreBox}>
            <Image source={SCREEN_ICONS.starGold} style={styles.scoreIcon} resizeMode="contain" />
            <Text style={styles.scoreText}>{score}</Text>
          </View>
        }
      />

      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Task Box */}
        <Animated.View style={[styles.taskBox, { transform: [{ scale: bounceAnim }] }]}>
          <Text style={styles.taskLabel}>Find the:</Text>
          <View style={styles.targetBadge}>
            <Text style={styles.targetText}>{targetObject}</Text>
          </View>
          <TouchableOpacity 
            onPress={() => speakWord(`Find the ${targetObject}`)} 
            style={styles.soundBtn}
          >
            <Text style={styles.soundEmoji}>🔊</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Scene Container */}
        <View style={[styles.sceneWrapper, isLandscape && styles.sceneWrapperLandscape]}>
          <View style={[styles.sceneContainer, { backgroundColor: scene.background, height: sceneHeight }]}>
            <View style={styles.sceneHeader}>
              <Text style={styles.sceneName}>📍 {scene.name}</Text>
            </View>
            
            {scene.objects.map((obj) => (
              <TouchableOpacity
                key={obj.name}
                onPress={() => handleObjectTap(obj.name)}
                style={[
                  styles.objectButton,
                  {
                    left: `${obj.position.x}%`,
                    top: `${obj.position.y}%`,
                    opacity: foundObjects.includes(obj.name) ? 0.3 : 1,
                  },
                ]}
                disabled={foundObjects.includes(obj.name)}
              >
                <Text style={[styles.objectEmoji, isLandscape && styles.objectEmojiLandscape]}>
                  {obj.emoji}
                </Text>
                {foundObjects.includes(obj.name) && (
                  <View style={styles.foundBadge}>
                    <Text style={styles.foundCheck}>✓</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}

            {showSuccess && (
              <Animated.View style={[styles.successBadge, { opacity: successAnim, transform: [{ scale: successAnim }] }]}>
                <Text style={styles.successEmoji}>🎉</Text>
                <Text style={styles.successText}>Found!</Text>
              </Animated.View>
            )}
          </View>

          {/* Progress Panel */}
          <View style={[styles.progressPanel, isLandscape && styles.progressPanelLandscape]}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressTitle}>Progress</Text>
            </View>
            
            <View style={styles.progressStats}>
              <View style={styles.statBox}>
                <Text style={styles.statNumber}>{foundObjects.length}</Text>
                <Text style={styles.statLabel}>Found</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statBox}>
                <Text style={styles.statNumber}>{scene.objects.length}</Text>
                <Text style={styles.statLabel}>Total</Text>
              </View>
            </View>

            <View style={styles.progressBarContainer}>
              <View 
                style={[
                  styles.progressBarFill, 
                  { width: `${(foundObjects.length / scene.objects.length) * 100}%` }
                ]} 
              />
            </View>

            <View style={styles.sceneInfo}>
              <Text style={styles.sceneLabel}>Scene</Text>
              <View style={styles.sceneDots}>
                {FIND_OBJECT_SCENES.map((_, index) => (
                  <View 
                    key={index}
                    style={[
                      styles.sceneDot,
                      index === currentScene && styles.sceneDotActive,
                      index < currentScene && styles.sceneDotComplete,
                    ]}
                  />
                ))}
              </View>
            </View>

            {/* Found Items Preview */}
            {foundObjects.length > 0 && (
              <View style={styles.foundPreview}>
                <Text style={styles.foundPreviewLabel}>Found Items:</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View style={styles.foundItemsRow}>
                    {foundObjects.map((name) => {
                      const obj = scene.objects.find(o => o.name === name);
                      return (
                        <View key={name} style={styles.foundItem}>
                          <Text style={styles.foundItemEmoji}>{obj?.emoji}</Text>
                        </View>
                      );
                    })}
                  </View>
                </ScrollView>
              </View>
            )}
          </View>
        </View>

        {/* Action Button */}
        <TouchableOpacity onPress={resetGame} style={styles.resetButton}>
          <Text style={styles.resetIcon}>🔄</Text>
          <Text style={styles.resetText}>New Game</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#E6F7FF' 
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 30,
  },
  scoreBox: { 
    backgroundColor: COLORS.yellow, 
    paddingHorizontal: 15, 
    paddingVertical: 8, 
    borderRadius: 15, 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 6 
  },
  scoreIcon: { width: 18, height: 18 },
  scoreText: { fontSize: 16, fontWeight: 'bold' },
  taskBox: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    marginHorizontal: 16,
    marginTop: 8,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  taskLabel: {
    fontSize: 16,
    color: COLORS.gray,
    fontWeight: '500',
  },
  targetBadge: {
    backgroundColor: '#FFE5E5',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 12,
    marginLeft: 10,
  },
  targetText: { 
    fontWeight: 'bold', 
    color: COLORS.red, 
    fontSize: 18 
  },
  soundBtn: { 
    marginLeft: 'auto', 
    padding: 8,
    backgroundColor: '#E6F7FF',
    borderRadius: 12,
  },
  soundEmoji: {
    fontSize: 18,
  },
  sceneWrapper: {
    marginHorizontal: 16,
    marginTop: 12,
  },
  sceneWrapperLandscape: {
    flexDirection: 'row',
    gap: 12,
  },
  sceneContainer: {
    flex: 1,
    borderRadius: 24,
    position: 'relative',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 5,
  },
  sceneHeader: {
    position: 'absolute',
    top: 12,
    left: 12,
    zIndex: 10,
  },
  sceneName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.white,
    backgroundColor: 'rgba(0,0,0,0.4)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 12,
  },
  objectButton: {
    position: 'absolute',
    padding: 5,
  },
  objectEmoji: { 
    fontSize: 40 
  },
  objectEmojiLandscape: {
    fontSize: 32,
  },
  foundBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: COLORS.green,
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  foundCheck: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: 'bold',
  },
  successBadge: {
    position: 'absolute',
    top: '35%',
    alignSelf: 'center',
    backgroundColor: COLORS.green,
    paddingHorizontal: 30,
    paddingVertical: 16,
    borderRadius: 25,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  successEmoji: {
    fontSize: 24,
  },
  successText: { 
    fontSize: 22, 
    fontWeight: 'bold', 
    color: COLORS.white 
  },
  progressPanel: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 16,
    marginTop: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  progressPanelLandscape: {
    marginTop: 0,
    width: 160,
  },
  progressHeader: {
    marginBottom: 12,
  },
  progressTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.purple,
    textAlign: 'center',
  },
  progressStats: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
    marginBottom: 12,
  },
  statBox: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.blue,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.gray,
    marginTop: 2,
  },
  statDivider: {
    width: 2,
    height: 30,
    backgroundColor: '#E0E0E0',
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 12,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: COLORS.green,
    borderRadius: 4,
  },
  sceneInfo: {
    alignItems: 'center',
  },
  sceneLabel: {
    fontSize: 12,
    color: COLORS.gray,
    marginBottom: 6,
  },
  sceneDots: {
    flexDirection: 'row',
    gap: 6,
  },
  sceneDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#E0E0E0',
  },
  sceneDotActive: {
    backgroundColor: COLORS.blue,
    transform: [{ scale: 1.2 }],
  },
  sceneDotComplete: {
    backgroundColor: COLORS.green,
  },
  foundPreview: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  foundPreviewLabel: {
    fontSize: 11,
    color: COLORS.gray,
    marginBottom: 8,
  },
  foundItemsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  foundItem: {
    backgroundColor: '#E6FFE6',
    padding: 6,
    borderRadius: 10,
  },
  foundItemEmoji: {
    fontSize: 20,
  },
  resetButton: {
    alignSelf: 'center',
    backgroundColor: COLORS.orange,
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 25,
    marginTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    shadowColor: COLORS.orange,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  resetIcon: {
    fontSize: 18,
  },
  resetText: { 
    fontSize: 16, 
    fontWeight: 'bold', 
    color: COLORS.white 
  },
});
