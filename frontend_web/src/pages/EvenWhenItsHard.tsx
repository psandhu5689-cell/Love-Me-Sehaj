import React from 'react'
import { motion } from 'framer-motion'
import { IoChevronBackOutline, IoArrowForward } from 'react-icons/io5'
import { useNavigate } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'
import haptics from '../utils/haptics'

export default function EvenWhenItsHard() {
  const navigate = useNavigate()
  const { colors } = useTheme()

  return (
    <div style={{
      minHeight: '100vh',
      background: colors.background,
      display: 'flex',
      flexDirection: 'column',
      padding: 20,
    }}>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => {
          haptics.light()
          navigate(-1)
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
      }}>
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            color: colors.textPrimary,
            fontSize: 32,
            fontWeight: 600,
            textAlign: 'center',
            marginBottom: 32,
          }}
        >
          Even When It's Hard
        </motion.h1>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          style={{
            width: '100%',
            maxWidth: 400,
            margin: '0 auto 32px',
            borderRadius: 24,
            overflow: 'hidden',
            boxShadow: `0 8px 32px ${colors.primaryGlow}`,
          }}
        >
          <img
            src="https://customer-assets.emergentagent.com/job-bug-fix-central-10/artifacts/e4hhoktx_IMG_2420.jpeg"
            alt="Through everything"
            style={{
              width: '100%',
              height: 'auto',
              display: 'block',
            }}
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          style={{
            background: colors.glass,
            backdropFilter: 'blur(20px)',
            border: `1px solid ${colors.border}`,
            borderRadius: 24,
            padding: 32,
            boxShadow: `0 8px 32px ${colors.primaryGlow}`,
          }}
        >
          <p style={{ color: colors.textPrimary, fontSize: 18, lineHeight: 1.8, marginBottom: 16 }}>
            We fight sometimes.
          </p>
          <p style={{ color: colors.textPrimary, fontSize: 18, lineHeight: 1.8, marginBottom: 16 }}>
            We get mad sometimes.
          </p>
          <p style={{ color: colors.textPrimary, fontSize: 18, lineHeight: 1.8, marginBottom: 16 }}>
            We say dumb things sometimes.
          </p>
          <p style={{ color: colors.textPrimary, fontSize: 18, lineHeight: 1.8, marginBottom: 16 }}>
            But I never stop choosing you.
          </p>
          <p style={{ color: colors.textPrimary, fontSize: 18, lineHeight: 1.8, marginBottom: 16 }}>
            Even when I'm upset.
          </p>
          <p style={{ color: colors.textPrimary, fontSize: 18, lineHeight: 1.8, marginBottom: 16 }}>
            Even when I'm quiet.
          </p>
          <p style={{ color: colors.textPrimary, fontSize: 18, lineHeight: 1.8, marginBottom: 16 }}>
            Even when I mess up.
          </p>
          <p style={{ color: colors.primary, fontSize: 20, lineHeight: 1.8, marginBottom: 16, fontWeight: 600 }}>
            You're still my girl.
          </p>
          <p style={{ color: colors.primary, fontSize: 20, lineHeight: 1.8, marginBottom: 16, fontWeight: 600 }}>
            You're still my forever.
          </p>
          <p style={{ color: colors.textPrimary, fontSize: 20, lineHeight: 1.8, fontWeight: 600 }}>
            Nothing changes that.
          </p>
        </motion.div>

        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => {
            haptics.medium()
            navigate('/my-promise')
          }}
          style={{
            width: '100%',
            marginTop: 32,
            padding: '16px 24px',
            borderRadius: 16,
            background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`,
            border: 'none',
            color: 'white',
            fontSize: 16,
            fontWeight: 600,
            cursor: 'pointer',
            boxShadow: `0 4px 16px ${colors.primaryGlow}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
          }}
        >
          Continue
          <IoArrowForward size={20} />
        </motion.button>

        <div style={{ height: 40 }} />
      </div>
    </div>
  )
}
