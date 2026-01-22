import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ScrollView,
  Image,
  Animated,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '../constants/colors';
import { SORTING_DATA } from '../constants/gameData';
import { speakWord, speakCelebration, speakFeedback, stopSpeaking } from '../utils/speech';
import { ScreenHeader } from '../components';
import { SCREEN_ICONS } from '../assets/images';
import { useResponsiveLayout } from '../utils/useResponsiveLayout';

const { width, height } = Dimensions.get('window');

type SortingCategory = 'bigSmall' | 'fruitsAnimals' | 'hotCold';

interface SortingGameScreenProps {
  navigation: any;
}

export const SortingGameScreen: React.FC<SortingGameScreenProps> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [category, setCategory] = useState<SortingCategory>('bigSmall');
  const [currentItem, setCurrentItem] = useState<typeof SORTING_DATA.bigSmall[0] | null>(null);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [itemsLeft, setItemsLeft] = useState<typeof SORTING_DATA.bigSmall>([]);
  const [showCorrect, setShowCorrect] = useState(false);
  const [sortedItems, setSortedItems] = useState<{left: string[], right: string[]}>({left: [], right: []});
  
  const bounceAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleLeftAnim = useRef(new Animated.Value(1)).current;
  const scaleRightAnim = useRef(new Animated.Value(1)).current;
  const itemSlideAnim = useRef(new Animated.Value(0)).current;
  const streakAnim = useRef(new Animated.Value(0)).current;
  
  const { isLandscape, width: screenWidth } = useResponsiveLayout();

  const categoryConfig = {
    bigSmall: { 
      left: 'Big', 
      right: 'Small', 
      title: 'Big or Small?',
      leftColor: '#FF6B6B',
      rightColor: '#4D96FF',
      leftIcon: '🐘',
      rightIcon: '🐜',
      bgColor: '#FFF0F0',
    },
    fruitsAnimals: { 
      left: 'Fruits', 
      right: 'Animals', 
      title: 'Fruit or Animal?',
      leftColor: '#6BCB77',
      rightColor: '#FFA94D',
      leftIcon: '🍎',
      rightIcon: '🐕',
      bgColor: '#F0FFF4',
    },
    hotCold: { 
      left: 'Hot', 
      right: 'Cold', 
      title: 'Hot or Cold?',
      leftColor: '#FF8C42',
      rightColor: '#4ECDC4',
      leftIcon: '🔥',
      rightIcon: '❄️',
      bgColor: '#FFF8F0',
    },
  };

  const config = categoryConfig[category];
  const leftCategory = category === 'bigSmall' ? 'Big' : category === 'fruitsAnimals' ? 'Fruit' : 'Hot';
  const rightCategory = category === 'bigSmall' ? 'Small' : category === 'fruitsAnimals' ? 'Animal' : 'Cold';

  const initializeGame = useCallback(() => {
    const items = [...SORTING_DATA[category]];
    for (let i = items.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [items[i], items[j]] = [items[j], items[i]];
    }
    setItemsLeft(items);
    setCurrentItem(items[0]);
    setScore(0);
    setStreak(0);
    setShowCorrect(false);
    setSortedItems({left: [], right: []});
    speakWord(categoryConfig[category].title);
    
    fadeAnim.setValue(0);
    itemSlideAnim.setValue(0);
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.spring(itemSlideAnim, {
        toValue: 1,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  }, [category]);

  useEffect(() => {
    initializeGame();
    return () => stopSpeaking();
  }, [initializeGame]);

  const animateBin = (isLeft: boolean) => {
    const anim = isLeft ? scaleLeftAnim : scaleRightAnim;
    Animated.sequence([
      Animated.timing(anim, { toValue: 1.1, duration: 100, useNativeDriver: true }),
      Animated.spring(anim, { toValue: 1, friction: 3, useNativeDriver: true }),
    ]).start();
  };

  const handleSort = (selectedCategory: string) => {
    if (!currentItem || showCorrect) return;
    
    const isCorrect = currentItem.category === selectedCategory;
    const isLeft = selectedCategory === leftCategory;
    
    animateBin(isLeft);
    
    if (isCorrect) {
      const newStreak = streak + 1;
      const bonusPoints = newStreak >= 3 ? 5 : 0;
      setScore(score + 10 + bonusPoints);
      setStreak(newStreak);
      setShowCorrect(true);
      speakCelebration();
      
      // Add to sorted items
      setSortedItems(prev => ({
        ...prev,
        [isLeft ? 'left' : 'right']: [...prev[isLeft ? 'left' : 'right'], currentItem.item],
      }));
      
      // Streak animation
      if (newStreak >= 3) {
        streakAnim.setValue(0);
        Animated.sequence([
          Animated.timing(streakAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
          Animated.delay(800),
          Animated.timing(streakAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
        ]).start();
      }
      
      Animated.sequence([
        Animated.timing(bounceAnim, { toValue: 1.15, duration: 150, useNativeDriver: true }),
        Animated.spring(bounceAnim, { toValue: 1, friction: 3, useNativeDriver: true }),
      ]).start();
      
      const remaining = itemsLeft.slice(1);
      setItemsLeft(remaining);
      
      setTimeout(() => {
        setShowCorrect(false);
        if (remaining.length > 0) {
          setCurrentItem(remaining[0]);
          speakWord(remaining[0].name);
          fadeAnim.setValue(0);
          itemSlideAnim.setValue(0);
          Animated.parallel([
            Animated.timing(fadeAnim, {
              toValue: 1,
              duration: 300,
              useNativeDriver: true,
            }),
            Animated.spring(itemSlideAnim, {
              toValue: 1,
              friction: 8,
              useNativeDriver: true,
            }),
          ]).start();
        } else {
          setCurrentItem(null);
        }
      }, 700);
    } else {
      setStreak(0);
      speakFeedback(false);
    }
  };

  const totalItems = SORTING_DATA[category].length;
  const sortedCount = totalItems - itemsLeft.length;
  const progress = (sortedCount / totalItems) * 100;

  return (
    <View style={[styles.container, { backgroundColor: config.bgColor, paddingTop: insets.top, paddingLeft: insets.left, paddingRight: insets.right }]}>
      <ScreenHeader
        title="Sorting"
        icon={SCREEN_ICONS.box}
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
        {/* Category Selection */}
        <View style={styles.categorySection}>
          <View style={styles.categoryCards}>
            {(Object.keys(SORTING_DATA) as SortingCategory[]).map((cat) => {
              const catConfig = categoryConfig[cat];
              const isActive = category === cat;
              return (
                <TouchableOpacity
                  key={cat}
                  style={[
                    styles.categoryCard,
                    isActive && [styles.categoryCardActive, { borderColor: catConfig.leftColor }],
                  ]}
                  onPress={() => setCategory(cat)}
                  activeOpacity={0.8}
                >
                  <View style={[styles.categoryIconRow]}>
                    <View style={[styles.categoryIconBg, { backgroundColor: catConfig.leftColor + '20' }]}>
                      <Text style={styles.categoryIconEmoji}>{catConfig.leftIcon}</Text>
                    </View>
                    <Text style={styles.categoryVs}>vs</Text>
                    <View style={[styles.categoryIconBg, { backgroundColor: catConfig.rightColor + '20' }]}>
                      <Text style={styles.categoryIconEmoji}>{catConfig.rightIcon}</Text>
                    </View>
                  </View>
                  <Text style={[styles.categoryTitle, isActive && { color: catConfig.leftColor }]}>
                    {catConfig.title}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Progress Section */}
        <View style={styles.progressSection}>
          <View style={styles.progressInfo}>
            <View style={styles.progressLeft}>
              <Text style={styles.progressLabel}>Sorted</Text>
              <Text style={[styles.progressValue, { color: config.leftColor }]}>{sortedCount}/{totalItems}</Text>
            </View>
            {streak >= 3 && (
              <Animated.View style={[styles.streakBadge, { opacity: streakAnim, transform: [{ scale: streakAnim }] }]}>
                <Text style={styles.streakText}>🔥 {streak} Streak!</Text>
              </Animated.View>
            )}
            <View style={styles.progressRight}>
              <Text style={styles.progressLabel}>Left</Text>
              <Text style={[styles.progressValue, { color: config.rightColor }]}>{itemsLeft.length}</Text>
            </View>
          </View>
          <View style={styles.progressBarBg}>
            <Animated.View 
              style={[
                styles.progressBarFill, 
                { 
                  width: `${progress}%`,
                  backgroundColor: config.leftColor,
                }
              ]} 
            />
          </View>
        </View>

        {currentItem ? (
          <>
            {/* Main Game Area */}
            <View style={[styles.gameArea, isLandscape && styles.gameAreaLandscape]}>
              {/* Left Bin */}
              <Animated.View style={[
                styles.binContainer,
                { transform: [{ scale: scaleLeftAnim }] },
              ]}>
                <TouchableOpacity
                  onPress={() => handleSort(leftCategory)}
                  style={[styles.bin, { backgroundColor: config.leftColor }]}
                  activeOpacity={0.85}
                  disabled={showCorrect}
                >
                  <View style={styles.binHeader}>
                    <Text style={styles.binIcon}>{config.leftIcon}</Text>
                    <Text style={styles.binLabel}>{config.left}</Text>
                  </View>
                  <View style={styles.binContent}>
                    {sortedItems.left.length > 0 ? (
                      <View style={styles.sortedItemsRow}>
                        {sortedItems.left.slice(-3).map((item, idx) => (
                          <Text key={idx} style={styles.sortedItemEmoji}>{item}</Text>
                        ))}
                        {sortedItems.left.length > 3 && (
                          <Text style={styles.moreItems}>+{sortedItems.left.length - 3}</Text>
                        )}
                      </View>
                    ) : (
                      <Text style={styles.binPlaceholder}>Tap here!</Text>
                    )}
                  </View>
                  {showCorrect && currentItem?.category === leftCategory && (
                    <View style={styles.correctOverlay}>
                      <Text style={styles.correctCheck}>✓</Text>
                    </View>
                  )}
                </TouchableOpacity>
              </Animated.View>

              {/* Current Item */}
              <Animated.View style={[
                styles.itemCard,
                isLandscape && styles.itemCardLandscape,
                { 
                  opacity: fadeAnim, 
                  transform: [
                    { scale: bounceAnim },
                    { translateY: itemSlideAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [-20, 0],
                    })},
                  ] 
                }
              ]}>
                <View style={styles.itemBadge}>
                  <Text style={styles.itemBadgeText}>Sort this!</Text>
                </View>
                <View style={styles.itemEmojiContainer}>
                  <Text style={[styles.itemEmoji, isLandscape && styles.itemEmojiLandscape]}>
                    {currentItem.item}
                  </Text>
                </View>
                <Text style={[styles.itemName, isLandscape && styles.itemNameLandscape]}>
                  {currentItem.name}
                </Text>
                <TouchableOpacity 
                  style={styles.hearButton}
                  onPress={() => speakWord(currentItem.name)}
                >
                  <Text style={styles.hearEmoji}>🔊</Text>
                </TouchableOpacity>
              </Animated.View>

              {/* Right Bin */}
              <Animated.View style={[
                styles.binContainer,
                { transform: [{ scale: scaleRightAnim }] },
              ]}>
                <TouchableOpacity
                  onPress={() => handleSort(rightCategory)}
                  style={[styles.bin, { backgroundColor: config.rightColor }]}
                  activeOpacity={0.85}
                  disabled={showCorrect}
                >
                  <View style={styles.binHeader}>
                    <Text style={styles.binIcon}>{config.rightIcon}</Text>
                    <Text style={styles.binLabel}>{config.right}</Text>
                  </View>
                  <View style={styles.binContent}>
                    {sortedItems.right.length > 0 ? (
                      <View style={styles.sortedItemsRow}>
                        {sortedItems.right.slice(-3).map((item, idx) => (
                          <Text key={idx} style={styles.sortedItemEmoji}>{item}</Text>
                        ))}
                        {sortedItems.right.length > 3 && (
                          <Text style={styles.moreItems}>+{sortedItems.right.length - 3}</Text>
                        )}
                      </View>
                    ) : (
                      <Text style={styles.binPlaceholder}>Tap here!</Text>
                    )}
                  </View>
                  {showCorrect && currentItem?.category === rightCategory && (
                    <View style={styles.correctOverlay}>
                      <Text style={styles.correctCheck}>✓</Text>
                    </View>
                  )}
                </TouchableOpacity>
              </Animated.View>
            </View>

            {/* Instructions */}
            <View style={styles.instructionBox}>
              <Text style={styles.instructionText}>
                👆 Tap the correct bin to sort <Text style={styles.instructionHighlight}>{currentItem.name}</Text>
              </Text>
            </View>
          </>
        ) : (
          <View style={styles.completeSection}>
            <View style={styles.completeCard}>
              <View style={[styles.completeIconBg, { backgroundColor: config.leftColor }]}>
                <Text style={styles.completeEmoji}>🎉</Text>
              </View>
              
              <Text style={styles.completeTitle}>All Sorted!</Text>
              
              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{score}</Text>
                  <Text style={styles.statLabel}>Points</Text>
                </View>
                <View style={[styles.statDivider, { backgroundColor: config.leftColor }]} />
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{totalItems}</Text>
                  <Text style={styles.statLabel}>Items</Text>
                </View>
              </View>

              <View style={styles.sortedSummary}>
                <View style={styles.summaryColumn}>
                  <View style={[styles.summaryHeader, { backgroundColor: config.leftColor }]}>
                    <Text style={styles.summaryTitle}>{config.leftIcon} {config.left}</Text>
                  </View>
                  <View style={styles.summaryItems}>
                    {sortedItems.left.map((item, idx) => (
                      <Text key={idx} style={styles.summaryEmoji}>{item}</Text>
                    ))}
                  </View>
                </View>
                <View style={styles.summaryColumn}>
                  <View style={[styles.summaryHeader, { backgroundColor: config.rightColor }]}>
                    <Text style={styles.summaryTitle}>{config.rightIcon} {config.right}</Text>
                  </View>
                  <View style={styles.summaryItems}>
                    {sortedItems.right.map((item, idx) => (
                      <Text key={idx} style={styles.summaryEmoji}>{item}</Text>
                    ))}
                  </View>
                </View>
              </View>

              <TouchableOpacity 
                onPress={initializeGame} 
                style={[styles.playAgainButton, { backgroundColor: config.leftColor }]}
              >
                <Text style={styles.playAgainIcon}>🔄</Text>
                <Text style={styles.playAgainText}>Play Again</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1,
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
    gap: 6,
  },
  scoreIcon: { width: 18, height: 18 },
  scoreText: { fontSize: 16, fontWeight: 'bold' },
  
  // Category Selection
  categorySection: {
    paddingHorizontal: 16,
    marginTop: 8,
  },
  categoryCards: {
    flexDirection: 'row',
    gap: 10,
  },
  categoryCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  categoryCardActive: {
    borderWidth: 2,
  },
  categoryIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  categoryIconBg: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryIconEmoji: {
    fontSize: 18,
  },
  categoryVs: {
    fontSize: 10,
    color: COLORS.gray,
    fontWeight: '600',
  },
  categoryTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: COLORS.gray,
    textAlign: 'center',
  },
  
  // Progress Section
  progressSection: {
    marginHorizontal: 16,
    marginTop: 12,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  progressLeft: {
    alignItems: 'flex-start',
  },
  progressRight: {
    alignItems: 'flex-end',
  },
  progressLabel: {
    fontSize: 11,
    color: COLORS.gray,
  },
  progressValue: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  streakBadge: {
    backgroundColor: '#FFF0E6',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
  },
  streakText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FF6B6B',
  },
  progressBarBg: {
    height: 8,
    backgroundColor: '#E8E8E8',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  
  // Game Area
  gameArea: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    marginTop: 16,
    gap: 8,
    alignItems: 'flex-start',
  },
  gameAreaLandscape: {
    gap: 12,
  },
  
  // Bins
  binContainer: {
    flex: 1,
  },
  bin: {
    borderRadius: 20,
    padding: 12,
    minHeight: 140,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  binHeader: {
    alignItems: 'center',
    marginBottom: 8,
  },
  binIcon: {
    fontSize: 32,
  },
  binLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.white,
    marginTop: 4,
  },
  binContent: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 12,
    padding: 8,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 50,
  },
  binPlaceholder: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '600',
  },
  sortedItemsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 4,
  },
  sortedItemEmoji: {
    fontSize: 20,
  },
  moreItems: {
    fontSize: 12,
    color: COLORS.white,
    fontWeight: 'bold',
  },
  correctOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(107, 203, 119, 0.9)',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  correctCheck: {
    fontSize: 48,
    color: COLORS.white,
  },
  
  // Item Card
  itemCard: {
    flex: 1.2,
    backgroundColor: COLORS.white,
    borderRadius: 24,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    marginHorizontal: 4,
  },
  itemCardLandscape: {
    flex: 1,
    padding: 12,
  },
  itemBadge: {
    backgroundColor: '#FFE5E5',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 10,
    marginBottom: 8,
  },
  itemBadgeText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#FF6B6B',
  },
  itemEmojiContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F8F8F8',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  itemEmoji: { 
    fontSize: 50,
  },
  itemEmojiLandscape: {
    fontSize: 40,
  },
  itemName: { 
    fontSize: 18, 
    fontWeight: 'bold', 
    color: COLORS.black,
    marginBottom: 8,
  },
  itemNameLandscape: {
    fontSize: 15,
  },
  hearButton: {
    backgroundColor: '#F0F0F0',
    padding: 8,
    borderRadius: 12,
  },
  hearEmoji: {
    fontSize: 16,
  },
  
  // Instructions
  instructionBox: {
    marginHorizontal: 16,
    marginTop: 14,
    backgroundColor: COLORS.white,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 14,
    alignItems: 'center',
  },
  instructionText: {
    fontSize: 14,
    color: COLORS.gray,
  },
  instructionHighlight: {
    fontWeight: 'bold',
    color: COLORS.purple,
  },
  
  // Complete Section
  completeSection: {
    paddingHorizontal: 16,
    marginTop: 16,
  },
  completeCard: {
    backgroundColor: COLORS.white,
    borderRadius: 28,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
  completeIconBg: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  completeEmoji: {
    fontSize: 40,
  },
  completeTitle: { 
    fontSize: 28, 
    fontWeight: 'bold', 
    color: COLORS.purple, 
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  statItem: {
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  statValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.orange,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.gray,
    marginTop: 2,
  },
  statDivider: {
    width: 2,
    height: 40,
    borderRadius: 1,
  },
  sortedSummary: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
    marginBottom: 20,
  },
  summaryColumn: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#F8F8F8',
  },
  summaryHeader: {
    paddingVertical: 10,
    alignItems: 'center',
  },
  summaryTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  summaryItems: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    padding: 10,
    gap: 6,
  },
  summaryEmoji: {
    fontSize: 24,
  },
  playAgainButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 25,
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  playAgainIcon: {
    fontSize: 18,
  },
  playAgainText: { 
    fontSize: 17, 
    fontWeight: 'bold', 
    color: COLORS.white,
  },
});
