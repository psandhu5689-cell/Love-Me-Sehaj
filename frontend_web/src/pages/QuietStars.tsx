import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { IoVolumeHigh, IoPlay, IoPause, IoHome, IoHeart } from 'react-icons/io5'
import { useTheme } from '../context/ThemeContext'
import { useMusic } from '../context/MusicContext'
import { Howl } from 'howler'

const WHISPER_AUDIO = 'https://customer-assets.emergentagent.com/job_sehaj-love/artifacts/n3ojmbeq_e6d8893a.mp3'

interface Star {
  id: number
  x: number
  y: number
  size: number
  delay: number
}

const generateStars = (): Star[] => {
  return Array.from({ length: 100 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 3 + 1,
    delay: Math.random() * 2,
  }))
}

export default function QuietStars() {
  const navigate = useNavigate()
  const { toggleMute, isMuted } = useMusic()
  const [stars] = useState<Star[]>(generateStars)
  const [isPlaying, setIsPlaying] = useState(false)
  const [audioLoaded, setAudioLoaded] = useState(false)
  const soundRef = useRef<Howl | null>(null)
  const wasMutedRef = useRef(isMuted)

  useEffect(() => {
    wasMutedRef.current = isMuted
    if (!isMuted) toggleMute()

    // Load and auto-play audio
    soundRef.current = new Howl({
      src: [WHISPER_AUDIO],
      html5: true,
      volume: 1.0,
      onload: () => {
        setAudioLoaded(true)
        soundRef.current?.play()
        setIsPlaying(true)
      },
      onend: () => {
        setIsPlaying(false)
      },
    })

    return () => {
      soundRef.current?.unload()
      if (!wasMutedRef.current) toggleMute()
    }
  }, [])

  const togglePlay = () => {
    if (!soundRef.current) return
    
    if (isPlaying) {
      soundRef.current.pause()
      setIsPlaying(false)
    } else {
      soundRef.current.seek(0)
      soundRef.current.play()
      setIsPlaying(true)
    }
  }

  const handleGoBack = () => {
    navigate('/')
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 2 }}
      style={{
        minHeight: '100vh',
        background: '#0a0a1a',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Stars */}
      {stars.map((star) => (
        <motion.div
          key={star.id}
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 2 + Math.random() * 2, repeat: Infinity, delay: star.delay }}
          style={{
            position: 'absolute',
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: star.size,
            height: star.size,
            borderRadius: '50%',
            background: '#FFFFFF',
          }}
        />
      ))}

      {/* Shooting stars */}
      <div style={{
        position: 'absolute',
        top: '20%',
        left: '10%',
        width: 100,
        height: 1,
        background: 'rgba(255,255,255,0.3)',
        transform: 'rotate(45deg)',
      }} />

      <div style={{
        position: 'absolute',
        top: '60%',
        right: '20%',
        width: 80,
        height: 1,
        background: 'rgba(255,255,255,0.2)',
        transform: 'rotate(45deg)',
      }} />

      {/* Content */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 1.5 }}
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 40,
          position: 'relative',
          zIndex: 10,
        }}
      >
        <IoVolumeHigh size={40} color="rgba(255,255,255,0.6)" />
        
        <h1 style={{
          fontSize: 32,
          fontWeight: 300,
          color: 'rgba(255,255,255,0.9)',
          marginTop: 20,
          letterSpacing: 4,
        }}>
          volume up
        </h1>
        
        <p style={{
          fontSize: 18,
          fontWeight: 300,
          color: 'rgba(255,255,255,0.6)',
          marginTop: 8,
          fontStyle: 'italic',
          letterSpacing: 2,
        }}>
          i'm whispering...
        </p>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={togglePlay}
          style={{
            width: 100,
            height: 100,
            borderRadius: 50,
            background: 'rgba(232,99,143,0.3)',
            border: '2px solid rgba(255,255,255,0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            marginTop: 50,
          }}
        >
          {isPlaying ? (
            <IoPause size={50} color="#FFFFFF" />
          ) : (
            <IoPlay size={50} color="#FFFFFF" style={{ marginLeft: 5 }} />
          )}
        </motion.button>

        <p style={{
          fontSize: 14,
          color: 'rgba(255,255,255,0.4)',
          marginTop: 20,
          fontStyle: 'italic',
        }}>
          {isPlaying ? 'listening...' : 'tap to hear my voice'}
        </p>

        <IoHeart size={20} color="rgba(232,99,143,0.5)" style={{ marginTop: 40 }} />

        <p style={{
          fontSize: 14,
          color: 'rgba(255,255,255,0.4)',
          fontStyle: 'italic',
          marginTop: 40,
        }}>
          for you, always 💕
        </p>

        {/* Back to Start Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleGoBack}
          style={{
            marginTop: 20,
            background: 'linear-gradient(135deg, #FF6B9D, #C44569)',
            border: 'none',
            borderRadius: 25,
            padding: '12px 24px',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            cursor: 'pointer',
          }}
        >
          <IoHome size={18} color="#FFFFFF" />
          <span style={{ color: '#FFFFFF', fontSize: 14, fontWeight: 600 }}>Back to Start</span>
        </motion.button>
      </motion.div>
    </motion.div>
  )
}