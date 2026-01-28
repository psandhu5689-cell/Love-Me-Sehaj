import React, { useEffect, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { IoHeart, IoSparkles, IoImages, IoSkull } from 'react-icons/io5'
import { useTheme } from '../context/ThemeContext'
import { useAudio } from '../context/AudioContext'
import { PresenceDisplay } from '../components/PresenceModals'

const STICKER_GOLD_DRESS = 'https://customer-assets.emergentagent.com/job_love-adventure-49/artifacts/grh04hmp_IMG_5616.jpeg'

export default function Index() {
  const navigate = useNavigate()
  const { colors } = useTheme()
  const { playKiss, playClick } = useAudio()
  const [checkingIntro, setCheckingIntro] = useState(true)
  const [showUserSetup, setShowUserSetup] = useState(false)
  const [currentUser, setCurrentUser] = useState<string | null>(null)

  useEffect(() => {
    initializeApp()
  }, [])

  const initializeApp = async () => {
    const savedUser = localStorage.getItem('currentUser')
    if (!savedUser) {
      const introSeen = localStorage.getItem('first_intro_seen')
      if (!introSeen) {
        navigate('/first-intro', { replace: true })
        return
      }
      setCheckingIntro(false)
      setShowUserSetup(true)
      return
    }

    setCurrentUser(savedUser)
    
    if (savedUser === 'sehaj') {
      const introShownSession = sessionStorage.getItem('sehaj_intro_shown_session')
      if (!introShownSession) {
        navigate('/first-intro', { replace: true })
        return
      }
    }

    setCheckingIntro(false)
  }

  const handleUserSelect = (user: 'prabh' | 'sehaj') => {
    localStorage.setItem('currentUser', user)
    setCurrentUser(user)
    setShowUserSetup(false)
  }

  const handleBegin = () => {
    playKiss()
    navigate('/personalization')
  }

  const handleSillyCrybaby = () => {
    playClick()
    navigate('/daily-love')
  }

  const handleYellowHeart = () => {
    playClick()
    navigate('/first-intro')
  }

  const handleGallery = () => {
    playClick()
    navigate('/gallery')
  }

  const handleTryNotToSmile = () => {
    playClick()
    navigate('/try-not-to-smile')
  }

  if (checkingIntro) {
    return <div style={{ flex: 1, background: colors.background }} />
  }

  if (showUserSetup) {
    return (
      <div style={{
        minHeight: '100vh',
        background: colors.background,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          style={{
            background: colors.card,
            padding: 32,
            borderRadius: 24,
            textAlign: 'center',
            border: `1px solid ${colors.border}`,
          }}
        >
          <IoHeart size={50} color={colors.primary} />
          <h2 style={{ color: colors.textPrimary, marginTop: 16, fontWeight: 300 }}>
            Who is using this phone?
          </h2>
          <div style={{ marginTop: 24, display: 'flex', gap: 16 }}>
            <button
              onClick={() => handleUserSelect('prabh')}
              style={{
                padding: '16px 32px',
                background: colors.secondary,
                border: 'none',
                borderRadius: 25,
                color: 'white',
                fontSize: 16,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              I'm Prabh
            </button>
            <button
              onClick={() => handleUserSelect('sehaj')}
              style={{
                padding: '16px 32px',
                background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`,
                border: 'none',
                borderRadius: 25,
                color: 'white',
                fontSize: 16,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              I'm Sehaj
            </button>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'transparent',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24,
      position: 'relative',
    }}>
      {/* Yellow Heart */}
      <motion.button
        whileHover={{ scale: 1.1, rotate: 10 }}
        whileTap={{ scale: 0.95 }}
        animate={{ y: [0, -5, 0] }}
        transition={{ y: { duration: 2, repeat: Infinity } }}
        onClick={handleYellowHeart}
        style={{
          position: 'absolute',
          top: 60,
          left: 16,
          padding: 10,
          background: 'rgba(255, 215, 0, 0.15)',
          backdropFilter: 'blur(10px)',
          borderRadius: 20,
          border: '1px solid rgba(255, 215, 0, 0.3)',
          cursor: 'pointer',
          boxShadow: '0 4px 20px rgba(255, 215, 0, 0.2)',
        }}
      >
        <IoHeart size={24} color="#FFD700" />
      </motion.button>

      {/* Gallery Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleGallery}
        style={{
          position: 'absolute',
          top: 60,
          left: 70,
          padding: '10px 14px',
          background: 'rgba(147, 112, 219, 0.15)',
          backdropFilter: 'blur(10px)',
          borderRadius: 20,
          border: '1px solid rgba(147, 112, 219, 0.3)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          boxShadow: '0 4px 20px rgba(147, 112, 219, 0.2)',
        }}
      >
        <IoImages size={20} color={colors.secondary} />
        <span style={{ color: colors.secondary, fontSize: 13, fontWeight: 600 }}>Gallery</span>
      </motion.button>

      {/* Try Not to Smile Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleTryNotToSmile}
        style={{
          position: 'absolute',
          top: 60,
          left: 168,
          padding: '10px 14px',
          background: 'rgba(168, 85, 247, 0.15)',
          backdropFilter: 'blur(10px)',
          borderRadius: 20,
          border: '1px solid rgba(168, 85, 247, 0.3)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          boxShadow: '0 4px 20px rgba(168, 85, 247, 0.2)',
        }}
      >
        <motion.span 
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          style={{ fontSize: 16 }}
        >
          😈
        </motion.span>
        <span style={{ color: '#a855f7', fontSize: 13, fontWeight: 600 }}>Games</span>
      </motion.button>

      {/* Sticker */}
      <motion.div
        animate={{ y: [0, -15, 0] }}
        transition={{ duration: 3, repeat: Infinity }}
        style={{
          position: 'absolute',
          top: 60,
          right: 5,
          transform: 'rotate(-12deg)',
        }}
      >
        <div style={{ position: 'relative', width: 130, height: 130 }}>
          <IoHeart size={130} color={colors.primary} style={{ position: 'absolute' }} />
          <img
            src={STICKER_GOLD_DRESS}
            style={{
              width: 75,
              height: 75,
              borderRadius: 40,
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -40%)',
              border: `3px solid ${colors.card}`,
            }}
          />
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8 }}
        style={{ textAlign: 'center' }}
      >
        {/* Main Heart */}
        <motion.div
          animate={{ y: [0, -15, 0] }}
          transition={{ duration: 2.5, repeat: Infinity }}
          style={{ marginBottom: 24, position: 'relative' }}
        >
          <div style={{
            position: 'absolute',
            width: 150,
            height: 150,
            borderRadius: 75,
            background: colors.primaryGlow,
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
          }} />
          <IoHeart size={90} color={colors.primary} />
        </motion.div>

        <h1 style={{
          fontSize: 44,
          fontWeight: 300,
          color: colors.textPrimary,
          marginBottom: 12,
          letterSpacing: 2,
        }}>
          For Sehaj
        </h1>

        <p style={{
          fontSize: 16,
          color: colors.textSecondary,
          marginBottom: 30,
          fontStyle: 'italic',
        }}>
          Made with love
        </p>

        {/* START Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleBegin}
          style={{
            background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`,
            border: 'none',
            color: 'white',
            padding: '18px 50px',
            borderRadius: 30,
            fontSize: 18,
            fontWeight: 600,
            letterSpacing: 3,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            boxShadow: `0 8px 24px ${colors.primaryGlow}`,
          }}
        >
          START
          <IoHeart size={18} />
        </motion.button>

        <p style={{ color: colors.textMuted, margin: '12px 0', fontStyle: 'italic' }}>or</p>

        {/* Silly Crybaby Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleSillyCrybaby}
          style={{
            background: colors.glass,
            border: `1.5px solid ${colors.secondary}`,
            borderRadius: 25,
            padding: '14px 20px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <IoHeart size={18} color={colors.secondary} />
          <span style={{ color: colors.secondary, fontSize: 14, fontWeight: 500 }}>
            when you're being my silly crybaby
          </span>
          <span>💕</span>
        </motion.button>

        {/* Presence Display */}
        <PresenceDisplay style={{ marginTop: 24 }} />
      </motion.div>
    </div>
  )
}