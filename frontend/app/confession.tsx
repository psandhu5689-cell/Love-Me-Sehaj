import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  ScrollView,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useUser, useAudio } from './_layout';

// New stickers from user
const STICKER_1 = 'https://customer-assets.emergentagent.com/job_sehaj-love/artifacts/c4js402r_IMG_2322.jpeg';
const STICKER_2 = 'https://customer-assets.emergentagent.com/job_sehaj-love/artifacts/f4wz0r37_IMG_2420.jpeg';

export default function Confession() {
  const router = useRouter();
  const { userName } = useUser();
  const { playClick } = useAudio();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const line1Anim = useRef(new Animated.Value(0)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;
  const line2Anim = useRef(new Animated.Value(0)).current;
  const line3Anim = useRef(new Animated.Value(0)).current;
  const heartPulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Fade in page
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();

    // Stagger the confession lines
    Animated.stagger(1200, [
      Animated.timing(line1Anim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(line2Anim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(line3Anim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();

    // Pulse animation for heart
    Animated.loop(
      Animated.sequence([
        Animated.timing(heartPulse, {
          toValue: 1.2,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(heartPulse, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const confessionLines = [
    { text: 'You changed me.', anim: line1Anim },
    { text: 'You made me better.', anim: line2Anim },
    { text: 'You feel like home.', anim: line3Anim },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
          <Text style={styles.pageLabel}>A Quiet Confession</Text>

          <Animated.View
            style={[
              styles.heartContainer,
              { transform: [{ scale: heartPulse }] },
            ]}
          >
            <Ionicons name="heart" size={60} color="#FF6B9D" />
          </Animated.View>

          <View style={styles.confessionCard}>
            <Text style={styles.toText}>Dear {userName},</Text>

            <View style={styles.linesContainer}>
              {confessionLines.map((line, index) => (
                <Animated.View
                  key={index}
                  style={[
                    styles.lineWrapper,
                    {
                      opacity: line.anim,
                      transform: [
                        {
                          translateY: line.anim.interpolate({
                            inputRange: [0, 1],
                            outputRange: [30, 0],
                          }),
                        },
                      ],
                    },
                  ]}
                >
                  <Text style={styles.confessionLine}>{line.text}</Text>
                </Animated.View>
              ))}
            </View>

            <View style={styles.divider} />

            <Text style={styles.closingText}>
              Every moment with you feels like a gift I never knew I deserved.
              You've become my favorite person, my safe place, my everything.
            </Text>

            <View style={styles.dateContainer}>
              <Ionicons name="calendar-heart" size={20} color="#FF6B9D" />
              <Text style={styles.dateText}>July 11 — Our day 💕</Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.button}
            onPress={() => {
              playClick();
              router.push('/question');
            }}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>One last thing</Text>
            <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.skipButton}
            onPress={() => {
              playClick();
              router.push('/question');
            }}
            activeOpacity={0.8}
          >
            <Text style={styles.skipButtonText}>Skip</Text>
            <Ionicons name="chevron-forward" size={16} color="#9B7FA7" />
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF5F7',
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
    justifyContent: 'center',
  },
  content: {
    alignItems: 'center',
  },
  pageLabel: {
    fontSize: 14,
    color: '#9B7FA7',
    letterSpacing: 3,
    textTransform: 'uppercase',
    marginBottom: 24,
  },
  heartContainer: {
    marginBottom: 24,
  },
  confessionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    padding: 32,
    width: '100%',
    shadowColor: '#FF6B9D',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
    marginBottom: 32,
  },
  toText: {
    fontSize: 18,
    color: '#9B7FA7',
    marginBottom: 24,
    fontStyle: 'italic',
  },
  linesContainer: {
    gap: 16,
    marginBottom: 24,
  },
  lineWrapper: {
    alignItems: 'center',
  },
  confessionLine: {
    fontSize: 26,
    fontWeight: '300',
    color: '#4A1942',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  divider: {
    width: 60,
    height: 2,
    backgroundColor: '#FFD6E6',
    alignSelf: 'center',
    marginVertical: 24,
    borderRadius: 1,
  },
  closingText: {
    fontSize: 16,
    lineHeight: 28,
    color: '#6B5B6B',
    textAlign: 'center',
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    padding: 12,
    backgroundColor: '#FFF0F5',
    borderRadius: 20,
    gap: 8,
  },
  dateText: {
    fontSize: 15,
    color: '#FF6B9D',
    fontWeight: '600',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF6B9D',
    paddingHorizontal: 36,
    paddingVertical: 18,
    borderRadius: 30,
    gap: 10,
    shadowColor: '#FF6B9D',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 10,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  skipButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    paddingHorizontal: 20,
    paddingVertical: 10,
    gap: 4,
  },
  skipButtonText: {
    fontSize: 14,
    color: '#9B7FA7',
    fontWeight: '500',
  },
});
