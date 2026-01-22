import React, { useState, useEffect } from 'react';
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
import { COLORS, RAINBOW_COLORS } from '../constants/colors';
import { DAILY_CHALLENGES, STICKER_COLLECTION } from '../constants/activityData';
import { speakWord, speakCelebration, stopSpeaking } from '../utils/speech';
import { ScreenHeader } from '../components';
import { SCREEN_ICONS } from '../assets/images';
import { useResponsiveLayout } from '../utils/useResponsiveLayout';

const { width } = Dimensions.get('window');

interface DailyChallengeScreenProps {
  navigation: any;
}

export const DailyChallengeScreen: React.FC<DailyChallengeScreenProps> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { isLandscape } = useResponsiveLayout();
  const [todayChallenge, setTodayChallenge] = useState(DAILY_CHALLENGES[0]);
  const [progress, setProgress] = useState(0);
  const [stickers, setStickers] = useState(STICKER_COLLECTION);
  const [unlockedCount, setUnlockedCount] = useState(0);
  const [showReward, setShowReward] = useState(false);
  const rewardAnim = useState(new Animated.Value(0))[0];
  const progressAnim = useState(new Animated.Value(0))[0];

  useEffect(() => {
    // Set daily challenge based on day
    const dayIndex = new Date().getDay();
    setTodayChallenge(DAILY_CHALLENGES[dayIndex % DAILY_CHALLENGES.length]);
    speakWord(`Today's challenge: ${DAILY_CHALLENGES[dayIndex % DAILY_CHALLENGES.length].task}`);
    
    return () => stopSpeaking();
  }, []);

  const incrementProgress = () => {
    if (progress >= todayChallenge.target) return;
    
    const newProgress = progress + 1;
    setProgress(newProgress);
    
    Animated.timing(progressAnim, {
      toValue: newProgress / todayChallenge.target,
      duration: 300,
      useNativeDriver: false,
    }).start();

    if (newProgress >= todayChallenge.target) {
      completeChallenge();
    }
  };

  const completeChallenge = () => {
    speakCelebration();
    setShowReward(true);
    
    // Unlock a random sticker
    const lockedStickers = stickers.filter(s => !s.unlocked);
    if (lockedStickers.length > 0) {
      const randomSticker = lockedStickers[Math.floor(Math.random() * lockedStickers.length)];
      setStickers(stickers.map(s => s.id === randomSticker.id ? { ...s, unlocked: true } : s));
      setUnlockedCount(unlockedCount + 1);
    }

    Animated.spring(rewardAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  const resetChallenge = () => {
    setProgress(0);
    setShowReward(false);
    progressAnim.setValue(0);
    rewardAnim.setValue(0);
  };

  const newChallenge = () => {
    const newIndex = Math.floor(Math.random() * DAILY_CHALLENGES.length);
    setTodayChallenge(DAILY_CHALLENGES[newIndex]);
    resetChallenge();
    speakWord(`New challenge: ${DAILY_CHALLENGES[newIndex].task}`);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingLeft: insets.left, paddingRight: insets.right }]}>
      <ScreenHeader
        title="Challenge"
        icon={SCREEN_ICONS.calendar}
        onBack={() => { stopSpeaking(); navigation.goBack(); }}
        compact={isLandscape}
        rightElement={
          <View style={[styles.stickerCount, isLandscape && { padding: 6 }]}>
            <Image source={SCREEN_ICONS.trophy} style={[styles.stickerIcon, isLandscape && { width: 18, height: 18 }]} resizeMode="contain" />
            <Text style={[styles.stickerText, isLandscape && { fontSize: 12 }]}>{unlockedCount}</Text>
          </View>
        }
      />

      <ScrollView 
        contentContainerStyle={[
          styles.scrollContent, 
          isLandscape && { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', paddingHorizontal: 10 }
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Today's Challenge */}
        <View style={[
          styles.challengeCard, 
          isLandscape && { width: '45%', marginHorizontal: 5, padding: 12 }
        ]}>
          <Text style={[styles.challengeLabel, isLandscape && { fontSize: 12 }]}>Today's Challenge</Text>
          <Text style={[styles.challengeEmoji, isLandscape && { fontSize: 32 }]}>{todayChallenge.emoji}</Text>
          <Text style={[styles.challengeTask, isLandscape && { fontSize: 14 }]}>{todayChallenge.task}</Text>
          
          {/* Progress Bar */}
          <View style={styles.progressContainer}>
            <Text style={[styles.progressLabel, isLandscape && { fontSize: 11 }]}>Progress: {progress} / {todayChallenge.target}</Text>
            <View style={[styles.progressBar, isLandscape && { height: 10 }]}>
              <Animated.View
                style={[
                  styles.progressFill,
                  {
                    width: progressAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0%', '100%'],
                    }),
                  },
                ]}
              />
            </View>
          </View>

          {/* Action Button */}
          {!showReward && (
            <TouchableOpacity onPress={incrementProgress} style={[styles.actionButton, isLandscape && { paddingVertical: 10 }]}>
              <Text style={[styles.actionText, isLandscape && { fontSize: 14 }]}>✓ Mark Progress</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Reward Modal */}
        {showReward && (
          <Animated.View style={[
            styles.rewardCard, 
            { transform: [{ scale: rewardAnim }] },
            isLandscape && { width: '45%', marginHorizontal: 5, padding: 12 }
          ]}>
            <Text style={[styles.rewardEmoji, isLandscape && { fontSize: 28 }]}>🎉🏆🌟</Text>
            <Text style={[styles.rewardTitle, isLandscape && { fontSize: 18 }]}>Challenge Complete!</Text>
            <Text style={[styles.rewardText, isLandscape && { fontSize: 12 }]}>You earned a sticker!</Text>
            
            <TouchableOpacity onPress={newChallenge} style={[styles.newChallengeButton, isLandscape && { paddingVertical: 10 }]}>
              <Text style={[styles.newChallengeText, isLandscape && { fontSize: 14 }]}>🎯 New Challenge</Text>
            </TouchableOpacity>
          </Animated.View>
        )}

        {/* Sticker Collection */}
        <View style={[
          styles.stickerSection, 
          isLandscape && { width: '45%', marginHorizontal: 5, padding: 10 }
        ]}>
          <Text style={[styles.stickerTitle, isLandscape && { fontSize: 14 }]}>🎖️ Sticker Collection</Text>
          <View style={styles.stickerGrid}>
            {stickers.map((sticker, index) => (
              <View
                key={sticker.id}
                style={[
                  styles.stickerSlot,
                  { backgroundColor: RAINBOW_COLORS[index % RAINBOW_COLORS.length] + '30' },
                  sticker.unlocked && styles.stickerUnlocked,
                  isLandscape && { width: 35, height: 35 },
                ]}
              >
                <Text style={[styles.stickerEmoji, !sticker.unlocked && styles.stickerLocked, isLandscape && { fontSize: 18 }]}>
                  {sticker.unlocked ? sticker.emoji : '❓'}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Tips */}
        <View style={[styles.tipBox, isLandscape && { width: '90%', marginHorizontal: 5, padding: 8 }]}>
          <Text style={[styles.tipText, isLandscape && { fontSize: 11 }]}>
            💡 Complete daily challenges to collect stickers!
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF5E6' },
  scrollContent: { paddingBottom: 20 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  backButton: { padding: 8 },
  backText: { fontSize: 16, color: COLORS.orange, fontWeight: '600' },
  title: { fontSize: 22, fontWeight: 'bold', color: COLORS.purple },
  stickerCount: {
    backgroundColor: COLORS.yellow,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  stickerIcon: { width: 18, height: 18 },
  stickerText: { fontSize: 14, fontWeight: 'bold' },
  challengeCard: {
    backgroundColor: COLORS.white,
    marginHorizontal: 20,
    padding: 25,
    borderRadius: 25,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 5,
  },
  challengeLabel: { fontSize: 14, color: COLORS.gray, marginBottom: 10 },
  challengeEmoji: { fontSize: 60 },
  challengeTask: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.purple,
    textAlign: 'center',
    marginTop: 15,
  },
  progressContainer: {
    width: '100%',
    marginTop: 20,
  },
  progressLabel: { fontSize: 14, color: COLORS.gray, marginBottom: 8 },
  progressBar: {
    height: 15,
    backgroundColor: '#E0E0E0',
    borderRadius: 8,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.green,
    borderRadius: 8,
  },
  actionButton: {
    marginTop: 20,
    backgroundColor: COLORS.green,
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
  },
  actionText: { fontSize: 18, fontWeight: 'bold', color: COLORS.white },
  rewardCard: {
    position: 'absolute',
    top: '30%',
    alignSelf: 'center',
    backgroundColor: COLORS.white,
    padding: 30,
    borderRadius: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 10,
    zIndex: 10,
  },
  rewardEmoji: { fontSize: 50 },
  rewardTitle: { fontSize: 24, fontWeight: 'bold', color: COLORS.purple, marginTop: 15 },
  rewardText: { fontSize: 16, color: COLORS.gray, marginTop: 10 },
  newChallengeButton: {
    marginTop: 20,
    backgroundColor: COLORS.orange,
    paddingHorizontal: 25,
    paddingVertical: 12,
    borderRadius: 20,
  },
  newChallengeText: { fontSize: 16, fontWeight: 'bold', color: COLORS.white },
  stickerSection: {
    marginHorizontal: 20,
    marginTop: 20,
  },
  stickerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.purple,
    marginBottom: 15,
  },
  stickerGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
  },
  stickerSlot: {
    width: 50,
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#DDD',
  },
  stickerUnlocked: {
    borderColor: COLORS.yellow,
    borderWidth: 3,
  },
  stickerEmoji: { fontSize: 28 },
  stickerLocked: { opacity: 0.3 },
  tipBox: {
    backgroundColor: COLORS.yellow,
    marginHorizontal: 20,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 15,
    marginTop: 20,
  },
  tipText: { fontSize: 13, color: COLORS.black, textAlign: 'center' },
});


