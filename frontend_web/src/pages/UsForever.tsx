import React from 'react'
import { motion } from 'framer-motion'
import { IoChevronBackOutline, IoHeart } from 'react-icons/io5'
import { useNavigate } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'
import haptics from '../utils/haptics'
import Confetti from 'react-confetti'

export default function UsForever() {
  const navigate = useNavigate()
  const { colors } = useTheme()
  const [showConfetti, setShowConfetti] = React.useState(true)

  React.useEffect(() => {
    const timer = setTimeout(() => setShowConfetti(false), 5000)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div style={{
      minHeight: '100vh',
      background: colors.background,
      display: 'flex',
      flexDirection: 'column',
      padding: 20,
      position: 'relative',
    }}>
      {showConfetti && <Confetti recycle={false} numberOfPieces={200} />}

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => {
          haptics.light()
          navigate('/')
        }}
        style={{
          position: 'absolute',
          top: 20,
          left: 20,
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

      <div style={{
        maxWidth: 600,
        margin: '80px auto 0',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}>
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          style={{
            marginBottom: 32,
          }}
        >
          <IoHeart size={80} color={colors.primary} />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          style={{
            color: colors.textPrimary,
            fontSize: 36,
            fontWeight: 700,
            textAlign: 'center',
            marginBottom: 32,
          }}
        >
          Us
        </motion.h1>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          style={{
            background: colors.glass,
            backdropFilter: 'blur(20px)',
            border: `2px solid ${colors.primary}`,
            borderRadius: 24,
            padding: 40,
            boxShadow: `0 8px 32px ${colors.primaryGlow}`,
            textAlign: 'center',
          }}
        >
          <p style={{ color: colors.textPrimary, fontSize: 20, lineHeight: 1.8, marginBottom: 20, fontWeight: 600 }}>
            It's always going to be us.
          </p>
          <p style={{ color: colors.textPrimary, fontSize: 18, lineHeight: 1.8, marginBottom: 16 }}>
            Through distance.
          </p>
          <p style={{ color: colors.textPrimary, fontSize: 18, lineHeight: 1.8, marginBottom: 16 }}>
            Through stress.
          </p>
          <p style={{ color: colors.textPrimary, fontSize: 18, lineHeight: 1.8, marginBottom: 20 }}>
            Through life.
          </p>
          <p style={{ color: colors.primary, fontSize: 22, lineHeight: 1.8, marginBottom: 16, fontWeight: 700 }}>
            You and me.
          </p>
          <p style={{ color: colors.textPrimary, fontSize: 20, lineHeight: 1.8, marginBottom: 12, fontWeight: 600 }}>
            My girl.
          </p>
          <p style={{ color: colors.textPrimary, fontSize: 20, lineHeight: 1.8, marginBottom: 12, fontWeight: 600 }}>
            My baby.
          </p>
          <p style={{ color: colors.primary, fontSize: 24, lineHeight: 1.8, fontWeight: 700 }}>
            My forever.
          </p>
        </motion.div>

        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            haptics.success()
            navigate('/')
          }}
          style={{
            marginTop: 40,
            padding: '16px 40px',
            borderRadius: 20,
            background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`,
            border: 'none',
            color: 'white',
            fontSize: 18,
            fontWeight: 600,
            cursor: 'pointer',
            boxShadow: `0 8px 24px ${colors.primaryGlow}`,
          }}
        >
          💕 Back to Home 💕
        </motion.button>

        <div style={{ height: 40 }} />
      </div>
    </div>
  )
}
