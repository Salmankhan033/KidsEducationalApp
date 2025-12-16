import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ScrollView,
  Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '../constants/colors';
import { SORTING_DATA } from '../constants/gameData';
import { speakWord, speakCelebration, speakFeedback, stopSpeaking } from '../utils/speech';
import { ScreenHeader } from '../components';
import { SCREEN_ICONS } from '../assets/images';

const { width } = Dimensions.get('window');

type SortingCategory = 'bigSmall' | 'fruitsAnimals' | 'hotCold';

interface SortingGameScreenProps {
  navigation: any;
}

export const SortingGameScreen: React.FC<SortingGameScreenProps> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [category, setCategory] = useState<SortingCategory>('bigSmall');
  const [currentItem, setCurrentItem] = useState<typeof SORTING_DATA.bigSmall[0] | null>(null);
  const [score, setScore] = useState(0);
  const [itemsLeft, setItemsLeft] = useState<typeof SORTING_DATA.bigSmall>([]);

  const categoryLabels = {
    bigSmall: { left: 'Big', right: 'Small', title: 'Big or Small?' },
    fruitsAnimals: { left: 'Fruits', right: 'Animals', title: 'Fruit or Animal?' },
    hotCold: { left: 'Hot', right: 'Cold', title: 'Hot or Cold?' },
  };

  const initializeGame = useCallback(() => {
    const items = [...SORTING_DATA[category]];
    for (let i = items.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [items[i], items[j]] = [items[j], items[i]];
    }
    setItemsLeft(items);
    setCurrentItem(items[0]);
    setScore(0);
    speakWord(categoryLabels[category].title);
  }, [category]);

  useEffect(() => {
    initializeGame();
    return () => stopSpeaking();
  }, [initializeGame]);

  const handleSort = (selectedCategory: string) => {
    if (!currentItem) return;
    
    const isCorrect = currentItem.category === selectedCategory;
    
    if (isCorrect) {
      setScore(score + 10);
      speakCelebration();
      
      const remaining = itemsLeft.slice(1);
      setItemsLeft(remaining);
      
      if (remaining.length > 0) {
        setTimeout(() => {
          setCurrentItem(remaining[0]);
          speakWord(remaining[0].name);
        }, 500);
      } else {
        setCurrentItem(null);
      }
    } else {
      speakFeedback(false);
    }
  };

  const labels = categoryLabels[category];
  const leftCategory = category === 'bigSmall' ? 'Big' : category === 'fruitsAnimals' ? 'Fruit' : 'Hot';
  const rightCategory = category === 'bigSmall' ? 'Small' : category === 'fruitsAnimals' ? 'Animal' : 'Cold';

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <ScreenHeader
        title="Sorting"
        icon={SCREEN_ICONS.box}
        onBack={() => { stopSpeaking(); navigation.goBack(); }}
      />

      {/* Category Selection */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
        <View style={styles.categoryRow}>
          {(Object.keys(SORTING_DATA) as SortingCategory[]).map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[styles.categoryButton, category === cat && styles.categoryButtonActive]}
              onPress={() => setCategory(cat)}
            >
              <Text style={[styles.categoryText, category === cat && styles.categoryTextActive]}>
                {categoryLabels[cat].title}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Score */}
      <View style={styles.scoreBox}>
        <View style={styles.scoreLeft}>
          <Image source={SCREEN_ICONS.starGold} style={styles.scoreIcon} resizeMode="contain" />
          <Text style={styles.scoreText}>{score}</Text>
        </View>
        <Text style={styles.remainingText}>{itemsLeft.length} left</Text>
      </View>

      {currentItem ? (
        <>
          {/* Current Item */}
          <View style={styles.itemContainer}>
            <Text style={styles.itemEmoji}>{currentItem.item}</Text>
            <Text style={styles.itemName}>{currentItem.name}</Text>
          </View>

          {/* Sorting Bins */}
          <View style={styles.binsRow}>
            <TouchableOpacity
              onPress={() => handleSort(leftCategory)}
              style={[styles.bin, { backgroundColor: COLORS.red }]}
            >
              <Text style={styles.binText}>{labels.left}</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              onPress={() => handleSort(rightCategory)}
              style={[styles.bin, { backgroundColor: COLORS.blue }]}
            >
              <Text style={styles.binText}>{labels.right}</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.instructionRow}>
            <Image source={SCREEN_ICONS.pencil} style={styles.instructionIcon} resizeMode="contain" />
            <Text style={styles.instruction}>Tap the correct bin!</Text>
          </View>
        </>
      ) : (
        <View style={styles.completeContainer}>
          <Image source={SCREEN_ICONS.celebration} style={styles.completeImage} resizeMode="contain" />
          <Text style={styles.completeTitle}>All Sorted!</Text>
          <Text style={styles.completeScore}>Score: {score}</Text>
          <TouchableOpacity onPress={initializeGame} style={styles.playAgainButton}>
            <Image source={SCREEN_ICONS.play} style={styles.buttonIcon} resizeMode="contain" />
            <Text style={styles.playAgainText}>Play Again!</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF5E6' },
  categoryScroll: { maxHeight: 60 },
  categoryRow: {
    flexDirection: 'row',
    paddingHorizontal: 15,
    gap: 10,
  },
  categoryButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#E0E0E0',
    borderRadius: 20,
  },
  categoryButtonActive: { backgroundColor: COLORS.purple },
  categoryText: { fontSize: 14, fontWeight: '600', color: COLORS.gray },
  categoryTextActive: { color: COLORS.white },
  scoreBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 20,
    marginTop: 15,
    marginBottom: 10,
  },
  scoreLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  scoreIcon: { width: 24, height: 24 },
  scoreText: { fontSize: 20, fontWeight: 'bold', color: COLORS.orange },
  remainingText: { fontSize: 16, color: COLORS.gray },
  itemContainer: {
    alignItems: 'center',
    marginVertical: 30,
    backgroundColor: COLORS.white,
    marginHorizontal: 40,
    paddingVertical: 40,
    borderRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 5,
  },
  itemEmoji: { fontSize: 100 },
  itemName: { fontSize: 28, fontWeight: 'bold', color: COLORS.black, marginTop: 15 },
  binsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 20,
    marginTop: 20,
  },
  bin: {
    width: (width - 60) / 2,
    height: 120,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
  },
  binText: { fontSize: 22, fontWeight: 'bold', color: COLORS.white },
  instructionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 25,
    gap: 8,
  },
  instructionIcon: { width: 20, height: 20, tintColor: COLORS.purple },
  instruction: {
    fontSize: 16,
    color: COLORS.purple,
  },
  completeContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  completeImage: { width: 100, height: 100 },
  completeTitle: { fontSize: 32, fontWeight: 'bold', color: COLORS.purple, marginTop: 15 },
  completeScore: { fontSize: 24, color: COLORS.orange, marginTop: 10 },
  playAgainButton: {
    marginTop: 30,
    backgroundColor: COLORS.green,
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 25,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  buttonIcon: { width: 22, height: 22, tintColor: COLORS.white },
  playAgainText: { fontSize: 18, fontWeight: 'bold', color: COLORS.white },
});
