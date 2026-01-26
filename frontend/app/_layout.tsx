import React, { createContext, useState, useContext, useEffect, useRef } from 'react';
import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { View, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import soundManager from './utils/sounds';

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
});

export const useUser = () => useContext(UserContext);
export const useAudio = () => useContext(AudioContext);

function MuteButton({ isMuted, onToggle }: { isMuted: boolean; onToggle: () => void }) {
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!isMuted) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isMuted]);

  return (
    <TouchableOpacity
      style={styles.muteButton}
      onPress={onToggle}
      activeOpacity={0.8}
    >
      <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
        <Ionicons
          name={isMuted ? 'volume-mute' : 'musical-notes'}
          size={24}
          color="#FFFFFF"
        />
      </Animated.View>
    </TouchableOpacity>
  );
}

export default function RootLayout() {
  const [userName, setUserName] = useState('Sehaj');
  const [isMuted, setIsMuted] = useState(false);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function setupAudio() {
      try {
        // Configure audio mode
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          playsInSilentModeIOS: true,
          staysActiveInBackground: true,
          shouldDuckAndroid: true,
        });

        // Load background music
        const { sound: newSound } = await Audio.Sound.createAsync(
          { uri: MUSIC_URL },
          { 
            shouldPlay: true, 
            isLooping: true,
            volume: 0.7,
          }
        );

        if (isMounted) {
          setSound(newSound);
          setIsLoaded(true);
        }

        // Load UI sounds
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
        sound.setVolumeAsync(0.7);
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

  return (
    <UserContext.Provider value={{ userName, setUserName }}>
      <AudioContext.Provider value={{ 
        isMuted, 
        toggleMute, 
        playPop, 
        playClick, 
        playSuccess, 
        playMagic, 
        playComplete 
      }}>
        <SafeAreaProvider>
          <StatusBar style="dark" />
          <Stack
            screenOptions={{
              headerShown: false,
              animation: 'fade',
              contentStyle: { backgroundColor: '#FFF5F7' },
            }}
          />
          {/* Floating Mute Button */}
          <MuteButton isMuted={isMuted} onToggle={toggleMute} />
        </SafeAreaProvider>
      </AudioContext.Provider>
    </UserContext.Provider>
  );
}

const styles = StyleSheet.create({
  muteButton: {
    position: 'absolute',
    bottom: 40,
    left: 20,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#FF6B9D',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#FF6B9D',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 1000,
  },
});
