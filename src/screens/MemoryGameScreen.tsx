import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, RAINBOW_COLORS } from '../constants/colors';
import { MEMORY_ITEMS } from '../constants/gameData';
import { speakWord, speakCelebration, stopSpeaking } from '../utils/speech';
import { switchBackgroundMusic } from '../utils/backgroundMusic';
import { ScreenHeader } from '../components';
import { SCREEN_ICONS } from '../assets/images';

const { width } = Dimensions.get('window');

interface Card {
  id: number;
  emoji: string;
  name: string;
  isFlipped: boolean;
  isMatched: boolean;
}

interface MemoryGameScreenProps {
  navigation: any;
}

export const MemoryGameScreen: React.FC<MemoryGameScreenProps> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [matches, setMatches] = useState(0);
  const [moves, setMoves] = useState(0);
  const [gameComplete, setGameComplete] = useState(false);
  const [level, setLevel] = useState<4 | 6 | 8>(4);

  const initializeGame = useCallback(() => {
    const selectedItems = MEMORY_ITEMS.slice(0, level);
    const gameCards: Card[] = [];
    
    selectedItems.forEach((item, index) => {
      gameCards.push({
        id: index * 2,
        emoji: item.emoji,
        name: item.name,
        isFlipped: false,
        isMatched: false,
      });
      gameCards.push({
        id: index * 2 + 1,
        emoji: item.emoji,
        name: item.name,
        isFlipped: false,
        isMatched: false,
      });
    });
    
    for (let i = gameCards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [gameCards[i], gameCards[j]] = [gameCards[j], gameCards[i]];
    }
    
    setCards(gameCards);
    setFlippedCards([]);
    setMatches(0);
    setMoves(0);
    setGameComplete(false);
  }, [level]);

  // Switch to game music
  useEffect(() => {
    switchBackgroundMusic('game');
    return () => switchBackgroundMusic('home');
  }, []);

  useEffect(() => {
    initializeGame();
    return () => stopSpeaking();
  }, [initializeGame]);

  const handleCardPress = (index: number) => {
    if (flippedCards.length === 2) return;
    if (cards[index].isFlipped || cards[index].isMatched) return;

    const newCards = [...cards];
    newCards[index].isFlipped = true;
    setCards(newCards);
    
    speakWord(cards[index].name);

    const newFlipped = [...flippedCards, index];
    setFlippedCards(newFlipped);

    if (newFlipped.length === 2) {
      setMoves(moves + 1);
      
      if (cards[newFlipped[0]].emoji === cards[newFlipped[1]].emoji) {
        setTimeout(() => {
          const matchedCards = [...cards];
          matchedCards[newFlipped[0]].isMatched = true;
          matchedCards[newFlipped[1]].isMatched = true;
          setCards(matchedCards);
          setFlippedCards([]);
          setMatches(matches + 1);
          speakCelebration();
          
          if (matches + 1 === level) {
            setGameComplete(true);
          }
        }, 500);
      } else {
        setTimeout(() => {
          const resetCards = [...cards];
          resetCards[newFlipped[0]].isFlipped = false;
          resetCards[newFlipped[1]].isFlipped = false;
          setCards(resetCards);
          setFlippedCards([]);
        }, 1000);
      }
    }
  };

  const columns = level <= 4 ? 2 : level <= 6 ? 3 : 4;
  const cardSize = (width - 40 - (columns - 1) * 10) / columns;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <ScreenHeader
        title="Memory"
        icon={SCREEN_ICONS.brain}
        onBack={() => { stopSpeaking(); navigation.goBack(); }}
      />

      {/* Level Selection */}
      <View style={styles.levelRow}>
        {[4, 6, 8].map((l) => (
          <TouchableOpacity
            key={l}
            style={[styles.levelButton, level === l && styles.levelButtonActive]}
            onPress={() => setLevel(l as 4 | 6 | 8)}
          >
            <Text style={[styles.levelText, level === l && styles.levelTextActive]}>
              {l} pairs
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Stats */}
      <View style={styles.statsRow}>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>Moves</Text>
          <Text style={styles.statValue}>{moves}</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>Matches</Text>
          <Text style={styles.statValue}>{matches}/{level}</Text>
        </View>
      </View>

      {/* Game Grid */}
      <View style={styles.gameGrid}>
        {cards.map((card, index) => (
          <TouchableOpacity
            key={card.id}
            onPress={() => handleCardPress(index)}
            style={[
              styles.card,
              {
                width: cardSize,
                height: cardSize,
                backgroundColor: card.isFlipped || card.isMatched
                  ? RAINBOW_COLORS[index % RAINBOW_COLORS.length]
                  : COLORS.purple,
              },
              card.isMatched && styles.matchedCard,
            ]}
            disabled={card.isMatched}
          >
            {card.isFlipped || card.isMatched ? (
              <Text style={styles.cardEmoji}>{card.emoji}</Text>
            ) : (
              <Image source={SCREEN_ICONS.question} style={styles.cardImage} resizeMode="contain" />
            )}
          </TouchableOpacity>
        ))}
      </View>

      {/* Restart Button */}
      <TouchableOpacity onPress={initializeGame} style={styles.restartButton}>
        <Image source={SCREEN_ICONS.refresh} style={styles.buttonIcon} resizeMode="contain" />
        <Text style={styles.restartText}>New Game</Text>
      </TouchableOpacity>

      {/* Game Complete Modal */}
      {gameComplete && (
        <View style={styles.completeOverlay}>
          <View style={styles.completeModal}>
            <Image source={SCREEN_ICONS.celebration} style={styles.completeImage} resizeMode="contain" />
            <Text style={styles.completeTitle}>Amazing!</Text>
            <Text style={styles.completeText}>You found all pairs in {moves} moves!</Text>
            <TouchableOpacity onPress={initializeGame} style={styles.playAgainButton}>
              <Image source={SCREEN_ICONS.play} style={styles.buttonIconWhite} resizeMode="contain" />
              <Text style={styles.playAgainText}>Play Again!</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#E6F7FF' },
  levelRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 15,
    gap: 10,
  },
  levelButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#E0E0E0',
  },
  levelButtonActive: { backgroundColor: COLORS.green },
  levelText: { fontSize: 14, fontWeight: '600', color: COLORS.gray },
  levelTextActive: { color: COLORS.white },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
    gap: 30,
  },
  statBox: { alignItems: 'center' },
  statLabel: { fontSize: 14, color: COLORS.gray },
  statValue: { fontSize: 24, fontWeight: 'bold', color: COLORS.purple },
  gameGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    paddingHorizontal: 15,
    gap: 10,
  },
  card: {
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 5,
  },
  matchedCard: { opacity: 0.6 },
  cardEmoji: { fontSize: 40 },
  cardImage: { width: 40, height: 40, tintColor: 'rgba(255,255,255,0.5)' },
  restartButton: {
    marginTop: 20,
    alignSelf: 'center',
    backgroundColor: COLORS.orange,
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  buttonIcon: { width: 22, height: 22, tintColor: COLORS.white },
  buttonIconWhite: { width: 20, height: 20, tintColor: COLORS.white },
  restartText: { fontSize: 16, fontWeight: 'bold', color: COLORS.white },
  completeOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  completeModal: {
    backgroundColor: COLORS.white,
    borderRadius: 30,
    padding: 40,
    alignItems: 'center',
  },
  completeImage: { width: 100, height: 100 },
  completeTitle: { fontSize: 32, fontWeight: 'bold', color: COLORS.purple, marginTop: 10 },
  completeText: { fontSize: 18, color: COLORS.gray, marginTop: 10, textAlign: 'center' },
  playAgainButton: {
    marginTop: 25,
    backgroundColor: COLORS.green,
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 25,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  playAgainText: { fontSize: 18, fontWeight: 'bold', color: COLORS.white },
});
