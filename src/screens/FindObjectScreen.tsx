import React, { useState, useEffect, useCallback } from 'react';
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
import { FIND_OBJECT_SCENES } from '../constants/activityData';
import { speakWord, speakCelebration, stopSpeaking } from '../utils/speech';
import { ScreenHeader } from '../components';
import { SCREEN_ICONS } from '../assets/images';

const { width, height } = Dimensions.get('window');

interface FindObjectScreenProps {
  navigation: any;
}

export const FindObjectScreen: React.FC<FindObjectScreenProps> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [currentScene, setCurrentScene] = useState(0);
  const [targetObject, setTargetObject] = useState<string>('');
  const [foundObjects, setFoundObjects] = useState<string[]>([]);
  const [score, setScore] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const successAnim = useState(new Animated.Value(0))[0];

  const scene = FIND_OBJECT_SCENES[currentScene];

  const pickNewTarget = useCallback(() => {
    const available = scene.objects.filter(obj => !foundObjects.includes(obj.name));
    if (available.length > 0) {
      const target = available[Math.floor(Math.random() * available.length)];
      setTargetObject(target.name);
      speakWord(`Find the ${target.name}`);
    } else {
      // All found, next scene
      if (currentScene < FIND_OBJECT_SCENES.length - 1) {
        setCurrentScene(currentScene + 1);
        setFoundObjects([]);
      }
    }
  }, [scene.objects, foundObjects, currentScene]);

  useEffect(() => {
    pickNewTarget();
    return () => stopSpeaking();
  }, []);

  useEffect(() => {
    if (foundObjects.length > 0 && foundObjects.length < scene.objects.length) {
      pickNewTarget();
    }
  }, [foundObjects, scene.objects.length, pickNewTarget]);

  const handleObjectTap = (objectName: string) => {
    if (objectName === targetObject) {
      setScore(score + 10);
      setFoundObjects([...foundObjects, objectName]);
      speakCelebration();
      
      setShowSuccess(true);
      Animated.sequence([
        Animated.timing(successAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.delay(500),
        Animated.timing(successAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
      ]).start(() => setShowSuccess(false));
    } else {
      speakWord('Try again! Find the ' + targetObject);
    }
  };

  const resetGame = () => {
    setCurrentScene(0);
    setFoundObjects([]);
    setScore(0);
    pickNewTarget();
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScreenHeader
        title="Find It!"
        icon={SCREEN_ICONS.magnifier}
        onBack={() => { stopSpeaking(); navigation.goBack(); }}
        rightElement={
          <View style={styles.scoreBox}>
            <Image source={SCREEN_ICONS.starGold} style={styles.scoreIcon} resizeMode="contain" />
            <Text style={styles.scoreText}>{score}</Text>
          </View>
        }
      />

      <View style={styles.taskBox}>
        <Text style={styles.taskText}>Find the: <Text style={styles.targetText}>{targetObject}</Text></Text>
        <TouchableOpacity onPress={() => speakWord(`Find the ${targetObject}`)} style={styles.soundBtn}>
          <Text>🔊</Text>
        </TouchableOpacity>
      </View>

      <View style={[styles.sceneContainer, { backgroundColor: scene.background }]}>
        <Text style={styles.sceneName}>{scene.name}</Text>
        
        {scene.objects.map((obj, index) => (
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
            <Text style={styles.objectEmoji}>{obj.emoji}</Text>
          </TouchableOpacity>
        ))}

        {showSuccess && (
          <Animated.View style={[styles.successBadge, { opacity: successAnim, transform: [{ scale: successAnim }] }]}>
            <Text style={styles.successText}>🎉 Found!</Text>
          </Animated.View>
        )}
      </View>

      <View style={styles.progressRow}>
        <Text style={styles.progressText}>
          Found: {foundObjects.length} / {scene.objects.length}
        </Text>
        <Text style={styles.sceneText}>
          Scene: {currentScene + 1} / {FIND_OBJECT_SCENES.length}
        </Text>
      </View>

      <TouchableOpacity onPress={resetGame} style={styles.resetButton}>
        <Text style={styles.resetText}>🔄 New Game</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#E6F7FF' },
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
  scoreBox: { backgroundColor: COLORS.yellow, paddingHorizontal: 15, paddingVertical: 8, borderRadius: 15, flexDirection: 'row', alignItems: 'center', gap: 6 },
  scoreIcon: { width: 18, height: 18 },
  scoreText: { fontSize: 16, fontWeight: 'bold' },
  taskBox: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    marginHorizontal: 20,
    padding: 15,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  taskText: { fontSize: 18, color: COLORS.black },
  targetText: { fontWeight: 'bold', color: COLORS.red, fontSize: 20 },
  soundBtn: { marginLeft: 10, padding: 5 },
  sceneContainer: {
    flex: 1,
    marginHorizontal: 20,
    borderRadius: 20,
    position: 'relative',
    overflow: 'hidden',
  },
  sceneName: {
    position: 'absolute',
    top: 10,
    left: 10,
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.white,
    backgroundColor: 'rgba(0,0,0,0.3)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  objectButton: {
    position: 'absolute',
    padding: 5,
  },
  objectEmoji: { fontSize: 40 },
  successBadge: {
    position: 'absolute',
    top: '40%',
    alignSelf: 'center',
    backgroundColor: COLORS.green,
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
  },
  successText: { fontSize: 24, fontWeight: 'bold', color: COLORS.white },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 20,
    marginTop: 15,
  },
  progressText: { fontSize: 14, color: COLORS.gray },
  sceneText: { fontSize: 14, color: COLORS.gray },
  resetButton: {
    alignSelf: 'center',
    backgroundColor: COLORS.orange,
    paddingHorizontal: 25,
    paddingVertical: 12,
    borderRadius: 20,
    marginVertical: 15,
  },
  resetText: { fontSize: 16, fontWeight: 'bold', color: COLORS.white },
});


