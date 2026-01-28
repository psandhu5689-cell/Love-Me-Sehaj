import React, { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { IoChevronBack, IoPlay, IoCreate } from 'react-icons/io5'
import { useTheme } from '../context/ThemeContext'
import { useAudio } from '../context/AudioContext'

const STATEMENTS = [
  "I do not miss Prabh.",
  "I would survive without him.",
  "I am not obsessed.",
  "I am normal about him.",
  "I do not want cuddles.",
  "I don't think about him constantly.",
  "I am completely sane.",
  "I don't need his attention.",
  "I could go a day without texting him.",
  "I am not clingy.",
]

const LIE_SUBTEXTS = [
  "Extremely false.",
  "Embarrassingly false.",
  "Nice try though.",
  "Delusion detected.",
  "Not even close.",
  "Laughably untrue.",
  "The machine is crying.",
  "Prabh felt that lie.",
]

export default function LieDetector() {
  const navigate = useNavigate()
  const { colors } = useTheme()
  const { playClick, playMagic } = useAudio()
  const [currentStatement, setCurrentStatement] = useState(STATEMENTS[0])
  const [isScanning, setIsScanning] = useState(false)
  const [showResult, setShowResult] = useState(false)
  const [resultText, setResultText] = useState('')
  const [subText, setSubText] = useState('')
  const [showCustomInput, setShowCustomInput] = useState(false)
  const [customStatement, setCustomStatement] = useState('')
  const [isCustomResult, setIsCustomResult] = useState(false)
  const [showTruthJoke, setShowTruthJoke] = useState(false)
  const [glitchEffect, setGlitchEffect] = useState(false)

  const runTest = (statement: string, isCustom: boolean = false) => {
    playClick()
    setIsScanning(true)
    setShowResult(false)
    setIsCustomResult(isCustom)
    setShowTruthJoke(false)
    setCurrentStatement(statement)

    // Glitch effect during scan
    const glitchInterval = setInterval(() => {
      setGlitchEffect(prev => !prev)
    }, 100)

    setTimeout(() => {
      clearInterval(glitchInterval)
      setGlitchEffect(false)
      setIsScanning(false)
      playMagic()

      // 1% chance of "TRUTH" joke
      const isTruthJoke = !isCustom && Math.random() < 0.01
      
      if (isTruthJoke) {
        setResultText('TRUTH')
        setShowResult(true)
        setTimeout(() => {
          setShowTruthJoke(true)
          setResultText('LIE DETECTED.')
          setSubText('Just kidding. Lie.')
        }, 1500)
      } else {
        setResultText('LIE DETECTED.')
        setSubText(isCustom ? 'LIE DETECTED (especially this one)' : LIE_SUBTEXTS[Math.floor(Math.random() * LIE_SUBTEXTS.length)])
        setShowResult(true)
      }
    }, 2500)
  }

  const nextStatement = () => {
    playClick()
    const currentIndex = STATEMENTS.indexOf(currentStatement)
    const nextIndex = (currentIndex + 1) % STATEMENTS.length
    setCurrentStatement(STATEMENTS[nextIndex])
    setShowResult(false)
  }

  const handleCustomTest = () => {
    if (customStatement.trim()) {
      runTest(customStatement, true)
      setShowCustomInput(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0a0a0a',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Scanlines overlay */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'repeating-linear-gradient(0deg, rgba(0,255,0,0.03) 0px, rgba(0,255,0,0.03) 1px, transparent 1px, transparent 2px)',
        pointerEvents: 'none',
        zIndex: 100,
      }} />

      {/* Glitch effect */}
      {glitchEffect && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,255,0,0.05)',
          pointerEvents: 'none',
          zIndex: 99,
        }} />
      )}

      {/* Back Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        onClick={() => navigate(-1)}
        style={{
          position: 'absolute',
          top: 20,
          left: 16,
          width: 44,
          height: 44,
          borderRadius: 22,
          background: 'rgba(0,255,0,0.1)',
          border: '1px solid rgba(0,255,0,0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          zIndex: 101,
        }}
      >
        <IoChevronBack size={24} color="#00ff00" />
      </motion.button>

      <div style={{ padding: '80px 24px 24px', flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        {/* Title */}
        <motion.h1
          animate={{ opacity: glitchEffect ? 0.5 : 1 }}
          style={{
            color: '#00ff00',
            fontSize: 24,
            fontFamily: 'monospace',
            textAlign: 'center',
            marginBottom: 8,
            textShadow: '0 0 10px #00ff00',
          }}
        >
          SEHAJ CERTIFIED
        </motion.h1>
        <h2 style={{
          color: '#00ff00',
          fontSize: 32,
          fontFamily: 'monospace',
          textAlign: 'center',
          marginBottom: 40,
          textShadow: '0 0 20px #00ff00',
        }}>
          TRUTH MACHINE
        </h2>

        {/* Statement Card */}
        <motion.div
          animate={{ x: glitchEffect ? Math.random() * 4 - 2 : 0 }}
          style={{
            background: 'rgba(0,255,0,0.05)',
            border: '2px solid #00ff00',
            borderRadius: 8,
            padding: 24,
            width: '100%',
            maxWidth: 400,
            marginBottom: 24,
          }}
        >
          <p style={{ color: 'rgba(0,255,0,0.6)', fontSize: 12, fontFamily: 'monospace', marginBottom: 8 }}>
            STATEMENT LOADED:
          </p>
          <p style={{
            color: '#00ff00',
            fontSize: 20,
            fontFamily: 'monospace',
            textAlign: 'center',
            lineHeight: 1.5,
          }}>
            "{currentStatement}"
          </p>
        </motion.div>

        {/* Waveform Animation */}
        {isScanning && (
          <div style={{ marginBottom: 24, width: '100%', maxWidth: 400 }}>
            <div style={{
              height: 60,
              background: 'rgba(0,255,0,0.1)',
              border: '1px solid rgba(0,255,0,0.3)',
              borderRadius: 4,
              overflow: 'hidden',
              position: 'relative',
            }}>
              {/* Animated waveform bars */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 2 }}>
                {[...Array(30)].map((_, i) => (
                  <motion.div
                    key={i}
                    animate={{ height: [10, Math.random() * 50 + 10, 10] }}
                    transition={{ duration: 0.3, repeat: Infinity, delay: i * 0.05 }}
                    style={{
                      width: 4,
                      background: '#00ff00',
                      borderRadius: 2,
                    }}
                  />
                ))}
              </div>
              {/* Scanning bar */}
              <motion.div
                animate={{ x: ['-100%', '100%'] }}
                transition={{ duration: 1, repeat: Infinity }}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '30%',
                  height: '100%',
                  background: 'linear-gradient(90deg, transparent, rgba(0,255,0,0.3), transparent)',
                }}
              />
            </div>
            <p style={{ color: '#00ff00', fontFamily: 'monospace', textAlign: 'center', marginTop: 8 }}>
              ANALYZING...
            </p>
          </div>
        )}

        {/* Result */}
        <AnimatePresence>
          {showResult && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              style={{ textAlign: 'center', marginBottom: 24 }}
            >
              <motion.h2
                animate={{ 
                  textShadow: showTruthJoke ? '0 0 30px #ff0000' : '0 0 30px #00ff00',
                  color: showTruthJoke ? '#ff0000' : (resultText === 'TRUTH' ? '#00ff00' : '#ff0000'),
                }}
                style={{
                  fontSize: 36,
                  fontFamily: 'monospace',
                  marginBottom: 8,
                }}
              >
                {resultText}
              </motion.h2>
              <p style={{
                color: showTruthJoke ? '#ff6666' : 'rgba(255,0,0,0.7)',
                fontFamily: 'monospace',
                fontSize: 14,
              }}>
                {subText}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Buttons */}
        {!isScanning && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: '100%', maxWidth: 300 }}>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => runTest(currentStatement)}
              style={{
                background: 'rgba(0,255,0,0.2)',
                border: '2px solid #00ff00',
                color: '#00ff00',
                padding: '16px 32px',
                borderRadius: 8,
                fontSize: 18,
                fontFamily: 'monospace',
                fontWeight: 'bold',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 10,
                textShadow: '0 0 10px #00ff00',
              }}
            >
              <IoPlay size={24} />
              RUN TEST
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              onClick={nextStatement}
              style={{
                background: 'transparent',
                border: '1px solid rgba(0,255,0,0.3)',
                color: 'rgba(0,255,0,0.7)',
                padding: '12px',
                borderRadius: 8,
                fontSize: 14,
                fontFamily: 'monospace',
                cursor: 'pointer',
              }}
            >
              NEXT STATEMENT
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              onClick={() => setShowCustomInput(true)}
              style={{
                background: 'transparent',
                border: '1px solid rgba(0,255,0,0.3)',
                color: 'rgba(0,255,0,0.7)',
                padding: '12px',
                borderRadius: 8,
                fontSize: 14,
                fontFamily: 'monospace',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
              }}
            >
              <IoCreate size={18} />
              TEST CUSTOM STATEMENT
            </motion.button>
          </div>
        )}
      </div>

      {/* Custom Input Modal */}
      <AnimatePresence>
        {showCustomInput && (
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
              background: 'rgba(0,0,0,0.9)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 24,
              zIndex: 200,
            }}
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              style={{
                background: '#0a0a0a',
                border: '2px solid #00ff00',
                borderRadius: 8,
                padding: 24,
                width: '100%',
                maxWidth: 400,
              }}
            >
              <h3 style={{ color: '#00ff00', fontFamily: 'monospace', marginBottom: 16 }}>
                ENTER CUSTOM STATEMENT:
              </h3>
              <input
                type="text"
                value={customStatement}
                onChange={(e) => setCustomStatement(e.target.value)}
                placeholder="Type any statement..."
                style={{
                  width: '100%',
                  padding: 12,
                  background: 'rgba(0,255,0,0.1)',
                  border: '1px solid rgba(0,255,0,0.3)',
                  borderRadius: 4,
                  color: '#00ff00',
                  fontFamily: 'monospace',
                  fontSize: 16,
                  marginBottom: 16,
                  outline: 'none',
                }}
              />
              <div style={{ display: 'flex', gap: 12 }}>
                <button
                  onClick={() => setShowCustomInput(false)}
                  style={{
                    flex: 1,
                    padding: 12,
                    background: 'transparent',
                    border: '1px solid rgba(0,255,0,0.3)',
                    color: 'rgba(0,255,0,0.7)',
                    borderRadius: 4,
                    fontFamily: 'monospace',
                    cursor: 'pointer',
                  }}
                >
                  CANCEL
                </button>
                <button
                  onClick={handleCustomTest}
                  style={{
                    flex: 1,
                    padding: 12,
                    background: 'rgba(0,255,0,0.2)',
                    border: '2px solid #00ff00',
                    color: '#00ff00',
                    borderRadius: 4,
                    fontFamily: 'monospace',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                  }}
                >
                  TEST
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}