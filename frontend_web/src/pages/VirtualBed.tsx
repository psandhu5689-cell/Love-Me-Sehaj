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
import { useCatAnimation } from '../hooks/useCatAnimation'

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
 * ANIMATION MAP FOR PRABH (Gray Cat)
 * UPDATED: Default to STATIC single frame, not looping
 * ADDED: Walk animations for each direction (floor roaming)
 * ADDED: Reaction animations (happy, annoyed, surprised)
 */
const PRABH_ANIMATIONS: Record<string, AnimationDef> = {
  // STATIC default - single frozen frame
  sitIdle: { startRow: 0, frameCount: 1, fps: 1, loop: false },
  layIdle: { startRow: 5, frameCount: 1, fps: 1, loop: false },
  tailWag: { startRow: 1, frameCount: 8, fps: 3, loop: false },
  // Sleep states
  sleep: { startRow: 5, frameCount: 4, fps: 2, loop: true },
  sleepCurled: { startRow: 6, frameCount: 1, fps: 1, loop: false },
  wake: { startRow: 0, frameCount: 4, fps: 4, loop: false },
  // WALK ANIMATIONS - 4 directions (gentle 4fps)
  walkRight: { startRow: 1, frameCount: 4, fps: 4, loop: true },
  walkLeft: { startRow: 1, frameCount: 4, fps: 4, loop: true },
  walkUp: { startRow: 1, frameCount: 4, fps: 4, loop: true },
  walkDown: { startRow: 1, frameCount: 4, fps: 4, loop: true },
  // Grooming
  lickPaw: { startRow: 2, frameCount: 8, fps: 4, loop: false },
  // Vocalizations
  meow: { startRow: 3, frameCount: 4, fps: 4, loop: false },
  yawn: { startRow: 4, frameCount: 6, fps: 3, loop: false },
  // Actions
  nudge: { startRow: 7, frameCount: 8, fps: 5, loop: false },
  kick: { startRow: 8, frameCount: 8, fps: 6, loop: false },
  hogBlanket: { startRow: 7, frameCount: 6, fps: 4, loop: false },
  feed: { startRow: 10, frameCount: 8, fps: 4, loop: false },
  // Reactions - for touch interactions
  happy: { startRow: 1, frameCount: 6, fps: 5, loop: false },
  annoyed: { startRow: 9, frameCount: 4, fps: 4, loop: false },
  surprised: { startRow: 3, frameCount: 3, fps: 6, loop: false },
  // Reactions (legacy)
  hiss: { startRow: 9, frameCount: 4, fps: 3, loop: false },
  // Eating
  eat: { startRow: 10, frameCount: 8, fps: 4, loop: false },
  // Cuddle state
  cuddle: { startRow: 5, frameCount: 1, fps: 1, loop: false },
  // Gaming
  gaming: { startRow: 1, frameCount: 8, fps: 3, loop: false },
}

/**
 * ANIMATION MAP FOR SEHAJ (Brown/Ginger Cat)
 * UPDATED: Default to STATIC single frame, not looping
 * ADDED: Walk animations for each direction (floor roaming)
 * ADDED: Reaction animations (happy, annoyed, surprised)
 */
const SEHAJ_ANIMATIONS: Record<string, AnimationDef> = {
  // STATIC default - single frozen frame
  sitIdle: { startRow: 0, frameCount: 1, fps: 1, loop: false },
  layIdle: { startRow: 5, frameCount: 1, fps: 1, loop: false },
  tailWag: { startRow: 1, frameCount: 8, fps: 3, loop: false },
  // Sleep states
  sleep: { startRow: 5, frameCount: 4, fps: 2, loop: true },
  sleepCurled: { startRow: 6, frameCount: 1, fps: 1, loop: false },
  wake: { startRow: 0, frameCount: 4, fps: 4, loop: false },
  // WALK ANIMATIONS - 4 directions (gentle 4fps)
  walkRight: { startRow: 1, frameCount: 4, fps: 4, loop: true },
  walkLeft: { startRow: 1, frameCount: 4, fps: 4, loop: true },
  walkUp: { startRow: 1, frameCount: 4, fps: 4, loop: true },
  walkDown: { startRow: 1, frameCount: 4, fps: 4, loop: true },
  // Grooming
  lickPaw: { startRow: 2, frameCount: 8, fps: 4, loop: false },
  // Vocalizations  
  meow: { startRow: 3, frameCount: 4, fps: 4, loop: false },
  yawn: { startRow: 4, frameCount: 6, fps: 3, loop: false },
  // Actions
  nudge: { startRow: 7, frameCount: 8, fps: 5, loop: false },
  kick: { startRow: 8, frameCount: 8, fps: 6, loop: false },
  hogBlanket: { startRow: 7, frameCount: 6, fps: 4, loop: false },
  feed: { startRow: 10, frameCount: 8, fps: 4, loop: false },
  // Reactions - for touch interactions
  happy: { startRow: 1, frameCount: 6, fps: 5, loop: false },
  annoyed: { startRow: 9, frameCount: 4, fps: 4, loop: false },
  surprised: { startRow: 3, frameCount: 3, fps: 6, loop: false },
  // Reactions (legacy)
  hiss: { startRow: 9, frameCount: 4, fps: 3, loop: false },
  // Eating
  eat: { startRow: 10, frameCount: 8, fps: 4, loop: false },
  // Cuddle state
  cuddle: { startRow: 5, frameCount: 1, fps: 1, loop: false },
  // Gaming
  gaming: { startRow: 1, frameCount: 8, fps: 3, loop: false },
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
  const [imageLoaded, setImageLoaded] = useState(false)
  const [lastGoodFrame, setLastGoodFrame] = useState(0)
  const animRef = useRef<number | null>(null)
  const lastTimeRef = useRef(0)
  const animEndCalledRef = useRef(false)
  const imageRef = useRef<HTMLImageElement | null>(null)
  
  // SAFETY 1: Always have a fallback animation
  const anim = animations[currentAnimation] || animations.sitIdle || { startRow: 0, frameCount: 8, fps: 2, loop: true }
  
  // SAFETY 2: Preload image before animation starts
  useEffect(() => {
    const img = new Image()
    img.src = sheet
    imageRef.current = img
    
    const handleLoad = () => {
      setImageLoaded(true)
    }
    
    if (img.complete) {
      setImageLoaded(true)
    } else {
      img.addEventListener('load', handleLoad)
    }
    
    return () => {
      img.removeEventListener('load', handleLoad)
    }
  }, [sheet])
  
  // SAFETY 3: Reset frame on animation change
  useEffect(() => {
    setFrame(0)
    setLastGoodFrame(0)
    lastTimeRef.current = 0
    animEndCalledRef.current = false
  }, [currentAnimation])
  
  // SAFETY 4: Animation loop with hard clamping
  useEffect(() => {
    if (!imageLoaded) return // Don't start until image loaded
    
    const animate = (time: number) => {
      if (!lastTimeRef.current) lastTimeRef.current = time
      
      const delta = time - lastTimeRef.current
      const frameTime = 1000 / Math.max(1, anim.fps || 2) // SAFETY: Minimum fps
      
      if (delta >= frameTime) {
        setFrame(prev => {
          const nextFrame = prev + 1
          const maxFrame = Math.max(0, (anim.frameCount || 8) - 1)
          
          // SAFETY: Hard clamp nextFrame
          let safeFrame = Math.min(Math.max(0, nextFrame), maxFrame)
          
          if (nextFrame > maxFrame) {
            if (anim.loop) {
              safeFrame = 0 // Loop back to start
            } else {
              if (!animEndCalledRef.current) {
                animEndCalledRef.current = true
                setTimeout(() => onAnimationEnd?.(), 50)
              }
              safeFrame = maxFrame // Stay at last frame
            }
          }
          
          // SAFETY: Update last good frame only if valid
          if (safeFrame >= 0 && safeFrame <= maxFrame) {
            setLastGoodFrame(safeFrame)
          }
          
          return safeFrame
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
  }, [currentAnimation, anim.fps, anim.frameCount, anim.loop, onAnimationEnd, imageLoaded])
  
  // SAFETY 5: Use last good frame if current frame is invalid
  const safeFrame = frame >= 0 && frame < (anim.frameCount || 8) ? frame : lastGoodFrame
  
  // SAFETY 6: Clamp all rendering values
  const frameCount = Math.max(1, anim.frameCount || 8)
  const frameCol = Math.min(Math.max(0, safeFrame), frameCount - 1)
  const row = Math.max(0, Math.min(71, anim.startRow || 0))
  const displaySize = Math.max(32, FRAME_SIZE * (scale || 1))
  
  // Calculate background position with safety bounds
  const bgX = -frameCol * FRAME_SIZE * scale
  const bgY = -row * FRAME_SIZE * scale
  
  // SAFETY 7: Don't render if image not loaded - show placeholder
  if (!imageLoaded) {
    return (
      <div style={{
        width: displaySize,
        height: displaySize,
        background: 'rgba(255,255,255,0.1)',
        borderRadius: 8,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: 1,
      }}>
        <span style={{ fontSize: 24 }}>🐱</span>
      </div>
    )
  }
  
  return (
    <div style={{
      width: displaySize,
      height: displaySize,
      overflow: 'hidden',
      transform: flip ? 'scaleX(-1)' : 'none',
      imageRendering: 'pixelated',
      borderRadius: 8,
      // SAFETY 8: Force visible with important-like specificity
      opacity: '1 !important' as any,
      display: 'block !important' as any,
      visibility: 'visible !important' as any,
    }}>
      <div style={{
        width: displaySize,
        height: displaySize,
        backgroundImage: `url(${sheet})`,
        backgroundSize: `${SHEET_COLS * FRAME_SIZE * scale}px ${72 * FRAME_SIZE * scale}px`,
        backgroundPosition: `${bgX}px ${bgY}px`,
        backgroundRepeat: 'no-repeat',
        imageRendering: 'pixelated',
        // SAFETY 9: Ensure sprite is always painted
        opacity: '1 !important' as any,
        willChange: 'background-position',
      }} />
    </div>
  )
}

// ============ AUDIO SETUP ============

const AUDIO = {
  rain: 'https://assets.mixkit.co/active_storage/sfx/1253/1253-preview.mp3',
  // Cat sounds - using the uploaded audio files
  catMeowSoft: '/audio/cats/cat-meow-soft.mp3',
  catMeowNight: '/audio/cats/cat-meow-night.mp3',
  catMeowFood: '/audio/cats/cat-meow-food.mp3',
  catScream: '/audio/cats/cat-scream.mp3',
  // Generic sounds
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

// ============ QUICK BUTTON COMPONENT ============

interface QuickButtonProps {
  icon: string;
  onClick: () => void;
}

function QuickButton({ icon, onClick }: QuickButtonProps) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      style={{
        width: 32,
        height: 32,
        borderRadius: '50%',
        background: 'rgba(255,255,255,0.2)',
        backdropFilter: 'blur(10px)',
        border: 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 16,
        cursor: 'pointer',
        touchAction: 'manipulation',
        WebkitTapHighlightColor: 'transparent',
      }}
    >
      {icon}
    </motion.button>
  );
}

// ============ ACTION ICON COMPONENT (MOBILE OPTIMIZED) ============

interface ActionIconProps {
  icon: string;
  label: string;
  onClick: () => void;
}

function ActionIcon({ icon, label, onClick }: ActionIconProps) {
  const isMobile = window.innerWidth < 768;
  
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.1, background: 'rgba(255,255,255,0.3)' }}
      whileTap={{ scale: 0.95 }}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: isMobile ? 2 : 4,
        background: 'transparent',
        border: 'none',
        cursor: 'pointer',
        padding: isMobile ? '6px 8px' : '8px 10px',
        borderRadius: 12,
        minWidth: isMobile ? 48 : 56,
        minHeight: isMobile ? 48 : 56,
        touchAction: 'manipulation',
        WebkitTapHighlightColor: 'transparent',
      }}
    >
      <span style={{ fontSize: isMobile ? 20 : 22 }}>{icon}</span>
      <span style={{ 
        fontSize: isMobile ? 8 : 9, 
        color: '#fff', 
        fontWeight: 600, 
        textAlign: 'center',
        lineHeight: 1.2,
      }}>
        {label}
      </span>
    </motion.button>
  );
}

// ============ MAIN COMPONENT ============

export default function VirtualBed() {
  const navigate = useNavigate()
  const { colors } = useTheme()
  
  // FIXED: Rain audio is always muted on MR & MRS page
  const [isMuted, setIsMuted] = useState(true)
  const [rainMuted] = useState(true) // Rain is PERMANENTLY muted on MR & MRS
  const [userInteracted, setUserInteracted] = useState(false)
  
  // GLOBAL AUDIO COOLDOWN: 3-5 seconds between cat sounds
  const lastSoundTimeRef = useRef<number>(0)
  const SOUND_COOLDOWN_MS = 4000 // 4 seconds between sounds
  
  // Helper to play cat sound with cooldown
  const playCatSound = (soundRef: React.MutableRefObject<Howl | null>) => {
    if (!userInteracted || isMuted) return false
    
    const now = Date.now()
    const timeSinceLastSound = now - lastSoundTimeRef.current
    
    // Check cooldown
    if (timeSinceLastSound < SOUND_COOLDOWN_MS) {
      console.log('[AUDIO COOLDOWN] Sound skipped, too soon')
      return false
    }
    
    // Play sound and update timestamp
    if (soundRef.current) {
      soundRef.current.volume(0.3) // Keep volumes low
      soundRef.current.play()
      lastSoundTimeRef.current = now
      return true
    }
    
    return false
  }
  
  // FIXED: Cats start sitting idle (awake) on load, not sleeping
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
  
  // NEW: Animation system integration
  const prabhAnim = useCatAnimation('prabh')
  const sehajAnim = useCatAnimation('sehaj')
  
  // Drag state for touch interactions
  const [dragState, setDragState] = useState<{
    isDragging: boolean;
    cat: 'prabh' | 'sehaj' | null;
    startX: number;
    startY: number;
  }>({
    isDragging: false,
    cat: null,
    startX: 0,
    startY: 0,
  })
  
  // ============ AUTONOMOUS CAT ROAMING SYSTEM ============
  
  // FLOOR BOUNDING BOX - cats can ONLY roam within this region
  // Floor starts at ~60% from top and goes to ~85% (leaving room for blanket)
  const FLOOR_BOUNDS = {
    minX: 10,    // Left edge of floor
    maxX: 90,    // Right edge of floor
    minY: 62,    // Top edge of floor (cats can't go above this)
    maxY: 78,    // Bottom edge of floor (above blanket)
  }
  
  // Define 10 safe anchor spots - ALL WITHIN FLOOR REGION ONLY
  // No spots on walls, window, or upper decorations
  const ANCHOR_SPOTS = [
    { id: 0, xPercent: 15, yPercent: 70, defaultPose: 'sit' as const },   // Floor left
    { id: 1, xPercent: 25, yPercent: 65, defaultPose: 'lay' as const },   // Floor left-center
    { id: 2, xPercent: 35, yPercent: 72, defaultPose: 'sit' as const },   // Floor center-left
    { id: 3, xPercent: 50, yPercent: 68, defaultPose: 'sit' as const },   // Floor center
    { id: 4, xPercent: 50, yPercent: 75, defaultPose: 'lay' as const },   // Floor center low
    { id: 5, xPercent: 65, yPercent: 72, defaultPose: 'sit' as const },   // Floor center-right
    { id: 6, xPercent: 75, yPercent: 65, defaultPose: 'lay' as const },   // Floor right-center
    { id: 7, xPercent: 85, yPercent: 70, defaultPose: 'sit' as const },   // Floor right
    { id: 8, xPercent: 30, yPercent: 68, defaultPose: 'sit' as const },   // Rug left area
    { id: 9, xPercent: 60, yPercent: 68, defaultPose: 'lay' as const },   // Rug right area
  ]
  
  // Walk direction type
  type WalkDirection = 'walkUp' | 'walkDown' | 'walkLeft' | 'walkRight'
  
  // Cat roaming states - UPDATED with walk direction
  type RoamState = 'idleSit' | 'idleLay' | 'walkToSpot' | 'reacting'
  
  interface CatRoamState {
    state: RoamState
    currentSpotId: number
    targetSpotId: number
    xPercent: number
    yPercent: number
    pose: 'sit' | 'lay'
    isMoving: boolean
    walkDirection: WalkDirection
  }
  
  // Sehaj roaming state (starts at left side of floor)
  const [sehajRoam, setSehajRoam] = useState<CatRoamState>({
    state: 'idleSit',
    currentSpotId: 0,
    targetSpotId: 0,
    xPercent: 20,
    yPercent: 70,
    pose: 'sit',
    isMoving: false,
    walkDirection: 'walkRight',
  })
  
  // Prabh roaming state (starts at right side of floor)
  const [prabhRoam, setPrabhRoam] = useState<CatRoamState>({
    state: 'idleSit',
    currentSpotId: 7,
    targetSpotId: 7,
    xPercent: 80,
    yPercent: 70,
    pose: 'sit',
    isMoving: false,
    walkDirection: 'walkLeft',
  })
  
  // Cuddle mode - MUST be declared before roaming effects that reference it
  const [cuddleMode, setCuddleMode] = useState(false)
  
  // Roaming timers
  const sehajRoamTimerRef = useRef<NodeJS.Timeout | null>(null)
  const prabhRoamTimerRef = useRef<NodeJS.Timeout | null>(null)
  
  // Petting meter state
  const [pettingProgress, setPettingProgress] = useState(0)
  const [isPettingSehaj, setIsPettingSehaj] = useState(false)
  const [isPettingPrabh, setIsPettingPrabh] = useState(false)
  const pettingIntervalRef = useRef<NodeJS.Timeout | null>(null)
  
  // Yarn roll state
  const [yarnPosition, setYarnPosition] = useState(0)
  const [isYarnRolling, setIsYarnRolling] = useState(false)
  
  // Function to get random roam interval (4-10 seconds)
  const getRandomRoamInterval = () => Math.floor(Math.random() * 6000) + 4000
  
  // Function to calculate walk direction based on movement vector
  const calculateWalkDirection = (fromX: number, fromY: number, toX: number, toY: number): WalkDirection => {
    const dx = toX - fromX
    const dy = toY - fromY
    
    // Determine dominant direction
    if (Math.abs(dx) > Math.abs(dy)) {
      // Horizontal movement dominant
      return dx > 0 ? 'walkRight' : 'walkLeft'
    } else {
      // Vertical movement dominant
      return dy > 0 ? 'walkDown' : 'walkUp'
    }
  }
  
  // Function to pick a random different spot - FLOOR ONLY
  const pickRandomSpot = (currentSpotId: number, isLeft: boolean): number => {
    // Filter spots based on cat's side (Sehaj left, Prabh right) with some overlap in middle
    // ALL spots are already floor-only, just filter by side
    const availableSpots = ANCHOR_SPOTS.filter(spot => {
      if (spot.id === currentSpotId) return false
      if (isLeft) return spot.xPercent <= 60 // Sehaj can go up to 60%
      return spot.xPercent >= 40 // Prabh can go down to 40%
    })
    
    if (availableSpots.length === 0) return currentSpotId
    return availableSpots[Math.floor(Math.random() * availableSpots.length)].id
  }
  
  // Sehaj roaming effect
  useEffect(() => {
    const startRoaming = () => {
      sehajRoamTimerRef.current = setTimeout(() => {
        // Don't roam if reacting or in cuddle mode
        if (sehajRoam.state === 'reacting' || cuddleMode) {
          startRoaming()
          return
        }
        
        // Pick new spot - FLOOR ONLY
        const newSpotId = pickRandomSpot(sehajRoam.currentSpotId, true)
        const newSpot = ANCHOR_SPOTS[newSpotId]
        
        // Calculate walk direction based on movement vector
        const walkDir = calculateWalkDirection(
          sehajRoam.xPercent, 
          sehajRoam.yPercent, 
          newSpot.xPercent, 
          newSpot.yPercent
        )
        
        // Start walking to new spot - play walk animation
        setSehajRoam(prev => ({
          ...prev,
          state: 'walkToSpot',
          targetSpotId: newSpotId,
          isMoving: true,
          walkDirection: walkDir,
        }))
        
        // Set walking animation for direction
        setSehaj(prev => ({
          ...prev,
          action: walkDir,
        }))
        
        // After movement duration, arrive at spot
        setTimeout(() => {
          const newPose = Math.random() > 0.5 ? 'sit' : 'lay'
          
          // Clamp final position within floor bounds
          const clampedX = Math.max(FLOOR_BOUNDS.minX, Math.min(FLOOR_BOUNDS.maxX, newSpot.xPercent))
          const clampedY = Math.max(FLOOR_BOUNDS.minY, Math.min(FLOOR_BOUNDS.maxY, newSpot.yPercent))
          
          setSehajRoam({
            state: newPose === 'sit' ? 'idleSit' : 'idleLay',
            currentSpotId: newSpotId,
            targetSpotId: newSpotId,
            xPercent: clampedX,
            yPercent: clampedY,
            pose: newPose,
            isMoving: false,
            walkDirection: walkDir,
          })
          
          // STOP walk animation - return to idle/sleep
          setSehaj(prev => ({
            ...prev,
            action: newPose === 'lay' ? 'sleep' : 'sitIdle',
          }))
          
          // Schedule next roam
          startRoaming()
        }, 2500) // 2.5 seconds to walk (slow and gentle)
        
      }, getRandomRoamInterval())
    }
    
    startRoaming()
    
    return () => {
      if (sehajRoamTimerRef.current) clearTimeout(sehajRoamTimerRef.current)
    }
  }, [cuddleMode])
  
  // Prabh roaming effect
  useEffect(() => {
    const startRoaming = () => {
      prabhRoamTimerRef.current = setTimeout(() => {
        // Don't roam if reacting or in cuddle mode
        if (prabhRoam.state === 'reacting' || cuddleMode) {
          startRoaming()
          return
        }
        
        // Pick new spot - FLOOR ONLY
        const newSpotId = pickRandomSpot(prabhRoam.currentSpotId, false)
        const newSpot = ANCHOR_SPOTS[newSpotId]
        
        // Calculate walk direction based on movement vector
        const walkDir = calculateWalkDirection(
          prabhRoam.xPercent, 
          prabhRoam.yPercent, 
          newSpot.xPercent, 
          newSpot.yPercent
        )
        
        // Start walking to new spot - play walk animation
        setPrabhRoam(prev => ({
          ...prev,
          state: 'walkToSpot',
          targetSpotId: newSpotId,
          isMoving: true,
          walkDirection: walkDir,
        }))
        
        // Set walking animation for direction
        setPrabh(prev => ({
          ...prev,
          action: walkDir,
        }))
        
        // After movement duration, arrive at spot
        setTimeout(() => {
          const newPose = Math.random() > 0.5 ? 'sit' : 'lay'
          
          // Clamp final position within floor bounds
          const clampedX = Math.max(FLOOR_BOUNDS.minX, Math.min(FLOOR_BOUNDS.maxX, newSpot.xPercent))
          const clampedY = Math.max(FLOOR_BOUNDS.minY, Math.min(FLOOR_BOUNDS.maxY, newSpot.yPercent))
          
          setPrabhRoam({
            state: newPose === 'sit' ? 'idleSit' : 'idleLay',
            currentSpotId: newSpotId,
            targetSpotId: newSpotId,
            xPercent: clampedX,
            yPercent: clampedY,
            pose: newPose,
            isMoving: false,
            walkDirection: walkDir,
          })
          
          // STOP walk animation - return to idle/sleep
          setPrabh(prev => ({
            ...prev,
            action: newPose === 'lay' ? 'sleep' : 'sitIdle',
          }))
          
          // Schedule next roam
          startRoaming()
        }, 2500) // 2.5 seconds to walk (slow and gentle)
        
      }, getRandomRoamInterval())
    }
    
    startRoaming()
    
    return () => {
      if (prabhRoamTimerRef.current) clearTimeout(prabhRoamTimerRef.current)
    }
  }, [cuddleMode])
  
  // Function to trigger cat reaction (called when any action button is pressed)
  const triggerCatReaction = (cat: 'sehaj' | 'prabh', reactionAnim: AnimationState, duration: number = 1500) => {
    if (cat === 'sehaj') {
      // Clear roam timer
      if (sehajRoamTimerRef.current) clearTimeout(sehajRoamTimerRef.current)
      
      // Set to reacting state at current position
      setSehajRoam(prev => ({
        ...prev,
        state: 'reacting',
        isMoving: false,
      }))
      
      // After reaction, return to idle
      setTimeout(() => {
        setSehajRoam(prev => ({
          ...prev,
          state: prev.pose === 'sit' ? 'idleSit' : 'idleLay',
        }))
      }, duration)
    } else {
      // Clear roam timer
      if (prabhRoamTimerRef.current) clearTimeout(prabhRoamTimerRef.current)
      
      // Set to reacting state at current position
      setPrabhRoam(prev => ({
        ...prev,
        state: 'reacting',
        isMoving: false,
      }))
      
      // After reaction, return to idle
      setTimeout(() => {
        setPrabhRoam(prev => ({
          ...prev,
          state: prev.pose === 'sit' ? 'idleSit' : 'idleLay',
        }))
      }, duration)
    }
  }
  
  // Petting functions
  const startPetting = (cat: 'sehaj' | 'prabh') => {
    if (cat === 'sehaj') {
      setIsPettingSehaj(true)
    } else {
      setIsPettingPrabh(true)
    }
    
    // Increase petting meter while holding
    pettingIntervalRef.current = setInterval(() => {
      setPettingProgress(prev => {
        const newVal = Math.min(prev + 5, 100)
        if (newVal >= 100) {
          // Full meter - play happy animation
          if (cat === 'sehaj') {
            setSehajMoodBubble('😻 Purrrrr!')
            setSehaj(prev => ({ ...prev, action: 'tailWag' }))
          } else {
            setPrabhMoodBubble('😻 Purrrrr!')
            setPrabh(prev => ({ ...prev, action: 'tailWag' }))
          }
          addXP(10)
          setTimeout(() => {
            setPettingProgress(0)
            setSehajMoodBubble(null)
            setPrabhMoodBubble(null)
          }, 2000)
        }
        return newVal
      })
    }, 100)
  }
  
  const stopPetting = () => {
    setIsPettingSehaj(false)
    setIsPettingPrabh(false)
    if (pettingIntervalRef.current) {
      clearInterval(pettingIntervalRef.current)
      pettingIntervalRef.current = null
    }
  }
  
  // ============ TOUCH ZONE INTERACTIONS ============
  
  // Tap head - happy blink + heart pop
  const tapHead = (cat: 'sehaj' | 'prabh') => {
    haptics.light()
    playRandomCatSound()
    
    if (cat === 'sehaj') {
      triggerCatReaction('sehaj', 'happy', 1200)
      setSehaj(prev => ({ ...prev, action: 'happy' }))
      setSehajMoodBubble('😊 *happy blink*')
      setShowEffect({ type: 'heart', x: sehajRoam.xPercent, y: sehajRoam.yPercent - 10 })
    } else {
      triggerCatReaction('prabh', 'happy', 1200)
      setPrabh(prev => ({ ...prev, action: 'happy' }))
      setPrabhMoodBubble('😊 *happy blink*')
      setShowEffect({ type: 'heart', x: prabhRoam.xPercent, y: prabhRoam.yPercent - 10 })
    }
    
    addXP(2)
    setTimeout(() => {
      if (cat === 'sehaj') {
        setSehajMoodBubble(null)
        setSehaj(prev => ({ ...prev, action: 'sitIdle' }))
      } else {
        setPrabhMoodBubble(null)
        setPrabh(prev => ({ ...prev, action: 'sitIdle' }))
      }
    }, 1200)
  }
  
  // Tap nose - surprised reaction + tiny squeak
  const tapNose = (cat: 'sehaj' | 'prabh') => {
    haptics.light()
    playRandomCatSound()
    
    if (cat === 'sehaj') {
      triggerCatReaction('sehaj', 'surprised', 1000)
      setSehaj(prev => ({ ...prev, action: 'surprised' }))
      setSehajMoodBubble('😮 *boop!*')
    } else {
      triggerCatReaction('prabh', 'surprised', 1000)
      setPrabh(prev => ({ ...prev, action: 'surprised' }))
      setPrabhMoodBubble('😮 *boop!*')
    }
    
    addXP(2)
    setTimeout(() => {
      if (cat === 'sehaj') {
        setSehajMoodBubble(null)
        setSehaj(prev => ({ ...prev, action: 'sitIdle' }))
      } else {
        setPrabhMoodBubble(null)
        setPrabh(prev => ({ ...prev, action: 'sitIdle' }))
      }
    }, 1000)
  }
  
  // Tap belly - 70% happy, 30% annoyed
  const tapBelly = (cat: 'sehaj' | 'prabh') => {
    haptics.medium()
    playRandomCatSound()
    
    const isHappy = Math.random() > 0.3
    const reaction = isHappy ? 'happy' : 'annoyed'
    const bubble = isHappy ? '😻 *belly rubs!*' : '😾 *hey!*'
    
    if (cat === 'sehaj') {
      triggerCatReaction('sehaj', reaction, 1500)
      setSehaj(prev => ({ ...prev, action: reaction }))
      setSehajMoodBubble(bubble)
    } else {
      triggerCatReaction('prabh', reaction, 1500)
      setPrabh(prev => ({ ...prev, action: reaction }))
      setPrabhMoodBubble(bubble)
    }
    
    addXP(isHappy ? 3 : 1)
    setTimeout(() => {
      if (cat === 'sehaj') {
        setSehajMoodBubble(null)
        setSehaj(prev => ({ ...prev, action: 'sitIdle' }))
      } else {
        setPrabhMoodBubble(null)
        setPrabh(prev => ({ ...prev, action: 'sitIdle' }))
      }
    }, 1500)
  }
  
  // Tap tail - tail flick + annoyed
  const tapTail = (cat: 'sehaj' | 'prabh') => {
    haptics.light()
    playRandomCatSound()
    
    if (cat === 'sehaj') {
      triggerCatReaction('sehaj', 'annoyed', 1200)
      setSehaj(prev => ({ ...prev, action: 'annoyed' }))
      setSehajMoodBubble('😤 *tail flick*')
    } else {
      triggerCatReaction('prabh', 'annoyed', 1200)
      setPrabh(prev => ({ ...prev, action: 'annoyed' }))
      setPrabhMoodBubble('😤 *tail flick*')
    }
    
    addXP(1)
    setTimeout(() => {
      if (cat === 'sehaj') {
        setSehajMoodBubble(null)
        setSehaj(prev => ({ ...prev, action: 'sitIdle' }))
      } else {
        setPrabhMoodBubble(null)
        setPrabh(prev => ({ ...prev, action: 'sitIdle' }))
      }
    }, 1200)
  }
  
  // Long press cat - lift slightly, wiggle, clingy mood
  const longPressCat = (cat: 'sehaj' | 'prabh') => {
    haptics.heavy()
    playRandomCatSound()
    
    if (cat === 'sehaj') {
      setSehajMoodBubble('🥺 *clingy mode*')
      setSehaj(prev => ({ ...prev, action: 'tailWag' }))
    } else {
      setPrabhMoodBubble('🥺 *clingy mode*')
      setPrabh(prev => ({ ...prev, action: 'tailWag' }))
    }
    
    addXP(5)
    setTimeout(() => {
      if (cat === 'sehaj') {
        setSehajMoodBubble(null)
        setSehaj(prev => ({ ...prev, action: 'sitIdle' }))
      } else {
        setPrabhMoodBubble(null)
        setPrabh(prev => ({ ...prev, action: 'sitIdle' }))
      }
    }, 3000)
  }
  
  // Double tap floor - spawn treat and cats walk toward it
  const [treatPosition, setTreatPosition] = useState<{ x: number, y: number } | null>(null)
  
  const handleFloorDoubleTap = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault()
    haptics.medium()
    
    // Get tap position relative to room container
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY
    
    const xPercent = ((clientX - rect.left) / rect.width) * 100
    const yPercent = ((clientY - rect.top) / rect.height) * 100
    
    // Clamp to floor bounds
    const clampedX = Math.max(FLOOR_BOUNDS.minX, Math.min(FLOOR_BOUNDS.maxX, xPercent))
    const clampedY = Math.max(FLOOR_BOUNDS.minY, Math.min(FLOOR_BOUNDS.maxY, yPercent))
    
    // Spawn treat
    setTreatPosition({ x: clampedX, y: clampedY })
    setShowEffect({ type: 'food', x: clampedX, y: clampedY, value: '🐟' })
    
    // Make cats walk toward treat
    const sehajWalkDir = calculateWalkDirection(sehajRoam.xPercent, sehajRoam.yPercent, clampedX, clampedY)
    const prabhWalkDir = calculateWalkDirection(prabhRoam.xPercent, prabhRoam.yPercent, clampedX, clampedY)
    
    setSehaj(prev => ({ ...prev, action: sehajWalkDir }))
    setPrabh(prev => ({ ...prev, action: prabhWalkDir }))
    setSehajRoam(prev => ({ ...prev, isMoving: true, walkDirection: sehajWalkDir }))
    setPrabhRoam(prev => ({ ...prev, isMoving: true, walkDirection: prabhWalkDir }))
    
    // Move cats toward treat
    setTimeout(() => {
      setSehajRoam(prev => ({ ...prev, xPercent: clampedX - 5, yPercent: clampedY, isMoving: false }))
      setPrabhRoam(prev => ({ ...prev, xPercent: clampedX + 5, yPercent: clampedY, isMoving: false }))
      setSehaj(prev => ({ ...prev, action: 'eat' }))
      setPrabh(prev => ({ ...prev, action: 'eat' }))
      setSehajMoodBubble('😋 Yum!')
      setPrabhMoodBubble('😋 Treat!')
      
      // Clear treat and return to idle
      setTimeout(() => {
        setTreatPosition(null)
        setSehajMoodBubble(null)
        setPrabhMoodBubble(null)
        setSehaj(prev => ({ ...prev, action: 'sitIdle' }))
        setPrabh(prev => ({ ...prev, action: 'sitIdle' }))
      }, 2000)
    }, 2000)
    
    addXP(5)
  }
  
  // Yarn roll function
  const rollYarn = () => {
    if (isYarnRolling) return
    
    setIsYarnRolling(true)
    setYarnPosition(0)
    
    // Animate yarn rolling left to right
    let pos = 0
    const yarnInterval = setInterval(() => {
      pos += 5
      setYarnPosition(pos)
      
      if (pos >= 100) {
        clearInterval(yarnInterval)
        setIsYarnRolling(false)
        setYarnPosition(0)
        addXP(3)
        
        // Cats react to yarn
        setSehajMoodBubble('👀 Yarn!')
        setPrabhMoodBubble('🐾 Chase!')
        setTimeout(() => {
          setSehajMoodBubble(null)
          setPrabhMoodBubble(null)
        }, 1500)
      }
    }, 50)
  }
  
  // Freakiness Meters (playful freakiness meter)
  const [prabhMeter, setPrabhMeter] = useState(0)
  const [sehajMeter, setSehajMeter] = useState(0)
  const [showUnlovedMessage, setShowUnlovedMessage] = useState<'prabh' | 'sehaj' | null>(null)
  
  // NEW: Blanket position state ('left', 'center', 'right')
  const [blanketPosition, setBlanketPosition] = useState<'left' | 'center' | 'right'>('center')
  
  // NEW: Dim lights state
  const [lightsDimmed, setLightsDimmed] = useState(false)
  
  // ============ NEW INTERACTIVE FEATURES ============
  
  // Lamp Toggle (warm/cool)
  const [lampMode, setLampMode] = useState<'warm' | 'cool' | 'off'>('warm')
  const [lampFlicker, setLampFlicker] = useState(false)
  
  // Weather modes for window
  const [weatherMode, setWeatherMode] = useState<'rain' | 'snow' | 'city' | 'sunrise'>('rain')
  
  // Curtain state
  const [curtainState, setCurtainState] = useState<'open' | 'closed' | 'peek'>('open')
  
  // Wall frame gallery
  const [frameIndex, setFrameIndex] = useState(0)
  const FRAME_IMAGES = ['💕', '🐱🐱', '🌸', '✨', '🏠', '💝', '🌙', '☀️']
  
  // NEW: Compact UI state
  const [showSecondaryPanel, setShowSecondaryPanel] = useState(false)
  const [targetMode, setTargetMode] = useState<'prabh' | 'sehaj' | 'both'>('both')
  
  // NEW: Room decor interactions
  const [floorLampOn, setFloorLampOn] = useState(true)
  const [stringLightsMode, setStringLightsMode] = useState<'off' | 'warm' | 'pink' | 'purple'>('warm')
  const [prabhSeated, setPrabhSeated] = useState(false)
  const [sehajSeated, setSehajSeated] = useState(false)
  
  // Sofa drop zone and seat anchors
  const SOFA_DROP_ZONE = { x: 60, y: 60, width: 20, height: 15 }
  const SOFA_SEATS = {
    left: { x: 62, y: 65 },
    right: { x: 72, y: 65 },
  }
  
  // Cat mood bubbles
  const [prabhMoodBubble, setPrabhMoodBubble] = useState<string | null>(null)
  const [sehajMoodBubble, setSehajMoodBubble] = useState<string | null>(null)
  
  // Petting meter
  const [pettingMeter, setPettingMeter] = useState(0)
  const [isPetting, setIsPetting] = useState(false)
  
  // Toy spawn
  const [spawnedToy, setSpawnedToy] = useState<string | null>(null)
  const TOYS = ['🧶', '🧸', '👑', '🎮', '🎾', '🐟']
  
  // Yarn rolling
  const [yarnRolling, setYarnRolling] = useState(false)
  
  // Lights out chaos
  const [lightsOutMode, setLightsOutMode] = useState(false)
  const [chaosMessage, setChaosMessage] = useState('')
  const CHAOS_MESSAGES = [
    "...suspicious rustling...",
    "WHO TURNED OFF THE LIGHTS?!",
    "*mischief intensifies*",
    "🐱💨 *zoom*",
    "something fell...",
  ]
  
  // Drama mode
  const [dramaMode, setDramaMode] = useState(false)
  
  // Room level & streak
  const [roomLevel, setRoomLevel] = useState(() => {
    const saved = localStorage.getItem('mrMrsRoomLevel')
    return saved ? parseInt(saved) : 1
  })
  const [roomXP, setRoomXP] = useState(() => {
    const saved = localStorage.getItem('mrMrsRoomXP')
    return saved ? parseInt(saved) : 0
  })
  const [dailyStreak, setDailyStreak] = useState(() => {
    const saved = localStorage.getItem('mrMrsDailyStreak')
    return saved ? parseInt(saved) : 0
  })
  
  // XP for level up
  const XP_PER_LEVEL = 50
  
  // Add XP helper
  const addXP = (amount: number) => {
    setRoomXP(prev => {
      const newXP = prev + amount
      if (newXP >= XP_PER_LEVEL) {
        setRoomLevel(l => {
          const newLevel = l + 1
          localStorage.setItem('mrMrsRoomLevel', String(newLevel))
          return newLevel
        })
        localStorage.setItem('mrMrsRoomXP', String(newXP - XP_PER_LEVEL))
        return newXP - XP_PER_LEVEL
      }
      localStorage.setItem('mrMrsRoomXP', String(newXP))
      return newXP
    })
  }
  
  // NEW: Cat sound refs for the uploaded audio files
  const catMeowSoftRef = useRef<Howl | null>(null)
  const catMeowNightRef = useRef<Howl | null>(null)
  const catMeowFoodRef = useRef<Howl | null>(null)
  const catScreamRef = useRef<Howl | null>(null)
  
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
    
    // NEW: Initialize cat sound effects
    catMeowSoftRef.current = new Howl({
      src: [AUDIO.catMeowSoft],
      volume: 0.4,
    })
    
    catMeowNightRef.current = new Howl({
      src: [AUDIO.catMeowNight],
      volume: 0.4,
    })
    
    catMeowFoodRef.current = new Howl({
      src: [AUDIO.catMeowFood],
      volume: 0.4,
    })
    
    catScreamRef.current = new Howl({
      src: [AUDIO.catScream],
      volume: 0.5,
    })
    
    return () => {
      rainSoundRef.current?.unload()
      tussleRef.current?.unload()
      catMeowSoftRef.current?.unload()
      catMeowNightRef.current?.unload()
      catMeowFoodRef.current?.unload()
      catScreamRef.current?.unload()
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
  
  // Monitor freakiness meters
  useEffect(() => {
    let prabhTimer: NodeJS.Timeout | null = null
    let sehajTimer: NodeJS.Timeout | null = null
    
    // Check Prabh meter
    if (prabhMeter >= 100) {
      prabhTimer = setTimeout(() => {
        setShowUnlovedMessage('prabh')
        setTimeout(() => setShowUnlovedMessage(null), 4000)
      }, 10000) // Show after 10 seconds at 100
    }
    
    // Check Sehaj meter
    if (sehajMeter >= 100) {
      sehajTimer = setTimeout(() => {
        setShowUnlovedMessage('sehaj')
        setTimeout(() => setShowUnlovedMessage(null), 4000)
      }, 10000) // Show after 10 seconds at 100
    }
    
    return () => {
      if (prabhTimer) clearTimeout(prabhTimer)
      if (sehajTimer) clearTimeout(sehajTimer)
    }
  }, [prabhMeter, sehajMeter])
  
  // Gradually decrease freakiness meters over time
  useEffect(() => {
    const interval = setInterval(() => {
      setPrabhMeter(prev => Math.max(0, prev - 1))
      setSehajMeter(prev => Math.max(0, prev - 1))
    }, 30000) // Decrease by 1 every 30 seconds
    
    return () => clearInterval(interval)
  }, [])
  
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
        // Play soft meow for wake up with cooldown
        playCatSound(catMeowSoftRef)
        setCat(prev => ({ 
          ...prev, 
          isAwake: true, 
          action: 'yawn', 
          mood: Math.min(100, prev.mood + 10) 
        }))
        break
        
      case 'sleep':
        // Play soft purr/night sound for sleep with cooldown
        playCatSound(catMeowNightRef)
        setCat(prev => ({ ...prev, isAwake: false, action: 'sleep', mood: Math.min(100, prev.mood + 5) }))
        setShowEffect({ type: 'z', x: isLeft ? 35 : 65, y: 35 })
        break
        
      case 'nudge':
        // Play cute chirp for nudge with cooldown
        playCatSound(catMeowSoftRef)
        setCat(prev => ({ ...prev, action: 'nudge', mood: Math.min(100, prev.mood + 15) }))
        // Increase freakiness meter (Prabh increases faster)
        if (cat === 'prabh') {
          setPrabhMeter(prev => Math.min(100, prev + 20))
        } else {
          setSehajMeter(prev => Math.min(100, prev + 15))
        }
        // Clear unloved message if showing for this cat
        if (showUnlovedMessage === cat) {
          setShowUnlovedMessage(null)
        }
        setTimeout(() => {
          setOtherCat(prev => ({ ...prev, action: 'tailWag', mood: Math.min(100, prev.mood + 10) }))
        }, 400)
        setShowEffect({ type: 'heart', x: 50, y: 35 })
        break
        
      case 'kick':
        // Play annoyed meow for kick with cooldown
        playCatSound(catMeowNightRef)
        haptics.medium()
        setCat(prev => ({ ...prev, action: 'kick', mood: Math.max(0, prev.mood - 5) }))
        setTimeout(() => {
          setOtherCat(prev => ({ ...prev, action: 'hiss', mood: Math.max(0, prev.mood - 10) }))
          setShowEffect({ type: 'puff', x: isLeft ? 60 : 40, y: 45 })
        }, 300)
        break
        
      case 'hog':
        // NEW: Blanket hogging moves blanket left or right
        haptics.medium()
        // Play rustle sound
        if (userInteracted && !isMuted) {
          playSound(AUDIO.rustle)
        }
        // Move blanket based on which cat is hogging
        if (cat === 'sehaj') {
          setBlanketPosition('left')
        } else {
          setBlanketPosition('right')
        }
        setCat(prev => ({ ...prev, mood: Math.min(100, prev.mood + 10) }))
        setOtherCat(prev => ({ ...prev, action: 'hiss', mood: Math.max(0, prev.mood - 15) }))
        break
        
      case 'feed':
        // Play happy meow for food with cooldown
        playCatSound(catMeowFoodRef)
        setCat(prev => ({ ...prev, action: 'eat', mood: Math.min(100, prev.mood + 20) }))
        // Increase meter slightly
        if (cat === 'prabh') {
          setPrabhMeter(prev => Math.min(100, prev + 10))
        } else {
          setSehajMeter(prev => Math.min(100, prev + 8))
        }
        // Clear unloved message if showing for this cat
        if (showUnlovedMessage === cat) {
          setShowUnlovedMessage(null)
        }
        const food = FOOD_ITEMS[Math.floor(Math.random() * FOOD_ITEMS.length)]
        setShowEffect({ type: 'food', x: isLeft ? 35 : 65, y: 40, value: food })
        break
        
      case 'game':
        // Play chirp for gaming with cooldown
        playCatSound(catMeowSoftRef)
        setCat(prev => ({ ...prev, action: 'gaming', mood: Math.min(100, prev.mood + 15) }))
        setShowEffect({ type: 'sparkle', x: isLeft ? 35 : 65, y: 45 })
        setTimeout(() => {
          setCat(prev => ({ ...prev, action: prev.isAwake ? 'sitIdle' : 'sleep' }))
        }, 4000)
        break
    }
  }
  
  // NEW: Compact action handler with target mode support + animation system
  const handleCompactAction = (action: string) => {
    if (!userInteracted) setUserInteracted(true)
    haptics.medium()
    
    const targets = targetMode === 'both' ? ['prabh', 'sehaj'] : [targetMode]
    
    targets.forEach(cat => {
      const catTyped = cat as 'prabh' | 'sehaj'
      const animController = catTyped === 'prabh' ? prabhAnim : sehajAnim
      
      switch (action) {
        case 'wake':
          animController.playAction('wake', 1500)
          handleCatAction(catTyped, 'wake')
          break
        case 'sleep':
          animController.playAction('sleep1LeftFront', 5000)
          handleCatAction(catTyped, 'sleep')
          break
        case 'feed':
          animController.playAction('eatFoodStandFront', 2000)
          handleCatAction(catTyped, 'feed')
          break
        case 'nudge':
          animController.playAction('scratchSitLeft', 1500)
          handleCatAction(catTyped, 'nudge')
          break
        case 'kick':
          animController.playAction('pawSwipeStandFront', 1500)
          handleCatAction(catTyped, 'kick')
          break
        case 'hogBlanket':
          animController.playAction('curlBallLie', 2000)
          handleCatAction(catTyped, 'hog')
          break
        case 'gaming':
          animController.playAction('yarnSitFront', 3000)
          handleCatAction(catTyped, 'game')
          break
        case 'pet':
          animController.playAction('lickPawSitFront', 2000)
          handleCatAction(catTyped, 'nudge')
          break
        case 'drama':
          animController.playAction('hissFrontLeft', 2000)
          handleCatAction(catTyped, 'kick')
          break
      }
    })
    
    // Special multi-cat actions
    if (action === 'cuddle' && targetMode === 'both') {
      // Move cats together
      const meetX = 40
      const meetY = 65
      prabhAnim.moveTo(meetX - 5, meetY, () => {
        prabhAnim.setState(prev => ({ ...prev, animation: 'curlBallLie' }))
      }, 'curlBallLie')
      sehajAnim.moveTo(meetX + 5, meetY, () => {
        sehajAnim.setState(prev => ({ ...prev, animation: 'curlBallLie' }))
      }, 'curlBallLie')
      
      setCuddleMode(true)
      setTimeout(() => {
        setCuddleMode(false)
        prabhAnim.startRoaming()
        sehajAnim.startRoaming()
      }, 3000)
    }
    
    if (action === 'lightsOut') {
      setLightsDimmed(prev => !prev)
    }
  }
  
  // NEW: Drag handlers for mood effects
  const handleDragStart = (cat: 'prabh' | 'sehaj', e: React.MouseEvent | React.TouchEvent) => {
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY
    
    setDragState({
      isDragging: true,
      cat,
      startX: clientX,
      startY: clientY,
    })
    
    const animController = cat === 'prabh' ? prabhAnim : sehajAnim
    animController.stopRoaming()
    
    haptics.light()
  }
  
  const handleDragMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!dragState.isDragging || !dragState.cat) return
    
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY
    
    // Calculate movement in percentages
    const deltaX = ((clientX - dragState.startX) / window.innerWidth) * 100
    const deltaY = ((clientY - dragState.startY) / window.innerHeight) * 100
    
    const animController = dragState.cat === 'prabh' ? prabhAnim : sehajAnim
    const newX = Math.max(15, Math.min(75, animController.state.x + deltaX * 0.5))
    const newY = Math.max(55, Math.min(75, animController.state.y + deltaY * 0.5))
    
    // Determine walk direction
    const walkAnim = deltaX > 0 ? 'walkRight' : 'walkLeft'
    
    animController.setState(prev => ({
      ...prev,
      x: newX,
      y: newY,
      animation: walkAnim,
      isMoving: true,
    }))
    
    // Update drag start for next move
    setDragState(prev => ({
      ...prev,
      startX: clientX,
      startY: clientY,
    }))
    
    // Check distance between cats for mood effects
    const prabhPos = prabhAnim.state
    const sehajPos = sehajAnim.state
    const distance = Math.sqrt(Math.pow(prabhPos.x - sehajPos.x, 2) + Math.pow(prabhPos.y - sehajPos.y, 2))
    
    if (distance < 10) {
      // Close together = happy
      setPrabhMoodBubble('💕')
      setSehajMoodBubble('💕')
      setPrabh(prev => ({ ...prev, mood: Math.min(100, prev.mood + 5) }))
      setSehaj(prev => ({ ...prev, mood: Math.min(100, prev.mood + 5) }))
    } else if (distance > 50) {
      // Far apart = sad
      setPrabhMoodBubble('💔')
      setSehajMoodBubble('💔')
      setPrabh(prev => ({ ...prev, mood: Math.max(0, prev.mood - 3) }))
      setSehaj(prev => ({ ...prev, mood: Math.max(0, prev.mood - 3) }))
    }
  }
  
  const handleDragEnd = () => {
    if (!dragState.cat) return
    
    const animController = dragState.cat === 'prabh' ? prabhAnim : sehajAnim
    const catPos = animController.state;
    
    // Check if dropped on sofa
    const inSofaZone = 
      catPos.x >= SOFA_DROP_ZONE.x &&
      catPos.x <= SOFA_DROP_ZONE.x + SOFA_DROP_ZONE.width &&
      catPos.y >= SOFA_DROP_ZONE.y &&
      catPos.y <= SOFA_DROP_ZONE.y + SOFA_DROP_ZONE.height;
    
    if (inSofaZone) {
      // Snap to nearest free seat
      const leftOccupied = (dragState.cat === 'prabh' ? sehajSeated : prabhSeated) && 
                          Math.abs(sehajAnim.state.x - SOFA_SEATS.left.x) < 5;
      const rightOccupied = (dragState.cat === 'prabh' ? sehajSeated : prabhSeated) && 
                           Math.abs(sehajAnim.state.x - SOFA_SEATS.right.x) < 5;
      
      let targetSeat = SOFA_SEATS.left;
      if (leftOccupied && !rightOccupied) {
        targetSeat = SOFA_SEATS.right;
      } else if (!leftOccupied && rightOccupied) {
        targetSeat = SOFA_SEATS.left;
      } else if (!leftOccupied && !rightOccupied) {
        // Pick closest
        const distLeft = Math.abs(catPos.x - SOFA_SEATS.left.x);
        const distRight = Math.abs(catPos.x - SOFA_SEATS.right.x);
        targetSeat = distLeft < distRight ? SOFA_SEATS.left : SOFA_SEATS.right;
      } else {
        // Both occupied, return to roaming
        animController.setState(prev => ({ ...prev, animation: 'sitIdle', isMoving: false }));
        setTimeout(() => animController.startRoaming(), 1000);
        setDragState({ isDragging: false, cat: null, startX: 0, startY: 0 });
        return;
      }
      
      // Snap to seat with bounce
      animController.moveTo(targetSeat.x, targetSeat.y, () => {
        if (dragState.cat === 'prabh') {
          setPrabhSeated(true);
          setPrabh(prev => ({ ...prev, mood: Math.min(100, prev.mood + 10) }));
          setPrabhMoodBubble('😌 Comfy!');
        } else {
          setSehajSeated(true);
          setSehaj(prev => ({ ...prev, mood: Math.min(100, prev.mood + 10) }));
          setSehajMoodBubble('😌 Cozy!');
        }
        
        setTimeout(() => {
          setPrabhMoodBubble(null);
          setSehajMoodBubble(null);
        }, 2000);
      }, 'sitIdle');
      
      haptics.medium();
    } else {
      // Not on sofa - return to normal roaming
      animController.setState(prev => ({ ...prev, animation: 'sitIdle', isMoving: false }));
      
      // If cat was seated, unseat them
      if (dragState.cat === 'prabh' && prabhSeated) {
        setPrabhSeated(false);
      } else if (dragState.cat === 'sehaj' && sehajSeated) {
        setSehajSeated(false);
      }
      
      // Resume roaming after 2 seconds
      setTimeout(() => {
        animController.startRoaming();
      }, 2000);
    }
    
    // Clear mood bubbles after delay
    setTimeout(() => {
      setPrabhMoodBubble(null);
      setSehajMoodBubble(null);
    }, 2000);
    
    setDragState({
      isDragging: false,
      cat: null,
      startX: 0,
      startY: 0,
    });
    
    haptics.light();
  }
  
  // Enhanced special button with personality
  const handleSpecialButton = () => {
    if (!userInteracted) setUserInteracted(true)
    
    haptics.light()
    setSpecialMode(true)
    
    // FIXED: Decrease freakiness meters slightly (not increase)
    setPrabhMeter(prev => Math.max(0, prev - 15))
    setSehajMeter(prev => Math.max(0, prev - 12))
    
    // Clear any unloved messages since both cats are getting attention
    setShowUnlovedMessage(null)
    
    // NEW: Play cat SCREAM sound for special button with cooldown
    playCatSound(catScreamRef)
    
    // Also play tussle sounds
    if (!isMuted && tussleRef.current) {
      setTimeout(() => tussleRef.current?.play(), 500)
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
        padding: '6px 8px', // SMALLER for mobile
        borderRadius: 12,
        background: colors.card,
        border: `1px solid ${color || colors.border}`,
        color: colors.textPrimary,
        fontSize: 11, // Smaller font
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
      
      {/* Unloved Message Overlay */}
      <AnimatePresence>
        {showUnlovedMessage && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            transition={{ duration: 0.5 }}
            style={{
              position: 'fixed',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              background: 'rgba(0,0,0,0.9)',
              borderRadius: 20,
              padding: '20px 30px',
              zIndex: 999,
              border: `2px solid ${showUnlovedMessage === 'prabh' ? '#8E44AD' : '#E67E22'}`,
              boxShadow: `0 0 30px ${showUnlovedMessage === 'prabh' ? '#8E44AD' : '#E67E22'}`,
            }}
          >
            <motion.div
              animate={{ 
                scale: [1, 1.1, 1],
              }}
              transition={{ duration: 0.8, repeat: Infinity }}
              style={{
                textAlign: 'center',
                color: 'white',
              }}
            >
              <div style={{ fontSize: 40, marginBottom: 10 }}>
                {showUnlovedMessage === 'prabh' ? '🖤💔' : '🧡💔'}
              </div>
              <p style={{ 
                fontSize: 18, 
                fontWeight: 600, 
                margin: 0,
                color: showUnlovedMessage === 'prabh' ? '#8E44AD' : '#E67E22'
              }}>
                {showUnlovedMessage === 'prabh' ? 'Prabh is severely unloved.' : 'Sehaj needs attention.'}
              </p>
              <p style={{ 
                fontSize: 14, 
                margin: '8px 0 0 0',
                color: 'rgba(255,255,255,0.8)',
                fontStyle: 'italic'
              }}>
                Show some love! 💕
              </p>
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
          top: 55,
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
          top: 55,
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
        
        {/* Room Scene Container */}
        <motion.div
          style={{
            background: colors.glass,
            backdropFilter: 'blur(20px)',
            border: `1px solid ${colors.border}`,
            borderRadius: 24,
            padding: 0,
            position: 'relative',
            boxShadow: `0 8px 32px ${colors.primaryGlow}`,
            overflow: 'hidden',
          }}
        >
          {/* Room Environment - Full Scene */}
          
          {/* ============ SECTION A: ROOM_VIEW (NO BUTTONS) ============ */}
          <div id="room-view" style={{
            position: 'relative',
            width: '100%',
            height: 450,
            overflow: 'hidden',
            borderRadius: 24,
          }}>

          <div style={{
            position: 'relative',
            width: '100%',
            height: 450,
            overflow: 'hidden',
            borderRadius: 24,
          }}>
            {/* NEW: Dim Lights Overlay - dims wall and floor when active */}
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              background: 'rgba(0, 0, 0, 0)',
              transition: 'background 0.8s ease',
              ...(lightsDimmed && {
                background: 'rgba(0, 0, 0, 0.5)',
              }),
              zIndex: 5,
              pointerEvents: 'none',
            }} />
            
            {/* LAYER 1: Wall Background (full width) */}
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              backgroundImage: 'url(/wall-background.jpeg)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
              zIndex: 0,
            }} />

            {/* Rainy Window on Wall - LARGER with WHITE OUTLINE - STAYS BRIGHT */}
            <div style={{
              position: 'absolute',
              top: 15,
              right: 25,
              width: 160,
              height: 120,
              background: 'linear-gradient(180deg, #2a3a5e 0%, #1a2540 100%)',
              border: '5px solid #FFFFFF',
              borderRadius: 10,
              overflow: 'hidden',
              zIndex: 10, // ABOVE dim overlay (z-index 5) so it stays bright
              boxShadow: '0 4px 12px rgba(0,0,0,0.3), inset 0 0 20px rgba(0,0,0,0.3)',
            }}>
              {/* Weather Videos/Backgrounds */}
              {weatherMode === 'rain' && (
                <video
                  autoPlay
                  loop
                  muted={true}
                  playsInline
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    zIndex: 0,
                  }}
                  src="/window-rain.mov"
                />
              )}
              {weatherMode === 'snow' && (
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  background: 'linear-gradient(180deg, #1a2a4e 0%, #0d1a30 100%)',
                  zIndex: 0,
                }}>
                  {/* Snowflakes */}
                  {[...Array(20)].map((_, i) => (
                    <motion.div
                      key={i}
                      animate={{
                        y: [0, 120],
                        x: [0, Math.sin(i) * 10],
                        opacity: [0.8, 0.3],
                      }}
                      transition={{
                        duration: 2 + Math.random() * 2,
                        repeat: Infinity,
                        delay: Math.random() * 2,
                      }}
                      style={{
                        position: 'absolute',
                        left: `${Math.random() * 100}%`,
                        top: -10,
                        width: 4,
                        height: 4,
                        borderRadius: '50%',
                        background: 'white',
                      }}
                    />
                  ))}
                </div>
              )}
              {weatherMode === 'city' && (
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  background: 'linear-gradient(180deg, #0f0f23 0%, #1a1a2e 100%)',
                  zIndex: 0,
                }}>
                  {/* City lights */}
                  {[...Array(15)].map((_, i) => (
                    <motion.div
                      key={i}
                      animate={{ opacity: [0.3, 1, 0.3] }}
                      transition={{ duration: 1 + Math.random(), repeat: Infinity }}
                      style={{
                        position: 'absolute',
                        left: `${5 + Math.random() * 90}%`,
                        top: `${40 + Math.random() * 50}%`,
                        width: 2 + Math.random() * 3,
                        height: 2 + Math.random() * 3,
                        borderRadius: 1,
                        background: ['#FFD700', '#FF6B6B', '#4ECDC4', '#FFA500'][Math.floor(Math.random() * 4)],
                      }}
                    />
                  ))}
                  {/* Stars */}
                  {[...Array(8)].map((_, i) => (
                    <motion.div
                      key={`star-${i}`}
                      animate={{ opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
                      style={{
                        position: 'absolute',
                        left: `${10 + Math.random() * 80}%`,
                        top: `${5 + Math.random() * 30}%`,
                        width: 2,
                        height: 2,
                        borderRadius: '50%',
                        background: 'white',
                      }}
                    />
                  ))}
                </div>
              )}
              {weatherMode === 'sunrise' && (
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  background: 'linear-gradient(180deg, #FF9A8B 0%, #FF6B8A 30%, #FF8E53 70%, #FFA726 100%)',
                  zIndex: 0,
                }}>
                  {/* Sun */}
                  <motion.div
                    animate={{ y: [20, 10, 20] }}
                    transition={{ duration: 4, repeat: Infinity }}
                    style={{
                      position: 'absolute',
                      bottom: '30%',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      width: 30,
                      height: 30,
                      borderRadius: '50%',
                      background: '#FFF176',
                      boxShadow: '0 0 20px #FFF176, 0 0 40px rgba(255,241,118,0.5)',
                    }}
                  />
                </div>
              )}
              
              {/* Window frame overlays - WHITE */}
              <div style={{
                position: 'absolute',
                top: 0,
                left: '50%',
                width: 5,
                height: '100%',
                background: '#FFFFFF',
                transform: 'translateX(-50%)',
                zIndex: 1,
              }} />
              <div style={{
                position: 'absolute',
                top: '50%',
                left: 0,
                width: '100%',
                height: 5,
                background: '#FFFFFF',
                transform: 'translateY(-50%)',
                zIndex: 1,
              }} />
              
              {/* Curtains */}
              <motion.div
                animate={{
                  x: curtainState === 'closed' ? 0 : curtainState === 'peek' ? -30 : -80,
                }}
                transition={{ duration: 0.5 }}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '55%',
                  height: '100%',
                  background: 'linear-gradient(90deg, #8B4513 0%, #A0522D 100%)',
                  zIndex: 2,
                  borderRight: '2px solid #5D3A1A',
                }}
              />
              <motion.div
                animate={{
                  x: curtainState === 'closed' ? 0 : curtainState === 'peek' ? 30 : 80,
                }}
                transition={{ duration: 0.5 }}
                style={{
                  position: 'absolute',
                  top: 0,
                  right: 0,
                  width: '55%',
                  height: '100%',
                  background: 'linear-gradient(270deg, #8B4513 0%, #A0522D 100%)',
                  zIndex: 2,
                  borderLeft: '2px solid #5D3A1A',
                }}
              />
              
              {/* Weather toggle arrows */}
              <div style={{
                position: 'absolute',
                bottom: 5,
                left: '50%',
                transform: 'translateX(-50%)',
                display: 'flex',
                gap: 8,
                zIndex: 3,
              }}>
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => {
                    const modes: ('rain' | 'snow' | 'city' | 'sunrise')[] = ['rain', 'snow', 'city', 'sunrise']
                    const idx = modes.indexOf(weatherMode)
                    setWeatherMode(modes[(idx - 1 + modes.length) % modes.length])
                    addXP(2)
                  }}
                  style={{
                    width: 20,
                    height: 20,
                    borderRadius: '50%',
                    background: 'rgba(255,255,255,0.8)',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: 10,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >◀</motion.button>
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => {
                    const modes: ('rain' | 'snow' | 'city' | 'sunrise')[] = ['rain', 'snow', 'city', 'sunrise']
                    const idx = modes.indexOf(weatherMode)
                    setWeatherMode(modes[(idx + 1) % modes.length])
                    addXP(2)
                  }}
                  style={{
                    width: 20,
                    height: 20,
                    borderRadius: '50%',
                    background: 'rgba(255,255,255,0.8)',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: 10,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >▶</motion.button>
              </div>
            </div>

            {/* ============ PROPER PLANE SYSTEM ============ */}
            
            {/* z0: BACKGROUND - Gradient */}
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              background: 'linear-gradient(180deg, #87CEEB 0%, #F5DEB3 50%, #D2B48C 100%)',
              zIndex: 0,
            }} />

            {/* z10: WALL PLANE */}
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '50%',
              background: isDarkMode ? '#2a2a3e' : '#e8d5c4',
              zIndex: 10,
            }} />

            {/* z20: WALL DECOR - Frames */}
            <div style={{ position: 'absolute', top: 0, width: '100%', height: '50%', zIndex: 20 }}>
              {/* Wall shelf - top left */}
              <div style={{
                position: 'absolute',
                top: 120,
                left: 30,
                width: 90,
                height: 8,
                background: '#8B6F47',
                borderRadius: 4,
                boxShadow: '0 3px 6px rgba(0,0,0,0.3)',
              }}>
                {/* Tiny plant on shelf */}
                <div style={{
                  position: 'absolute',
                  top: -25,
                  left: 15,
                  fontSize: 20,
                }}>
                  🪴
                </div>
                {/* INTERACTIVE: Tiny frame on shelf */}
                <motion.div
                  whileTap={{ scale: 0.9 }}
                  onClick={() => {
                    setFrameIndex(prev => (prev + 1) % FRAME_IMAGES.length)
                    addXP(1)
                    haptics.light()
                  }}
                  style={{
                    position: 'absolute',
                    top: -22,
                    right: 12,
                    width: 22,
                    height: 22,
                    background: 'linear-gradient(135deg, #FFD700, #FFA500)',
                    border: '2px solid #8B6914',
                    borderRadius: 3,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 12,
                  }}
                >
                  <AnimatePresence mode="wait">
                    <motion.span
                      key={frameIndex}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ duration: 0.2 }}
                    >
                      {FRAME_IMAGES[frameIndex]}
                    </motion.span>
                  </AnimatePresence>
                </motion.div>
              </div>
            </div>

            {/* LAYER 2.5: Couch (against back wall on floor) z60 */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              style={{
                position: 'absolute',
                bottom: '35%',
                left: '60%',
                transform: 'translateX(-50%)',
                width: 140,
                height: 80,
                backgroundImage: 'url(/couch.png)',
                backgroundSize: 'contain',
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'center',
                zIndex: 60,
                cursor: 'pointer',
                filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.2))',
              }}
            />

            {/* LAYER 2.6: Floor Lamp z60 */}
            <motion.div
              onClick={() => {
                setFloorLampOn(!floorLampOn);
                haptics.light();
                addXP(1);
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              style={{
                position: 'absolute',
                bottom: '32%',
                right: '15%',
                width: 50,
                height: 100,
                backgroundImage: floorLampOn ? 'url(/lamp_on.png)' : 'url(/lamp_off.png)',
                backgroundSize: 'contain',
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'center',
                zIndex: 60,
                cursor: 'pointer',
                filter: 'drop-shadow(0 3px 6px rgba(0,0,0,0.15))',
              }}
            />
            
            {/* Lamp Glow Overlay z80 */}
            {floorLampOn && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.4 }}
                exit={{ opacity: 0 }}
                style={{
                  position: 'absolute',
                  bottom: '48%',
                  right: '12%',
                  width: 120,
                  height: 120,
                  backgroundImage: 'url(/glowCircle.png)',
                  backgroundSize: 'contain',
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'center',
                  zIndex: 80,
                  mixBlendMode: 'screen',
                  pointerEvents: 'none',
                }}
              />
            )}

            {/* String Lights z30 */}
            <motion.div
              onClick={() => {
                const modes: ('off' | 'warm' | 'pink' | 'purple')[] = ['off', 'warm', 'pink', 'purple'];
                const idx = modes.indexOf(stringLightsMode);
                setStringLightsMode(modes[(idx + 1) % modes.length]);
                haptics.light();
                addXP(1);
              }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              style={{
                position: 'absolute',
                top: '5%',
                left: '10%',
                width: '80%',
                height: 40,
                display: 'flex',
                justifyContent: 'space-around',
                alignItems: 'center',
                zIndex: 30,
                cursor: 'pointer',
              }}
            >
              {stringLightsMode !== 'off' && Array.from({ length: 12 }).map((_, i) => (
                <motion.div
                  key={i}
                  animate={{
                    opacity: [0.6, 1, 0.6],
                    scale: [0.9, 1.1, 0.9],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: i * 0.15,
                  }}
                  style={{
                    width: 12,
                    height: 12,
                    borderRadius: '50%',
                    background: 
                      stringLightsMode === 'warm' ? '#FFD700' :
                      stringLightsMode === 'pink' ? '#FF69B4' :
                      '#9B59B6',
                    boxShadow: `0 0 12px ${
                      stringLightsMode === 'warm' ? '#FFD700' :
                      stringLightsMode === 'pink' ? '#FF69B4' :
                      '#9B59B6'
                    }`,
                  }}
                />
              ))}
            </motion.div>

            {/* LAYER 3: Enlarged Rug (60-70% of floor, centered, below characters) z55 */}
            <div style={{
              position: 'absolute',
              bottom: 30,
              left: '50%',
              transform: 'translateX(-50%)',
              width: '75%',
              maxWidth: 450,
              height: 180,
              backgroundImage: 'url(/rug.png)',
              backgroundSize: 'contain',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
              zIndex: 2,
              filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.15))',
            }} />

            {/* LAYER 4: Furniture Props */}
            {/* Small couch/bean bag - left side */}
            <div style={{
              position: 'absolute',
              bottom: 60,
              left: 20,
              width: 80,
              height: 70,
              background: 'linear-gradient(135deg, #8B7355 0%, #6B5644 100%)',
              borderRadius: '45% 45% 20% 20%',
              border: '3px solid #5D4037',
              zIndex: 2,
              boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
            }}>
              {/* Couch cushion detail */}
              <div style={{
                position: 'absolute',
                top: 10,
                left: '50%',
                transform: 'translateX(-50%)',
                width: '60%',
                height: 25,
                background: 'rgba(255,255,255,0.1)',
                borderRadius: 12,
              }} />
            </div>

            {/* Toy box - right side */}
            <div style={{
              position: 'absolute',
              bottom: 55,
              right: 25,
              width: 70,
              height: 60,
              background: 'linear-gradient(135deg, #E8A5C0 0%, #D88BA5 100%)',
              borderRadius: 8,
              border: '3px solid #B86080',
              zIndex: 2,
              boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
            }}>
              {/* Toy sticking out */}
              <div style={{
                position: 'absolute',
                top: -15,
                right: 10,
                fontSize: 24,
              }}>
                🧸
              </div>
            </div>

            {/* Wall shelf - top left */}
            <div style={{
              position: 'absolute',
              top: 120,
              left: 30,
              width: 90,
              height: 8,
              background: '#8B6F47',
              borderRadius: 4,
              zIndex: 1,
              boxShadow: '0 3px 6px rgba(0,0,0,0.3)',
            }}>
              {/* Tiny plant on shelf */}
              <div style={{
                position: 'absolute',
                top: -25,
                left: 15,
                fontSize: 20,
              }}>
                🪴
              </div>
              {/* INTERACTIVE: Tiny frame on shelf - cycles through images */}
              <motion.div
                whileTap={{ scale: 0.9 }}
                onClick={() => {
                  setFrameIndex(prev => (prev + 1) % FRAME_IMAGES.length)
                  addXP(1)
                  haptics.light()
                }}
                style={{
                  position: 'absolute',
                  top: -22,
                  right: 12,
                  width: 22,
                  height: 22,
                  background: 'linear-gradient(135deg, #FFD700, #FFA500)',
                  border: '2px solid #8B6914',
                  borderRadius: 3,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 12,
                }}
              >
                <AnimatePresence mode="wait">
                  <motion.span
                    key={frameIndex}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.2 }}
                  >
                    {FRAME_IMAGES[frameIndex]}
                  </motion.span>
                </AnimatePresence>
              </motion.div>
            </div>

            {/* Small lamp - top right - INTERACTIVE */}
            <motion.div
              onClick={() => {
                const modes: ('warm' | 'cool' | 'off')[] = ['warm', 'cool', 'off']
                const idx = modes.indexOf(lampMode)
                setLampMode(modes[(idx + 1) % modes.length])
                setLampFlicker(true)
                setTimeout(() => setLampFlicker(false), 300)
                addXP(2)
                haptics.light()
              }}
              style={{
                position: 'absolute',
                top: 130,
                right: 40,
                zIndex: 1,
                cursor: 'pointer',
              }}
            >
              {/* Lamp shade */}
              <motion.div
                animate={{
                  opacity: lampFlicker ? [1, 0.3, 1] : 1,
                }}
                transition={{ duration: 0.3 }}
                style={{
                  width: 0,
                  height: 0,
                  borderLeft: '20px solid transparent',
                  borderRight: '20px solid transparent',
                  borderBottom: `30px solid ${lampMode === 'warm' ? '#FFE4B5' : lampMode === 'cool' ? '#E0F7FA' : '#666'}`,
                  margin: '0 auto',
                  filter: lampMode !== 'off' ? `drop-shadow(0 0 ${lampFlicker ? '20px' : '10px'} ${lampMode === 'warm' ? '#FFD700' : '#00BCD4'})` : 'none',
                }}
              />
              {/* Lamp base */}
              <div style={{
                width: 12,
                height: 25,
                background: '#8B7355',
                margin: '0 auto',
                borderRadius: '0 0 6px 6px',
              }} />
              {/* Light glow effect */}
              {lampMode !== 'off' && (
                <motion.div
                  animate={{ opacity: [0.3, 0.5, 0.3] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  style={{
                    position: 'absolute',
                    top: 15,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: 60,
                    height: 60,
                    borderRadius: '50%',
                    background: `radial-gradient(circle, ${lampMode === 'warm' ? 'rgba(255,215,0,0.3)' : 'rgba(0,188,212,0.3)'} 0%, transparent 70%)`,
                    pointerEvents: 'none',
                  }}
                />
              )}
            </motion.div>
            
            {/* Room color overlay based on lamp */}
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              background: lampMode === 'warm' 
                ? 'rgba(255, 200, 100, 0.08)' 
                : lampMode === 'cool' 
                  ? 'rgba(100, 200, 255, 0.08)' 
                  : 'transparent',
              zIndex: 4,
              pointerEvents: 'none',
              transition: 'background 0.5s ease',
            }} />
            
            {/* LAYER 5: Cat Sprites - AUTONOMOUS ROAMING */}
            {/* Sehaj Cat (Left - Ginger) - ROAMING with smooth transitions - TOUCH ZONES */}
            <motion.div
              animate={{
                left: `${sehajAnim.state.x}%`,
                bottom: `${100 - sehajAnim.state.y}%`,
                y: sehaj.action === 'nudge' || sehaj.action === 'kick' ? [0, -5, 0] : 0,
              }}
              transition={{ 
                left: { duration: 0.5, ease: 'linear' },
                bottom: { duration: 0.5, ease: 'linear' },
                y: { duration: 0.3, ease: 'easeOut' }
              }}
              onMouseDown={(e) => handleDragStart('sehaj', e)}
              onMouseMove={handleDragMove}
              onMouseUp={handleDragEnd}
              onMouseLeave={handleDragEnd}
              onTouchStart={(e) => handleDragStart('sehaj', e)}
              onTouchMove={handleDragMove}
              onTouchEnd={handleDragEnd}
              style={{
                position: 'absolute',
                zIndex: 3,
                opacity: 1,
                visibility: 'visible',
                display: 'block',
                minWidth: 80,
                minHeight: 80,
                transform: 'translateX(-50%)',
                cursor: dragState.cat === 'sehaj' ? 'grabbing' : 'grab',
              }}
            >
              {/* Touch Zones - Invisible clickable areas */}
              {/* Head zone (top) */}
              <div
                onClick={() => tapHead('sehaj')}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: '25%',
                  width: '50%',
                  height: '30%',
                  cursor: 'pointer',
                  zIndex: 20,
                }}
              />
              {/* Nose zone (center-top) */}
              <div
                onClick={() => tapNose('sehaj')}
                style={{
                  position: 'absolute',
                  top: '25%',
                  left: '35%',
                  width: '30%',
                  height: '20%',
                  cursor: 'pointer',
                  zIndex: 20,
                }}
              />
              {/* Belly zone (center) */}
              <div
                onClick={() => tapBelly('sehaj')}
                onMouseDown={() => startPetting('sehaj')}
                onMouseUp={stopPetting}
                onMouseLeave={stopPetting}
                onTouchStart={() => startPetting('sehaj')}
                onTouchEnd={stopPetting}
                style={{
                  position: 'absolute',
                  top: '40%',
                  left: '20%',
                  width: '60%',
                  height: '35%',
                  cursor: 'pointer',
                  zIndex: 20,
                }}
              />
              {/* Tail zone (back) */}
              <div
                onClick={() => tapTail('sehaj')}
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '0%',
                  width: '25%',
                  height: '30%',
                  cursor: 'pointer',
                  zIndex: 20,
                }}
              />
              
              {/* Petting indicator */}
              {isPettingSehaj && (
                <motion.div
                  animate={{ scale: [1, 1.2, 1], opacity: [0.8, 1, 0.8] }}
                  transition={{ duration: 0.5, repeat: Infinity }}
                  style={{
                    position: 'absolute',
                    top: -50,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    fontSize: 24,
                    zIndex: 15,
                  }}
                >
                  💕
                </motion.div>
              )}
              
              {/* Petting progress bar */}
              {pettingProgress > 0 && isPettingSehaj && (
                <div style={{
                  position: 'absolute',
                  top: -25,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: 50,
                  height: 6,
                  background: 'rgba(0,0,0,0.3)',
                  borderRadius: 3,
                  overflow: 'hidden',
                  zIndex: 15,
                }}>
                  <motion.div
                    animate={{ width: `${pettingProgress}%` }}
                    style={{
                      height: '100%',
                      background: 'linear-gradient(90deg, #FF69B4, #FF1493)',
                      borderRadius: 3,
                    }}
                  />
                </div>
              )}
              
              {/* Mood Bubble */}
              <AnimatePresence>
                {sehajMoodBubble && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.8 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.8 }}
                    style={{
                      position: 'absolute',
                      top: -40,
                      left: '50%',
                      transform: 'translateX(-50%)',
                      background: 'rgba(255,255,255,0.95)',
                      borderRadius: 12,
                      padding: '6px 10px',
                      fontSize: 12,
                      boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                      whiteSpace: 'nowrap',
                      zIndex: 25,
                    }}
                  >
                    {sehajMoodBubble}
                  </motion.div>
                )}
              </AnimatePresence>
              
              {/* Walking indicator */}
              {sehajRoam.isMoving && (
                <motion.div
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 0.5, repeat: Infinity }}
                  style={{
                    position: 'absolute',
                    bottom: -10,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    fontSize: 10,
                  }}
                >
                  🐾
                </motion.div>
              )}
              
              <Sprite
                sheet={cat2Sheet}
                animations={SEHAJ_ANIMATIONS}
                currentAnimation={sehaj.action}
                onAnimationEnd={handleSehajAnimEnd}
                scale={1.8}
                flip={sehajRoam.xPercent > 40}
              />
              
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
            
            {/* Prabh Cat (Right - Grey) - ROAMING with smooth transitions - TOUCH ZONES */}
            <motion.div
              animate={{
                left: `${prabhAnim.state.x}%`,
                bottom: `${100 - prabhAnim.state.y}%`,
                y: prabh.action === 'nudge' || prabh.action === 'kick' ? [0, -5, 0] : 0,
              }}
              transition={{ 
                left: { duration: 0.5, ease: 'linear' },
                bottom: { duration: 0.5, ease: 'linear' },
                y: { duration: 0.3, ease: 'easeOut' }
              }}
              onMouseDown={(e) => handleDragStart('prabh', e)}
              onMouseMove={handleDragMove}
              onMouseUp={handleDragEnd}
              onMouseLeave={handleDragEnd}
              onTouchStart={(e) => handleDragStart('prabh', e)}
              onTouchMove={handleDragMove}
              onTouchEnd={handleDragEnd}
              style={{
                position: 'absolute',
                zIndex: 3,
                opacity: 1,
                visibility: 'visible',
                display: 'block',
                minWidth: 80,
                minHeight: 80,
                transform: 'translateX(-50%)',
                cursor: dragState.cat === 'prabh' ? 'grabbing' : 'grab',
              }}
            >
              {/* Touch Zones - Invisible clickable areas */}
              {/* Head zone (top) */}
              <div
                onClick={() => tapHead('prabh')}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: '25%',
                  width: '50%',
                  height: '30%',
                  cursor: 'pointer',
                  zIndex: 20,
                }}
              />
              {/* Nose zone (center-top) */}
              <div
                onClick={() => tapNose('prabh')}
                style={{
                  position: 'absolute',
                  top: '25%',
                  left: '35%',
                  width: '30%',
                  height: '20%',
                  cursor: 'pointer',
                  zIndex: 20,
                }}
              />
              {/* Belly zone (center) */}
              <div
                onClick={() => tapBelly('prabh')}
                onMouseDown={() => startPetting('prabh')}
                onMouseUp={stopPetting}
                onMouseLeave={stopPetting}
                onTouchStart={() => startPetting('prabh')}
                onTouchEnd={stopPetting}
                style={{
                  position: 'absolute',
                  top: '40%',
                  left: '20%',
                  width: '60%',
                  height: '35%',
                  cursor: 'pointer',
                  zIndex: 20,
                }}
              />
              {/* Tail zone (back) */}
              <div
                onClick={() => tapTail('prabh')}
                style={{
                  position: 'absolute',
                  top: '50%',
                  right: '0%',
                  width: '25%',
                  height: '30%',
                  cursor: 'pointer',
                  zIndex: 20,
                }}
              />
              
              {/* Petting indicator */}
              {isPettingPrabh && (
                <motion.div
                  animate={{ scale: [1, 1.2, 1], opacity: [0.8, 1, 0.8] }}
                  transition={{ duration: 0.5, repeat: Infinity }}
                  style={{
                    position: 'absolute',
                    top: -50,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    fontSize: 24,
                    zIndex: 15,
                  }}
                >
                  💕
                </motion.div>
              )}
              
              {/* Petting progress bar */}
              {pettingProgress > 0 && isPettingPrabh && (
                <div style={{
                  position: 'absolute',
                  top: -25,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: 50,
                  height: 6,
                  background: 'rgba(0,0,0,0.3)',
                  borderRadius: 3,
                  overflow: 'hidden',
                  zIndex: 15,
                }}>
                  <motion.div
                    animate={{ width: `${pettingProgress}%` }}
                    style={{
                      height: '100%',
                      background: 'linear-gradient(90deg, #FF69B4, #FF1493)',
                      borderRadius: 3,
                    }}
                  />
                </div>
              )}
              
              {/* Mood Bubble */}
              <AnimatePresence>
                {prabhMoodBubble && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.8 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.8 }}
                    style={{
                      position: 'absolute',
                      top: -40,
                      left: '50%',
                      transform: 'translateX(-50%)',
                      background: 'rgba(255,255,255,0.95)',
                      borderRadius: 12,
                      padding: '6px 10px',
                      fontSize: 12,
                      boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                      whiteSpace: 'nowrap',
                      zIndex: 25,
                    }}
                  >
                    {prabhMoodBubble}
                  </motion.div>
                )}
              </AnimatePresence>
              
              {/* Walking indicator */}
              {prabhRoam.isMoving && (
                <motion.div
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 0.5, repeat: Infinity }}
                  style={{
                    position: 'absolute',
                    bottom: -10,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    fontSize: 10,
                  }}
                >
                  🐾
                </motion.div>
              )}
              
              <Sprite
                sheet={cat1Sheet}
                animations={PRABH_ANIMATIONS}
                currentAnimation={prabh.action}
                onAnimationEnd={handlePrabhAnimEnd}
                scale={1.8}
                flip={prabhRoam.xPercent < 60}
              />
              
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
            
            {/* Yarn Ball - Rolling animation */}
            <AnimatePresence>
              {isYarnRolling && (
                <motion.div
                  initial={{ left: '10%', rotate: 0 }}
                  animate={{ 
                    left: `${10 + yarnPosition * 0.8}%`,
                    rotate: yarnPosition * 10,
                  }}
                  exit={{ opacity: 0 }}
                  style={{
                    position: 'absolute',
                    bottom: '25%',
                    fontSize: 30,
                    zIndex: 5,
                  }}
                >
                  🧶
                </motion.div>
              )}
            </AnimatePresence>

            {/* NEW: LAYER 7: Blanket (moves left/center/right based on hog blanket action) - FOREGROUND */}
            <motion.div
              animate={{
                left: blanketPosition === 'left' ? '15%' : blanketPosition === 'right' ? '60%' : '37.5%',
              }}
              transition={{ type: 'spring', stiffness: 120, damping: 15 }}
              style={{
                position: 'absolute',
                bottom: 40,
                width: 220,
                height: 80,
                background: 'linear-gradient(135deg, #FFB6C1 0%, #FFC0CB 50%, #FFD1DC 100%)',
                borderRadius: '50% 50% 20% 20%',
                border: '2px solid #FF69B4',
                zIndex: 7,
                boxShadow: '0 2px 8px rgba(255,105,180,0.2), inset 0 1px 4px rgba(255,255,255,0.4)',
                opacity: 0.85,
                transform: 'perspective(100px) rotateX(15deg)',
              }}
            >
              {/* Blanket texture/pattern - flatter appearance */}
              <div style={{
                position: 'absolute',
                top: 5,
                left: 5,
                right: 5,
                bottom: 5,
                background: 'repeating-linear-gradient(45deg, transparent, transparent 8px, rgba(255,255,255,0.15) 8px, rgba(255,255,255,0.15) 16px)',
                borderRadius: '45% 45% 15% 15%',
              }} />
              {/* Blanket folds for realistic flat appearance */}
              <div style={{
                position: 'absolute',
                top: '30%',
                left: '20%',
                right: '20%',
                height: 2,
                background: 'rgba(255,105,180,0.3)',
                borderRadius: 1,
              }} />
              <div style={{
                position: 'absolute',
                top: '60%',
                left: '15%',
                right: '25%',
                height: 1,
                background: 'rgba(255,105,180,0.2)',
                borderRadius: 1,
              }} />
            </motion.div>

            {/* LAYER 6: Foreground Props - moved lower */}
            {/* Pillow on floor - left */}
            <div style={{
              position: 'absolute',
              bottom: 80,
              left: 70,
              width: 50,
              height: 35,
              background: 'linear-gradient(135deg, #FF6B9D 0%, #E91E63 100%)',
              borderRadius: '45%',
              border: '2px solid #C2185B',
              zIndex: 4,
              boxShadow: '0 3px 6px rgba(0,0,0,0.2)',
              transform: 'rotate(-15deg)',
            }} />

            {/* Toy on floor - right */}
            <div style={{
              position: 'absolute',
              bottom: 90,
              right: 80,
              fontSize: 28,
              zIndex: 4,
              transform: 'rotate(20deg)',
            }}>
              🎾
            </div>

            {/* REMOVED: Blanket overlay - now using rug instead */}
            
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
          

          </div>
          
        </motion.div>
        
        {/* ============ SECTION B: CONTROL_PANEL (ALL BUTTONS HERE) ============ */}
        <div id="control-panel" style={{
          position: 'relative',
          width: '100%',
          maxWidth: 800,
          margin: '20px auto',
          background: 'rgba(0,0,0,0.4)',
          backdropFilter: 'blur(15px)',
          borderRadius: 20,
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
        }}>
          {/* Target Selector */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: 8,
          }}>
            <button style={{
              padding: '8px 16px',
              background: 'rgba(255,255,255,0.2)',
              border: 'none',
              borderRadius: 12,
              color: '#fff',
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
            }}>
              Prabh
            </button>
            <button style={{
              padding: '8px 16px',
              background: 'rgba(255,255,255,0.2)',
              border: 'none',
              borderRadius: 12,
              color: '#fff',
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
            }}>
              Sehaj
            </button>
            <button style={{
              padding: '8px 16px',
              background: 'rgba(255,255,255,0.4)',
              border: 'none',
              borderRadius: 12,
              color: '#fff',
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
            }}>
              Both
            </button>
          </div>
          
          {/* Freakiness Bar */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 8,
          }}>
            <span style={{ fontSize: 11, color: '#fff', fontWeight: 600 }}>Freakiness</span>
            <div style={{
              width: '100%',
              maxWidth: 200,
              height: 10,
              background: 'rgba(255,255,255,0.2)',
              borderRadius: 5,
              overflow: 'hidden',
            }}>
              <div style={{
                height: '100%',
                width: '50%',
                background: 'linear-gradient(90deg, #FF69B4, #9B59B6)',
                borderRadius: 5,
              }} />
            </div>
          </div>
          
          {/* Action Buttons */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: 12,
            flexWrap: 'wrap',
          }}>
            <button style={{
              padding: '10px 20px',
              background: 'rgba(255,255,255,0.2)',
              border: 'none',
              borderRadius: 16,
              color: '#fff',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
            }}>
              👁️ Wake
            </button>
            <button style={{
              padding: '10px 20px',
              background: 'rgba(255,255,255,0.2)',
              border: 'none',
              borderRadius: 16,
              color: '#fff',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
            }}>
              😴 Sleep
            </button>
            <button style={{
              padding: '10px 20px',
              background: 'rgba(255,255,255,0.2)',
              border: 'none',
              borderRadius: 16,
              color: '#fff',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
            }}>
              🍗 Feed
            </button>
            <button style={{
              padding: '10px 20px',
              background: 'rgba(255,255,255,0.2)',
              border: 'none',
              borderRadius: 16,
              color: '#fff',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
            }}>
              🐾 Pet
            </button>
            <button style={{
              padding: '10px 20px',
              background: 'rgba(255,255,255,0.2)',
              border: 'none',
              borderRadius: 16,
              color: '#fff',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
            }}>
              ❤️ Cuddle
            </button>
          </div>
        </div>

          {/* Lights Out Overlay */}
          <AnimatePresence>
            {lightsOutMode && (
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
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <motion.p
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  style={{
                    color: '#FFD700',
                    fontSize: 20,
                    fontStyle: 'italic',
                    textAlign: 'center',
                  }}
                >
                  {chaosMessage}
                </motion.p>
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* Spawned Toy Animation */}
          <AnimatePresence>
            {spawnedToy && (
              <motion.div
                initial={{ opacity: 0, scale: 0, y: 50 }}
                animate={{ opacity: 1, scale: 1.5, y: 0 }}
                exit={{ opacity: 0, scale: 0 }}
                style={{
                  position: 'absolute',
                  bottom: 150,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  fontSize: 40,
                  zIndex: 20,
                  pointerEvents: 'none',
                }}
              >
                {spawnedToy}
              </motion.div>
            )}
          </AnimatePresence>
      </div>
    )
  }
