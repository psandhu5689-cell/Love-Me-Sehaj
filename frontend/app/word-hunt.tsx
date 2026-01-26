import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  ScrollView,
  Dimensions,
  PanResponder,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAudio } from './_layout';

const { width } = Dimensions.get('window');
const GRID_SIZE = 15;
const CELL_SIZE = Math.floor((width - 32) / GRID_SIZE);

// Words to find
const WORDS_TO_FIND = [
  'SOULMATE',
  'TOGETHER', 
  'FOREVER',
  'PROMISE',
  'KISSING',
  'DATING',
  'SEHAJ',
  'PRABH',
  'HEART',
  'LOYAL',
  'HOME',
  'TRUST',
  'LOVE',
  'HUG',
];

// Generate grid with words placed
const generateGrid = () => {
  // Initialize empty grid
  const grid: string[][] = Array(GRID_SIZE).fill(null).map(() => 
    Array(GRID_SIZE).fill('')
  );
  
  // Word placements (row, col, direction: 'H'=horizontal, 'V'=vertical, 'D'=diagonal)
  const placements: {word: string, row: number, col: number, dir: 'H' | 'V' | 'D'}[] = [
    { word: 'TOGETHER', row: 1, col: 3, dir: 'H' },
    { word: 'SOULMATE', row: 3, col: 0, dir: 'H' },
    { word: 'FOREVER', row: 7, col: 4, dir: 'H' },
    { word: 'PROMISE', row: 9, col: 7, dir: 'H' },
    { word: 'SEHAJ', row: 12, col: 9, dir: 'H' },
    { word: 'PRABH', row: 5, col: 10, dir: 'V' },
    { word: 'HEART', row: 0, col: 0, dir: 'V' },
    { word: 'LOYAL', row: 2, col: 14, dir: 'V' },
    { word: 'TRUST', row: 10, col: 2, dir: 'V' },
    { word: 'LOVE', row: 4, col: 6, dir: 'D' },
    { word: 'HOME', row: 8, col: 0, dir: 'H' },
    { word: 'KISSING', row: 6, col: 0, dir: 'H' },
    { word: 'DATING', row: 11, col: 0, dir: 'H' },
    { word: 'HUG', row: 0, col: 12, dir: 'V' },
  ];
  
  // Place words
  placements.forEach(({ word, row, col, dir }) => {
    for (let i = 0; i < word.length; i++) {
      if (dir === 'H') {
        if (row < GRID_SIZE && col + i < GRID_SIZE) {
          grid[row][col + i] = word[i];
        }
      } else if (dir === 'V') {
        if (row + i < GRID_SIZE && col < GRID_SIZE) {
          grid[row + i][col] = word[i];
        }
      } else if (dir === 'D') {
        if (row + i < GRID_SIZE && col + i < GRID_SIZE) {
          grid[row + i][col + i] = word[i];
        }
      }
    }
  });
  
  // Fill empty cells with random letters
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      if (!grid[r][c]) {
        grid[r][c] = letters[Math.floor(Math.random() * letters.length)];
      }
    }
  }
  
  return { grid, placements };
};

// Store word positions for checking
const getWordCells = (placements: any[]) => {
  const wordCells: { [word: string]: { row: number, col: number }[] } = {};
  
  placements.forEach(({ word, row, col, dir }) => {
    wordCells[word] = [];
    for (let i = 0; i < word.length; i++) {
      if (dir === 'H') {
        wordCells[word].push({ row, col: col + i });
      } else if (dir === 'V') {
        wordCells[word].push({ row: row + i, col });
      } else if (dir === 'D') {
        wordCells[word].push({ row: row + i, col: col + i });
      }
    }
  });
  
  return wordCells;
};

export default function WordHunt() {
  const router = useRouter();
  const [{ grid, placements }] = useState(generateGrid);
  const [wordCells] = useState(() => getWordCells(placements));
  const [foundWords, setFoundWords] = useState<Set<string>>(new Set());
  const [selectedCells, setSelectedCells] = useState<{row: number, col: number}[]>([]);
  const [highlightedCells, setHighlightedCells] = useState<Set<string>>(new Set());
  const [isSelecting, setIsSelecting] = useState(false);
  const [startCell, setStartCell] = useState<{row: number, col: number} | null>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const celebrateAnim = useRef(new Animated.Value(0)).current;
  const gridRef = useRef<View>(null);
  const [gridLayout, setGridLayout] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const { playSuccess, playComplete, playClick } = useAudio();

  const allWordsFound = foundWords.size === WORDS_TO_FIND.length;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  useEffect(() => {
    if (allWordsFound) {
      playComplete();
      Animated.spring(celebrateAnim, {
        toValue: 1,
        tension: 50,
        friction: 5,
        useNativeDriver: true,
      }).start();
    }
  }, [allWordsFound]);

  const getCellKey = (row: number, col: number) => `${row}-${col}`;

  const checkSelection = (cells: {row: number, col: number}[]) => {
    // Get selected letters
    const selectedWord = cells.map(c => grid[c.row]?.[c.col] || '').join('');
    const reversedWord = selectedWord.split('').reverse().join('');
    
    // Check if matches any word
    for (const word of WORDS_TO_FIND) {
      if (!foundWords.has(word) && (selectedWord === word || reversedWord === word)) {
        // Found a word!
        playSuccess();
        setFoundWords(prev => new Set([...prev, word]));
        
        // Highlight these cells permanently
        const newHighlighted = new Set(highlightedCells);
        cells.forEach(c => newHighlighted.add(getCellKey(c.row, c.col)));
        setHighlightedCells(newHighlighted);
        
        return true;
      }
    }
    return false;
  };

  // Calculate cells between start and current position (line selection)
  const getCellsInLine = (start: {row: number, col: number}, end: {row: number, col: number}) => {
    const cells: {row: number, col: number}[] = [];
    const rowDiff = end.row - start.row;
    const colDiff = end.col - start.col;
    
    // Determine direction
    const steps = Math.max(Math.abs(rowDiff), Math.abs(colDiff));
    if (steps === 0) {
      cells.push(start);
      return cells;
    }
    
    const rowStep = rowDiff === 0 ? 0 : rowDiff / Math.abs(rowDiff);
    const colStep = colDiff === 0 ? 0 : colDiff / Math.abs(colDiff);
    
    // Only allow straight lines (horizontal, vertical, diagonal)
    if (rowDiff !== 0 && colDiff !== 0 && Math.abs(rowDiff) !== Math.abs(colDiff)) {
      // Not a valid line, just return start cell
      cells.push(start);
      return cells;
    }
    
    for (let i = 0; i <= steps; i++) {
      const row = start.row + Math.round(i * rowStep);
      const col = start.col + Math.round(i * colStep);
      if (row >= 0 && row < GRID_SIZE && col >= 0 && col < GRID_SIZE) {
        cells.push({ row, col });
      }
    }
    
    return cells;
  };

  const getCellFromPosition = (pageX: number, pageY: number) => {
    if (gridLayout.width === 0) return null;
    
    const relativeX = pageX - gridLayout.x;
    const relativeY = pageY - gridLayout.y;
    
    const col = Math.floor(relativeX / CELL_SIZE);
    const row = Math.floor(relativeY / CELL_SIZE);
    
    if (row >= 0 && row < GRID_SIZE && col >= 0 && col < GRID_SIZE) {
      return { row, col };
    }
    return null;
  };

  const handleTouchStart = (event: any) => {
    const touch = event.nativeEvent;
    const cell = getCellFromPosition(touch.pageX, touch.pageY);
    if (cell) {
      playClick();
      setIsSelecting(true);
      setStartCell(cell);
      setSelectedCells([cell]);
    }
  };

  const handleTouchMove = (event: any) => {
    if (!isSelecting || !startCell) return;
    
    const touch = event.nativeEvent;
    const currentCell = getCellFromPosition(touch.pageX, touch.pageY);
    
    if (currentCell) {
      const newCells = getCellsInLine(startCell, currentCell);
      if (JSON.stringify(newCells) !== JSON.stringify(selectedCells)) {
        playClick();
        setSelectedCells(newCells);
      }
    }
  };

  const handleTouchEnd = () => {
    if (selectedCells.length > 1) {
      checkSelection(selectedCells);
    }
    setIsSelecting(false);
    setStartCell(null);
    setSelectedCells([]);
  };

  const handleGridLayout = (event: any) => {
    const { x, y, width, height } = event.nativeEvent.layout;
    gridRef.current?.measureInWindow((pageX, pageY) => {
      setGridLayout({ x: pageX, y: pageY, width, height });
    });
  };

  const isCellSelected = (row: number, col: number) => {
    return selectedCells.some(c => c.row === row && c.col === col);
  };

  const isCellHighlighted = (row: number, col: number) => {
    return highlightedCells.has(getCellKey(row, col));
  };

  const getWordColor = (word: string) => {
    const colors = ['#FF6B9D', '#9B59B6', '#FFB347', '#4CAF50', '#3498DB', '#E74C3C', '#1ABC9C'];
    const index = WORDS_TO_FIND.indexOf(word) % colors.length;
    return colors[index];
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
          <Text style={styles.pageLabel}>Word Search</Text>
          <Text style={styles.subtitle}>Find all our special words! 💕</Text>

          {/* Progress */}
          <View style={styles.progressContainer}>
            <Text style={styles.progressText}>
              {foundWords.size} / {WORDS_TO_FIND.length} words found
            </Text>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${(foundWords.size / WORDS_TO_FIND.length) * 100}%` },
                ]}
              />
            </View>
          </View>

          {/* Word Grid */}
          <View 
            ref={gridRef}
            style={styles.gridContainer}
            onLayout={handleGridLayout}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {grid.map((row, rowIndex) => (
              <View key={rowIndex} style={styles.gridRow}>
                {row.map((letter, colIndex) => {
                  const isSelected = isCellSelected(rowIndex, colIndex);
                  const isHighlighted = isCellHighlighted(rowIndex, colIndex);
                  
                  return (
                    <View
                      key={colIndex}
                      style={[
                        styles.cell,
                        isSelected && styles.selectedCell,
                        isHighlighted && styles.highlightedCell,
                      ]}
                    >
                      <Text
                        style={[
                          styles.cellText,
                          isSelected && styles.selectedCellText,
                          isHighlighted && styles.highlightedCellText,
                        ]}
                      >
                        {letter}
                      </Text>
                    </View>
                  );
                })}
              </View>
            ))}
          </View>

          {/* Instruction */}
          <Text style={styles.instruction}>
            Drag across letters to select words 💕
          </Text>

          {/* Word List */}
          <View style={styles.wordListContainer}>
            <Text style={styles.wordListTitle}>Words to find:</Text>
            <View style={styles.wordList}>
              {WORDS_TO_FIND.map((word) => (
                <View
                  key={word}
                  style={[
                    styles.wordChip,
                    foundWords.has(word) && styles.wordChipFound,
                  ]}
                >
                  <Text
                    style={[
                      styles.wordChipText,
                      foundWords.has(word) && styles.wordChipTextFound,
                    ]}
                  >
                    {word}
                  </Text>
                  {foundWords.has(word) && (
                    <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                  )}
                </View>
              ))}
            </View>
          </View>

          {/* Completion */}
          {allWordsFound && (
            <Animated.View
              style={[
                styles.completionContainer,
                {
                  opacity: celebrateAnim,
                  transform: [{ scale: celebrateAnim }],
                },
              ]}
            >
              <Ionicons name="heart" size={50} color="#FF6B9D" />
              <Text style={styles.completionTitle}>Amazing! 🎉</Text>
              <Text style={styles.completionText}>
                "You found every word. I found my person."
              </Text>
              <TouchableOpacity
                style={styles.button}
                onPress={() => {
                  playComplete();
                  router.push('/crossword');
                }}
                activeOpacity={0.8}
              >
                <Text style={styles.buttonText}>Continue</Text>
                <Ionicons name="chevron-forward" size={20} color="#FFFFFF" />
              </TouchableOpacity>
            </Animated.View>
          )}
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF5F7',
  },
  scrollContent: {
    flexGrow: 1,
    padding: 16,
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
    marginBottom: 12,
  },
  progressContainer: {
    width: '100%',
    marginBottom: 16,
    alignItems: 'center',
  },
  progressText: {
    fontSize: 14,
    color: '#9B7FA7',
    marginBottom: 6,
    fontWeight: '600',
  },
  progressBar: {
    width: '100%',
    height: 8,
    backgroundColor: '#FFE4EC',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FF6B9D',
    borderRadius: 4,
  },
  gridContainer: {
    backgroundColor: '#FFFFFF',
    padding: 4,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  gridRow: {
    flexDirection: 'row',
  },
  cell: {
    width: CELL_SIZE,
    height: CELL_SIZE,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
    margin: 1,
    borderRadius: 4,
  },
  selectedCell: {
    backgroundColor: '#FFE4EC',
    borderWidth: 2,
    borderColor: '#FF6B9D',
  },
  highlightedCell: {
    backgroundColor: '#FF6B9D',
  },
  cellText: {
    fontSize: CELL_SIZE * 0.55,
    fontWeight: '700',
    color: '#4A1942',
  },
  selectedCellText: {
    color: '#FF6B9D',
  },
  highlightedCellText: {
    color: '#FFFFFF',
  },
  instruction: {
    fontSize: 12,
    color: '#9B7FA7',
    marginTop: 12,
    fontStyle: 'italic',
  },
  wordListContainer: {
    width: '100%',
    marginTop: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  wordListTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#4A1942',
    marginBottom: 12,
  },
  wordList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  wordChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFE4EC',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  wordChipFound: {
    backgroundColor: '#4CAF50',
  },
  wordChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FF6B9D',
  },
  wordChipTextFound: {
    color: '#FFFFFF',
    textDecorationLine: 'line-through',
  },
  completionContainer: {
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
  completionTitle: {
    fontSize: 28,
    fontWeight: '600',
    color: '#FF6B9D',
    marginTop: 12,
  },
  completionText: {
    fontSize: 16,
    fontStyle: 'italic',
    color: '#5A4A5A',
    textAlign: 'center',
    marginVertical: 16,
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
});
