import React, { useState, useRef, useEffect } from 'react';
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
import { PET_DATA } from '../constants/activityData';
import { speakWord, stopSpeaking } from '../utils/speech';
import { ScreenHeader } from '../components';
import { SCREEN_ICONS } from '../assets/images';

const { width } = Dimensions.get('window');

interface PetCareScreenProps {
  navigation: any;
}

export const PetCareScreen: React.FC<PetCareScreenProps> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [currentPet, setCurrentPet] = useState(0);
  const [happiness, setHappiness] = useState(50);
  const [lastAction, setLastAction] = useState('');
  const [showMessage, setShowMessage] = useState(false);
  const bounceAnim = useRef(new Animated.Value(1)).current;
  const messageAnim = useRef(new Animated.Value(0)).current;

  const pet = PET_DATA.pets[currentPet];

  useEffect(() => {
    // Pet bounce animation
    const bounce = () => {
      Animated.sequence([
        Animated.timing(bounceAnim, { toValue: 1.1, duration: 500, useNativeDriver: true }),
        Animated.timing(bounceAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
      ]).start(() => bounce());
    };
    bounce();
    
    return () => stopSpeaking();
  }, [bounceAnim]);

  const handleAction = (action: typeof PET_DATA.actions[0]) => {
    setLastAction(action.message);
    setShowMessage(true);
    speakWord(action.message);
    
    // Increase happiness
    setHappiness(Math.min(100, happiness + 10));

    Animated.sequence([
      Animated.timing(messageAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
      Animated.delay(1500),
      Animated.timing(messageAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
    ]).start(() => setShowMessage(false));
  };

  const changePet = (index: number) => {
    setCurrentPet(index);
    setHappiness(50);
    speakWord(`Hello! I'm a ${PET_DATA.pets[index].name}!`);
  };

  const getHappinessEmoji = () => {
    if (happiness >= 80) return '😊';
    if (happiness >= 50) return '🙂';
    return '😔';
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScreenHeader
        title="Pet Care"
        icon={SCREEN_ICONS.dog}
        onBack={() => { stopSpeaking(); navigation.goBack(); }}
      />

      {/* Pet Selection */}
      <View style={styles.petSelectRow}>
        {PET_DATA.pets.map((p, index) => (
          <TouchableOpacity
            key={p.name}
            style={[styles.petSelectBtn, currentPet === index && styles.petSelectActive]}
            onPress={() => changePet(index)}
          >
            <Text style={styles.petSelectEmoji}>{p.emoji}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Pet Display */}
      <View style={styles.petContainer}>
        <Animated.View style={{ transform: [{ scale: bounceAnim }] }}>
          <Text style={styles.petEmoji}>{pet.emoji}</Text>
        </Animated.View>
        <Text style={styles.petName}>{pet.name}</Text>
        
        {/* Happiness Bar */}
        <View style={styles.happinessContainer}>
          <Text style={styles.happinessLabel}>Happiness {getHappinessEmoji()}</Text>
          <View style={styles.happinessBar}>
            <View style={[styles.happinessFill, { width: `${happiness}%` }]} />
          </View>
          <Text style={styles.happinessValue}>{happiness}%</Text>
        </View>

        {/* Message Bubble */}
        {showMessage && (
          <Animated.View style={[styles.messageBubble, { opacity: messageAnim }]}>
            <Text style={styles.messageText}>{lastAction}</Text>
          </Animated.View>
        )}
      </View>

      {/* Actions */}
      <View style={styles.actionsContainer}>
        <Text style={styles.actionsTitle}>Take care of your pet! 💕</Text>
        <ScrollView contentContainerStyle={styles.actionsGrid}>
          {PET_DATA.actions.map((action, index) => (
            <TouchableOpacity
              key={action.name}
              style={[styles.actionButton, { backgroundColor: RAINBOW_COLORS[index] }]}
              onPress={() => handleAction(action)}
            >
              <Text style={styles.actionEmoji}>{action.emoji}</Text>
              <Text style={styles.actionName}>{action.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Tips */}
      <View style={styles.tipBox}>
        <Text style={styles.tipText}>💡 Tip: Take good care of your pet to make them happy!</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF5E6' },
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
  placeholder: { width: 50 },
  petSelectRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 15,
    marginVertical: 10,
  },
  petSelectBtn: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  petSelectActive: {
    backgroundColor: COLORS.orange,
    transform: [{ scale: 1.1 }],
  },
  petSelectEmoji: { fontSize: 30 },
  petContainer: {
    alignItems: 'center',
    backgroundColor: COLORS.white,
    marginHorizontal: 20,
    paddingVertical: 25,
    borderRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 5,
    position: 'relative',
  },
  petEmoji: { fontSize: 100 },
  petName: { fontSize: 24, fontWeight: 'bold', color: COLORS.black, marginTop: 10 },
  happinessContainer: {
    marginTop: 15,
    alignItems: 'center',
    width: '80%',
  },
  happinessLabel: { fontSize: 14, color: COLORS.gray, marginBottom: 5 },
  happinessBar: {
    width: '100%',
    height: 15,
    backgroundColor: '#E0E0E0',
    borderRadius: 8,
    overflow: 'hidden',
  },
  happinessFill: {
    height: '100%',
    backgroundColor: COLORS.green,
    borderRadius: 8,
  },
  happinessValue: { fontSize: 14, fontWeight: 'bold', color: COLORS.green, marginTop: 5 },
  messageBubble: {
    position: 'absolute',
    top: 10,
    backgroundColor: COLORS.yellow,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  messageText: { fontSize: 16, fontWeight: '600', color: COLORS.black },
  actionsContainer: {
    flex: 1,
    marginHorizontal: 20,
    marginTop: 20,
  },
  actionsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.purple,
    marginBottom: 10,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
  },
  actionButton: {
    width: (width - 80) / 3,
    paddingVertical: 15,
    borderRadius: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  actionEmoji: { fontSize: 30 },
  actionName: { fontSize: 12, fontWeight: 'bold', color: COLORS.white, marginTop: 5 },
  tipBox: {
    backgroundColor: COLORS.yellow,
    marginHorizontal: 20,
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 15,
    marginBottom: 15,
  },
  tipText: { fontSize: 13, color: COLORS.black, textAlign: 'center' },
});


