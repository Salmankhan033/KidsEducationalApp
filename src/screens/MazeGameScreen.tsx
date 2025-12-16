import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '../constants/colors';
import { speakWord, speakCelebration, stopSpeaking } from '../utils/speech';
import { ScreenHeader } from '../components';
import { SCREEN_ICONS } from '../assets/images';

const { width } = Dimensions.get('window');

interface Position {
  x: number;
  y: number;
}

interface MazeGameScreenProps {
  navigation: any;
}

const generateMaze = (size: number, level: number): boolean[][] => {
  const maze: boolean[][] = Array(size).fill(null).map(() => Array(size).fill(false));
  
  const wallCount = Math.floor(size * size * 0.2) + level * 2;
  let added = 0;
  
  while (added < wallCount) {
    const x = Math.floor(Math.random() * size);
    const y = Math.floor(Math.random() * size);
    
    if ((x === 0 && y === 0) || (x === size - 1 && y === size - 1)) continue;
    
    if (!maze[y][x]) {
      maze[y][x] = true;
      added++;
    }
  }
  
  return maze;
};

export const MazeGameScreen: React.FC<MazeGameScreenProps> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [level, setLevel] = useState(1);
  const [gridSize, setGridSize] = useState(5);
  const [maze, setMaze] = useState<boolean[][]>([]);
  const [playerPos, setPlayerPos] = useState<Position>({ x: 0, y: 0 });
  const [moves, setMoves] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  const initializeMaze = useCallback(() => {
    const size = 4 + level;
    setGridSize(size);
    setMaze(generateMaze(size, level));
    setPlayerPos({ x: 0, y: 0 });
    setMoves(0);
    setIsComplete(false);
    speakWord('Find your way to the star!');
  }, [level]);

  useEffect(() => {
    initializeMaze();
    return () => stopSpeaking();
  }, [initializeMaze]);

  const movePlayer = (direction: 'up' | 'down' | 'left' | 'right') => {
    if (isComplete) return;
    
    let newX = playerPos.x;
    let newY = playerPos.y;
    
    switch (direction) {
      case 'up': newY = Math.max(0, playerPos.y - 1); break;
      case 'down': newY = Math.min(gridSize - 1, playerPos.y + 1); break;
      case 'left': newX = Math.max(0, playerPos.x - 1); break;
      case 'right': newX = Math.min(gridSize - 1, playerPos.x + 1); break;
    }
    
    if (maze[newY] && maze[newY][newX]) {
      speakWord('Oops! Wall!');
      return;
    }
    
    setPlayerPos({ x: newX, y: newY });
    setMoves(moves + 1);
    
    if (newX === gridSize - 1 && newY === gridSize - 1) {
      setIsComplete(true);
      speakCelebration();
    }
  };

  const cellSize = Math.min((width - 80) / gridSize, 50);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <ScreenHeader
        title="Maze"
        icon={SCREEN_ICONS.mazeIcon}
        onBack={() => { stopSpeaking(); navigation.goBack(); }}
      />

      {/* Level & Stats */}
      <View style={styles.statsRow}>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>Level</Text>
          <Text style={styles.statValue}>{level}</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>Moves</Text>
          <Text style={styles.statValue}>{moves}</Text>
        </View>
      </View>

      {/* Instructions */}
      <View style={styles.instructionBox}>
        <Image source={SCREEN_ICONS.lion} style={styles.instructionIcon} resizeMode="contain" />
        <Text style={styles.instructionText}>
          Help the bunny reach the star!
        </Text>
        <Image source={SCREEN_ICONS.starGold} style={styles.instructionIcon} resizeMode="contain" />
      </View>

      {/* Maze Grid */}
      <View style={styles.mazeContainer}>
        {maze.map((row, y) => (
          <View key={y} style={styles.mazeRow}>
            {row.map((isWall, x) => {
              const isPlayer = playerPos.x === x && playerPos.y === y;
              const isEnd = x === gridSize - 1 && y === gridSize - 1;
              const isStart = x === 0 && y === 0;
              
              return (
                <View
                  key={x}
                  style={[
                    styles.cell,
                    { width: cellSize, height: cellSize },
                    isWall && styles.wallCell,
                    isStart && styles.startCell,
                    isEnd && styles.endCell,
                  ]}
                >
                  {isPlayer && <Text style={styles.playerEmoji}>🐰</Text>}
                  {isEnd && !isPlayer && (
                    <Image source={SCREEN_ICONS.starGold} style={styles.endIcon} resizeMode="contain" />
                  )}
                </View>
              );
            })}
          </View>
        ))}
      </View>

      {/* Controls */}
      <View style={styles.controls}>
        <View style={styles.controlRow}>
          <TouchableOpacity onPress={() => movePlayer('up')} style={styles.controlButton}>
            <Image source={SCREEN_ICONS.back} style={[styles.controlIcon, { transform: [{ rotate: '90deg' }] }]} resizeMode="contain" />
          </TouchableOpacity>
        </View>
        <View style={styles.controlRow}>
          <TouchableOpacity onPress={() => movePlayer('left')} style={styles.controlButton}>
            <Image source={SCREEN_ICONS.back} style={styles.controlIcon} resizeMode="contain" />
          </TouchableOpacity>
          <View style={styles.controlSpacer} />
          <TouchableOpacity onPress={() => movePlayer('right')} style={styles.controlButton}>
            <Image source={SCREEN_ICONS.next} style={styles.controlIcon} resizeMode="contain" />
          </TouchableOpacity>
        </View>
        <View style={styles.controlRow}>
          <TouchableOpacity onPress={() => movePlayer('down')} style={styles.controlButton}>
            <Image source={SCREEN_ICONS.back} style={[styles.controlIcon, { transform: [{ rotate: '-90deg' }] }]} resizeMode="contain" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Level Buttons */}
      <View style={styles.levelRow}>
        {[1, 2, 3, 4, 5].map((l) => (
          <TouchableOpacity
            key={l}
            style={[styles.levelButton, level === l && styles.levelButtonActive]}
            onPress={() => setLevel(l)}
          >
            <Text style={[styles.levelText, level === l && styles.levelTextActive]}>
              {l}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Complete Modal */}
      {isComplete && (
        <View style={styles.completeOverlay}>
          <View style={styles.completeModal}>
            <Image source={SCREEN_ICONS.celebration} style={styles.completeImage} resizeMode="contain" />
            <Text style={styles.completeTitle}>You Did It!</Text>
            <Text style={styles.completeText}>Completed in {moves} moves!</Text>
            <View style={styles.completeButtons}>
              <TouchableOpacity onPress={initializeMaze} style={styles.replayButton}>
                <Image source={SCREEN_ICONS.refresh} style={styles.buttonIcon} resizeMode="contain" />
                <Text style={styles.buttonText}>Replay</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={() => setLevel(Math.min(5, level + 1))} 
                style={styles.nextLevelButton}
              >
                <Image source={SCREEN_ICONS.next} style={styles.buttonIcon} resizeMode="contain" />
                <Text style={styles.buttonText}>Next Level</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#E6F7FF' },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 10,
    gap: 40,
  },
  statBox: { alignItems: 'center' },
  statLabel: { fontSize: 14, color: COLORS.gray },
  statValue: { fontSize: 24, fontWeight: 'bold', color: COLORS.purple },
  instructionBox: {
    flexDirection: 'row',
    backgroundColor: COLORS.yellow,
    marginHorizontal: 20,
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 15,
    marginBottom: 15,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  instructionIcon: { width: 24, height: 24 },
  instructionText: {
    fontSize: 14,
    color: COLORS.black,
    fontWeight: '500',
  },
  mazeContainer: {
    alignSelf: 'center',
    backgroundColor: '#DDD',
    borderRadius: 15,
    padding: 10,
  },
  mazeRow: { flexDirection: 'row' },
  cell: {
    backgroundColor: COLORS.white,
    borderRadius: 5,
    margin: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  wallCell: { backgroundColor: '#8B4513' },
  startCell: { backgroundColor: '#90EE90' },
  endCell: { backgroundColor: '#FFD700' },
  playerEmoji: { fontSize: 24 },
  endIcon: { width: 24, height: 24 },
  controls: {
    alignItems: 'center',
    marginTop: 20,
  },
  controlRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  controlButton: {
    width: 60,
    height: 60,
    backgroundColor: COLORS.blue,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 5,
  },
  controlIcon: { width: 28, height: 28, tintColor: COLORS.white },
  controlSpacer: { width: 60, height: 60, margin: 5 },
  levelRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
    gap: 10,
  },
  levelButton: {
    width: 40,
    height: 40,
    backgroundColor: '#E0E0E0',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  levelButtonActive: { backgroundColor: COLORS.green },
  levelText: { fontSize: 16, fontWeight: 'bold', color: COLORS.gray },
  levelTextActive: { color: COLORS.white },
  completeOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  completeModal: {
    backgroundColor: COLORS.white,
    borderRadius: 30,
    padding: 30,
    alignItems: 'center',
  },
  completeImage: { width: 100, height: 100 },
  completeTitle: { fontSize: 28, fontWeight: 'bold', color: COLORS.purple, marginTop: 10 },
  completeText: { fontSize: 16, color: COLORS.gray, marginTop: 10 },
  completeButtons: {
    flexDirection: 'row',
    marginTop: 20,
    gap: 15,
  },
  replayButton: {
    backgroundColor: COLORS.orange,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  nextLevelButton: {
    backgroundColor: COLORS.green,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  buttonIcon: { width: 18, height: 18, tintColor: COLORS.white },
  buttonText: { fontSize: 14, fontWeight: 'bold', color: COLORS.white },
});
