import React, { useState, useEffect } from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  StyleProp,
  ViewStyle,
} from 'react-native';
import {
  toggleMute,
  isMusicMuted,
  subscribeMuteState,
} from '../utils/backgroundMusic';

interface MuteButtonProps {
  style?: StyleProp<ViewStyle>;
  size?: 'small' | 'medium' | 'large';
}

export const MuteButton: React.FC<MuteButtonProps> = ({
  style,
  size = 'medium',
}) => {
  const [muted, setMuted] = useState(isMusicMuted());

  useEffect(() => {
    // Subscribe to mute state changes
    const unsubscribe = subscribeMuteState((newMutedState) => {
      setMuted(newMutedState);
    });

    // Sync initial state
    setMuted(isMusicMuted());

    return unsubscribe;
  }, []);

  const handlePress = () => {
    toggleMute();
  };

  const sizeStyles = {
    small: { width: 36, height: 36, fontSize: 18 },
    medium: { width: 44, height: 44, fontSize: 22 },
    large: { width: 52, height: 52, fontSize: 26 },
  };

  const { width, height, fontSize } = sizeStyles[size];

  return (
    <TouchableOpacity
      onPress={handlePress}
      style={[
        styles.button,
        { width, height, borderRadius: width / 2 },
        muted && styles.mutedButton,
        style,
      ]}
      activeOpacity={0.7}
    >
      <Text style={[styles.icon, { fontSize }]}>
        {muted ? '🔇' : '🔊'}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
    borderWidth: 2,
    borderColor: '#4CAF50',
  },
  mutedButton: {
    borderColor: '#FF6B6B',
    backgroundColor: 'rgba(255, 235, 235, 0.95)',
  },
  icon: {
    textAlign: 'center',
  },
});

export default MuteButton;

