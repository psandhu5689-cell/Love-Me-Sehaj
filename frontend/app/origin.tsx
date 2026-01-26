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

const STICKER_CITY = 'https://customer-assets.emergentagent.com/job_love-adventure-49/artifacts/7apudxnx_IMG_5617.jpeg';

export default function OriginStory() {
  const router = useRouter();
  const { userName } = useUser();
  const { playPop } = useAudio();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;
  const heartPulse = useRef(new Animated.Value(1)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 1000,
        useNativeDriver: true,
      }),
    ]).start();

    // Pulse animation for heart
    Animated.loop(
      Animated.sequence([
        Animated.timing(heartPulse, {
          toValue: 1.15,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(heartPulse, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Float animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const floatTranslate = floatAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -10],
  });

  return (
    <SafeAreaView style={styles.container}>
      {/* Photo Sticker - Heart Shaped */}
      <Animated.View
        style={[
          styles.stickerContainer,
          {
            transform: [{ translateY: floatTranslate }, { rotate: '10deg' }],
          },
        ]}
      >
        <View style={styles.heartStickerWrapper}>
          <Ionicons name="heart" size={120} color="#FF6B9D" style={styles.heartBg} />
          <Image
            source={{ uri: STICKER_CITY }}
            style={styles.stickerImage}
          />
        </View>
      </Animated.View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          style={[
            styles.content,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <Text style={styles.pageLabel}>Our Beginning</Text>

          <Animated.View
            style={[
              styles.heartIcon,
              { transform: [{ scale: heartPulse }] },
            ]}
          >
            <Ionicons name="heart-circle" size={70} color="#FF6B9D" />
          </Animated.View>

          <View style={styles.storyCard}>
            <Text style={styles.storyText}>
              Our first meeting was at Calgary Stampede. She walked towards my car, busy traffic, sat inside. I genuinely fell in love all over again, the way she smiled at my smile and laughed at my laugh. I love you so much.
            </Text>

            <View style={styles.divider} />

            <Text style={styles.storyText}>
              Sehaj. You're my comfort person, my crush, my pillow, and my sandbag to beat up. You're my everything for eternity.
            </Text>

            <View style={styles.divider} />

            <View style={styles.detailContainer}>
              <Ionicons name="star" size={20} color="#FFB347" />
              <Text style={styles.detailText}>
                Something small I remember is how expressive your face is. I can read your emotions from your eyes alone.
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.button}
            onPress={() => router.push('/early-feelings')}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>Next</Text>
            <Ionicons name="chevron-forward" size={20} color="#FFFFFF" />
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
    justifyContent: 'center',
    padding: 24,
    paddingTop: 80,
  },
  content: {
    alignItems: 'center',
  },
  pageLabel: {
    fontSize: 14,
    color: '#9B7FA7',
    letterSpacing: 3,
    textTransform: 'uppercase',
    marginBottom: 20,
  },
  heartIcon: {
    marginBottom: 24,
  },
  storyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 28,
    width: '100%',
    shadowColor: '#FF6B9D',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 6,
    marginBottom: 32,
  },
  storyText: {
    fontSize: 17,
    lineHeight: 28,
    color: '#4A1942',
    textAlign: 'center',
  },
  divider: {
    width: 40,
    height: 2,
    backgroundColor: '#FFD6E6',
    alignSelf: 'center',
    marginVertical: 20,
    borderRadius: 1,
  },
  detailContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFF9E6',
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  detailText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 24,
    color: '#6B5B4F',
    fontStyle: 'italic',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF6B9D',
    paddingHorizontal: 40,
    paddingVertical: 16,
    borderRadius: 30,
    gap: 8,
    shadowColor: '#FF6B9D',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600',
    letterSpacing: 1,
  },
  stickerContainer: {
    position: 'absolute',
    top: 50,
    right: 10,
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
    borderColor: '#FFFFFF',
  },
});
