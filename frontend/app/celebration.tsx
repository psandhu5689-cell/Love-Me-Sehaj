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
import { useUser, useAudio } from './_layout';
import ConfettiCannon from 'react-native-confetti-cannon';

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
  const { playMagic } = useAudio();
  const [showSecret, setShowSecret] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const titleAnim = useRef(new Animated.Value(0)).current;
  const messageAnim = useRef(new Animated.Value(0)).current;
  const memoryAnims = useRef(MEMORIES_FLOATING.map(() => new Animated.Value(0))).current;
  const floatAnim = useRef(new Animated.Value(0)).current;
  const secretAnim = useRef(new Animated.Value(0)).current;
  const confettiRef = useRef<any>(null);

  useEffect(() => {
    // Start confetti
    setTimeout(() => {
      confettiRef.current?.start();
    }, 500);

    // Fade in
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();

    // Title animation
    Animated.timing(titleAnim, {
      toValue: 1,
      duration: 1000,
      delay: 300,
      useNativeDriver: true,
    }).start();

    // Message animation
    Animated.timing(messageAnim, {
      toValue: 1,
      duration: 1000,
      delay: 800,
      useNativeDriver: true,
    }).start();

    // Floating memories
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

    // Float animation loop
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
    <SafeAreaView style={styles.container}>
      <ConfettiCannon
        ref={confettiRef}
        count={150}
        origin={{ x: width / 2, y: -10 }}
        autoStart={false}
        fadeOut
        colors={['#FF6B9D', '#FFB347', '#9B59B6', '#FF4B7F', '#FFD6E6']}
      />

      {/* Photo Stickers - Heart Shaped */}
      <Animated.View
        style={[
          styles.stickerLeft,
          { transform: [{ translateY: floatTranslateY }, { rotate: '-15deg' }] },
        ]}
      >
        <View style={styles.heartStickerWrapper}>
          <Ionicons name="heart" size={120} color="#9B59B6" style={styles.heartBg} />
          <Image source={{ uri: STICKER_OCTOPUS }} style={styles.stickerImage} />
        </View>
      </Animated.View>
      <Animated.View
        style={[
          styles.stickerRight,
          { transform: [{ translateY: floatTranslateY }, { rotate: '15deg' }] },
        ]}
      >
        <View style={styles.heartStickerWrapper}>
          <Ionicons name="heart" size={120} color="#FF6B9D" style={styles.heartBg} />
          <Image source={{ uri: STICKER_GOLD }} style={styles.stickerImage} />
        </View>
      </Animated.View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
          {/* Hearts Background */}
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
                <Ionicons name="heart" size={40} color="#FF6B9D" />
              </Animated.View>
            ))}
          </View>

          {/* Title */}
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
            <Ionicons name="heart" size={60} color="#FF6B9D" />
            <Text style={styles.celebrationTitle}>
              You said YES!
            </Text>
          </Animated.View>

          {/* Floating Memories */}
          <View style={styles.memoriesContainer}>
            {MEMORIES_FLOATING.map((memory, index) => (
              <Animated.View
                key={index}
                style={[
                  styles.memoryChip,
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
                <Ionicons name="sparkles" size={14} color="#FF6B9D" />
                <Text style={styles.memoryText}>{memory}</Text>
              </Animated.View>
            ))}
          </View>

          {/* Final Message */}
          <Animated.View
            style={[
              styles.messageCard,
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
            <Text style={styles.finalMessage}>
              "{userName}, you have always been my Valentine.{"\n"}
              This just makes it official."
            </Text>
            <View style={styles.heartRow}>
              <Ionicons name="heart" size={24} color="#FF6B9D" />
              <Ionicons name="heart" size={32} color="#FF6B9D" />
              <Ionicons name="heart" size={24} color="#FF6B9D" />
            </View>
          </Animated.View>

          {/* Secret Heart - Now BLUE */}
          <TouchableOpacity
            style={styles.secretHeart}
            onPress={handleSecretPress}
            activeOpacity={0.8}
          >
            <Ionicons
              name="heart"
              size={24}
              color={showSecret ? '#4A90D9' : '#4A90D9'}
            />
          </TouchableOpacity>

          {/* Secret Message */}
          {showSecret && (
            <Animated.View
              style={[
                styles.secretContainer,
                {
                  opacity: secretAnim,
                  transform: [{ scale: secretAnim }],
                },
              ]}
            >
              <Text style={styles.secretText}>
                P.S. I choose you every day, and your coochie can come get stretched again muah.
              </Text>
            </Animated.View>
          )}
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
  celebrationTitle: {
    fontSize: 36,
    fontWeight: '300',
    color: '#4A1942',
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
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    gap: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  memoryText: {
    fontSize: 13,
    color: '#5A4A5A',
  },
  messageCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    padding: 32,
    width: '100%',
    alignItems: 'center',
    shadowColor: '#FF6B9D',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
  },
  finalMessage: {
    fontSize: 20,
    lineHeight: 34,
    color: '#4A1942',
    textAlign: 'center',
    fontStyle: 'italic',
    marginBottom: 20,
  },
  heartRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  secretHeart: {
    marginTop: 30,
    padding: 15,
    backgroundColor: '#E6F0FF',
    borderRadius: 30,
  },
  secretContainer: {
    marginTop: 24,
    padding: 20,
    backgroundColor: '#E6F0FF',
    borderRadius: 16,
  },
  secretText: {
    fontSize: 16,
    color: '#4A90D9',
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
    borderColor: '#FFFFFF',
  },
});
