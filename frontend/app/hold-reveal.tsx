import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAudio } from './_layout';
import { useTheme } from './theme/ThemeContext';
import { ThemedBackground, ThemedCard } from './components/themed';
import * as Haptics from 'expo-haptics';

export default function HoldReveal() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const { playClick, playSuccess, playComplete } = useAudio();
  const [holdProgress, setHoldProgress] = useState(0);
  const [isHolding, setIsHolding] = useState(false);
  const [isRevealed, setIsRevealed] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const revealAnim = useRef(new Animated.Value(0)).current;
  const progressInterval = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  const startHold = () => {
    if (isRevealed) return;
    setIsHolding(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    playClick();
    
    let progress = 0;
    progressInterval.current = setInterval(() => {
      progress += 2;
      setHoldProgress(progress);
      
      if (progress >= 100) {
        clearInterval(progressInterval.current!);
        setIsRevealed(true);
        setIsHolding(false);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        playSuccess();
        Animated.spring(revealAnim, {
          toValue: 1,
          tension: 50,
          friction: 5,
          useNativeDriver: true,
        }).start();
      }
    }, 100);
  };

  const endHold = () => {
    if (isRevealed) return;
    setIsHolding(false);
    if (progressInterval.current) {
      clearInterval(progressInterval.current);
    }
    if (!isRevealed) {
      setHoldProgress(0);
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
              <View style={[styles.iconContainer, { backgroundColor: colors.primaryGlow }]}>
                <Ionicons name="finger-print" size={80} color={colors.primary} />
              </View>
              <Text style={[styles.title, { color: colors.textPrimary }]}>Hold To Reveal 💕</Text>
              <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Press and hold for 5 seconds...</Text>
              
              <View style={styles.holdContainer}>
                <TouchableOpacity
                  style={[
                    styles.holdButton,
                    { backgroundColor: colors.card, shadowColor: colors.primary },
                    isHolding && { backgroundColor: colors.primaryGlow },
                  ]}
                  onPressIn={startHold}
                  onPressOut={endHold}
                  activeOpacity={1}
                >
                  <View style={styles.progressRing}>
                    <View 
                      style={[
                        styles.progressFill,
                        { 
                          height: `${holdProgress}%`,
                          backgroundColor: isHolding ? colors.primary : colors.primaryLight,
                        }
                      ]} 
                    />
                  </View>
                  <View style={styles.holdContent}>
                    <Ionicons 
                      name={isHolding ? "heart" : "hand-left"} 
                      size={50} 
                      color={isHolding ? "#FFFFFF" : colors.primary} 
                    />
                    <Text style={[styles.holdText, { color: isHolding ? '#FFFFFF' : colors.primary }]}>
                      {isHolding ? `${Math.round(holdProgress)}%` : 'Hold Here'}
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
              
              <Text style={[styles.hint, { color: colors.textMuted }]}>
                {isHolding ? "Keep holding..." : "I wanted to see if you would stay."}
              </Text>
              
              <TouchableOpacity
                style={styles.skipButton}
                onPress={() => { playClick(); router.push('/shake-reveal'); }}
                activeOpacity={0.8}
              >
                <Text style={[styles.skipButtonText, { color: colors.textSecondary }]}>Skip</Text>
                <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
              </TouchableOpacity>
            </>
          ) : (
            <Animated.View style={[styles.revealedContainer, { opacity: revealAnim, transform: [{ scale: revealAnim }] }]}>
              <View style={[styles.iconContainer, { backgroundColor: colors.primaryGlow }]}>
                <Ionicons name="heart" size={80} color={colors.primary} />
              </View>
              <Text style={[styles.revealedTitle, { color: colors.textPrimary }]}>You Stayed 💕</Text>
              
              <ThemedCard variant="glow" glowColor={colors.primary}>
                <Text style={[styles.messageText, { color: colors.textPrimary }]}>
                  "I wanted to see if you would stay."{"\n\n"}
                  And you did.{"\n\n"}
                  Just like you always do.{"\n"}
                  That's why I love you.
                </Text>
              </ThemedCard>
              
              <TouchableOpacity
                onPress={() => { playComplete(); router.push('/shake-reveal'); }}
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
    marginBottom: 40,
  },
  holdContainer: {
    marginVertical: 20,
  },
  holdButton: {
    width: 180,
    height: 180,
    borderRadius: 90,
    justifyContent: 'center',
    alignItems: 'center',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
    overflow: 'hidden',
  },
  progressRing: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    top: 0,
    justifyContent: 'flex-end',
  },
  progressFill: {
    width: '100%',
    borderRadius: 90,
  },
  holdContent: {
    alignItems: 'center',
    zIndex: 1,
  },
  holdText: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 8,
  },
  hint: {
    fontSize: 14,
    fontStyle: 'italic',
    marginTop: 20,
    textAlign: 'center',
  },
  revealedContainer: {
    alignItems: 'center',
    padding: 20,
    width: '100%',
  },
  revealedTitle: {
    fontSize: 32,
    fontWeight: '600',
    marginBottom: 24,
  },
  messageText: {
    fontSize: 18,
    lineHeight: 28,
    textAlign: 'center',
    fontStyle: 'italic',
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
