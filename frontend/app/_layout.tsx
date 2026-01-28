import React, { createContext, useState, useContext, useEffect, useRef } from 'react';
import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { View, TouchableOpacity, StyleSheet, Animated, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import soundManager from './utils/sounds';
import { ThemeProvider, useTheme } from './theme/ThemeContext';
import { ThemeToggle } from './components/themed';
import { MusicProvider, useMusic } from './context/MusicContext';
import { NowPlayingWidget, JukeboxModal } from './components/music';
import * as Haptics from 'expo-haptics';

interface UserContextType {
  userName: string;
  setUserName: (name: string) => void;
}

interface AudioContextType {
  isMuted: boolean;
  toggleMute: () => void;
  playPop: () => void;
  playClick: () => void;
  playSuccess: () => void;
  playMagic: () => void;
  playComplete: () => void;
  playDrumroll: () => void;
  playKiss: () => void;
}

const UserContext = createContext<UserContextType>({
  userName: 'Sehaj',
  setUserName: () => {},
});

const AudioContext = createContext<AudioContextType>({
  isMuted: false,
  toggleMute: () => {},
  playPop: () => {},
  playClick: () => {},
  playSuccess: () => {},
  playMagic: () => {},
  playComplete: () => {},
  playDrumroll: () => {},
  playKiss: () => {},
});

export const useUser = () => useContext(UserContext);
export const useAudio = () => useContext(AudioContext);

function MusicControls() {
  const { colors, isDark } = useTheme();
  const { isMuted, toggleMute } = useMusic();
  const [showJukebox, setShowJukebox] = useState(false);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!isMuted) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.05,
            duration: 1200,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1200,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isMuted]);

  const handleMutePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.9,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 3,
        useNativeDriver: true,
      }),
    ]).start();
    toggleMute();
  };

  return (
    <>
      <View style={[styles.controlsContainer, { backgroundColor: colors.glass }]}>
        {/* Now Playing Widget */}
        <NowPlayingWidget onPress={() => setShowJukebox(true)} />

        {/* Mute Toggle */}
        <Animated.View style={{ transform: [{ scale: Animated.multiply(pulseAnim, scaleAnim) }] }}>
          <TouchableOpacity
            style={[
              styles.controlButton,
              { 
                backgroundColor: colors.card,
                borderColor: colors.border,
                shadowColor: colors.primary,
              },
            ]}
            onPress={handleMutePress}
            activeOpacity={0.8}
          >
            <Ionicons
              name={isMuted ? 'volume-mute' : 'volume-high'}
              size={20}
              color={isMuted ? colors.textMuted : colors.primary}
            />
          </TouchableOpacity>
        </Animated.View>

        {/* Theme Toggle */}
        <ThemeToggle />
      </View>

      {/* Jukebox Modal */}
      <JukeboxModal visible={showJukebox} onClose={() => setShowJukebox(false)} />
    </>
  );
}

function AppContent() {
  const { colors, isDark } = useTheme();
  const [userName, setUserName] = useState('Sehaj');
  const { isMuted, toggleMute } = useMusic();

  useEffect(() => {
    const loadSounds = async () => {
      await soundManager.loadSounds();
    };
    loadSounds();

    return () => {
      soundManager.unloadAll();
    };
  }, []);

  useEffect(() => {
    soundManager.setMuted(isMuted);
  }, [isMuted]);

  const playPop = () => soundManager.playPop();
  const playClick = () => soundManager.playClick();
  const playSuccess = () => soundManager.playSuccess();
  const playMagic = () => soundManager.playMagic();
  const playComplete = () => soundManager.playComplete();
  const playDrumroll = () => soundManager.playDrumroll();
  const playKiss = () => soundManager.playKiss();

  return (
    <UserContext.Provider value={{ userName, setUserName }}>
      <AudioContext.Provider value={{ 
        isMuted, 
        toggleMute, 
        playPop, 
        playClick, 
        playSuccess, 
        playMagic, 
        playComplete,
        playDrumroll,
        playKiss
      }}>
        <SafeAreaProvider>
          <StatusBar style={isDark ? 'light' : 'dark'} />
          <Stack
            screenOptions={{
              headerShown: false,
              animation: 'fade',
              contentStyle: { backgroundColor: colors.background },
            }}
          />
          {/* Music Controls */}
          <MusicControls />
        </SafeAreaProvider>
      </AudioContext.Provider>
    </UserContext.Provider>
  );
}

function AppWithMusic() {
  return (
    <MusicProvider>
      <AppContent />
    </MusicProvider>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <AppWithMusic />
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  controlsContainer: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 50 : 30,
    left: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 8,
    borderRadius: 20,
    zIndex: 1000,
  },
  controlButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
});
