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

const STICKER_BABY = 'https://customer-assets.emergentagent.com/job_love-adventure-49/artifacts/dhaq8syh_IMG_5559.png';

export default function EarlyFeelings() {
  const router = useRouter();
  const { userName } = useUser();
  const { playKiss, playClick } = useAudio();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const card1Anim = useRef(new Animated.Value(50)).current;
  const card2Anim = useRef(new Animated.Value(50)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.stagger(200, [
        Animated.spring(card1Anim, {
          toValue: 0,
          tension: 50,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.spring(card2Anim, {
          toValue: 0,
          tension: 50,
          friction: 8,
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    // Float animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: 1,
          duration: 2500,
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 2500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const floatTranslate = floatAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -12],
  });

  return (
    <SafeAreaView style={styles.container}>
      {/* Baby Photo Sticker - Heart Shaped */}
      <Animated.View
        style={[
          styles.stickerContainer,
          {
            transform: [{ translateY: floatTranslate }, { rotate: '-15deg' }],
          },
        ]}
      >
        <View style={styles.heartStickerWrapper}>
          <Ionicons name="heart" size={120} color="#FFB6C1" style={styles.heartBg} />
          <Image
            source={{ uri: STICKER_BABY }}
            style={styles.stickerImage}
          />
        </View>
      </Animated.View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
          <Text style={styles.pageLabel}>Early Feelings</Text>

          <Animated.View
            style={[
              styles.iconContainer,
              { transform: [{ translateY: floatTranslate }] },
            ]}
          >
            <Ionicons name="heart-half" size={60} color="#FF6B9D" />
          </Animated.View>

          {/* First Feeling Card */}
          <Animated.View
            style={[
              styles.feelingCard,
              styles.cardLeft,
              { transform: [{ translateX: card1Anim }] },
            ]}
          >
            <View style={styles.cardHeader}>
              <Ionicons name="flash" size={24} color="#FF6B9D" />
              <Text style={styles.cardTitle}>When I First Liked You</Text>
            </View>
            <Text style={styles.cardText}>
              Seeing you on Wizz lowkey was all I needed, but growing to know that you're such an amazing person on the inside as well, was when I liked you.
            </Text>
          </Animated.View>

          {/* Second Feeling Card */}
          <Animated.View
            style={[
              styles.feelingCard,
              styles.cardRight,
              { transform: [{ translateX: Animated.multiply(card2Anim, -1) }] },
            ]}
          >
            <View style={styles.cardHeader}>
              <Ionicons name="sparkles" size={24} color="#9B59B6" />
              <Text style={[styles.cardTitle, { color: '#9B59B6' }]}>
                When I Knew You Felt It Too
              </Text>
            </View>
            <Text style={styles.cardText}>
              When you fucked me.
            </Text>
          </Animated.View>

          <TouchableOpacity
            style={styles.button}
            onPress={() => {
              playKiss();
              router.push('/memories');
            }}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>Next</Text>
            <Ionicons name="chevron-forward" size={20} color="#FFFFFF" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.skipButton}
            onPress={() => {
              playClick();
              router.push('/crossword');
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
    marginBottom: 16,
  },
  iconContainer: {
    marginBottom: 24,
  },
  feelingCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  cardLeft: {
    borderLeftWidth: 4,
    borderLeftColor: '#FF6B9D',
  },
  cardRight: {
    borderRightWidth: 4,
    borderRightColor: '#9B59B6',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 10,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF6B9D',
  },
  cardText: {
    fontSize: 15,
    lineHeight: 26,
    color: '#5A4A5A',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF6B9D',
    paddingHorizontal: 40,
    paddingVertical: 16,
    borderRadius: 30,
    gap: 8,
    marginTop: 16,
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
  stickerContainer: {
    position: 'absolute',
    top: 50,
    left: 5,
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
