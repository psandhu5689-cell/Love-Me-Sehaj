/**
 * MINIMAL CAT ANIMATION TEST
 * Tests the core animation system before full integration
 */

import React, { useState } from 'react'
import { CatSprite, CatState } from '../components/CatSprite'

export default function CatTest() {
  const [prabhState, setPrabhState] = useState<CatState>('sitIdle')
  const [sehajState, setSehajState] = useState<CatState>('sitIdle')

  const states: CatState[] = [
    'sitIdle',
    'layIdle',
    'walkUp',
    'walkDown',
    'walkLeft',
    'walkRight',
    'sleep',
    'wake',
    'eat',
    'happy',
    'annoyed',
  ]

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: 40,
      fontFamily: 'system-ui, -apple-system, sans-serif',
    }}>
      <h1 style={{ color: 'white', textAlign: 'center', marginBottom: 40 }}>
        🐱 Cat Animation Test
      </h1>

      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: 80,
        marginBottom: 60,
      }}>
        {/* Prabh (Black Cat) */}
        <div style={{
          background: 'rgba(255,255,255,0.1)',
          backdropFilter: 'blur(10px)',
          borderRadius: 20,
          padding: 30,
          textAlign: 'center',
        }}>
          <h2 style={{ color: 'white', marginBottom: 20 }}>🖤 Prabh</h2>
          <div style={{
            background: 'rgba(0,0,0,0.3)',
            padding: 20,
            borderRadius: 12,
            marginBottom: 20,
          }}>
            <CatSprite
              cat="prabh"
              state={prabhState}
              onAnimationComplete={() => {
                if (!['sitIdle', 'layIdle', 'sleep'].includes(prabhState)) {
                  setPrabhState('sitIdle')
                }
              }}
            />
          </div>
          <p style={{ color: '#FFD700', fontSize: 14, marginBottom: 15 }}>
            Current: {prabhState}
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {states.map(state => (
              <button
                key={state}
                onClick={() => setPrabhState(state)}
                style={{
                  padding: '10px 16px',
                  borderRadius: 8,
                  border: 'none',
                  background: prabhState === state 
                    ? 'linear-gradient(135deg, #667eea, #764ba2)'
                    : 'rgba(255,255,255,0.2)',
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: 13,
                  fontWeight: 600,
                }}
              >
                {state}
              </button>
            ))}
          </div>
        </div>

        {/* Sehaj (Ginger Cat) */}
        <div style={{
          background: 'rgba(255,255,255,0.1)',
          backdropFilter: 'blur(10px)',
          borderRadius: 20,
          padding: 30,
          textAlign: 'center',
        }}>
          <h2 style={{ color: 'white', marginBottom: 20 }}>🧡 Sehaj</h2>
          <div style={{
            background: 'rgba(0,0,0,0.3)',
            padding: 20,
            borderRadius: 12,
            marginBottom: 20,
          }}>
            <CatSprite
              cat="sehaj"
              state={sehajState}
              onAnimationComplete={() => {
                if (!['sitIdle', 'layIdle', 'sleep'].includes(sehajState)) {
                  setSehajState('sitIdle')
                }
              }}
            />
          </div>
          <p style={{ color: '#FFD700', fontSize: 14, marginBottom: 15 }}>
            Current: {sehajState}
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {states.map(state => (
              <button
                key={state}
                onClick={() => setSehajState(state)}
                style={{
                  padding: '10px 16px',
                  borderRadius: 8,
                  border: 'none',
                  background: sehajState === state 
                    ? 'linear-gradient(135deg, #667eea, #764ba2)'
                    : 'rgba(255,255,255,0.2)',
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: 13,
                  fontWeight: 600,
                }}
              >
                {state}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div style={{
        textAlign: 'center',
        color: 'rgba(255,255,255,0.7)',
        fontSize: 12,
      }}>
        ✅ No Sliding | ✅ Sprite-Based | ✅ 8-12 FPS | ✅ Auto-Return to Idle
      </div>
    </div>
  )
}
