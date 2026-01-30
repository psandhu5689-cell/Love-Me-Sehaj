/**
 * COMPACT GAME-STYLE CAT UI
 * Bottom action bar + secondary drawer
 * Icon-first, minimal, playful
 */

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

type ActionType = 
  | 'wake' 
  | 'sleep' 
  | 'feed' 
  | 'gaming'
  | 'pet'
  | 'nudge'
  | 'kick'
  | 'hogBlanket'
  | 'cuddle'
  | 'drama'        // NEW
  | 'lightsOut'    // NEW
  | 'treatToss'
  | 'laser'
  | 'chaos'        // NEW: special "fuck" button

type Target = 'prabh' | 'sehaj' | 'both'

interface CompactCatUIProps {
  onAction: (action: ActionType, target: Target) => void
  prabhState?: string
  sehajState?: string
  disabled?: boolean
}

interface ActionButton {
  id: ActionType
  icon: string
  label: string
  primary?: boolean
}

const PRIMARY_ACTIONS: ActionButton[] = [
  { id: 'wake', icon: '👁️', label: 'Wake', primary: true },
  { id: 'sleep', icon: '😴', label: 'Sleep', primary: true },
  { id: 'feed', icon: '🍖', label: 'Feed', primary: true },
]

const SECONDARY_ACTIONS: ActionButton[] = [
  { id: 'gaming', icon: '🎮', label: 'Gaming' },
  { id: 'pet', icon: '🐾', label: 'Pet' },
  { id: 'nudge', icon: '💕', label: 'Nudge' },
  { id: 'kick', icon: '💥', label: 'Kick' },
  { id: 'hogBlanket', icon: '🧣', label: 'Hog Blanket' },
  { id: 'cuddle', icon: '❤️', label: 'Cuddle' },
  { id: 'drama', icon: '🎭', label: 'Drama' },
  { id: 'lightsOut', icon: '🌙', label: 'Lights Out' },
  { id: 'treatToss', icon: '🐟', label: 'Treat' },
]

export function CompactCatUI({ onAction, prabhState, sehajState, disabled }: CompactCatUIProps) {
  const [target, setTarget] = useState<Target>('both')
  const [showDrawer, setShowDrawer] = useState(false)

  const handleAction = (action: ActionType) => {
    if (disabled) return
    
    onAction(action, target)
    
    // Close drawer after action
    if (!PRIMARY_ACTIONS.find(a => a.id === action)) {
      setTimeout(() => setShowDrawer(false), 300)
    }
  }

  const isDisabled = (action: ActionType) => {
    if (disabled) return true
    
    // Context-sensitive disabling
    if (action === 'wake' && target !== 'both') {
      const state = target === 'prabh' ? prabhState : sehajState
      return state !== 'sleep'
    }
    if (action === 'sleep' && target !== 'both') {
      const state = target === 'prabh' ? prabhState : sehajState
      return state === 'sleep'
    }
    
    return false
  }

  return (
    <>
      {/* Target Selector */}
      <div style={{
        position: 'fixed',
        bottom: 100,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 999,
        display: 'flex',
        gap: 4,
        background: 'rgba(26, 26, 36, 0.85)',
        backdropFilter: 'blur(10px)',
        borderRadius: 20,
        padding: 4,
        border: '1px solid rgba(255, 255, 255, 0.1)',
      }}>
        {(['prabh', 'sehaj', 'both'] as Target[]).map(t => (
          <motion.button
            key={t}
            whileTap={{ scale: 0.95 }}
            onClick={() => setTarget(t)}
            style={{
              padding: '6px 12px',
              borderRadius: 16,
              border: 'none',
              background: target === t 
                ? 'linear-gradient(135deg, #667eea, #764ba2)'
                : 'transparent',
              color: 'white',
              fontSize: 11,
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            {t === 'prabh' ? '🖤 Prabh' : t === 'sehaj' ? '🧡 Sehaj' : '💕 Both'}
          </motion.button>
        ))}
      </div>

      {/* Bottom Action Bar */}
      <motion.div
        style={{
          position: 'fixed',
          bottom: 20,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 1000,
          display: 'flex',
          gap: 12,
          background: 'rgba(26, 26, 36, 0.9)',
          backdropFilter: 'blur(20px)',
          borderRadius: 30,
          padding: '12px 20px',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
        }}
      >
        {PRIMARY_ACTIONS.map(action => (
          <ActionIconButton
            key={action.id}
            action={action}
            onClick={() => handleAction(action.id)}
            disabled={isDisabled(action.id)}
          />
        ))}
        
        {/* More Button */}
        <ActionIconButton
          action={{ id: 'drama', icon: '⋯', label: 'More' }}
          onClick={() => setShowDrawer(!showDrawer)}
          active={showDrawer}
        />
      </motion.div>

      {/* Secondary Action Drawer */}
      <AnimatePresence>
        {showDrawer && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowDrawer(false)}
              style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(0, 0, 0, 0.5)',
                zIndex: 998,
              }}
            />
            
            {/* Drawer */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              style={{
                position: 'fixed',
                bottom: 0,
                left: 0,
                right: 0,
                maxHeight: '45vh',
                background: 'rgba(26, 26, 36, 0.95)',
                backdropFilter: 'blur(20px)',
                borderTopLeftRadius: 24,
                borderTopRightRadius: 24,
                padding: '24px 20px 100px',
                zIndex: 999,
                border: '1px solid rgba(255, 255, 255, 0.1)',
                boxShadow: '0 -4px 32px rgba(0, 0, 0, 0.3)',
              }}
            >
              {/* Drag Handle */}
              <div style={{
                width: 40,
                height: 4,
                background: 'rgba(255, 255, 255, 0.3)',
                borderRadius: 2,
                margin: '0 auto 20px',
              }} />
              
              {/* Action Grid */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: 16,
                maxWidth: 400,
                margin: '0 auto',
              }}>
                {SECONDARY_ACTIONS.map(action => (
                  <ActionGridButton
                    key={action.id}
                    action={action}
                    onClick={() => handleAction(action.id)}
                    disabled={isDisabled(action.id)}
                  />
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}

// Action Icon Button (for bottom bar)
function ActionIconButton({ 
  action, 
  onClick, 
  disabled, 
  active 
}: { 
  action: ActionButton
  onClick: () => void
  disabled?: boolean
  active?: boolean
}) {
  return (
    <motion.button
      whileTap={disabled ? {} : { scale: 0.9 }}
      whileHover={disabled ? {} : { scale: 1.05 }}
      onClick={onClick}
      disabled={disabled}
      style={{
        width: 56,
        height: 56,
        borderRadius: '50%',
        border: 'none',
        background: active 
          ? 'linear-gradient(135deg, #667eea, #764ba2)'
          : disabled
          ? 'rgba(60, 60, 80, 0.5)'
          : 'rgba(60, 60, 80, 0.8)',
        color: disabled ? 'rgba(255, 255, 255, 0.3)' : 'white',
        fontSize: 24,
        cursor: disabled ? 'not-allowed' : 'pointer',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
        boxShadow: active ? '0 0 20px rgba(102, 126, 234, 0.5)' : 'none',
        transition: 'all 0.2s',
      }}
    >
      <span style={{ fontSize: 20 }}>{action.icon}</span>
    </motion.button>
  )
}

// Action Grid Button (for drawer)
function ActionGridButton({ 
  action, 
  onClick, 
  disabled 
}: { 
  action: ActionButton
  onClick: () => void
  disabled?: boolean
}) {
  return (
    <motion.button
      whileTap={disabled ? {} : { scale: 0.95 }}
      onClick={onClick}
      disabled={disabled}
      style={{
        aspectRatio: '1',
        borderRadius: 16,
        border: 'none',
        background: disabled
          ? 'rgba(60, 60, 80, 0.3)'
          : 'rgba(60, 60, 80, 0.7)',
        color: disabled ? 'rgba(255, 255, 255, 0.3)' : 'white',
        cursor: disabled ? 'not-allowed' : 'pointer',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 4,
        padding: 12,
        transition: 'all 0.2s',
      }}
    >
      <span style={{ fontSize: 28 }}>{action.icon}</span>
      <span style={{ 
        fontSize: 10, 
        fontWeight: 600,
        opacity: 0.8,
      }}>
        {action.label}
      </span>
    </motion.button>
  )
}
