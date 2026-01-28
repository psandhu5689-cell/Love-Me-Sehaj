import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { IoChevronBack, IoHeart, IoHeartOutline, IoChevronForward } from 'react-icons/io5'
import { useTheme } from '../context/ThemeContext'
import { useUser } from '../context/UserContext'
import { useAudio } from '../context/AudioContext'

const REVEAL_LINES = [
  'I already know my answer.',
  'You already have my heart.',
  'So I was hoping...',
]

export default function Question() {
  const navigate = useNavigate()
  const { colors } = useTheme()
  const { userName } = useUser()
  const { playMagic, playComplete, playDrumroll, playClick } = useAudio()
  const [showQuestion, setShowQuestion] = useState(false)
  const [showButtons, setShowButtons] = useState(false)
  const [revealedLines, setRevealedLines] = useState<number[]>([])

  useEffect(() => {
    playDrumroll()
    
    REVEAL_LINES.forEach((_, index) => {
      setTimeout(() => {
        setRevealedLines(prev => [...prev, index])
      }, index * 1500)
    })

    setTimeout(() => {
      setShowQuestion(true)
      setTimeout(() => setShowButtons(true), 800)
    }, REVEAL_LINES.length * 1500 + 1000)
  }, [])

  const handleYes = () => {
    playComplete()
    navigate('/celebration')
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: colors.background,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24,
      position: 'relative',
    }}>
      {/* Back Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => { playClick(); navigate(-1); }}
        style={{
          position: 'absolute',
          top: 50,
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
        }}
      >
        <IoChevronBack size={24} color={colors.primary} />
      </motion.button>

      {/* Floating Hearts Background */}
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={i}
          animate={{ y: [0, -20, 0] }}
          transition={{ duration: 2.5, repeat: Infinity, delay: i * 0.3 }}
          style={{
            position: 'absolute',
            left: `${10 + i * 12}%`,
            top: `${5 + (i % 4) * 22}%`,
            opacity: 0.1 + (i % 3) * 0.05,
          }}
        >
          <IoHeart size={50 * (0.4 + (i % 3) * 0.2)} color={colors.primary} />
        </motion.div>
      ))}

      <div style={{ textAlign: 'center', zIndex: 10 }}>
        {/* Reveal Lines */}
        <div style={{ marginBottom: 40 }}>
          {REVEAL_LINES.map((line, index) => (
            <motion.p
              key={index}
              initial={{ opacity: 0, y: 30 }}
              animate={revealedLines.includes(index) ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8 }}
              style={{
                fontSize: 22,
                fontWeight: 300,
                color: colors.textSecondary,
                fontStyle: 'italic',
                marginBottom: 16,
                letterSpacing: 0.5,
              }}
            >
              {line}
            </motion.p>
          ))}
        </div>

        {/* Question Card */}
        {showQuestion && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', tension: 50, friction: 8 }}
            style={{
              background: colors.card,
              border: `1px solid ${colors.border}`,
              borderRadius: 24,
              padding: '36px',
              marginBottom: 40,
              boxShadow: `0 0 60px ${colors.primaryGlow}`,
            }}
          >
            <IoHeart size={50} color={colors.primary} />
            <p style={{
              fontSize: 28,
              fontWeight: 300,
              color: colors.textPrimary,
              marginTop: 16,
              lineHeight: 1.5,
            }}>
              Will you be my Valentine,<br />
              <span style={{ color: colors.primary, fontWeight: 600 }}>{userName}</span>?
            </p>
          </motion.div>
        )}

        {/* Buttons */}
        {showButtons && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring' }}
            style={{ display: 'flex', gap: 16, justifyContent: 'center' }}
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleYes}
              style={{
                background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`,
                border: 'none',
                color: 'white',
                padding: '18px 32px',
                borderRadius: 30,
                fontSize: 20,
                fontWeight: 700,
                letterSpacing: 2,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                boxShadow: `0 8px 32px ${colors.primaryGlow}`,
              }}
            >
              <IoHeart size={24} />
              YES
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleYes}
              style={{
                background: colors.card,
                border: `2px solid ${colors.primary}`,
                color: colors.primary,
                padding: '18px 32px',
                borderRadius: 30,
                fontSize: 20,
                fontWeight: 700,
                letterSpacing: 2,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
              }}
            >
              <IoHeartOutline size={24} />
              YES
            </motion.button>
          </motion.div>
        )}

        {!showQuestion && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            onClick={() => navigate('/celebration')}
            style={{
              marginTop: 30,
              background: 'transparent',
              border: 'none',
              color: colors.textSecondary,
              fontSize: 14,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              margin: '30px auto 0',
            }}
          >
            Skip
            <IoChevronForward size={16} />
          </motion.button>
        )}
      </div>
    </div>
  )
}