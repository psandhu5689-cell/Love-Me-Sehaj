import React, { useMemo } from 'react'
import { motion } from 'framer-motion'
import { useTheme } from '../context/ThemeContext'

interface AnimatedBackgroundProps {
  particleCount?: number
  shootingCount?: number
}

export default function AnimatedBackground({ 
  particleCount = 80, 
  shootingCount = 4
}: AnimatedBackgroundProps) {
  const { isDark, colors } = useTheme()

  // Generate particles (stars for dark, hearts for light)
  const particles = useMemo(() => {
    return Array.from({ length: particleCount }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1,
      delay: Math.random() * 3,
      duration: Math.random() * 2 + 2,
    }))
  }, [particleCount])

  // Generate shooting elements
  const shootingElements = useMemo(() => {
    return Array.from({ length: shootingCount }, (_, i) => ({
      id: i,
      startX: Math.random() * 40,
      startY: Math.random() * 30,
      delay: Math.random() * 10 + i * 4,
      duration: Math.random() * 1.2 + 0.8,
    }))
  }, [shootingCount])

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      overflow: 'hidden',
      pointerEvents: 'none',
      zIndex: 0,
      background: isDark 
        ? 'linear-gradient(180deg, #0D0D12 0%, #14141B 50%, #0D0D12 100%)'
        : 'linear-gradient(180deg, #FFF8F5 0%, #FFE8E8 50%, #FFF0EB 100%)',
    }}>
      {/* Ambient glow/nebula */}
      <motion.div
        animate={{
          opacity: isDark ? [0.05, 0.12, 0.05] : [0.15, 0.25, 0.15],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        style={{
          position: 'absolute',
          top: '10%',
          left: '20%',
          width: 350,
          height: 350,
          borderRadius: '50%',
          background: isDark 
            ? 'radial-gradient(circle, rgba(232,99,143,0.4) 0%, transparent 70%)'
            : 'radial-gradient(circle, rgba(255,182,193,0.5) 0%, transparent 70%)',
          filter: 'blur(50px)',
        }}
      />
      <motion.div
        animate={{
          opacity: isDark ? [0.08, 0.15, 0.08] : [0.1, 0.2, 0.1],
          scale: [1, 1.15, 1],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 2,
        }}
        style={{
          position: 'absolute',
          bottom: '15%',
          right: '10%',
          width: 280,
          height: 280,
          borderRadius: '50%',
          background: isDark 
            ? 'radial-gradient(circle, rgba(167,139,250,0.35) 0%, transparent 70%)'
            : 'radial-gradient(circle, rgba(255,192,203,0.4) 0%, transparent 70%)',
          filter: 'blur(45px)',
        }}
      />

      {/* Static twinkling particles - HEARTS NOW TWINKLE, NO DRIFTING */}
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          animate={{
            opacity: [0.2, 0.9, 0.2],
            scale: [0.8, 1.2, 0.8],
            // REMOVED: No x/y movement - hearts twinkle in place
          }}
          transition={{
            duration: particle.duration,
            repeat: Infinity,
            delay: particle.delay,
            ease: 'easeInOut',
          }}
          style={{
            position: 'absolute',
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: isDark ? particle.size : particle.size * 2.5,
            height: isDark ? particle.size : particle.size * 2.5,
            borderRadius: isDark ? '50%' : '45% 45% 45% 45%',
            background: isDark 
              ? '#ffffff'
              : 'transparent',
            boxShadow: isDark 
              ? `0 0 ${particle.size * 2}px rgba(255,255,255,0.6)`
              : 'none',
            fontSize: isDark ? 0 : particle.size * 4,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: isDark ? 'transparent' : `rgba(255,${150 + Math.random() * 50},${180 + Math.random() * 40},0.5)`,
          }}
        >
          {!isDark && '💕'}
        </motion.div>
      ))}

      {/* Shooting elements */}
      {shootingElements.map((element) => (
        <motion.div
          key={`shooting-${element.id}`}
          initial={{ 
            x: `${element.startX}vw`, 
            y: `${element.startY}vh`,
            opacity: 0,
          }}
          animate={{
            x: [`${element.startX}vw`, `${element.startX + 55}vw`],
            y: [`${element.startY}vh`, `${element.startY + 35}vh`],
            opacity: [0, 1, 1, 0],
          }}
          transition={{
            duration: element.duration,
            repeat: Infinity,
            delay: element.delay,
            repeatDelay: 10,
            ease: 'easeOut',
          }}
          style={{
            position: 'absolute',
            fontSize: isDark ? 0 : 16,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {isDark ? (
            <>
              <div style={{
                width: 4,
                height: 4,
                borderRadius: '50%',
                background: 'white',
                boxShadow: '0 0 10px white, 0 0 20px white',
              }} />
              {/* Shooting star tail */}
              <div style={{
                position: 'absolute',
                top: 1,
                right: 4,
                width: 60,
                height: 2,
                background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.6), white)',
                transform: 'rotate(-45deg) translateX(30px)',
                transformOrigin: 'right center',
                borderRadius: 2,
              }} />
            </>
          ) : (
            <span style={{ filter: 'drop-shadow(0 0 4px rgba(255,105,180,0.8))' }}>💗</span>
          )}
        </motion.div>
      ))}
    </div>
  )
}
