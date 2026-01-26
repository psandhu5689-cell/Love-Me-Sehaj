import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import { useAudio } from './_layout';

const { width } = Dimensions.get('window');

export default function LoveMeter() {
  const router = useRouter();
  const { playClick, playSuccess, playComplete } = useAudio();
  const [sliderValue, setSliderValue] = useState(0);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [showMessage, setShowMessage] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const fillAnim = useRef(new Animated.Value(0)).current;
  const messageAnim = useRef(new Animated.Value(0)).current;
  const heartPulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();

    // Heart pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(heartPulse, {
          toValue: 1.2,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(heartPulse, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const handleSliderChange = (value: number) => {
    setSliderValue(value);
    if (!hasInteracted) {
      setHasInteracted(true);
    }
  };

  const handleSliderComplete = () => {
    playSuccess();
    // Always fill to 100% no matter where they slide
    Animated.timing(fillAnim, {
      toValue: 100,
      duration: 1000,
      useNativeDriver: false,
    }).start(() => {
      setShowMessage(true);
      Animated.spring(messageAnim, {
        toValue: 1,
        tension: 50,
        friction: 5,
        useNativeDriver: true,
      }).start();
    });
  };

  const displayValue = fillAnim.interpolate({
    inputRange: [0, 100],
    outputRange: [0, 100],
  });

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
        <Animated.View style={{ transform: [{ scale: heartPulse }] }}>
          <Ionicons name="heart" size={80} color="#FF6B9D" />
        </Animated.View>
        
        <Text style={styles.title}>Love Meter 💕</Text>
        <Text style={styles.subtitle}>How much do I love you?</Text>
        
        {/* Love Meter Display */}
        <View style={styles.meterContainer}>
          <View style={styles.meterBackground}>
            <Animated.View 
              style={[
                styles.meterFill,
                { 
                  width: hasInteracted 
                    ? fillAnim.interpolate({
                        inputRange: [0, 100],
                        outputRange: ['0%', '100%'],
                      })
                    : `${sliderValue}%`
                }
              ]} 
            />
          </View>
          <Text style={styles.meterValue}>
            {hasInteracted && showMessage ? '100' : Math.round(sliderValue)}%
          </Text>
        </View>
        
        {/* Slider */}
        {!showMessage && (
          <View style={styles.sliderContainer}>
            <Text style={styles.sliderLabel}>Slide to measure</Text>
            <Slider
              style={styles.slider}
              minimumValue={0}
              maximumValue={100}
              value={sliderValue}
              onValueChange={handleSliderChange}
              onSlidingComplete={handleSliderComplete}
              minimumTrackTintColor="#FF6B9D"
              maximumTrackTintColor="#FFD6E6"
              thumbTintColor="#FF6B9D"
            />
          </View>
        )}
        
        {/* Message */}
        {showMessage && (
          <Animated.View style={[styles.messageContainer, { opacity: messageAnim, transform: [{ scale: messageAnim }] }]}>
            <View style={styles.brokenBadge}>
              <Ionicons name="construct" size={24} color="#FF6B9D" />
              <Text style={styles.brokenText}>BROKEN</Text>
            </View>
            <Text style={styles.messageText}>
              Sorry, it's broken...{"\n"}
              It only shows 100% 💕
            </Text>
            <Text style={styles.subMessage}>
              No matter what, my love for you is always at maximum.
            </Text>
            
            <TouchableOpacity
              style={styles.button}
              onPress={() => { playComplete(); router.push('/hold-reveal'); }}
              activeOpacity={0.8}
            >
              <Text style={styles.buttonText}>Continue</Text>
              <Ionicons name="chevron-forward" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </Animated.View>
        )}
        
        {!showMessage && (
          <TouchableOpacity
            style={styles.skipButton}
            onPress={() => { playClick(); router.push('/hold-reveal'); }}
            activeOpacity={0.8}
          >
            <Text style={styles.skipButtonText}>Skip</Text>
            <Ionicons name="chevron-forward" size={16} color="#9B7FA7" />
          </TouchableOpacity>
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
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: '600',
    color: '#4A1942',
    marginTop: 20,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: '#9B7FA7',
    marginBottom: 40,
  },
  meterContainer: {
    width: width - 80,
    alignItems: 'center',
    marginBottom: 30,
  },
  meterBackground: {
    width: '100%',
    height: 40,
    backgroundColor: '#FFD6E6',
    borderRadius: 20,
    overflow: 'hidden',
  },
  meterFill: {
    height: '100%',
    backgroundColor: '#FF6B9D',
    borderRadius: 20,
  },
  meterValue: {
    fontSize: 48,
    fontWeight: '700',
    color: '#FF6B9D',
    marginTop: 16,
  },
  sliderContainer: {
    width: width - 80,
    alignItems: 'center',
  },
  sliderLabel: {
    fontSize: 14,
    color: '#9B7FA7',
    marginBottom: 10,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  messageContainer: {
    alignItems: 'center',
    padding: 20,
  },
  brokenBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF0F5',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    gap: 8,
    marginBottom: 16,
  },
  brokenText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FF6B9D',
    letterSpacing: 2,
  },
  messageText: {
    fontSize: 24,
    fontWeight: '600',
    color: '#4A1942',
    textAlign: 'center',
    marginBottom: 12,
  },
  subMessage: {
    fontSize: 16,
    color: '#9B7FA7',
    textAlign: 'center',
    marginBottom: 30,
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
