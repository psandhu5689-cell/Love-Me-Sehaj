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

export default function Surprise() {
  const [hasPressed, setHasPressed] = useState(false);
  const [showMessage, setShowMessage] = useState(false);
  const [isVibrating, setIsVibrating] = useState(false);
  const { playKiss } = useAudio();
  
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0.3)).current;
  const messageAnim = useRef(new Animated.Value(0)).current;
  const bounceAnim = useRef(new Animated.Value(0)).current;

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
  }, []);

  const handleFingerprintPress = () => {
    if (hasPressed) return; // Prevent spam
    
    setHasPressed(true);
    setIsVibrating(true);
    
    // Play kiss sound
    playKiss();
    
    // Vibration pattern (only on mobile)
    if (Platform.OS !== 'web') {
      // Vibrate for ~5 seconds with pattern
      const pattern = [0, 500, 100, 500, 100, 500, 100, 500, 100, 500, 100, 500, 100, 500, 100, 500, 100, 500];
      Vibration.vibrate(pattern);
    }
    
    // Faster pulsing during vibration
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.15,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.95,
          duration: 200,
          useNativeDriver: true,
        }),
      ])
    ).start();
    
    // Intense glow during vibration
    Animated.timing(glowAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
    
    // After 5 seconds, show message
    setTimeout(() => {
      setIsVibrating(false);
      Vibration.cancel();
      
      // Stop fast pulsing, return to gentle
      pulseAnim.setValue(1);
      
      // Show message with bounce
      setShowMessage(true);
      
      Animated.sequence([
        Animated.timing(messageAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.spring(bounceAnim, {
          toValue: 1,
          tension: 100,
          friction: 5,
          useNativeDriver: true,
        }),
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
          
          {/* Heart glow background */}
          <Animated.View
            style={[
              styles.heartGlow,
              {
                opacity: glowAnim,
                transform: [{ scale: isVibrating ? 1.3 : 1.1 }],
              },
            ]}
          >
            <Ionicons name="heart" size={220} color="#FF6B9D" />
          </Animated.View>
          
          {/* Fingerprint button */}
          <TouchableOpacity
            onPress={handleFingerprintPress}
            activeOpacity={0.8}
            disabled={hasPressed}
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
          
          {/* Heart outline */}
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
          >
            <Ionicons name="heart-outline" size={200} color="#FF6B9D" />
          </Animated.View>
          
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
              <Ionicons name="heart" size={30} color="#FF6B9D" style={styles.messageHeart} />
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
    opacity: 0.3,
  },
  fingerprintContainer: {
    zIndex: 10,
  },
  fingerprintCircle: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#FF6B9D',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 15,
    borderWidth: 3,
    borderColor: '#FFD6E6',
  },
  heartOutline: {
    position: 'absolute',
    zIndex: 5,
  },
  messageContainer: {
    position: 'absolute',
    bottom: 120,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 24,
    borderRadius: 24,
    shadowColor: '#FF6B9D',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 10,
    marginHorizontal: 20,
  },
  messageText: {
    fontSize: 20,
    color: '#4A1942',
    textAlign: 'center',
    lineHeight: 32,
    fontStyle: 'italic',
  },
  messageHeart: {
    marginTop: 12,
  },
});
