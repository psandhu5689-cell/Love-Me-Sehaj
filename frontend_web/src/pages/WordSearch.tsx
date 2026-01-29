import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { IoChevronBackOutline, IoHelp, IoRefresh, IoCheckmarkCircle } from 'react-icons/io5'
import { useNavigate } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'
import haptics from '../utils/haptics'

// Word bank for easy puzzles
const WORD_BANKS = [
  ['LOVE', 'HEART', 'KISS', 'HUG', 'SMILE', 'HAPPY', 'SWEET', 'ANGEL', 'DREAM', 'BLISS'],
  ['PRABH', 'SEHAJ', 'CUDDLE', 'FOREVER', 'SOUL', 'PRINCESS', 'BABY', 'MINE', 'YOURS', 'US'],
  ['CUTE', 'SOFT', 'WARM', 'COZY', 'SAFE', 'HOME', 'PEACE', 'JOY', 'LIGHT', 'GLOW'],
]

type Direction = 'horizontal' | 'vertical' | 'diagonal'

interface PlacedWord {
  word: string
  row: number
  col: number
  direction: Direction
  cells: string[]
}

const generatePuzzle = (words: string[]): { grid: string[][], placedWords: PlacedWord[] } => {
  const size = 12
  const grid: string[][] = Array(size).fill(null).map(() => Array(size).fill(''))
  const placedWords: PlacedWord[] = []

  const canPlaceWord = (word: string, row: number, col: number, direction: Direction): boolean => {
    const len = word.length
    
    if (direction === 'horizontal') {
      if (col + len > size) return false
      for (let i = 0; i < len; i++) {
        if (grid[row][col + i] && grid[row][col + i] !== word[i]) return false
      }
      return true
    }
    
    if (direction === 'vertical') {
      if (row + len > size) return false
      for (let i = 0; i < len; i++) {
        if (grid[row + i][col] && grid[row + i][col] !== word[i]) return false
      }
      return true
    }
    
    if (direction === 'diagonal') {
      if (row + len > size || col + len > size) return false
      for (let i = 0; i < len; i++) {
        if (grid[row + i][col + i] && grid[row + i][col + i] !== word[i]) return false
      }
      return true
    }
    
    return false
  }

  const placeWord = (word: string, row: number, col: number, direction: Direction) => {
    const cells: string[] = []
    const len = word.length
    
    if (direction === 'horizontal') {
      for (let i = 0; i < len; i++) {
        grid[row][col + i] = word[i]
        cells.push(`${row},${col + i}`)
      }
    } else if (direction === 'vertical') {
      for (let i = 0; i < len; i++) {
        grid[row + i][col] = word[i]
        cells.push(`${row + i},${col}`)
      }
    } else if (direction === 'diagonal') {
      for (let i = 0; i < len; i++) {
        grid[row + i][col + i] = word[i]
        cells.push(`${row + i},${col + i}`)
      }
    }
    
    placedWords.push({ word, row, col, direction, cells })
  }

  // Try to place each word
  for (const word of words) {
    let placed = false
    let attempts = 0
    const maxAttempts = 100
    
    while (!placed && attempts < maxAttempts) {
      const direction: Direction = ['horizontal', 'vertical', 'diagonal'][Math.floor(Math.random() * 3)] as Direction
      const row = Math.floor(Math.random() * size)
      const col = Math.floor(Math.random() * size)
      
      if (canPlaceWord(word, row, col, direction)) {
        placeWord(word, row, col, direction)
        placed = true
      }
      attempts++
    }
  }

  // Fill empty cells with random letters
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (!grid[r][c]) {
        grid[r][c] = letters[Math.floor(Math.random() * letters.length)]
      }
    }
  }

  return { grid, placedWords }
}

export default function WordSearch() {
  const navigate = useNavigate()
  const { colors } = useTheme()
  
  const [bankIndex] = useState(0)
  const [puzzle, setPuzzle] = useState(() => generatePuzzle(WORD_BANKS[bankIndex]))
  const [foundWords, setFoundWords] = useState<Set<string>>(new Set())
  const [isSelecting, setIsSelecting] = useState(false)
  const [selectedCells, setSelectedCells] = useState<Set<string>>(new Set())
  const [currentSelection, setCurrentSelection] = useState<string[]>([])
  const [hintCount, setHintCount] = useState(3)
  const [hintedCells, setHintedCells] = useState<Set<string>>(new Set())

  const isCompleted = foundWords.size === WORD_BANKS[bankIndex].length

  const handleCellMouseDown = (row: number, col: number) => {
    haptics.selection()
    setIsSelecting(true)
    const key = `${row},${col}`
    setCurrentSelection([key])
  }

  const handleCellMouseEnter = (row: number, col: number) => {
    if (!isSelecting) return
    const key = `${row},${col}`
    if (!currentSelection.includes(key)) {
      setCurrentSelection(prev => [...prev, key])
    }
  }

  const handleMouseUp = () => {
    if (!isSelecting) return
    setIsSelecting(false)
    
    // Check if selection matches any word
    const selectedWord = currentSelection.map(key => {
      const [r, c] = key.split(',').map(Number)
      return puzzle.grid[r][c]
    }).join('')
    
    if (WORD_BANKS[bankIndex].includes(selectedWord) && !foundWords.has(selectedWord)) {
      haptics.success()
      setFoundWords(prev => new Set([...prev, selectedWord]))
      setSelectedCells(prev => new Set([...prev, ...currentSelection]))
    }
    
    setCurrentSelection([])
  }

  const handleHint = () => {
    if (hintCount <= 0) return
    
    haptics.medium()
    const remainingWords = WORD_BANKS[bankIndex].filter(w => !foundWords.has(w))
    if (remainingWords.length === 0) return
    
    const word = remainingWords[0]
    const placed = puzzle.placedWords.find(p => p.word === word)
    if (placed && placed.cells.length > 0) {
      setHintedCells(prev => new Set([...prev, placed.cells[0]]))
      setHintCount(prev => prev - 1)
    }
  }

  const handleNewPuzzle = () => {
    haptics.medium()
    const newPuzzle = generatePuzzle(WORD_BANKS[bankIndex])
    setPuzzle(newPuzzle)
    setFoundWords(new Set())
    setSelectedCells(new Set())
    setCurrentSelection([])
    setHintedCells(new Set())
    setHintCount(3)
  }

  return (
    <div style={{
      minHeight: '100vh',
      width: '100%',
      background: 'transparent',
      padding: 24,
      paddingTop: 80,
      position: 'relative',
    }}
    onMouseUp={handleMouseUp}
    onTouchEnd={handleMouseUp}
    >
      {/* Header */}
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={() => {
          haptics.light()
          navigate(-1)
        }}
        style={{
          position: 'fixed',
          top: 20,
          left: 20,
          width: 40,
          height: 40,
          borderRadius: 12,
          background: colors.glass,
          backdropFilter: 'blur(10px)',
          border: `1px solid ${colors.border}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          zIndex: 100,
        }}
      >
        <IoChevronBackOutline size={24} color={colors.textPrimary} />
      </motion.button>

      <div style={{
        maxWidth: 600,
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        gap: 24,
      }}>
        {/* Title */}
        <div style={{ textAlign: 'center' }}>
          <h1 style={{
            fontSize: 32,
            fontWeight: 700,
            background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginBottom: 8,
          }}>
            Word Search 🔍
          </h1>
          <p style={{ color: colors.textSecondary, fontSize: 14 }}>
            Find {WORD_BANKS[bankIndex].length} words • Found {foundWords.size}
          </p>
        </div>

        {/* Puzzle Container */}
        <div style={{
          background: colors.glass,
          backdropFilter: 'blur(20px)',
          border: `1px solid ${colors.border}`,
          borderRadius: 20,
          padding: 24,
          boxShadow: `0 8px 32px ${colors.primaryGlow}`,
        }}>
          {/* Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${puzzle.grid[0].length}, 1fr)`,
            gap: 2,
            maxWidth: 400,
            margin: '0 auto 24px',
            touchAction: 'none',
            userSelect: 'none',
          }}>
            {puzzle.grid.map((row, rowIndex) =>
              row.map((cell, colIndex) => {
                const key = `${rowIndex},${colIndex}`
                const isSelected = selectedCells.has(key)
                const isCurrentlySelecting = currentSelection.includes(key)
                const isHinted = hintedCells.has(key)

                return (
                  <motion.div
                    key={key}
                    whileTap={{ scale: 0.9 }}
                    onMouseDown={() => handleCellMouseDown(rowIndex, colIndex)}
                    onMouseEnter={() => handleCellMouseEnter(rowIndex, colIndex)}
                    onTouchStart={() => handleCellMouseDown(rowIndex, colIndex)}
                    style={{
                      aspectRatio: '1',
                      background: isSelected
                        ? colors.primary
                        : isCurrentlySelecting
                        ? colors.primaryLight
                        : isHinted
                        ? colors.secondary
                        : colors.card,
                      border: `2px solid ${isSelected || isCurrentlySelecting ? colors.primaryDark : colors.border}`,
                      borderRadius: 6,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 14,
                      fontWeight: 700,
                      color: isSelected || isCurrentlySelecting ? 'white' : colors.textPrimary,
                      cursor: 'pointer',
                      userSelect: 'none',
                      transition: 'all 0.15s',
                    }}
                  >
                    {cell}
                  </motion.div>
                )
              })
            )}
          </div>

          {/* Word List */}
          <div style={{ marginBottom: 20 }}>
            <h3 style={{
              fontSize: 16,
              fontWeight: 600,
              color: colors.textPrimary,
              marginBottom: 12,
            }}>
              Words to Find:
            </h3>
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 8,
            }}>
              {WORD_BANKS[bankIndex].map((word) => (
                <div
                  key={word}
                  style={{
                    padding: '6px 12px',
                    borderRadius: 8,
                    background: foundWords.has(word) ? colors.primary : colors.card,
                    border: `1px solid ${foundWords.has(word) ? colors.primaryDark : colors.border}`,
                    color: foundWords.has(word) ? 'white' : colors.textPrimary,
                    fontSize: 13,
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    textDecoration: foundWords.has(word) ? 'line-through' : 'none',
                  }}
                >
                  {foundWords.has(word) && <IoCheckmarkCircle size={14} />}
                  {word}
                </div>
              ))}
            </div>
          </div>

          {/* Controls */}
          <div style={{
            display: 'flex',
            gap: 12,
            flexWrap: 'wrap',
          }}>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleHint}
              disabled={hintCount <= 0}
              style={{
                flex: 1,
                padding: '12px 16px',
                borderRadius: 12,
                background: hintCount > 0 ? colors.card : colors.border,
                border: `1px solid ${colors.border}`,
                color: colors.textPrimary,
                fontSize: 14,
                fontWeight: 600,
                cursor: hintCount > 0 ? 'pointer' : 'not-allowed',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                opacity: hintCount > 0 ? 1 : 0.5,
              }}
            >
              <IoHelp size={18} />
              Hint ({hintCount})
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleNewPuzzle}
              style={{
                flex: 1,
                padding: '12px 16px',
                borderRadius: 12,
                background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`,
                border: 'none',
                color: 'white',
                fontSize: 14,
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
              }}
            >
              <IoRefresh size={18} />
              New Puzzle
            </motion.button>
          </div>

          {/* Completion Message */}
          {isCompleted && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                marginTop: 20,
                padding: 16,
                borderRadius: 12,
                background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`,
                textAlign: 'center',
                color: 'white',
                fontSize: 18,
                fontWeight: 600,
              }}
            >
              🎉 All words found! Great job!
            </motion.div>
          )}

          <p style={{
            marginTop: 16,
            fontSize: 12,
            color: colors.textMuted,
            textAlign: 'center',
          }}>
            Drag across letters to select words
          </p>
        </div>
      </div>
    </div>
  )
}
