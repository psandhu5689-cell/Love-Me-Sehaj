/**
 * MR AND MRS - Virtual Cat Scene
 * 
 * SPRITE SYSTEM DOCUMENTATION:
 * ----------------------------
 * Sprite sheets are stored in /src/assets/sprites/
 * 
 * Available sprite sheets:
 * - cat1_sheet.png (Grey cat - Prabh)
 * - cat2_sheet.png (Brown cat - Sehaj)  
 * - ginger_cat_labeled.png (Labeled reference - 62 animation rows)
 * - white_cat_labeled.png (White cat reference)
 * - cat3_sheet.png (Additional cat)
 * 
 * Frame size: 64x64 pixels
 * Sheet layout: 14 columns, 72 rows (for unlabeled sheets)
 * 
 * TO ADD NEW ANIMATIONS:
 * 1. Identify the row number in the sprite sheet for the animation
 * 2. Count the number of frames in that row
 * 3. Add entry to ANIMATION_MAP with: { startRow, frameCount, fps, loop }
 * 4. Lower fps = smoother, calmer animation (2-4 for idle, 6-8 for actions)
 * 
 * ANIMATION STATES:
 * - sitIdle: Sitting calmly (default state)
 * - tailWag: Sitting with tail wagging
 * - sleep: Sleeping/curled up
 * - lickPaw: Grooming animation
 * - meow: Meowing
 * - nudge: Gentle paw movement
 * - kick: Quick paw swipe
 * - yawn: Yawning
 * - cuddle: Cuddled together state
 * - eat: Eating animation
 * - hiss: Annoyed hissing
 */

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { IoChevronBackOutline, IoVolumeHigh, IoVolumeMute } from 'react-icons/io5'
import { useNavigate } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'
import haptics from '../utils/haptics'
import { Howl } from 'howler'

// Sprite sheets
import cat1Sheet from '../assets/sprites/cat1_sheet.png'
import cat2Sheet from '../assets/sprites/cat2_sheet.png'

// ============ SPRITE ANIMATION SYSTEM ============

const FRAME_SIZE = 64
const SHEET_COLS = 14

/**
 * Animation definition interface
 * @property startRow - Row index in sprite sheet (0-based)
 * @property frameCount - Number of frames in animation
 * @property fps - Frames per second (lower = smoother/calmer)
 * @property loop - Whether animation loops
 */
interface AnimationDef {
  startRow: number
  frameCount: number
  fps: number
  loop: boolean
}

/**
 * ANIMATION MAP FOR PRABH (Grey/Black Cat)
 * Based on sprite sheet analysis - cat1_sheet.png
 * Rows are 0-indexed, 14 cols, 72 rows total
 * Using conservative row numbers for reliable animation
 */
const PRABH_ANIMATIONS: Record<string, AnimationDef> = {
  // Default calm sitting - use row 0 (first row, always safe)
  sitIdle: { startRow: 0, frameCount: 8, fps: 2, loop: true },
  tailWag: { startRow: 1, frameCount: 8, fps: 3, loop: true },
  // Sleep states - typically in lower rows
  sleep: { startRow: 5, frameCount: 4, fps: 1.5, loop: true },
  sleepCurled: { startRow: 6, frameCount: 4, fps: 1.5, loop: true },
  // Grooming
  lickPaw: { startRow: 2, frameCount: 8, fps: 4, loop: true },
  // Vocalizations
  meow: { startRow: 3, frameCount: 4, fps: 4, loop: false },
  yawn: { startRow: 4, frameCount: 6, fps: 3, loop: false },
  // Actions
  nudge: { startRow: 7, frameCount: 8, fps: 5, loop: false },
  kick: { startRow: 8, frameCount: 8, fps: 6, loop: false },
  // Reactions
  hiss: { startRow: 9, frameCount: 4, fps: 3, loop: false },
  // Eating
  eat: { startRow: 10, frameCount: 8, fps: 4, loop: false },
  // Cuddle state
  cuddle: { startRow: 5, frameCount: 4, fps: 2, loop: true },
  // Gaming
  gaming: { startRow: 1, frameCount: 8, fps: 3, loop: true },
}

/**
 * ANIMATION MAP FOR SEHAJ (Brown/Ginger Cat)
 * Based on sprite sheet analysis - cat2_sheet.png
 */
const SEHAJ_ANIMATIONS: Record<string, AnimationDef> = {
  // Default calm sitting
  sitIdle: { startRow: 0, frameCount: 8, fps: 2, loop: true },
  tailWag: { startRow: 1, frameCount: 8, fps: 3, loop: true },
  // Sleep states
  sleep: { startRow: 5, frameCount: 4, fps: 1.5, loop: true },
  sleepCurled: { startRow: 6, frameCount: 4, fps: 1.5, loop: true },
  // Grooming
  lickPaw: { startRow: 2, frameCount: 8, fps: 4, loop: true },
  // Vocalizations  
  meow: { startRow: 3, frameCount: 4, fps: 4, loop: false },
  yawn: { startRow: 4, frameCount: 6, fps: 3, loop: false },
  // Actions
  nudge: { startRow: 7, frameCount: 8, fps: 5, loop: false },
  kick: { startRow: 8, frameCount: 8, fps: 6, loop: false },
  // Reactions
  hiss: { startRow: 9, frameCount: 4, fps: 3, loop: false },
  // Eating
  eat: { startRow: 10, frameCount: 8, fps: 4, loop: false },
  // Cuddle state
  cuddle: { startRow: 5, frameCount: 4, fps: 2, loop: true },
  // Gaming
  gaming: { startRow: 1, frameCount: 8, fps: 3, loop: true },
}

type AnimationState = keyof typeof PRABH_ANIMATIONS

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
  const animEndCalledRef = useRef(false)
  
  const anim = animations[currentAnimation] || animations.sitIdle
  
  useEffect(() => {
    setFrame(0)
    lastTimeRef.current = 0
    animEndCalledRef.current = false
    
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
              if (!animEndCalledRef.current) {
                animEndCalledRef.current = true
                setTimeout(() => onAnimationEnd?.(), 50)
              }
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
  
  const col = frame % SHEET_COLS
  const row = anim.startRow
  const size = FRAME_SIZE * scale
  
  return (
    <motion.div 
      initial={{ opacity: 0.8 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      style={{
        width: size,
        height: size,
        overflow: 'hidden',
        transform: flip ? 'scaleX(-1)' : 'none',
        imageRendering: 'pixelated',
      }}
    >
      <div style={{
        width: SHEET_COLS * size,
        height: 72 * size,
        backgroundImage: `url(${sheet})`,
        backgroundSize: `${SHEET_COLS * size}px auto`,
        transform: `translate(-${col * size}px, -${row * size}px)`,
        imageRendering: 'pixelated',
        transition: 'transform 0.08s ease-out',
      }} />
    </motion.div>
  )
}

// ============ AUDIO SETUP ============

const AUDIO = {
  rain: 'https://assets.mixkit.co/active_storage/sfx/1253/1253-preview.mp3',
  meow: 'https://assets.mixkit.co/active_storage/sfx/2013/2013-preview.mp3',
  tussle: 'https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3',
  rustle: 'https://assets.mixkit.co/active_storage/sfx/2572/2572-preview.mp3',
}

// ============ MAIN COMPONENT ============

interface CatState {
  mood: number
  action: AnimationState
  isAwake: boolean
}

const SPECIAL_MESSAGES = [
  "Rustle in the blankets…",
  "A suspicious amount of movement…",
  "Tiny fight. Tiny cuddle. Peace treaty.",
  "Someone got slapped. Someone purred.",
  "Private cat business. Do not disturb.",
  "A couple giggles later…",
  "Definitely cuddling. Probably.",
]

const FOOD_ITEMS = ['🐟', '🦴', '🍖', '🍣', '🥛']

export default function VirtualBed() {
  const navigate = useNavigate()
  const { colors } = useTheme()
  
  const [isMuted, setIsMuted] = useState(true)
  const [blanketOffset, setBlanketOffset] = useState(50)
  const [userInteracted, setUserInteracted] = useState(false)
  
  const [prabh, setPrabh] = useState<CatState>({
    mood: 75,
    action: 'sitIdle',
    isAwake: true,
  })
  
  const [sehaj, setSehaj] = useState<CatState>({
    mood: 75,
    action: 'sitIdle',
    isAwake: true,
  })
  
  const [showEffect, setShowEffect] = useState<{
    type: 'heart' | 'z' | 'puff' | 'sparkle' | 'food'
    x: number
    y: number
    value?: string
  } | null>(null)
  
  const [specialMode, setSpecialMode] = useState(false)
  const [specialMessage, setSpecialMessage] = useState('')
  const [specialMessageIndex, setSpecialMessageIndex] = useState(0)
  
  const rainSoundRef = useRef<Howl | null>(null)
  const tussleRef = useRef<Howl | null>(null)
  
  // Initialize sounds
  useEffect(() => {
    rainSoundRef.current = new Howl({
      src: [AUDIO.rain],
      loop: true,
      volume: 0.25,
    })
    
    tussleRef.current = new Howl({
      src: [AUDIO.tussle],
      volume: 0.3,
    })
    
    return () => {
      rainSoundRef.current?.unload()
      tussleRef.current?.unload()
    }
  }, [])
  
  // Auto-start rain after user interaction
  useEffect(() => {
    if (userInteracted && !isMuted && rainSoundRef.current) {
      rainSoundRef.current.play()
    }
    
    return () => {
      rainSoundRef.current?.pause()
    }
  }, [userInteracted, isMuted])
  
  useEffect(() => {
    if (showEffect) {
      const timeout = setTimeout(() => setShowEffect(null), 1500)
      return () => clearTimeout(timeout)
    }
  }, [showEffect])
  
  const playSound = useCallback((soundUrl: string, volume = 0.3) => {
    if (!userInteracted || isMuted) return
    const sound = new Howl({ src: [soundUrl], volume })
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
  
  const handlePrabhAnimEnd = useCallback(() => {
    setPrabh(prev => ({
      ...prev,
      action: prev.isAwake ? 'sitIdle' : 'sleep'
    }))
  }, [])
  
  const handleSehajAnimEnd = useCallback(() => {
    setSehaj(prev => ({
      ...prev,
      action: prev.isAwake ? 'sitIdle' : 'sleep'
    }))
  }, [])
  
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
          action: 'yawn', 
          mood: Math.min(100, prev.mood + 10) 
        }))
        break
        
      case 'sleep':
        setCat(prev => ({ ...prev, isAwake: false, action: 'sleep', mood: Math.min(100, prev.mood + 5) }))
        setShowEffect({ type: 'z', x: isLeft ? 35 : 65, y: 35 })
        break
        
      case 'nudge':
        playSound(AUDIO.meow)
        setCat(prev => ({ ...prev, action: 'nudge', mood: Math.min(100, prev.mood + 15) }))
        setTimeout(() => {
          setOtherCat(prev => ({ ...prev, action: 'tailWag', mood: Math.min(100, prev.mood + 10) }))
        }, 400)
        setShowEffect({ type: 'heart', x: 50, y: 35 })
        break
        
      case 'kick':
        haptics.medium()
        setCat(prev => ({ ...prev, action: 'kick', mood: Math.max(0, prev.mood - 5) }))
        setTimeout(() => {
          setOtherCat(prev => ({ ...prev, action: 'hiss', mood: Math.max(0, prev.mood - 10) }))
          setShowEffect({ type: 'puff', x: isLeft ? 60 : 40, y: 45 })
        }, 300)
        break
        
      case 'hog':
        haptics.medium()
        setBlanketOffset(isLeft ? 30 : 70)
        setCat(prev => ({ ...prev, mood: Math.min(100, prev.mood + 10) }))
        setOtherCat(prev => ({ ...prev, action: 'hiss', mood: Math.max(0, prev.mood - 15) }))
        setTimeout(() => setBlanketOffset(50), 3000)
        break
        
      case 'feed':
        playSound(AUDIO.meow)
        setCat(prev => ({ ...prev, action: 'eat', mood: Math.min(100, prev.mood + 20) }))
        const food = FOOD_ITEMS[Math.floor(Math.random() * FOOD_ITEMS.length)]
        setShowEffect({ type: 'food', x: isLeft ? 35 : 65, y: 40, value: food })
        break
        
      case 'game':
        setCat(prev => ({ ...prev, action: 'gaming', mood: Math.min(100, prev.mood + 15) }))
        setShowEffect({ type: 'sparkle', x: isLeft ? 35 : 65, y: 45 })
        setTimeout(() => {
          setCat(prev => ({ ...prev, action: prev.isAwake ? 'sitIdle' : 'sleep' }))
        }, 4000)
        break
    }
  }
  
  // Enhanced special button with personality
  const handleSpecialButton = () => {
    if (!userInteracted) setUserInteracted(true)
    
    haptics.light()
    setSpecialMode(true)
    
    // Play tussle sounds
    if (!isMuted && tussleRef.current) {
      tussleRef.current.play()
    }
    
    // Cycle through messages
    let msgIndex = 0
    setSpecialMessage(SPECIAL_MESSAGES[0])
    
    const msgInterval = setInterval(() => {
      msgIndex = (msgIndex + 1) % 3
      if (msgIndex < SPECIAL_MESSAGES.length) {
        setSpecialMessage(SPECIAL_MESSAGES[Math.floor(Math.random() * SPECIAL_MESSAGES.length)])
      }
    }, 800)
    
    setTimeout(() => {
      clearInterval(msgInterval)
      haptics.medium()
      setSpecialMode(false)
      
      setPrabh(prev => ({ ...prev, action: 'cuddle', mood: Math.min(100, prev.mood + 25) }))
      setSehaj(prev => ({ ...prev, action: 'cuddle', mood: Math.min(100, prev.mood + 25) }))
      
      setTimeout(() => {
        setPrabh(prev => ({ ...prev, action: 'sitIdle' }))
        setSehaj(prev => ({ ...prev, action: 'sitIdle' }))
      }, 5000)
    }, 3000)
  }
  
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
        transition: 'all 0.2s ease',
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
      {/* Special Mode Overlay */}
      <AnimatePresence>
        {specialMode && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
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
              gap: 24,
            }}
          >
            <motion.div
              animate={{ 
                scale: [1, 1.2, 1],
                rotate: [0, 5, -5, 0],
              }}
              transition={{ duration: 0.5, repeat: Infinity }}
            >
              <span style={{ fontSize: 60 }}>💕</span>
            </motion.div>
            <motion.p
              key={specialMessage}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                color: 'white',
                fontSize: 20,
                fontStyle: 'italic',
                textAlign: 'center',
                padding: '0 20px',
              }}
            >
              {specialMessage}
            </motion.p>
            <motion.div
              animate={{ opacity: [0.3, 0.7, 0.3] }}
              transition={{ duration: 1, repeat: Infinity }}
              style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)' }}
            >
              🎵 *scuffle sounds* 🎵
            </motion.div>
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
      
      {/* Audio Toggle */}
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={() => {
          if (!userInteracted) setUserInteracted(true)
          setIsMuted(prev => !prev)
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
        {isMuted ? (
          <IoVolumeMute size={20} color={colors.textMuted} />
        ) : (
          <IoVolumeHigh size={20} color={colors.primary} />
        )}
      </motion.button>
      
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
          Mr & Mrs 🐱💕🐱
        </h1>
        
        {/* Room Scene */}
        <motion.div
          style={{
            background: colors.glass,
            backdropFilter: 'blur(20px)',
            border: `1px solid ${colors.border}`,
            borderRadius: 24,
            padding: 20,
            position: 'relative',
            boxShadow: `0 8px 32px ${colors.primaryGlow}`,
          }}
        >
          {/* Rainy Window - Always rainy GIF style */}
          <div style={{
            width: 180,
            height: 130,
            background: 'linear-gradient(180deg, #2a3a5e 0%, #1a2540 100%)',
            border: '6px solid #5D4037',
            borderRadius: 12,
            margin: '0 auto 16px',
            position: 'relative',
            overflow: 'hidden',
          }}>
            {/* Window frame */}
            <div style={{
              position: 'absolute',
              top: 0,
              left: '50%',
              width: 6,
              height: '100%',
              background: '#5D4037',
              transform: 'translateX(-50%)',
            }} />
            <div style={{
              position: 'absolute',
              top: '50%',
              left: 0,
              width: '100%',
              height: 6,
              background: '#5D4037',
              transform: 'translateY(-50%)',
            }} />
            
            {/* Rain animation - always on */}
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, overflow: 'hidden' }}>
              {[...Array(40)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ y: -20, x: `${Math.random() * 100}%`, opacity: 0.7 }}
                  animate={{ y: 150, opacity: [0.7, 0.4, 0.7] }}
                  transition={{
                    duration: 0.6 + Math.random() * 0.4,
                    repeat: Infinity,
                    delay: Math.random() * 0.6,
                    ease: 'linear',
                  }}
                  style={{
                    position: 'absolute',
                    width: 2,
                    height: 12,
                    background: 'linear-gradient(180deg, rgba(150, 200, 255, 0.8), rgba(150, 200, 255, 0.2))',
                    borderRadius: 2,
                  }}
                />
              ))}
            </div>
            
            {/* Distant lightning flash occasionally */}
            <motion.div
              animate={{ opacity: [0, 0, 0, 0, 0.3, 0, 0.1, 0] }}
              transition={{ duration: 8, repeat: Infinity, repeatDelay: 5 }}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'white',
                pointerEvents: 'none',
              }}
            />
          </div>
          
          {/* Floor Scene Container */}
          <div style={{
            position: 'relative',
            width: '100%',
            height: 200,
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center',
            borderRadius: 16,
            overflow: 'hidden',
          }}>
            {/* Cartoon Floor Background */}
            <div style={{
              position: 'absolute',
              bottom: 0,
              width: '100%',
              height: '100%',
              background: `
                linear-gradient(180deg, 
                  transparent 0%, 
                  rgba(139, 90, 43, 0.1) 40%,
                  rgba(139, 90, 43, 0.3) 60%,
                  #DEB887 70%,
                  #D2A679 85%,
                  #C4956A 100%
                )
              `,
              zIndex: 0,
            }}>
              {/* Wood grain pattern */}
              <div style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                height: '40%',
                background: `
                  repeating-linear-gradient(
                    90deg,
                    transparent,
                    transparent 60px,
                    rgba(139, 69, 19, 0.15) 60px,
                    rgba(139, 69, 19, 0.15) 62px
                  ),
                  repeating-linear-gradient(
                    0deg,
                    transparent,
                    transparent 15px,
                    rgba(139, 69, 19, 0.08) 15px,
                    rgba(139, 69, 19, 0.08) 16px
                  )
                `,
              }} />
            </div>
            
            {/* Sehaj Cat (Left - Ginger) */}
            <motion.div
              animate={{
                y: sehaj.action === 'nudge' || sehaj.action === 'kick' ? [0, -3, 0] : 0,
              }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              style={{
                position: 'absolute',
                left: '18%',
                bottom: 55,
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
              <p style={{
                position: 'absolute',
                bottom: -18,
                left: '50%',
                transform: 'translateX(-50%)',
                color: colors.textSecondary,
                fontSize: 11,
                fontWeight: 600,
                whiteSpace: 'nowrap',
              }}>
                Sehaj 🧡
              </p>
              {sehaj.action === 'gaming' && (
                <motion.div
                  animate={{ y: [0, -3, 0] }}
                  transition={{ duration: 0.5, repeat: Infinity }}
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    fontSize: 18,
                  }}
                >
                  🎮
                </motion.div>
              )}
            </motion.div>
            
            {/* Prabh Cat (Right - Grey) */}
            <motion.div
              animate={{
                y: prabh.action === 'nudge' || prabh.action === 'kick' ? [0, -3, 0] : 0,
              }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              style={{
                position: 'absolute',
                right: '18%',
                bottom: 55,
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
              <p style={{
                position: 'absolute',
                bottom: -18,
                left: '50%',
                transform: 'translateX(-50%)',
                color: colors.textSecondary,
                fontSize: 11,
                fontWeight: 600,
                whiteSpace: 'nowrap',
              }}>
                Prabh 🖤
              </p>
              {prabh.action === 'gaming' && (
                <motion.div
                  animate={{ y: [0, -3, 0] }}
                  transition={{ duration: 0.5, repeat: Infinity }}
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    fontSize: 18,
                  }}
                >
                  🎮
                </motion.div>
              )}
            </motion.div>
            
            {/* Blanket Overlay */}
            <motion.div
              animate={{ x: `${blanketOffset - 50}%` }}
              transition={{ type: 'spring', damping: 20, stiffness: 100 }}
              style={{
                position: 'absolute',
                bottom: 15,
                width: '70%',
                height: 50,
                background: 'linear-gradient(180deg, #E8A5C0 0%, #D88BA5 50%, #C87090 100%)',
                borderRadius: '18px 18px 8px 8px',
                border: '3px solid #B86080',
                zIndex: 3,
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              }}
            >
              <div style={{
                position: 'absolute',
                top: 8,
                left: 15,
                right: 15,
                bottom: 8,
                background: 'repeating-linear-gradient(45deg, transparent, transparent 8px, rgba(255,255,255,0.1) 8px, rgba(255,255,255,0.1) 16px)',
                borderRadius: 8,
              }} />
            </motion.div>
            
            {/* Effects */}
            <AnimatePresence>
              {showEffect && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.5, y: 0 }}
                  animate={{ opacity: 1, scale: 1.2, y: -25 }}
                  exit={{ opacity: 0, y: -40 }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                  style={{
                    position: 'absolute',
                    left: `${showEffect.x}%`,
                    top: `${showEffect.y}%`,
                    fontSize: 28,
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
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <p style={{ color: colors.textPrimary, fontSize: 13, fontWeight: 600 }}>🧡 Sehaj</p>
                <p style={{ color: getMoodColor(sehaj.mood), fontSize: 11, fontWeight: 600 }}>{getMoodLabel(sehaj.mood)}</p>
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
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                  style={{
                    height: '100%',
                    background: `linear-gradient(90deg, ${getMoodColor(sehaj.mood)}, ${colors.primary})`,
                    borderRadius: 4,
                  }}
                />
              </div>
            </div>
            
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <p style={{ color: colors.textPrimary, fontSize: 13, fontWeight: 600 }}>🖤 Prabh</p>
                <p style={{ color: getMoodColor(prabh.mood), fontSize: 11, fontWeight: 600 }}>{getMoodLabel(prabh.mood)}</p>
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
                  transition={{ duration: 0.5, ease: 'easeOut' }}
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
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <p style={{ color: '#E67E22', fontSize: 12, fontWeight: 700, marginBottom: 4 }}>Sehaj Actions:</p>
              <ActionButton label="👁️ Wake Up" onClick={() => handleCatAction('sehaj', 'wake')} color="#E67E22" />
              <ActionButton label="😴 Sleep" onClick={() => handleCatAction('sehaj', 'sleep')} color="#E67E22" />
              <ActionButton label="💕 Nudge" onClick={() => handleCatAction('sehaj', 'nudge')} color="#E67E22" />
              <ActionButton label="🦵 Kick" onClick={() => handleCatAction('sehaj', 'kick')} color="#E67E22" />
              <ActionButton label="🧣 Hog Blanket" onClick={() => handleCatAction('sehaj', 'hog')} color="#E67E22" />
              <ActionButton label="🍖 Feed" onClick={() => handleCatAction('sehaj', 'feed')} color="#E67E22" />
              <ActionButton label="🎮 Gaming" onClick={() => handleCatAction('sehaj', 'game')} color="#E67E22" />
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <p style={{ color: '#8E44AD', fontSize: 12, fontWeight: 700, marginBottom: 4 }}>Prabh Actions:</p>
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
