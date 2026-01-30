/**
 * GAME-GRADE CAT SPRITE ANIMATOR
 * NO SLIDING - Movement only occurs during walk animations
 * Frame-based position updates
 */

import React, { useState, useEffect, useRef } from 'react'
import prabhSheet from '../assets/sprites/black_cat_sheet.png'
import sehajSheet from '../assets/sprites/ginger_cat_labeled.png'

// Core animation states (EXPANDED FOR TOUCH INTERACTIONS)
export type CatState = 
  | 'sitIdle'
  | 'layIdle'
  | 'walkUp'
  | 'walkDown'
  | 'walkLeft'
  | 'walkRight'
  | 'sleep'
  | 'wake'
  | 'eat'
  | 'happy'
  | 'annoyed'
  | 'sad'         // NEW: for drag-apart
  | 'surprised'   // NEW: for nose tap
  | 'purr'        // NEW: for body tap
  | 'tailFlick'   // NEW: for tail tap
  | 'bounce'      // NEW: for double tap
  | 'pickUp'      // NEW: for long press
  | 'chaos'       // NEW: for special button

interface AnimationDef {
  start: number  // Frame index in sprite sheet
  end: number
  fps: number
  loop: boolean
}

// BLACK CAT (Prabh) - Using actual sprite sheet data
const PRABH_ANIMATIONS: Record<CatState, AnimationDef> = {
  sitIdle: { start: 144, end: 144, fps: 1, loop: true },
  layIdle: { start: 145, end: 145, fps: 1, loop: true },
  walkUp: { start: 18, end: 23, fps: 8, loop: true },
  walkDown: { start: 0, end: 5, fps: 8, loop: true },
  walkLeft: { start: 54, end: 59, fps: 8, loop: true },
  walkRight: { start: 36, end: 41, fps: 8, loop: true },
  sleep: { start: 666, end: 671, fps: 6, loop: true },
  wake: { start: 671, end: 666, fps: 10, loop: false },
  eat: { start: 864, end: 873, fps: 10, loop: false },
  happy: { start: 504, end: 514, fps: 12, loop: false },
  annoyed: { start: 936, end: 945, fps: 10, loop: false },
  sad: { start: 936, end: 938, fps: 6, loop: true },        // Use first few annoyed frames looped
  surprised: { start: 144, end: 145, fps: 12, loop: false }, // Quick blink
  purr: { start: 504, end: 506, fps: 8, loop: true },       // Subtle happy loop
  tailFlick: { start: 936, end: 940, fps: 10, loop: false }, // Quick annoyed flick
  bounce: { start: 504, end: 510, fps: 12, loop: false },   // Happy bounce
  pickUp: { start: 144, end: 146, fps: 6, loop: true },     // Slight wiggle
  chaos: { start: 936, end: 945, fps: 14, loop: false },    // Full annoyed/fight
}

// GINGER CAT (Sehaj) - Same structure
const SEHAJ_ANIMATIONS: Record<CatState, AnimationDef> = {
  ...PRABH_ANIMATIONS // For now, same frames (both sheets have same layout)
}

interface CatSpriteProps {
  cat: 'prabh' | 'sehaj'
  state: CatState
  onAnimationComplete?: () => void
  flip?: boolean
  scale?: number
}

export function CatSprite({ cat, state, onAnimationComplete, flip = false, scale = 1.8 }: CatSpriteProps) {
  const [currentFrame, setCurrentFrame] = useState(0)
  const animRef = useRef<number | null>(null)
  const lastTimeRef = useRef(0)
  const completedRef = useRef(false)

  const spriteSheet = cat === 'prabh' ? prabhSheet : sehajSheet
  const animations = cat === 'prabh' ? PRABH_ANIMATIONS : SEHAJ_ANIMATIONS
  const anim = animations[state] || animations.sitIdle

  const FRAME_SIZE = 64
  const COLS = 18

  // Reset frame when state changes
  useEffect(() => {
    setCurrentFrame(anim.start)
    completedRef.current = false
    lastTimeRef.current = 0
  }, [state, anim.start])

  // Animation loop
  useEffect(() => {
    const animate = (time: number) => {
      if (!lastTimeRef.current) lastTimeRef.current = time

      const delta = time - lastTimeRef.current
      const frameTime = 1000 / anim.fps

      if (delta >= frameTime) {
        setCurrentFrame(prev => {
          const next = prev + 1

          // If we've passed the end frame
          if (next > anim.end) {
            if (anim.loop) {
              return anim.start // Loop back
            } else {
              // Animation complete
              if (!completedRef.current) {
                completedRef.current = true
                setTimeout(() => onAnimationComplete?.(), 50)
              }
              return anim.end // Stay on last frame
            }
          }

          return next
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
  }, [state, anim.fps, anim.start, anim.end, anim.loop, onAnimationComplete])

  // Calculate sprite position
  const frameIndex = Math.max(anim.start, Math.min(currentFrame, anim.end))
  const col = frameIndex % COLS
  const row = Math.floor(frameIndex / COLS)

  const displaySize = FRAME_SIZE * scale

  return (
    <div
      style={{
        width: displaySize,
        height: displaySize,
        overflow: 'hidden',
        transform: flip ? 'scaleX(-1)' : 'none',
        imageRendering: 'pixelated',
        backgroundImage: `url(${spriteSheet})`,
        backgroundSize: `${FRAME_SIZE * COLS * scale}px auto`,
        backgroundPosition: `-${col * FRAME_SIZE * scale}px -${row * FRAME_SIZE * scale}px`,
        backgroundRepeat: 'no-repeat',
      }}
    />
  )
}
