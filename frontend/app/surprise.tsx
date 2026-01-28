import React, { useEffect, useRef } from 'react';
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
import { useTheme } from '../src/theme/ThemeContext';
import { ThemedBackground, ThemedCard } from '../src/components/themed';
import * as Haptics from 'expo-haptics';

export default function Surprise() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const { playKiss, playClick } = useAudio();
  
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0.3)).current;
  const messageAnim = useRef(new Animated.Value(0)).current;
  const bounceAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 0.6,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0.3,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Show message immediately
    Animated.parallel([
      Animated.timing(messageAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.sequence([
        Animated.delay(200),
        Animated.spring(bounceAnim, {
          toValue: 1,
          tension: 80,
          friction: 6,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, []);

  return (
    <ThemedBackground>
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <Animated.View
            style={[
              styles.heartGlow,
              {
                backgroundColor: colors.primaryGlow,
                opacity: glowAnim,
                transform: [{ scale: 1.1 }],
              },
            ]}
            pointerEvents="none"
          >
            <Ionicons name="heart" size={220} color={colors.primary} />
          </Animated.View>
          
          <Animated.View
            style={[
              styles.heartOutline,
              {
                opacity: glowAnim.interpolate({
                  inputRange: [0.3, 1],
                  outputRange: [0.5, 1],
                }),
              },
            ]}
            pointerEvents="none"
          >
            <Ionicons name="heart-outline" size={200} color={colors.primary} />
          </Animated.View>
          
          <Animated.View
            style={[
              styles.fingerprintContainer,
              {
                transform: [{ scale: pulseAnim }],
              },
            ]}
          >
            <View style={[styles.fingerprintCircle, { backgroundColor: colors.card, borderColor: colors.primaryLight, shadowColor: colors.primary }]}>
              <Ionicons name="finger-print" size={100} color={colors.primary} />
            </View>
          </Animated.View>
          
          <Animated.View
            style={[
              styles.messageContainer,
              {
                opacity: messageAnim,
                transform: [
                  {
                    translateY: bounceAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [50, 0],
                    }),
                  },
                  {
                    scale: bounceAnim.interpolate({
                      inputRange: [0, 0.5, 1],
                      outputRange: [0.5, 1.1, 1],
                    }),
                  },
                ],
              },
            ]}
          >
            <ThemedCard variant="glow" glowColor={colors.primary}>
              <Text style={[styles.messageText, { color: colors.textPrimary }]}>
                hah I tricked you...{"\n"}I just wanted to kiss your finger
              </Text>
              <Animated.View style={{ transform: [{ scale: bounceAnim }] }}>
                <Ionicons name="heart" size={30} color={colors.primary} style={styles.messageHeart} />
              </Animated.View>
              
              <TouchableOpacity
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  playClick();
                  router.push('/quiet-stars');
                }}
                activeOpacity={0.9}
                style={{ marginTop: 20 }}
              >
                <LinearGradient
                  colors={colors.gradientPrimary as any}
                  style={[styles.continueButton, { shadowColor: colors.primary }]}
                >
                  <Text style={styles.continueButtonText}>one lassssst thing I promise</Text>
                  <Ionicons name="chevron-forward" size={20} color="#FFFFFF" />
                </LinearGradient>
              </TouchableOpacity>
            </ThemedCard>
          </Animated.View>
        </View>
      </SafeAreaView>
    </ThemedBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  heartGlow: {
    position: 'absolute',
    zIndex: 1,
    width: 280,
    height: 280,
    borderRadius: 140,
    justifyContent: 'center',
    alignItems: 'center',
    top: 100,
  },
  heartOutline: {
    position: 'absolute',
    zIndex: 2,
    top: 140,
  },
  fingerprintContainer: {
    zIndex: 100,
    marginBottom: 40,
  },
  fingerprintCircle: {
    width: 160,
    height: 160,
    borderRadius: 80,
    justifyContent: 'center',
    alignItems: 'center',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 15,
    borderWidth: 4,
  },
  messageContainer: {
    marginHorizontal: 24,
    width: '100%',
  },
  messageText: {
    fontSize: 20,
    textAlign: 'center',
    lineHeight: 32,
    fontStyle: 'italic',
  },
  messageHeart: {
    marginTop: 16,
    alignSelf: 'center',
  },
  continueButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
    gap: 8,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
