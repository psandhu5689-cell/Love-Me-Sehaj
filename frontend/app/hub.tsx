import React, { useEffect, useRef, useState } from 'react';
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
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAudio } from './_layout';
import { useTheme } from '../src/theme/ThemeContext';
import { ThemedBackground } from '../src/components/themed';
import { PresenceCheckModal, PresenceDisplay } from '../src/components/PresenceModals';
import * as Haptics from 'expo-haptics';

const { width, height } = Dimensions.get('window');

const STICKER_GOLD_DRESS = 'https://customer-assets.emergentagent.com/job_love-adventure-49/artifacts/grh04hmp_IMG_5616.jpeg';

export default function Hub() {
  const router = useRouter();
  const { playKiss, playClick } = useAudio();
  const { colors, isDark } = useTheme();
  
  // State management
  const [showPresenceCheck, setShowPresenceCheck] = useState(false);
  const [currentUser, setCurrentUser] = useState<'prabh' | 'sehaj' | null>(null);
  const [presenceKey, setPresenceKey] = useState(0);
  
  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const heartAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    loadUserAndCheckPresence();
  }, []);

  const loadUserAndCheckPresence = async () => {
    const savedUser = await AsyncStorage.getItem('currentUser');
    if (savedUser) {
      setCurrentUser(savedUser as 'prabh' | 'sehaj');
    }
    
    // Check if presence was already checked this session
    const presenceChecked = await AsyncStorage.getItem('session_presence_checked');
    if (!presenceChecked && savedUser) {
      setShowPresenceCheck(true);
    } else {
      // Start animations immediately if presence already checked
      startAnimations();
    }
  };

  const handlePresenceComplete = async (shared: boolean) => {
    await AsyncStorage.setItem('session_presence_checked', 'true');
    setShowPresenceCheck(false);
    setPresenceKey(prev => prev + 1);
    startAnimations();
  };

  const startAnimations = () => {
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
          duration: 2500,
          useNativeDriver: true,
        }),
        Animated.timing(heartAnim, {
          toValue: 0,
          duration: 2500,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Glow animation
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
  };

  useEffect(() => {
    if (!showPresenceCheck) {
      startAnimations();
    }
  }, [showPresenceCheck]);

  const heartTranslateY = heartAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -15],
  });

  const handleBegin = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    playKiss();
    router.push('/personalization');
  };

  const handleSillyCrybaby = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    playClick();
    router.push('/daily-love');
  };

  return (
    <ThemedBackground showFloatingElements={true}>
      <SafeAreaView style={styles.container}>
        {/* Presence Check Modal - Every app launch */}
        {currentUser && (
          <PresenceCheckModal
            visible={showPresenceCheck}
            currentUser={currentUser}
            onComplete={handlePresenceComplete}
          />
        )}

        <View style={styles.content}>
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
              <Ionicons name="heart" size={130} color={colors.primary} style={styles.heartBg} />
              <Image
                source={{ uri: STICKER_GOLD_DRESS }}
                style={[styles.stickerImage, { borderColor: colors.card }]}
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
            {/* Main Heart with Glow */}
            <Animated.View
              style={[
                styles.heartContainer,
                { transform: [{ translateY: heartTranslateY }] },
              ]}
            >
              {/* Glow effect */}
              <Animated.View 
                style={[
                  styles.heartGlow, 
                  { 
                    opacity: glowAnim,
                    backgroundColor: colors.primaryGlow,
                  }
                ]} 
              />
              <Ionicons name="heart" size={90} color={colors.primary} />
            </Animated.View>

            <Text style={[styles.mainText, { color: colors.textPrimary }]}>
              For Sehaj
            </Text>

            <Text style={[styles.subText, { color: colors.textSecondary }]}>
              Made with love
            </Text>

            {/* Presence Display Section */}
            <PresenceDisplay key={presenceKey} style={styles.presenceSection} />

            {/* Premium Gradient Button */}
            <TouchableOpacity
              onPress={handleBegin}
              activeOpacity={0.9}
              style={styles.buttonWrapper}
            >
              <LinearGradient
                colors={colors.gradientPrimary as any}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[styles.button, { shadowColor: colors.primary }]}
              >
                <Text style={styles.buttonText}>BEGIN</Text>
                <Ionicons name="heart" size={18} color="#FFFFFF" />
              </LinearGradient>
            </TouchableOpacity>

            {/* Or Separator */}
            <Text style={[styles.orText, { color: colors.textMuted }]}>or</Text>

            {/* Silly Crybaby Button - Now styled as a button */}
            <TouchableOpacity
              onPress={handleSillyCrybaby}
              activeOpacity={0.8}
              style={[styles.crybabyButton, { backgroundColor: colors.glass, borderColor: colors.secondary }]}
            >
              <Ionicons name="heart-half" size={18} color={colors.secondary} />
              <Text style={[styles.crybabyButtonText, { color: colors.secondary }]}>
                when you're being my silly crybaby
              </Text>
              <Text style={styles.crybabyEmoji}>💕</Text>
            </TouchableOpacity>
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
    paddingBottom: 100,
  },
  mainContent: {
    alignItems: 'center',
  },
  heartContainer: {
    marginBottom: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heartGlow: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
  },
  mainText: {
    fontSize: 44,
    fontWeight: '300',
    marginBottom: 12,
    letterSpacing: 2,
  },
  subText: {
    fontSize: 16,
    marginBottom: 16,
    letterSpacing: 1.5,
    fontStyle: 'italic',
  },
  presenceSection: {
    marginBottom: 20,
    width: width - 80,
  },
  buttonWrapper: {
    marginTop: 10,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 50,
    paddingVertical: 18,
    borderRadius: 30,
    gap: 10,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 10,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: 3,
  },
  orText: {
    fontSize: 14,
    marginVertical: 12,
    fontStyle: 'italic',
  },
  crybabyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 25,
    borderWidth: 1.5,
    gap: 8,
  },
  crybabyButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  crybabyEmoji: {
    fontSize: 16,
  },
  stickerContainer: {
    position: 'absolute',
    top: 60,
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
  },
});
