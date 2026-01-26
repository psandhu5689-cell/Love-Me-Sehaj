import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Animated,
  ScrollView,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAudio } from './_layout';

interface CrosswordClue {
  number: number;
  clue: string;
  answer: string;
  row: number;
  col: number;
}

const CLUES: CrosswordClue[] = [
  { number: 1, clue: 'What you are to me (my everything)', answer: 'WORLD', row: 0, col: 0 },
  { number: 2, clue: 'The feeling I get when I see you', answer: 'JOY', row: 0, col: 4 },
  { number: 3, clue: 'What my heart does for you', answer: 'BEATS', row: 2, col: 0 },
  { number: 4, clue: 'New nickname', answer: 'POOPYPANTS', row: 4, col: 1 },
];

const SOLUTION_MESSAGE = 'TAKE A SHOWER STINKY';

export default function Crossword() {
  const router = useRouter();
  const [answers, setAnswers] = useState<{ [key: string]: string }>({});
  const [showSolution, setShowSolution] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const solutionAnim = useRef(new Animated.Value(0)).current;
  const { playClick, playSuccess, playComplete } = useAudio();

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  const checkAllCorrect = () => {
    return CLUES.every((clue) => {
      const key = `${clue.number}`;
      return answers[key]?.toUpperCase() === clue.answer;
    });
  };

  const handleAnswerChange = (clue: CrosswordClue, text: string) => {
    const key = `${clue.number}`;
    setAnswers((prev) => ({ ...prev, [key]: text.toUpperCase() }));
  };

  const handleCheckAnswers = () => {
    Keyboard.dismiss();
    playClick();
    if (checkAllCorrect()) {
      playComplete();
      setShowSolution(true);
      Animated.spring(solutionAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }).start();
    }
  };

  const getAnswerStatus = (clue: CrosswordClue) => {
    const key = `${clue.number}`;
    const answer = answers[key] || '';
    if (!answer) return 'empty';
    if (answer.toUpperCase() === clue.answer) return 'correct';
    return 'incorrect';
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
            <Text style={styles.pageLabel}>Crossword Puzzle</Text>
            <Text style={styles.subtitle}>
              Solve all clues to reveal a special message
            </Text>

            {/* Clues and Inputs */}
            <View style={styles.cluesContainer}>
              {CLUES.map((clue) => {
                const status = getAnswerStatus(clue);
                return (
                  <View key={`${clue.number}`} style={styles.clueCard}>
                    <View style={styles.clueHeader}>
                      <View style={styles.clueNumber}>
                        <Text style={styles.clueNumberText}>{clue.number}</Text>
                      </View>
                      {status === 'correct' && (
                        <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
                      )}
                    </View>
                    <Text style={styles.clueText}>{clue.clue}</Text>
                    <TextInput
                      style={[
                        styles.answerInput,
                        status === 'correct' && styles.correctInput,
                        status === 'incorrect' && styles.incorrectInput,
                      ]}
                      value={answers[`${clue.number}`] || ''}
                      onChangeText={(text) => handleAnswerChange(clue, text)}
                      maxLength={clue.answer.length}
                      autoCapitalize="characters"
                      placeholder={`${clue.answer.length} letters`}
                      placeholderTextColor="#C9A7C9"
                      editable={!showSolution}
                    />
                  </View>
                );
              })}
            </View>

            {!showSolution && (
              <TouchableOpacity
                style={styles.checkButton}
                onPress={handleCheckAnswers}
                activeOpacity={0.8}
              >
                <Ionicons name="checkmark-done" size={20} color="#FFFFFF" />
                <Text style={styles.checkButtonText}>Check Answers</Text>
              </TouchableOpacity>
            )}

            {/* Solution Message */}
            {showSolution && (
              <Animated.View
                style={[
                  styles.solutionContainer,
                  {
                    opacity: solutionAnim,
                    transform: [{ scale: solutionAnim }],
                  },
                ]}
              >
                <View style={styles.solutionHeader}>
                  <Ionicons name="heart" size={30} color="#FF6B9D" />
                  <Text style={styles.solutionLabel}>The hidden message:</Text>
                </View>
                <Text style={styles.solutionText}>{SOLUTION_MESSAGE}</Text>
                <TouchableOpacity
                  style={styles.continueButton}
                  onPress={() => {
                    playSuccess();
                    router.push('/poems');
                  }}
                  activeOpacity={0.8}
                >
                  <Text style={styles.continueButtonText}>Continue</Text>
                  <Ionicons name="chevron-forward" size={20} color="#FFFFFF" />
                </TouchableOpacity>
              </Animated.View>
            )}
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF5F7',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
  },
  content: {
    alignItems: 'center',
  },
  pageLabel: {
    fontSize: 14,
    color: '#9B7FA7',
    letterSpacing: 3,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: '#6B5B6B',
    textAlign: 'center',
    marginBottom: 24,
  },
  cluesContainer: {
    width: '100%',
    gap: 16,
  },
  clueCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  clueHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  clueNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FF6B9D',
    justifyContent: 'center',
    alignItems: 'center',
  },
  clueNumberText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  clueText: {
    fontSize: 15,
    color: '#4A1942',
    marginBottom: 12,
    lineHeight: 22,
  },
  answerInput: {
    backgroundColor: '#F8F4F9',
    borderWidth: 2,
    borderColor: '#E8D8E8',
    borderRadius: 12,
    padding: 14,
    fontSize: 18,
    fontWeight: '600',
    color: '#4A1942',
    textAlign: 'center',
    letterSpacing: 4,
  },
  correctInput: {
    borderColor: '#4CAF50',
    backgroundColor: '#E8F5E9',
  },
  incorrectInput: {
    borderColor: '#FF6B9D',
  },
  checkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#9B59B6',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 30,
    gap: 10,
    marginTop: 24,
    shadowColor: '#9B59B6',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },
  checkButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  solutionContainer: {
    marginTop: 30,
    padding: 28,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    alignItems: 'center',
    shadowColor: '#FF6B9D',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
    width: '100%',
  },
  solutionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  solutionLabel: {
    fontSize: 14,
    color: '#9B7FA7',
  },
  solutionText: {
    fontSize: 22,
    fontWeight: '600',
    color: '#FF6B9D',
    textAlign: 'center',
    letterSpacing: 1,
    marginBottom: 20,
  },
  continueButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF6B9D',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 25,
    gap: 8,
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
