import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ImageSourcePropType,
} from 'react-native';
import { COLORS } from '../constants/colors';
import { SCREEN_ICONS } from '../assets/images';

interface ScreenHeaderProps {
  title: string;
  icon: ImageSourcePropType;
  onBack: () => void;
  backgroundColor?: string;
  titleColor?: string;
  rightElement?: React.ReactNode;
}

export const ScreenHeader: React.FC<ScreenHeaderProps> = ({
  title,
  icon,
  onBack,
  backgroundColor = 'transparent',
  titleColor = COLORS.purple,
  rightElement,
}) => {
  return (
    <View style={[styles.header, { backgroundColor }]}>
      <TouchableOpacity onPress={onBack} style={styles.backButton}>
        <Image source={SCREEN_ICONS.back} style={styles.backIcon} resizeMode="contain" />
        <Text style={styles.backText}>Back</Text>
      </TouchableOpacity>
      
      <View style={styles.titleContainer}>
        <Image source={icon} style={styles.titleIcon} resizeMode="contain" />
        <Text style={[styles.title, { color: titleColor }]}>{title}</Text>
      </View>
      
      <View style={styles.placeholder}>
        {rightElement}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingVertical: 12,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    gap: 4,
  },
  backIcon: {
    width: 20,
    height: 20,
    tintColor: COLORS.blue,
  },
  backText: {
    fontSize: 14,
    color: COLORS.blue,
    fontWeight: '600',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  titleIcon: {
    width: 28,
    height: 28,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  placeholder: {
    width: 70,
    alignItems: 'flex-end',
  },
});

