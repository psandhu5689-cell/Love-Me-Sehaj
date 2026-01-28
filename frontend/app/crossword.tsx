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
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAudio } from './_layout';
import { useTheme } from '../src/theme/ThemeContext';
import { ThemedBackground, ThemedCard } from '../src/components/themed';
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get('window');
const CELL_SIZE = Math.min((width - 32) / 8, 40);

const GRID_STRUCTURE = [
  [null, null, null, null, null, null, null, null],
  [null,   1, null, null, null, null, null, null],
  [  2,   '',  '',   '',   '',    3,   '',   ''],
  [null,  '', null, null, null,   '', null, null],
  [  4,   '',    5,   '',   '',   '', null, null],
  [null,  '',   '',    6,   '',   '',   '',   ''],
  [null,  '',   '', null, null,   '', null, null],
  [null,  '',   '', null, null,   '', null, null],
];

const ANSWERS = {
  across: {
    2: { word: 'SOULMATE', row: 2, col: 0, hint: "What you feel like to me" },
    4: { word: 'SEHAJ', row: 4, col: 0, hint: "Her name, my favorite word" },
    6: { word: 'PRABH', row: 5, col: 3, hint: "The name she teases and loves" },
  },
  down: {
    1: { word: 'FOREVER', row: 1, col: 1, hint: "How long I want you" },
    3: { word: 'ALWAYS', row: 2, col: 5, hint: "When I choose you" },
    5: { word: 'HOME', row: 4, col: 2, hint: "Where my heart feels safe" },
  },
};

export default function Crossword() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const [grid, setGrid] = useState<(string | null)[][]>(() => {
    return GRID_STRUCTURE.map(row => 
      row.map(cell => cell === null ? null : '')
    );
  });
  const [selectedCell, setSelectedCell] = useState<{row: number, col: number} | null>(null);
  const [direction, setDirection] = useState<'across' | 'down'>('across');
  const [isComplete, setIsComplete] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const completeAnim = useRef(new Animated.Value(0)).current;
  const inputRefs = useRef<{[key: string]: TextInput | null}>({});
  const { playClick, playSuccess, playComplete } = useAudio();

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  const getCellNumber = (row: number, col: number): number | null => {
    const cell = GRID_STRUCTURE[row]?.[col];
    return typeof cell === 'number' ? cell : null;
  };

  const checkCompletion = (newGrid: (string | null)[][]) => {
    for (const [num, data] of Object.entries(ANSWERS.across)) {
      let word = '';
      for (let i = 0; i < data.word.length; i++) {
        word += newGrid[data.row]?.[data.col + i] || '';
      }
      if (word.toUpperCase() !== data.word) return false;
    }
    
    for (const [num, data] of Object.entries(ANSWERS.down)) {
      let word = '';
      for (let i = 0; i < data.word.length; i++) {
        word += newGrid[data.row + i]?.[data.col] || '';
      }
      if (word.toUpperCase() !== data.word) return false;
    }
    
    return true;
  };

  const handleCellPress = (row: number, col: number) => {
    if (grid[row]?.[col] === null) return;
    
    playClick();
    
    if (selectedCell?.row === row && selectedCell?.col === col) {
      setDirection(d => d === 'across' ? 'down' : 'across');
    } else {
      setSelectedCell({ row, col });
    }
    
    const key = `${row}-${col}`;
    inputRefs.current[key]?.focus();
  };

  const handleInput = (text: string, row: number, col: number) => {
    if (grid[row]?.[col] === null) return;
    
    const letter = text.toUpperCase().slice(-1);
    const newGrid = grid.map(r => [...r]);
    newGrid[row][col] = letter;
    setGrid(newGrid);
    
    if (letter) {
      playSuccess();
      
      let nextRow = row;
      let nextCol = col;
      
      if (direction === 'across') {
        nextCol = col + 1;
        while (nextCol < 8 && grid[row]?.[nextCol] === null) {
          nextCol++;
        }
        if (nextCol >= 8 || grid[row]?.[nextCol] === null) {
          nextCol = col;
        }
      } else {
        nextRow = row + 1;
        while (nextRow < 8 && grid[nextRow]?.[col] === null) {
          nextRow++;
        }
        if (nextRow >= 8 || grid[nextRow]?.[col] === null) {
          nextRow = row;
        }
      }
      
      if (nextRow !== row || nextCol !== col) {
        setSelectedCell({ row: nextRow, col: nextCol });
        const key = `${nextRow}-${nextCol}`;
        setTimeout(() => inputRefs.current[key]?.focus(), 50);
      }
    }
    
    if (checkCompletion(newGrid)) {
      setIsComplete(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      playComplete();
      Keyboard.dismiss();
      Animated.spring(completeAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }).start();
    }
  };

  const handleKeyPress = (e: any, row: number, col: number) => {
    if (e.nativeEvent.key === 'Backspace' && !grid[row]?.[col]) {
      playClick();
      let prevRow = row;
      let prevCol = col;
      
      if (direction === 'across') {
        prevCol = col - 1;
        while (prevCol >= 0 && grid[row]?.[prevCol] === null) {
          prevCol--;
        }
      } else {
        prevRow = row - 1;
        while (prevRow >= 0 && grid[prevRow]?.[col] === null) {
          prevRow--;
        }
      }
      
      if (prevRow >= 0 && prevCol >= 0 && grid[prevRow]?.[prevCol] !== null) {
        setSelectedCell({ row: prevRow, col: prevCol });
        const key = `${prevRow}-${prevCol}`;
        setTimeout(() => inputRefs.current[key]?.focus(), 50);
      }
    }
  };

  const renderCell = (row: number, col: number) => {
    const cellValue = grid[row]?.[col];
    const cellNumber = getCellNumber(row, col);
    const isSelected = selectedCell?.row === row && selectedCell?.col === col;
    const isBlack = cellValue === null;
    
    if (isBlack) {
      return <View key={`${row}-${col}`} style={[styles.cell, { backgroundColor: colors.background }]} />;
    }
    
    return (
      <TouchableOpacity
        key={`${row}-${col}`}
        style={[
          styles.cell,
          { backgroundColor: colors.card, borderColor: colors.border },
          isSelected && { backgroundColor: colors.primaryGlow, borderColor: colors.primary, borderWidth: 2 },
        ]}
        onPress={() => handleCellPress(row, col)}
        activeOpacity={0.7}
      >
        {cellNumber !== null && (
          <Text style={[styles.cellNumber, { color: colors.secondary }]}>{cellNumber}</Text>
        )}
        <TextInput
          ref={(ref) => { inputRefs.current[`${row}-${col}`] = ref; }}
          style={[styles.cellInput, { color: colors.textPrimary }]}
          value={cellValue || ''}
          onChangeText={(text) => handleInput(text, row, col)}
          onKeyPress={(e) => handleKeyPress(e, row, col)}
          maxLength={1}
          autoCapitalize="characters"
          autoCorrect={false}
          onFocus={() => { playClick(); setSelectedCell({ row, col }); }}
          editable={!isComplete}
          selectTextOnFocus
        />
      </TouchableOpacity>
    );
  };

  return (
    <ThemedBackground showFloatingElements={false}>
      <SafeAreaView style={styles.container}>
        <TouchableOpacity
          style={[styles.backButton, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={() => { playClick(); router.back(); }}
          activeOpacity={0.7}
        >
          <Ionicons name="chevron-back" size={24} color={colors.primary} />
        </TouchableOpacity>

        {/* Skip Button - Top Right */}
        {!isComplete && (
          <TouchableOpacity
            style={[styles.skipButtonTop, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => {
              playClick();
              router.push('/card-match');
            }}
            activeOpacity={0.8}
          >
            <Text style={[styles.skipButtonText, { color: colors.textSecondary }]}>Skip</Text>
            <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
          </TouchableOpacity>
        )}

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
              <Text style={[styles.pageLabel, { color: colors.textSecondary }]}>Our Love Crossword</Text>
              <Text style={[styles.subtitle, { color: colors.textMuted }]}>Fill in our story 💕</Text>

              <View style={styles.directionContainer}>
                <TouchableOpacity
                  style={[
                    styles.directionBtn,
                    { backgroundColor: colors.card, borderColor: colors.primary },
                    direction === 'across' && { backgroundColor: colors.primary },
                  ]}
                  onPress={() => { playClick(); setDirection('across'); }}
                >
                  <Ionicons name="arrow-forward" size={16} color={direction === 'across' ? '#FFF' : colors.primary} />
                  <Text style={[styles.directionText, direction === 'across' && styles.directionTextActive]}>Across</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.directionBtn,
                    { backgroundColor: colors.card, borderColor: colors.secondary },
                    direction === 'down' && { backgroundColor: colors.secondary },
                  ]}
                  onPress={() => { playClick(); setDirection('down'); }}
                >
                  <Ionicons name="arrow-down" size={16} color={direction === 'down' ? '#FFF' : colors.secondary} />
                  <Text style={[styles.directionText, { color: colors.secondary }, direction === 'down' && styles.directionTextActive]}>Down</Text>
                </TouchableOpacity>
              </View>

              <View style={[styles.gridContainer, { backgroundColor: colors.background, borderColor: colors.border }]}>
                {GRID_STRUCTURE.map((row, rowIndex) => (
                  <View key={rowIndex} style={styles.gridRow}>
                    {row.map((_, colIndex) => renderCell(rowIndex, colIndex))}
                  </View>
                ))}
              </View>

              <ThemedCard style={styles.cluesContainer}>
                <View style={styles.clueSection}>
                  <Text style={[styles.clueHeader, { color: colors.primary }]}>
                    <Ionicons name="arrow-forward" size={14} color={colors.primary} /> Across
                  </Text>
                  {Object.entries(ANSWERS.across).map(([num, data]) => (
                    <Text key={num} style={[styles.clueText, { color: colors.textSecondary }]}>
                      <Text style={[styles.clueNum, { color: colors.primary }]}>{num}.</Text> {data.hint}
                    </Text>
                  ))}
                </View>
                
                <View style={styles.clueSection}>
                  <Text style={[styles.clueHeader, { color: colors.secondary }]}>
                    <Ionicons name="arrow-down" size={14} color={colors.secondary} /> Down
                  </Text>
                  {Object.entries(ANSWERS.down).map(([num, data]) => (
                    <Text key={num} style={[styles.clueText, { color: colors.textSecondary }]}>
                      <Text style={[styles.clueNum, { color: colors.secondary }]}>{num}.</Text> {data.hint}
                    </Text>
                  ))}
                </View>
              </ThemedCard>

              {isComplete && (
                <Animated.View
                  style={[
                    styles.completeContainer,
                    {
                      backgroundColor: colors.card,
                      opacity: completeAnim,
                      transform: [{ scale: completeAnim }],
                    },
                  ]}
                >
                  <View style={styles.celebrationEmojis}>
                    <Text style={styles.emoji}>🎉</Text>
                    <Text style={styles.emoji}>💕</Text>
                    <Text style={styles.emoji}>🎉</Text>
                  </View>
                  <Ionicons name="heart" size={60} color={colors.primary} />
                  <Text style={[styles.completeTitle, { color: colors.primary }]}>You Did It! 🎉</Text>
                  <Text style={[styles.completeText, { color: colors.textSecondary }]}>
                    You know our love story by heart!
                  </Text>
                  <TouchableOpacity
                    onPress={() => {
                      playComplete();
                      router.push('/card-match');
                    }}
                    activeOpacity={0.9}
                  >
                    <LinearGradient
                      colors={colors.gradientPrimary as any}
                      style={[styles.continueButton, { shadowColor: colors.primary }]}
                    >
                      <Text style={styles.continueButtonText}>Continue</Text>
                      <Ionicons name="chevron-forward" size={20} color="#FFFFFF" />
                    </LinearGradient>
                  </TouchableOpacity>
                </Animated.View>
              )}

            </Animated.View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ThemedBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 16,
    zIndex: 10,
    padding: 10,
    borderRadius: 20,
    borderWidth: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 16,
    paddingBottom: 40,
    paddingTop: 80,
  },
  content: {
    alignItems: 'center',
  },
  pageLabel: {
    fontSize: 14,
    letterSpacing: 3,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 16,
  },
  directionContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  directionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 2,
  },
  directionText: {
    fontSize: 13,
    fontWeight: '600',
  },
  directionTextActive: {
    color: '#FFFFFF',
  },
  gridContainer: {
    padding: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  gridRow: {
    flexDirection: 'row',
  },
  cell: {
    width: CELL_SIZE,
    height: CELL_SIZE,
    margin: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    borderRadius: 4,
    borderWidth: 1,
  },
  cellNumber: {
    position: 'absolute',
    top: 1,
    left: 2,
    fontSize: 8,
    fontWeight: '700',
  },
  cellInput: {
    width: '100%',
    height: '100%',
    textAlign: 'center',
    fontSize: CELL_SIZE * 0.55,
    fontWeight: '700',
    padding: 0,
    marginTop: 4,
  },
  cluesContainer: {
    width: '100%',
    marginTop: 20,
  },
  clueSection: {
    marginBottom: 16,
  },
  clueHeader: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 10,
  },
  clueText: {
    fontSize: 14,
    marginBottom: 8,
    lineHeight: 20,
    paddingLeft: 8,
  },
  clueNum: {
    fontWeight: '700',
  },
  completeContainer: {
    marginTop: 24,
    padding: 28,
    borderRadius: 28,
    alignItems: 'center',
    width: '100%',
  },
  celebrationEmojis: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 10,
  },
  emoji: {
    fontSize: 40,
  },
  completeTitle: {
    fontSize: 32,
    fontWeight: '700',
    marginTop: 12,
  },
  completeText: {
    fontSize: 16,
    textAlign: 'center',
    marginVertical: 12,
  },
  continueButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 25,
    gap: 8,
    marginTop: 8,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  skipButtonTop: {
    position: 'absolute',
    top: 50,
    right: 16,
    zIndex: 10,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    gap: 4,
  },
  skipButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
    gap: 4,
  },
  skipButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
});
