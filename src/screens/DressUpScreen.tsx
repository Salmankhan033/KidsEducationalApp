import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, RAINBOW_COLORS } from '../constants/colors';
import { DRESS_UP_ITEMS } from '../constants/activityData';
import { speakWord, speakCelebration, stopSpeaking } from '../utils/speech';
import { ScreenHeader } from '../components';
import { SCREEN_ICONS } from '../assets/images';

const { width } = Dimensions.get('window');

interface DressUpScreenProps {
  navigation: any;
}

export const DressUpScreen: React.FC<DressUpScreenProps> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [character, setCharacter] = useState(DRESS_UP_ITEMS.characters[0]);
  const [hat, setHat] = useState('');
  const [top, setTop] = useState(DRESS_UP_ITEMS.tops[0]);
  const [bottom, setBottom] = useState(DRESS_UP_ITEMS.bottoms[0]);
  const [shoes, setShoes] = useState(DRESS_UP_ITEMS.shoes[0]);
  const [accessory, setAccessory] = useState('');
  const [category, setCategory] = useState<'character' | 'hat' | 'top' | 'bottom' | 'shoes' | 'accessory'>('character');

  const categories = [
    { id: 'character', label: '👤', name: 'Character' },
    { id: 'hat', label: '🎩', name: 'Hat' },
    { id: 'top', label: '👕', name: 'Top' },
    { id: 'bottom', label: '👖', name: 'Bottom' },
    { id: 'shoes', label: '👟', name: 'Shoes' },
    { id: 'accessory', label: '🎒', name: 'Accessory' },
  ];

  const getItems = () => {
    switch (category) {
      case 'character': return DRESS_UP_ITEMS.characters;
      case 'hat': return DRESS_UP_ITEMS.hats;
      case 'top': return DRESS_UP_ITEMS.tops;
      case 'bottom': return DRESS_UP_ITEMS.bottoms;
      case 'shoes': return DRESS_UP_ITEMS.shoes;
      case 'accessory': return DRESS_UP_ITEMS.accessories;
    }
  };

  const handleSelect = (item: string) => {
    switch (category) {
      case 'character': setCharacter(item); break;
      case 'hat': setHat(item); break;
      case 'top': setTop(item); break;
      case 'bottom': setBottom(item); break;
      case 'shoes': setShoes(item); break;
      case 'accessory': setAccessory(item); break;
    }
    speakWord('Nice choice!');
  };

  const randomize = () => {
    setCharacter(DRESS_UP_ITEMS.characters[Math.floor(Math.random() * DRESS_UP_ITEMS.characters.length)]);
    setHat(DRESS_UP_ITEMS.hats[Math.floor(Math.random() * DRESS_UP_ITEMS.hats.length)]);
    setTop(DRESS_UP_ITEMS.tops[Math.floor(Math.random() * DRESS_UP_ITEMS.tops.length)]);
    setBottom(DRESS_UP_ITEMS.bottoms[Math.floor(Math.random() * DRESS_UP_ITEMS.bottoms.length)]);
    setShoes(DRESS_UP_ITEMS.shoes[Math.floor(Math.random() * DRESS_UP_ITEMS.shoes.length)]);
    setAccessory(DRESS_UP_ITEMS.accessories[Math.floor(Math.random() * DRESS_UP_ITEMS.accessories.length)]);
    speakCelebration();
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScreenHeader
        title="Dress Up!"
        icon={SCREEN_ICONS.mask}
        onBack={() => { stopSpeaking(); navigation.goBack(); }}
      />

      {/* Character Display */}
      <View style={styles.characterDisplay}>
        <View style={styles.characterBox}>
          {hat && <Text style={styles.hatEmoji}>{hat}</Text>}
          <Text style={styles.characterEmoji}>{character}</Text>
          {top && <Text style={styles.clothingEmoji}>{top}</Text>}
          {bottom && <Text style={styles.clothingEmoji}>{bottom}</Text>}
          {shoes && <Text style={styles.clothingEmoji}>{shoes}</Text>}
          {accessory && <Text style={styles.accessoryEmoji}>{accessory}</Text>}
        </View>
      </View>

      {/* Category Tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
        <View style={styles.categoryRow}>
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              style={[styles.categoryButton, category === cat.id && styles.categoryActive]}
              onPress={() => setCategory(cat.id as any)}
            >
              <Text style={styles.categoryEmoji}>{cat.label}</Text>
              <Text style={[styles.categoryName, category === cat.id && styles.categoryNameActive]}>
                {cat.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Items Grid */}
      <View style={styles.itemsContainer}>
        <ScrollView contentContainerStyle={styles.itemsGrid}>
          {getItems().map((item, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.itemButton, { backgroundColor: RAINBOW_COLORS[index % RAINBOW_COLORS.length] }]}
              onPress={() => handleSelect(item)}
            >
              <Text style={styles.itemEmoji}>{item || '❌'}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionsRow}>
        <TouchableOpacity onPress={randomize} style={styles.randomButton}>
          <Text style={styles.actionText}>🎲 Random</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => speakCelebration()} style={styles.doneButton}>
          <Text style={styles.actionText}>✨ Done!</Text>
        </TouchableOpacity>
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
  characterDisplay: {
    alignItems: 'center',
    marginVertical: 15,
  },
  characterBox: {
    backgroundColor: COLORS.white,
    width: 150,
    height: 200,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  hatEmoji: { fontSize: 35, position: 'absolute', top: 5 },
  characterEmoji: { fontSize: 60 },
  clothingEmoji: { fontSize: 30, marginTop: -5 },
  accessoryEmoji: { fontSize: 25, position: 'absolute', right: 15, top: 40 },
  categoryScroll: { maxHeight: 70 },
  categoryRow: { flexDirection: 'row', paddingHorizontal: 15, gap: 10 },
  categoryButton: {
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 15,
  },
  categoryActive: { backgroundColor: COLORS.purple },
  categoryEmoji: { fontSize: 24 },
  categoryName: { fontSize: 10, color: COLORS.gray, marginTop: 2 },
  categoryNameActive: { color: COLORS.white },
  itemsContainer: {
    flex: 1,
    backgroundColor: COLORS.white,
    marginHorizontal: 20,
    marginTop: 15,
    borderRadius: 20,
    padding: 15,
  },
  itemsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
  },
  itemButton: {
    width: 65,
    height: 65,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemEmoji: { fontSize: 35 },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    paddingVertical: 15,
  },
  randomButton: {
    backgroundColor: COLORS.orange,
    paddingHorizontal: 25,
    paddingVertical: 12,
    borderRadius: 20,
  },
  doneButton: {
    backgroundColor: COLORS.green,
    paddingHorizontal: 25,
    paddingVertical: 12,
    borderRadius: 20,
  },
  actionText: { fontSize: 16, fontWeight: 'bold', color: COLORS.white },
});


