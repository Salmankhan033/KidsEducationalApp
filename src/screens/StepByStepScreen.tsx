import React, { useState, useEffect } from 'react';
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
import { STEP_TASKS } from '../constants/activityData';
import { speakWord, speakCelebration, speakFeedback, stopSpeaking } from '../utils/speech';
import { ScreenHeader } from '../components';
import { SCREEN_ICONS } from '../assets/images';

const { width } = Dimensions.get('window');

interface StepByStepScreenProps {
  navigation: any;
}

export const StepByStepScreen: React.FC<StepByStepScreenProps> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [currentTask, setCurrentTask] = useState(0);
  const [selectedSteps, setSelectedSteps] = useState<number[]>([]);
  const [shuffledSteps, setShuffledSteps] = useState<typeof STEP_TASKS[0]['steps']>([]);
  const [isComplete, setIsComplete] = useState(false);
  const celebrateAnim = useState(new Animated.Value(0))[0];

  const task = STEP_TASKS[currentTask];

  useEffect(() => {
    initTask();
    return () => stopSpeaking();
  }, [currentTask]);

  const initTask = () => {
    const shuffled = [...task.steps].sort(() => Math.random() - 0.5);
    setShuffledSteps(shuffled);
    setSelectedSteps([]);
    setIsComplete(false);
    celebrateAnim.setValue(0);
    speakWord(`${task.title}! Put the steps in order.`);
  };

  const handleStepSelect = (stepOrder: number) => {
    const expectedOrder = selectedSteps.length + 1;
    
    if (stepOrder === expectedOrder) {
      // Correct!
      const newSelected = [...selectedSteps, stepOrder];
      setSelectedSteps(newSelected);
      speakWord(task.steps.find(s => s.order === stepOrder)?.action || '');

      if (newSelected.length === task.steps.length) {
        setIsComplete(true);
        speakCelebration();
        Animated.spring(celebrateAnim, {
          toValue: 1,
          useNativeDriver: true,
        }).start();
      }
    } else {
      speakFeedback(false);
    }
  };

  const nextTask = () => {
    setCurrentTask((currentTask + 1) % STEP_TASKS.length);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScreenHeader
        title="Steps"
        icon={SCREEN_ICONS.ladder}
        onBack={() => { stopSpeaking(); navigation.goBack(); }}
      />

      {/* Task Title */}
      <View style={styles.taskHeader}>
        <Text style={styles.taskEmoji}>{task.emoji}</Text>
        <Text style={styles.taskTitle}>{task.title}</Text>
      </View>

      {/* Progress Slots */}
      <View style={styles.slotsContainer}>
        <Text style={styles.slotsTitle}>Put steps in order:</Text>
        <View style={styles.slotsRow}>
          {task.steps.map((_, index) => (
            <View key={index} style={styles.slot}>
              {selectedSteps[index] ? (
                <>
                  <Text style={styles.slotEmoji}>
                    {task.steps.find(s => s.order === selectedSteps[index])?.emoji}
                  </Text>
                  <Text style={styles.slotNumber}>{index + 1}</Text>
                </>
              ) : (
                <Text style={styles.slotPlaceholder}>{index + 1}</Text>
              )}
            </View>
          ))}
        </View>
      </View>

      {/* Available Steps */}
      {!isComplete && (
        <View style={styles.stepsContainer}>
          <Text style={styles.stepsTitle}>Tap the next step:</Text>
          <ScrollView contentContainerStyle={styles.stepsGrid}>
            {shuffledSteps.map((step, index) => (
              <TouchableOpacity
                key={step.order}
                style={[
                  styles.stepButton,
                  { backgroundColor: RAINBOW_COLORS[index % RAINBOW_COLORS.length] },
                  selectedSteps.includes(step.order) && styles.stepUsed,
                ]}
                onPress={() => handleStepSelect(step.order)}
                disabled={selectedSteps.includes(step.order)}
              >
                <Text style={styles.stepEmoji}>{step.emoji}</Text>
                <Text style={styles.stepText}>{step.action}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Complete Screen */}
      {isComplete && (
        <Animated.View style={[styles.completeContainer, { opacity: celebrateAnim }]}>
          <Text style={styles.completeEmoji}>🎉✨</Text>
          <Text style={styles.completeTitle}>Great Job!</Text>
          <Text style={styles.completeText}>You know how to {task.title.toLowerCase()}!</Text>
          
          <View style={styles.completeButtons}>
            <TouchableOpacity onPress={initTask} style={styles.retryButton}>
              <Text style={styles.buttonText}>🔄 Retry</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={nextTask} style={styles.nextButton}>
              <Text style={styles.buttonText}>➡️ Next</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      )}

      {/* Task Selector */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.taskScroll}>
        <View style={styles.taskRow}>
          {STEP_TASKS.map((t, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.taskTab, currentTask === index && styles.taskTabActive]}
              onPress={() => setCurrentTask(index)}
            >
              <Text style={styles.taskTabEmoji}>{t.emoji}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5FFFA' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  backButton: { padding: 8 },
  backText: { fontSize: 16, color: COLORS.green, fontWeight: '600' },
  title: { fontSize: 22, fontWeight: 'bold', color: COLORS.purple },
  placeholder: { width: 50 },
  taskHeader: {
    alignItems: 'center',
    marginVertical: 15,
  },
  taskEmoji: { fontSize: 50 },
  taskTitle: { fontSize: 24, fontWeight: 'bold', color: COLORS.purple, marginTop: 10 },
  slotsContainer: {
    backgroundColor: COLORS.white,
    marginHorizontal: 20,
    padding: 15,
    borderRadius: 20,
    marginBottom: 15,
  },
  slotsTitle: { fontSize: 14, color: COLORS.gray, marginBottom: 10, textAlign: 'center' },
  slotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
  },
  slot: {
    width: 55,
    height: 70,
    backgroundColor: '#F0F0F0',
    borderRadius: 12,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#CCC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  slotEmoji: { fontSize: 28 },
  slotNumber: { fontSize: 10, color: COLORS.gray, marginTop: 2 },
  slotPlaceholder: { fontSize: 20, color: '#CCC', fontWeight: 'bold' },
  stepsContainer: {
    flex: 1,
    marginHorizontal: 20,
  },
  stepsTitle: { fontSize: 16, fontWeight: 'bold', color: COLORS.purple, marginBottom: 10 },
  stepsGrid: {
    gap: 10,
  },
  stepButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 15,
    gap: 15,
  },
  stepUsed: { opacity: 0.3 },
  stepEmoji: { fontSize: 30 },
  stepText: { fontSize: 16, fontWeight: '600', color: COLORS.white, flex: 1 },
  completeContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  completeEmoji: { fontSize: 60 },
  completeTitle: { fontSize: 28, fontWeight: 'bold', color: COLORS.green, marginTop: 15 },
  completeText: { fontSize: 16, color: COLORS.gray, marginTop: 10, textAlign: 'center' },
  completeButtons: {
    flexDirection: 'row',
    marginTop: 25,
    gap: 15,
  },
  retryButton: {
    backgroundColor: COLORS.orange,
    paddingHorizontal: 25,
    paddingVertical: 12,
    borderRadius: 20,
  },
  nextButton: {
    backgroundColor: COLORS.green,
    paddingHorizontal: 25,
    paddingVertical: 12,
    borderRadius: 20,
  },
  buttonText: { fontSize: 16, fontWeight: 'bold', color: COLORS.white },
  taskScroll: {
    maxHeight: 70,
    marginBottom: 15,
  },
  taskRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 10,
  },
  taskTab: {
    width: 50,
    height: 50,
    backgroundColor: '#E0E0E0',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  taskTabActive: {
    backgroundColor: COLORS.green,
  },
  taskTabEmoji: { fontSize: 24 },
});


