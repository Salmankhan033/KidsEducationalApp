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
import { useResponsiveLayout } from '../utils/useResponsiveLayout';

interface ScreenHeaderProps {
  title: string;
  icon: ImageSourcePropType;
  onBack: () => void;
  backgroundColor?: string;
  titleColor?: string;
  rightElement?: React.ReactNode;
  compact?: boolean;
}

export const ScreenHeader: React.FC<ScreenHeaderProps> = ({
  title,
  icon,
  onBack,
  backgroundColor = 'transparent',
  titleColor = COLORS.purple,
  rightElement,
  compact = false,
}) => {
  const { isLandscape, fontSize, iconSize, spacing } = useResponsiveLayout();
  const isCompact = compact || isLandscape;

  return (
    <View style={[
      styles.header, 
      { backgroundColor },
      isCompact && styles.headerLandscape,
    ]}>
      <TouchableOpacity 
        onPress={onBack} 
        style={[styles.backButton, isCompact && styles.backButtonLandscape]}
      >
        <Image 
          source={SCREEN_ICONS.back} 
          style={[
            styles.backIcon, 
            { width: isCompact ? 16 : iconSize(20), height: isCompact ? 16 : iconSize(20) }
          ]} 
          resizeMode="contain" 
        />
        <Text style={[styles.backText, { fontSize: isCompact ? 12 : fontSize(14) }]}>Back</Text>
      </TouchableOpacity>
      
      <View style={styles.titleContainer}>
        <Image 
          source={icon} 
          style={[
            styles.titleIcon, 
            { width: isCompact ? 22 : iconSize(28), height: isCompact ? 22 : iconSize(28) }
          ]} 
          resizeMode="contain" 
        />
        <Text style={[
          styles.title, 
          { color: titleColor, fontSize: isCompact ? 16 : fontSize(20) }
        ]}>
          {title}
        </Text>
      </View>
      
      <View style={[styles.placeholder, isCompact && styles.placeholderLandscape]}>
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
  headerLandscape: {
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    gap: 4,
  },
  backButtonLandscape: {
    padding: 6,
  },
  backIcon: {
    tintColor: COLORS.blue,
  },
  backText: {
    color: COLORS.blue,
    fontWeight: '600',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  titleIcon: {
    // Dynamic sizing applied inline
  },
  title: {
    fontWeight: 'bold',
  },
  placeholder: {
    width: 70,
    alignItems: 'flex-end',
  },
  placeholderLandscape: {
    width: 60,
  },
});
