import React, { useState } from 'react';
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
import { COLORS } from '../constants/colors';
import { JUICE_FRUITS } from '../constants/activityData';
import { speakWord, speakCelebration, stopSpeaking } from '../utils/speech';
import { ScreenHeader } from '../components';
import { SCREEN_ICONS } from '../assets/images';

const { width } = Dimensions.get('window');

interface JuiceMakingScreenProps {
  navigation: any;
}

export const JuiceMakingScreen: React.FC<JuiceMakingScreenProps> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [selectedFruits, setSelectedFruits] = useState<typeof JUICE_FRUITS>([]);
  const [isBlending, setIsBlending] = useState(false);
  const [juiceReady, setJuiceReady] = useState(false);
  const blendAnim = useState(new Animated.Value(0))[0];
  const shakeAnim = useState(new Animated.Value(0))[0];

  const addFruit = (fruit: typeof JUICE_FRUITS[0]) => {
    if (selectedFruits.length >= 3) {
      speakWord('Blender is full! Make juice first.');
      return;
    }
    if (selectedFruits.includes(fruit)) return;
    
    setSelectedFruits([...selectedFruits, fruit]);
    speakWord(fruit.name);
  };

  const removeFruit = (fruit: typeof JUICE_FRUITS[0]) => {
    setSelectedFruits(selectedFruits.filter(f => f.name !== fruit.name));
  };

  const blend = () => {
    if (selectedFruits.length === 0) {
      speakWord('Add some fruits first!');
      return;
    }

    setIsBlending(true);
    speakWord('Blending!');

    // Shake animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
      ]),
      { iterations: 20 }
    ).start();

    // Blend progress
    Animated.timing(blendAnim, {
      toValue: 1,
      duration: 2000,
      useNativeDriver: false,
    }).start(() => {
      setIsBlending(false);
      setJuiceReady(true);
      speakCelebration();
    });
  };

  const drinkJuice = () => {
    speakWord('Yummy! Delicious juice!');
    setTimeout(() => {
      setJuiceReady(false);
      setSelectedFruits([]);
      blendAnim.setValue(0);
    }, 1500);
  };

  const reset = () => {
    setSelectedFruits([]);
    setJuiceReady(false);
    setIsBlending(false);
    blendAnim.setValue(0);
  };

  const getJuiceColor = () => {
    if (selectedFruits.length === 0) return '#DDD';
    // Mix colors
    const colors = selectedFruits.map(f => f.color);
    return colors[Math.floor(colors.length / 2)] || colors[0];
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScreenHeader
        title="Juice Bar"
        icon={SCREEN_ICONS.juice}
        onBack={() => { stopSpeaking(); navigation.goBack(); }}
      />

      {/* Blender */}
      <Animated.View style={[styles.blenderContainer, { transform: [{ translateX: shakeAnim }] }]}>
        <View style={styles.blenderTop} />
        <View style={[styles.blender, { backgroundColor: juiceReady ? getJuiceColor() : '#F5F5F5' }]}>
          {!juiceReady && (
            <View style={styles.fruitsInBlender}>
              {selectedFruits.map((fruit, index) => (
                <TouchableOpacity key={fruit.name} onPress={() => removeFruit(fruit)}>
                  <Text style={styles.fruitInBlender}>{fruit.emoji}</Text>
                </TouchableOpacity>
              ))}
              {selectedFruits.length === 0 && (
                <Text style={styles.emptyText}>Add fruits!</Text>
              )}
            </View>
          )}
          {juiceReady && (
            <Text style={styles.juiceEmoji}>🧃</Text>
          )}
          
          {/* Blend progress */}
          {isBlending && (
            <Animated.View 
              style={[
                styles.blendProgress, 
                { 
                  height: blendAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0%', '100%'],
                  }),
                  backgroundColor: getJuiceColor(),
                }
              ]} 
            />
          )}
        </View>
        <View style={styles.blenderBase} />
      </Animated.View>

      {/* Action Buttons */}
      <View style={styles.actionsRow}>
        {!juiceReady ? (
          <TouchableOpacity 
            onPress={blend} 
            style={[styles.blendButton, selectedFruits.length === 0 && styles.buttonDisabled]}
            disabled={isBlending}
          >
            <Text style={styles.buttonText}>
              {isBlending ? '🔄 Blending...' : '🌀 Blend!'}
            </Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity onPress={drinkJuice} style={styles.drinkButton}>
            <Text style={styles.buttonText}>😋 Drink!</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity onPress={reset} style={styles.resetButton}>
          <Text style={styles.resetText}>🗑️</Text>
        </TouchableOpacity>
      </View>

      {/* Fruits Selection */}
      <View style={styles.fruitsContainer}>
        <Text style={styles.fruitsTitle}>🍎 Pick Fruits (max 3)</Text>
        <ScrollView contentContainerStyle={styles.fruitsGrid} showsVerticalScrollIndicator={false}>
          {JUICE_FRUITS.map((fruit) => (
            <TouchableOpacity
              key={fruit.name}
              style={[
                styles.fruitButton,
                { backgroundColor: fruit.color },
                selectedFruits.includes(fruit) && styles.fruitSelected,
              ]}
              onPress={() => addFruit(fruit)}
            >
              <Text style={styles.fruitEmoji}>{fruit.emoji}</Text>
              <Text style={styles.fruitName}>{fruit.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF0F5' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  backButton: { padding: 8 },
  backText: { fontSize: 16, color: COLORS.pink, fontWeight: '600' },
  title: { fontSize: 22, fontWeight: 'bold', color: COLORS.purple },
  placeholder: { width: 50 },
  blenderContainer: {
    alignItems: 'center',
    marginVertical: 15,
  },
  blenderTop: {
    width: 80,
    height: 20,
    backgroundColor: '#666',
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  blender: {
    width: 140,
    height: 150,
    borderRadius: 10,
    borderWidth: 4,
    borderColor: '#666',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    position: 'relative',
  },
  blenderBase: {
    width: 160,
    height: 30,
    backgroundColor: '#444',
    borderRadius: 5,
  },
  fruitsInBlender: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 5,
  },
  fruitInBlender: { fontSize: 35 },
  emptyText: { fontSize: 14, color: COLORS.gray },
  juiceEmoji: { fontSize: 60 },
  blendProgress: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    opacity: 0.7,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 15,
    marginVertical: 10,
  },
  blendButton: {
    backgroundColor: COLORS.green,
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 25,
  },
  drinkButton: {
    backgroundColor: COLORS.orange,
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 25,
  },
  buttonDisabled: { opacity: 0.5 },
  buttonText: { fontSize: 18, fontWeight: 'bold', color: COLORS.white },
  resetButton: {
    backgroundColor: '#DDD',
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  resetText: { fontSize: 24 },
  fruitsContainer: {
    flex: 1,
    backgroundColor: COLORS.white,
    marginHorizontal: 20,
    borderRadius: 25,
    padding: 15,
  },
  fruitsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.purple,
    marginBottom: 10,
  },
  fruitsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
  },
  fruitButton: {
    width: (width - 100) / 4,
    paddingVertical: 12,
    borderRadius: 15,
    alignItems: 'center',
  },
  fruitSelected: {
    borderWidth: 3,
    borderColor: COLORS.black,
    opacity: 0.6,
  },
  fruitEmoji: { fontSize: 30 },
  fruitName: { fontSize: 10, fontWeight: 'bold', color: COLORS.white, marginTop: 3 },
});


