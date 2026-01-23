import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Image,
  ImageBackground,
  StatusBar,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Sound from 'react-native-sound';
import { COLORS } from '../constants/colors';
import { ALPHABET_SONGS } from '../constants/alphabets';
import { speakSong, stopSpeaking } from '../utils/speech';
import { SCREEN_ICONS } from '../assets/images';
import { pauseBackgroundMusic, resumeBackgroundMusic } from '../utils/backgroundMusic';
import { useResponsiveLayout } from '../utils/useResponsiveLayout';

// Background Image
const SONGS_BG_IMAGE = require('../images/bgImage/SongsImageBG.png');

const { width } = Dimensions.get('window');

Sound.setCategory('Playback', true);

// Card background colors for colorful UI
const CARD_BG_COLORS = [
  '#FFE5E5', '#E5F6FF', '#F0E5FF', '#E5FFE8', 
  '#FFF5E5', '#FFE5F5', '#E5FFFF', '#FFF0E5',
];

interface SongCardProps {
  song: typeof ALPHABET_SONGS[0];
  index: number;
  isExpanded: boolean;
  isPlaying: boolean;
  onPress: () => void;
  onPlay: () => void;
  onStop: () => void;
  isLandscape: boolean;
}

const SongCard: React.FC<SongCardProps> = ({ 
  song, 
  index, 
  isExpanded, 
  isPlaying,
  onPress, 
  onPlay,
  onStop,
}) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const expandAnim = useRef(new Animated.Value(0)).current;
  const bounceAnim = useRef(new Animated.Value(0)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;
  const bgColor = CARD_BG_COLORS[index % CARD_BG_COLORS.length];

  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      delay: index * 50,
      tension: 80,
      friction: 6,
    }).start();

    // Floating animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, { toValue: -3, duration: 1200, useNativeDriver: true }),
        Animated.timing(floatAnim, { toValue: 0, duration: 1200, useNativeDriver: true }),
      ])
    ).start();
  }, [scaleAnim, floatAnim, index]);

  useEffect(() => {
    Animated.timing(expandAnim, {
      toValue: isExpanded ? 1 : 0,
      duration: 300,
      useNativeDriver: false,
    }).start();

    if (isExpanded || isPlaying) {
      const bounce = () => {
        Animated.sequence([
          Animated.timing(bounceAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(bounceAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
        ]).start(() => {
          if (isExpanded || isPlaying) bounce();
        });
      };
      bounce();
    }
  }, [isExpanded, isPlaying, expandAnim, bounceAnim]);

  return (
    <Animated.View
      style={[
        styles.songCard,
        {
          borderColor: song.color,
          backgroundColor: bgColor,
          transform: [{ scale: scaleAnim }, { translateY: floatAnim }],
        },
      ]}
    >
      <TouchableOpacity onPress={onPress} style={styles.songTouchable}>
        {/* Sparkle decorations */}
        <Text style={styles.sparkleLeft}>✨</Text>
        <Text style={styles.sparkleRight}>⭐</Text>
        
        <Animated.View style={[
          styles.balloonContainer, 
          { transform: [{ translateY: bounceAnim.interpolate({ inputRange: [0, 1], outputRange: [0, -5] }) }] }
        ]}>
          <View style={[styles.balloon, { backgroundColor: song.color }]}>
            <View style={styles.balloonShine} />
            <Text style={styles.balloonEmoji}>{song.emoji}</Text>
          </View>
          <View style={[styles.balloonTail, { borderTopColor: song.color }]} />
          <View style={styles.balloonString} />
        </Animated.View>

        <View style={styles.songHeader}>
          <Text style={[styles.songTitle, { color: song.color }]}>{song.title}</Text>
          <View style={[styles.expandBadge, { backgroundColor: song.color }]}>
            <Text style={styles.expandText}>{isExpanded ? '▲' : '▼'}</Text>
          </View>
        </View>
        
        {isExpanded && (
          <Animated.View style={[styles.lyricsContainer, { opacity: expandAnim }]}>
            <View style={styles.lyricsBox}>
              <Text style={styles.lyricsText}>{song.lyrics}</Text>
            </View>
            
            <TouchableOpacity 
              onPress={isPlaying ? onStop : onPlay}
              style={[
                styles.playButton,
                { backgroundColor: isPlaying ? '#E74C3C' : '#27AE60' },
              ]}
            >
              <Image 
                source={isPlaying ? SCREEN_ICONS.stop : SCREEN_ICONS.play} 
                style={styles.playButtonIcon} 
                resizeMode="contain"
              />
              <Text style={styles.playButtonText}>
                {isPlaying ? '⏹️ Stop' : '▶️ Sing Along!'}
              </Text>
            </TouchableOpacity>
            
            <View style={styles.notesRow}>
              {['🎵', '🎶', '🎵', '🎶', '🎵'].map((note, i) => (
                <Animated.View
                  key={i}
                  style={[
                    {
                      opacity: bounceAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.5, 1],
                      }),
                      transform: [
                        {
                          translateY: bounceAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: [0, -10 * ((i % 2) * 2 - 1)],
                          }),
                        },
                      ],
                    },
                  ]}
                >
                  <Text style={styles.noteEmoji}>{note}</Text>
                </Animated.View>
              ))}
            </View>
          </Animated.View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

interface SongsScreenProps {
  navigation: any;
}

export const SongsScreen: React.FC<SongsScreenProps> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { width, height, isLandscape } = useResponsiveLayout();
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [playingId, setPlayingId] = useState<number | null>(null);
  const abcSongRef = useRef<Sound | null>(null);

  const stopAbcSong = () => {
    if (abcSongRef.current) {
      try {
        abcSongRef.current.stop();
        abcSongRef.current.release();
      } catch (e) {
        console.log('Error stopping ABC song:', e);
      }
      abcSongRef.current = null;
    }
  };

  const playSongAudio = (audioFile: string) => {
    stopAbcSong();
    stopSpeaking();
    pauseBackgroundMusic();
    console.log('🎵 Loading song:', audioFile);
    tryPlaySong(audioFile, 0);
  };

  const SONG_AUDIO_FILES: { [key: number]: string } = {
    1: 'abc_alphabet_song.mp3',
    5: 'alphabet_song.mp3',
  };

  const tryPlaySong = (audioFile: string, songId: number) => {
    const sound = new Sound(audioFile, Sound.MAIN_BUNDLE, (error) => {
      if (error) {
        console.log('❌ Main bundle failed, trying without path:', audioFile, error);
        const sound2 = new Sound(audioFile, '', (error2) => {
          if (error2) {
            console.log('❌ Both attempts failed:', error2);
            setPlayingId(null);
            resumeBackgroundMusic();
            return;
          }
          playLoadedSound(sound2, audioFile);
        });
        return;
      }
      playLoadedSound(sound, audioFile);
    });
  };

  const playLoadedSound = (sound: Sound, audioFile: string) => {
    console.log('✓ Song loaded successfully:', audioFile);
    abcSongRef.current = sound;
    sound.setVolume(1.0);
    
    sound.play((success) => {
      console.log('Song play callback - success:', success);
      setPlayingId(null);
      stopAbcSong();
      resumeBackgroundMusic();
    });
    
    console.log('🎵 Started playing:', audioFile);
  };

  const handlePlay = (song: typeof ALPHABET_SONGS[0]) => {
    stopAbcSong();
    stopSpeaking();
    setPlayingId(song.id);

    const audioFile = SONG_AUDIO_FILES[song.id];
    if (audioFile) {
      playSongAudio(audioFile);
    } else {
      speakSong(song.lyrics);
    }
  };

  const handleStop = () => {
    stopAbcSong();
    stopSpeaking();
    setPlayingId(null);
    resumeBackgroundMusic();
  };

  useEffect(() => {
    return () => {
      stopAbcSong();
      stopSpeaking();
      resumeBackgroundMusic();
    };
  }, []);

  return (
    <ImageBackground 
      source={SONGS_BG_IMAGE} 
      style={styles.container}
      resizeMode="cover"
    >
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={[styles.header, { marginTop: insets.top + 10 }]}>
        <TouchableOpacity onPress={() => { handleStop(); navigation.goBack(); }} style={styles.backBtn}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>🎵 Songs</Text>
        <View style={styles.headerSpace} />
      </View>

      {/* Instructions */}
      <View style={styles.instructionBox}>
        <Text style={styles.instructionText}>🎤 Tap a song to sing along! 🎤</Text>
      </View>

      {/* Songs List */}
      <ScrollView
        contentContainerStyle={styles.songsContainer}
        showsVerticalScrollIndicator={false}
      >
        {ALPHABET_SONGS.map((song, index) => (
          <SongCard
            key={song.id}
            song={song}
            index={index}
            isExpanded={expandedId === song.id}
            isPlaying={playingId === song.id}
            onPress={() => {
              if (expandedId !== song.id) {
                handleStop();
              }
              setExpandedId(expandedId === song.id ? null : song.id);
            }}
            onPlay={() => handlePlay(song)}
            onStop={handleStop}
            isLandscape={isLandscape}
          />
        ))}

        <View style={styles.footer}>
          <View style={styles.footerIcons}>
            <Text style={styles.footerEmoji}>🎵</Text>
            <Text style={styles.footerEmoji}>⭐</Text>
            <Text style={styles.footerEmoji}>🎶</Text>
          </View>
          <Text style={styles.footerSubtext}>Keep Singing & Learning!</Text>
        </View>
      </ScrollView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    marginBottom: 6,
    zIndex: 10,
  },
  backBtn: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: '#FFE5E5',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 8,
  },
  backText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FF6B6B',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#fff',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  headerTitleLandscape: {
    fontSize: 18,
  },
  headerSpace: { width: 60 },
  instructionBox: {
    backgroundColor: '#FFFBEB',
    marginHorizontal: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 18,
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 2,
    borderColor: '#FFD700',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 8,
  },
  instructionText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#D97706',
  },
  songsContainer: {
    paddingHorizontal: 12,
    paddingBottom: 100,
    paddingTop: 10,
  },
  songCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 6,
    overflow: 'visible',
    position: 'relative',
  },
  songTouchable: {
    padding: 15,
    paddingTop: 35,
  },
  sparkleLeft: {
    position: 'absolute',
    top: 8,
    left: 10,
    fontSize: 12,
    zIndex: 10,
  },
  sparkleRight: {
    position: 'absolute',
    top: 8,
    right: 10,
    fontSize: 12,
    zIndex: 10,
  },
  songTouchableLandscape: {
    padding: 15,
    paddingTop: 30,
  },
  balloonContainer: {
    position: 'absolute',
    top: -30,
    left: 15,
    alignItems: 'center',
  },
  balloon: {
    width: 45,
    height: 52,
    borderRadius: 23,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.5)',
    overflow: 'hidden',
  },
  balloonShine: {
    position: 'absolute',
    top: 5,
    left: 8,
    width: 12,
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.5)',
    borderRadius: 6,
    transform: [{ rotate: '-25deg' }],
  },
  balloonEmoji: {
    fontSize: 22,
  },
  balloonTail: {
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 10,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    marginTop: -1,
  },
  balloonString: {
    width: 2,
    height: 15,
    backgroundColor: '#888',
  },
  songHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginLeft: 40,
  },
  songTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '800',
  },
  expandBadge: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  expandText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
  },
  expandTextLandscape: {
    fontSize: 14,
  },
  lyricsContainer: {
    marginTop: 15,
  },
  lyricsBox: {
    backgroundColor: '#FFFBEB',
    borderRadius: 14,
    padding: 14,
    borderWidth: 2,
    borderColor: '#FFD700',
  },
  lyricsText: {
    fontSize: 14,
    lineHeight: 22,
    color: '#333',
    textAlign: 'center',
    fontWeight: '500',
  },
  lyricsTextLandscape: {
    fontSize: 14,
    lineHeight: 22,
  },
  playButton: {
    marginTop: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 5,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  playButtonLandscape: {
    marginTop: 10,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 18,
    gap: 8,
  },
  playButtonIcon: {
    width: 24,
    height: 24,
    tintColor: '#fff',
  },
  playButtonIconLandscape: {
    width: 20,
    height: 20,
  },
  playButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  playButtonTextLandscape: {
    fontSize: 14,
  },
  notesRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 12,
    paddingHorizontal: 15,
  },
  noteEmoji: {
    fontSize: 24,
    height: 24,
  },
  footer: {
    alignItems: 'center',
    marginTop: 15,
    paddingVertical: 15,
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 18,
    marginHorizontal: 5,
    borderWidth: 2,
    borderColor: '#FFD700',
  },
  footerIcons: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 8,
  },
  footerEmoji: {
    fontSize: 28,
  },
  footerSubtext: {
    fontSize: 18,
    color: COLORS.purple,
    fontWeight: '700',
  },
});
