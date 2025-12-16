import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { setVoiceGender } from '../utils/speech';

// Gender types
export type Gender = 'male' | 'female' | null;

// Child images based on gender - Cute cartoon kids
export const CHILD_IMAGES = {
  male: {
    // Cute cartoon boy - adorable little boy character
    avatar: { uri: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQaPlS9NSUFuBAqXRo-gXBkW5nrTUtEzXhbVw&s' },
    character: { uri: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQaPlS9NSUFuBAqXRo-gXBkW5nrTUtEzXhbVw&s' },
    happy: { uri: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQaPlS9NSUFuBAqXRo-gXBkW5nrTUtEzXhbVw&s' },
    wave: { uri: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQaPlS9NSUFuBAqXRo-gXBkW5nrTUtEzXhbVw&s' },
    study: { uri: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQaPlS9NSUFuBAqXRo-gXBkW5nrTUtEzXhbVw&s' },
    celebrate: { uri: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQaPlS9NSUFuBAqXRo-gXBkW5nrTUtEzXhbVw&s' },
  },
  female: {
    // Cute cartoon girl - adorable little girl character  
    avatar: { uri: 'https://img.freepik.com/premium-psd/cute-girl-cartoon-character_1136343-32644.jpg?semt=ais_hybrid&w=740&q=80' },
    character: { uri: 'https://img.freepik.com/premium-psd/cute-girl-cartoon-character_1136343-32644.jpg?semt=ais_hybrid&w=740&q=80' },
    happy: { uri: 'https://img.freepik.com/premium-psd/cute-girl-cartoon-character_1136343-32644.jpg?semt=ais_hybrid&w=740&q=80' },
    wave: { uri: 'https://img.freepik.com/premium-psd/cute-girl-cartoon-character_1136343-32644.jpg?semt=ais_hybrid&w=740&q=80' },
    study: { uri: 'https://img.freepik.com/premium-psd/cute-girl-cartoon-character_1136343-32644.jpg?semt=ais_hybrid&w=740&q=80' },
    celebrate: { uri: 'https://img.freepik.com/premium-psd/cute-girl-cartoon-character_1136343-32644.jpg?semt=ais_hybrid&w=740&q=80' },
  },
};

// Theme colors based on gender
export const GENDER_THEMES = {
  male: {
    primary: '#4A90D9',
    secondary: '#87CEEB',
    accent: '#1E90FF',
    background: '#E6F3FF',
    card: '#B8D4F0',
    emoji: '🚀',
    title: 'Hey Champion!',
  },
  female: {
    primary: '#FF69B4',
    secondary: '#FFB6C1',
    accent: '#FF1493',
    background: '#FFF0F5',
    card: '#FFD1DC',
    emoji: '🌸',
    title: 'Hello Princess!',
  },
  neutral: {
    primary: '#9B59B6',
    secondary: '#DDA0DD',
    accent: '#8B5CF6',
    background: '#FFF9E6',
    card: '#E8D5FF',
    emoji: '🌟',
    title: 'Welcome!',
  },
};

interface GenderContextType {
  gender: Gender;
  setGender: (gender: Gender) => void;
  isFirstLaunch: boolean;
  setIsFirstLaunch: (value: boolean) => void;
  childImages: typeof CHILD_IMAGES.male | typeof CHILD_IMAGES.female | null;
  theme: typeof GENDER_THEMES.male | typeof GENDER_THEMES.female | typeof GENDER_THEMES.neutral;
}

const GenderContext = createContext<GenderContextType | undefined>(undefined);

const GENDER_STORAGE_KEY = '@kids_edu_app_gender';
const FIRST_LAUNCH_KEY = '@kids_edu_app_first_launch';

export const GenderProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [gender, setGenderState] = useState<Gender>(null);
  const [isFirstLaunch, setIsFirstLaunchState] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Load saved gender and first launch status on mount
  useEffect(() => {
    loadSavedData();
  }, []);

  const loadSavedData = async () => {
    try {
      const [savedGender, firstLaunch] = await Promise.all([
        AsyncStorage.getItem(GENDER_STORAGE_KEY),
        AsyncStorage.getItem(FIRST_LAUNCH_KEY),
      ]);

      if (savedGender) {
        setGenderState(savedGender as Gender);
        // Apply saved voice settings for the gender (boy/girl kid voice)
        await setVoiceGender(savedGender as Gender);
      }

      // If first launch key doesn't exist, it's first launch
      if (firstLaunch === null) {
        setIsFirstLaunchState(true);
      } else {
        setIsFirstLaunchState(false);
      }
    } catch (error) {
      console.log('Error loading gender data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const setGender = async (newGender: Gender) => {
    try {
      if (newGender) {
        await AsyncStorage.setItem(GENDER_STORAGE_KEY, newGender);
        // Apply voice settings for the selected gender (boy/girl kid voice)
        await setVoiceGender(newGender);
      } else {
        await AsyncStorage.removeItem(GENDER_STORAGE_KEY);
        await setVoiceGender(null);
      }
      setGenderState(newGender);
    } catch (error) {
      console.log('Error saving gender:', error);
    }
  };

  const setIsFirstLaunch = async (value: boolean) => {
    try {
      if (!value) {
        await AsyncStorage.setItem(FIRST_LAUNCH_KEY, 'false');
      } else {
        await AsyncStorage.removeItem(FIRST_LAUNCH_KEY);
      }
      setIsFirstLaunchState(value);
    } catch (error) {
      console.log('Error saving first launch status:', error);
    }
  };

  // Get child images based on gender
  const childImages = gender ? CHILD_IMAGES[gender] : null;

  // Get theme based on gender
  const theme = gender ? GENDER_THEMES[gender] : GENDER_THEMES.neutral;

  if (isLoading) {
    return null; // Or a loading spinner
  }

  return (
    <GenderContext.Provider
      value={{
        gender,
        setGender,
        isFirstLaunch,
        setIsFirstLaunch,
        childImages,
        theme,
      }}
    >
      {children}
    </GenderContext.Provider>
  );
};

export const useGender = (): GenderContextType => {
  const context = useContext(GenderContext);
  if (context === undefined) {
    throw new Error('useGender must be used within a GenderProvider');
  }
  return context;
};

export default GenderContext;
