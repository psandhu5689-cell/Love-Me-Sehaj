import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAudio } from './_layout';

const { width, height } = Dimensions.get('window');

const STICKER_GOLD_DRESS = 'https://customer-assets.emergentagent.com/job_love-adventure-49/artifacts/grh04hmp_IMG_5616.jpeg';

export default function EntryGate() {
  const router = useRouter();
  const { playPop } = useAudio();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const heartAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.delay(300),
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    // Floating heart animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(heartAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(heartAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const heartTranslateY = heartAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -15],
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Floating Hearts Background */}
        <View style={styles.heartsBackground}>
          {[...Array(6)].map((_, i) => (
            <Animated.View
              key={i}
              style={[
                styles.floatingHeart,
                {
                  left: `${15 + i * 15}%`,
                  top: `${10 + (i % 3) * 25}%`,
                  opacity: 0.15,
                  transform: [
                    { translateY: heartTranslateY },
                    { scale: 0.5 + (i % 3) * 0.3 },
                  ],
                },
              ]}
            >
              <Ionicons name="heart" size={40} color="#FF6B9D" />
            </Animated.View>
          ))}
        </View>

        {/* Photo Sticker - Heart Shaped */}
        <Animated.View
          style={[
            styles.stickerContainer,
            {
              transform: [{ translateY: heartTranslateY }, { rotate: '-12deg' }],
            },
          ]}
        >
          <View style={styles.heartStickerWrapper}>
            <Ionicons name="heart" size={130} color="#FF6B9D" style={styles.heartBg} />
            <Image
              source={{ uri: STICKER_GOLD_DRESS }}
              style={styles.stickerImage}
            />
          </View>
        </Animated.View>

        <Animated.View
          style={[
            styles.mainContent,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <Text style={styles.smallText}>A small journey through us</Text>

          <Animated.View
            style={[
              styles.heartContainer,
              { transform: [{ translateY: heartTranslateY }] },
            ]}
          >
            <Ionicons name="heart" size={80} color="#FF6B9D" />
          </Animated.View>

          <Text style={styles.mainText}>For Sehaj</Text>

          <Text style={styles.subText}>Made with love</Text>

          <TouchableOpacity
            style={styles.button}
            onPress={() => router.push('/personalization')}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>BEGIN</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF5F7',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  heartsBackground: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  floatingHeart: {
    position: 'absolute',
  },
  mainContent: {
    alignItems: 'center',
  },
  smallText: {
    fontSize: 14,
    color: '#9B7FA7',
    fontStyle: 'italic',
    marginBottom: 30,
    letterSpacing: 1,
  },
  heartContainer: {
    marginBottom: 20,
  },
  mainText: {
    fontSize: 42,
    fontWeight: '300',
    color: '#4A1942',
    marginBottom: 12,
    letterSpacing: 2,
  },
  subText: {
    fontSize: 16,
    color: '#9B7FA7',
    marginBottom: 60,
    letterSpacing: 1,
  },
  button: {
    backgroundColor: '#FF6B9D',
    paddingHorizontal: 50,
    paddingVertical: 16,
    borderRadius: 30,
    shadowColor: '#FF6B9D',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: 3,
  },
  stickerContainer: {
    position: 'absolute',
    top: 40,
    right: 5,
    zIndex: 10,
  },
  heartStickerWrapper: {
    width: 130,
    height: 130,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heartBg: {
    position: 'absolute',
  },
  stickerImage: {
    width: 75,
    height: 75,
    borderRadius: 40,
    marginTop: 15,
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
});
