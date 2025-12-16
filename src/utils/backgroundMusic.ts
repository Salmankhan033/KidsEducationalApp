import Sound from 'react-native-sound';
import { AppState, AppStateStatus } from 'react-native';

// Enable playback in silence mode (iOS) with mixing enabled
// 'Playback' allows audio to play in background
// mixWithOthers allows TTS to play alongside music
Sound.setCategory('Playback', true);

// Music Types
export type MusicType = 'home' | 'game';

// Music files - different songs for different screens
const MUSIC_FILES = {
  home: 'abc_song_123606.mp3',      // ABC Song for Home/Learning screens
  game: 'kids_happy_music_323851.mp3', // Happy Music for Game screens
};

let currentSound: Sound | null = null;
let currentMusicType: MusicType = 'home';
let isPlaying = false;
let isMuted = false;
let isPaused = false; // Track if intentionally paused (app in background)
// Very low volume for background music (0.08) so speech/TTS is much louder
let savedVolume = 0.08;

// Health check interval
let healthCheckInterval: NodeJS.Timeout | null = null;

// Mute state change listeners
type MuteListener = (muted: boolean) => void;
const muteListeners: MuteListener[] = [];

// Subscribe to mute state changes
export const subscribeMuteState = (listener: MuteListener) => {
  muteListeners.push(listener);
  // Return unsubscribe function
  return () => {
    const index = muteListeners.indexOf(listener);
    if (index > -1) {
      muteListeners.splice(index, 1);
    }
  };
};

// Notify all listeners of mute state change
const notifyMuteListeners = () => {
  muteListeners.forEach(listener => listener(isMuted));
};

// Check if music is actually playing and restart if needed
const checkAndRestartMusic = () => {
  if (isPlaying && !isPaused && !isMuted) {
    if (!currentSound) {
      console.log('🔄 Music stopped unexpectedly, restarting...');
      loadAndPlayTrack(currentMusicType);
    } else {
      // Check if sound is still valid
      currentSound.getCurrentTime((seconds, isCurrentlyPlaying) => {
        if (!isCurrentlyPlaying && isPlaying && !isPaused) {
          console.log('🔄 Music not playing, restarting...');
          loadAndPlayTrack(currentMusicType);
        }
      });
    }
  }
};

// Start health check to keep music playing
const startHealthCheck = () => {
  if (healthCheckInterval) {
    clearInterval(healthCheckInterval);
  }
  // Check every 5 seconds if music is still playing
  healthCheckInterval = setInterval(checkAndRestartMusic, 5000);
};

// Stop health check
const stopHealthCheck = () => {
  if (healthCheckInterval) {
    clearInterval(healthCheckInterval);
    healthCheckInterval = null;
  }
};

// Load and play a music track
const loadAndPlayTrack = (musicType: MusicType) => {
  // Stop current sound if playing
  if (currentSound) {
    try {
      currentSound.stop();
      currentSound.release();
    } catch (e) {
      console.log('Error stopping current sound:', e);
    }
    currentSound = null;
  }

  const trackName = MUSIC_FILES[musicType];
  currentMusicType = musicType;
  
  console.log('🎵 Loading music:', trackName);
  
  currentSound = new Sound(trackName, Sound.MAIN_BUNDLE, (error) => {
    if (error) {
      console.log('Failed to load sound:', trackName, error);
      // Retry after a delay
      setTimeout(() => {
        if (isPlaying && !isPaused) {
          loadAndPlayTrack(musicType);
        }
      }, 2000);
      return;
    }

    console.log('✓ Loaded background music:', trackName);
    
    if (currentSound && isPlaying && !isPaused) {
      // Set VERY LOW volume (0.08) so speech is much louder - background music
      currentSound.setVolume(isMuted ? 0 : savedVolume);
      
      // Set to loop infinitely (-1 means infinite loop - plays forever)
      currentSound.setNumberOfLoops(-1);
      
      // Play the track (loops forever and never stops)
      currentSound.play((success) => {
        if (!success) {
          console.log('Playback failed:', trackName);
          // Retry after a short delay
          if (isPlaying && !isPaused) {
            setTimeout(() => loadAndPlayTrack(currentMusicType), 1000);
          }
        }
        // Note: With infinite loop (-1), this callback only fires if playback fails
        // The song loops forever automatically
      });
      
      console.log('🎵 Playing:', trackName, '(loops forever, volume:', savedVolume, ')');
      
      // Start health check
      startHealthCheck();
    }
  });
};

// Start background music (home music by default)
export const startBackgroundMusic = (musicType: MusicType = 'home') => {
  isPaused = false;
  
  // If already playing the same music, just ensure it's running
  if (isPlaying && currentMusicType === musicType && currentSound) {
    // Make sure it's actually playing
    currentSound.getCurrentTime((seconds, isCurrentlyPlaying) => {
      if (!isCurrentlyPlaying) {
        currentSound?.play();
      }
    });
    startHealthCheck();
    return;
  }
  
  console.log('🎵 Starting background music:', musicType);
  isPlaying = true;
  loadAndPlayTrack(musicType);
};

// Switch to different music (e.g., switch from home to game music)
export const switchBackgroundMusic = (musicType: MusicType) => {
  isPaused = false;
  
  if (currentMusicType === musicType && isPlaying && currentSound) {
    // Already playing this music type, just make sure it's running
    currentSound.getCurrentTime((seconds, isCurrentlyPlaying) => {
      if (!isCurrentlyPlaying) {
        currentSound?.play();
      }
    });
    return;
  }
  
  console.log('🎵 Switching background music to:', musicType);
  
  if (isPlaying) {
    loadAndPlayTrack(musicType);
  } else {
    startBackgroundMusic(musicType);
  }
};

// Stop background music completely
export const stopBackgroundMusic = () => {
  console.log('🔇 Stopping background music...');
  isPlaying = false;
  isPaused = false;
  stopHealthCheck();
  
  if (currentSound) {
    try {
      currentSound.stop();
      currentSound.release();
    } catch (e) {
      console.log('Error stopping sound:', e);
    }
    currentSound = null;
  }
};

// Pause background music (when app goes to background)
export const pauseBackgroundMusic = () => {
  if (currentSound && isPlaying) {
    isPaused = true;
    try {
      currentSound.pause();
    } catch (e) {
      console.log('Error pausing:', e);
    }
    stopHealthCheck();
    console.log('⏸️ Paused background music');
  }
};

// Resume background music (when app comes to foreground)
export const resumeBackgroundMusic = () => {
  if (isPlaying) {
    isPaused = false;
    
    if (currentSound) {
      // Check if sound is still valid and resume
      currentSound.getCurrentTime((seconds, isCurrentlyPlaying) => {
        if (!isCurrentlyPlaying && currentSound) {
          currentSound.play((success) => {
            if (!success) {
              // Reload and play
              loadAndPlayTrack(currentMusicType);
            }
          });
        }
      });
    } else {
      // Sound was released, reload it
      loadAndPlayTrack(currentMusicType);
    }
    
    startHealthCheck();
    console.log('▶️ Resumed background music');
  }
};

// Set volume (0.0 to 1.0) - use low values for background music
export const setMusicVolume = (volume: number) => {
  savedVolume = Math.max(0, Math.min(1, volume));
  if (currentSound && !isMuted) {
    currentSound.setVolume(savedVolume);
  }
};

// Get current volume
export const getMusicVolume = () => savedVolume;

// Check if music is currently playing
export const isMusicPlaying = () => isPlaying && !isPaused;

// Get current music type
export const getCurrentMusicType = () => currentMusicType;

// Check if music is muted
export const isMusicMuted = () => isMuted;

// Toggle mute/unmute
export const toggleMute = () => {
  isMuted = !isMuted;
  
  if (currentSound) {
    if (isMuted) {
      currentSound.setVolume(0);
      console.log('🔇 Music muted');
    } else {
      currentSound.setVolume(savedVolume);
      console.log('🔊 Music unmuted');
    }
  }
  
  notifyMuteListeners();
  return isMuted;
};

// Set mute state directly
export const setMuted = (muted: boolean) => {
  if (isMuted !== muted) {
    isMuted = muted;
    
    if (currentSound) {
      currentSound.setVolume(muted ? 0 : savedVolume);
    }
    
    notifyMuteListeners();
  }
};

// ============== AUDIO DUCKING ==============
// When TTS speaks, lower music volume so voice is clear
// When TTS finishes, restore music volume

// Ducked volume - very quiet when speaking (almost silent)
const DUCKED_VOLUME = 0.02;

// Duck the music volume (called when TTS starts speaking)
export const setMusicVolumeDucked = () => {
  if (currentSound && !isMuted) {
    currentSound.setVolume(DUCKED_VOLUME);
    console.log('🔉 Music ducked to', DUCKED_VOLUME);
  }
};

// Restore the music volume (called when TTS stops speaking)
export const restoreMusicVolume = () => {
  if (currentSound && !isMuted) {
    currentSound.setVolume(savedVolume);
    console.log('🔊 Music restored to', savedVolume);
  }
};

// ============== ENSURE MUSIC KEEPS PLAYING ==============
// Call this periodically or when needed to ensure music is playing
export const ensureMusicPlaying = () => {
  if (isPlaying && !isPaused && !isMuted) {
    if (!currentSound) {
      console.log('🔄 Ensuring music - no sound, restarting...');
      loadAndPlayTrack(currentMusicType);
    } else {
      currentSound.getCurrentTime((seconds, isCurrentlyPlaying) => {
        if (!isCurrentlyPlaying) {
          console.log('🔄 Ensuring music - not playing, restarting...');
          currentSound?.play((success) => {
            if (!success) {
              loadAndPlayTrack(currentMusicType);
            }
          });
        }
      });
    }
  }
};
