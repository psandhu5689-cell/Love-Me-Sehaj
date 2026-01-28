import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { IoChevronBack } from 'react-icons/io5'
import { useTheme } from '../context/ThemeContext'
import { useAudio } from '../context/AudioContext'

const ATTACKS = [
  { emoji: '🔥', name: 'Burn', message: 'Prabh got burned.' },
  { emoji: '👉', name: 'Poke', message: 'Prabh got poked.' },
  { emoji: '💥', name: 'Bonk', message: 'Prabh got bonked.' },
  { emoji: '🔪', name: 'Stab', message: 'Prabh got stabbed (emotionally).' },
  { emoji: '💣', name: 'Explode', message: 'Prabh exploded.' },
  { emoji: '👊', name: 'Punch', message: 'Prabh got punched.' },
  { emoji: '🧻', name: 'Paper Cut', message: 'Prabh got paper cut. Ouch.' },
  { emoji: '🧲', name: 'Steal Wallet', message: 'Prabh got robbed.' },
  { emoji: '👟', name: 'Kick', message: 'Prabh got kicked.' },
]

const RARE_MESSAGES = [
  "He likes it.",
  "Still yours.",
  "Unkillable boyfriend.",
  "Prabh took emotional damage.",
  "Prabh has fallen but refuses to die.",
  "Critical hit! Prabh is fine though.",
  "Prabh is used to this.",
]

const STATUS_MESSAGES = [
  "Still handsome",
  "Bruised but beautiful",
  "Damaged goods (your goods)",
  "Slightly crispy",
  "Dented but devoted",
  "Traumatized but loyal",
]

export default function TortureChamber() {
  const navigate = useNavigate()
  const { colors } = useTheme()
  const { playClick, playPop } = useAudio()
  const [abuseCount, setAbuseCount] = useState(0)
  const [currentMessage, setCurrentMessage] = useState('')
  const [status, setStatus] = useState('Still handsome')
  const [showAchievement, setShowAchievement] = useState(false)
  const [showChillMessage, setShowChillMessage] = useState(false)
  const [rapidClicks, setRapidClicks] = useState(0)
  const [lastClickTime, setLastClickTime] = useState(0)
  const [avatarShake, setAvatarShake] = useState(false)

  useEffect(() => {
    // Check for rapid clicks
    if (rapidClicks >= 5) {
      setShowChillMessage(true)
      setRapidClicks(0)
      setTimeout(() => setShowChillMessage(false), 2000)
    }
  }, [rapidClicks])

  useEffect(() => {
    // Check for achievement
    if (abuseCount === 100 && !showAchievement) {
      setShowAchievement(true)
    }
  }, [abuseCount])

  const handleAttack = (attack: typeof ATTACKS[0]) => {
    playPop()
    
    // Track rapid clicks
    const now = Date.now()
    if (now - lastClickTime < 500) {
      setRapidClicks(prev => prev + 1)
    } else {
      setRapidClicks(1)
    }
    setLastClickTime(now)

    // Shake avatar
    setAvatarShake(true)
    setTimeout(() => setAvatarShake(false), 300)

    // Update count
    const newCount = abuseCount + 1
    setAbuseCount(newCount)

    // Set message (10% chance of rare message)
    if (Math.random() < 0.1) {
      setCurrentMessage(RARE_MESSAGES[Math.floor(Math.random() * RARE_MESSAGES.length)])
    } else {
      setCurrentMessage(attack.message)
    }

    // Update status based on abuse count
    if (newCount > 80) {
      setStatus(STATUS_MESSAGES[5])
    } else if (newCount > 60) {
      setStatus(STATUS_MESSAGES[4])
    } else if (newCount > 40) {
      setStatus(STATUS_MESSAGES[3])
    } else if (newCount > 20) {
      setStatus(STATUS_MESSAGES[2])
    } else if (newCount > 10) {
      setStatus(STATUS_MESSAGES[1])
    }
  }

  const healPrabh = () => {
    playClick()
    setAbuseCount(0)
    setCurrentMessage('Healed by Sehaj. 💕')
    setStatus('Still handsome')
    setShowAchievement(false)
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: colors.background,
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
    }}>
      {/* Back Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        onClick={() => navigate(-1)}
        style={{
          position: 'absolute',
          top: 20,
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
          zIndex: 101,
        }}
      >
        <IoChevronBack size={24} color={colors.primary} />
      </motion.button>

      <div style={{ padding: '80px 24px 24px', flex: 1 }}>
        {/* Title */}
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <h1 style={{ color: colors.textPrimary, fontSize: 28, fontWeight: 'bold', marginBottom: 4 }}>
            ⚔️ Torture Chamber
          </h1>
          <p style={{ color: colors.textSecondary, fontSize: 14 }}>
            Prabh Damage Tracker
          </p>
        </div>

        {/* Avatar */}
        <motion.div
          animate={avatarShake ? { x: [-5, 5, -5, 5, 0] } : {}}
          transition={{ duration: 0.3 }}
          style={{
            width: 120,
            height: 120,
            borderRadius: 60,
            background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`,
            margin: '0 auto 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 60,
            boxShadow: `0 0 30px ${colors.primaryGlow}`,
          }}
        >
          😵
        </motion.div>

        {/* Status */}
        <p style={{
          color: colors.textSecondary,
          fontSize: 14,
          textAlign: 'center',
          marginBottom: 8,
        }}>
          Current Condition: <span style={{ color: colors.primary, fontWeight: 'bold' }}>{status}</span>
        </p>

        {/* Abuse Counter */}
        <p style={{
          color: colors.textMuted,
          fontSize: 16,
          textAlign: 'center',
          marginBottom: 16,
        }}>
          Times abused: <span style={{ color: '#ff6b6b', fontWeight: 'bold', fontSize: 20 }}>{abuseCount}</span>
        </p>

        {/* Current Message */}
        <AnimatePresence mode="wait">
          {currentMessage && (
            <motion.div
              key={currentMessage}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              style={{
                background: colors.card,
                border: `1px solid ${colors.border}`,
                borderRadius: 12,
                padding: 16,
                marginBottom: 20,
                textAlign: 'center',
              }}
            >
              <p style={{ color: colors.textPrimary, fontSize: 16, fontStyle: 'italic' }}>
                {currentMessage}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Chill Message */}
        <AnimatePresence>
          {showChillMessage && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              style={{
                position: 'fixed',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                background: '#ff6b6b',
                padding: '20px 40px',
                borderRadius: 16,
                zIndex: 200,
              }}
            >
              <p style={{ color: 'white', fontSize: 24, fontWeight: 'bold' }}>Bro chill. 😭</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Achievement */}
        <AnimatePresence>
          {showAchievement && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                background: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
                borderRadius: 12,
                padding: 16,
                marginBottom: 20,
                textAlign: 'center',
              }}
            >
              <p style={{ color: '#000', fontSize: 14 }}>🏆 ACHIEVEMENT UNLOCKED</p>
              <p style={{ color: '#000', fontSize: 20, fontWeight: 'bold' }}>Menace</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Attack Buttons Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 10,
          marginBottom: 24,
        }}>
          {ATTACKS.map((attack) => (
            <motion.button
              key={attack.name}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => handleAttack(attack)}
              style={{
                background: colors.card,
                border: `1px solid ${colors.border}`,
                borderRadius: 12,
                padding: '14px 8px',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 4,
              }}
            >
              <span style={{ fontSize: 28 }}>{attack.emoji}</span>
              <span style={{ color: colors.textSecondary, fontSize: 11 }}>{attack.name}</span>
            </motion.button>
          ))}
        </div>

        {/* Heal Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={healPrabh}
          style={{
            width: '100%',
            padding: '16px',
            background: 'linear-gradient(135deg, #4ade80, #22c55e)',
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
          💚 Heal Prabh
        </motion.button>
      </div>
    </div>
  )
}