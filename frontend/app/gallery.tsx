import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Dimensions,
  Animated,
  Modal,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Audio, Video, ResizeMode } from 'expo-av';
import { BlurView } from 'expo-blur';
import { useTheme } from '../src/theme/ThemeContext';
import { ThemedBackground } from '../src/components/themed';
import { useMusic } from '../src/context/MusicContext';
import * as Haptics from 'expo-haptics';

const { width, height } = Dimensions.get('window');
const TILE_WIDTH = (width - 48) / 2;

// Video URLs from HeartVideo component
const VIDEOS = [
  'https://customer-assets.emergentagent.com/job_romance-theme/artifacts/04jb8vk3_5744FE7D-DE20-40FB-94A9-C39CB3EDC595.MOV',
  'https://customer-assets.emergentagent.com/job_romance-theme/artifacts/5qfbtsdz_4AC0D8EE-3674-4B81-B9A7-B6D93624CD39.MOV',
  'https://customer-assets.emergentagent.com/job_romance-theme/artifacts/ep4xd9gw_7AE7E78A-C9AA-4437-B148-3644D4D18B0D.MOV',
  'https://customer-assets.emergentagent.com/job_romance-theme/artifacts/iyxch1nu_ACAF7C77-F271-4132-9484-CA469D89580D.MOV',
  'https://customer-assets.emergentagent.com/job_romance-theme/artifacts/cfyjmwjq_F42C870F-FAA3-401C-8272-6260F51FBD2A.MOV',
  'https://customer-assets.emergentagent.com/job_add-this-1/artifacts/zr6k5md8_6ED17C90-F068-4114-862A-9C69C98D65D1.MOV',
];

// Memory entries with videos and songs
const GALLERY_ITEMS = [
  {
    id: '1',
    type: 'video',
    media: VIDEOS[0],
    title: 'Golden Memories',
    song: {
      title: 'Our Song',
      uri: 'https://customer-assets.emergentagent.com/job_sehaj-love/artifacts/yavk7xux_efeed8b5.mp3',
    },
  },
  {
    id: '2',
    type: 'video',
    media: VIDEOS[1],
    title: 'Sweet Moments',
    song: {
      title: 'Forever Yours',
      uri: 'https://customer-assets.emergentagent.com/job_sehaj-love/artifacts/yavk7xux_efeed8b5.mp3',
    },
  },
  {
    id: '3',
    type: 'video',
    media: VIDEOS[2],
    title: 'Together Always',
    song: {
      title: 'Love Story',
      uri: 'https://customer-assets.emergentagent.com/job_sehaj-love/artifacts/yavk7xux_efeed8b5.mp3',
    },
  },
  {
    id: '4',
    type: 'video',
    media: VIDEOS[3],
    title: 'Beautiful Days',
    song: {
      title: 'Dreaming',
      uri: 'https://customer-assets.emergentagent.com/job_sehaj-love/artifacts/yavk7xux_efeed8b5.mp3',
    },
  },
  {
    id: '5',
    type: 'video',
    media: VIDEOS[4],
    title: 'Our Love',
    song: {
      title: 'Heartbeat',
      uri: 'https://customer-assets.emergentagent.com/job_sehaj-love/artifacts/yavk7xux_efeed8b5.mp3',
    },
  },
  {
    id: '6',
    type: 'video',
    media: VIDEOS[5],
    title: 'Forever Us',
    song: {
      title: 'Endless',
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

export default function Gallery() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const { toggleMute, isMuted } = useMusic();
  
  const [selectedItem, setSelectedItem] = useState<GalleryItemType | null>(null);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const modalAnim = useRef(new Animated.Value(0)).current;
  const wasMutedRef = useRef(isMuted);

  useEffect(() => {
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
      if (sound) {
        sound.stopAsync();
        sound.unloadAsync();
      }
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

  const openFullscreen = async (item: GalleryItemType) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSelectedItem(item);
    
    // Animate modal in
    Animated.spring(modalAnim, {
      toValue: 1,
      tension: 50,
      friction: 8,
      useNativeDriver: true,
    }).start();

    // Load and play the song
    try {
      if (sound) {
        await sound.stopAsync();
        await sound.unloadAsync();
      }

      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: item.song.uri },
        { shouldPlay: true }
      );

      newSound.setOnPlaybackStatusUpdate((status: any) => {
        if (status.isLoaded) {
          setPosition(status.positionMillis || 0);
          setDuration(status.durationMillis || 0);
          setIsPlaying(status.isPlaying);
          
          if (status.didJustFinish) {
            setIsPlaying(false);
          }
        }
      });

      setSound(newSound);
      setIsPlaying(true);
    } catch (error) {
      console.log('Error playing sound:', error);
    }
  };

  const closeFullscreen = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    // Stop music
    if (sound) {
      await sound.stopAsync();
      await sound.unloadAsync();
      setSound(null);
    }
    setIsPlaying(false);
    setPosition(0);
    setDuration(0);

    // Animate out
    Animated.timing(modalAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setSelectedItem(null);
    });
  };

  const togglePlayPause = async () => {
    if (!sound) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    if (isPlaying) {
      await sound.pauseAsync();
    } else {
      await sound.playAsync();
    }
  };

  const handleBack = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (sound) {
      await sound.stopAsync();
      await sound.unloadAsync();
    }
    router.back();
  };

  const renderItem = ({ item }: { item: GalleryItemType }) => {
    return (
      <TouchableOpacity 
        style={[styles.tile, { backgroundColor: colors.card, borderColor: colors.border }]}
        onPress={() => openFullscreen(item)}
        activeOpacity={0.9}
      >
        <View style={styles.mediaContainer}>
          <Video
            source={{ uri: item.media }}
            style={styles.media}
            resizeMode={ResizeMode.COVER}
            shouldPlay={true}
            isLooping={true}
            isMuted={true}
          />
          
          <View style={styles.playOverlay}>
            <View style={[styles.playCircle, { backgroundColor: colors.primary }]}>
              <Ionicons name="play" size={20} color="#FFFFFF" style={{ marginLeft: 2 }} />
            </View>
          </View>
        </View>

        <View style={styles.tileInfo}>
          <Text style={[styles.tileTitle, { color: colors.textPrimary }]} numberOfLines={1}>
            {item.title}
          </Text>
          <Text style={[styles.tileSong, { color: colors.textMuted }]} numberOfLines={1}>
            🎵 {item.song.title}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const progress = duration > 0 ? position / duration : 0;

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

        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Tap a memory to play 💕
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

        {/* Fullscreen Modal */}
        <Modal visible={!!selectedItem} transparent animationType="none">
          <View style={styles.modalOverlay}>
            <BlurView intensity={isDark ? 80 : 90} style={StyleSheet.absoluteFill} tint={isDark ? 'dark' : 'light'} />
            
            <Animated.View 
              style={[
                styles.modalContent,
                {
                  opacity: modalAnim,
                  transform: [
                    { scale: modalAnim.interpolate({ inputRange: [0, 1], outputRange: [0.8, 1] }) }
                  ],
                }
              ]}
            >
              {/* Close button */}
              <TouchableOpacity style={styles.closeButton} onPress={closeFullscreen}>
                <View style={[styles.closeCircle, { backgroundColor: colors.card }]}>
                  <Ionicons name="close" size={28} color={colors.textPrimary} />
                </View>
              </TouchableOpacity>

              {/* Large Video */}
              <View style={[styles.fullscreenVideoContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
                {selectedItem && (
                  <Video
                    source={{ uri: selectedItem.media }}
                    style={styles.fullscreenVideo}
                    resizeMode={ResizeMode.COVER}
                    shouldPlay={true}
                    isLooping={true}
                    isMuted={true}
                  />
                )}
              </View>

              {/* Title */}
              <Text style={[styles.fullscreenTitle, { color: colors.textPrimary }]}>
                {selectedItem?.title}
              </Text>

              {/* Music Player */}
              <View style={[styles.musicPlayer, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <View style={styles.musicInfo}>
                  <Ionicons name="musical-notes" size={24} color={colors.primary} />
                  <Text style={[styles.musicTitle, { color: colors.textPrimary }]}>
                    {selectedItem?.song.title}
                  </Text>
                </View>

                {/* Progress Bar */}
                <View style={[styles.fullProgressBar, { backgroundColor: colors.border }]}>
                  <View 
                    style={[
                      styles.fullProgressFill, 
                      { backgroundColor: colors.primary, width: `${progress * 100}%` }
                    ]} 
                  />
                </View>

                {/* Time */}
                <View style={styles.timeContainer}>
                  <Text style={[styles.timeText, { color: colors.textMuted }]}>
                    {formatTime(position)}
                  </Text>
                  <Text style={[styles.timeText, { color: colors.textMuted }]}>
                    {formatTime(duration)}
                  </Text>
                </View>

                {/* Play/Pause Button */}
                <TouchableOpacity 
                  style={[styles.bigPlayButton, { backgroundColor: colors.primary }]}
                  onPress={togglePlayPause}
                  activeOpacity={0.8}
                >
                  <Ionicons 
                    name={isPlaying ? "pause" : "play"} 
                    size={32} 
                    color="#FFFFFF" 
                    style={isPlaying ? {} : { marginLeft: 4 }}
                  />
                </TouchableOpacity>
              </View>
            </Animated.View>
          </View>
        </Modal>
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
    paddingBottom: 40,
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
    height: TILE_WIDTH * 0.9,
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
    backgroundColor: 'rgba(0,0,0,0.15)',
  },
  playCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tileInfo: {
    padding: 10,
  },
  tileTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  tileSong: {
    fontSize: 12,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: width - 40,
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: -50,
    right: 0,
    zIndex: 10,
  },
  closeCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullscreenVideoContainer: {
    width: width - 60,
    height: width - 60,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 2,
  },
  fullscreenVideo: {
    width: '100%',
    height: '100%',
  },
  fullscreenTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginTop: 20,
    textAlign: 'center',
  },
  musicPlayer: {
    width: '100%',
    marginTop: 20,
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
  },
  musicInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
  },
  musicTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  fullProgressBar: {
    width: '100%',
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  fullProgressFill: {
    height: '100%',
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 8,
  },
  timeText: {
    fontSize: 12,
  },
  bigPlayButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
});
