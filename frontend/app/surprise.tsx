import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Vibration,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAudio } from './_layout';
import * as Haptics from 'expo-haptics';

export default function Surprise() {
  const [hasPressed, setHasPressed] = useState(false);
  const [showMessage, setShowMessage] = useState(false);
  const [isVibrating, setIsVibrating] = useState(false);
  const { playKiss } = useAudio();
  
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0.3)).current;
  const messageAnim = useRef(new Animated.Value(0)).current;
  const bounceAnim = useRef(new Animated.Value(0)).current;
  const vibrationInterval = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Gentle pulsing animation for the fingerprint
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

    // Glow animation for the heart
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

    return () => {
      if (vibrationInterval.current) {
        clearInterval(vibrationInterval.current);
      }
    };
  }, []);

  const handleFingerprintPress = async () => {
    if (hasPressed) return; // Prevent spam
    
    setHasPressed(true);
    setIsVibrating(true);
    
    // Play kiss sound
    playKiss();
    
    // Vibration - use expo-haptics for better compatibility
    try {
      // Start repeated haptic feedback for 5 seconds
      let count = 0;
      vibrationInterval.current = setInterval(async () => {
        if (count < 25) { // 25 * 200ms = 5 seconds
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
          count++;
        } else {
          if (vibrationInterval.current) {
            clearInterval(vibrationInterval.current);
          }
        }
      }, 200);

      // Also try native Vibration API as backup
      if (Platform.OS !== 'web') {
        Vibration.vibrate([0, 200, 100, 200, 100, 200, 100, 200, 100, 200, 100, 200, 100, 200, 100, 200, 100, 200, 100, 200, 100, 200, 100, 200, 100, 200], false);
      }
    } catch (e) {
      console.log('Vibration error:', e);
    }
    
    // Faster pulsing during vibration
    const fastPulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.9,
          duration: 150,
          useNativeDriver: true,
        }),
      ])
    );
    fastPulse.start();
    
    // Intense glow during vibration
    Animated.timing(glowAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
    
    // After 5 seconds, show message
    setTimeout(() => {
      setIsVibrating(false);
      if (vibrationInterval.current) {
        clearInterval(vibrationInterval.current);
      }
      Vibration.cancel();
      fastPulse.stop();
      
      // Return to gentle pulse
      pulseAnim.setValue(1);
      
      // Show message with bounce
      setShowMessage(true);
      
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
    }, 5000);
  };

  return (
    <LinearGradient
      colors={['#FFE4EC', '#FFF5F7', '#FFFAF0']}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          {/* Instruction text */}
          {!hasPressed && (
            <Animated.Text style={[styles.instructionText, { opacity: pulseAnim }]}>
              Touch to feel the love...
            </Animated.Text>
          )}
          
          {/* Heart glow background - positioned behind */}
          <Animated.View
            style={[
              styles.heartGlow,
              {
                opacity: glowAnim,
                transform: [{ scale: isVibrating ? 1.3 : 1.1 }],
              },
            ]}
            pointerEvents="none"
          >
            <Ionicons name="heart" size={220} color="#FF6B9D" />
          </Animated.View>
          
          {/* Heart outline - positioned behind */}
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
            <Ionicons name="heart-outline" size={200} color="#FF6B9D" />
          </Animated.View>
          
          {/* Fingerprint button - on TOP */}
          <TouchableOpacity
            onPress={handleFingerprintPress}
            activeOpacity={0.7}
            disabled={hasPressed}
            style={styles.touchArea}
          >
            <Animated.View
              style={[
                styles.fingerprintContainer,
                {
                  transform: [{ scale: pulseAnim }],
                },
              ]}
            >
              <View style={styles.fingerprintCircle}>
                <Ionicons name="finger-print" size={100} color="#FF6B9D" />
              </View>
            </Animated.View>
          </TouchableOpacity>
          
          {/* Message after vibration */}
          {showMessage && (
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
              <Text style={styles.messageText}>
                hah I tricked you...{"\n"}I just wanted to kiss your finger
              </Text>
              <Animated.View style={{ transform: [{ scale: bounceAnim }] }}>
                <Ionicons name="heart" size={30} color="#FF6B9D" style={styles.messageHeart} />
              </Animated.View>
            </Animated.View>
          )}
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  instructionText: {
    position: 'absolute',
    top: 100,
    fontSize: 18,
    color: '#9B7FA7',
    fontStyle: 'italic',
    letterSpacing: 0.5,
  },
  heartGlow: {
    position: 'absolute',
    zIndex: 1,
  },
  heartOutline: {
    position: 'absolute',
    zIndex: 2,
  },
  touchArea: {
    zIndex: 100,
    padding: 20,
  },
  fingerprintContainer: {
    zIndex: 100,
  },
  fingerprintCircle: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#FF6B9D',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 15,
    borderWidth: 4,
    borderColor: '#FFD6E6',
  },
  messageContainer: {
    position: 'absolute',
    bottom: 100,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 28,
    borderRadius: 28,
    shadowColor: '#FF6B9D',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 12,
    marginHorizontal: 24,
  },
  messageText: {
    fontSize: 20,
    color: '#4A1942',
    textAlign: 'center',
    lineHeight: 32,
    fontStyle: 'italic',
  },
  messageHeart: {
    marginTop: 16,
  },
});
