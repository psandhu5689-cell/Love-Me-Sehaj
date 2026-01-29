import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { IoChevronBackOutline, IoHelp, IoCheckmarkCircle } from 'react-icons/io5'
import { useNavigate } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'
import haptics from '../utils/haptics'
import Confetti from 'react-confetti'

interface Clue {
  number: number
  clue: string
  answer: string
  row: number
  col: number
  direction: 'across' | 'down'
}

// Moderate difficulty crossword themed around love and relationship
const CROSSWORD_PUZZLE: Clue[] = [
  { number: 1, clue: 'Deep affection (4)', answer: 'LOVE', row: 0, col: 0, direction: 'across' },
  { number: 2, clue: 'Forever partner (4)', answer: 'SOUL', row: 0, col: 6, direction: 'down' },
  { number: 3, clue: 'Symbol of love (5)', answer: 'HEART', row: 2, col: 0, direction: 'across' },
  { number: 4, clue: 'Your girl (5)', answer: 'SEHAJ', row: 0, col: 0, direction: 'down' },
  { number: 5, clue: 'Warm embrace (3)', answer: 'HUG', row: 4, col: 2, direction: 'across' },
  { number: 6, clue: 'Sweet gesture (4)', answer: 'KISS', row: 2, col: 6, direction: 'down' },
  { number: 7, clue: 'Your boy (5)', answer: 'PRABH', row: 6, col: 0, direction: 'across' },
  { number: 8, clue: 'Romantic gesture (4)', answer: 'DATE', row: 4, col: 7, direction: 'down' },
  { number: 9, clue: 'Close together (6)', answer: 'CUDDLE', row: 8, col: 3, direction: 'across' },
  { number: 10, clue: 'Facial joy (5)', answer: 'SMILE', row: 0, col: 10, direction: 'down' },
]

const GRID_SIZE = 11

const createEmptyGrid = (): (string | null)[][] => {
  return Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(null))
}

const createBlackSquares = (): boolean[][] => {
  const blacks = Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(false))
  
  // Place black squares strategically
  const blackPositions = [
    [1, 3], [1, 7], [3, 1], [3, 5], [3, 9],
    [5, 0], [5, 1], [5, 6], [5, 9], [5, 10],
    [7, 2], [7, 6], [7, 10], [9, 1], [9, 5], [9, 9]
  ]
  
  blackPositions.forEach(([r, c]) => {
    if (r < GRID_SIZE && c < GRID_SIZE) {
      blacks[r][c] = true
    }
  })
  
  return blacks
}

export default function Crossword() {
  const navigate = useNavigate()
  const { colors } = useTheme()
  const inputRef = useRef<HTMLInputElement>(null)
  
  const [userGrid, setUserGrid] = useState<(string | null)[][]>(() => {
    const saved = localStorage.getItem('crossword_progress')
    return saved ? JSON.parse(saved) : createEmptyGrid()
  })
  
  const [blackSquares] = useState(createBlackSquares())
  const [selectedCell, setSelectedCell] = useState<{row: number, col: number} | null>(null)
  const [selectedDirection, setSelectedDirection] = useState<'across' | 'down'>('across')
  const [revealCount, setRevealCount] = useState(3)
  const [showConfetti, setShowConfetti] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [dragStartCell, setDragStartCell] = useState<{row: number, col: number} | null>(null)
  const [draggedCells, setDraggedCells] = useState<{row: number, col: number}[]>([])

  // Save progress
  useEffect(() => {
    localStorage.setItem('crossword_progress', JSON.stringify(userGrid))
  }, [userGrid])

  // Check if puzzle is complete
  const isComplete = () => {
    return CROSSWORD_PUZZLE.every(clue => {
      for (let i = 0; i < clue.answer.length; i++) {
        const row = clue.direction === 'across' ? clue.row : clue.row + i
        const col = clue.direction === 'across' ? clue.col + i : clue.col
        if (userGrid[row][col] !== clue.answer[i]) return false
      }
      return true
    })
  }

  useEffect(() => {
    if (isComplete()) {
      haptics.success()
      setShowConfetti(true)
      setTimeout(() => {
        setShowConfetti(false)
        // Navigate to the next page in Valentines pathway
        navigate('/card-match')
      }, 3000)
    }
  }, [userGrid, navigate])

  // Focus the hidden input when a cell is selected
  useEffect(() => {
    if (selectedCell && inputRef.current) {
      inputRef.current.focus()
    }
  }, [selectedCell])

  const handleCellClick = (row: number, col: number) => {
    if (blackSquares[row][col]) return
    
    haptics.selection()
    
    // Toggle direction if clicking same cell
    if (selectedCell && selectedCell.row === row && selectedCell.col === col) {
      setSelectedDirection(prev => prev === 'across' ? 'down' : 'across')
    } else {
      setSelectedCell({ row, col })
    }
  }

  // Move to next valid cell
  const moveToNextCell = (row: number, col: number) => {
    if (selectedDirection === 'across') {
      let nextCol = col + 1
      while (nextCol < GRID_SIZE && blackSquares[row][nextCol]) nextCol++
      if (nextCol < GRID_SIZE) {
        setSelectedCell({ row, col: nextCol })
      }
    } else {
      let nextRow = row + 1
      while (nextRow < GRID_SIZE && blackSquares[nextRow][col]) nextRow++
      if (nextRow < GRID_SIZE) {
        setSelectedCell({ row: nextRow, col })
      }
    }
  }

  // Move to previous valid cell
  const moveToPrevCell = (row: number, col: number) => {
    if (selectedDirection === 'across') {
      let prevCol = col - 1
      while (prevCol >= 0 && blackSquares[row][prevCol]) prevCol--
      if (prevCol >= 0) {
        setSelectedCell({ row, col: prevCol })
      }
    } else {
      let prevRow = row - 1
      while (prevRow >= 0 && blackSquares[prevRow][col]) prevRow--
      if (prevRow >= 0) {
        setSelectedCell({ row: prevRow, col })
      }
    }
  }

  // Handle keyboard input from the hidden input
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!selectedCell) return
    
    const { row, col } = selectedCell
    
    if (e.key === 'Backspace') {
      e.preventDefault()
      haptics.light()
      
      const newGrid = userGrid.map(r => [...r])
      if (newGrid[row][col]) {
        newGrid[row][col] = null
      } else {
        // Move back and delete
        moveToPrevCell(row, col)
      }
      setUserGrid(newGrid)
      return
    }
    
    if (e.key === 'ArrowUp') {
      e.preventDefault()
      if (row > 0 && !blackSquares[row - 1][col]) {
        setSelectedCell({ row: row - 1, col })
      }
      return
    }
    
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      if (row < GRID_SIZE - 1 && !blackSquares[row + 1][col]) {
        setSelectedCell({ row: row + 1, col })
      }
      return
    }
    
    if (e.key === 'ArrowLeft') {
      e.preventDefault()
      if (col > 0 && !blackSquares[row][col - 1]) {
        setSelectedCell({ row, col: col - 1 })
      }
      return
    }
    
    if (e.key === 'ArrowRight') {
      e.preventDefault()
      if (col < GRID_SIZE - 1 && !blackSquares[row][col + 1]) {
        setSelectedCell({ row, col: col + 1 })
      }
      return
    }
    
    // Handle letter input
    const letter = e.key.toUpperCase()
    if (/^[A-Z]$/.test(letter)) {
      e.preventDefault()
      haptics.light()
      
      const newGrid = userGrid.map(r => [...r])
      newGrid[row][col] = letter
      setUserGrid(newGrid)
      
      // Move to next cell
      moveToNextCell(row, col)
    }
  }

  // Handle input change for mobile keyboards
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!selectedCell) return
    
    const value = e.target.value.toUpperCase()
    if (value.length > 0) {
      const letter = value[value.length - 1]
      if (/^[A-Z]$/.test(letter)) {
        haptics.light()
        
        const { row, col } = selectedCell
        const newGrid = userGrid.map(r => [...r])
        newGrid[row][col] = letter
        setUserGrid(newGrid)
        
        // Move to next cell
        moveToNextCell(row, col)
      }
    }
    
    // Clear the input
    e.target.value = ''
  }

  const handleRevealLetter = () => {
    if (revealCount <= 0) return
    
    haptics.medium()
    
    // Find all unsolved words
    const unsolvedWords = CROSSWORD_PUZZLE.filter(clue => {
      for (let i = 0; i < clue.answer.length; i++) {
        const cellRow = clue.direction === 'across' ? clue.row : clue.row + i
        const cellCol = clue.direction === 'across' ? clue.col + i : clue.col
        if (userGrid[cellRow][cellCol] !== clue.answer[i]) {
          return true // This word is not fully solved
        }
      }
      return false
    })
    
    if (unsolvedWords.length === 0) return
    
    // Pick a random unsolved word
    const randomWord = unsolvedWords[Math.floor(Math.random() * unsolvedWords.length)]
    
    // Find up to 2 unsolved letters in this word
    const unsolvedIndices: number[] = []
    for (let i = 0; i < randomWord.answer.length; i++) {
      const cellRow = randomWord.direction === 'across' ? randomWord.row : randomWord.row + i
      const cellCol = randomWord.direction === 'across' ? randomWord.col + i : randomWord.col
      if (userGrid[cellRow][cellCol] !== randomWord.answer[i]) {
        unsolvedIndices.push(i)
      }
    }
    
    // Reveal up to 2 letters
    const newGrid = userGrid.map(r => [...r])
    const lettersToReveal = Math.min(2, unsolvedIndices.length)
    
    for (let j = 0; j < lettersToReveal; j++) {
      const randomIndex = unsolvedIndices[Math.floor(Math.random() * unsolvedIndices.length)]
      const cellRow = randomWord.direction === 'across' ? randomWord.row : randomWord.row + randomIndex
      const cellCol = randomWord.direction === 'across' ? randomWord.col + randomIndex : randomWord.col
      
      newGrid[cellRow][cellCol] = randomWord.answer[randomIndex]
      
      // Remove this index so we don't reveal it again
      const idxToRemove = unsolvedIndices.indexOf(randomIndex)
      if (idxToRemove > -1) {
        unsolvedIndices.splice(idxToRemove, 1)
      }
    }
    
    setUserGrid(newGrid)
    setRevealCount(prev => prev - 1)
  }

  const handleCheckWord = () => {
    if (!selectedCell) return
    
    haptics.medium()
    
    const { row, col } = selectedCell
    
    // Find word at current position
    const clue = CROSSWORD_PUZZLE.find(c => {
      if (c.direction === selectedDirection) {
        if (selectedDirection === 'across') {
          return c.row === row && col >= c.col && col < c.col + c.answer.length
        } else {
          return c.col === col && row >= c.row && row < c.row + c.answer.length
        }
      }
      return false
    })
    
    if (!clue) return
    
    // Check if word is correct
    let isCorrect = true
    for (let i = 0; i < clue.answer.length; i++) {
      const cellRow = clue.direction === 'across' ? clue.row : clue.row + i
      const cellCol = clue.direction === 'across' ? clue.col + i : clue.col
      
      if (userGrid[cellRow][cellCol] !== clue.answer[i]) {
        isCorrect = false
        break
      }
    }
    
    if (isCorrect) {
      haptics.success()
      alert('✓ Correct!')
    } else {
      alert('✗ Not quite right. Keep trying!')
    }
  }

  const getClueNumber = (row: number, col: number): number | null => {
    const clue = CROSSWORD_PUZZLE.find(c => c.row === row && c.col === col)
    return clue ? clue.number : null
  }

  const isHighlighted = (row: number, col: number): boolean => {
    if (!selectedCell) return false
    
    // Highlight selected cell
    if (selectedCell.row === row && selectedCell.col === col) return true
    
    // Highlight entire word
    const clue = CROSSWORD_PUZZLE.find(c => {
      if (c.direction === selectedDirection) {
        if (selectedDirection === 'across') {
          return c.row === selectedCell.row && selectedCell.col >= c.col && selectedCell.col < c.col + c.answer.length &&
                 row === c.row && col >= c.col && col < c.col + c.answer.length
        } else {
          return c.col === selectedCell.col && selectedCell.row >= c.row && selectedCell.row < c.row + c.answer.length &&
                 col === c.col && row >= c.row && row < c.row + c.answer.length
        }
      }
      return false
    })
    
    return !!clue
  }

  const acrossClues = CROSSWORD_PUZZLE.filter(c => c.direction === 'across')
  const downClues = CROSSWORD_PUZZLE.filter(c => c.direction === 'down')

  return (
    <div style={{
      minHeight: '100vh',
      width: '100%',
      background: 'transparent',
      padding: 24,
      paddingTop: 80,
      position: 'relative',
      overflow: 'auto',
    }}>
      {showConfetti && <Confetti recycle={false} numberOfPieces={200} />}
      
      {/* Hidden input for capturing keyboard - positioned off-screen but not display:none */}
      <input
        ref={inputRef}
        type="text"
        autoCapitalize="characters"
        autoComplete="off"
        autoCorrect="off"
        spellCheck={false}
        onKeyDown={handleKeyDown}
        onChange={handleInputChange}
        style={{
          position: 'absolute',
          left: -9999,
          top: -9999,
          width: 1,
          height: 1,
          opacity: 0,
        }}
      />
      
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
        maxWidth: 700,
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
            Crossword ✏️
          </h1>
          <p style={{ color: colors.textSecondary, fontSize: 14 }}>
            {isComplete() ? '🎉 Puzzle Complete!' : 'Tap a cell and type to fill in words'}
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
            gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`,
            gap: 2,
            maxWidth: 450,
            margin: '0 auto 24px',
            touchAction: 'manipulation',
          }}>
            {Array.from({ length: GRID_SIZE }).map((_, row) =>
              Array.from({ length: GRID_SIZE }).map((_, col) => {
                const isBlack = blackSquares[row][col]
                const clueNum = getClueNumber(row, col)
                const highlighted = isHighlighted(row, col)
                const isSelected = selectedCell?.row === row && selectedCell?.col === col

                return (
                  <motion.div
                    key={`${row},${col}`}
                    whileTap={!isBlack ? { scale: 0.95 } : {}}
                    onClick={() => !isBlack && handleCellClick(row, col)}
                    style={{
                      aspectRatio: '1',
                      background: isBlack
                        ? '#000'
                        : isSelected
                        ? colors.primary
                        : highlighted
                        ? `${colors.primary}40`
                        : colors.card,
                      border: `2px solid ${isSelected ? colors.primaryDark || colors.primary : highlighted ? colors.primary : colors.border}`,
                      borderRadius: 4,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 16,
                      fontWeight: 700,
                      color: isSelected ? 'white' : highlighted ? colors.textPrimary : colors.textPrimary,
                      cursor: isBlack ? 'default' : 'pointer',
                      position: 'relative',
                      transition: 'all 0.15s',
                      userSelect: 'none',
                    }}
                  >
                    {clueNum && (
                      <span style={{
                        position: 'absolute',
                        top: 2,
                        left: 3,
                        fontSize: 8,
                        fontWeight: 600,
                        color: isSelected ? 'rgba(255,255,255,0.8)' : colors.textMuted,
                      }}>
                        {clueNum}
                      </span>
                    )}
                    {!isBlack && userGrid[row][col]}
                  </motion.div>
                )
              })
            )}
          </div>

          {/* Direction indicator */}
          {selectedCell && (
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              marginBottom: 16,
            }}>
              <div style={{
                background: colors.card,
                border: `1px solid ${colors.border}`,
                borderRadius: 20,
                padding: '6px 16px',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}>
                <span style={{ color: colors.textSecondary, fontSize: 12 }}>Direction:</span>
                <span style={{ color: colors.primary, fontSize: 12, fontWeight: 600 }}>
                  {selectedDirection === 'across' ? '→ Across' : '↓ Down'}
                </span>
                <span style={{ color: colors.textMuted, fontSize: 10 }}>(tap cell to toggle)</span>
              </div>
            </div>
          )}

          {/* Controls */}
          <div style={{
            display: 'flex',
            gap: 12,
            marginBottom: 20,
            flexWrap: 'wrap',
          }}>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleRevealLetter}
              disabled={revealCount <= 0 || !selectedCell}
              style={{
                flex: 1,
                padding: '12px 16px',
                borderRadius: 12,
                background: revealCount > 0 && selectedCell ? colors.card : colors.border,
                border: `1px solid ${colors.border}`,
                color: colors.textPrimary,
                fontSize: 14,
                fontWeight: 600,
                cursor: revealCount > 0 && selectedCell ? 'pointer' : 'not-allowed',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                opacity: revealCount > 0 && selectedCell ? 1 : 0.5,
              }}
            >
              <IoHelp size={18} />
              Reveal ({revealCount})
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleCheckWord}
              disabled={!selectedCell}
              style={{
                flex: 1,
                padding: '12px 16px',
                borderRadius: 12,
                background: selectedCell ? `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})` : colors.border,
                border: 'none',
                color: 'white',
                fontSize: 14,
                fontWeight: 600,
                cursor: selectedCell ? 'pointer' : 'not-allowed',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                opacity: selectedCell ? 1 : 0.5,
              }}
            >
              <IoCheckmarkCircle size={18} />
              Check Word
            </motion.button>
          </div>

          {/* Clues */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 20,
          }}>
            <div>
              <h3 style={{
                fontSize: 16,
                fontWeight: 600,
                color: colors.textPrimary,
                marginBottom: 12,
              }}>
                Across →
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {acrossClues.map((clue) => (
                  <p key={clue.number} style={{
                    fontSize: 13,
                    color: colors.textSecondary,
                    lineHeight: 1.4,
                  }}>
                    <strong style={{ color: colors.textPrimary }}>{clue.number}.</strong> {clue.clue}
                  </p>
                ))}
              </div>
            </div>

            <div>
              <h3 style={{
                fontSize: 16,
                fontWeight: 600,
                color: colors.textPrimary,
                marginBottom: 12,
              }}>
                Down ↓
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {downClues.map((clue) => (
                  <p key={clue.number} style={{
                    fontSize: 13,
                    color: colors.textSecondary,
                    lineHeight: 1.4,
                  }}>
                    <strong style={{ color: colors.textPrimary }}>{clue.number}.</strong> {clue.clue}
                  </p>
                ))}
              </div>
            </div>
          </div>
          
          {/* Skip Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              haptics.light()
              navigate(-1)
            }}
            style={{
              width: '100%',
              padding: '12px 16px',
              borderRadius: 12,
              background: 'transparent',
              border: `1px solid ${colors.border}`,
              color: colors.textSecondary,
              fontSize: 14,
              fontWeight: 500,
              cursor: 'pointer',
              marginTop: 16,
            }}
          >
            Skip Puzzle →
          </motion.button>
          
          {/* Collapsible Answer Key */}
          <AnswerKey colors={colors} clues={CROSSWORD_PUZZLE} />
        </div>
      </div>
    </div>
  )
}

// Answer Key Component
function AnswerKey({ colors, clues }: { colors: any; clues: Clue[] }) {
  const [isOpen, setIsOpen] = useState(false)
  
  return (
    <div style={{ marginTop: 20 }}>
      <motion.button
        whileTap={{ scale: 0.98 }}
        onClick={() => {
          haptics.light()
          setIsOpen(!isOpen)
        }}
        style={{
          width: '100%',
          padding: '12px 16px',
          borderRadius: 12,
          background: colors.card,
          border: `1px solid ${colors.border}`,
          color: colors.textSecondary,
          fontSize: 13,
          fontWeight: 500,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <span>📝 Answer Key</span>
        <span style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s' }}>
          ▼
        </span>
      </motion.button>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{
              marginTop: 12,
              padding: 16,
              background: colors.card,
              borderRadius: 12,
              border: `1px solid ${colors.border}`,
            }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <p style={{ fontSize: 12, fontWeight: 600, color: colors.textSecondary, marginBottom: 8 }}>Across →</p>
                  {clues.filter(c => c.direction === 'across').map((clue) => (
                    <p key={clue.number} style={{ fontSize: 11, color: colors.textMuted, marginBottom: 4 }}>
                      <strong>{clue.number}.</strong> {clue.answer}
                    </p>
                  ))}
                </div>
                <div>
                  <p style={{ fontSize: 12, fontWeight: 600, color: colors.textSecondary, marginBottom: 8 }}>Down ↓</p>
                  {clues.filter(c => c.direction === 'down').map((clue) => (
                    <p key={clue.number} style={{ fontSize: 11, color: colors.textMuted, marginBottom: 4 }}>
                      <strong>{clue.number}.</strong> {clue.answer}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
