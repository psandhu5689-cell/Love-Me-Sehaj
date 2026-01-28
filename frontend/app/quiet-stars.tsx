import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import { useTheme } from './theme/ThemeContext';

const { width, height } = Dimensions.get('window');
const WHISPER_AUDIO = 'https://customer-assets.emergentagent.com/job_sehaj-love/artifacts/n3ojmbeq_e6d8893a.mp3';

const generateStars = (count: number) => {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    left: Math.random() * width,
    top: Math.random() * height,
    size: Math.random() * 3 + 1,
    opacity: Math.random() * 0.5 + 0.3,
    twinkleDelay: Math.random() * 2000,
  }));
};

const STARS = generateStars(100);

export default function QuietStars() {
  const { colors, isDark } = useTheme();
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const textFadeAnim = useRef(new Animated.Value(0)).current;
  const starAnims = useRef(STARS.map(() => new Animated.Value(0.3))).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 2000,
      useNativeDriver: true,
    }).start();

    setTimeout(() => {
      Animated.timing(textFadeAnim, {
        toValue: 1,
        duration: 1500,
        useNativeDriver: true,
      }).start();
    }, 1000);

    starAnims.forEach((anim, index) => {
      const twinkle = () => {
        Animated.sequence([
          Animated.timing(anim, {
            toValue: 1,
            duration: 1000 + Math.random() * 1000,
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: 0.3,
            duration: 1000 + Math.random() * 1000,
            useNativeDriver: true,
          }),
        ]).start(() => twinkle());
      };
      setTimeout(twinkle, STARS[index].twinkleDelay);
    });

    loadAudio();

    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, []);

  const loadAudio = async () => {
    try {
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        shouldDuckAndroid: true,
      });

      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: WHISPER_AUDIO },
        { shouldPlay: false, volume: 1.0 }
      );
      setSound(newSound);
    } catch (error) {
      console.log('Error loading whisper audio:', error);
    }
  };

  const togglePlay = async () => {
    if (!sound) return;

    if (isPlaying) {
      await sound.pauseAsync();
      setIsPlaying(false);
    } else {
      await sound.playAsync();
      setIsPlaying(true);
    }
  };

  // This page always uses dark mode for the starry effect
  const starBgColor = '#0a0a1a';
  const starTextColor = 'rgba(255,255,255,0.9)';

  return (
    <Animated.View style={[styles.container, { backgroundColor: starBgColor, opacity: fadeAnim }]}>
      <SafeAreaView style={styles.safeArea}>
        {STARS.map((star, index) => (
          <Animated.View
            key={star.id}
            style={[
              styles.star,
              {
                left: star.left,
                top: star.top,
                width: star.size,
                height: star.size,
                opacity: starAnims[index],
              },
            ]}
          />
        ))}

        <View style={styles.shootingStar1} />
        <View style={styles.shootingStar2} />

        <Animated.View style={[styles.content, { opacity: textFadeAnim }]}>
          <Ionicons name="volume-high" size={40} color="rgba(255,255,255,0.6)" />
          
          <Text style={[styles.title, { color: starTextColor }]}>volume up</Text>
          <Text style={styles.subtitle}>i'm whispering...</Text>

          <TouchableOpacity
            style={[styles.playButton, { borderColor: 'rgba(255,255,255,0.3)' }]}
            onPress={togglePlay}
            activeOpacity={0.8}
          >
            <Ionicons
              name={isPlaying ? "pause" : "play"}
              size={50}
              color="#FFFFFF"
            />
          </TouchableOpacity>

          <Text style={styles.hint}>
            {isPlaying ? "listening..." : "tap to hear my voice"}
          </Text>

          <View style={styles.heartContainer}>
            <Ionicons name="heart" size={20} color="rgba(232,99,143,0.5)" />
          </View>
        </Animated.View>

        <Animated.View style={[styles.bottomContainer, { opacity: textFadeAnim }]}>
          <Text style={styles.bottomText}>for you, always 💕</Text>
        </Animated.View>
      </SafeAreaView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  star: {
    position: 'absolute',
    backgroundColor: '#FFFFFF',
    borderRadius: 50,
  },
  shootingStar1: {
    position: 'absolute',
    top: '20%',
    left: '10%',
    width: 100,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.3)',
    transform: [{ rotate: '45deg' }],
  },
  shootingStar2: {
    position: 'absolute',
    top: '60%',
    right: '20%',
    width: 80,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.2)',
    transform: [{ rotate: '45deg' }],
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: '300',
    marginTop: 20,
    letterSpacing: 4,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '300',
    color: 'rgba(255,255,255,0.6)',
    marginTop: 8,
    fontStyle: 'italic',
    letterSpacing: 2,
  },
  playButton: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(232,99,143,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 50,
    borderWidth: 2,
  },
  hint: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.4)',
    marginTop: 20,
    fontStyle: 'italic',
  },
  heartContainer: {
    marginTop: 40,
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 50,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  bottomText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.4)',
    fontStyle: 'italic',
  },
});
