import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Dimensions,
  Image,
  Animated,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Audio, Video, ResizeMode } from 'expo-av';
import { useTheme } from '../src/theme/ThemeContext';
import { ThemedBackground } from '../src/components/themed';
import { useMusic } from '../src/context/MusicContext';
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get('window');
const TILE_WIDTH = (width - 48) / 2;

// Memory entries with photos/videos and songs
const GALLERY_ITEMS = [
  {
    id: '1',
    type: 'image',
    media: 'https://customer-assets.emergentagent.com/job_love-adventure-49/artifacts/grh04hmp_IMG_5616.jpeg',
    title: 'Golden Memories',
    song: {
      title: 'Our Song',
      uri: 'https://customer-assets.emergentagent.com/job_sehaj-love/artifacts/yavk7xux_efeed8b5.mp3',
    },
  },
  {
    id: '2',
    type: 'image',
    media: 'https://customer-assets.emergentagent.com/job_love-adventure-49/artifacts/grh04hmp_IMG_5616.jpeg',
    title: 'Sweet Moments',
    song: {
      title: 'Forever Yours',
      uri: 'https://customer-assets.emergentagent.com/job_sehaj-love/artifacts/yavk7xux_efeed8b5.mp3',
    },
  },
  {
    id: '3',
    type: 'image',
    media: 'https://customer-assets.emergentagent.com/job_love-adventure-49/artifacts/grh04hmp_IMG_5616.jpeg',
    title: 'Together Always',
    song: {
      title: 'Love Story',
      uri: 'https://customer-assets.emergentagent.com/job_sehaj-love/artifacts/yavk7xux_efeed8b5.mp3',
    },
  },
  {
    id: '4',
    type: 'image',
    media: 'https://customer-assets.emergentagent.com/job_love-adventure-49/artifacts/grh04hmp_IMG_5616.jpeg',
    title: 'Beautiful Days',
    song: {
      title: 'Dreaming',
      uri: 'https://customer-assets.emergentagent.com/job_sehaj-love/artifacts/yavk7xux_efeed8b5.mp3',
    },
  },
];

interface GalleryItemType {
  id: string;
  type: 'image' | 'video';
  media: string;
  title: string;
  song: {
    title: string;
    uri: string;
  };
}

interface MusicPlayerState {
  [key: string]: {
    sound: Audio.Sound | null;
    isPlaying: boolean;
    position: number;
    duration: number;
  };
}

export default function Gallery() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const { toggleMute, isMuted } = useMusic();
  
  const [playerStates, setPlayerStates] = useState<MusicPlayerState>({});
  const [currentlyPlayingId, setCurrentlyPlayingId] = useState<string | null>(null);
  const [lastPlayedId, setLastPlayedId] = useState<string | null>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const wasMutedRef = useRef(isMuted);

  useEffect(() => {
    // Store original mute state and mute background music
    wasMutedRef.current = isMuted;
    if (!isMuted) {
      toggleMute();
    }

    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();

    return () => {
      // Cleanup all sounds on unmount
      Object.values(playerStates).forEach(async (state) => {
        if (state.sound) {
          await state.sound.stopAsync();
          await state.sound.unloadAsync();
        }
      });
      // Restore music when leaving
      if (!wasMutedRef.current) {
        toggleMute();
      }
    };
  }, []);

  const formatTime = (ms: number): string => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const loadSound = async (item: GalleryItemType): Promise<Audio.Sound | null> => {
    try {
      const { sound } = await Audio.Sound.createAsync(
        { uri: item.song.uri },
        { shouldPlay: false }
      );
      return sound;
    } catch (error) {
      console.log('Error loading sound:', error);
      return null;
    }
  };

  const handlePlayPause = async (item: GalleryItemType) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    const currentState = playerStates[item.id];
    
    // If another tile is playing, pause it first
    if (currentlyPlayingId && currentlyPlayingId !== item.id) {
      const otherState = playerStates[currentlyPlayingId];
      if (otherState?.sound) {
        await otherState.sound.pauseAsync();
        setPlayerStates(prev => ({
          ...prev,
          [currentlyPlayingId]: { ...prev[currentlyPlayingId], isPlaying: false }
        }));
      }
    }

    // If sound not loaded yet, load it
    if (!currentState?.sound) {
      const sound = await loadSound(item);
      if (!sound) return;

      sound.setOnPlaybackStatusUpdate((status: any) => {
        if (status.isLoaded) {
          setPlayerStates(prev => ({
            ...prev,
            [item.id]: {
              ...prev[item.id],
              position: status.positionMillis || 0,
              duration: status.durationMillis || 0,
              isPlaying: status.isPlaying,
            }
          }));
          
          if (status.didJustFinish) {
            setCurrentlyPlayingId(null);
          }
        }
      });

      await sound.playAsync();
      setPlayerStates(prev => ({
        ...prev,
        [item.id]: {
          sound,
          isPlaying: true,
          position: 0,
          duration: 0,
        }
      }));
      setCurrentlyPlayingId(item.id);
      setLastPlayedId(item.id);
      return;
    }

    // Toggle play/pause for existing sound
    if (currentState.isPlaying) {
      await currentState.sound.pauseAsync();
      setCurrentlyPlayingId(null);
    } else {
      await currentState.sound.playAsync();
      setCurrentlyPlayingId(item.id);
      setLastPlayedId(item.id);
    }
  };

  const handleSeek = async (item: GalleryItemType, value: number) => {
    const currentState = playerStates[item.id];
    if (currentState?.sound && currentState.duration > 0) {
      const position = value * currentState.duration;
      await currentState.sound.setPositionAsync(position);
    }
  };

  const handleBack = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    // Pause current playing
    if (currentlyPlayingId) {
      const state = playerStates[currentlyPlayingId];
      if (state?.sound) {
        await state.sound.pauseAsync();
      }
    }
    
    router.back();
  };

  const renderItem = ({ item }: { item: GalleryItemType }) => {
    const state = playerStates[item.id] || { isPlaying: false, position: 0, duration: 0 };
    const isPlaying = state.isPlaying;
    const progress = state.duration > 0 ? state.position / state.duration : 0;

    return (
      <View style={[styles.tile, { backgroundColor: colors.card, borderColor: colors.border }]}>
        {/* Media (Photo/Video as album art) */}
        <View style={styles.mediaContainer}>
          {item.type === 'video' ? (
            <Video
              source={{ uri: item.media }}
              style={styles.media}
              resizeMode={ResizeMode.COVER}
              shouldPlay={isPlaying}
              isLooping={false}
              isMuted={true}
            />
          ) : (
            <Image source={{ uri: item.media }} style={styles.media} />
          )}
          
          {/* Play overlay on image */}
          <TouchableOpacity 
            style={styles.playOverlay}
            onPress={() => handlePlayPause(item)}
            activeOpacity={0.8}
          >
            <View style={[styles.playCircle, { backgroundColor: colors.primary }]}>
              <Ionicons 
                name={isPlaying ? "pause" : "play"} 
                size={24} 
                color="#FFFFFF" 
                style={isPlaying ? {} : { marginLeft: 3 }}
              />
            </View>
          </TouchableOpacity>
        </View>

        {/* Music Player Bar */}
        <View style={styles.playerBar}>
          <Text style={[styles.songTitle, { color: colors.textPrimary }]} numberOfLines={1}>
            {item.song.title}
          </Text>
          
          <View style={styles.sliderContainer}>
            <Slider
              style={styles.slider}
              minimumValue={0}
              maximumValue={1}
              value={progress}
              onSlidingComplete={(value) => handleSeek(item, value)}
              minimumTrackTintColor={colors.primary}
              maximumTrackTintColor={colors.border}
              thumbTintColor={colors.primary}
            />
          </View>
          
          <View style={styles.timeRow}>
            <Text style={[styles.timeText, { color: colors.textMuted }]}>
              {formatTime(state.position)}
            </Text>
            <Text style={[styles.timeText, { color: colors.textMuted }]}>
              {formatTime(state.duration)}
            </Text>
          </View>
        </View>

        {/* Memory Title */}
        <Text style={[styles.memoryTitle, { color: colors.textSecondary }]} numberOfLines={1}>
          {item.title}
        </Text>
      </View>
    );
  };

  return (
    <ThemedBackground>
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={[styles.backButton, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={handleBack}
            activeOpacity={0.7}
          >
            <Ionicons name="chevron-back" size={24} color={colors.primary} />
          </TouchableOpacity>
          
          <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Gallery</Text>
          
          <View style={styles.headerRight}>
            <Ionicons name="images" size={24} color={colors.primary} />
          </View>
        </View>

        {/* Subtitle */}
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Our memories together 💕
        </Text>

        {/* Gallery Grid */}
        <Animated.View style={[styles.gridContainer, { opacity: fadeAnim }]}>
          <FlatList
            data={GALLERY_ITEMS}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            numColumns={2}
            columnWrapperStyle={styles.row}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.gridContent}
          />
        </Animated.View>

        {/* Now Playing Indicator */}
        {currentlyPlayingId && (
          <View style={[styles.nowPlaying, { backgroundColor: colors.primary }]}>
            <Ionicons name="musical-notes" size={16} color="#FFFFFF" />
            <Text style={styles.nowPlayingText}>
              Now Playing: {GALLERY_ITEMS.find(i => i.id === currentlyPlayingId)?.song.title}
            </Text>
          </View>
        )}
      </SafeAreaView>
    </ThemedBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
  },
  headerRight: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 16,
    fontStyle: 'italic',
  },
  gridContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  gridContent: {
    paddingBottom: 100,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  tile: {
    width: TILE_WIDTH,
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  mediaContainer: {
    width: '100%',
    height: TILE_WIDTH,
    position: 'relative',
  },
  media: {
    width: '100%',
    height: '100%',
  },
  playOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  playCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  playerBar: {
    padding: 10,
  },
  songTitle: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 4,
  },
  sliderContainer: {
    marginHorizontal: -6,
  },
  slider: {
    width: '100%',
    height: 20,
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: -4,
  },
  timeText: {
    fontSize: 10,
  },
  memoryTitle: {
    fontSize: 12,
    paddingHorizontal: 10,
    paddingBottom: 10,
    fontStyle: 'italic',
  },
  nowPlaying: {
    position: 'absolute',
    bottom: 30,
    left: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 25,
    gap: 8,
  },
  nowPlayingText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
});
