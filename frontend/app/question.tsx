import React, { useState, useEffect, useRef } from 'react';
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
import { useUser, useAudio } from './_layout';

const { width } = Dimensions.get('window');

const REVEAL_LINES = [
  'I already know my answer.',
  'You already have my heart.',
  'So I was hoping...',
];

export default function Question() {
  const router = useRouter();
  const { userName } = useUser();
  const { playMagic, playComplete, playDrumroll, playClick } = useAudio();
  const [currentLine, setCurrentLine] = useState(0);
  const [showQuestion, setShowQuestion] = useState(false);
  const [showButtons, setShowButtons] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const lineAnims = useRef(REVEAL_LINES.map(() => new Animated.Value(0))).current;
  const questionAnim = useRef(new Animated.Value(0)).current;
  const buttonsAnim = useRef(new Animated.Value(0)).current;
  const heartFloat = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();

    // Play drumroll at the start
    playDrumroll();

    // Animate lines sequentially
    const animateLines = async () => {
      for (let i = 0; i < REVEAL_LINES.length; i++) {
        await new Promise<void>((resolve) => {
          setTimeout(() => {
            Animated.timing(lineAnims[i], {
              toValue: 1,
              duration: 800,
              useNativeDriver: true,
            }).start(() => resolve());
          }, i * 1500);
        });
      }

      // After all lines, show the question
      setTimeout(() => {
        setShowQuestion(true);
        Animated.spring(questionAnim, {
          toValue: 1,
          tension: 50,
          friction: 8,
          useNativeDriver: true,
        }).start();

        // Show buttons after question
        setTimeout(() => {
          setShowButtons(true);
          Animated.spring(buttonsAnim, {
            toValue: 1,
            tension: 50,
            friction: 8,
            useNativeDriver: true,
          }).start();
        }, 800);
      }, 1500);
    };

    animateLines();

    // Floating hearts animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(heartFloat, {
          toValue: 1,
          duration: 2500,
          useNativeDriver: true,
        }),
        Animated.timing(heartFloat, {
          toValue: 0,
          duration: 2500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const handleYes = () => {
    playComplete();
    router.push('/celebration');
  };

  const heartTranslateY = heartFloat.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -20],
  });

  return (
    <SafeAreaView style={styles.container}>
      {/* Floating Hearts Background */}
      <View style={styles.heartsBackground}>
        {[...Array(8)].map((_, i) => (
          <Animated.View
            key={i}
            style={[
              styles.floatingHeart,
              {
                left: `${10 + i * 12}%`,
                top: `${5 + (i % 4) * 22}%`,
                opacity: 0.1 + (i % 3) * 0.05,
                transform: [
                  { translateY: heartTranslateY },
                  { scale: 0.4 + (i % 3) * 0.2 },
                ],
              },
            ]}
          >
            <Ionicons name="heart" size={50} color="#FF6B9D" />
          </Animated.View>
        ))}
      </View>

      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        {/* Reveal Lines */}
        <View style={styles.linesContainer}>
          {REVEAL_LINES.map((line, index) => (
            <Animated.View
              key={index}
              style={[
                styles.lineWrapper,
                {
                  opacity: lineAnims[index],
                  transform: [
                    {
                      translateY: lineAnims[index].interpolate({
                        inputRange: [0, 1],
                        outputRange: [30, 0],
                      }),
                    },
                  ],
                },
              ]}
            >
              <Text style={styles.revealLine}>{line}</Text>
            </Animated.View>
          ))}
        </View>

        {/* The Question */}
        {showQuestion && (
          <Animated.View
            style={[
              styles.questionContainer,
              {
                opacity: questionAnim,
                transform: [{ scale: questionAnim }],
              },
            ]}
          >
            <Ionicons name="heart" size={50} color="#FF6B9D" />
            <Text style={styles.questionText}>
              Will you be my Valentine,{"\n"}
              <Text style={styles.nameHighlight}>{userName}</Text>?
            </Text>
          </Animated.View>
        )}

        {/* Yes Buttons */}
        {showButtons && (
          <Animated.View
            style={[
              styles.buttonsContainer,
              {
                opacity: buttonsAnim,
                transform: [
                  {
                    translateY: buttonsAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [40, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            <TouchableOpacity
              style={[styles.yesButton, styles.yesButtonPrimary]}
              onPress={handleYes}
              activeOpacity={0.8}
            >
              <Ionicons name="heart" size={24} color="#FFFFFF" />
              <Text style={styles.yesButtonText}>YES</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.yesButton, styles.yesButtonSecondary]}
              onPress={handleYes}
              activeOpacity={0.8}
            >
              <Ionicons name="heart-outline" size={24} color="#FF6B9D" />
              <Text style={[styles.yesButtonText, styles.yesButtonTextSecondary]}>
                YES
              </Text>
            </TouchableOpacity>
          </Animated.View>
        )}

        {/* Skip Button - only show before the question appears */}
        {!showQuestion && (
          <TouchableOpacity
            style={styles.skipButton}
            onPress={() => {
              playClick();
              router.push('/celebration');
            }}
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
  heartsBackground: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  floatingHeart: {
    position: 'absolute',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  linesContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  lineWrapper: {
    marginBottom: 16,
  },
  revealLine: {
    fontSize: 22,
    fontWeight: '300',
    color: '#6B5B6B',
    textAlign: 'center',
    fontStyle: 'italic',
    letterSpacing: 0.5,
  },
  questionContainer: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 32,
    padding: 36,
    marginBottom: 40,
    shadowColor: '#FF6B9D',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 12,
  },
  questionText: {
    fontSize: 28,
    fontWeight: '300',
    color: '#4A1942',
    textAlign: 'center',
    marginTop: 16,
    lineHeight: 42,
  },
  nameHighlight: {
    fontWeight: '600',
    color: '#FF6B9D',
  },
  buttonsContainer: {
    flexDirection: 'row',
    gap: 16,
  },
  yesButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 18,
    borderRadius: 30,
    gap: 10,
  },
  yesButtonPrimary: {
    backgroundColor: '#FF6B9D',
    shadowColor: '#FF6B9D',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 10,
  },
  yesButtonSecondary: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#FF6B9D',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  yesButtonText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 2,
  },
  yesButtonTextSecondary: {
    color: '#FF6B9D',
  },
});
