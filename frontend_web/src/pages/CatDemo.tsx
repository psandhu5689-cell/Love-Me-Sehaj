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
      paddingBottom: 140, // Space for bottom UI
    }}>
      <h1 style={{ color: 'white', textAlign: 'center', marginBottom: 20 }}>
        🐱 Compact UI Demo - NO SLIDING
      </h1>
      
      <p style={{ color: '#888', textAlign: 'center', marginBottom: 40, fontSize: 14 }}>
        ✅ New Game-Style UI | ✅ Auto Roaming | ✅ NO SLIDING
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

      {/* Compact Cat UI */}
      <CompactCatUI
        onAction={handleAction}
        prabhState={prabhCat.position.state}
        sehajState={sehajCat.position.state}
      />

      <div style={{
        textAlign: 'center',
        color: '#666',
        fontSize: 12,
        marginTop: 30,
      }}>
        Game-style UI | Icon-first | Touch-friendly
      </div>
    </div>
  )
}
