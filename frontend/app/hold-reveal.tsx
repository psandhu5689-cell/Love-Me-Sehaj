import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  PanResponder,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAudio } from './_layout';

export default function HoldReveal() {
  const router = useRouter();
  const { playClick, playSuccess, playComplete } = useAudio();
  const [holdProgress, setHoldProgress] = useState(0);
  const [isHolding, setIsHolding] = useState(false);
  const [isRevealed, setIsRevealed] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const revealAnim = useRef(new Animated.Value(0)).current;
  const holdTimer = useRef<NodeJS.Timeout | null>(null);
  const progressInterval = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  const startHold = () => {
    if (isRevealed) return;
    setIsHolding(true);
    playClick();
    
    let progress = 0;
    progressInterval.current = setInterval(() => {
      progress += 2;
      setHoldProgress(progress);
      
      if (progress >= 100) {
        clearInterval(progressInterval.current!);
        setIsRevealed(true);
        setIsHolding(false);
        playSuccess();
        Animated.spring(revealAnim, {
          toValue: 1,
          tension: 50,
          friction: 5,
          useNativeDriver: true,
        }).start();
      }
    }, 100); // 5 seconds total (100 steps * 100ms / 2 = 5000ms)
  };

  const endHold = () => {
    if (isRevealed) return;
    setIsHolding(false);
    if (progressInterval.current) {
      clearInterval(progressInterval.current);
    }
    // Reset progress if not revealed
    if (!isRevealed) {
      setHoldProgress(0);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Back Button */}
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => { playClick(); router.back(); }}
        activeOpacity={0.7}
      >
        <Ionicons name="chevron-back" size={28} color="#FF6B9D" />
      </TouchableOpacity>

      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        {!isRevealed ? (
          <>
            <Ionicons name="finger-print" size={80} color="#FF6B9D" />
            <Text style={styles.title}>Hold To Reveal 💕</Text>
            <Text style={styles.subtitle}>Press and hold for 5 seconds...</Text>
            
            {/* Progress Ring */}
            <View style={styles.holdContainer}>
              <TouchableOpacity
                style={[
                  styles.holdButton,
                  isHolding && styles.holdButtonActive,
                ]}
                onPressIn={startHold}
                onPressOut={endHold}
                activeOpacity={1}
              >
                <View style={styles.progressRing}>
                  <View 
                    style={[
                      styles.progressFill,
                      { 
                        height: `${holdProgress}%`,
                        backgroundColor: isHolding ? '#FF6B9D' : '#FFD6E6',
                      }
                    ]} 
                  />
                </View>
                <View style={styles.holdContent}>
                  <Ionicons 
                    name={isHolding ? "heart" : "hand-left"} 
                    size={50} 
                    color={isHolding ? "#FFFFFF" : "#FF6B9D"} 
                  />
                  <Text style={[styles.holdText, isHolding && styles.holdTextActive]}>
                    {isHolding ? `${Math.round(holdProgress)}%` : 'Hold Here'}
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
            
            <Text style={styles.hint}>
              {isHolding ? "Keep holding..." : "I wanted to see if you would stay."}
            </Text>
            
            <TouchableOpacity
              style={styles.skipButton}
              onPress={() => { playClick(); router.push('/shake-reveal'); }}
              activeOpacity={0.8}
            >
              <Text style={styles.skipButtonText}>Skip</Text>
              <Ionicons name="chevron-forward" size={16} color="#9B7FA7" />
            </TouchableOpacity>
          </>
        ) : (
          <Animated.View style={[styles.revealedContainer, { opacity: revealAnim, transform: [{ scale: revealAnim }] }]}>
            <Ionicons name="heart" size={80} color="#FF6B9D" />
            <Text style={styles.revealedTitle}>You Stayed 💕</Text>
            
            <View style={styles.messageCard}>
              <Text style={styles.messageText}>
                "I wanted to see if you would stay."{"\n\n"}
                And you did.{"\n\n"}
                Just like you always do.{"\n"}
                That's why I love you.
              </Text>
            </View>
            
            <TouchableOpacity
              style={styles.button}
              onPress={() => { playComplete(); router.push('/shake-reveal'); }}
              activeOpacity={0.8}
            >
              <Text style={styles.buttonText}>Continue</Text>
              <Ionicons name="chevron-forward" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </Animated.View>
        )}
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF5F7',
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 16,
    zIndex: 10,
    padding: 8,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '600',
    color: '#4A1942',
    marginTop: 20,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#9B7FA7',
    marginBottom: 40,
  },
  holdContainer: {
    marginVertical: 20,
  },
  holdButton: {
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#FF6B9D',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
    overflow: 'hidden',
  },
  holdButtonActive: {
    shadowOpacity: 0.5,
  },
  progressRing: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    top: 0,
    justifyContent: 'flex-end',
  },
  progressFill: {
    width: '100%',
    borderRadius: 90,
  },
  holdContent: {
    alignItems: 'center',
    zIndex: 1,
  },
  holdText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF6B9D',
    marginTop: 8,
  },
  holdTextActive: {
    color: '#FFFFFF',
  },
  hint: {
    fontSize: 14,
    color: '#9B7FA7',
    fontStyle: 'italic',
    marginTop: 20,
    textAlign: 'center',
  },
  revealedContainer: {
    alignItems: 'center',
    padding: 20,
  },
  revealedTitle: {
    fontSize: 32,
    fontWeight: '600',
    color: '#4A1942',
    marginTop: 16,
    marginBottom: 24,
  },
  messageCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  messageText: {
    fontSize: 18,
    lineHeight: 28,
    color: '#4A1942',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF6B9D',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 25,
    gap: 8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  skipButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 30,
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
