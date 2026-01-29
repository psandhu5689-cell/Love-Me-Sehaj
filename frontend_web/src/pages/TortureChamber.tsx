import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { IoChevronBack } from 'react-icons/io5'
import { useTheme } from '../context/ThemeContext'
import { useAudio } from '../context/AudioContext'
import { tortureStorage } from '../utils/storage'

const PRABH_PHOTO = 'https://customer-assets.emergentagent.com/job_dfed6d65-0ed2-4f77-b083-beee4ed42ad3/artifacts/45if95ab_Untitled%20design-2.png'

const DAMAGE_ATTACKS = [
  { emoji: '🔥', name: 'Burn', damage: 15, message: 'Prabh got burned.' },
  { emoji: '👉', name: 'Poke eyeball', damage: 5, message: 'Prabh can\'t see properly now.' },
  { emoji: '💥', name: 'Bite dick', damage: 20, message: 'OUCH. That one hurt.' },
  { emoji: '👊', name: 'Punch', damage: 12, message: 'Prabh took a hit.' },
  { emoji: '🧻', name: 'Suffocate', damage: 8, message: 'Prabh can\'t breathe.' },
  { emoji: '🔪', name: 'Stab', damage: 20, message: 'Prabh got stabbed (cartoon style).' },
  { emoji: '💣', name: 'Explode', damage: 25, message: 'BOOM. Prabh exploded.' },
  { emoji: '👟', name: 'Kick in balls', damage: 45, message: 'CRITICAL HIT. Prabh is crying.' },
  { emoji: '🧲', name: 'Rob Wallet', damage: 3, message: 'Prabh lost his money. Again.' },
  { emoji: '😭', name: 'Cut weiner off', damage: 45, message: 'Prabh has lost something precious.' },
]

const HEAL_ACTIONS = [
  { emoji: '💖', name: 'Kiss', heal: 20, message: 'Prabh feels loved.' },
  { emoji: '🤗', name: 'Fuck him', heal: 25, message: 'OH FUCK YEAH.' },
  { emoji: '🍕', name: 'Feed', heal: 15, message: 'Prabh is full and happy.' },
  { emoji: '💬', name: 'Give head', heal: 10, message: 'Back in business.' },
  { emoji: '👅', name: 'Let him eat you out', heal: 40, message: 'Prabh is in heaven.' },
]

const RANDOM_DAMAGE_MESSAGES = [
  "Prabh got a booboo.",
  "Prabh said ouchie.",
  "Ouchhhh.",
  "That looked personal.",
  "Prabh regrets this.",
]

const HEAL_MESSAGES = [
  "Ooo that felt nice.",
  "Feeling loved again.",
  "Back in business.",
  "Warm and happy.",
  "Okay okay I feel better.",
]

export default function TortureChamber() {
  const navigate = useNavigate()
  const { colors } = useTheme()
  const { playClick, playPop } = useAudio()
  
  // Load initial stats from storage
  const [stats, setStats] = useState(tortureStorage.getStats())
  const [hp, setHp] = useState(stats.currentHp)
  const [maxHp] = useState(3000)
  const [currentMessage, setCurrentMessage] = useState('')
  const [floatingMessages, setFloatingMessages] = useState<{ id: string; value: number; isHeal: boolean; timestamp: number }[]>([])
  const [isShaking, setIsShaking] = useState(false)
  const [isDead, setIsDead] = useState(false)
  const [showJustKidding, setShowJustKidding] = useState(false)
  const [wasJustDamaged, setWasJustDamaged] = useState(false)
  
  // Save HP to storage whenever it changes
  useEffect(() => {
    tortureStorage.updateStats({ currentHp: hp })
  }, [hp])

  // Get status based on HP
  const getStatus = () => {
    if (hp > 3000) return "tooooo much love...."
    if (hp > 2100) return "Vibing."  // 70%
    if (hp > 1200) return "Concerned."  // 40%
    if (hp > 450) return "Regretting life choices."  // 15%
    return "On life support."
  }

  // Get HP bar color
  const getHpColor = () => {
    if (hp > 3000) return '#ff69b4' // Pink for overheal
    if (hp > 1800) return '#4ade80' // Green (60%)
    if (hp > 900) return '#fbbf24' // Yellow (30%)
    return '#ef4444' // Red
  }

  // Handle damage
  const handleDamage = (attack: typeof DAMAGE_ATTACKS[0]) => {
    playPop()
    setIsShaking(true)
    setWasJustDamaged(true)
    setTimeout(() => setIsShaking(false), 300)

    const newHp = Math.max(0, hp - attack.damage)
    setHp(newHp)

    // Show floating damage
    setFloatingDamage({ value: -attack.damage, isHeal: false })
    setTimeout(() => setFloatingDamage(null), 1000)

    // Random message or attack message
    if (Math.random() < 0.3) {
      setCurrentMessage(RANDOM_DAMAGE_MESSAGES[Math.floor(Math.random() * RANDOM_DAMAGE_MESSAGES.length)])
    } else {
      setCurrentMessage(attack.message)
    }

    // Check for death
    if (newHp <= 0) {
      setIsDead(true)
      const newStats = tortureStorage.incrementDeaths()
      setStats(newStats)
      setTimeout(() => {
        setShowJustKidding(true)
        setTimeout(() => {
          setHp(900)  // Revive to 30% of 3000
          const revivedStats = tortureStorage.incrementRevivals()
          setStats(revivedStats)
          setIsDead(false)
          setShowJustKidding(false)
          setCurrentMessage("im immortal unfortunately.")
        }, 2000)
      }, 1500)
    }
  }

  // Handle healing
  const handleHeal = (action: typeof HEAL_ACTIONS[0]) => {
    playClick()
    
    // Check for redemption arc
    if (wasJustDamaged) {
      setCurrentMessage("Redemption arc.")
      setWasJustDamaged(false)
    } else {
      setCurrentMessage(action.message)
    }

    const newHp = Math.min(1800, hp + action.heal) // Cap at 1800 (120% of 1500)
    setHp(newHp)

    // Show floating heal
    setFloatingDamage({ value: action.heal, isHeal: true })
    setTimeout(() => setFloatingDamage(null), 1000)
  }

  // Revive button
  const handleRevive = () => {
    playClick()
    setHp(1500)
    setCurrentMessage("Sehaj forgives you.")
    setWasJustDamaged(false)
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'transparent',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
      overflow: 'hidden',
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
          background: 'rgba(255,255,255,0.1)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255,255,255,0.2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          zIndex: 101,
          boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
        }}
      >
        <IoChevronBack size={24} color="#fff" />
      </motion.button>

      <div style={{ 
        padding: '70px 20px 20px', 
        flex: 1, 
        display: 'flex', 
        flexDirection: 'column',
        alignItems: 'center',
        maxWidth: 500,
        margin: '0 auto',
        width: '100%',
      }}>
        {/* Title */}
        <h1 style={{ 
          color: '#fff', 
          fontSize: 24, 
          fontWeight: 'bold', 
          marginBottom: 4,
          textAlign: 'center',
        }}>
          ⚔️ Torture Chamber
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14, marginBottom: 16 }}>
          "Prabh Damage Simulator"
        </p>

        {/* HP Bar */}
        <div style={{ width: '100%', marginBottom: 8 }}>
          <div style={{
            width: '100%',
            height: 28,
            background: 'rgba(255,255,255,0.05)',
            backdropFilter: 'blur(10px)',
            borderRadius: 14,
            overflow: 'hidden',
            position: 'relative',
            border: hp > 1500 ? '2px solid #ff69b4' : '1px solid rgba(255,255,255,0.2)',
            boxShadow: hp > 1500 ? '0 0 25px rgba(255,105,180,0.5)' : '0 4px 20px rgba(0,0,0,0.2), inset 0 0 20px rgba(255,255,255,0.05)',
          }}>
            <motion.div
              animate={{ width: `${Math.min((hp / maxHp) * 100, 120)}%` }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              style={{
                height: '100%',
                background: `linear-gradient(90deg, ${getHpColor()}, ${getHpColor()}cc)`,
                borderRadius: 14,
                boxShadow: `0 0 20px ${getHpColor()}50`,
              }}
            />
            <span style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              color: '#fff',
              fontWeight: 'bold',
              fontSize: 14,
              textShadow: '0 2px 4px rgba(0,0,0,0.5)',
            }}>
              {hp} / {maxHp} HP
            </span>
          </div>
        </div>

        {/* Status Text */}
        <p style={{ 
          color: getHpColor(), 
          fontSize: 16, 
          fontWeight: 600,
          marginBottom: 16,
          textAlign: 'center',
        }}>
          Status: {getStatus()}
        </p>

        {/* Photo Avatar - Center of Screen */}
        <motion.div
          animate={isShaking ? { x: [-10, 10, -10, 10, 0] } : {}}
          transition={{ duration: 0.3 }}
          style={{
            position: 'relative',
            marginBottom: 16,
          }}
        >
          {/* Floating Damage/Heal Number */}
          <AnimatePresence>
            {floatingDamage && (
              <motion.div
                initial={{ opacity: 1, y: 0, scale: 1 }}
                animate={{ opacity: 0, y: -60, scale: 1.5 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1 }}
                style={{
                  position: 'absolute',
                  top: -20,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  color: floatingDamage.isHeal ? '#4ade80' : '#ef4444',
                  fontSize: 32,
                  fontWeight: 'bold',
                  textShadow: `0 0 10px ${floatingDamage.isHeal ? '#4ade80' : '#ef4444'}`,
                  zIndex: 10,
                }}
              >
                {floatingDamage.isHeal ? '+' : ''}{floatingDamage.value}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Prabh Photo */}
          <motion.div
            animate={isDead ? { rotate: 90, opacity: 0.5 } : { rotate: 0, opacity: 1 }}
            style={{
              width: 200,
              height: 200,
              borderRadius: 20,
              overflow: 'hidden',
              border: `4px solid ${getHpColor()}`,
              boxShadow: `0 0 30px ${getHpColor()}40`,
            }}
          >
            <img 
              src={PRABH_PHOTO} 
              alt="Prabh"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                filter: hp <= 15 ? 'grayscale(50%)' : 'none',
              }}
            />
          </motion.div>

          {/* Death overlay */}
          <AnimatePresence>
            {isDead && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: 'rgba(0,0,0,0.7)',
                  borderRadius: 20,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <motion.p
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 0.5, repeat: Infinity }}
                  style={{
                    color: '#ef4444',
                    fontSize: 16,
                    fontWeight: 'bold',
                    textAlign: 'center',
                    textShadow: '0 0 10px #ef4444',
                  }}
                >
                  {showJustKidding ? "Just kidding." : "PRABH HAS DIED."}
                </motion.p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Current Message */}
        <AnimatePresence mode="wait">
          {currentMessage && (
            <motion.div
              key={currentMessage}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              style={{
                background: 'rgba(255,255,255,0.1)',
                borderRadius: 12,
                padding: '10px 20px',
                marginBottom: 16,
                maxWidth: '100%',
              }}
            >
              <p style={{ 
                color: '#fff', 
                fontSize: 14, 
                fontStyle: 'italic',
                textAlign: 'center',
              }}>
                "{currentMessage}"
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Damage Buttons */}
        <div style={{ width: '100%', marginBottom: 16 }}>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, marginBottom: 8, textAlign: 'center' }}>
            💀 DAMAGE
          </p>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(5, 1fr)',
            gap: 6,
          }}>
            {DAMAGE_ATTACKS.map((attack) => (
              <motion.button
                key={attack.name}
                whileHover={{ scale: 1.08, boxShadow: '0 0 20px rgba(239,68,68,0.4)' }}
                whileTap={{ scale: 0.9 }}
                onClick={() => handleDamage(attack)}
                disabled={isDead}
                style={{
                  background: 'rgba(239,68,68,0.15)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(239,68,68,0.3)',
                  borderRadius: 10,
                  padding: '8px 2px',
                  cursor: isDead ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 1,
                  opacity: isDead ? 0.5 : 1,
                  minHeight: 70,
                  boxShadow: '0 4px 15px rgba(0,0,0,0.2), inset 0 0 15px rgba(239,68,68,0.1)',
                }}
              >
                <motion.span 
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity, delay: Math.random() * 2 }}
                  style={{ fontSize: 20 }}
                >
                  {attack.emoji}
                </motion.span>
                <span style={{ 
                  color: 'rgba(255,255,255,0.8)', 
                  fontSize: 8, 
                  fontWeight: 500,
                  textAlign: 'center',
                  lineHeight: 1.1,
                  maxWidth: '100%',
                  overflow: 'hidden',
                }}>
                  {attack.name}
                </span>
                <span style={{ color: '#ef4444', fontSize: 9, fontWeight: 700 }}>
                  -{attack.damage}
                </span>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Heal Buttons */}
        <div style={{ width: '100%', marginBottom: 16 }}>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, marginBottom: 8, textAlign: 'center' }}>
            💚 HEALING
          </p>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(5, 1fr)',
            gap: 6,
          }}>
            {HEAL_ACTIONS.map((action) => (
              <motion.button
                key={action.name}
                whileHover={{ scale: 1.08, boxShadow: '0 0 20px rgba(74,222,128,0.4)' }}
                whileTap={{ scale: 0.9 }}
                onClick={() => handleHeal(action)}
                disabled={isDead}
                style={{
                  background: 'rgba(74,222,128,0.15)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(74,222,128,0.3)',
                  borderRadius: 10,
                  padding: '8px 2px',
                  cursor: isDead ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 1,
                  opacity: isDead ? 0.5 : 1,
                  minHeight: 70,
                  boxShadow: '0 4px 15px rgba(0,0,0,0.2), inset 0 0 15px rgba(74,222,128,0.1)',
                }}
              >
                <motion.span 
                  animate={{ scale: [1, 1.15, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity, delay: Math.random() * 2 }}
                  style={{ fontSize: 20 }}
                >
                  {action.emoji}
                </motion.span>
                <span style={{ 
                  color: 'rgba(255,255,255,0.8)', 
                  fontSize: 8, 
                  fontWeight: 500,
                  textAlign: 'center',
                  lineHeight: 1.1,
                  maxWidth: '100%',
                  overflow: 'hidden',
                }}>
                  {action.name}
                </span>
                <span style={{ color: '#4ade80', fontSize: 9, fontWeight: 700 }}>
                  +{action.heal}
                </span>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Revive Button */}
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={handleRevive}
          style={{
            width: '100%',
            padding: '14px',
            background: 'linear-gradient(135deg, #a855f7, #7c3aed)',
            border: 'none',
            borderRadius: 25,
            color: 'white',
            fontSize: 16,
            fontWeight: 'bold',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
          }}
        >
          ✨ Revive Prabh
        </motion.button>

        {/* Stats Display */}
        <div style={{
          marginTop: 20,
          padding: 16,
          background: 'rgba(0,0,0,0.3)',
          borderRadius: 12,
          display: 'flex',
          justifyContent: 'space-around',
          gap: 16,
        }}>
          <div style={{ textAlign: 'center' }}>
            <p style={{ color: '#ef4444', fontSize: 24, fontWeight: 'bold' }}>
              {stats.totalDeaths}
            </p>
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12 }}>
              Deaths 💀
            </p>
          </div>
          <div style={{ textAlign: 'center' }}>
            <p style={{ color: '#a78bfa', fontSize: 24, fontWeight: 'bold' }}>
              {stats.totalRevivals}
            </p>
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12 }}>
              Revivals ✨
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
