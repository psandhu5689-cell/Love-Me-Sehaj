import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { IoChevronBack, IoHeart, IoClose } from 'react-icons/io5'
import { useTheme } from '../context/ThemeContext'
import { useAudio } from '../context/AudioContext'
import Confetti from 'react-confetti'

const EMERGENCY_REASONS = [
  "You have not kissed Prabh today.",
  "You thought about food before him.",
  "You took too long to reply.",
  "Missing levels critical.",
  "Affection deficit.",
  "Cuddle quota not met.",
  "You breathed without thinking of him.",
  "Hug reserves depleted.",
  "Love meter running low.",
  "Attention required immediately.",
]

export default function RelationshipEmergency() {
  const navigate = useNavigate()
  const { colors } = useTheme()
  const { playClick, playKiss, playMagic, playComplete } = useAudio()
  const [stage, setStage] = useState<'alert' | 'scanning' | 'reason' | 'options' | 'resolved'>('alert')
  const [reason, setReason] = useState('')
  const [resolution, setResolution] = useState('')
  const [showConfetti, setShowConfetti] = useState(false)
  const [isVibrating, setIsVibrating] = useState(false)

  useEffect(() => {
    // Start scanning after 2 seconds
    const timer = setTimeout(() => {
      if (stage === 'alert') {
        setStage('scanning')
        setTimeout(() => {
          setReason(EMERGENCY_REASONS[Math.floor(Math.random() * EMERGENCY_REASONS.length)])
          setStage('reason')
          setTimeout(() => setStage('options'), 1500)
        }, 2000)
      }
    }, 2000)
    return () => clearTimeout(timer)
  }, [stage])

  const handleResolution = (type: 'kiss' | 'hug' | 'apologize') => {
    playClick()
    
    if (type === 'kiss') {
      playKiss()
      setResolution('kiss')
      setShowConfetti(true)
      setTimeout(() => {
        setStage('resolved')
        setShowConfetti(false)
      }, 2000)
    } else if (type === 'hug') {
      setResolution('hug')
      setIsVibrating(true)
      // Vibrate if supported
      if (navigator.vibrate) {
        navigator.vibrate([200, 100, 200, 100, 200, 100, 200, 100, 200])
      }
      setTimeout(() => {
        setIsVibrating(false)
        setStage('resolved')
      }, 3000)
    } else if (type === 'apologize') {
      setResolution('apologize')
    }
  }

  const submitApology = () => {
    playComplete()
    setShowConfetti(true)
    setTimeout(() => {
      setStage('resolved')
      setShowConfetti(false)
    }, 2000)
  }

  const resetEmergency = () => {
    playClick()
    setStage('alert')
    setResolution('')
    setReason('')
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#1a0000',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {showConfetti && <Confetti width={window.innerWidth} height={window.innerHeight} recycle={false} />}

      {/* Flashing border */}
      <motion.div
        animate={{ 
          boxShadow: stage !== 'resolved' ? [
            'inset 0 0 30px rgba(255,0,0,0.3)',
            'inset 0 0 60px rgba(255,0,0,0.6)',
            'inset 0 0 30px rgba(255,0,0,0.3)',
          ] : 'none'
        }}
        transition={{ duration: 0.5, repeat: stage !== 'resolved' ? Infinity : 0 }}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          pointerEvents: 'none',
          border: stage !== 'resolved' ? '4px solid #ff0000' : 'none',
        }}
      />

      {/* Siren lights */}
      {stage !== 'resolved' && (
        <>
          <motion.div
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 0.5, repeat: Infinity }}
            style={{
              position: 'absolute',
              top: 20,
              left: 20,
              width: 30,
              height: 30,
              borderRadius: 15,
              background: '#ff0000',
              boxShadow: '0 0 20px #ff0000',
            }}
          />
          <motion.div
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ duration: 0.5, repeat: Infinity }}
            style={{
              position: 'absolute',
              top: 20,
              right: 20,
              width: 30,
              height: 30,
              borderRadius: 15,
              background: '#ff0000',
              boxShadow: '0 0 20px #ff0000',
            }}
          />
        </>
      )}

      {/* Back Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        onClick={() => navigate(-1)}
        style={{
          position: 'absolute',
          top: 60,
          left: 16,
          width: 44,
          height: 44,
          borderRadius: 22,
          background: 'rgba(255,255,255,0.1)',
          border: '1px solid rgba(255,255,255,0.2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          zIndex: 101,
        }}
      >
        <IoChevronBack size={24} color="#ffffff" />
      </motion.button>

      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
      }}>
        {/* Alert Stage */}
        {(stage === 'alert' || stage === 'scanning') && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            style={{ textAlign: 'center' }}
          >
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 0.5, repeat: Infinity }}
            >
              <span style={{ fontSize: 80 }}>🚨</span>
            </motion.div>
            <h1 style={{
              color: '#ff0000',
              fontSize: 28,
              fontWeight: 'bold',
              marginTop: 20,
              textShadow: '0 0 20px rgba(255,0,0,0.5)',
            }}>
              RELATIONSHIP EMERGENCY
            </h1>
            <h2 style={{ color: '#ff6666', fontSize: 24, marginTop: 8 }}>
              DETECTED
            </h2>
            
            {stage === 'scanning' && (
              <motion.p
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1, repeat: Infinity }}
                style={{ color: '#ff9999', fontSize: 16, marginTop: 30 }}
              >
                Scanning cause<span>...</span>
              </motion.p>
            )}
          </motion.div>
        )}

        {/* Reason Stage */}
        {(stage === 'reason' || stage === 'options') && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ textAlign: 'center', width: '100%', maxWidth: 400 }}
          >
            <span style={{ fontSize: 60 }}>⚠️</span>
            <h2 style={{ color: '#ff0000', fontSize: 20, marginTop: 16, marginBottom: 8 }}>
              CAUSE IDENTIFIED:
            </h2>
            <p style={{
              color: '#ffffff',
              fontSize: 22,
              fontWeight: 'bold',
              padding: 20,
              background: 'rgba(255,0,0,0.2)',
              borderRadius: 12,
              border: '2px solid #ff0000',
            }}>
              {reason}
            </p>
          </motion.div>
        )}

        {/* Options Stage */}
        {stage === 'options' && resolution === '' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ marginTop: 30, width: '100%', maxWidth: 300 }}
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleResolution('kiss')}
              style={{
                width: '100%',
                padding: '16px',
                background: 'linear-gradient(135deg, #ff6b9d, #c44569)',
                border: 'none',
                borderRadius: 25,
                color: 'white',
                fontSize: 18,
                fontWeight: 'bold',
                cursor: 'pointer',
                marginBottom: 12,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 10,
              }}
            >
              💋 Send Virtual Kiss
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleResolution('hug')}
              style={{
                width: '100%',
                padding: '16px',
                background: 'linear-gradient(135deg, #a78bfa, #8b5cf6)',
                border: 'none',
                borderRadius: 25,
                color: 'white',
                fontSize: 18,
                fontWeight: 'bold',
                cursor: 'pointer',
                marginBottom: 12,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 10,
              }}
            >
              🤗 Hug Simulation
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleResolution('apologize')}
              style={{
                width: '100%',
                padding: '16px',
                background: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
                border: 'none',
                borderRadius: 25,
                color: 'white',
                fontSize: 18,
                fontWeight: 'bold',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 10,
              }}
            >
              🙏 Apologize
            </motion.button>
          </motion.div>
        )}

        {/* Hug Animation */}
        {resolution === 'hug' && stage !== 'resolved' && (
          <motion.div
            animate={{ scale: isVibrating ? [1, 1.05, 1] : 1 }}
            transition={{ duration: 0.1, repeat: isVibrating ? Infinity : 0 }}
            style={{ textAlign: 'center', marginTop: 30 }}
          >
            <span style={{ fontSize: 80 }}>🤗</span>
            <p style={{ color: '#a78bfa', fontSize: 18, marginTop: 16 }}>
              Transmitting hug...
            </p>
          </motion.div>
        )}

        {/* Apology Form */}
        {resolution === 'apologize' && stage !== 'resolved' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              marginTop: 30,
              width: '100%',
              maxWidth: 350,
              background: 'rgba(255,255,255,0.1)',
              padding: 24,
              borderRadius: 16,
              border: '1px solid rgba(255,255,255,0.2)',
            }}
          >
            <h3 style={{ color: '#fbbf24', marginBottom: 16, textAlign: 'center' }}>
              OFFICIAL APOLOGY FORM
            </h3>
            <div style={{
              background: 'rgba(0,0,0,0.3)',
              padding: 16,
              borderRadius: 8,
              marginBottom: 16,
            }}>
              <p style={{ color: '#ffffff', fontStyle: 'italic', textAlign: 'center' }}>
                "I'm sorry for existing without you."
              </p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={submitApology}
              style={{
                width: '100%',
                padding: '14px',
                background: '#fbbf24',
                border: 'none',
                borderRadius: 25,
                color: '#000',
                fontSize: 16,
                fontWeight: 'bold',
                cursor: 'pointer',
              }}
            >
              SUBMIT APOLOGY
            </motion.button>
          </motion.div>
        )}

        {/* Resolved Stage */}
        {stage === 'resolved' && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            style={{ textAlign: 'center' }}
          >
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 0.5 }}
            >
              <IoHeart size={80} color="#4ade80" />
            </motion.div>
            <h1 style={{
              color: '#4ade80',
              fontSize: 28,
              marginTop: 20,
              textShadow: '0 0 20px rgba(74,222,128,0.5)',
            }}>
              {resolution === 'hug' ? 'Hug transmitted.' : 'Emergency resolved.'}
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.7)', marginTop: 12 }}>
              Crisis averted. Love restored. 💕
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              onClick={resetEmergency}
              style={{
                marginTop: 30,
                padding: '14px 28px',
                background: 'rgba(74,222,128,0.2)',
                border: '2px solid #4ade80',
                borderRadius: 25,
                color: '#4ade80',
                fontSize: 16,
                fontWeight: 'bold',
                cursor: 'pointer',
              }}
            >
              Another Emergency?
            </motion.button>
          </motion.div>
        )}
      </div>
    </div>
  )
}