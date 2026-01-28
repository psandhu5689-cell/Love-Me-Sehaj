import React, { createContext, useState, useContext, useEffect, useRef } from 'react';
import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { View, TouchableOpacity, StyleSheet, Animated, Text, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import soundManager from './utils/sounds';
import { ThemeProvider, useTheme } from './theme/ThemeContext';
import { ThemeToggle } from './components/themed';
import * as Haptics from 'expo-haptics';

const MUSIC_URL = 'https://customer-assets.emergentagent.com/job_love-adventure-49/artifacts/230dit60_RealestK%20-%20It%27s%20Love%20%28Official%20Audio%29.mp3';

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

function FloatingControls({ isMuted, onToggleMute }: { isMuted: boolean; onToggleMute: () => void }) {
  const { colors, isDark } = useTheme();
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!isMuted) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.08,
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

  const handlePress = () => {
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
    onToggleMute();
  };

  return (
    <View style={[styles.controlsContainer, { backgroundColor: colors.glass }]}>
      {/* Music Toggle */}
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
          onPress={handlePress}
          activeOpacity={0.8}
        >
          <Ionicons
            name={isMuted ? 'volume-mute' : 'musical-notes'}
            size={20}
            color={isMuted ? colors.textMuted : colors.primary}
          />
        </TouchableOpacity>
      </Animated.View>

      {/* Theme Toggle */}
      <ThemeToggle />
    </View>
  );
}

function AppContent() {
  const { colors, isDark } = useTheme();
  const [userName, setUserName] = useState('Sehaj');
  const [isMuted, setIsMuted] = useState(false);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function setupAudio() {
      try {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          playsInSilentModeIOS: true,
          staysActiveInBackground: true,
          shouldDuckAndroid: true,
        });

        const { sound: newSound } = await Audio.Sound.createAsync(
          { uri: MUSIC_URL },
          { 
            shouldPlay: true, 
            isLooping: true,
            volume: 0.6,
          }
        );

        if (isMounted) {
          setSound(newSound);
          setIsLoaded(true);
        }

        await soundManager.loadSounds();
      } catch (error) {
        console.log('Error loading audio:', error);
      }
    }

    setupAudio();

    return () => {
      isMounted = false;
      if (sound) {
        sound.unloadAsync();
      }
      soundManager.unloadAll();
    };
  }, []);

  useEffect(() => {
    if (sound && isLoaded) {
      if (isMuted) {
        sound.setVolumeAsync(0);
      } else {
        sound.setVolumeAsync(0.6);
      }
    }
    soundManager.setMuted(isMuted);
  }, [isMuted, sound, isLoaded]);

  const toggleMute = () => {
    soundManager.playClick();
    setIsMuted(!isMuted);
  };

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
          {/* Floating Controls */}
          <FloatingControls isMuted={isMuted} onToggleMute={toggleMute} />
        </SafeAreaProvider>
      </AudioContext.Provider>
    </UserContext.Provider>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  controlsContainer: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 50 : 30,
    left: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 8,
    borderRadius: 24,
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
