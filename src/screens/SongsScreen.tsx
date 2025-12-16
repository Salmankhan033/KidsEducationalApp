import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Image,
  Dimensions,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Sound from 'react-native-sound';
import { COLORS } from '../constants/colors';
import { ALPHABET_SONGS } from '../constants/alphabets';
import { speakSong, stopSpeaking } from '../utils/speech';
import { SCREEN_ICONS } from '../assets/images';
import { MuteButton } from '../components';
import { pauseBackgroundMusic, resumeBackgroundMusic } from '../utils/backgroundMusic';

// Enable playback in silence mode
Sound.setCategory('Playback', true);

const { width, height } = Dimensions.get('window');

// Decorative background images
const BG_IMAGES = {
  sun: { uri: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/2600.png' },
  cloud: { uri: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/2601.png' },
  rainbow: { uri: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f308.png' },
  star: { uri: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/2b50.png' },
  butterfly: { uri: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f98b.png' },
  flower: { uri: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f33c.png' },
  tulip: { uri: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f337.png' },
  tree: { uri: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f333.png' },
  bird: { uri: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f426.png' },
  bee: { uri: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f41d.png' },
  ladybug: { uri: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f41e.png' },
  sparkle: { uri: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/2728.png' },
  musicNote: { uri: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f3b5.png' },
  musicalNotes: { uri: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f3b6.png' },
};

interface SongCardProps {
  song: typeof ALPHABET_SONGS[0];
  index: number;
  isExpanded: boolean;
  isPlaying: boolean;
  onPress: () => void;
  onPlay: () => void;
  onStop: () => void;
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

  useEffect(() => {
    Animated.delay(index * 100).start(() => {
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 50,
        friction: 7,
      }).start();
    });
  }, [scaleAnim, index]);

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
          transform: [{ scale: scaleAnim }],
        },
      ]}
    >
      <TouchableOpacity onPress={onPress} style={styles.songTouchable}>
        {/* Balloon decoration */}
        <Animated.View style={[styles.balloonContainer, { transform: [{ translateY: bounceAnim.interpolate({ inputRange: [0, 1], outputRange: [0, -5] }) }] }]}>
          <View style={[styles.balloon, { backgroundColor: song.color }]}>
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
          <Animated.View
            style={[
              styles.lyricsContainer,
              {
                opacity: expandAnim,
              },
            ]}
          >
            <View style={styles.lyricsBox}>
              <Text style={styles.lyricsText}>{song.lyrics}</Text>
            </View>
            
            {/* Play/Stop Button */}
            <TouchableOpacity 
              onPress={isPlaying ? onStop : onPlay}
              style={[
                styles.playButton,
                { backgroundColor: isPlaying ? '#E74C3C' : '#27AE60' }
              ]}
            >
              <Image 
                source={isPlaying ? SCREEN_ICONS.stop : SCREEN_ICONS.play} 
                style={styles.playButtonIcon} 
                resizeMode="contain"
              />
              <Text style={styles.playButtonText}>
                {isPlaying ? 'Stop Singing' : 'Sing Along!'}
              </Text>
            </TouchableOpacity>
            
            {/* Animated Music Notes */}
            <View style={styles.notesRow}>
              {[0, 1, 2, 3, 4].map((i) => (
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
                  <Image source={BG_IMAGES.musicNote} style={styles.noteImage} resizeMode="contain" />
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
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [playingId, setPlayingId] = useState<number | null>(null);
  const abcSongRef = useRef<Sound | null>(null);

  // Cleanup function for ABC song
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

  // Play song from MP3 file
  const playSongAudio = (audioFile: string) => {
    // Stop any existing playback
    stopAbcSong();
    stopSpeaking();
    
    // Pause background music so song can be heard clearly
    pauseBackgroundMusic();

    console.log('🎵 Loading song:', audioFile);
    
    // Try to play the song
    tryPlaySong(audioFile, 0);
  };

  // Map song IDs to their audio files (using native bundle names)
  const SONG_AUDIO_FILES: { [key: number]: string } = {
    1: 'abc_alphabet_song.mp3',  // ABC Song
    5: 'alphabet_song.mp3',       // Alphabet Song (A is for Apple...)
  };

  // Alternative: Try loading from different locations
  const tryPlaySong = (audioFile: string, songId: number) => {
    // First try the main bundle
    const sound = new Sound(audioFile, Sound.MAIN_BUNDLE, (error) => {
      if (error) {
        console.log('❌ Main bundle failed, trying without path:', audioFile, error);
        // Try without specifying bundle (for Android)
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
    console.log('Duration:', sound.getDuration(), 'seconds');
    
    abcSongRef.current = sound;
    sound.setVolume(1.0);
    
    sound.play((success) => {
      console.log('Song play callback - success:', success);
      if (success) {
        console.log('✓ Song finished playing:', audioFile);
      } else {
        console.log('❌ Song playback failed:', audioFile);
      }
      setPlayingId(null);
      stopAbcSong();
      resumeBackgroundMusic();
    });
    
    console.log('🎵 Started playing:', audioFile);
  };

  const handlePlay = (song: typeof ALPHABET_SONGS[0]) => {
    // Stop any current playback
    stopAbcSong();
    stopSpeaking();

    setPlayingId(song.id);

    // Check if this song has an audio file
    const audioFile = SONG_AUDIO_FILES[song.id];
    if (audioFile) {
      playSongAudio(audioFile);
    } else {
      // For other songs, use TTS
      speakSong(song.lyrics);
    }
  };

  const handleStop = () => {
    stopAbcSong();
    stopSpeaking();
    setPlayingId(null);
    // Resume background music when stopping
    resumeBackgroundMusic();
  };

  useEffect(() => {
    return () => {
      stopAbcSong();
      stopSpeaking();
      // Resume background music when leaving screen
      resumeBackgroundMusic();
    };
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Beautiful Kid-Friendly Background */}
      <View style={styles.skyBackground}>
        <Image source={BG_IMAGES.sun} style={styles.bgSun} />
        <Image source={BG_IMAGES.cloud} style={styles.bgCloud1} />
        <Image source={BG_IMAGES.cloud} style={styles.bgCloud2} />
        <Image source={BG_IMAGES.cloud} style={styles.bgCloud3} />
        <Image source={BG_IMAGES.rainbow} style={styles.bgRainbow} />
        <Image source={BG_IMAGES.star} style={styles.bgStar1} />
        <Image source={BG_IMAGES.star} style={styles.bgStar2} />
        <Image source={BG_IMAGES.sparkle} style={styles.bgSparkle1} />
        <Image source={BG_IMAGES.sparkle} style={styles.bgSparkle2} />
        <Image source={BG_IMAGES.bird} style={styles.bgBird1} />
        <Image source={BG_IMAGES.bird} style={styles.bgBird2} />
        <Image source={BG_IMAGES.butterfly} style={styles.bgButterfly} />
        <Image source={BG_IMAGES.musicalNotes} style={styles.bgMusic1} />
        <Image source={BG_IMAGES.musicNote} style={styles.bgMusic2} />
      </View>

      {/* Grass with flowers */}
      <View style={styles.grassBackground}>
        <Image source={BG_IMAGES.tree} style={styles.bgTree1} />
        <Image source={BG_IMAGES.tree} style={styles.bgTree2} />
        <Image source={BG_IMAGES.flower} style={styles.bgFlower1} />
        <Image source={BG_IMAGES.tulip} style={styles.bgFlower2} />
        <Image source={BG_IMAGES.flower} style={styles.bgFlower3} />
        <Image source={BG_IMAGES.tulip} style={styles.bgFlower4} />
        <Image source={BG_IMAGES.bee} style={styles.bgBee} />
        <Image source={BG_IMAGES.ladybug} style={styles.bgLadybug} />
      </View>

      {/* Mute Button - Top Right */}
      <MuteButton style={{ position: 'absolute', right: 15, top: insets.top + 15, zIndex: 100 }} size="medium" />

      {/* Header */}
      <View style={[styles.header, { marginTop: insets.top + 10 }]}>
        <TouchableOpacity onPress={() => { handleStop(); navigation.goBack(); }} style={styles.backBtn}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>🎵 ABC Songs</Text>
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
          />
        ))}

        {/* Fun Footer */}
        <View style={styles.footer}>
          <View style={styles.footerIcons}>
            <Image source={BG_IMAGES.musicNote} style={styles.footerIcon} resizeMode="contain" />
            <Image source={BG_IMAGES.star} style={styles.footerIcon} resizeMode="contain" />
            <Image source={BG_IMAGES.musicalNotes} style={styles.footerIcon} resizeMode="contain" />
          </View>
          <Text style={styles.footerSubtext}>Keep Singing & Learning!</Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#87CEEB',
  },
  skyBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: height * 0.75,
    backgroundColor: '#87CEEB',
  },
  bgSun: {
    position: 'absolute',
    top: 40,
    right: 20,
    width: 60,
    height: 60,
  },
  bgCloud1: {
    position: 'absolute',
    top: 70,
    left: 10,
    width: 50,
    height: 50,
    opacity: 0.9,
  },
  bgCloud2: {
    position: 'absolute',
    top: 50,
    left: width * 0.35,
    width: 45,
    height: 45,
    opacity: 0.8,
  },
  bgCloud3: {
    position: 'absolute',
    top: 90,
    right: 80,
    width: 40,
    height: 40,
    opacity: 0.7,
  },
  bgRainbow: {
    position: 'absolute',
    top: 120,
    left: width * 0.3,
    width: 70,
    height: 70,
    opacity: 0.6,
  },
  bgStar1: {
    position: 'absolute',
    top: 100,
    left: 50,
    width: 25,
    height: 25,
    opacity: 0.7,
  },
  bgStar2: {
    position: 'absolute',
    top: 140,
    right: 40,
    width: 20,
    height: 20,
    opacity: 0.6,
  },
  bgSparkle1: {
    position: 'absolute',
    top: 160,
    left: 30,
    width: 22,
    height: 22,
    opacity: 0.7,
  },
  bgSparkle2: {
    position: 'absolute',
    top: 130,
    right: 120,
    width: 18,
    height: 18,
    opacity: 0.6,
  },
  bgBird1: {
    position: 'absolute',
    top: 80,
    left: width * 0.6,
    width: 30,
    height: 30,
  },
  bgBird2: {
    position: 'absolute',
    top: 110,
    left: width * 0.7,
    width: 25,
    height: 25,
    opacity: 0.8,
  },
  bgButterfly: {
    position: 'absolute',
    top: 180,
    right: 30,
    width: 35,
    height: 35,
  },
  bgMusic1: {
    position: 'absolute',
    top: 155,
    left: width * 0.15,
    width: 30,
    height: 30,
    opacity: 0.7,
  },
  bgMusic2: {
    position: 'absolute',
    top: 100,
    right: 100,
    width: 25,
    height: 25,
    opacity: 0.6,
  },
  grassBackground: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: height * 0.25,
    backgroundColor: '#7CCD7C',
    borderTopLeftRadius: 50,
    borderTopRightRadius: 50,
  },
  bgTree1: {
    position: 'absolute',
    top: -30,
    left: 10,
    width: 50,
    height: 50,
  },
  bgTree2: {
    position: 'absolute',
    top: -25,
    right: 15,
    width: 45,
    height: 45,
  },
  bgFlower1: {
    position: 'absolute',
    top: 20,
    left: 60,
    width: 30,
    height: 30,
  },
  bgFlower2: {
    position: 'absolute',
    top: 30,
    left: 120,
    width: 28,
    height: 28,
  },
  bgFlower3: {
    position: 'absolute',
    top: 25,
    right: 80,
    width: 30,
    height: 30,
  },
  bgFlower4: {
    position: 'absolute',
    top: 35,
    right: 130,
    width: 26,
    height: 26,
  },
  bgBee: {
    position: 'absolute',
    top: 10,
    left: width * 0.4,
    width: 28,
    height: 28,
  },
  bgLadybug: {
    position: 'absolute',
    top: 45,
    right: 60,
    width: 25,
    height: 25,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    marginBottom: 10,
    zIndex: 10,
  },
  backBtn: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 20,
  },
  backText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.purple,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#fff',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  headerSpace: { width: 80 },
  instructionBox: {
    backgroundColor: '#FFD700',
    marginHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    alignItems: 'center',
    marginBottom: 10,
    zIndex: 10,
  },
  instructionText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#333',
  },
  songsContainer: {
    paddingHorizontal: 15,
    paddingBottom: 50,
    paddingTop: 30,
  },
  songCard: {
    backgroundColor: '#fff',
    borderRadius: 22,
    marginBottom: 20,
    borderWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
    overflow: 'visible',
  },
  songTouchable: {
    padding: 20,
    paddingTop: 40,
  },
  balloonContainer: {
    position: 'absolute',
    top: -35,
    left: 20,
    alignItems: 'center',
  },
  balloon: {
    width: 55,
    height: 65,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  balloonEmoji: {
    fontSize: 28,
  },
  balloonTail: {
    width: 0,
    height: 0,
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderTopWidth: 12,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    marginTop: -1,
  },
  balloonString: {
    width: 2,
    height: 20,
    backgroundColor: '#888',
  },
  songHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginLeft: 50,
  },
  songTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: '800',
  },
  expandBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  expandText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  lyricsContainer: {
    marginTop: 20,
  },
  lyricsBox: {
    backgroundColor: '#F0F8FF',
    borderRadius: 18,
    padding: 18,
    borderWidth: 3,
    borderColor: '#E0E8F0',
  },
  lyricsText: {
    fontSize: 17,
    lineHeight: 26,
    color: '#333',
    textAlign: 'center',
    fontWeight: '500',
  },
  playButton: {
    marginTop: 15,
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderRadius: 25,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  playButtonIcon: {
    width: 24,
    height: 24,
    tintColor: '#fff',
  },
  playButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  notesRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 18,
    paddingHorizontal: 20,
  },
  noteImage: {
    width: 32,
    height: 32,
  },
  footer: {
    alignItems: 'center',
    marginTop: 20,
    paddingVertical: 20,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 25,
    marginHorizontal: 10,
  },
  footerIcons: {
    flexDirection: 'row',
    gap: 25,
    marginBottom: 10,
  },
  footerIcon: {
    width: 40,
    height: 40,
  },
  footerSubtext: {
    fontSize: 18,
    color: COLORS.purple,
    fontWeight: '700',
  },
});
