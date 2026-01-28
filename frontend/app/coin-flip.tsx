import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  Easing,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAudio } from './_layout';
import { useTheme } from '../src/theme/ThemeContext';
import { ThemedBackground, ThemedCard } from '../src/components/themed';
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get('window');

const FLAVOR_TEXTS = [
  "No arguing allowed.",
  "The coin has spoken.",
  "Respect the coin.",
  "Winner gets their way.",
  "Can't argue with fate!",
  "It is decided.",
  "Accept your destiny.",
];

export default function CoinFlip() {
  const router = useRouter();
  const { playClick, playSuccess, playMagic, playDrumroll } = useAudio();
  const { colors, isDark } = useTheme();

  const [isFlipping, setIsFlipping] = useState(false);
  const [result, setResult] = useState<'heads' | 'tails' | null>(null);
  const [flavorText, setFlavorText] = useState('');
  const [lastWinner, setLastWinner] = useState<string | null>(null);
  const [stats, setStats] = useState({ you: 0, her: 0 });

  const spinAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const resultFadeAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadStats();
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  const loadStats = async () => {
    try {
      const saved = await AsyncStorage.getItem('coin_flip_stats');
      if (saved) {
        const data = JSON.parse(saved);
        setStats(data.stats || { you: 0, her: 0 });
        setLastWinner(data.lastWinner || null);
      }
    } catch (error) {
      console.log('Error loading stats:', error);
    }
  };

  const saveStats = async (winner: 'you' | 'her') => {
    const newStats = {
      ...stats,
      [winner]: stats[winner] + 1,
    };
    setStats(newStats);
    setLastWinner(winner === 'you' ? 'You' : 'Her');

    try {
      await AsyncStorage.setItem('coin_flip_stats', JSON.stringify({
        stats: newStats,
        lastWinner: winner === 'you' ? 'You' : 'Her',
      }));
    } catch (error) {
      console.log('Error saving stats:', error);
    }
  };

  const flipCoin = () => {
    if (isFlipping) return;

    playDrumroll();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsFlipping(true);
    setResult(null);
    resultFadeAnim.setValue(0);

    const isHeads = Math.random() > 0.5;

    spinAnim.setValue(0);

    Animated.parallel([
      Animated.timing(spinAnim, {
        toValue: 1,
        duration: 1500,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.2,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.9,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 5,
          useNativeDriver: true,
        }),
      ]),
    ]).start(() => {
      setResult(isHeads ? 'heads' : 'tails');
      setFlavorText(FLAVOR_TEXTS[Math.floor(Math.random() * FLAVOR_TEXTS.length)]);
      setIsFlipping(false);

      playSuccess();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      saveStats(isHeads ? 'you' : 'her');

      Animated.timing(resultFadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }).start();
    });
  };

  const spin = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '1800deg'],
  });

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

          <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Who's Right? 🪙</Text>

          <View style={{ width: 44 }} />
        </View>

        <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
          {/* Stats Card */}
          <ThemedCard variant="glass" style={styles.statsContainer}>
            <View style={styles.statBox}>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>You</Text>
              <Text style={[styles.statNumber, { color: colors.textPrimary }]}>{stats.you}</Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
            <View style={styles.statBox}>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Her</Text>
              <Text style={[styles.statNumber, { color: colors.textPrimary }]}>{stats.her}</Text>
            </View>
          </ThemedCard>

          {/* Coin */}
          <View style={styles.coinContainer}>
            <Animated.View
              style={[
                styles.coin,
                {
                  backgroundColor: '#FFD700',
                  borderColor: '#DAA520',
                  shadowColor: '#B8860B',
                  transform: [
                    { rotateY: spin },
                    { scale: scaleAnim },
                  ],
                },
              ]}
            >
              <View style={styles.coinFace}>
                <Text style={styles.coinEmoji}>🪙</Text>
              </View>
            </Animated.View>
          </View>

          {/* Result */}
          {result && (
            <Animated.View style={[styles.resultContainer, { opacity: resultFadeAnim }]}>
              <ThemedCard 
                variant="glow" 
                glowColor={result === 'heads' ? colors.success : colors.primary}
                style={[styles.resultBadge, result === 'heads' ? { backgroundColor: colors.success + '20' } : { backgroundColor: colors.primary + '20' }]}
              >
                <Ionicons
                  name={result === 'heads' ? 'trophy' : 'heart'}
                  size={24}
                  color={result === 'heads' ? colors.success : colors.primary}
                />
                <Text style={[styles.resultText, { color: result === 'heads' ? colors.success : colors.primary }]}>
                  {result === 'heads' ? "You're Right!" : "She's Right!"}
                </Text>
              </ThemedCard>
              <Text style={[styles.flavorText, { color: colors.textSecondary }]}>{flavorText}</Text>
              <Text style={[styles.winnerChooses, { color: colors.primary }]}>Winner chooses 💗</Text>
            </Animated.View>
          )}

          {/* Flip Button */}
          <TouchableOpacity
            style={[
              styles.flipButton,
              { backgroundColor: colors.primary, shadowColor: colors.primary },
              isFlipping && styles.flipButtonDisabled,
            ]}
            onPress={flipCoin}
            disabled={isFlipping}
            activeOpacity={0.8}
          >
            <Ionicons name="refresh" size={24} color="#FFFFFF" />
            <Text style={styles.flipButtonText}>
              {isFlipping ? 'Flipping...' : 'Flip Coin'}
            </Text>
          </TouchableOpacity>

          {/* Last Winner */}
          {lastWinner && !isFlipping && !result && (
            <View style={styles.lastWinnerContainer}>
              <Text style={[styles.lastWinnerText, { color: colors.textSecondary }]}>Last winner: {lastWinner}</Text>
            </View>
          )}

          {/* Subtitle */}
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            For fun decisions only!{'\n'}What to eat, watch, or do 💕
          </Text>
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
    fontSize: 20,
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
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    marginBottom: 30,
  },
  statBox: {
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  statLabel: {
    fontSize: 14,
    marginBottom: 4,
  },
  statNumber: {
    fontSize: 28,
    fontWeight: '700',
  },
  statDivider: {
    width: 1,
    height: 40,
  },
  coinContainer: {
    width: 180,
    height: 180,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
  },
  coin: {
    width: 150,
    height: 150,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 75,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 12,
    borderWidth: 6,
  },
  coinFace: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  coinEmoji: {
    fontSize: 80,
  },
  resultContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  resultBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 14,
    gap: 10,
    marginBottom: 12,
  },
  resultText: {
    fontSize: 20,
    fontWeight: '700',
  },
  flavorText: {
    fontSize: 16,
    fontStyle: 'italic',
    marginBottom: 8,
  },
  winnerChooses: {
    fontSize: 14,
    fontWeight: '500',
  },
  flipButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingVertical: 18,
    borderRadius: 30,
    gap: 12,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },
  flipButtonDisabled: {
    opacity: 0.7,
  },
  flipButtonText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  lastWinnerContainer: {
    marginTop: 20,
  },
  lastWinnerText: {
    fontSize: 14,
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 30,
    lineHeight: 22,
  },
});
