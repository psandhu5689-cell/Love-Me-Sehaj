import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAudio } from './_layout';
import { useTheme } from '../src/theme/ThemeContext';
import { ThemedBackground, ThemedCard } from '../src/components/themed';

const { width } = Dimensions.get('window');

// Important dates
const TALKING_START = new Date('2025-02-26T00:00:00');
const DATING_START = new Date('2025-07-11T00:00:00');

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  totalDays: number;
}

function calculateTimeSince(startDate: Date): TimeLeft {
  const now = new Date();
  const diff = now.getTime() - startDate.getTime();

  const totalDays = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  return { days: totalDays, hours, minutes, seconds, totalDays };
}

// Animated Candle Component
function CandleTimer({
  label,
  startDate,
  color,
  colors,
}: {
  label: string;
  startDate: Date;
  color: string;
  colors: any;
}) {
  const [time, setTime] = useState<TimeLeft>(calculateTimeSince(startDate));
  const [showFullTime, setShowFullTime] = useState(true);
  const flameAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(calculateTimeSince(startDate));
    }, 1000);

    const flickerAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(flameAnim, {
          toValue: 1.1,
          duration: 200 + Math.random() * 200,
          useNativeDriver: true,
        }),
        Animated.timing(flameAnim, {
          toValue: 0.95,
          duration: 150 + Math.random() * 150,
          useNativeDriver: true,
        }),
        Animated.timing(flameAnim, {
          toValue: 1.05,
          duration: 180 + Math.random() * 180,
          useNativeDriver: true,
        }),
        Animated.timing(flameAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ])
    );
    flickerAnimation.start();

    const glowAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 0.8,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0.5,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    );
    glowAnimation.start();

    return () => {
      clearInterval(interval);
      flickerAnimation.stop();
      glowAnimation.stop();
    };
  }, [startDate]);

  const formattedDate = startDate.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <TouchableOpacity
      style={styles.candleContainer}
      onLongPress={() => setShowFullTime(!showFullTime)}
      activeOpacity={0.9}
    >
      {/* Glow Effect */}
      <Animated.View
        style={[
          styles.candleGlow,
          {
            backgroundColor: color,
            opacity: glowAnim,
          }
        ]}
      />

      {/* Flame */}
      <View style={styles.flameContainer}>
        <Animated.View
          style={[
            styles.flame,
            { transform: [{ scale: flameAnim }] }
          ]}
        >
          <View style={styles.flameOuter} />
          <View style={styles.flameInner} />
        </Animated.View>
        <Animated.View style={[styles.heartAboveFlame, { opacity: glowAnim }]}>
          <Text style={styles.heartEmoji}>💗</Text>
        </Animated.View>
      </View>

      {/* Candle Body */}
      <ThemedCard variant="glass" style={[styles.candleBody, { borderColor: color }]}>
        <Text style={[styles.candleLabel, { color: colors.textSecondary }]}>{label}</Text>

        <View style={styles.timeDisplay}>
          {showFullTime ? (
            <>
              <View style={styles.timeUnit}>
                <Text style={[styles.timeNumber, { color }]}>{time.days}</Text>
                <Text style={[styles.timeLabel, { color: colors.textMuted }]}>days</Text>
              </View>
              <View style={styles.timeUnit}>
                <Text style={[styles.timeNumber, { color }]}>{time.hours}</Text>
                <Text style={[styles.timeLabel, { color: colors.textMuted }]}>hrs</Text>
              </View>
              <View style={styles.timeUnit}>
                <Text style={[styles.timeNumber, { color }]}>{time.minutes}</Text>
                <Text style={[styles.timeLabel, { color: colors.textMuted }]}>min</Text>
              </View>
            </>
          ) : (
            <View style={styles.timeUnit}>
              <Text style={[styles.timeNumber, { color, fontSize: 36 }]}>{time.totalDays}</Text>
              <Text style={[styles.timeLabel, { color: colors.textMuted }]}>days</Text>
            </View>
          )}
        </View>

        <Text style={[styles.sinceDate, { color: colors.textMuted }]}>Since {formattedDate}</Text>
      </ThemedCard>

      {/* Candle Base */}
      <View style={[styles.candleBase, { backgroundColor: color }]} />
    </TouchableOpacity>
  );
}

export default function TogetherFor() {
  const router = useRouter();
  const { playClick } = useAudio();
  const { colors, isDark } = useTheme();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <ThemedBackground showFloatingElements={true}>
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={[styles.backButton, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => { playClick(); router.back(); }}
            activeOpacity={0.7}
          >
            <Ionicons name="chevron-back" size={24} color={colors.primary} />
          </TouchableOpacity>

          <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Together For 💕</Text>

          <View style={{ width: 44 }} />
        </View>

        <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Every second with you counts</Text>

          {/* Candles Container */}
          <View style={styles.candlesRow}>
            <CandleTimer
              label="Talking"
              startDate={TALKING_START}
              color={colors.primary}
              colors={colors}
            />
            <CandleTimer
              label="Dating"
              startDate={DATING_START}
              color="#FFD700"
              colors={colors}
            />
          </View>

          <Text style={[styles.hint, { color: colors.textMuted }]}>Long press a candle to toggle view</Text>

          {/* Total Love Message */}
          <ThemedCard variant="glass" style={styles.loveMessage}>
            <Ionicons name="heart" size={24} color={colors.primary} />
            <Text style={[styles.loveText, { color: colors.textSecondary }]}>
              Forever feels like just the beginning
            </Text>
          </ThemedCard>
        </Animated.View>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 8,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '600',
  },
  backButton: {
    padding: 10,
    borderRadius: 20,
    borderWidth: 1,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    padding: 20,
  },
  subtitle: {
    fontSize: 16,
    fontStyle: 'italic',
    marginBottom: 40,
  },
  candlesRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 24,
    marginBottom: 30,
  },
  candleContainer: {
    alignItems: 'center',
    width: (width - 80) / 2,
  },
  candleGlow: {
    position: 'absolute',
    top: 20,
    width: 100,
    height: 100,
    borderRadius: 50,
    transform: [{ scaleY: 1.5 }],
  },
  flameContainer: {
    alignItems: 'center',
    marginBottom: -10,
    zIndex: 10,
  },
  flame: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  flameOuter: {
    width: 24,
    height: 40,
    backgroundColor: '#FF6B00',
    borderRadius: 12,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  flameInner: {
    position: 'absolute',
    width: 12,
    height: 24,
    backgroundColor: '#FFD700',
    borderRadius: 6,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    bottom: 8,
  },
  heartAboveFlame: {
    position: 'absolute',
    top: -20,
  },
  heartEmoji: {
    fontSize: 16,
  },
  candleBody: {
    paddingTop: 24,
    alignItems: 'center',
    width: '100%',
    minHeight: 180,
    borderWidth: 2,
  },
  candleLabel: {
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginBottom: 12,
  },
  timeDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 12,
  },
  timeUnit: {
    alignItems: 'center',
  },
  timeNumber: {
    fontSize: 28,
    fontWeight: '700',
  },
  timeLabel: {
    fontSize: 10,
    textTransform: 'uppercase',
  },
  sinceDate: {
    fontSize: 11,
    fontStyle: 'italic',
  },
  candleBase: {
    width: '70%',
    height: 12,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    marginTop: -2,
  },
  hint: {
    fontSize: 12,
    marginTop: 20,
    fontStyle: 'italic',
  },
  loveMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 40,
    gap: 10,
    paddingVertical: 14,
    paddingHorizontal: 24,
  },
  loveText: {
    fontSize: 14,
    fontStyle: 'italic',
  },
});
