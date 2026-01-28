import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { IoChevronBack, IoHeart, IoChevronForward } from 'react-icons/io5'
import { useTheme } from '../context/ThemeContext'
import { useAudio } from '../context/AudioContext'

export default function HoldReveal() {
  const navigate = useNavigate()
  const { colors } = useTheme()
  const { playClick, playComplete, playMagic } = useAudio()
  const [isHolding, setIsHolding] = useState(false)
  const [progress, setProgress] = useState(0)
  const [revealed, setRevealed] = useState(false)
  const [holdTimer, setHoldTimer] = useState<NodeJS.Timeout | null>(null)

  const handleHoldStart = () => {
    setIsHolding(true)
    playMagic()
    
    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(timer)
          setRevealed(true)
          playComplete()
          return 100
        }
        return prev + 2
      })
    }, 50)
    
    setHoldTimer(timer)
  }

  const handleHoldEnd = () => {
    setIsHolding(false)
    if (holdTimer) clearInterval(holdTimer)
    if (!revealed) setProgress(0)
  }

  useEffect(() => {
    return () => {
      if (holdTimer) clearInterval(holdTimer)
    }
  }, [holdTimer])

  return (
    <div style={{
      minHeight: '100vh',
      background: colors.background,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 32,
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

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ textAlign: 'center', maxWidth: 400 }}
      >
        {!revealed ? (
          <>
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              style={{ marginBottom: 24 }}
            >
              <IoHeart size={60} color={colors.primary} />
            </motion.div>

            <h1 style={{ fontSize: 28, fontWeight: 300, color: colors.textPrimary, marginBottom: 8 }}>
              Hold to Reveal
            </h1>
            <p style={{ color: colors.textSecondary, fontStyle: 'italic', marginBottom: 40 }}>
              Press and hold the heart to see a secret message
            </p>

            <motion.div
              onMouseDown={handleHoldStart}
              onMouseUp={handleHoldEnd}
              onMouseLeave={handleHoldEnd}
              onTouchStart={handleHoldStart}
              onTouchEnd={handleHoldEnd}
              whileHover={{ scale: 1.05 }}
              animate={isHolding ? { scale: [1, 1.1, 1] } : {}}
              transition={{ duration: 0.5, repeat: isHolding ? Infinity : 0 }}
              style={{
                width: 150,
                height: 150,
                borderRadius: 75,
                background: `conic-gradient(${colors.primary} ${progress}%, ${colors.card} ${progress}%)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                margin: '0 auto',
                boxShadow: `0 0 40px ${colors.primaryGlow}`,
              }}
            >
              <div style={{
                width: 130,
                height: 130,
                borderRadius: 65,
                background: colors.card,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <IoHeart size={60} color={isHolding ? colors.primary : colors.textMuted} />
              </div>
            </motion.div>

            <p style={{ color: colors.textMuted, fontSize: 14, marginTop: 20 }}>
              {isHolding ? 'Keep holding...' : 'Touch and hold'}
            </p>
          </>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <IoHeart size={60} color={colors.primary} style={{ marginBottom: 24 }} />
            
            <div style={{
              background: colors.card,
              border: `1px solid ${colors.border}`,
              borderRadius: 20,
              padding: 24,
              marginBottom: 30,
              boxShadow: `0 0 40px ${colors.primaryGlow}`,
            }}>
              <p style={{ color: colors.textPrimary, fontSize: 18, lineHeight: 1.8, fontStyle: 'italic' }}>
                "Every moment with you feels like a dream I never want to wake up from."
              </p>
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => { playComplete(); navigate('/quiet-stars'); }}
              style={{
                background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`,
                border: 'none',
                color: 'white',
                padding: '16px 36px',
                borderRadius: 30,
                fontSize: 17,
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                margin: '0 auto',
              }}
            >
              Continue
              <IoChevronForward size={20} />
            </motion.button>
          </motion.div>
        )}

        {!revealed && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            onClick={() => { playClick(); navigate('/quiet-stars'); }}
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
      </motion.div>
    </div>
  )
}