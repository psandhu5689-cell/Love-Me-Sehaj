import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useUser, useAudio } from './_layout';
import { useTheme } from '../src/theme/ThemeContext';
import { ThemedBackground, ThemedCard } from '../src/components/themed';
import ConfettiCannon from 'react-native-confetti-cannon';
import * as Haptics from 'expo-haptics';

const { width, height } = Dimensions.get('window');

const MEMORIES_FLOATING = [
  'Click the blue heart heheheh',
  'I will always love you',
  "You're not that dumb",
  'Wanna fuck',
  'I miss terms and conditions',
  'Thank you for being my sweet girl',
];

const STICKER_OCTOPUS = 'https://customer-assets.emergentagent.com/job_love-adventure-49/artifacts/cayt7gcy_IMG_5352.jpeg';
const STICKER_GOLD = 'https://customer-assets.emergentagent.com/job_love-adventure-49/artifacts/grh04hmp_IMG_5616.jpeg';

export default function Celebration() {
  const { userName } = useUser();
  const { playMagic, playPop } = useAudio();
  const { colors, isDark } = useTheme();
  const router = useRouter();
  const [showSecret, setShowSecret] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const titleAnim = useRef(new Animated.Value(0)).current;
  const messageAnim = useRef(new Animated.Value(0)).current;
  const memoryAnims = useRef(MEMORIES_FLOATING.map(() => new Animated.Value(0))).current;
  const floatAnim = useRef(new Animated.Value(0)).current;
  const secretAnim = useRef(new Animated.Value(0)).current;
  const confettiRef = useRef<any>(null);

  useEffect(() => {
    setTimeout(() => {
      confettiRef.current?.start();
    }, 500);

    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();

    Animated.timing(titleAnim, {
      toValue: 1,
      duration: 1000,
      delay: 300,
      useNativeDriver: true,
    }).start();

    Animated.timing(messageAnim, {
      toValue: 1,
      duration: 1000,
      delay: 800,
      useNativeDriver: true,
    }).start();

    Animated.stagger(
      200,
      memoryAnims.map((anim) =>
        Animated.timing(anim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        })
      )
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 3000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const handleSecretPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    playMagic();
    setShowSecret(true);
    Animated.spring(secretAnim, {
      toValue: 1,
      tension: 50,
      friction: 7,
      useNativeDriver: true,
    }).start();
  };

  const floatTranslateY = floatAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -15],
  });

  return (
    <ThemedBackground showFloatingElements={false}>
      <SafeAreaView style={styles.container}>
        <ConfettiCannon
          ref={confettiRef}
          count={150}
          origin={{ x: width / 2, y: -10 }}
          autoStart={false}
          fadeOut
          colors={[colors.primary, colors.secondary, colors.tertiary, '#FFD700']}
        />

        <Animated.View
          style={[
            styles.stickerLeft,
            { transform: [{ translateY: floatTranslateY }, { rotate: '-15deg' }] },
          ]}
        >
          <View style={styles.heartStickerWrapper}>
            <Ionicons name="heart" size={120} color={colors.secondary} style={styles.heartBg} />
            <Image source={{ uri: STICKER_OCTOPUS }} style={[styles.stickerImage, { borderColor: colors.card }]} />
          </View>
        </Animated.View>
        <Animated.View
          style={[
            styles.stickerRight,
            { transform: [{ translateY: floatTranslateY }, { rotate: '15deg' }] },
          ]}
        >
          <View style={styles.heartStickerWrapper}>
            <Ionicons name="heart" size={120} color={colors.primary} style={styles.heartBg} />
            <Image source={{ uri: STICKER_GOLD }} style={[styles.stickerImage, { borderColor: colors.card }]} />
          </View>
        </Animated.View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
            <View style={styles.heartsBackground}>
              {[...Array(10)].map((_, i) => (
                <Animated.View
                  key={i}
                  style={[
                    styles.floatingHeart,
                    {
                      left: `${5 + i * 10}%`,
                      top: `${(i % 5) * 18}%`,
                      opacity: 0.15,
                      transform: [
                        { translateY: floatTranslateY },
                        { scale: 0.3 + (i % 4) * 0.2 },
                      ],
                    },
                  ]}
                >
                  <Ionicons name="heart" size={40} color={colors.primary} />
                </Animated.View>
              ))}
            </View>

            <Animated.View
              style={[
                styles.titleContainer,
                {
                  opacity: titleAnim,
                  transform: [
                    {
                      scale: titleAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.8, 1],
                      }),
                    },
                  ],
                },
              ]}
            >
              <View style={[styles.heartGlow, { backgroundColor: colors.primaryGlow }]} />
              <Ionicons name="heart" size={60} color={colors.primary} />
              <Text style={[styles.celebrationTitle, { color: colors.textPrimary }]}>
                You said YES!
              </Text>
            </Animated.View>

            <View style={styles.memoriesContainer}>
              {MEMORIES_FLOATING.map((memory, index) => (
                <Animated.View
                  key={index}
                  style={[
                    styles.memoryChip,
                    { backgroundColor: colors.card, borderColor: colors.border },
                    {
                      opacity: memoryAnims[index],
                      transform: [
                        {
                          translateX: memoryAnims[index].interpolate({
                            inputRange: [0, 1],
                            outputRange: [index % 2 === 0 ? -50 : 50, 0],
                          }),
                        },
                      ],
                    },
                  ]}
                >
                  <Ionicons name="sparkles" size={14} color={colors.primary} />
                  <Text style={[styles.memoryText, { color: colors.textSecondary }]}>{memory}</Text>
                </Animated.View>
              ))}
            </View>

            <Animated.View
              style={[
                styles.messageCardWrapper,
                {
                  opacity: messageAnim,
                  transform: [
                    {
                      translateY: messageAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [30, 0],
                      }),
                    },
                  ],
                },
              ]}
            >
              <ThemedCard variant="glow" glowColor={colors.primary}>
                <Text style={[styles.finalMessage, { color: colors.textPrimary }]}>
                  "{userName}, you have always been my Valentine.{"\n"}
                  This just makes it official."
                </Text>
                <View style={styles.heartRow}>
                  <Ionicons name="heart" size={24} color={colors.primary} />
                  <Ionicons name="heart" size={32} color={colors.primary} />
                  <Ionicons name="heart" size={24} color={colors.primary} />
                </View>
              </ThemedCard>
            </Animated.View>

            <TouchableOpacity
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                playMagic();
                router.push('/quiet-stars');
              }}
              activeOpacity={0.9}
              style={{ marginTop: 30 }}
            >
              <LinearGradient
                colors={[colors.secondary, colors.secondaryDark]}
                style={[styles.surpriseButton, { shadowColor: colors.secondary }]}
              >
                <Ionicons name="gift" size={20} color="#FFFFFF" />
                <Text style={styles.surpriseButtonText}>One more thing...</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.secretHeart, { backgroundColor: isDark ? 'rgba(74, 144, 217, 0.15)' : '#E6F0FF' }]}
              onPress={handleSecretPress}
              activeOpacity={0.8}
            >
              <Ionicons
                name="heart"
                size={24}
                color="#4A90D9"
              />
            </TouchableOpacity>
            {showSecret && (
              <Animated.View
                style={[
                  styles.secretContainer,
                  { backgroundColor: isDark ? 'rgba(74, 144, 217, 0.15)' : '#E6F0FF' },
                  {
                    opacity: secretAnim,
                    transform: [{ scale: secretAnim }],
                  },
                ]}
              >
                <Text style={[styles.secretText, { color: '#4A90D9' }]}>
                  P.S. I choose you every day, and your coochie can come get stretched again muah.
                </Text>
              </Animated.View>
            )}
          </Animated.View>
        </ScrollView>
      </SafeAreaView>
    </ThemedBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
    paddingTop: 100,
  },
  content: {
    alignItems: 'center',
    minHeight: height - 100,
  },
  heartsBackground: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  floatingHeart: {
    position: 'absolute',
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: 32,
    marginTop: 20,
  },
  heartGlow: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    top: -20,
  },
  celebrationTitle: {
    fontSize: 36,
    fontWeight: '300',
    marginTop: 12,
    letterSpacing: 1,
  },
  memoriesContainer: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 32,
  },
  memoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    gap: 6,
    borderWidth: 1,
  },
  memoryText: {
    fontSize: 13,
  },
  messageCardWrapper: {
    width: '100%',
  },
  finalMessage: {
    fontSize: 20,
    lineHeight: 34,
    textAlign: 'center',
    fontStyle: 'italic',
    marginBottom: 20,
  },
  heartRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  secretHeart: {
    marginTop: 30,
    padding: 15,
    borderRadius: 30,
  },
  secretContainer: {
    marginTop: 24,
    padding: 20,
    borderRadius: 16,
  },
  secretText: {
    fontSize: 16,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  stickerLeft: {
    position: 'absolute',
    top: 50,
    left: 5,
    zIndex: 10,
  },
  stickerRight: {
    position: 'absolute',
    top: 50,
    right: 5,
    zIndex: 10,
  },
  heartStickerWrapper: {
    width: 120,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heartBg: {
    position: 'absolute',
  },
  stickerImage: {
    width: 70,
    height: 70,
    borderRadius: 35,
    marginTop: 12,
    borderWidth: 3,
  },
  surpriseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 28,
    paddingVertical: 16,
    borderRadius: 30,
    gap: 10,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },
  surpriseButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
