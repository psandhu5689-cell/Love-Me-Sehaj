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
import { useAudio } from './_layout';

const { width } = Dimensions.get('window');
const CELL_SIZE = Math.min((width - 32) / 8, 40);

// Grid: 8 columns x 8 rows
// null = black cell, number or '' = white cell
// 6 words: SOULMATE, FOREVER, ALWAYS, HOME, SEHAJ, PRABH

const GRID_STRUCTURE = [
  //0     1     2     3     4     5     6     7
  [null, null, null, null, null, null, null, null], // row 0
  [null,   1, null, null, null, null, null, null],  // row 1: FOREVER starts
  [  2,   '',  '',   '',   '',    3,   '',   ''],   // row 2: SOULMATE, ALWAYS starts
  [null,  '', null, null, null,   '', null, null],  // row 3
  [  4,   '',    5,   '',   '',   '', null, null],  // row 4: SEHAJ, HOME starts
  [null,  '',   '',    6,   '',   '',   '',   ''],  // row 5: PRABH
  [null,  '',   '', null, null,   '', null, null],  // row 6
  [null,  '',   '', null, null,   '', null, null],  // row 7
];

// Answers - 6 words with verified intersections
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
  const [grid, setGrid] = useState<(string | null)[][]>(() => {
    // Initialize grid with empty strings for white cells
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
    // Check all across words
    for (const [num, data] of Object.entries(ANSWERS.across)) {
      let word = '';
      for (let i = 0; i < data.word.length; i++) {
        word += newGrid[data.row]?.[data.col + i] || '';
      }
      if (word.toUpperCase() !== data.word) return false;
    }
    
    // Check all down words
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
    
    // Focus the input
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
      
      // Move to next cell
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
    
    // Check completion
    if (checkCompletion(newGrid)) {
      setIsComplete(true);
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
      playClick(); // Cute sound on backspace
      // Move back on backspace if cell is empty
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
      return <View key={`${row}-${col}`} style={[styles.cell, styles.blackCell]} />;
    }
    
    return (
      <TouchableOpacity
        key={`${row}-${col}`}
        style={[
          styles.cell,
          styles.whiteCell,
          isSelected && styles.selectedCell,
        ]}
        onPress={() => handleCellPress(row, col)}
        activeOpacity={0.7}
      >
        {cellNumber !== null && (
          <Text style={styles.cellNumber}>{cellNumber}</Text>
        )}
        <TextInput
          ref={(ref) => { inputRefs.current[`${row}-${col}`] = ref; }}
          style={styles.cellInput}
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
    <SafeAreaView style={styles.container}>
      {/* Back Button */}
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => { playClick(); router.back(); }}
        activeOpacity={0.7}
      >
        <Ionicons name="chevron-back" size={28} color="#FF6B9D" />
      </TouchableOpacity>

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
            <Text style={styles.pageLabel}>Our Love Crossword</Text>
            <Text style={styles.subtitle}>Fill in our story 💕</Text>

            {/* Direction Toggle */}
            <View style={styles.directionContainer}>
              <TouchableOpacity
                style={[styles.directionBtn, direction === 'across' && styles.directionBtnActive]}
                onPress={() => { playClick(); setDirection('across'); }}
              >
                <Ionicons name="arrow-forward" size={16} color={direction === 'across' ? '#FFF' : '#FF6B9D'} />
                <Text style={[styles.directionText, direction === 'across' && styles.directionTextActive]}>Across</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.directionBtn, direction === 'down' && styles.directionBtnActive]}
                onPress={() => { playClick(); setDirection('down'); }}
              >
                <Ionicons name="arrow-down" size={16} color={direction === 'down' ? '#FFF' : '#FF6B9D'} />
                <Text style={[styles.directionText, direction === 'down' && styles.directionTextActive]}>Down</Text>
              </TouchableOpacity>
            </View>

            {/* Crossword Grid */}
            <View style={styles.gridContainer}>
              {GRID_STRUCTURE.map((row, rowIndex) => (
                <View key={rowIndex} style={styles.gridRow}>
                  {row.map((_, colIndex) => renderCell(rowIndex, colIndex))}
                </View>
              ))}
            </View>

            {/* Clues */}
            <View style={styles.cluesContainer}>
              <View style={styles.clueSection}>
                <Text style={styles.clueHeader}>
                  <Ionicons name="arrow-forward" size={14} color="#FF6B9D" /> Across
                </Text>
                {Object.entries(ANSWERS.across).map(([num, data]) => (
                  <Text key={num} style={styles.clueText}>
                    <Text style={styles.clueNum}>{num}.</Text> {data.hint}
                  </Text>
                ))}
              </View>
              
              <View style={styles.clueSection}>
                <Text style={styles.clueHeader}>
                  <Ionicons name="arrow-down" size={14} color="#9B59B6" /> Down
                </Text>
                {Object.entries(ANSWERS.down).map(([num, data]) => (
                  <Text key={num} style={styles.clueText}>
                    <Text style={styles.clueNum}>{num}.</Text> {data.hint}
                  </Text>
                ))}
              </View>
            </View>

            {/* Completion */}
            {isComplete && (
              <Animated.View
                style={[
                  styles.completeContainer,
                  {
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
                <Ionicons name="heart" size={60} color="#FF6B9D" />
                <Text style={styles.completeTitle}>You Did It! 🎉</Text>
                <Text style={styles.completeText}>
                  You know our love story by heart!
                </Text>
                <View style={styles.starRow}>
                  <Ionicons name="star" size={24} color="#FFD700" />
                  <Ionicons name="star" size={24} color="#FFD700" />
                  <Ionicons name="star" size={24} color="#FFD700" />
                </View>
                <TouchableOpacity
                  style={styles.continueButton}
                  onPress={() => {
                    playComplete();
                    router.push('/card-match');
                  }}
                  activeOpacity={0.8}
                >
                  <Text style={styles.continueButtonText}>Continue</Text>
                  <Ionicons name="chevron-forward" size={20} color="#FFFFFF" />
                </TouchableOpacity>
              </Animated.View>
            )}

            {/* Skip Button */}
            {!isComplete && (
              <TouchableOpacity
                style={styles.skipButton}
                onPress={() => {
                  playClick();
                  router.push('/card-match');
                }}
                activeOpacity={0.8}
              >
                <Text style={styles.skipButtonText}>Skip</Text>
                <Ionicons name="chevron-forward" size={16} color="#9B7FA7" />
              </TouchableOpacity>
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
  backButton: {
    position: 'absolute',
    top: 50,
    left: 16,
    zIndex: 10,
    padding: 8,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 16,
    paddingBottom: 40,
  },
  content: {
    alignItems: 'center',
  },
  pageLabel: {
    fontSize: 14,
    color: '#9B7FA7',
    letterSpacing: 3,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B5B6B',
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
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#FF6B9D',
  },
  directionBtnActive: {
    backgroundColor: '#FF6B9D',
  },
  directionText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FF6B9D',
  },
  directionTextActive: {
    color: '#FFFFFF',
  },
  gridContainer: {
    backgroundColor: '#4A1942',
    padding: 3,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
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
  },
  blackCell: {
    backgroundColor: '#4A1942',
  },
  whiteCell: {
    backgroundColor: '#FFFFFF',
    borderRadius: 3,
  },
  selectedCell: {
    backgroundColor: '#FFE4EC',
    borderWidth: 2,
    borderColor: '#FF6B9D',
  },
  cellNumber: {
    position: 'absolute',
    top: 1,
    left: 2,
    fontSize: 8,
    fontWeight: '700',
    color: '#9B59B6',
  },
  cellInput: {
    width: '100%',
    height: '100%',
    textAlign: 'center',
    fontSize: CELL_SIZE * 0.55,
    fontWeight: '700',
    color: '#4A1942',
    padding: 0,
    marginTop: 4,
  },
  cluesContainer: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  clueSection: {
    marginBottom: 16,
  },
  clueHeader: {
    fontSize: 15,
    fontWeight: '700',
    color: '#4A1942',
    marginBottom: 10,
  },
  clueText: {
    fontSize: 14,
    color: '#5A4A5A',
    marginBottom: 8,
    lineHeight: 20,
    paddingLeft: 8,
  },
  clueNum: {
    fontWeight: '700',
    color: '#FF6B9D',
  },
  completeContainer: {
    marginTop: 24,
    padding: 28,
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    alignItems: 'center',
    shadowColor: '#FF6B9D',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
    width: '100%',
  },
  completeTitle: {
    fontSize: 28,
    fontWeight: '600',
    color: '#FF6B9D',
    marginTop: 12,
  },
  completeText: {
    fontSize: 16,
    color: '#5A4A5A',
    textAlign: 'center',
    marginVertical: 12,
  },
  continueButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF6B9D',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 25,
    gap: 8,
    marginTop: 8,
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
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
    color: '#9B7FA7',
    fontWeight: '500',
  },
});
