import Tts from 'react-native-tts';
import { Platform, AppState, AppStateStatus } from 'react-native';

let isInitialized = false;
let isAppActive = true;

// Listen to app state changes
AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
  isAppActive = nextAppState === 'active';
  if (isAppActive && isInitialized) {
    // Re-apply settings when app becomes active
    console.log('🔊 App active - TTS ready');
  }
});
let currentGender: 'male' | 'female' | null = null;
let availableVoices: any[] = [];
let selectedVoiceId: string | null = null;

// Voice settings based on gender - Kid-friendly voices
// Kids have higher pitched voices than adults, so we use higher pitch values
const VOICE_SETTINGS = {
  male: {
    pitch: 1.25,     // Higher pitch for boy kid voice (not adult male)
    rate: 0.45,      // Normal speed for clarity
  },
  female: {
    pitch: 1.5,      // Even higher pitch for girl kid voice
    rate: 0.42,      // Normal speed for clarity
  },
  neutral: {
    pitch: 1.0,      // Default pitch
    rate: 0.5,       // Default rate (normal speed)
  },
};

// Initialize TTS settings
export const initTTS = async () => {
  if (isInitialized) return;
  
  try {
    console.log('🔊 Initializing TTS...');
    
    // iOS specific: Set to ignore silent switch so audio plays even in silent mode
    if (Platform.OS === 'ios') {
      try {
        await Tts.setIgnoreSilentSwitch('ignore');
        console.log('✓ Set ignore silent switch');
      } catch (e) {
        console.log('Could not set ignore silent switch:', e);
      }
    }
    
    // Set up event listeners
    Tts.addEventListener('tts-start', () => console.log('🗣️ TTS speaking...'));
    Tts.addEventListener('tts-finish', () => console.log('✓ TTS finished'));
    Tts.addEventListener('tts-cancel', () => console.log('⏹️ TTS cancelled'));
    
    // Get available voices
    try {
      availableVoices = await Tts.voices();
      console.log('Available voices:', availableVoices?.length || 0);
    } catch (e) {
      console.log('Could not get voices:', e);
      availableVoices = [];
    }
    
    // Set default language
    try {
      await Tts.setDefaultLanguage('en-US');
    } catch (e) {
      console.log('Could not set language, trying en:', e);
      try {
        await Tts.setDefaultLanguage('en');
      } catch (e2) {
        console.log('Could not set language en either:', e2);
      }
    }
    
    // Set default rate and pitch
    try {
      await Tts.setDefaultRate(VOICE_SETTINGS.neutral.rate);
      await Tts.setDefaultPitch(VOICE_SETTINGS.neutral.pitch);
    } catch (e) {
      console.log('Could not set rate/pitch:', e);
    }
    
    isInitialized = true;
    console.log('✓ TTS initialized successfully');
    
    // Test speak to verify it works
    setTimeout(() => {
      console.log('Testing TTS...');
    }, 100);
    
  } catch (error) {
    console.log('TTS init error:', error);
    isInitialized = true; // Mark as initialized anyway to avoid retry loops
  }
};

// Find voice by gender
const findVoiceByGender = (gender: 'male' | 'female') => {
  if (!availableVoices || availableVoices.length === 0) return null;
  
  // Filter English voices
  const englishVoices = availableVoices.filter(
    (v: any) => v.language && (v.language.startsWith('en') || v.language.includes('en'))
  );
  
  // Male voice names (common on iOS/Android)
  const maleNames = [
    'aaron', 'alex', 'daniel', 'david', 'fred', 'gordon', 'james',
    'lee', 'oliver', 'ralph', 'rishi', 'tom', 'thomas', 'male',
    'guy', 'man', 'boy', 'arthur', 'bruce', 'charles', 'edward',
    'george', 'henry', 'jack', 'william', 'jamie', 'en-us-x-sfg'
  ];
  
  // Female voice names (common on iOS/Android)
  const femaleNames = [
    'samantha', 'victoria', 'kate', 'karen', 'moira', 'fiona',
    'tessa', 'susan', 'allison', 'ava', 'emily', 'emma', 'female',
    'woman', 'girl', 'nicky', 'siri', 'zoe', 'zoey', 'en-us-x-tpf'
  ];
  
  const namesToSearch = gender === 'male' ? maleNames : femaleNames;
  
  // Try to find a voice matching the gender
  const genderVoice = englishVoices.find((v: any) => {
    const name = (v.name || '').toLowerCase();
    const id = (v.id || '').toLowerCase();
    
    return namesToSearch.some(n => name.includes(n) || id.includes(n));
  });
  
  if (genderVoice) {
    console.log(`Found ${gender} voice:`, genderVoice.name || genderVoice.id);
  }
  
  return genderVoice || null;
};

// Set voice based on gender
export const setVoiceGender = async (gender: 'male' | 'female' | null) => {
  try {
    // Initialize if not done
    if (!isInitialized) {
      await initTTS();
    }
    
    currentGender = gender;
    const settings = gender ? VOICE_SETTINGS[gender] : VOICE_SETTINGS.neutral;
    
    // First set pitch and rate
    await Tts.setDefaultPitch(settings.pitch);
    await Tts.setDefaultRate(settings.rate);
    
    // Try to set a specific voice for the gender
    if (gender && availableVoices && availableVoices.length > 0) {
      const voice = findVoiceByGender(gender);
      if (voice) {
        try {
          selectedVoiceId = voice.id;
          await Tts.setDefaultVoice(voice.id);
          console.log(`✓ Set ${gender} voice to: ${voice.name || voice.id}`);
        } catch (e) {
          console.log('Could not set specific voice, using pitch adjustment only');
          selectedVoiceId = null;
        }
      } else {
        console.log(`No specific ${gender} voice found, using pitch adjustment`);
        selectedVoiceId = null;
      }
    }
    
    console.log(`✓ Voice set to ${gender || 'neutral'} - pitch: ${settings.pitch}, rate: ${settings.rate}`);
  } catch (error) {
    console.log('Error setting voice gender:', error);
  }
};

// Get current gender
export const getCurrentVoiceGender = () => currentGender;

// Apply current voice settings before speaking
const applyVoiceSettings = async () => {
  if (currentGender) {
    const settings = VOICE_SETTINGS[currentGender];
    try {
      await Tts.setDefaultPitch(settings.pitch);
      await Tts.setDefaultRate(settings.rate);
      if (selectedVoiceId) {
        try {
          await Tts.setDefaultVoice(selectedVoiceId);
        } catch (e) {
          // Voice may not be available
        }
      }
    } catch (e) {
      console.log('Error applying voice settings:', e);
    }
  }
};

// Speak any word/text
export const speak = async (text: string) => {
  try {
    // Ensure TTS is initialized
    if (!isInitialized) {
      await initTTS();
    }
    
    // Stop any current speech
    try {
      await Tts.stop();
    } catch (e) {
      // Ignore stop errors
    }
    
    // Apply voice settings before speaking
    await applyVoiceSettings();
    
    // Speak the text
    console.log(`🗣️ Speaking: "${text}"`);
    Tts.speak(text);
  } catch (error) {
    console.log('Speak error:', error);
  }
};

// Speak alphabet letter
export const speakLetter = async (letter: string) => {
  try {
    if (!isInitialized) await initTTS();
    try { await Tts.stop(); } catch (e) {}
    await applyVoiceSettings();
    console.log(`🗣️ Letter: "${letter}"`);
    Tts.speak(letter);
  } catch (error) {
    console.log('Speak error:', error);
  }
};

// Speak word (for images - like "Apple", "Ball", etc.)
export const speakWord = async (word: string) => {
  try {
    if (!isInitialized) await initTTS();
    try { await Tts.stop(); } catch (e) {}
    await applyVoiceSettings();
    console.log(`🗣️ Word: "${word}"`);
    Tts.speak(word);
  } catch (error) {
    console.log('Speak error:', error);
  }
};

// Speak word with letter
export const speakAlphabet = async (letter: string, word: string) => {
  try {
    if (!isInitialized) await initTTS();
    try { await Tts.stop(); } catch (e) {}
    await applyVoiceSettings();
    const text = `${letter} for ${word}`;
    console.log(`🗣️ Alphabet: "${text}"`);
    Tts.speak(text);
  } catch (error) {
    console.log('Speak error:', error);
  }
};

// Speak number
export const speakNumber = async (num: number) => {
  try {
    if (!isInitialized) await initTTS();
    try { await Tts.stop(); } catch (e) {}
    await applyVoiceSettings();
    console.log(`🗣️ Number: "${num}"`);
    Tts.speak(num.toString());
  } catch (error) {
    console.log('Speak error:', error);
  }
};

// Speak shape name
export const speakShape = async (shape: string) => {
  try {
    if (!isInitialized) await initTTS();
    try { await Tts.stop(); } catch (e) {}
    await applyVoiceSettings();
    console.log(`🗣️ Shape: "${shape}"`);
    Tts.speak(shape);
  } catch (error) {
    console.log('Speak error:', error);
  }
};

// Speak color name
export const speakColor = async (color: string) => {
  try {
    if (!isInitialized) await initTTS();
    try { await Tts.stop(); } catch (e) {}
    await applyVoiceSettings();
    console.log(`🗣️ Color: "${color}"`);
    Tts.speak(color);
  } catch (error) {
    console.log('Speak error:', error);
  }
};

// Speak/Sing song lyrics
export const speakSong = async (lyrics: string) => {
  try {
    if (!isInitialized) await initTTS();
    try { await Tts.stop(); } catch (e) {}
    await applyVoiceSettings();
    console.log(`🗣️ Song lyrics`);
    Tts.speak(lyrics);
  } catch (error) {
    console.log('Speak error:', error);
  }
};

// Stop speaking
export const stopSpeaking = () => {
  try {
    Tts.stop();
  } catch (error) {
    console.log('Stop error:', error);
  }
};

// Speak celebration
export const speakCelebration = async () => {
  const celebrations = [
    'Wonderful!',
    'Great job!',
    'Amazing!',
    'You did it!',
    'Fantastic!',
    'Super!',
    'Excellent!',
    'Well done!',
    'Perfect!',
    'Awesome!',
  ];
  const random = celebrations[Math.floor(Math.random() * celebrations.length)];
  try {
    if (!isInitialized) await initTTS();
    try { await Tts.stop(); } catch (e) {}
    await applyVoiceSettings();
    console.log(`🗣️ Celebration: "${random}"`);
    Tts.speak(random);
  } catch (error) {
    console.log('Speak error:', error);
  }
};

// Speak correct/wrong feedback
export const speakFeedback = async (isCorrect: boolean) => {
  try {
    if (!isInitialized) await initTTS();
    try { await Tts.stop(); } catch (e) {}
    await applyVoiceSettings();
    const text = isCorrect ? 'Correct!' : 'Try again!';
    console.log(`🗣️ Feedback: "${text}"`);
    Tts.speak(text);
  } catch (error) {
    console.log('Speak error:', error);
  }
};

// Speak emotion
export const speakEmotion = async (emotion: string) => {
  try {
    if (!isInitialized) await initTTS();
    try { await Tts.stop(); } catch (e) {}
    await applyVoiceSettings();
    console.log(`🗣️ Emotion: "${emotion}"`);
    Tts.speak(emotion);
  } catch (error) {
    console.log('Speak error:', error);
  }
};

// Speak instruction
export const speakInstruction = async (instruction: string) => {
  try {
    if (!isInitialized) await initTTS();
    try { await Tts.stop(); } catch (e) {}
    await applyVoiceSettings();
    console.log(`🗣️ Instruction: "${instruction}"`);
    Tts.speak(instruction);
  } catch (error) {
    console.log('Speak error:', error);
  }
};

// Speak animal sound
export const speakAnimalSound = async (animal: string, sound: string) => {
  try {
    if (!isInitialized) await initTTS();
    try { await Tts.stop(); } catch (e) {}
    await applyVoiceSettings();
    const text = `The ${animal} says ${sound}`;
    console.log(`🗣️ Animal: "${text}"`);
    Tts.speak(text);
  } catch (error) {
    console.log('Speak error:', error);
  }
};
