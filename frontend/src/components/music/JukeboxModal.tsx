import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeContext';
import { useMusic, PLAYLIST } from '../../context/MusicContext';
import * as Haptics from 'expo-haptics';

interface JukeboxModalProps {
  visible: boolean;
  onClose: () => void;
}

export const JukeboxModal: React.FC<JukeboxModalProps> = ({ visible, onClose }) => {
  const { colors, isDark } = useTheme();
  const { currentTrackIndex, isPlaying, isMuted, playTrack, toggleMute } = useMusic();

  const handleSelectTrack = (index: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    playTrack(index);
  };

  const handleClose = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={handleClose}
      >
        <TouchableOpacity activeOpacity={1} onPress={() => {}}>
          <View
            style={[
              styles.modalContent,
              {
                backgroundColor: isDark ? 'rgba(20, 20, 27, 0.95)' : 'rgba(255, 255, 255, 0.95)',
                borderColor: colors.border,
              },
            ]}
          >
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.headerLeft}>
                <Ionicons name="musical-notes" size={24} color={colors.primary} />
                <Text style={[styles.title, { color: colors.textPrimary }]}>Jukebox</Text>
              </View>
              <TouchableOpacity
                onPress={handleClose}
                style={[styles.closeButton, { backgroundColor: colors.card }]}
              >
                <Ionicons name="close" size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            {/* Track List */}
            <ScrollView style={styles.trackList} showsVerticalScrollIndicator={false}>
              {PLAYLIST.map((track, index) => {
                const isCurrentTrack = index === currentTrackIndex;
                const isPlayingTrack = isCurrentTrack && isPlaying && !isMuted;
                
                return (
                  <TouchableOpacity
                    key={track.id}
                    style={[
                      styles.trackItem,
                      {
                        backgroundColor: isCurrentTrack ? colors.primaryGlow : 'transparent',
                        borderColor: isCurrentTrack ? colors.primary : colors.border,
                      },
                    ]}
                    onPress={() => handleSelectTrack(index)}
                    activeOpacity={0.7}
                  >
                    {/* Track Number */}
                    <View
                      style={[
                        styles.trackNumber,
                        {
                          backgroundColor: isCurrentTrack ? colors.primary : colors.card,
                        },
                      ]}
                    >
                      {isPlayingTrack ? (
                        <Ionicons name="musical-notes" size={14} color="#FFFFFF" />
                      ) : (
                        <Text
                          style={[
                            styles.trackNumberText,
                            { color: isCurrentTrack ? '#FFFFFF' : colors.textSecondary },
                          ]}
                        >
                          {index + 1}
                        </Text>
                      )}
                    </View>

                    {/* Track Info */}
                    <View style={styles.trackInfo}>
                      <Text
                        style={[
                          styles.trackTitle,
                          { color: isCurrentTrack ? colors.primary : colors.textPrimary },
                        ]}
                        numberOfLines={1}
                      >
                        {track.title}
                      </Text>
                      <Text
                        style={[styles.trackArtist, { color: colors.textMuted }]}
                        numberOfLines={1}
                      >
                        {track.artist}
                      </Text>
                    </View>

                    {/* Play Icon */}
                    <View style={styles.playIcon}>
                      <Ionicons
                        name={isPlayingTrack ? 'pause' : 'play'}
                        size={20}
                        color={isCurrentTrack ? colors.primary : colors.textMuted}
                      />
                    </View>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* Now Playing Info */}
            <View style={[styles.footer, { borderTopColor: colors.border }]}>
              <View style={styles.footerContent}>
                <Ionicons
                  name={isPlaying && !isMuted ? 'volume-high' : 'volume-mute'}
                  size={16}
                  color={colors.textMuted}
                />
                <Text style={[styles.footerText, { color: colors.textMuted }]}>
                  {isPlaying && !isMuted ? 'Now Playing' : isMuted ? 'Muted' : 'Paused'}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  toggleMute();
                }}
                style={[
                  styles.muteButton,
                  {
                    backgroundColor: isMuted ? colors.primaryGlow : colors.card,
                    borderColor: isMuted ? colors.primary : colors.border,
                  },
                ]}
              >
                <Ionicons
                  name={isMuted ? 'volume-mute' : 'volume-high'}
                  size={18}
                  color={isMuted ? colors.primary : colors.textSecondary}
                />
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    width: 320,
    maxHeight: 480,
    borderRadius: 24,
    borderWidth: 1,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    paddingBottom: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  trackList: {
    maxHeight: 300,
    paddingHorizontal: 16,
  },
  trackItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
  },
  trackNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  trackNumberText: {
    fontSize: 12,
    fontWeight: '600',
  },
  trackInfo: {
    flex: 1,
  },
  trackTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  trackArtist: {
    fontSize: 12,
  },
  playIcon: {
    marginLeft: 8,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderTopWidth: 1,
  },
  footerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  footerText: {
    fontSize: 13,
  },
  muteButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
});

export default JukeboxModal;
