import React, { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { IoChevronBackOutline, IoSunny, IoMoon, IoRainy, IoVolumeHigh, IoVolumeMute } from 'react-icons/io5'
import { useNavigate } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'
import haptics from '../utils/haptics'
import { Howl, Howler } from 'howler'

// Sprite sheets - cat1 is grey (Prabh/Black), cat2 is brown (Sehaj/Ginger)
import cat1Sheet from '../assets/sprites/cat1_sheet.png'
import cat2Sheet from '../assets/sprites/cat2_sheet.png'

// ============ SPRITE ANIMATION SYSTEM ============

const FRAME_SIZE = 64
const SHEET_COLS = 14

// Animation state definitions based on sprite sheet analysis
// Each animation maps to a row range in the sprite sheet
interface AnimationDef {
  startRow: number
  frameCount: number
  fps: number
  loop: boolean
}

// Animation maps for each cat (based on sprite sheet analysis)
// Cat 1 (Prabh - grey/black cat)
const PRABH_ANIMATIONS: Record<string, AnimationDef> = {
  idle: { startRow: 0, frameCount: 5, fps: 4, loop: true },
  idle2: { startRow: 1, frameCount: 5, fps: 4, loop: true },
  sit: { startRow: 2, frameCount: 5, fps: 3, loop: true },
  lying: { startRow: 4, frameCount: 8, fps: 4, loop: true },
  sleep: { startRow: 5, frameCount: 4, fps: 2, loop: true },
  walk: { startRow: 6, frameCount: 10, fps: 8, loop: true },
  run: { startRow: 8, frameCount: 10, fps: 12, loop: true },
  wake: { startRow: 3, frameCount: 5, fps: 6, loop: false },
  nudge: { startRow: 9, frameCount: 7, fps: 10, loop: false },
  kick: { startRow: 10, frameCount: 6, fps: 12, loop: false },
  react: { startRow: 11, frameCount: 4, fps: 8, loop: false },
  cuddle: { startRow: 4, frameCount: 6, fps: 3, loop: true },
  gaming: { startRow: 2, frameCount: 5, fps: 5, loop: true },
}

// Cat 2 (Sehaj - brown/ginger cat) - similar structure
const SEHAJ_ANIMATIONS: Record<string, AnimationDef> = {
  idle: { startRow: 0, frameCount: 5, fps: 4, loop: true },
  idle2: { startRow: 1, frameCount: 5, fps: 4, loop: true },
  sit: { startRow: 2, frameCount: 5, fps: 3, loop: true },
  lying: { startRow: 3, frameCount: 7, fps: 4, loop: true },
  sleep: { startRow: 5, frameCount: 4, fps: 2, loop: true },
  walk: { startRow: 6, frameCount: 10, fps: 8, loop: true },
  run: { startRow: 8, frameCount: 10, fps: 12, loop: true },
  wake: { startRow: 4, frameCount: 5, fps: 6, loop: false },
  nudge: { startRow: 9, frameCount: 7, fps: 10, loop: false },
  kick: { startRow: 10, frameCount: 6, fps: 12, loop: false },
  react: { startRow: 11, frameCount: 4, fps: 8, loop: false },
  cuddle: { startRow: 3, frameCount: 6, fps: 3, loop: true },
  gaming: { startRow: 2, frameCount: 5, fps: 5, loop: true },
}

type AnimationState = 'idle' | 'sit' | 'lying' | 'sleep' | 'walk' | 'run' | 'wake' | 'nudge' | 'kick' | 'react' | 'cuddle' | 'gaming'

// ============ SPRITE COMPONENT ============

interface SpriteProps {
  sheet: string
  animations: Record<string, AnimationDef>
  currentAnimation: AnimationState
  onAnimationEnd?: () => void
  scale?: number
  flip?: boolean
}

function Sprite({ sheet, animations, currentAnimation, onAnimationEnd, scale = 1, flip = false }: SpriteProps) {
  const [frame, setFrame] = useState(0)
  const animRef = useRef<number | null>(null)
  const lastTimeRef = useRef(0)
  
  const anim = animations[currentAnimation] || animations.idle
  
  useEffect(() => {
    setFrame(0)
    lastTimeRef.current = 0
    
    const animate = (time: number) => {
      if (!lastTimeRef.current) lastTimeRef.current = time
      
      const delta = time - lastTimeRef.current
      const frameTime = 1000 / anim.fps
      
      if (delta >= frameTime) {
        setFrame(prev => {
          const nextFrame = prev + 1
          if (nextFrame >= anim.frameCount) {
            if (anim.loop) {
              return 0
            } else {
              onAnimationEnd?.()
              return prev
            }
          }
          return nextFrame
        })
        lastTimeRef.current = time
      }
      
      animRef.current = requestAnimationFrame(animate)
    }
    
    animRef.current = requestAnimationFrame(animate)
    
    return () => {
      if (animRef.current) {
        cancelAnimationFrame(animRef.current)
      }
    }
  }, [currentAnimation, anim.fps, anim.frameCount, anim.loop, onAnimationEnd])
  
  // Calculate sprite position
  const col = frame % SHEET_COLS
  const row = anim.startRow + Math.floor(frame / SHEET_COLS)
  
  const size = FRAME_SIZE * scale
  
  return (
    <div style={{
      width: size,
      height: size,
      overflow: 'hidden',
      transform: flip ? 'scaleX(-1)' : 'none',
      imageRendering: 'pixelated',
    }}>
      <div style={{
        width: SHEET_COLS * FRAME_SIZE * scale,
        height: 72 * FRAME_SIZE * scale, // 72 rows in sheet
        backgroundImage: `url(${sheet})`,
        backgroundSize: `${SHEET_COLS * FRAME_SIZE * scale}px auto`,
        transform: `translate(-${col * size}px, -${row * size}px)`,
        imageRendering: 'pixelated',
      }} />
    </div>
  )
}

// ============ AUDIO SETUP ============

// Using free sound URLs (you can replace with actual audio files)
const AUDIO = {
  meow: 'https://assets.mixkit.co/active_storage/sfx/2013/2013-preview.mp3',
  purr: 'https://assets.mixkit.co/active_storage/sfx/234/234-preview.mp3',
  annoyed: 'https://assets.mixkit.co/active_storage/sfx/2024/2024-preview.mp3',
  rain: 'https://assets.mixkit.co/active_storage/sfx/1253/1253-preview.mp3',
}

// ============ MAIN COMPONENT ============

type CatAction = AnimationState

interface CatState {
  mood: number
  action: CatAction
  isAwake: boolean
}

const CUDDLE_MESSAGES = [
  "Rustle in the blankets...",
  "Some movement...",
  "A couple giggles later...",
  "Private cat business...",
  "Definitely cuddling.",
]

const FOOD_ITEMS = ['🐟', '🦴', '🍖', '🍣', '🥛']

export default function VirtualBed() {
  const navigate = useNavigate()
  const { colors, isDark } = useTheme()
  
  // Scene state
  const [isNight, setIsNight] = useState(false)
  const [isRaining, setIsRaining] = useState(false)
  const [isMuted, setIsMuted] = useState(true)
  const [blanketOffset, setBlanketOffset] = useState(50)
  const [userInteracted, setUserInteracted] = useState(false)
  
  // Cat states
  const [prabh, setPrabh] = useState<CatState>({
    mood: 75,
    action: 'idle',
    isAwake: true,
  })
  
  const [sehaj, setSehaj] = useState<CatState>({
    mood: 75,
    action: 'idle',
    isAwake: true,
  })
  
  // Effects state
  const [showEffect, setShowEffect] = useState<{
    type: 'heart' | 'z' | 'puff' | 'sparkle' | 'food'
    x: number
    y: number
    value?: string
  } | null>(null)
  
  // Special button state
  const [cuddleMode, setCuddleMode] = useState(false)
  const [cuddleMessage, setCuddleMessage] = useState('')
  
  // Audio refs
  const rainSoundRef = useRef<Howl | null>(null)
  
  // Initialize rain sound
  useEffect(() => {
    rainSoundRef.current = new Howl({
      src: [AUDIO.rain],
      loop: true,
      volume: 0.3,
    })
    
    return () => {
      rainSoundRef.current?.unload()
    }
  }, [])
  
  // Handle rain sound
  useEffect(() => {
    if (!userInteracted || isMuted) {
      rainSoundRef.current?.pause()
      return
    }
    
    if (isRaining) {
      rainSoundRef.current?.play()
    } else {
      rainSoundRef.current?.pause()
    }
  }, [isRaining, isMuted, userInteracted])
  
  // Clear effects after animation
  useEffect(() => {
    if (showEffect) {
      const timeout = setTimeout(() => setShowEffect(null), 1500)
      return () => clearTimeout(timeout)
    }
  }, [showEffect])
  
  const playSound = useCallback((soundUrl: string) => {
    if (!userInteracted || isMuted) return
    const sound = new Howl({ src: [soundUrl], volume: 0.4 })
    sound.play()
  }, [userInteracted, isMuted])
  
  const getMoodLabel = (mood: number): string => {
    if (mood > 80) return 'Happy'
    if (mood > 60) return 'Cozy'
    if (mood > 40) return 'Okay'
    if (mood > 20) return 'Annoyed'
    return 'Mischievous'
  }
  
  const getMoodColor = (mood: number): string => {
    if (mood > 80) return '#4CAF50'
    if (mood > 60) return '#8BC34A'
    if (mood > 40) return '#FFC107'
    if (mood > 20) return '#FF9800'
    return '#F44336'
  }
  
  // Animation end handlers
  const handlePrabhAnimEnd = useCallback(() => {
    setPrabh(prev => ({
      ...prev,
      action: prev.isAwake ? 'idle' : 'sleep'
    }))
  }, [])
  
  const handleSehajAnimEnd = useCallback(() => {
    setSehaj(prev => ({
      ...prev,
      action: prev.isAwake ? 'idle' : 'sleep'
    }))
  }, [])
  
  // Cat action handler
  const handleCatAction = (
    cat: 'prabh' | 'sehaj',
    action: 'wake' | 'sleep' | 'nudge' | 'kick' | 'hog' | 'feed' | 'game'
  ) => {
    if (!userInteracted) setUserInteracted(true)
    
    haptics.light()
    const isLeft = cat === 'sehaj'
    const setCat = cat === 'prabh' ? setPrabh : setSehaj
    const setOtherCat = cat === 'prabh' ? setSehaj : setPrabh
    
    switch (action) {
      case 'wake':
        playSound(AUDIO.meow)
        setCat(prev => ({ 
          ...prev, 
          isAwake: true, 
          action: 'wake', 
          mood: Math.min(100, prev.mood + 10) 
        }))
        break
        
      case 'sleep':
        playSound(AUDIO.purr)
        setCat(prev => ({ ...prev, isAwake: false, action: 'sleep', mood: Math.min(100, prev.mood + 5) }))
        setShowEffect({ type: 'z', x: isLeft ? 35 : 65, y: 35 })
        break
        
      case 'nudge':
        playSound(AUDIO.meow)
        setCat(prev => ({ ...prev, action: 'nudge', mood: Math.min(100, prev.mood + 15) }))
        setTimeout(() => {
          setOtherCat(prev => ({ ...prev, action: 'react', mood: Math.min(100, prev.mood + 10) }))
        }, 300)
        setShowEffect({ type: 'heart', x: 50, y: 35 })
        break
        
      case 'kick':
        playSound(AUDIO.annoyed)
        haptics.medium()
        setCat(prev => ({ ...prev, action: 'kick', mood: Math.max(0, prev.mood - 5) }))
        setTimeout(() => {
          setOtherCat(prev => ({ ...prev, action: 'react', mood: Math.max(0, prev.mood - 10) }))
          setShowEffect({ type: 'puff', x: isLeft ? 60 : 40, y: 45 })
        }, 200)
        break
        
      case 'hog':
        haptics.medium()
        setBlanketOffset(isLeft ? 30 : 70)
        setCat(prev => ({ ...prev, mood: Math.min(100, prev.mood + 10) }))
        setOtherCat(prev => ({ ...prev, action: 'react', mood: Math.max(0, prev.mood - 15) }))
        setTimeout(() => setBlanketOffset(50), 3000)
        break
        
      case 'feed':
        playSound(AUDIO.meow)
        setCat(prev => ({ ...prev, action: 'nudge', mood: Math.min(100, prev.mood + 20) }))
        const food = FOOD_ITEMS[Math.floor(Math.random() * FOOD_ITEMS.length)]
        setShowEffect({ type: 'food', x: isLeft ? 35 : 65, y: 40, value: food })
        break
        
      case 'game':
        setCat(prev => ({ ...prev, action: 'gaming', mood: Math.min(100, prev.mood + 15) }))
        setShowEffect({ type: 'sparkle', x: isLeft ? 35 : 65, y: 45 })
        // Return to idle after 3 seconds
        setTimeout(() => {
          setCat(prev => ({ ...prev, action: prev.isAwake ? 'idle' : 'sleep' }))
        }, 3000)
        break
    }
  }
  
  // Special "fuck" button handler
  const handleSpecialButton = () => {
    if (!userInteracted) setUserInteracted(true)
    
    haptics.heavy()
    setCuddleMode(true)
    setCuddleMessage(CUDDLE_MESSAGES[Math.floor(Math.random() * CUDDLE_MESSAGES.length)])
    setIsNight(true)
    
    // After 2 seconds, fade back
    setTimeout(() => {
      setCuddleMode(false)
      setPrabh(prev => ({ ...prev, action: 'cuddle', mood: Math.min(100, prev.mood + 25) }))
      setSehaj(prev => ({ ...prev, action: 'cuddle', mood: Math.min(100, prev.mood + 25) }))
      
      // Return to idle after cuddle
      setTimeout(() => {
        setPrabh(prev => ({ ...prev, action: 'idle' }))
        setSehaj(prev => ({ ...prev, action: 'idle' }))
      }, 4000)
    }, 2500)
  }
  
  // Action button component
  const ActionButton = ({ label, onClick, color }: { label: string; onClick: () => void; color?: string }) => (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      style={{
        padding: '10px 12px',
        borderRadius: 16,
        background: colors.card,
        border: `1px solid ${color || colors.border}`,
        color: colors.textPrimary,
        fontSize: 12,
        fontWeight: 600,
        cursor: 'pointer',
        textAlign: 'left',
        transition: 'all 0.2s',
      }}
    >
      {label}
    </motion.button>
  )
  
  return (
    <div style={{
      minHeight: '100vh',
      width: '100%',
      background: 'transparent',
      padding: 24,
      position: 'relative',
      overflow: 'auto',
    }}>
      {/* Cuddle Mode Overlay */}
      <AnimatePresence>
        {cuddleMode && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0,0,0,0.95)',
              zIndex: 1000,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <span style={{ fontSize: 60 }}>💕</span>
            </motion.div>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              style={{
                color: 'white',
                fontSize: 20,
                fontStyle: 'italic',
                marginTop: 24,
                textAlign: 'center',
              }}
            >
              {cuddleMessage}
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Header Controls */}
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={() => {
          haptics.light()
          navigate(-1)
        }}
        style={{
          position: 'fixed',
          top: 20,
          left: 20,
          width: 40,
          height: 40,
          borderRadius: 12,
          background: colors.glass,
          backdropFilter: 'blur(10px)',
          border: `1px solid ${colors.border}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          zIndex: 100,
        }}
      >
        <IoChevronBackOutline size={24} color={colors.textPrimary} />
      </motion.button>
      
      {/* Audio Mute Toggle */}
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={() => {
          if (!userInteracted) setUserInteracted(true)
          setIsMuted(prev => !prev)
        }}
        style={{
          position: 'fixed',
          top: 20,
          right: 70,
          width: 40,
          height: 40,
          borderRadius: 12,
          background: colors.glass,
          backdropFilter: 'blur(10px)',
          border: `1px solid ${colors.border}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          zIndex: 100,
        }}
      >
        {isMuted ? (
          <IoVolumeMute size={20} color={colors.textMuted} />
        ) : (
          <IoVolumeHigh size={20} color={colors.primary} />
        )}
      </motion.button>
      
      {/* Day/Night Toggle */}
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={() => {
          haptics.medium()
          setIsNight(prev => !prev)
          if (!userInteracted) setUserInteracted(true)
        }}
        style={{
          position: 'fixed',
          top: 20,
          right: 20,
          width: 40,
          height: 40,
          borderRadius: 12,
          background: colors.glass,
          backdropFilter: 'blur(10px)',
          border: `1px solid ${colors.border}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          zIndex: 100,
        }}
      >
        {isNight ? <IoMoon size={20} color="#FFD700" /> : <IoSunny size={20} color="#FFA500" />}
      </motion.button>
      
      {/* Main Content */}
      <div style={{
        maxWidth: 600,
        margin: '70px auto 0',
        display: 'flex',
        flexDirection: 'column',
        gap: 20,
      }}>
        <h1 style={{
          fontSize: 28,
          fontWeight: 700,
          background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          textAlign: 'center',
        }}>
          Virtual Bed 🛏️
        </h1>
        
        {/* Room Scene */}
        <motion.div
          animate={{ 
            filter: cuddleMode ? 'brightness(0.3)' : 'brightness(1)',
          }}
          style={{
            background: colors.glass,
            backdropFilter: 'blur(20px)',
            border: `1px solid ${colors.border}`,
            borderRadius: 24,
            padding: 20,
            position: 'relative',
            boxShadow: isNight 
              ? `0 8px 32px rgba(0,0,0,0.4)` 
              : `0 8px 32px ${colors.primaryGlow}`,
          }}
        >
          {/* Window */}
          <div style={{
            width: 160,
            height: 120,
            background: isNight 
              ? 'linear-gradient(180deg, #0a0a1a 0%, #1a1a3e 100%)'
              : 'linear-gradient(180deg, #87CEEB 0%, #B0E0E6 100%)',
            border: `5px solid ${isNight ? '#4a4a5e' : '#8B4513'}`,
            borderRadius: 12,
            margin: '0 auto 16px',
            position: 'relative',
            overflow: 'hidden',
            transition: 'all 0.5s ease',
          }}>
            {/* Window Frame */}
            <div style={{
              position: 'absolute',
              top: 0,
              left: '50%',
              width: 5,
              height: '100%',
              background: isNight ? '#4a4a5e' : '#8B4513',
              transform: 'translateX(-50%)',
            }} />
            <div style={{
              position: 'absolute',
              top: '50%',
              left: 0,
              width: '100%',
              height: 5,
              background: isNight ? '#4a4a5e' : '#8B4513',
              transform: 'translateY(-50%)',
            }} />
            
            {/* Rain Toggle */}
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => {
                setIsRaining(prev => !prev)
                if (!userInteracted) setUserInteracted(true)
              }}
              style={{
                position: 'absolute',
                top: 5,
                right: 5,
                width: 24,
                height: 24,
                borderRadius: 12,
                background: isRaining ? colors.primary : 'rgba(255,255,255,0.3)',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                zIndex: 5,
              }}
            >
              <IoRainy size={14} color={isRaining ? 'white' : colors.textMuted} />
            </motion.button>
            
            {/* Night elements */}
            {isNight ? (
              <>
                {/* Moon */}
                <motion.div
                  animate={{ scale: [1, 1.1, 1], opacity: [0.8, 1, 0.8] }}
                  transition={{ duration: 4, repeat: Infinity }}
                  style={{
                    position: 'absolute',
                    width: 30,
                    height: 30,
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, #FFF8DC 0%, #FFD700 100%)',
                    boxShadow: '0 0 20px #FFD700',
                    top: '20%',
                    right: '20%',
                  }}
                />
                {/* Stars */}
                {[...Array(10)].map((_, i) => (
                  <motion.div
                    key={i}
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 2 + i * 0.3, delay: i * 0.1, repeat: Infinity }}
                    style={{
                      position: 'absolute',
                      width: 3,
                      height: 3,
                      background: 'white',
                      borderRadius: '50%',
                      left: `${10 + (i % 4) * 20}%`,
                      top: `${15 + Math.floor(i / 4) * 25}%`,
                    }}
                  />
                ))}
              </>
            ) : (
              /* Sun */
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
                style={{
                  position: 'absolute',
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  background: 'radial-gradient(circle, #FFD700 0%, #FFA500 100%)',
                  boxShadow: '0 0 25px #FFA500',
                  top: '20%',
                  right: '20%',
                }}
              />
            )}
            
            {/* Rain animation */}
            {isRaining && (
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, overflow: 'hidden' }}>
                {[...Array(30)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ y: -20, x: `${Math.random() * 100}%` }}
                    animate={{ y: 150 }}
                    transition={{
                      duration: 0.5 + Math.random() * 0.3,
                      repeat: Infinity,
                      delay: Math.random() * 0.5,
                    }}
                    style={{
                      position: 'absolute',
                      width: 2,
                      height: 10,
                      background: 'rgba(150, 200, 255, 0.6)',
                      borderRadius: 2,
                    }}
                  />
                ))}
              </div>
            )}
          </div>
          
          {/* Bed Scene Container */}
          <div style={{
            position: 'relative',
            width: '100%',
            height: 220,
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center',
            background: isNight 
              ? 'linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.2) 100%)' 
              : 'transparent',
            borderRadius: 16,
            overflow: 'hidden',
          }}>
            {/* Bed Base (simple representation) */}
            <div style={{
              position: 'absolute',
              bottom: 10,
              width: '85%',
              height: 100,
              background: 'linear-gradient(180deg, #8B4513 0%, #654321 100%)',
              borderRadius: 16,
              border: '4px solid #5D3A1A',
              zIndex: 1,
            }}>
              {/* Bed mattress */}
              <div style={{
                position: 'absolute',
                top: 10,
                left: 10,
                right: 10,
                bottom: 10,
                background: 'linear-gradient(180deg, #F5DEB3 0%, #DDD5BB 100%)',
                borderRadius: 10,
              }} />
            </div>
            
            {/* Sehaj Cat (Left - Ginger) */}
            <motion.div
              animate={{
                y: sehaj.action === 'nudge' || sehaj.action === 'kick' ? [0, -5, 0] : 0,
              }}
              style={{
                position: 'absolute',
                left: '18%',
                bottom: 65,
                zIndex: 2,
              }}
            >
              <Sprite
                sheet={cat2Sheet}
                animations={SEHAJ_ANIMATIONS}
                currentAnimation={sehaj.action}
                onAnimationEnd={handleSehajAnimEnd}
                scale={1.8}
                flip={false}
              />
              {/* Cat name */}
              <p style={{
                position: 'absolute',
                bottom: -20,
                left: '50%',
                transform: 'translateX(-50%)',
                color: colors.textSecondary,
                fontSize: 11,
                fontWeight: 600,
                whiteSpace: 'nowrap',
              }}>
                Sehaj 🧡
              </p>
              {/* Gaming controller overlay */}
              {sehaj.action === 'gaming' && (
                <div style={{
                  position: 'absolute',
                  bottom: -5,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  fontSize: 20,
                }}>
                  🎮
                </div>
              )}
            </motion.div>
            
            {/* Prabh Cat (Right - Grey/Black) */}
            <motion.div
              animate={{
                y: prabh.action === 'nudge' || prabh.action === 'kick' ? [0, -5, 0] : 0,
              }}
              style={{
                position: 'absolute',
                right: '18%',
                bottom: 65,
                zIndex: 2,
              }}
            >
              <Sprite
                sheet={cat1Sheet}
                animations={PRABH_ANIMATIONS}
                currentAnimation={prabh.action}
                onAnimationEnd={handlePrabhAnimEnd}
                scale={1.8}
                flip={true}
              />
              {/* Cat name */}
              <p style={{
                position: 'absolute',
                bottom: -20,
                left: '50%',
                transform: 'translateX(-50%)',
                color: colors.textSecondary,
                fontSize: 11,
                fontWeight: 600,
                whiteSpace: 'nowrap',
              }}>
                Prabh 🖤
              </p>
              {/* Gaming controller overlay */}
              {prabh.action === 'gaming' && (
                <div style={{
                  position: 'absolute',
                  bottom: -5,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  fontSize: 20,
                }}>
                  🎮
                </div>
              )}
            </motion.div>
            
            {/* Blanket Overlay */}
            <motion.div
              animate={{ x: `${blanketOffset - 50}%` }}
              transition={{ type: 'spring', damping: 20 }}
              style={{
                position: 'absolute',
                bottom: 25,
                width: '75%',
                height: 60,
                background: 'linear-gradient(180deg, #E8A5C0 0%, #D88BA5 50%, #C87090 100%)',
                borderRadius: '20px 20px 10px 10px',
                border: '3px solid #B86080',
                zIndex: 3,
                boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
              }}
            >
              {/* Blanket pattern */}
              <div style={{
                position: 'absolute',
                top: 10,
                left: 20,
                right: 20,
                bottom: 10,
                background: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.1) 10px, rgba(255,255,255,0.1) 20px)',
                borderRadius: 10,
              }} />
            </motion.div>
            
            {/* Visual Effects */}
            <AnimatePresence>
              {showEffect && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.5, y: 0 }}
                  animate={{ opacity: 1, scale: 1.3, y: -30 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 1 }}
                  style={{
                    position: 'absolute',
                    left: `${showEffect.x}%`,
                    top: `${showEffect.y}%`,
                    fontSize: 32,
                    zIndex: 10,
                    pointerEvents: 'none',
                  }}
                >
                  {showEffect.type === 'heart' && '💕'}
                  {showEffect.type === 'z' && '💤'}
                  {showEffect.type === 'puff' && '💥'}
                  {showEffect.type === 'sparkle' && '✨'}
                  {showEffect.type === 'food' && showEffect.value}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          {/* Mood Bars */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginTop: 20,
            gap: 16,
          }}>
            {/* Sehaj Mood */}
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <p style={{ color: colors.textPrimary, fontSize: 13, fontWeight: 600 }}>
                  🧡 Sehaj
                </p>
                <p style={{ color: getMoodColor(sehaj.mood), fontSize: 11, fontWeight: 600 }}>
                  {getMoodLabel(sehaj.mood)}
                </p>
              </div>
              <div style={{
                width: '100%',
                height: 8,
                background: colors.card,
                borderRadius: 4,
                overflow: 'hidden',
                border: `1px solid ${colors.border}`,
              }}>
                <motion.div
                  animate={{ width: `${sehaj.mood}%` }}
                  style={{
                    height: '100%',
                    background: `linear-gradient(90deg, ${getMoodColor(sehaj.mood)}, ${colors.primary})`,
                    borderRadius: 4,
                  }}
                />
              </div>
            </div>
            
            {/* Prabh Mood */}
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <p style={{ color: colors.textPrimary, fontSize: 13, fontWeight: 600 }}>
                  🖤 Prabh
                </p>
                <p style={{ color: getMoodColor(prabh.mood), fontSize: 11, fontWeight: 600 }}>
                  {getMoodLabel(prabh.mood)}
                </p>
              </div>
              <div style={{
                width: '100%',
                height: 8,
                background: colors.card,
                borderRadius: 4,
                overflow: 'hidden',
                border: `1px solid ${colors.border}`,
              }}>
                <motion.div
                  animate={{ width: `${prabh.mood}%` }}
                  style={{
                    height: '100%',
                    background: `linear-gradient(90deg, ${getMoodColor(prabh.mood)}, ${colors.secondary})`,
                    borderRadius: 4,
                  }}
                />
              </div>
            </div>
          </div>
          
          {/* Control Buttons */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 16,
            marginTop: 20,
          }}>
            {/* Sehaj Controls */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <p style={{ color: '#E67E22', fontSize: 12, fontWeight: 700, marginBottom: 4 }}>
                Sehaj Actions:
              </p>
              <ActionButton label="👁️ Wake Up" onClick={() => handleCatAction('sehaj', 'wake')} color="#E67E22" />
              <ActionButton label="😴 Sleep" onClick={() => handleCatAction('sehaj', 'sleep')} color="#E67E22" />
              <ActionButton label="💕 Nudge" onClick={() => handleCatAction('sehaj', 'nudge')} color="#E67E22" />
              <ActionButton label="🦵 Kick" onClick={() => handleCatAction('sehaj', 'kick')} color="#E67E22" />
              <ActionButton label="🧣 Hog Blanket" onClick={() => handleCatAction('sehaj', 'hog')} color="#E67E22" />
              <ActionButton label="🍖 Feed" onClick={() => handleCatAction('sehaj', 'feed')} color="#E67E22" />
              <ActionButton label="🎮 Gaming" onClick={() => handleCatAction('sehaj', 'game')} color="#E67E22" />
            </div>
            
            {/* Prabh Controls */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <p style={{ color: '#8E44AD', fontSize: 12, fontWeight: 700, marginBottom: 4 }}>
                Prabh Actions:
              </p>
              <ActionButton label="👁️ Wake Up" onClick={() => handleCatAction('prabh', 'wake')} color="#8E44AD" />
              <ActionButton label="😴 Sleep" onClick={() => handleCatAction('prabh', 'sleep')} color="#8E44AD" />
              <ActionButton label="💕 Nudge" onClick={() => handleCatAction('prabh', 'nudge')} color="#8E44AD" />
              <ActionButton label="🦵 Kick" onClick={() => handleCatAction('prabh', 'kick')} color="#8E44AD" />
              <ActionButton label="🧣 Hog Blanket" onClick={() => handleCatAction('prabh', 'hog')} color="#8E44AD" />
              <ActionButton label="🍖 Feed" onClick={() => handleCatAction('prabh', 'feed')} color="#8E44AD" />
              <ActionButton label="🎮 Gaming" onClick={() => handleCatAction('prabh', 'game')} color="#8E44AD" />
            </div>
          </div>
          
          {/* Special Button */}
          <motion.button
            whileHover={{ scale: 1.02, boxShadow: `0 0 30px ${colors.primary}` }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSpecialButton}
            style={{
              width: '100%',
              marginTop: 20,
              padding: '16px 24px',
              borderRadius: 20,
              background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`,
              border: 'none',
              color: 'white',
              fontSize: 18,
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: `0 4px 20px ${colors.primaryGlow}`,
              letterSpacing: 2,
            }}
          >
            fuck 💕
          </motion.button>
        </motion.div>
      </div>
    </div>
  )
}
