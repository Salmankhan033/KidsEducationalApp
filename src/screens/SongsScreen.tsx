import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Image,
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
import { useResponsiveLayout } from '../utils/useResponsiveLayout';

Sound.setCategory('Playback', true);

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
  isLandscape,
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
        isLandscape && styles.songCardLandscape,
      ]}
    >
      <TouchableOpacity onPress={onPress} style={[styles.songTouchable, isLandscape && styles.songTouchableLandscape]}>
        <Animated.View style={[
          styles.balloonContainer, 
          isLandscape && styles.balloonContainerLandscape,
          { transform: [{ translateY: bounceAnim.interpolate({ inputRange: [0, 1], outputRange: [0, -5] }) }] }
        ]}>
          <View style={[styles.balloon, { backgroundColor: song.color }, isLandscape && styles.balloonLandscape]}>
            <Text style={[styles.balloonEmoji, isLandscape && styles.balloonEmojiLandscape]}>{song.emoji}</Text>
          </View>
          <View style={[styles.balloonTail, { borderTopColor: song.color }]} />
          <View style={styles.balloonString} />
        </Animated.View>

        <View style={[styles.songHeader, isLandscape && styles.songHeaderLandscape]}>
          <Text style={[styles.songTitle, { color: song.color }, isLandscape && styles.songTitleLandscape]}>{song.title}</Text>
          <View style={[styles.expandBadge, { backgroundColor: song.color }, isLandscape && styles.expandBadgeLandscape]}>
            <Text style={[styles.expandText, isLandscape && styles.expandTextLandscape]}>{isExpanded ? '▲' : '▼'}</Text>
          </View>
        </View>
        
        {isExpanded && (
          <Animated.View style={[styles.lyricsContainer, { opacity: expandAnim }]}>
            <View style={[styles.lyricsBox, isLandscape && styles.lyricsBoxLandscape]}>
              <Text style={[styles.lyricsText, isLandscape && styles.lyricsTextLandscape]}>{song.lyrics}</Text>
            </View>
            
            <TouchableOpacity 
              onPress={isPlaying ? onStop : onPlay}
              style={[
                styles.playButton,
                { backgroundColor: isPlaying ? '#E74C3C' : '#27AE60' },
                isLandscape && styles.playButtonLandscape,
              ]}
            >
              <Image 
                source={isPlaying ? SCREEN_ICONS.stop : SCREEN_ICONS.play} 
                style={[styles.playButtonIcon, isLandscape && styles.playButtonIconLandscape]} 
                resizeMode="contain"
              />
              <Text style={[styles.playButtonText, isLandscape && styles.playButtonTextLandscape]}>
                {isPlaying ? 'Stop Singing' : 'Sing Along!'}
              </Text>
            </TouchableOpacity>
            
            <View style={[styles.notesRow, isLandscape && styles.notesRowLandscape]}>
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
                  <Image source={BG_IMAGES.musicNote} style={[styles.noteImage, isLandscape && styles.noteImageLandscape]} resizeMode="contain" />
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
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Background */}
      <View style={[styles.skyBackground, { height: height * 0.75 }]}>
        <Image source={BG_IMAGES.sun} style={[styles.bgElement, { top: 20, right: 20, width: 45, height: 45 }]} />
        <Image source={BG_IMAGES.cloud} style={[styles.bgElement, { top: 40, left: 20, width: 35, height: 35 }]} />
        <Image source={BG_IMAGES.rainbow} style={[styles.bgElement, { top: 60, left: '30%', width: 50, height: 50 }]} />
        <Image source={BG_IMAGES.star} style={[styles.bgElement, { top: 80, left: 50, width: 20, height: 20 }]} />
        <Image source={BG_IMAGES.musicNote} style={[styles.bgElement, { top: 100, right: 80, width: 25, height: 25 }]} />
        <Image source={BG_IMAGES.musicalNotes} style={[styles.bgElement, { top: 120, left: '15%', width: 25, height: 25 }]} />
      </View>

      {/* Grass */}
      <View style={[styles.grassBackground, { height: height * 0.25 }]}>
        <Image source={BG_IMAGES.tree} style={[styles.bgElement, { top: -20, left: 10, width: 40, height: 40 }]} />
        <Image source={BG_IMAGES.tree} style={[styles.bgElement, { top: -15, right: 15, width: 35, height: 35 }]} />
        <Image source={BG_IMAGES.flower} style={[styles.bgElement, { top: 15, left: 60, width: 25, height: 25 }]} />
        <Image source={BG_IMAGES.tulip} style={[styles.bgElement, { top: 20, right: 50, width: 22, height: 22 }]} />
      </View>

      {/* Mute Button */}
      <MuteButton 
        style={{ 
          position: 'absolute', 
          right: insets.right + 15, 
          top: insets.top + 10, 
          zIndex: 100 
        }} 
        size={isLandscape ? 'small' : 'medium'} 
      />

      {/* Header */}
      <View style={[
        styles.header, 
        { marginTop: insets.top + 10, paddingLeft: insets.left + 15, paddingRight: insets.right + 15 },
        isLandscape && styles.headerLandscape,
      ]}>
        <TouchableOpacity onPress={() => { handleStop(); navigation.goBack(); }} style={[styles.backBtn, isLandscape && styles.backBtnLandscape]}>
          <Text style={[styles.backText, isLandscape && styles.backTextLandscape]}>← Back</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, isLandscape && styles.headerTitleLandscape]}>🎵 ABC Songs</Text>
        <View style={styles.headerSpace} />
      </View>

      {/* Instructions */}
      <View style={[styles.instructionBox, isLandscape && styles.instructionBoxLandscape]}>
        <Text style={[styles.instructionText, isLandscape && styles.instructionTextLandscape]}>🎤 Tap a song to sing along! 🎤</Text>
      </View>

      {/* Songs List */}
      <ScrollView
        contentContainerStyle={[
          styles.songsContainer,
          { paddingLeft: insets.left + 15, paddingRight: insets.right + 15 },
          isLandscape && styles.songsContainerLandscape,
        ]}
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

        {!isLandscape && (
          <View style={styles.footer}>
            <View style={styles.footerIcons}>
              <Image source={BG_IMAGES.musicNote} style={styles.footerIcon} resizeMode="contain" />
              <Image source={BG_IMAGES.star} style={styles.footerIcon} resizeMode="contain" />
              <Image source={BG_IMAGES.musicalNotes} style={styles.footerIcon} resizeMode="contain" />
            </View>
            <Text style={styles.footerSubtext}>Keep Singing & Learning!</Text>
          </View>
        )}
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
    backgroundColor: '#87CEEB',
  },
  grassBackground: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#7CCD7C',
    borderTopLeftRadius: 50,
    borderTopRightRadius: 50,
  },
  bgElement: {
    position: 'absolute',
    opacity: 0.75,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
    zIndex: 10,
  },
  headerLandscape: {
    marginBottom: 6,
  },
  backBtn: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 20,
  },
  backBtnLandscape: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 15,
  },
  backText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.purple,
  },
  backTextLandscape: {
    fontSize: 14,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#fff',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  headerTitleLandscape: {
    fontSize: 18,
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
  instructionBoxLandscape: {
    paddingVertical: 6,
    marginHorizontal: 40,
    marginBottom: 6,
  },
  instructionText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#333',
  },
  instructionTextLandscape: {
    fontSize: 12,
  },
  songsContainer: {
    paddingBottom: 50,
    paddingTop: 30,
  },
  songsContainerLandscape: {
    paddingBottom: 20,
    paddingTop: 15,
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
  songCardLandscape: {
    borderRadius: 16,
    marginBottom: 15,
    borderWidth: 3,
  },
  songTouchable: {
    padding: 20,
    paddingTop: 40,
  },
  songTouchableLandscape: {
    padding: 15,
    paddingTop: 30,
  },
  balloonContainer: {
    position: 'absolute',
    top: -35,
    left: 20,
    alignItems: 'center',
  },
  balloonContainerLandscape: {
    top: -28,
    left: 15,
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
  balloonLandscape: {
    width: 42,
    height: 50,
    borderRadius: 21,
  },
  balloonEmoji: {
    fontSize: 28,
  },
  balloonEmojiLandscape: {
    fontSize: 22,
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
  songHeaderLandscape: {
    marginLeft: 40,
  },
  songTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: '800',
  },
  songTitleLandscape: {
    fontSize: 16,
  },
  expandBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  expandBadgeLandscape: {
    width: 30,
    height: 30,
    borderRadius: 15,
  },
  expandText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  expandTextLandscape: {
    fontSize: 14,
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
  lyricsBoxLandscape: {
    borderRadius: 14,
    padding: 12,
    borderWidth: 2,
  },
  lyricsText: {
    fontSize: 17,
    lineHeight: 26,
    color: '#333',
    textAlign: 'center',
    fontWeight: '500',
  },
  lyricsTextLandscape: {
    fontSize: 14,
    lineHeight: 22,
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
    marginTop: 18,
    paddingHorizontal: 20,
  },
  notesRowLandscape: {
    marginTop: 12,
    paddingHorizontal: 10,
  },
  noteImage: {
    width: 32,
    height: 32,
  },
  noteImageLandscape: {
    width: 24,
    height: 24,
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
