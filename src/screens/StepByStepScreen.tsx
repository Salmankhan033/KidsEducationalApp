import React, { useState, useEffect, useRef } from 'react';
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
import { STEP_TASKS } from '../constants/activityData';
import { speakWord, speakCelebration, speakFeedback, stopSpeaking } from '../utils/speech';
import { ScreenHeader } from '../components';
import { SCREEN_ICONS } from '../assets/images';
import { useResponsiveLayout } from '../utils/useResponsiveLayout';

const { width } = Dimensions.get('window');

interface StepByStepScreenProps {
  navigation: any;
}

export const StepByStepScreen: React.FC<StepByStepScreenProps> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { isLandscape } = useResponsiveLayout();
  const [currentTask, setCurrentTask] = useState(0);
  const [selectedSteps, setSelectedSteps] = useState<number[]>([]);
  const [shuffledSteps, setShuffledSteps] = useState<typeof STEP_TASKS[0]['steps']>([]);
  const [isComplete, setIsComplete] = useState(false);
  const celebrateAnim = useRef(new Animated.Value(0)).current;
  const bounceAnim = useRef(new Animated.Value(1)).current;

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
      const newSelected = [...selectedSteps, stepOrder];
      setSelectedSteps(newSelected);
      
      Animated.sequence([
        Animated.timing(bounceAnim, { toValue: 1.1, duration: 150, useNativeDriver: true }),
        Animated.timing(bounceAnim, { toValue: 1, duration: 150, useNativeDriver: true }),
      ]).start();
      
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

  const progress = Math.round((selectedSteps.length / task.steps.length) * 100);

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingLeft: insets.left, paddingRight: insets.right }]}>
      <ScreenHeader
        title="Steps"
        icon={SCREEN_ICONS.ladder}
        onBack={() => { stopSpeaking(); navigation.goBack(); }}
        compact={isLandscape}
      />

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
              <Text style={[styles.taskTabText, currentTask === index && styles.taskTabTextActive]}>
                {t.title.split(' ')[0]}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <Text style={styles.progressLabel}>Step {selectedSteps.length}/{task.steps.length}</Text>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>
      </View>

      {/* Main Content */}
      <View style={styles.mainContent}>
        {/* Left Panel - Task Info & Slots */}
        <View style={styles.leftPanel}>
          <View style={styles.taskHeader}>
            <Text style={styles.taskEmoji}>{task.emoji}</Text>
            <Text style={styles.taskTitle}>{task.title}</Text>
          </View>

          <Text style={styles.slotsTitle}>Steps in order:</Text>
          <Animated.View style={[styles.slotsGrid, { transform: [{ scale: bounceAnim }] }]}>
            {task.steps.map((_, index) => (
              <View key={index} style={[styles.slot, selectedSteps[index] && styles.slotFilled]}>
                {selectedSteps[index] ? (
                  <>
                    <Text style={styles.slotEmoji}>
                      {task.steps.find(s => s.order === selectedSteps[index])?.emoji}
                    </Text>
                    <Text style={styles.slotAction}>
                      {task.steps.find(s => s.order === selectedSteps[index])?.action}
                    </Text>
                  </>
                ) : (
                  <Text style={styles.slotPlaceholder}>{index + 1}</Text>
                )}
              </View>
            ))}
          </Animated.View>

          {/* Complete in left panel */}
          {isComplete && (
            <Animated.View style={[styles.completeBox, { opacity: celebrateAnim }]}>
              <Text style={styles.completeEmoji}>🎉</Text>
              <Text style={styles.completeText}>Great Job!</Text>
            </Animated.View>
          )}
        </View>

        {/* Right Panel - Available Steps */}
        <ScrollView 
          style={styles.rightPanel}
          contentContainerStyle={styles.rightPanelContent}
          showsVerticalScrollIndicator={false}
        >
          {!isComplete ? (
            <>
              <Text style={styles.stepsTitle}>Tap the next step:</Text>
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
            </>
          ) : (
            <View style={styles.completeActions}>
              <Text style={styles.completeTitle}>You know how to</Text>
              <Text style={styles.completeTask}>{task.title.toLowerCase()}!</Text>
              
              <TouchableOpacity onPress={initTask} style={styles.retryButton}>
                <Text style={styles.buttonText}>🔄 Try Again</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={nextTask} style={styles.nextButton}>
                <Text style={styles.buttonText}>➡️ Next Task</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5FFFA' },
  taskScroll: {
    maxHeight: 60,
    marginBottom: 8,
  },
  taskRow: {
    flexDirection: 'row',
    paddingHorizontal: 15,
    gap: 10,
  },
  taskTab: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 15,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  taskTabActive: {
    backgroundColor: COLORS.green,
  },
  taskTabEmoji: { fontSize: 18 },
  taskTabText: { fontSize: 11, fontWeight: '600', color: COLORS.gray },
  taskTabTextActive: { color: COLORS.white },
  
  progressContainer: {
    marginHorizontal: 15,
    marginBottom: 8,
  },
  progressLabel: { fontSize: 11, fontWeight: '600', color: COLORS.purple, marginBottom: 4 },
  progressBar: {
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 4,
  },

  mainContent: {
    flex: 1,
    flexDirection: 'row',
    paddingHorizontal: 10,
    gap: 10,
  },
  
  leftPanel: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: 18,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 4,
  },
  taskHeader: {
    alignItems: 'center',
    marginBottom: 12,
  },
  taskEmoji: { fontSize: 40 },
  taskTitle: { fontSize: 16, fontWeight: 'bold', color: COLORS.purple, marginTop: 6 },
  
  slotsTitle: { fontSize: 11, color: COLORS.gray, marginBottom: 8 },
  slotsGrid: {
    gap: 6,
  },
  slot: {
    backgroundColor: '#F5F5F5',
    borderRadius: 10,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#CCC',
    padding: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    minHeight: 44,
  },
  slotFilled: {
    backgroundColor: '#E8F5E9',
    borderColor: '#4CAF50',
    borderStyle: 'solid',
  },
  slotEmoji: { fontSize: 20 },
  slotAction: { fontSize: 11, color: COLORS.black, flex: 1 },
  slotPlaceholder: { fontSize: 16, color: '#CCC', fontWeight: 'bold' },
  
  completeBox: {
    marginTop: 12,
    backgroundColor: '#E8F5E9',
    padding: 10,
    borderRadius: 12,
    alignItems: 'center',
  },
  completeEmoji: { fontSize: 30 },
  completeText: { fontSize: 14, fontWeight: 'bold', color: '#2E7D32', marginTop: 4 },
  
  rightPanel: {
    flex: 1,
  },
  rightPanelContent: {
    paddingBottom: 15,
  },
  stepsTitle: { fontSize: 13, fontWeight: 'bold', color: COLORS.purple, marginBottom: 10 },
  stepButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
    gap: 10,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
  },
  stepUsed: { opacity: 0.3 },
  stepEmoji: { fontSize: 22 },
  stepText: { fontSize: 12, fontWeight: '600', color: COLORS.white, flex: 1 },
  
  completeActions: {
    alignItems: 'center',
    paddingTop: 20,
  },
  completeTitle: { fontSize: 14, color: COLORS.gray },
  completeTask: { fontSize: 16, fontWeight: 'bold', color: COLORS.green, marginBottom: 20 },
  retryButton: {
    backgroundColor: COLORS.orange,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 15,
    marginBottom: 10,
  },
  nextButton: {
    backgroundColor: COLORS.green,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 15,
  },
  buttonText: { fontSize: 13, fontWeight: 'bold', color: COLORS.white },
});
