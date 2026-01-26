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
const CELL_SIZE = Math.min((width - 32) / 6, 44);

// Grid: 6 columns x 11 rows
// null = black cell, number or '' = white cell
// All intersections verified!

const GRID_STRUCTURE = [
  // 0    1    2    3    4    5
  [null, null, null, null, null, null], // row 0
  [null, null, null, null, null, null], // row 1
  [null,  1,  '',   '',  null, null],   // row 2: HUG (1-3), HOME starts
  [ 2,   '',  '',   '',  null, null],   // row 3: LOVE (0-3)
  [ 3,   '',  null, null, null, null],  // row 4: US (0-1)
  [ 4,   '',   5,    6,   '',  null],   // row 5: SEHAJ (0-4), HEART & ALWAYS start
  [null, null, '',  '',  null, null],   // row 6: HEART E, ALWAYS L
  [null, null, '',  '',  null, null],   // row 7: HEART A, ALWAYS W
  [null,  7,  '',   '',   '',   ''],    // row 8: PRABH (1-5)
  [null, null, '',  '',  null, null],   // row 9: HEART T, ALWAYS Y
  [null,  8,  '',   '',   '',  null],   // row 10: KISS (1-4)
];

// Answers - All intersections verified!
const ANSWERS = {
  across: {
    1: { word: 'HUG', row: 2, col: 1, hint: "My favorite kind of therapy" },
    2: { word: 'LOVE', row: 3, col: 0, hint: "What started everything" },
    4: { word: 'SEHAJ', row: 5, col: 0, hint: "Her name, my favorite word" },
    7: { word: 'PRABH', row: 8, col: 1, hint: "The name she teases and loves" },
    8: { word: 'KISS', row: 10, col: 1, hint: "Something I owe you" },
  },
  down: {
    1: { word: 'HOME', row: 2, col: 1, hint: "Where my heart feels safe" },
    3: { word: 'US', row: 4, col: 0, hint: "Not me. Not you. Something better." },
    5: { word: 'HEART', row: 5, col: 2, hint: "What you hold" },
    6: { word: 'ALWAYS', row: 5, col: 3, hint: "When I choose you" },
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
        while (nextCol < 6 && grid[row]?.[nextCol] === null) {
          nextCol++;
        }
        if (nextCol >= 6 || grid[row]?.[nextCol] === null) {
          nextCol = col;
        }
      } else {
        nextRow = row + 1;
        while (nextRow < 11 && grid[nextRow]?.[col] === null) {
          nextRow++;
        }
        if (nextRow >= 11 || grid[nextRow]?.[col] === null) {
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
          onFocus={() => setSelectedCell({ row, col })}
          editable={!isComplete}
          selectTextOnFocus
        />
      </TouchableOpacity>
    );
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
                <Ionicons name="heart" size={50} color="#FF6B9D" />
                <Text style={styles.completeTitle}>Perfect! 🎉</Text>
                <Text style={styles.completeText}>
                  You know our love story by heart!
                </Text>
                <TouchableOpacity
                  style={styles.continueButton}
                  onPress={() => {
                    playComplete();
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
});
