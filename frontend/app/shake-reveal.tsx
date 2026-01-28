import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Accelerometer } from 'expo-sensors';
import { LinearGradient } from 'expo-linear-gradient';
import { useAudio } from './_layout';
import { useTheme } from './theme/ThemeContext';
import { ThemedBackground, ThemedCard } from './components/themed';
import * as Haptics from 'expo-haptics';

const SHAKE_THRESHOLD = 1.5;

export default function ShakeReveal() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const { playClick, playSuccess, playComplete } = useAudio();
  const [isRevealed, setIsRevealed] = useState(false);
  const [shakeCount, setShakeCount] = useState(0);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const revealAnim = useRef(new Animated.Value(0)).current;
  const lastShake = useRef(0);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(shakeAnim, { toValue: 10, duration: 100, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -10, duration: 100, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 10, duration: 100, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 0, duration: 100, useNativeDriver: true }),
        Animated.delay(2000),
      ])
    ).start();

    let subscription: any;
    
    const setupAccelerometer = async () => {
      try {
        Accelerometer.setUpdateInterval(100);
        subscription = Accelerometer.addListener(({ x, y, z }) => {
          const acceleration = Math.sqrt(x * x + y * y + z * z);
          const now = Date.now();
          
          if (acceleration > SHAKE_THRESHOLD && now - lastShake.current > 500) {
            lastShake.current = now;
            handleShake();
          }
        });
      } catch (error) {
        console.log('Accelerometer not available');
      }
    };

    if (Platform.OS !== 'web') {
      setupAccelerometer();
    }

    return () => {
      if (subscription) {
        subscription.remove();
      }
    };
  }, []);

  const handleShake = () => {
    if (isRevealed) return;
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    playClick();
    setShakeCount(prev => {
      const newCount = prev + 1;
      if (newCount >= 3) {
        revealMessage();
      }
      return newCount;
    });
  };

  const revealMessage = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    playSuccess();
    setIsRevealed(true);
    Animated.spring(revealAnim, {
      toValue: 1,
      tension: 50,
      friction: 5,
      useNativeDriver: true,
    }).start();
  };

  const handleManualReveal = () => {
    if (!isRevealed) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      playClick();
      setShakeCount(prev => {
        const newCount = prev + 1;
        if (newCount >= 3) {
          revealMessage();
        }
        return newCount;
      });
    }
  };

  return (
    <ThemedBackground>
      <SafeAreaView style={styles.container}>
        <TouchableOpacity
          style={[styles.backButton, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={() => { playClick(); router.back(); }}
          activeOpacity={0.7}
        >
          <Ionicons name="chevron-back" size={24} color={colors.primary} />
        </TouchableOpacity>

        <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
          {!isRevealed ? (
            <>
              <Animated.View style={{ transform: [{ translateX: shakeAnim }] }}>
                <View style={[styles.iconContainer, { backgroundColor: colors.primaryGlow }]}>
                  <Ionicons name="phone-portrait-outline" size={80} color={colors.primary} />
                </View>
              </Animated.View>
              
              <Text style={[styles.title, { color: colors.textPrimary }]}>Shake To Reveal 📱</Text>
              <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Shake your phone to reveal a secret!</Text>
              
              <View style={styles.progressContainer}>
                {[0, 1, 2].map((i) => (
                  <View
                    key={i}
                    style={[
                      styles.shakeDot,
                      { borderColor: colors.primary },
                      shakeCount > i && { backgroundColor: colors.primary },
                    ]}
                  />
                ))}
              </View>
              <Text style={[styles.progressText, { color: colors.textSecondary }]}>{shakeCount} / 3 shakes</Text>
              
              {Platform.OS === 'web' && (
                <TouchableOpacity
                  onPress={handleManualReveal}
                  activeOpacity={0.9}
                  style={{ marginTop: 20 }}
                >
                  <LinearGradient
                    colors={colors.gradientPrimary as any}
                    style={[styles.shakeButton, { shadowColor: colors.primary }]}
                  >
                    <Text style={styles.shakeButtonText}>Tap to Shake!</Text>
                  </LinearGradient>
                </TouchableOpacity>
              )}
              
              <TouchableOpacity
                style={styles.skipButton}
                onPress={() => { playClick(); router.push('/nickname-carousel'); }}
                activeOpacity={0.8}
              >
                <Text style={[styles.skipButtonText, { color: colors.textSecondary }]}>Skip</Text>
                <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
              </TouchableOpacity>
            </>
          ) : (
            <Animated.View style={[styles.revealedContainer, { opacity: revealAnim, transform: [{ scale: revealAnim }] }]}>
              <View style={[styles.iconContainer, { backgroundColor: isDark ? 'rgba(255, 215, 0, 0.15)' : '#FFF9E6' }]}>
                <Ionicons name="sparkles" size={80} color="#FFD700" />
              </View>
              <Text style={[styles.revealedTitle, { color: colors.textPrimary }]}>Secret Revealed! ✨</Text>
              
              <ThemedCard variant="glow" glowColor={colors.primary}>
                <View style={{ alignItems: 'center' }}>
                  <Ionicons name="heart" size={40} color={colors.primary} />
                  <Text style={[styles.messageText, { color: colors.textPrimary }]}>
                    You shook things up in my life —{"\n"}
                    in the best way possible.{"\n\n"}
                    Before you, everything was still.{"\n"}
                    Now, my heart beats for you.{"\n\n"}
                    💕 I love you, always 💕
                  </Text>
                </View>
              </ThemedCard>
              
              <TouchableOpacity
                onPress={() => { playComplete(); router.push('/nickname-carousel'); }}
                activeOpacity={0.9}
                style={{ marginTop: 24 }}
              >
                <LinearGradient
                  colors={colors.gradientPrimary as any}
                  style={[styles.button, { shadowColor: colors.primary }]}
                >
                  <Text style={styles.buttonText}>Continue</Text>
                  <Ionicons name="chevron-forward" size={20} color="#FFFFFF" />
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>
          )}
        </Animated.View>
      </SafeAreaView>
    </ThemedBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 16,
    zIndex: 10,
    padding: 10,
    borderRadius: 20,
    borderWidth: 1,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  iconContainer: {
    width: 140,
    height: 140,
    borderRadius: 70,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '600',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 30,
  },
  progressContainer: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
  },
  shakeDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 3,
    backgroundColor: 'transparent',
  },
  progressText: {
    fontSize: 16,
    marginBottom: 20,
  },
  shakeButton: {
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },
  shakeButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  revealedContainer: {
    alignItems: 'center',
    padding: 20,
    width: '100%',
  },
  revealedTitle: {
    fontSize: 28,
    fontWeight: '600',
    marginBottom: 24,
  },
  messageText: {
    fontSize: 17,
    lineHeight: 28,
    textAlign: 'center',
    marginTop: 16,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 25,
    gap: 8,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  skipButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 30,
    paddingHorizontal: 20,
    paddingVertical: 10,
    gap: 4,
  },
  skipButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
});
