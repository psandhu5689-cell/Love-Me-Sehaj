/**
 * MINIMAL WORKING DEMO - NO SLIDING + AUTO ROAMING
 * Proof of concept before full VirtualBed integration
 */

import React from 'react'
import { CatSprite } from '../components/CatSprite'
import { useCatMovement } from '../hooks/useCatMovement'
import { CompactCatUI } from '../components/CompactCatUI'

export default function CatDemo() {
  const prabhCat = useCatMovement('prabh')
  const sehajCat = useCatMovement('sehaj')

  const handleAction = (action: string, target: 'prabh' | 'sehaj' | 'both') => {
    // Map action to state
    const stateMap: Record<string, any> = {
      wake: 'wake',
      sleep: 'sleep',
      feed: 'eat',
      pet: 'happy',
      nudge: 'happy',
      kick: 'annoyed',
      cuddle: 'happy',
      lightsOut: 'annoyed',
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
    }}>
      <h1 style={{ color: 'white', textAlign: 'center', marginBottom: 20 }}>
        🐱 NO SLIDING Demo - Auto Roaming
      </h1>
      
      <p style={{ color: '#888', textAlign: 'center', marginBottom: 40, fontSize: 14 }}>
        ✅ Cats roam autonomously every 6-12s | ✅ Walk animations drive movement | ✅ NO SLIDING
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

        {/* Prabh (Black Cat) */}
        <div style={{
          position: 'absolute',
          left: `${prabhCat.position.x}%`,
          top: `${prabhCat.position.y}%`,
          transform: 'translate(-50%, -50%)',
          zIndex: 10,
        }}>
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
        </div>

        {/* Sehaj (Ginger Cat) */}
        <div style={{
          position: 'absolute',
          left: `${sehajCat.position.x}%`,
          top: `${sehajCat.position.y}%`,
          transform: 'translate(-50%, -50%)',
          zIndex: 10,
        }}>
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
        </div>
      </div>

      {/* Minimal 5-Button UI */}
      <div style={{
        maxWidth: 800,
        margin: '30px auto 0',
        display: 'grid',
        gridTemplateColumns: 'repeat(5, 1fr)',
        gap: 12,
      }}>
        <button
          onClick={() => {
            prabhCat.triggerAction('wake')
            sehajCat.triggerAction('wake')
          }}
          style={{
            padding: '14px 10px',
            borderRadius: 12,
            border: 'none',
            background: 'linear-gradient(135deg, #667eea, #764ba2)',
            color: 'white',
            fontSize: 13,
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          👁️ Wake
        </button>
        <button
          onClick={() => {
            prabhCat.triggerAction('sleep')
            sehajCat.triggerAction('sleep')
          }}
          style={{
            padding: '14px 10px',
            borderRadius: 12,
            border: 'none',
            background: 'linear-gradient(135deg, #667eea, #764ba2)',
            color: 'white',
            fontSize: 13,
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          😴 Sleep
        </button>
        <button
          onClick={() => {
            prabhCat.triggerAction('eat')
            sehajCat.triggerAction('eat')
          }}
          style={{
            padding: '14px 10px',
            borderRadius: 12,
            border: 'none',
            background: 'linear-gradient(135deg, #667eea, #764ba2)',
            color: 'white',
            fontSize: 13,
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          🍖 Feed
        </button>
        <button
          onClick={() => {
            prabhCat.triggerAction('happy')
            sehajCat.triggerAction('happy')
          }}
          style={{
            padding: '14px 10px',
            borderRadius: 12,
            border: 'none',
            background: 'linear-gradient(135deg, #667eea, #764ba2)',
            color: 'white',
            fontSize: 13,
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          💕 Cuddle
        </button>
        <button
          onClick={() => {
            prabhCat.triggerAction('annoyed')
            sehajCat.triggerAction('annoyed')
          }}
          style={{
            padding: '14px 10px',
            borderRadius: 12,
            border: 'none',
            background: 'linear-gradient(135deg, #1a1a24, #2d2d44)',
            color: '#FFD700',
            fontSize: 13,
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          🌙 Lights Out
        </button>
      </div>

      <div style={{
        textAlign: 'center',
        color: '#666',
        fontSize: 12,
        marginTop: 30,
      }}>
        Position updates ONLY during walk animations. Watch them roam!
      </div>
    </div>
  )
}
