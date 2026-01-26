import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Vibration,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAudio } from './_layout';

const CORRECT_CODE = '0711'; // July 11 anniversary

export default function LockScreen() {
  const router = useRouter();
  const { playClick, playSuccess, playComplete } = useAudio();
  const [code, setCode] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [isWrong, setIsWrong] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const unlockAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  useEffect(() => {
    if (code.length === 4) {
      if (code === CORRECT_CODE) {
        playSuccess();
        setIsUnlocked(true);
        Animated.spring(unlockAnim, {
          toValue: 1,
          tension: 50,
          friction: 5,
          useNativeDriver: true,
        }).start();
      } else {
        setIsWrong(true);
        Vibration.vibrate(200);
        Animated.sequence([
          Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
          Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
          Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
          Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
        ]).start(() => {
          setCode('');
          setIsWrong(false);
        });
      }
    }
  }, [code]);

  const handleNumberPress = (num: string) => {
    if (code.length < 4 && !isUnlocked) {
      playClick();
      setCode(prev => prev + num);
    }
  };

  const handleDelete = () => {
    if (code.length > 0 && !isUnlocked) {
      playClick();
      setCode(prev => prev.slice(0, -1));
    }
  };

  const renderDots = () => {
    return (
      <View style={styles.dotsContainer}>
        {[0, 1, 2, 3].map((i) => (
          <View
            key={i}
            style={[
              styles.dot,
              code.length > i && styles.dotFilled,
              isWrong && styles.dotError,
            ]}
          />
        ))}
      </View>
    );
  };

  const renderKeypad = () => {
    return (
      <View style={styles.keypad}>
        <View style={styles.keypadRow}>
          <TouchableOpacity style={styles.key} onPress={() => handleNumberPress('1')} activeOpacity={0.7} disabled={isUnlocked}>
            <Text style={styles.keyText}>1</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.key} onPress={() => handleNumberPress('2')} activeOpacity={0.7} disabled={isUnlocked}>
            <Text style={styles.keyText}>2</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.key} onPress={() => handleNumberPress('3')} activeOpacity={0.7} disabled={isUnlocked}>
            <Text style={styles.keyText}>3</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.keypadRow}>
          <TouchableOpacity style={styles.key} onPress={() => handleNumberPress('4')} activeOpacity={0.7} disabled={isUnlocked}>
            <Text style={styles.keyText}>4</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.key} onPress={() => handleNumberPress('5')} activeOpacity={0.7} disabled={isUnlocked}>
            <Text style={styles.keyText}>5</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.key} onPress={() => handleNumberPress('6')} activeOpacity={0.7} disabled={isUnlocked}>
            <Text style={styles.keyText}>6</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.keypadRow}>
          <TouchableOpacity style={styles.key} onPress={() => handleNumberPress('7')} activeOpacity={0.7} disabled={isUnlocked}>
            <Text style={styles.keyText}>7</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.key} onPress={() => handleNumberPress('8')} activeOpacity={0.7} disabled={isUnlocked}>
            <Text style={styles.keyText}>8</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.key} onPress={() => handleNumberPress('9')} activeOpacity={0.7} disabled={isUnlocked}>
            <Text style={styles.keyText}>9</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.keypadRow}>
          <View style={styles.keyEmpty} />
          <TouchableOpacity style={styles.key} onPress={() => handleNumberPress('0')} activeOpacity={0.7} disabled={isUnlocked}>
            <Text style={styles.keyText}>0</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.key} onPress={handleDelete} activeOpacity={0.7} disabled={isUnlocked}>
            <Ionicons name="backspace-outline" size={28} color="#4A1942" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        {!isUnlocked ? (
          <>
            <Ionicons name="lock-closed" size={60} color="#FF6B9D" />
            <Text style={styles.title}>Secret Message 🔐</Text>
            <Text style={styles.hint}>Hint: Our special day (MMDD)</Text>
            
            <Animated.View style={{ transform: [{ translateX: shakeAnim }] }}>
              {renderDots()}
            </Animated.View>
            
            {renderKeypad()}
            
            <TouchableOpacity
              style={styles.skipButton}
              onPress={() => { playClick(); router.push('/love-meter'); }}
              activeOpacity={0.8}
            >
              <Text style={styles.skipButtonText}>Skip</Text>
              <Ionicons name="chevron-forward" size={16} color="#9B7FA7" />
            </TouchableOpacity>
          </>
        ) : (
          <Animated.View style={[styles.unlockedContainer, { opacity: unlockAnim, transform: [{ scale: unlockAnim }] }]}>
            <Ionicons name="lock-open" size={60} color="#4CAF50" />
            <Text style={styles.unlockedTitle}>🎉 Unlocked! 🎉</Text>
            
            <View style={styles.secretMessage}>
              <Ionicons name="heart" size={30} color="#FF6B9D" />
              <Text style={styles.secretText}>
                You remembered our day! 💕{"\n\n"}
                July 11 is when my life truly began —{"\n"}
                the day I got you.{"\n\n"}
                Every day since has been a gift.{"\n"}
                I love you, forever and always.
              </Text>
            </View>
            
            <TouchableOpacity
              style={styles.button}
              onPress={() => { playComplete(); router.push('/love-meter'); }}
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
    marginTop: 16,
    marginBottom: 8,
  },
  hint: {
    fontSize: 14,
    color: '#9B7FA7',
    marginBottom: 30,
    fontStyle: 'italic',
  },
  dotsContainer: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 40,
  },
  dot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#FF6B9D',
    backgroundColor: 'transparent',
  },
  dotFilled: {
    backgroundColor: '#FF6B9D',
  },
  dotError: {
    borderColor: '#E53935',
    backgroundColor: '#E53935',
  },
  keypad: {
    alignItems: 'center',
    width: 280,
  },
  keypadRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 15,
  },
  key: {
    width: 75,
    height: 75,
    borderRadius: 40,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  keyEmpty: {
    width: 75,
    height: 75,
    backgroundColor: 'transparent',
  },
  keyText: {
    fontSize: 32,
    fontWeight: '500',
    color: '#4A1942',
  },
  unlockedContainer: {
    alignItems: 'center',
    padding: 20,
  },
  unlockedTitle: {
    fontSize: 28,
    fontWeight: '600',
    color: '#4CAF50',
    marginTop: 16,
    marginBottom: 20,
  },
  secretMessage: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  secretText: {
    fontSize: 16,
    lineHeight: 26,
    color: '#4A1942',
    textAlign: 'center',
    marginTop: 16,
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
