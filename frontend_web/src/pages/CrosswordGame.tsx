import React, { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { IoChevronBackOutline, IoHelp, IoCheckmarkCircle, IoArrowForward } from 'react-icons/io5'
import { useNavigate } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'
import haptics from '../utils/haptics'
import Confetti from 'react-confetti'
import { getPuzzle, getTotalPuzzles, type CrosswordClue, type CrosswordPuzzle } from '../utils/crosswordGenerator'

const GRID_SIZE = 11

const createEmptyGrid = (): (string | null)[][] => {
  return Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(null))
}

// Pre-fill 5-10% of correct letters as hints
const preFillLetters = (puzzle: CrosswordPuzzle): (string | null)[][] => {
  const grid = createEmptyGrid()
  const allCells: { row: number; col: number; letter: string }[] = []
  
  // Collect all letter positions
  puzzle.clues.forEach(clue => {
    for (let i = 0; i < clue.answer.length; i++) {
      const row = clue.direction === 'across' ? clue.row : clue.row + i
      const col = clue.direction === 'across' ? clue.col + i : clue.col
      allCells.push({ row, col, letter: clue.answer[i] })
    }
  })
  
  // Randomly select 7% of cells to pre-fill
  const fillCount = Math.floor(allCells.length * 0.07)
  const shuffled = [...allCells].sort(() => Math.random() - 0.5)
  
  for (let i = 0; i < fillCount; i++) {
    const cell = shuffled[i]
    grid[cell.row][cell.col] = cell.letter
  }
  
  return grid
}

// Track which cells are locked (pre-filled)
const getLockedCells = (puzzle: CrosswordPuzzle, preFilledGrid: (string | null)[][]): boolean[][] => {
  const locked = Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(false))
  
  for (let row = 0; row < GRID_SIZE; row++) {
    for (let col = 0; col < GRID_SIZE; col++) {
      if (preFilledGrid[row][col] !== null) {
        locked[row][col] = true
      }
    }
  }
  
  return locked
}

export default function CrosswordGame() {
  const navigate = useNavigate()
  const { colors } = useTheme()
  const inputRef = useRef<HTMLInputElement>(null)
  
  const [currentPuzzleIndex, setCurrentPuzzleIndex] = useState(0)
  const [currentPuzzle, setCurrentPuzzle] = useState<CrosswordPuzzle>(getPuzzle(0))
  
  const [userGrid, setUserGrid] = useState<(string | null)[][]>(() => preFillLetters(getPuzzle(0)))
  const [lockedCells, setLockedCells] = useState<boolean[][]>(() => getLockedCells(getPuzzle(0), preFillLetters(getPuzzle(0))))
  const [selectedCell, setSelectedCell] = useState<{row: number, col: number} | null>(null)
  const [selectedDirection, setSelectedDirection] = useState<'across' | 'down'>('across')
  const [revealCount, setRevealCount] = useState(3)
  const [showConfetti, setShowConfetti] = useState(false)

  // Load new puzzle with pre-filled letters
  const loadPuzzle = (index: number) => {
    const puzzle = getPuzzle(index)
    setCurrentPuzzle(puzzle)
    const preFilledGrid = preFillLetters(puzzle)
    setUserGrid(preFilledGrid)
    setLockedCells(getLockedCells(puzzle, preFilledGrid))
    setSelectedCell(null)
    setRevealCount(3)
    setShowConfetti(false)
  }

  // Handle Next Puzzle
  const handleNextPuzzle = () => {
    haptics.medium()
    const nextIndex = (currentPuzzleIndex + 1) % getTotalPuzzles()
    setCurrentPuzzleIndex(nextIndex)
    loadPuzzle(nextIndex)
  }

  // Check if puzzle is complete
  const isComplete = () => {
    return currentPuzzle.clues.every(clue => {
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
      setTimeout(() => setShowConfetti(false), 5000)
    }
  }, [userGrid])

  // Focus the hidden input when a cell is selected
  useEffect(() => {
    if (selectedCell && inputRef.current) {
      inputRef.current.focus()
    }
  }, [selectedCell])

  const handleCellClick = (row: number, col: number) => {
    if (currentPuzzle.blackSquares[row][col]) return
    
    haptics.selection()
    
    // Toggle direction if clicking same cell
    if (selectedCell && selectedCell.row === row && selectedCell.col === col) {
      setSelectedDirection(prev => prev === 'across' ? 'down' : 'across')
    } else {
      setSelectedCell({ row, col })
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!selectedCell) return
    
    const key = e.key.toUpperCase()
    
    if (key === 'BACKSPACE') {
      // Clear current cell and move back
      setUserGrid(prev => {
        const newGrid = prev.map(row => [...row])
        newGrid[selectedCell.row][selectedCell.col] = null
        return newGrid
      })
      moveToPrevCell(selectedCell.row, selectedCell.col)
    } else if (key.length === 1 && key >= 'A' && key <= 'Z') {
      // Fill current cell and move forward
      setUserGrid(prev => {
        const newGrid = prev.map(row => [...row])
        newGrid[selectedCell.row][selectedCell.col] = key
        return newGrid
      })
      moveToNextCell(selectedCell.row, selectedCell.col)
    } else if (key === 'ARROWLEFT' || key === 'ARROWRIGHT' || key === 'ARROWUP' || key === 'ARROWDOWN') {
      handleArrowKey(key)
    }
  }

  const moveToNextCell = (row: number, col: number) => {
    if (selectedDirection === 'across') {
      let nextCol = col + 1
      while (nextCol < GRID_SIZE && currentPuzzle.blackSquares[row][nextCol]) nextCol++
      if (nextCol < GRID_SIZE) {
        setSelectedCell({ row, col: nextCol })
      }
    } else {
      let nextRow = row + 1
      while (nextRow < GRID_SIZE && currentPuzzle.blackSquares[nextRow][col]) nextRow++
      if (nextRow < GRID_SIZE) {
        setSelectedCell({ row: nextRow, col })
      }
    }
  }

  const moveToPrevCell = (row: number, col: number) => {
    if (selectedDirection === 'across') {
      let prevCol = col - 1
      while (prevCol >= 0 && currentPuzzle.blackSquares[row][prevCol]) prevCol--
      if (prevCol >= 0) {
        setSelectedCell({ row, col: prevCol })
      }
    } else {
      let prevRow = row - 1
      while (prevRow >= 0 && currentPuzzle.blackSquares[prevRow][col]) prevRow--
      if (prevRow >= 0) {
        setSelectedCell({ row: prevRow, col })
      }
    }
  }

  const handleArrowKey = (key: string) => {
    if (!selectedCell) return
    const { row, col } = selectedCell
    
    let newRow = row
    let newCol = col
    
    switch (key) {
      case 'ARROWUP':
        newRow = Math.max(0, row - 1)
        break
      case 'ARROWDOWN':
        newRow = Math.min(GRID_SIZE - 1, row + 1)
        break
      case 'ARROWLEFT':
        newCol = Math.max(0, col - 1)
        break
      case 'ARROWRIGHT':
        newCol = Math.min(GRID_SIZE - 1, col + 1)
        break
    }
    
    if (!currentPuzzle.blackSquares[newRow][newCol]) {
      setSelectedCell({ row: newRow, col: newCol })
    }
  }

  const handleHint = () => {
    if (revealCount <= 0) return
    
    haptics.medium()
    
    // Find incomplete clues
    const incompleteClues = currentPuzzle.clues.filter(clue => {
      for (let i = 0; i < clue.answer.length; i++) {
        const row = clue.direction === 'across' ? clue.row : clue.row + i
        const col = clue.direction === 'across' ? clue.col + i : clue.col
        if (userGrid[row][col] !== clue.answer[i]) return true
      }
      return false
    })
    
    if (incompleteClues.length === 0) return
    
    // Pick random incomplete clue
    const randomClue = incompleteClues[Math.floor(Math.random() * incompleteClues.length)]
    
    // Reveal TWO letters
    const emptyIndices: number[] = []
    for (let i = 0; i < randomClue.answer.length; i++) {
      const row = randomClue.direction === 'across' ? randomClue.row : randomClue.row + i
      const col = randomClue.direction === 'across' ? randomClue.col + i : randomClue.col
      if (userGrid[row][col] !== randomClue.answer[i]) {
        emptyIndices.push(i)
      }
    }
    
    // Reveal up to 2 letters
    const toReveal = Math.min(2, emptyIndices.length)
    for (let i = 0; i < toReveal; i++) {
      const idx = emptyIndices[Math.floor(Math.random() * emptyIndices.length)]
      emptyIndices.splice(emptyIndices.indexOf(idx), 1)
      
      const row = randomClue.direction === 'across' ? randomClue.row : randomClue.row + idx
      const col = randomClue.direction === 'across' ? randomClue.col + idx : randomClue.col
      
      setUserGrid(prev => {
        const newGrid = prev.map(row => [...row])
        newGrid[row][col] = randomClue.answer[idx]
        return newGrid
      })
    }
    
    setRevealCount(prev => prev - 1)
  }

  const acrossClues = currentPuzzle.clues.filter(c => c.direction === 'across')
  const downClues = currentPuzzle.clues.filter(c => c.direction === 'down')

  return (
    <div style={{
      minHeight: '100vh',
      background: colors.background,
      display: 'flex',
      flexDirection: 'column',
      padding: 16,
      position: 'relative',
    }}>
      {showConfetti && <Confetti recycle={false} numberOfPieces={200} />}
      
      {/* Back Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => navigate('/try-not-to-smile')}
        style={{
          position: 'absolute',
          top: 16,
          left: 16,
          width: 44,
          height: 44,
          borderRadius: 22,
          background: colors.card,
          border: `1px solid ${colors.border}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          zIndex: 100,
        }}
      >
        <IoChevronBackOutline size={24} color={colors.primary} />
      </motion.button>

      {/* Title */}
      <div style={{ textAlign: 'center', marginTop: 60, marginBottom: 20 }}>
        <h1 style={{ color: colors.textPrimary, fontSize: 24, fontWeight: 600 }}>
          {currentPuzzle.title}
        </h1>
        <p style={{ color: colors.textSecondary, fontSize: 14, marginTop: 4 }}>
          Puzzle {currentPuzzleIndex + 1} of {getTotalPuzzles()}
        </p>
      </div>

      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 20,
        maxWidth: 800,
        margin: '0 auto',
        width: '100%',
      }}>
        {/* Grid */}
        <div style={{
          background: colors.card,
          border: `1px solid ${colors.border}`,
          borderRadius: 16,
          padding: 16,
          boxShadow: `0 4px 20px ${colors.primaryGlow}`,
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`,
            gap: 2,
            maxWidth: 400,
            margin: '0 auto',
          }}>
            {Array.from({ length: GRID_SIZE }).map((_, row) =>
              Array.from({ length: GRID_SIZE }).map((_, col) => {
                const isBlack = currentPuzzle.blackSquares[row][col]
                const isSelected = selectedCell?.row === row && selectedCell?.col === col
                const cellValue = userGrid[row][col]
                
                return (
                  <div
                    key={`${row}-${col}`}
                    onClick={() => !isBlack && handleCellClick(row, col)}
                    style={{
                      aspectRatio: '1',
                      background: isBlack ? '#000' : isSelected ? colors.primary : colors.background,
                      border: `1px solid ${colors.border}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: isBlack ? 'default' : 'pointer',
                      fontSize: 16,
                      fontWeight: 600,
                      color: isSelected ? '#fff' : colors.textPrimary,
                      position: 'relative',
                    }}
                  >
                    {cellValue}
                  </div>
                )
              })
            )}
          </div>
          
          {/* Hidden input for keyboard */}
          <input
            ref={inputRef}
            type="text"
            onKeyDown={handleKeyPress}
            style={{
              position: 'absolute',
              opacity: 0,
              pointerEvents: 'none',
            }}
          />
        </div>

        {/* Controls */}
        <div style={{
          display: 'flex',
          gap: 12,
          justifyContent: 'center',
        }}>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleHint}
            disabled={revealCount <= 0}
            style={{
              padding: '12px 20px',
              borderRadius: 12,
              background: revealCount > 0 ? colors.secondary : colors.card,
              border: 'none',
              color: revealCount > 0 ? '#fff' : colors.textMuted,
              fontSize: 14,
              fontWeight: 600,
              cursor: revealCount > 0 ? 'pointer' : 'not-allowed',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <IoHelp size={18} />
            Hint ({revealCount})
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleNextPuzzle}
            style={{
              padding: '12px 20px',
              borderRadius: 12,
              background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`,
              border: 'none',
              color: '#fff',
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            Next Puzzle
            <IoArrowForward size={18} />
          </motion.button>
        </div>

        {/* Clues */}
        <div style={{
          background: colors.card,
          border: `1px solid ${colors.border}`,
          borderRadius: 16,
          padding: 20,
        }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            <div>
              <h3 style={{ color: colors.textPrimary, fontSize: 16, fontWeight: 600, marginBottom: 12 }}>
                Across
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
              <h3 style={{ color: colors.textPrimary, fontSize: 16, fontWeight: 600, marginBottom: 12 }}>
                Down
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
        </div>
      </div>
    </div>
  )
}
