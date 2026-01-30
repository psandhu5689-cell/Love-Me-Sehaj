/**
 * COMPLETE TOUCH INTERACTIONS DEMO
 * Shows all touch gestures + drag-apart sadness + special buttons
 */

import React, { useState, useRef, useEffect } from 'react'
import { CatSprite, CatState } from '../components/CatSprite'
import { useCatMovement } from '../hooks/useCatMovement'
import { CompactCatUI } from '../components/CompactCatUI'
import { useCatTouch, detectDragApartSadness } from '../hooks/useCatTouch'
import { motion, AnimatePresence } from 'framer-motion'

export default function TouchDemo() {
  const prabhCat = useCatMovement('prabh')
  const sehajCat = useCatMovement('sehaj')
  
  const [prabhBubble, setPrabhBubble] = useState<string>('')
  const [sehajBubble, setSehajBubble] = useState<string>('')
  const [lightsOut, setLightsOut] = useState(false)
  const [chaosText, setChaosText] = useState<string>('')
  const [showChaos, setShowChaos] = useState(false)
  
  const prabhRef = useRef<HTMLDivElement>(null)
  const sehajRef = useRef<HTMLDivElement>(null)

  // Drag-apart sadness detection
  useEffect(() => {
    const interval = setInterval(() => {
      const status = detectDragApartSadness(
        { x: prabhCat.position.x, y: prabhCat.position.y },
        { x: sehajCat.position.x, y: sehajCat.position.y }
      )

      if (status === 'sad') {
        prabhCat.triggerAction('sad')
        sehajCat.triggerAction('sad')
        setPrabhBubble('🥺')
        setSehajBubble('😿')
        setTimeout(() => {
          setPrabhBubble('')
          setSehajBubble('')
        }, 8000)
      } else if (status === 'reunited') {
        if (prabhCat.position.state === 'sad') {
          prabhCat.triggerAction('happy')
          sehajCat.triggerAction('happy')
          setPrabhBubble('💕')
          setSehajBubble('💕')
          setTimeout(() => {
            setPrabhBubble('')
            setSehajBubble('')
          }, 3000)
        }
      }
    }, 500)

    return () => clearInterval(interval)
  }, [prabhCat.position.x, prabhCat.position.y, sehajCat.position.x, sehajCat.position.y, prabhCat.position.state])

  // Prabh touch handlers
  const prabhTouch = useCatTouch({
    catId: 'prabh',
    onInteraction: (interaction) => {
      if (interaction.type === 'tap') {
        if (interaction.zone === 'head') {
          prabhCat.triggerAction('happy')
          setPrabhBubble('💖')
          setTimeout(() => setPrabhBubble(''), 2000)
        } else if (interaction.zone === 'nose') {
          prabhCat.triggerAction('surprised')
          setPrabhBubble('!')
          setTimeout(() => setPrabhBubble(''), 1500)
        } else if (interaction.zone === 'body') {
          prabhCat.triggerAction('purr')
          setPrabhBubble('😊')
          setTimeout(() => setPrabhBubble(''), 2000)
        } else if (interaction.zone === 'tail') {
          prabhCat.triggerAction('tailFlick')
          setPrabhBubble('💢')
          setTimeout(() => setPrabhBubble(''), 1500)
        }
      } else if (interaction.type === 'doubleTap') {
        prabhCat.triggerAction('bounce')
        setPrabhBubble('🎵')
        setTimeout(() => setPrabhBubble(''), 2000)
      } else if (interaction.type === 'longPress') {
        prabhCat.triggerAction('pickUp')
        setPrabhBubble('👆')
        setTimeout(() => setPrabhBubble(''), 1500)
      }
    },
    bounds: prabhRef.current?.getBoundingClientRect() || null,
  })

  // Sehaj touch handlers
  const sehajTouch = useCatTouch({
    catId: 'sehaj',
    onInteraction: (interaction) => {
      if (interaction.type === 'tap') {
        if (interaction.zone === 'head') {
          sehajCat.triggerAction('happy')
          setSehajBubble('💖')
          setTimeout(() => setSehajBubble(''), 2000)
        } else if (interaction.zone === 'nose') {
          sehajCat.triggerAction('surprised')
          setSehajBubble('!')
          setTimeout(() => setSehajBubble(''), 1500)
        } else if (interaction.zone === 'body') {
          sehajCat.triggerAction('purr')
          setSehajBubble('😊')
          setTimeout(() => setSehajBubble(''), 2000)
        } else if (interaction.zone === 'tail') {
          sehajCat.triggerAction('tailFlick')
          setSehajBubble('💢')
          setTimeout(() => setSehajBubble(''), 1500)
        }
      } else if (interaction.type === 'doubleTap') {
        sehajCat.triggerAction('bounce')
        setSehajBubble('🎵')
        setTimeout(() => setSehajBubble(''), 2000)
      } else if (interaction.type === 'longPress') {
        sehajCat.triggerAction('pickUp')
        setSehajBubble('👆')
        setTimeout(() => setSehajBubble(''), 1500)
      }
    },
    bounds: sehajRef.current?.getBoundingClientRect() || null,
  })

  const handleAction = (action: string, target: 'prabh' | 'sehaj' | 'both') => {
    const stateMap: Record<string, CatState> = {
      wake: 'wake',
      sleep: 'sleep',
      feed: 'eat',
      pet: 'happy',
      nudge: 'happy',
      kick: 'annoyed',
      cuddle: 'happy',
      drama: 'annoyed',
      lightsOut: 'surprised',
      chaos: 'chaos',
    }

    // Special actions
    if (action === 'lightsOut') {
      setLightsOut(true)
      setTimeout(() => setLightsOut(false), 2000)
    } else if (action === 'drama') {
      setPrabhBubble('😡')
      setSehajBubble('😡')
      setTimeout(() => {
        setPrabhBubble('')
        setSehajBubble('')
      }, 2000)
    } else if (action === 'chaos') {
      // CHAOS SEQUENCE
      const chaosLines = [
        "OH MY GOD WHAT'S HAPPENING",
        "THEY'RE FIGHTING AGAIN",
        "SOMEONE STOP THEM",
        "THIS IS PURE CHAOS",
        "WHY ARE THEY LIKE THIS"
      ]
      setChaosText(chaosLines[Math.floor(Math.random() * chaosLines.length)])
      setShowChaos(true)
      
      setTimeout(() => {
        setShowChaos(false)
        setChaosText('')
      }, 2500)
    }

    const state = stateMap[action] || 'sitIdle'

    if (target === 'prabh' || target === 'both') {
      prabhCat.triggerAction(state)
    }
    if (target === 'sehaj' || target === 'both') {
      sehajCat.triggerAction(state)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#1a1a24',
      padding: 40,
      fontFamily: 'system-ui',
      paddingBottom: 140,
    }}>
      <h1 style={{ color: 'white', textAlign: 'center', marginBottom: 10 }}>
        🐱 Complete Touch Interactions
      </h1>
      
      <p style={{ color: '#888', textAlign: 'center', marginBottom: 30, fontSize: 12 }}>
        Tap head/nose/body/tail | Double tap | Hold to pet | Drag apart for sadness | Special buttons
      </p>

      {/* Room Scene */}
      <div style={{
        position: 'relative',
        width: '100%',
        maxWidth: 800,
        height: 500,
        margin: '0 auto',
        background: 'linear-gradient(180deg, #FF69B4 0%, #FFB6C1 50%, #D2B48C 100%)',
        borderRadius: 20,
        overflow: 'hidden',
        border: '3px solid #333',
      }}>
        {/* Lights Out Overlay */}
        <AnimatePresence>
          {lightsOut && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.7 }}
              exit={{ opacity: 0 }}
              style={{
                position: 'absolute',
                inset: 0,
                background: 'black',
                zIndex: 100,
                pointerEvents: 'none',
              }}
            />
          )}
        </AnimatePresence>

        {/* Floor */}
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          width: '100%',
          height: '50%',
          background: '#8B7355',
          zIndex: 1,
        }} />

        {/* Prabh (Black Cat) - WITH TOUCH */}
        <div
          ref={prabhRef}
          onMouseDown={prabhTouch.handleTouchStart}
          onMouseMove={prabhTouch.handleTouchMove}
          onMouseUp={prabhTouch.handleTouchEnd}
          onTouchStart={prabhTouch.handleTouchStart as any}
          onTouchMove={prabhTouch.handleTouchMove as any}
          onTouchEnd={prabhTouch.handleTouchEnd as any}
          style={{
            position: 'absolute',
            left: `${prabhCat.position.x}%`,
            top: `${prabhCat.position.y}%`,
            transform: 'translate(-50%, -50%)',
            zIndex: 10,
            cursor: 'pointer',
            userSelect: 'none',
          }}
        >
          <CatSprite
            cat="prabh"
            state={prabhCat.position.state}
            onAnimationComplete={prabhCat.onAnimationComplete}
            flip={prabhCat.position.state === 'walkLeft'}
          />
          <div style={{
            textAlign: 'center',
            marginTop: 5,
            fontSize: 10,
            color: '#FFD700',
            textShadow: '0 0 3px black',
          }}>
            🖤 Prabh: {prabhCat.position.state}
          </div>
          {/* Bubble */}
          {prabhBubble && (
            <motion.div
              initial={{ scale: 0, y: 10 }}
              animate={{ scale: 1, y: -10 }}
              style={{
                position: 'absolute',
                top: -30,
                left: '50%',
                transform: 'translateX(-50%)',
                background: 'white',
                borderRadius: 12,
                padding: '4px 8px',
                fontSize: 16,
                boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
              }}
            >
              {prabhBubble}
            </motion.div>
          )}
        </div>

        {/* Sehaj (Ginger Cat) - WITH TOUCH */}
        <div
          ref={sehajRef}
          onMouseDown={sehajTouch.handleTouchStart}
          onMouseMove={sehajTouch.handleTouchMove}
          onMouseUp={sehajTouch.handleTouchEnd}
          onTouchStart={sehajTouch.handleTouchStart as any}
          onTouchMove={sehajTouch.handleTouchMove as any}
          onTouchEnd={sehajTouch.handleTouchEnd as any}
          style={{
            position: 'absolute',
            left: `${sehajCat.position.x}%`,
            top: `${sehajCat.position.y}%`,
            transform: 'translate(-50%, -50%)',
            zIndex: 10,
            cursor: 'pointer',
            userSelect: 'none',
          }}
        >
          <CatSprite
            cat="sehaj"
            state={sehajCat.position.state}
            onAnimationComplete={sehajCat.onAnimationComplete}
            flip={sehajCat.position.state === 'walkLeft'}
          />
          <div style={{
            textAlign: 'center',
            marginTop: 5,
            fontSize: 10,
            color: '#FFD700',
            textShadow: '0 0 3px black',
          }}>
            🧡 Sehaj: {sehajCat.position.state}
          </div>
          {/* Bubble */}
          {sehajBubble && (
            <motion.div
              initial={{ scale: 0, y: 10 }}
              animate={{ scale: 1, y: -10 }}
              style={{
                position: 'absolute',
                top: -30,
                left: '50%',
                transform: 'translateX(-50%)',
                background: 'white',
                borderRadius: 12,
                padding: '4px 8px',
                fontSize: 16,
                boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
              }}
            >
              {sehajBubble}
            </motion.div>
          )}
        </div>
      </div>

      {/* Chaos Overlay */}
      <AnimatePresence>
        {showChaos && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0, 0, 0, 0.8)',
              zIndex: 9999,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              pointerEvents: 'none',
            }}
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              style={{
                color: 'white',
                fontSize: 32,
                fontWeight: 'bold',
                textAlign: 'center',
                textShadow: '0 0 20px rgba(255,0,0,0.8)',
              }}
            >
              {chaosText}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Compact Cat UI */}
      <CompactCatUI
        onAction={handleAction}
        prabhState={prabhCat.position.state}
        sehajState={sehajCat.position.state}
      />

      <div style={{
        textAlign: 'center',
        color: '#666',
        fontSize: 11,
        marginTop: 30,
        lineHeight: 1.6,
      }}>
        <div>✅ Tap zones (head/nose/body/tail)</div>
        <div>✅ Double tap for bounce</div>
        <div>✅ Hold for pick up</div>
        <div>✅ Drag apart = sadness (>200px)</div>
        <div>✅ Drama, Lights Out, & "fuck" buttons in drawer</div>
      </div>
    </div>
  )
}
