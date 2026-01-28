import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { IoChevronBack, IoSparkles, IoHeart, IoFlash, IoCamera, IoRefresh, IoClose, IoHeartHalf, IoChatbubbles, IoHelpCircle, IoChevronForward, IoFlame, IoSunny, IoGift, IoPlay, IoPause, IoPlaySkipForward, IoPlaySkipBack, IoVolumeHigh, IoVolumeMute } from 'react-icons/io5'
import { useTheme } from '../context/ThemeContext'
import { useAudio } from '../context/AudioContext'
import { useMusic, PLAYLIST } from '../context/MusicContext'

// ============ CONTENT ARRAYS ============

const COMPLIMENTS = [
  "You're my berryboo forever",
  "You're the sweetest soul I know",
  "You're my princess bride",
  "You're my beautiful snowflake",
  "You're my favorite person in every room",
  "You're my poopypants and I love you",
  "You're so soft hearted and precious",
  "You're my crybaby and I wouldn't change that for anything",
  "You're the cutest crybaby on earth",
  "You're so easy to love",
  "You make my whole day better",
  "You're stunning in ways you don't even see",
  "You're my comfort person",
  "You're my peace",
  "You're my happiness",
  "You're my heart",
  "You're my girl",
  "You're so lovable it hurts",
  "You're beautiful inside and out",
  "You're my safe place",
  "You're my favorite human",
  "You're my best decision",
  "You're my dream girl",
  "You're perfect to me",
  "You're my forever",
  "You're my baby",
  "You're my everything",
  "You're my soulmate energy",
  "You're my home",
  "You're loved more than you know",
]

const WHY_I_LOVE_YOU = [
  "I love you because you're so sweet and gentle",
  "I love you because you care so deeply",
  "I love you because you're my crybaby",
  "I love you because you're always there for me",
  "I love you because you believe in me",
  "I love you because you make me laugh",
  "I love you because you make me feel wanted",
  "I love you because you feel like home",
  "I love you because you're so loving",
  "I love you because you're you",
  "I love you because you're patient with me",
  "I love you because you try for us",
  "I love you because you make life better",
  "I love you because you're honest",
  "I love you because you're loyal",
  "I love you because you're adorable",
  "I love you because you support my dreams",
  "I love you because you're soft with me",
  "I love you because you're my girl",
  "I love you because you chose me",
  "I love you because you trust me",
  "I love you because you make me feel special",
  "I love you because you're pure hearted",
  "I love you because you're mine",
  "I love you because forever feels right with you",
]

const CHALLENGES = [
  "Send me a selfie 📸",
  "Tell me one thing you love about yourself",
  "Tell me you love me 💕",
  "Send me a voice note 🎙️",
  "Smile right now 😊",
  "Think about our future for 10 seconds",
  "Send me a heart emoji 💗",
  "Tell me something sweet",
  "Hug me next time you see me 🤗",
  "Think about our first time meeting",
  "Think about our first date",
  "Tell me your favorite nickname",
  "Send me a cute photo",
  "Tell me something you appreciate about us",
  "Think about me before sleeping 🌙",
  "Send me a good morning or good night text",
  "Tell me one thing I do that you like",
  "Imagine our future house 🏠",
  "Think about our wedding for 10 seconds 💒",
  "Tell me what makes you feel loved",
  "Think about holding my hand 🤝",
  "Tell me something you miss about me",
  "Send me a heart",
  "Tell me you're mine",
  "Think about kissing me 💋",
]

const SPECIAL_MOMENTS = [
  "I still remember seeing you at Stampede for the first time",
  "I still remember how nervous I was asking you out",
  "I still remember stressing so hard buying your ring from Pandora",
  "I still remember shopping with Yuvi trying to find you the perfect gift",
  "I still remember falling asleep on call with you after my Paladin shifts",
  "I still remember realizing I was in love with you",
  "I still remember thinking \"she's the one\"",
  "I still remember how you looked the first time we went out",
  "I still remember your smile",
  "I still remember everything",
]

const SAD_MESSAGES = [
  "It's okay sis. Prabh is a bum. He's dumb sometimes. He's mean sometimes. He's rude sometimes. But he loves you more than anything in this world.",
  "Yeah I get mad easily. Yeah I mess up. But I always forgive you. I always come back. I always choose you.",
  "Even when we fight, you're still my girl. Even when we're mad, you're still my forever.",
  "You don't have to be perfect for me. You never did. I fell in love with you as you are.",
  "I know you're hurting right now. But you're not alone. You have me. Always.",
  "I love you on good days. I love you on bad days. I love you on messy days. I love you every day.",
  "We can have a million fights and none of them can break us.",
  "You're stuck with me for life. Sorry.",
  "Even when I'm annoying, I still love you more than anything.",
  "You're my crybaby. And I'll protect my crybaby forever.",
  "You're safe with me. You're loved by me. You're mine.",
  "No matter what happens, I'm not leaving.",
  "I might mess up, but I will always make it right.",
  "You don't have to carry everything alone. Let me hold some of it.",
  "I choose you. Over and over again.",
  "You're not too much. You're not annoying. You're not hard to love.",
  "You're precious to me.",
  "You mean more to me than my ego, my pride, or being right.",
  "Even when we argue, I still look at you and see my future.",
  "I love you more than my bad moods.",
  "You're my favorite person, even when I'm grumpy.",
  "You're my home.",
  "I'm proud of you for surviving today.",
  "You're stronger than you think.",
  "Come here. Let me hug you.",
  "If you're crying right now, wipe those tears. That's my baby.",
  "Nothing you say or do will make me stop loving you.",
  "You're not losing me.",
  "You never lost me.",
  "You will never lose me.",
  "I'm yours.",
  "You're mine.",
  "We're forever whether we like it or not.",
  "You don't have to figure life out today.",
  "Breathe. I got you.",
  "You're allowed to have bad days.",
  "You're allowed to be tired.",
  "You're allowed to be sad.",
  "And I still love you through all of it.",
  "I love you more than words can explain.",
]

const CATEGORIES = [
  { id: 'compliment', title: 'Compliments', icon: IoSparkles, color: '#FF6B9D', data: COMPLIMENTS, emoji: '💫' },
  { id: 'love', title: 'Why I Love You', icon: IoHeart, color: '#E91E63', data: WHY_I_LOVE_YOU, emoji: '❤️' },
  { id: 'challenge', title: 'Challenges', icon: IoFlash, color: '#FF9800', data: CHALLENGES, emoji: '⚡' },
  { id: 'moment', title: 'Memories', icon: IoCamera, color: '#4CAF50', data: SPECIAL_MOMENTS, emoji: '📸' },
]

// Video for the jukebox CD art
const JUKEBOX_VIDEO = 'https://customer-assets.emergentagent.com/job_romance-theme/artifacts/04jb8vk3_5744FE7D-DE20-40FB-94A9-C39CB3EDC595.MOV'

// Would You Rather questions
const WOULD_YOU_RATHER = [
  { a: "Go on a fancy dinner date", b: "Have a cozy movie night at home" },
  { a: "Receive a handwritten love letter", b: "Get a surprise gift" },
  { a: "Spend a day at the beach together", b: "Go on a mountain hike" },
  { a: "Have breakfast in bed", b: "Have a midnight snack run" },
  { a: "Dance in the rain together", b: "Watch the sunset" },
  { a: "Travel the world together", b: "Build our dream home" },
  { a: "Get matching tattoos", b: "Have matching outfits" },
  { a: "Have a surprise party thrown for you", b: "Plan a surprise for me" },
  { a: "Rewatch our first date", b: "Fast forward to our wedding" },
  { a: "Kiss under the stars", b: "Kiss in the rain" },
]

// Heart to Heart prompts
const HEART_TO_HEART = [
  "What made you smile today?",
  "Is there anything on your mind you want to talk about?",
  "What's one thing I can do to make you feel more loved?",
  "What's something you appreciate about us?",
  "Is there anything you've been wanting to tell me?",
  "How are you feeling about us lately?",
  "What's your favorite memory of us?",
  "What do you need from me right now?",
  "Is there anything I did that hurt you that we haven't talked about?",
  "What are you grateful for today?",
]

export default function DailyLove() {
  const navigate = useNavigate()
  const { colors, isDark } = useTheme()
  const { playClick, playMagic } = useAudio()
  const [selectedCategory, setSelectedCategory] = useState<typeof CATEGORIES[0] | null>(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [showSadMode, setShowSadMode] = useState(false)
  const [sadMessage, setSadMessage] = useState('')
  const [streak, setStreak] = useState(0)

  useEffect(() => {
    // Load streak from localStorage
    const storedStreak = localStorage.getItem('dailyLove_streak')
    if (storedStreak) setStreak(parseInt(storedStreak, 10))
  }, [])

  const handleCategorySelect = (category: typeof CATEGORIES[0]) => {
    playClick()
    setSelectedCategory(category)
    setCurrentIndex(Math.floor(Math.random() * category.data.length))
  }

  const getNextContent = () => {
    if (!selectedCategory) return
    playMagic()
    setCurrentIndex((prev) => (prev + 1) % selectedCategory.data.length)
  }

  const goBackToMenu = () => {
    playClick()
    setSelectedCategory(null)
  }

  const handleNeedHug = () => {
    playMagic()
    setShowSadMode(true)
    setSadMessage(SAD_MESSAGES[Math.floor(Math.random() * SAD_MESSAGES.length)])
  }

  const handleNextSadMessage = () => {
    playClick()
    setSadMessage(SAD_MESSAGES[Math.floor(Math.random() * SAD_MESSAGES.length)])
  }

  // ============ SAD MODE ============
  if (showSadMode) {
    return (
      <div style={{
        minHeight: '100vh',
        background: isDark ? '#1A0D1A' : colors.background,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        position: 'relative',
      }}>
        <motion.button
          whileHover={{ scale: 1.1 }}
          onClick={() => setShowSadMode(false)}
          style={{
            position: 'absolute',
            top: 50,
            right: 20,
            background: colors.card,
            border: 'none',
            borderRadius: 20,
            padding: 8,
            cursor: 'pointer',
          }}
        >
          <IoClose size={28} color={colors.primary} />
        </motion.button>

        <IoHeart size={60} color={colors.primary} />
        <h1 style={{ color: colors.textPrimary, fontSize: 28, fontWeight: 600, marginTop: 16 }}>
          I'm here for you 💗
        </h1>

        <motion.div
          key={sadMessage}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            background: colors.card,
            border: `1px solid ${colors.border}`,
            borderRadius: 20,
            padding: 24,
            margin: '30px 0',
            maxWidth: 400,
            boxShadow: `0 0 40px ${colors.primaryGlow}`,
          }}
        >
          <p style={{
            color: colors.textPrimary,
            fontSize: 20,
            textAlign: 'center',
            lineHeight: 1.6,
            fontStyle: 'italic',
          }}>
            {sadMessage}
          </p>
        </motion.div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleNextSadMessage}
          style={{
            background: colors.primary,
            border: 'none',
            color: 'white',
            padding: '12px 24px',
            borderRadius: 25,
            fontSize: 16,
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            marginBottom: 40,
          }}
        >
          Another message
          <IoRefresh size={18} />
        </motion.button>

        <p style={{ color: colors.textSecondary, fontSize: 14, textAlign: 'center', fontStyle: 'italic' }}>
          I love you. I'm not going anywhere.<br />
          You're my girl. Forever.
        </p>
      </div>
    )
  }

  // ============ CATEGORY CONTENT VIEW ============
  if (selectedCategory) {
    return (
      <div style={{
        minHeight: '100vh',
        background: colors.background,
        display: 'flex',
        flexDirection: 'column',
        padding: '80px 24px 24px',
        position: 'relative',
      }}>
        <motion.button
          whileHover={{ scale: 1.05 }}
          onClick={goBackToMenu}
          style={{
            position: 'absolute',
            top: 20,
            left: 16,
            width: 44,
            height: 44,
            borderRadius: 22,
            background: colors.card,
            border: `1px solid ${colors.border}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
          }}
        >
          <IoChevronBack size={24} color={colors.primary} />
        </motion.button>

        <h2 style={{ color: colors.textPrimary, fontSize: 18, fontWeight: 600, textAlign: 'center' }}>
          {selectedCategory.emoji} {selectedCategory.title}
        </h2>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{
              background: colors.card,
              border: `2px solid ${selectedCategory.color}`,
              borderRadius: 20,
              padding: 24,
              marginBottom: 24,
              maxWidth: 400,
              width: '100%',
              boxShadow: `0 0 40px ${selectedCategory.color}30`,
            }}
          >
            <div style={{
              width: 80,
              height: 80,
              borderRadius: 40,
              background: `${selectedCategory.color}20`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px',
            }}>
              {React.createElement(selectedCategory.icon, { size: 40, color: selectedCategory.color })}
            </div>

            <p style={{
              color: colors.textPrimary,
              fontSize: 22,
              textAlign: 'center',
              lineHeight: 1.5,
              fontWeight: 500,
            }}>
              {selectedCategory.data[currentIndex]}
            </p>
          </motion.div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={getNextContent}
            style={{
              background: selectedCategory.color,
              border: 'none',
              color: 'white',
              padding: '14px 28px',
              borderRadius: 25,
              fontSize: 16,
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              boxShadow: `0 4px 15px ${selectedCategory.color}40`,
            }}
          >
            Next
            <IoRefresh size={20} />
          </motion.button>
        </div>
      </div>
    )
  }

  // ============ MAIN MENU ============
  return (
    <div style={{
      minHeight: '100vh',
      background: colors.background,
      padding: '80px 20px 40px',
      position: 'relative',
      overflowY: 'auto',
    }}>
      {/* Header */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        padding: '16px',
        background: colors.background,
        zIndex: 100,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <motion.button
          whileHover={{ scale: 1.05 }}
          onClick={() => { playClick(); navigate('/'); }}
          style={{
            width: 44,
            height: 44,
            borderRadius: 22,
            background: colors.card,
            border: `1px solid ${colors.border}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
          }}
        >
          <IoChevronBack size={24} color={colors.primary} />
        </motion.button>

        <div style={{
          background: colors.glass,
          padding: '6px 12px',
          borderRadius: 20,
          display: 'flex',
          alignItems: 'center',
          gap: 4,
        }}>
          <IoFlame size={20} color="#FF9800" />
          <span style={{ color: '#FF9800', fontSize: 14, fontWeight: 600 }}>{streak} days</span>
        </div>
      </div>

      {/* Title */}
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <h1 style={{ color: colors.textPrimary, fontSize: 32, fontWeight: 600, marginBottom: 4 }}>
          Daily Love 💗
        </h1>
        <p style={{ color: colors.textSecondary, fontSize: 16 }}>Choose an activity</p>
      </div>

      {/* Category Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: 12,
        marginBottom: 24,
      }}>
        {CATEGORIES.map((cat) => {
          const Icon = cat.icon
          return (
            <motion.button
              key={cat.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleCategorySelect(cat)}
              style={{
                background: colors.card,
                border: `2px solid ${cat.color}`,
                borderRadius: 16,
                padding: 16,
                cursor: 'pointer',
                textAlign: 'center',
              }}
            >
              <div style={{
                width: 60,
                height: 60,
                borderRadius: 30,
                background: `${cat.color}20`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 12px',
              }}>
                <Icon size={32} color={cat.color} />
              </div>
              <p style={{ color: colors.textPrimary, fontSize: 14, fontWeight: 600, marginBottom: 4 }}>
                {cat.emoji} {cat.title}
              </p>
              <p style={{ color: colors.textMuted, fontSize: 12 }}>
                {cat.data.length} items
              </p>
            </motion.button>
          )
        })}
      </div>

      {/* More Activities */}
      <div style={{ marginBottom: 24 }}>
        <p style={{ color: colors.textSecondary, fontSize: 14, fontWeight: 600, marginBottom: 12 }}>
          More Activities
        </p>

        {[
          { title: 'Heart to Heart 💕', subtitle: 'Our apology & repair space', icon: IoChatbubbles, color: colors.primary },
          { title: 'Would You Rather 🎲', subtitle: 'Fun couples game', icon: IoHelpCircle, color: colors.secondary },
          { title: "Who's Right? 🪙", subtitle: 'Flip a coin to decide', icon: null, emoji: '🪙', color: '#FFD700' },
          { title: 'Together For 🕯', subtitle: 'Our time together', icon: null, emoji: '🕯', color: colors.primary },
        ].map((item, index) => (
          <motion.div
            key={index}
            whileHover={{ scale: 1.01 }}
            style={{
              background: colors.card,
              border: `1px solid ${colors.border}`,
              borderRadius: 16,
              padding: 16,
              marginBottom: 12,
              display: 'flex',
              alignItems: 'center',
              cursor: 'pointer',
            }}
          >
            <div style={{
              width: 50,
              height: 50,
              borderRadius: 25,
              background: `${item.color}20`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              {item.icon ? <item.icon size={28} color={item.color} /> : <span style={{ fontSize: 26 }}>{item.emoji}</span>}
            </div>
            <div style={{ flex: 1, marginLeft: 14 }}>
              <p style={{ color: colors.textPrimary, fontSize: 16, fontWeight: 600 }}>{item.title}</p>
              <p style={{ color: colors.textSecondary, fontSize: 13 }}>{item.subtitle}</p>
            </div>
            <IoChevronForward size={24} color={colors.textMuted} />
          </motion.div>
        ))}
      </div>

      {/* Need a Hug */}
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleNeedHug}
          style={{
            background: colors.secondary,
            border: 'none',
            color: 'white',
            padding: '14px 24px',
            borderRadius: 30,
            fontSize: 16,
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            margin: '0 auto',
            boxShadow: `0 4px 15px ${colors.secondaryGlow}`,
          }}
        >
          <IoHeartHalf size={24} />
          Need a bigger hug?
        </motion.button>
        <p style={{ color: colors.textMuted, fontSize: 12, marginTop: 8, fontStyle: 'italic' }}>
          (when your sad and being my silly crybaby)
        </p>
      </div>

      {/* Valentine's Journey */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        onClick={() => { playClick(); navigate('/personalization'); }}
        style={{
          background: 'transparent',
          border: 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          padding: '12px',
          cursor: 'pointer',
          margin: '0 auto',
        }}
      >
        <IoGift size={18} color={colors.textSecondary} />
        <span style={{ color: colors.textSecondary, fontSize: 14, fontWeight: 500 }}>
          Start Valentine's Journey
        </span>
      </motion.button>
    </div>
  )
}
