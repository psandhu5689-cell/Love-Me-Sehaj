import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { IoChevronBack, IoHeart, IoSkull, IoWarning, IoFlash } from 'react-icons/io5'
import { useTheme } from '../context/ThemeContext'
import { useAudio } from '../context/AudioContext'

const GAMES = [
  {
    id: 'lie-detector',
    title: 'Lie Detector',
    subtitle: 'Sehaj Certified Truth Machine',
    emoji: '🔬',
    icon: IoFlash,
    gradient: ['#00ff00', '#00cc00'],
    description: 'Test your honesty (spoiler: you\'re lying)',
    route: '/lie-detector',
  },
  {
    id: 'emergency',
    title: 'Relationship Emergency',
    subtitle: 'Crisis Alert System',
    emoji: '🚨',
    icon: IoWarning,
    gradient: ['#ff0000', '#cc0000'],
    description: 'Detect and resolve love emergencies',
    route: '/relationship-emergency',
  },
  {
    id: 'torture',
    title: 'Torture Chamber',
    subtitle: 'Prabh Damage Tracker',
    emoji: '⚔️',
    icon: IoSkull,
    gradient: ['#a855f7', '#7c3aed'],
    description: 'Unleash chaos (he can take it)',
    route: '/torture-chamber',
  },
]

export default function TryNotToSmile() {
  const navigate = useNavigate()
  const { colors } = useTheme()
  const { playClick, playPop } = useAudio()
  const [hoveredGame, setHoveredGame] = useState<string | null>(null)

  const handleGameSelect = (route: string) => {
    playPop()
    navigate(route)
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: colors.background,
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Animated background particles */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            animate={{
              y: ['100vh', '-100px'],
              x: [Math.random() * 100 + '%', Math.random() * 100 + '%'],
              opacity: [0, 0.3, 0],
            }}
            transition={{
              duration: Math.random() * 10 + 10,
              repeat: Infinity,
              delay: Math.random() * 5,
            }}
            style={{
              position: 'absolute',
              fontSize: 24,
              opacity: 0.2,
            }}
          >
            {['😈', '💀', '🔥', '⚡', '💥'][Math.floor(Math.random() * 5)]}
          </motion.div>
        ))}
      </div>

      {/* Back Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => {
          playClick()
          navigate('/')
        }}
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

      <div style={{ padding: '80px 24px 40px', flex: 1, position: 'relative', zIndex: 10 }}>
        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ textAlign: 'center', marginBottom: 40 }}
        >
          <motion.div
            animate={{ rotate: [0, -5, 5, -5, 0] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
          >
            <span style={{ fontSize: 60 }}>😈</span>
          </motion.div>
          <h1 style={{
            color: colors.textPrimary,
            fontSize: 32,
            fontWeight: 'bold',
            marginTop: 16,
            marginBottom: 8,
            letterSpacing: 1,
          }}>
            Try Not to Smile
          </h1>
          <p style={{
            color: colors.textSecondary,
            fontSize: 16,
            fontStyle: 'italic',
          }}>
            Chaotic games for chaotic love 💕
          </p>
        </motion.div>

        {/* Game Cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 400, margin: '0 auto' }}>
          {GAMES.map((game, index) => (
            <motion.button
              key={game.id}
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 + 0.2 }}
              whileHover={{ scale: 1.02, x: 5 }}
              whileTap={{ scale: 0.98 }}
              onMouseEnter={() => setHoveredGame(game.id)}
              onMouseLeave={() => setHoveredGame(null)}
              onClick={() => handleGameSelect(game.route)}
              style={{
                background: colors.card,
                border: `2px solid ${hoveredGame === game.id ? game.gradient[0] : colors.border}`,
                borderRadius: 20,
                padding: 20,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 16,
                textAlign: 'left',
                transition: 'border-color 0.2s',
                boxShadow: hoveredGame === game.id ? `0 0 20px ${game.gradient[0]}30` : 'none',
              }}
            >
              {/* Game Icon */}
              <motion.div
                animate={hoveredGame === game.id ? { scale: [1, 1.1, 1] } : {}}
                transition={{ duration: 0.3 }}
                style={{
                  width: 60,
                  height: 60,
                  borderRadius: 16,
                  background: `linear-gradient(135deg, ${game.gradient[0]}, ${game.gradient[1]})`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 30,
                  boxShadow: `0 4px 15px ${game.gradient[0]}40`,
                }}
              >
                {game.emoji}
              </motion.div>

              {/* Game Info */}
              <div style={{ flex: 1 }}>
                <h3 style={{
                  color: colors.textPrimary,
                  fontSize: 18,
                  fontWeight: 'bold',
                  marginBottom: 2,
                }}>
                  {game.title}
                </h3>
                <p style={{
                  color: game.gradient[0],
                  fontSize: 12,
                  fontWeight: 600,
                  marginBottom: 4,
                  textTransform: 'uppercase',
                  letterSpacing: 0.5,
                }}>
                  {game.subtitle}
                </p>
                <p style={{
                  color: colors.textSecondary,
                  fontSize: 13,
                }}>
                  {game.description}
                </p>
              </div>

              {/* Arrow */}
              <motion.div
                animate={hoveredGame === game.id ? { x: [0, 5, 0] } : {}}
                transition={{ duration: 0.5, repeat: hoveredGame === game.id ? Infinity : 0 }}
              >
                <span style={{ color: game.gradient[0], fontSize: 24 }}>→</span>
              </motion.div>
            </motion.button>
          ))}
        </div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          style={{ textAlign: 'center', marginTop: 40 }}
        >
          <IoHeart size={20} color={colors.primary} />
          <p style={{
            color: colors.textMuted,
            fontSize: 13,
            marginTop: 8,
            fontStyle: 'italic',
          }}>
            Warning: May cause excessive laughter 😏
          </p>
        </motion.div>
      </div>
    </div>
  )
}
