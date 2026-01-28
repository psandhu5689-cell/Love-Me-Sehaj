import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Easing,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Video, ResizeMode } from 'expo-av';
import { useTheme } from '../../theme/ThemeContext';
import { useMusic, PLAYLIST, ALBUM_ART_URL } from '../../context/MusicContext';
import * as Haptics from 'expo-haptics';

interface NowPlayingWidgetProps {
  onPress: () => void;
}

export const NowPlayingWidget: React.FC<NowPlayingWidgetProps> = ({ onPress }) => {
  const { colors, isDark } = useTheme();
  const { currentTrack, currentTrackIndex, isPlaying, isMuted, progress, duration } = useMusic();
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const titleFadeAnim = useRef(new Animated.Value(1)).current;
  const [displayTitle, setDisplayTitle] = useState(currentTrack.title);
  const rotationRef = useRef<Animated.CompositeAnimation | null>(null);

  // CD rotation animation
  useEffect(() => {
    if (isPlaying && !isMuted) {
      // Start rotation
      rotationRef.current = Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 8000,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      );
      rotationRef.current.start();
    } else {
      // Stop rotation
      if (rotationRef.current) {
        rotationRef.current.stop();
      }
    }

    return () => {
      if (rotationRef.current) {
        rotationRef.current.stop();
      }
    };
  }, [isPlaying, isMuted]);

  // Title fade animation when track changes
  useEffect(() => {
    // Fade out
    Animated.timing(titleFadeAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setDisplayTitle(currentTrack.title);
      // Fade in
      Animated.timing(titleFadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    });
  }, [currentTrack.title]);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const progressPercent = duration > 0 ? (progress / duration) * 100 : 0;

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.9}
      style={[
        styles.container,
        {
          backgroundColor: colors.glass,
          borderColor: colors.border,
          shadowColor: colors.primary,
        },
      ]}
    >
      {/* Rotating CD */}
      <Animated.View
        style={[
          styles.cdContainer,
          { transform: [{ rotate: spin }] },
        ]}
      >
        <View style={[styles.cdOuter, { borderColor: colors.primary }]}>
          <View style={[styles.cdInner, { backgroundColor: colors.card }]}>
            <Video
              source={{ uri: ALBUM_ART_URL }}
              style={styles.albumArt}
              resizeMode={ResizeMode.COVER}
              shouldPlay={isPlaying && !isMuted}
              isLooping
              isMuted
            />
            <View style={[styles.cdHole, { backgroundColor: colors.background }]} />
          </View>
        </View>
      </Animated.View>

      {/* Track Info */}
      <View style={styles.infoContainer}>
        <Animated.Text
          numberOfLines={1}
          style={[
            styles.trackTitle,
            { color: colors.textPrimary, opacity: titleFadeAnim },
          ]}
        >
          {displayTitle}
        </Animated.Text>
        
        {/* Progress bar */}
        <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${progressPercent}%`,
                backgroundColor: colors.primary,
              },
            ]}
          />
        </View>
        
        <Text style={[styles.trackNumber, { color: colors.textMuted }]}>
          Track {currentTrackIndex + 1} of {PLAYLIST.length}
        </Text>
      </View>

      {/* Playing indicator */}
      {isPlaying && !isMuted && (
        <View style={styles.playingIndicator}>
          <Ionicons name="musical-notes" size={12} color={colors.primary} />
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 16,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
    gap: 10,
  },
  cdContainer: {
    width: 44,
    height: 44,
  },
  cdOuter: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  cdInner: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  albumArt: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  cdHole: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  infoContainer: {
    flex: 1,
    maxWidth: 120,
  },
  trackTitle: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  progressBar: {
    height: 3,
    borderRadius: 1.5,
    overflow: 'hidden',
    marginBottom: 4,
  },
  progressFill: {
    height: '100%',
    borderRadius: 1.5,
  },
  trackNumber: {
    fontSize: 10,
  },
  playingIndicator: {
    position: 'absolute',
    top: 4,
    right: 4,
  },
});

export default NowPlayingWidget;
