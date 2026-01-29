import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { IoChevronBack, IoSparkles, IoHeart, IoFlash, IoCamera, IoRefresh, IoClose, IoHeartHalf, IoChatbubbles, IoHelpCircle, IoChevronForward, IoFlame, IoSunny, IoGift, IoPlay, IoPause, IoPlaySkipForward, IoPlaySkipBack, IoVolumeHigh, IoVolumeMute, IoCheckmark, IoTime } from 'react-icons/io5'
import { useTheme } from '../context/ThemeContext'
import { useAudio } from '../context/AudioContext'
import { useMusic, PLAYLIST } from '../context/MusicContext'
import { usePresence } from '../context/PresenceContext'
import haptics from '../utils/haptics'

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

// Would You Rather questions (35 total)
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
  // NEW QUESTIONS (25 more)
  { a: "Cuddle all day", b: "Go on an adventure together" },
  { a: "Have breakfast together every morning", b: "Have late night talks every night" },
  { a: "Hold hands everywhere", b: "Steal kisses randomly" },
  { a: "Make each other laugh", b: "Comfort each other when sad" },
  { a: "Cook a meal together", b: "Order takeout and binge watch shows" },
  { a: "Share one hoodie forever", b: "Have matching jewelry" },
  { a: "Take a road trip with no destination", b: "Plan every detail of a vacation" },
  { a: "Dance to our favorite song", b: "Sing karaoke together" },
  { a: "Have a picnic in the park", b: "Have a candlelit dinner at home" },
  { a: "Wake up early to watch sunrise together", b: "Stay up late to watch stars" },
  { a: "Take silly photos together", b: "Have professional couple photoshoot" },
  { a: "Write love notes to each other", b: "Record voice memos saying I love you" },
  { a: "Build pillow forts together", b: "Have water balloon fights" },
  { a: "Go to a fancy event dressed up", b: "Stay home in matching pajamas" },
  { a: "Learn a new skill together", b: "Teach each other something" },
  { a: "Have a spa day at home", b: "Go to an actual spa together" },
  { a: "Plant a garden together", b: "Adopt a pet together" },
  { a: "Make a scrapbook of memories", b: "Create a digital photo album" },
  { a: "Have a game night", b: "Have a movie marathon" },
  { a: "Go to a concert together", b: "Have a private dance party at home" },
  { a: "Take a cooking class together", b: "Take a dance class together" },
  { a: "Go stargazing on a blanket", b: "Watch fireworks together" },
  { a: "Have breakfast for dinner", b: "Have dessert for breakfast" },
  { a: "Play in the snow together", b: "Splash in puddles after rain" },
  { a: "Read the same book and discuss it", b: "Watch the same show and react together" },
]

// Heart to Heart prompts (60 total)
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
  // NEW QUESTIONS (50 more)
  "What's been weighing on your heart lately?",
  "When do you feel most loved by me?",
  "Is there something you wish we did more often?",
  "What's a fear you have about our relationship?",
  "What makes you feel safe with me?",
  "Is there anything you've been holding back from saying?",
  "What's something small I do that means a lot to you?",
  "How can I support you better right now?",
  "What's a moment when you felt truly understood by me?",
  "Is there a way I can be more present with you?",
  "What's something you want us to work on together?",
  "When was the last time you felt really connected to me?",
  "What's a dream you have for our future?",
  "Is there something you need reassurance about?",
  "What's a quality about me that you admire?",
  "How do you feel when we're apart?",
  "What's something you're proud of us for?",
  "Is there a conversation we've been avoiding?",
  "What makes you feel most yourself around me?",
  "What's a way I've grown since we've been together?",
  "Is there something you wish I knew without you having to say it?",
  "What's a moment you felt really proud of me?",
  "How can I show you love in the way you need it most?",
  "What's something that's been making you anxious?",
  "When do you feel most comfortable opening up to me?",
  "What's a boundary you wish we had?",
  "Is there something you miss from earlier in our relationship?",
  "What's a way we've overcome something difficult together?",
  "What do you love most about how we communicate?",
  "Is there something you've been afraid to ask me?",
  "What's a song or movie that reminds you of us?",
  "How do you feel about where we're headed?",
  "What's something I do that makes you feel special?",
  "Is there a way I can be gentler with you?",
  "What's a goal you have for yourself that I can support?",
  "When did you last feel overwhelmed, and how can I help?",
  "What's something you want me to know about your past?",
  "How do you like to be comforted when you're upset?",
  "What's a tradition you want us to start?",
  "Is there something you're excited about in our future?",
  "What's a way I can make you feel more appreciated?",
  "How do you feel about the pace of our relationship?",
  "What's something you're insecure about that I can help with?",
  "When do you feel most attracted to me?",
  "What's a way we can spend more quality time together?",
  "Is there something about me you're curious about?",
  "What's a compliment you wish you heard more often?",
  "How can I be a better partner to you?",
  "What's something that makes you feel disconnected from me?",
  "What's a moment when you felt really cherished by me?",
]

export default function DailyLove() {
  const navigate = useNavigate()
  const { colors, isDark } = useTheme()
  const { playClick, playMagic, playPop } = useAudio()
  const { currentTrack, isPlaying, isMuted, togglePlayPause, toggleMute, nextTrack, previousTrack } = useMusic()
  const { addHeartToHeart, heartToHeartHistory, getTimeAgo, currentUser } = usePresence()
  const [selectedCategory, setSelectedCategory] = useState<typeof CATEGORIES[0] | null>(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [showSadMode, setShowSadMode] = useState(false)
  const [sadMessage, setSadMessage] = useState('')
  const [streak, setStreak] = useState(0)
  
  // New states for activities
  const [showWouldYouRather, setShowWouldYouRather] = useState(false)
  const [wyrIndex, setWyrIndex] = useState(0)
  const [wyrMyChoice, setWyrMyChoice] = useState<'a' | 'b' | null>(null)
  const [wyrOtherChoice, setWyrOtherChoice] = useState<'a' | 'b' | null>(null)
  const [showHeartToHeart, setShowHeartToHeart] = useState(false)
  const [hthIndex, setHthIndex] = useState(0)
  const [showHTHHistory, setShowHTHHistory] = useState(false)
  const [showCoinFlip, setShowCoinFlip] = useState(false)
  const [coinResult, setCoinResult] = useState<string | null>(null)
  const [isFlipping, setIsFlipping] = useState(false)
  const [coinTally, setCoinTally] = useState({ prabh: 0, sehaj: 0 })
  const [showTimeTogether, setShowTimeTogether] = useState(false)
  
  // Sad mode states - MUST be at top level (Rules of Hooks)
  const [kissDelivered, setKissDelivered] = useState(false)
  const [hugProgress, setHugProgress] = useState(0)
  const [isHugging, setIsHugging] = useState(false)
  const [hugComplete, setHugComplete] = useState(false)
  const [floatingHearts, setFloatingHearts] = useState<Array<{id: number, x: number, y: number}>>([])
  const [sadMessageIndex, setSadMessageIndex] = useState(0)
  const hugIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  
  // Calculate time together 
  // UPDATED DATES: Talking since Feb 26 2025, Dating since July 11 2025
  const talkingStartDate = new Date('2025-02-26')
  const datingStartDate = new Date('2025-07-11')
  const now = new Date()
  const talkingDiff = now.getTime() - talkingStartDate.getTime()
  const datingDiff = now.getTime() - datingStartDate.getTime()
  const daysTalking = Math.floor(talkingDiff / (1000 * 60 * 60 * 24))
  const daysDating = Math.max(0, Math.floor(datingDiff / (1000 * 60 * 60 * 24)))
  // Use daysDating if after July 11, otherwise show talking days
  const daysTogether = daysDating > 0 ? daysDating : daysTalking

  useEffect(() => {
    // Load streak from localStorage
    const storedStreak = localStorage.getItem('dailyLove_streak')
    if (storedStreak) setStreak(parseInt(storedStreak, 10))
    
    // Load coin flip tally from localStorage
    const storedTally = localStorage.getItem('coinFlip_tally')
    if (storedTally) {
      setCoinTally(JSON.parse(storedTally))
    }
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

  // Activity handlers
  const handleOpenWYR = () => {
    playClick()
    setWyrIndex(Math.floor(Math.random() * WOULD_YOU_RATHER.length))
    setWyrMyChoice(null)
    setWyrOtherChoice(null)
    setShowWouldYouRather(true)
  }

  const handleNextWYR = () => {
    playClick()
    setWyrIndex((prev) => (prev + 1) % WOULD_YOU_RATHER.length)
    setWyrMyChoice(null)
    setWyrOtherChoice(null)
  }
  
  const handleWYRChoice = (choice: 'a' | 'b') => {
    playMagic()
    setWyrMyChoice(choice)
    // Simulate other person's choice (random for now)
    setTimeout(() => {
      setWyrOtherChoice(Math.random() > 0.5 ? 'a' : 'b')
    }, 800)
  }

  const handleOpenHTH = () => {
    playClick()
    setHthIndex(Math.floor(Math.random() * HEART_TO_HEART.length))
    setShowHeartToHeart(true)
  }

  const handleNextHTH = () => {
    playClick()
    setHthIndex((prev) => (prev + 1) % HEART_TO_HEART.length)
  }

  const handleCoinFlip = () => {
    playClick()
    setShowCoinFlip(true)
    setCoinResult(null)
  }

  const flipCoin = () => {
    if (isFlipping) return
    playMagic()
    setIsFlipping(true)
    setCoinResult(null)
    
    setTimeout(() => {
      const winner = Math.random() > 0.5 ? 'sehaj' : 'prabh'
      const newTally = {
        ...coinTally,
        [winner]: coinTally[winner] + 1
      }
      setCoinTally(newTally)
      localStorage.setItem('coinFlip_tally', JSON.stringify(newTally))
      
      setCoinResult(winner === 'sehaj' ? 'Sehaj is Right! 👑' : 'Prabh is Right! 🏆')
      setIsFlipping(false)
    }, 1500)
  }

  const handleOpenTimeTogether = () => {
    playClick()
    setShowTimeTogether(true)
  }

  // ============ WOULD YOU RATHER ============
  if (showWouldYouRather) {
    const wyr = WOULD_YOU_RATHER[wyrIndex]
    return (
      <div style={{
        minHeight: '100vh',
        background: colors.background,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        position: 'relative',
      }}>
        <motion.button
          whileHover={{ scale: 1.1 }}
          onClick={() => setShowWouldYouRather(false)}
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

        <span style={{ fontSize: 60 }}>🎲</span>
        <h1 style={{ color: colors.textPrimary, fontSize: 24, fontWeight: 600, marginTop: 16, marginBottom: 30 }}>
          Would You Rather?
        </h1>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, width: '100%', maxWidth: 350 }}>
          <motion.button
            whileHover={{ scale: wyrMyChoice ? 1 : 1.02 }}
            whileTap={{ scale: wyrMyChoice ? 1 : 0.98 }}
            onClick={() => !wyrMyChoice && handleWYRChoice('a')}
            disabled={!!wyrMyChoice}
            style={{
              background: wyrMyChoice === 'a' 
                ? `linear-gradient(135deg, ${colors.primary}, #ff8fab)`
                : wyrOtherChoice === 'a' && wyrMyChoice
                ? 'rgba(255, 107, 157, 0.3)'
                : `linear-gradient(135deg, ${colors.primary}, #ff8fab)`,
              borderRadius: 16,
              padding: 20,
              cursor: wyrMyChoice ? 'default' : 'pointer',
              border: wyrMyChoice === 'a' ? '3px solid #FFD700' : wyrOtherChoice === 'a' && wyrMyChoice ? '3px solid rgba(255, 215, 0, 0.5)' : 'none',
              position: 'relative',
              opacity: wyrMyChoice && wyrMyChoice !== 'a' ? 0.5 : 1,
            }}
          >
            <p style={{ color: 'white', fontSize: 18, textAlign: 'center', fontWeight: 500 }}>
              {wyr.a}
            </p>
            {wyrMyChoice === 'a' && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                style={{
                  position: 'absolute',
                  top: -10,
                  right: -10,
                  background: '#FFD700',
                  borderRadius: '50%',
                  padding: 8,
                  boxShadow: '0 4px 12px rgba(255, 215, 0, 0.4)',
                }}
              >
                <IoCheckmark size={20} color="white" />
              </motion.div>
            )}
            {wyrOtherChoice === 'a' && wyrMyChoice && (
              <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: 12, marginTop: 8, fontStyle: 'italic' }}>
                {currentUser === 'prabh' ? '✨ Sehaj picked this' : '🏆 Prabh picked this'}
              </p>
            )}
          </motion.button>

          <p style={{ color: colors.textMuted, textAlign: 'center', fontSize: 14 }}>OR</p>

          <motion.button
            whileHover={{ scale: wyrMyChoice ? 1 : 1.02 }}
            whileTap={{ scale: wyrMyChoice ? 1 : 0.98 }}
            onClick={() => !wyrMyChoice && handleWYRChoice('b')}
            disabled={!!wyrMyChoice}
            style={{
              background: wyrMyChoice === 'b'
                ? `linear-gradient(135deg, ${colors.secondary}, #9d4edd)`
                : wyrOtherChoice === 'b' && wyrMyChoice
                ? 'rgba(157, 78, 221, 0.3)'
                : `linear-gradient(135deg, ${colors.secondary}, #9d4edd)`,
              borderRadius: 16,
              padding: 20,
              cursor: wyrMyChoice ? 'default' : 'pointer',
              border: wyrMyChoice === 'b' ? '3px solid #FFD700' : wyrOtherChoice === 'b' && wyrMyChoice ? '3px solid rgba(255, 215, 0, 0.5)' : 'none',
              position: 'relative',
              opacity: wyrMyChoice && wyrMyChoice !== 'b' ? 0.5 : 1,
            }}
          >
            <p style={{ color: 'white', fontSize: 18, textAlign: 'center', fontWeight: 500 }}>
              {wyr.b}
            </p>
            {wyrMyChoice === 'b' && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                style={{
                  position: 'absolute',
                  top: -10,
                  right: -10,
                  background: '#FFD700',
                  borderRadius: '50%',
                  padding: 8,
                  boxShadow: '0 4px 12px rgba(255, 215, 0, 0.4)',
                }}
              >
                <IoCheckmark size={20} color="white" />
              </motion.div>
            )}
            {wyrOtherChoice === 'b' && wyrMyChoice && (
              <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: 12, marginTop: 8, fontStyle: 'italic' }}>
                {currentUser === 'prabh' ? '✨ Sehaj picked this' : '🏆 Prabh picked this'}
              </p>
            )}
          </motion.button>
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleNextWYR}
          style={{
            marginTop: 30,
            background: colors.card,
            border: `2px solid ${colors.primary}`,
            color: colors.primary,
            padding: '12px 24px',
            borderRadius: 25,
            fontSize: 16,
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          Next Question
          <IoRefresh size={18} />
        </motion.button>
      </div>
    )
  }

  // ============ HEART TO HEART ============
  if (showHeartToHeart) {
    const handleSavePrompt = () => {
      addHeartToHeart(HEART_TO_HEART[hthIndex])
      playMagic()
    }

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
        {/* Close Button */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          onClick={() => setShowHeartToHeart(false)}
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

        {/* History Button */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          onClick={() => setShowHTHHistory(true)}
          style={{
            position: 'absolute',
            top: 50,
            left: 20,
            background: colors.card,
            border: 'none',
            borderRadius: 20,
            padding: 8,
            cursor: 'pointer',
          }}
        >
          <IoTime size={28} color={colors.primary} />
        </motion.button>

        <IoHeart size={60} color={colors.primary} />
        <h1 style={{ color: colors.textPrimary, fontSize: 24, fontWeight: 600, marginTop: 16 }}>
          Heart to Heart 💕
        </h1>
        <p style={{ color: colors.textSecondary, fontSize: 14, marginBottom: 30 }}>
          Our repair & connection space
        </p>

        <motion.div
          key={hthIndex}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            background: colors.card,
            border: `2px solid ${colors.primary}`,
            borderRadius: 20,
            padding: 24,
            maxWidth: 350,
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
            {HEART_TO_HEART[hthIndex]}
          </p>
        </motion.div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: 12, marginTop: 30 }}>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSavePrompt}
            style={{
              background: colors.card,
              border: `2px solid ${colors.secondary}`,
              color: colors.secondary,
              padding: '12px 20px',
              borderRadius: 25,
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <IoCheckmark size={18} />
            We Talked About This
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleNextHTH}
            style={{
              background: colors.primary,
              border: 'none',
              color: 'white',
              padding: '12px 24px',
              borderRadius: 25,
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            Next
            <IoRefresh size={18} />
          </motion.button>
        </div>

        {/* History Modal */}
        <AnimatePresence>
          {showHTHHistory && (
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
                background: 'rgba(0,0,0,0.8)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 100,
                padding: 20,
              }}
              onClick={() => setShowHTHHistory(false)}
            >
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.9 }}
                onClick={(e) => e.stopPropagation()}
                style={{
                  background: colors.card,
                  borderRadius: 20,
                  padding: 24,
                  maxWidth: 380,
                  width: '100%',
                  maxHeight: '70vh',
                  overflow: 'auto',
                }}
              >
                <h3 style={{ color: colors.textPrimary, fontSize: 18, fontWeight: 600, marginBottom: 16 }}>
                  💬 Conversation History
                </h3>

                {heartToHeartHistory.length === 0 ? (
                  <p style={{ color: colors.textMuted, textAlign: 'center', padding: 20 }}>
                    No conversations saved yet.<br />Mark prompts as discussed to save them here.
                  </p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {heartToHeartHistory.map((entry, index) => (
                      <div
                        key={index}
                        style={{
                          background: colors.glass,
                          borderRadius: 12,
                          padding: 12,
                          borderLeft: `3px solid ${entry.user === 'sehaj' ? colors.primary : '#6B5B95'}`,
                        }}
                      >
                        <p style={{ color: colors.textPrimary, fontSize: 14, marginBottom: 6 }}>
                          "{entry.prompt}"
                        </p>
                        <p style={{ color: colors.textMuted, fontSize: 11 }}>
                          {entry.user === 'sehaj' ? '❄️ Sehaj' : '👨‍💻 Prabh'} • {getTimeAgo(entry.timestamp)}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowHTHHistory(false)}
                  style={{
                    marginTop: 16,
                    width: '100%',
                    background: colors.primary,
                    border: 'none',
                    color: 'white',
                    padding: '12px',
                    borderRadius: 12,
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Close
                </motion.button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    )
  }

  // ============ COIN FLIP ============
  if (showCoinFlip) {
    return (
      <div style={{
        minHeight: '100vh',
        background: colors.background,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        position: 'relative',
      }}>
        <motion.button
          whileHover={{ scale: 1.1 }}
          onClick={() => setShowCoinFlip(false)}
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

        <h1 style={{ color: colors.textPrimary, fontSize: 24, fontWeight: 600, marginBottom: 16 }}>
          Who's Right? 🪙
        </h1>
        
        {/* Tally Display */}
        <div style={{
          display: 'flex',
          gap: 24,
          marginBottom: 30,
          padding: '12px 24px',
          background: colors.card,
          borderRadius: 16,
          border: `1px solid ${colors.border}`,
        }}>
          <div style={{ textAlign: 'center' }}>
            <p style={{ color: colors.textMuted, fontSize: 12, marginBottom: 4 }}>Prabh</p>
            <p style={{ color: colors.secondary, fontSize: 28, fontWeight: 700 }}>
              {coinTally.prabh}
            </p>
          </div>
          <div style={{
            width: 1,
            height: 50,
            background: colors.border,
          }} />
          <div style={{ textAlign: 'center' }}>
            <p style={{ color: colors.textMuted, fontSize: 12, marginBottom: 4 }}>Sehaj</p>
            <p style={{ color: colors.primary, fontSize: 28, fontWeight: 700 }}>
              {coinTally.sehaj}
            </p>
          </div>
        </div>

        <motion.div
          animate={isFlipping ? { rotateY: [0, 1800] } : {}}
          transition={{ duration: 1.5 }}
          style={{
            width: 150,
            height: 150,
            borderRadius: 75,
            background: 'linear-gradient(135deg, #FFD700, #FFA500)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 60,
            boxShadow: '0 10px 30px rgba(255, 215, 0, 0.4)',
            marginBottom: 30,
          }}
        >
          🪙
        </motion.div>

        <AnimatePresence>
          {coinResult && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              style={{
                background: colors.card,
                border: `2px solid #FFD700`,
                borderRadius: 16,
                padding: 20,
                marginBottom: 20,
              }}
            >
              <p style={{ color: colors.textPrimary, fontSize: 22, fontWeight: 600, textAlign: 'center' }}>
                {coinResult}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={flipCoin}
          disabled={isFlipping}
          style={{
            background: isFlipping ? colors.textMuted : 'linear-gradient(135deg, #FFD700, #FFA500)',
            border: 'none',
            color: '#000',
            padding: '14px 28px',
            borderRadius: 25,
            fontSize: 18,
            fontWeight: 600,
            cursor: isFlipping ? 'not-allowed' : 'pointer',
          }}
        >
          {isFlipping ? 'Flipping...' : 'Flip the Coin!'}
        </motion.button>
      </div>
    )
  }

  // ============ TIME TOGETHER ============
  if (showTimeTogether) {
    const months = Math.floor(daysTogether / 30)
    const weeks = Math.floor((daysTogether % 30) / 7)
    const days = daysTogether % 7
    
    return (
      <div style={{
        minHeight: '100vh',
        background: isDark ? '#0D0D1A' : colors.background,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        position: 'relative',
      }}>
        <motion.button
          whileHover={{ scale: 1.1 }}
          onClick={() => setShowTimeTogether(false)}
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

        <span style={{ fontSize: 60 }}>🕯️</span>
        <h1 style={{ color: colors.textPrimary, fontSize: 24, fontWeight: 600, marginTop: 16 }}>
          Together For
        </h1>

        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          style={{
            background: colors.card,
            border: `2px solid ${colors.primary}`,
            borderRadius: 20,
            padding: 30,
            marginTop: 30,
            textAlign: 'center',
            boxShadow: `0 0 50px ${colors.primaryGlow}`,
          }}
        >
          <p style={{ color: colors.primary, fontSize: 60, fontWeight: 700 }}>
            {daysTogether}
          </p>
          <p style={{ color: colors.textSecondary, fontSize: 18 }}>days</p>
          
          <div style={{ marginTop: 20, display: 'flex', gap: 20, justifyContent: 'center' }}>
            <div>
              <p style={{ color: colors.textPrimary, fontSize: 24, fontWeight: 600 }}>{months}</p>
              <p style={{ color: colors.textMuted, fontSize: 12 }}>months</p>
            </div>
            <div>
              <p style={{ color: colors.textPrimary, fontSize: 24, fontWeight: 600 }}>{weeks}</p>
              <p style={{ color: colors.textMuted, fontSize: 12 }}>weeks</p>
            </div>
            <div>
              <p style={{ color: colors.textPrimary, fontSize: 24, fontWeight: 600 }}>{days}</p>
              <p style={{ color: colors.textMuted, fontSize: 12 }}>days</p>
            </div>
          </div>
        </motion.div>

        <p style={{ color: colors.textSecondary, fontSize: 14, marginTop: 30, fontStyle: 'italic', textAlign: 'center' }}>
          And counting... forever to go 💕
        </p>
      </div>
    )
  }

  // ============ SAD MODE ============
  if (showSadMode) {
    const handleQuickKiss = () => {
      // Vibrate phone - graceful degradation if not supported
      if (navigator.vibrate) {
        navigator.vibrate([50, 30, 50])
      }
      haptics.medium()
      playPop()
      setKissDelivered(true)
      
      // Create floating hearts burst
      const hearts: Array<{id: number, x: number, y: number}> = []
      for (let i = 0; i < 8; i++) {
        hearts.push({
          id: Date.now() + i,
          x: Math.random() * 100 - 50,
          y: Math.random() * 100 - 50
        })
      }
      setFloatingHearts(hearts)
      
      setTimeout(() => {
        setKissDelivered(false)
        setFloatingHearts([])
      }, 2000)
    }

    const handleHoldToHug = (e: React.MouseEvent | React.TouchEvent) => {
      e.preventDefault()
      setIsHugging(true)
      // Vibrate to indicate start
      if (navigator.vibrate) {
        navigator.vibrate(30)
      }
      haptics.light()
      
      // Clear any existing interval
      if (hugIntervalRef.current) {
        clearInterval(hugIntervalRef.current)
      }
      
      hugIntervalRef.current = setInterval(() => {
        setHugProgress(prev => {
          if (prev >= 100) {
            if (hugIntervalRef.current) clearInterval(hugIntervalRef.current)
            setHugComplete(true)
            // Strong vibration on complete
            if (navigator.vibrate) {
              navigator.vibrate([100, 50, 100, 50, 100])
            }
            haptics.success()
            setTimeout(() => {
              setHugComplete(false)
              setHugProgress(0)
            }, 3000)
            return 100
          }
          // Light pulse vibration while holding
          if (prev % 25 === 0 && navigator.vibrate) {
            navigator.vibrate(15)
          }
          return prev + 5
        })
      }, 100)
    }

    const handleReleaseHug = () => {
      setIsHugging(false)
      if (hugIntervalRef.current) {
        clearInterval(hugIntervalRef.current)
      }
      if (hugProgress < 100) {
        setHugProgress(0)
      }
    }
    
    const handleNextSadMessageNav = () => {
      haptics.light()
      setSadMessageIndex((prev) => (prev + 1) % SAD_MODE_MESSAGES.length)
      setSadMessage(SAD_MODE_MESSAGES[(sadMessageIndex + 1) % SAD_MODE_MESSAGES.length])
    }

    return (
      <div style={{
        minHeight: '100vh',
        background: 'transparent',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Floating particles inside */}
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            animate={{
              y: [-20, -40, -20],
              x: [0, Math.random() * 20 - 10, 0],
              opacity: [0.3, 0.7, 0.3],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              delay: i * 0.2,
              repeat: Infinity,
            }}
            style={{
              position: 'absolute',
              left: `${5 + Math.random() * 90}%`,
              top: `${5 + Math.random() * 90}%`,
              fontSize: 20 + Math.random() * 10,
              zIndex: 1,
              pointerEvents: 'none',
            }}
          >
            💗
          </motion.div>
        ))}

        {/* Close Button */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          onClick={() => setShowSadMode(false)}
          style={{
            position: 'absolute',
            top: 50,
            right: 20,
            background: colors.glass,
            backdropFilter: 'blur(10px)',
            border: `1px solid ${colors.border}`,
            borderRadius: 20,
            padding: 8,
            cursor: 'pointer',
            zIndex: 100,
          }}
        >
          <IoClose size={28} color={colors.primary} />
        </motion.button>

        {/* Main Glass Card */}
        <motion.div
          animate={{
            y: [0, -5, 0],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          style={{
            background: colors.glass,
            backdropFilter: 'blur(20px)',
            border: `2px solid ${colors.border}`,
            borderRadius: 30,
            padding: '40px 30px',
            maxWidth: 450,
            width: '100%',
            boxShadow: `0 8px 32px ${colors.primaryGlow}, inset 0 0 60px ${colors.primaryGlow}`,
            position: 'relative',
            zIndex: 2,
          }}
        >
          {/* Shimmer Highlight */}
          <motion.div
            animate={{
              x: [-200, 500],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              repeatDelay: 10,
            }}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: 100,
              height: '100%',
              background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
              pointerEvents: 'none',
            }}
          />

          {/* Static Heart Icon - NOT spinning */}
          <IoHeart size={50} color={colors.primary} style={{ display: 'block', margin: '0 auto 16px' }} />
          <h1 style={{ color: colors.textPrimary, fontSize: 28, fontWeight: 700, marginBottom: 24, textAlign: 'center' }}>
            I'm here for you 💗
          </h1>

          {/* Message with Navigation */}
          <div style={{ position: 'relative', marginBottom: 24 }}>
            <motion.div
              key={sadMessage}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                background: colors.card,
                border: `1px solid ${colors.border}`,
                borderRadius: 20,
                padding: 24,
                paddingRight: 50,
              }}
            >
              <p style={{
                color: colors.textPrimary,
                fontSize: 19,
                textAlign: 'center',
                lineHeight: 1.7,
                fontStyle: 'italic',
              }}>
                {sadMessage}
              </p>
            </motion.div>
            
            {/* Next Message Button */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleNextSadMessageNav}
              style={{
                position: 'absolute',
                right: 10,
                top: '50%',
                transform: 'translateY(-50%)',
                background: colors.glass,
                border: `1px solid ${colors.border}`,
                borderRadius: '50%',
                width: 36,
                height: 36,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
            >
              <IoChevronForward size={20} color={colors.primary} />
            </motion.button>
          </div>

          {/* Quick Kiss Button */}
          <div style={{ position: 'relative', marginBottom: 16 }}>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleQuickKiss}
              style={{
                width: '100%',
                background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`,
                border: 'none',
                color: 'white',
                padding: '16px 24px',
                borderRadius: 20,
                fontSize: 18,
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 10,
                boxShadow: `0 4px 20px ${colors.primaryGlow}`,
              }}
            >
              Quick Kiss 💋
            </motion.button>

            {/* Kiss Feedback */}
            <AnimatePresence>
              {kissDelivered && (
                <motion.div
                  initial={{ opacity: 0, y: 0 }}
                  animate={{ opacity: 1, y: -40 }}
                  exit={{ opacity: 0 }}
                  style={{
                    position: 'absolute',
                    top: -30,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    color: colors.primary,
                    fontSize: 14,
                    fontWeight: 600,
                    whiteSpace: 'nowrap',
                    pointerEvents: 'none',
                  }}
                >
                  Kiss delivered. 💕
                </motion.div>
              )}
            </AnimatePresence>

            {/* Floating Hearts Burst */}
            <AnimatePresence>
              {floatingHearts.map((heart) => (
                <motion.div
                  key={heart.id}
                  initial={{ opacity: 1, x: 0, y: 0, scale: 1 }}
                  animate={{
                    opacity: 0,
                    x: heart.x,
                    y: heart.y - 50,
                    scale: 1.5,
                  }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 1.5 }}
                  style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    fontSize: 20,
                    pointerEvents: 'none',
                  }}
                >
                  💕
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Hold to Hug Button */}
          <div style={{ position: 'relative' }}>
            <motion.button
              onMouseDown={handleHoldToHug}
              onMouseUp={handleReleaseHug}
              onMouseLeave={handleReleaseHug}
              onTouchStart={handleHoldToHug}
              onTouchEnd={handleReleaseHug}
              style={{
                width: '100%',
                background: colors.card,
                border: `2px solid ${colors.border}`,
                color: colors.textPrimary,
                padding: '16px 24px',
                borderRadius: 20,
                fontSize: 18,
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 10,
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              {/* Progress Ring Fill */}
              <motion.div
                animate={{ width: `${hugProgress}%` }}
                style={{
                  position: 'absolute',
                  left: 0,
                  top: 0,
                  height: '100%',
                  background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`,
                  borderRadius: 20,
                  zIndex: 0,
                }}
              />
              
              <span style={{ position: 'relative', zIndex: 1 }}>
                {hugComplete ? '🤗 Hug Received!' : isHugging ? `Hold (${Math.floor(hugProgress)}%)` : 'Hold to Hug 🤗'}
              </span>
            </motion.button>

            {/* Hug Complete Message */}
            <AnimatePresence>
              {hugComplete && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  style={{
                    position: 'absolute',
                    top: -50,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: colors.primary,
                    color: 'white',
                    padding: '8px 16px',
                    borderRadius: 12,
                    fontSize: 14,
                    fontWeight: 600,
                    whiteSpace: 'nowrap',
                    boxShadow: `0 4px 12px ${colors.primaryGlow}`,
                  }}
                >
                  You're so loved. I've got you. 💕
                </motion.div>
              )}
            </AnimatePresence>

            {/* Warm Glow on Complete */}
            <AnimatePresence>
              {hugComplete && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 0.3, scale: 2 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 2 }}
                  style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    width: 200,
                    height: 200,
                    borderRadius: '50%',
                    background: `radial-gradient(circle, ${colors.primary}, transparent)`,
                    transform: 'translate(-50%, -50%)',
                    pointerEvents: 'none',
                    zIndex: -1,
                  }}
                />
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        <motion.p
          animate={{ opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 3, repeat: Infinity }}
          style={{
            color: colors.textPrimary,
            fontSize: 15,
            textAlign: 'center',
            fontStyle: 'italic',
            marginTop: 30,
            maxWidth: 350,
            lineHeight: 1.6,
            zIndex: 2,
          }}
        >
          I love you. I'm not going anywhere.<br />
          You're my girl. Forever.
        </motion.p>
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

      {/* Jukebox Player with Video CD Art */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          background: colors.card,
          border: `1px solid ${colors.border}`,
          borderRadius: 20,
          padding: 16,
          marginBottom: 24,
          display: 'flex',
          alignItems: 'center',
          gap: 16,
        }}
      >
        {/* Spinning CD with Video */}
        <motion.div
          animate={isPlaying ? { rotate: 360 } : {}}
          transition={isPlaying ? { duration: 3, repeat: Infinity, ease: 'linear' } : {}}
          style={{
            width: 70,
            height: 70,
            borderRadius: 35,
            overflow: 'hidden',
            border: `3px solid ${colors.primary}`,
            boxShadow: `0 0 20px ${colors.primaryGlow}`,
            position: 'relative',
            flexShrink: 0,
          }}
        >
          <video
            src={JUKEBOX_VIDEO}
            autoPlay
            loop
            muted
            playsInline
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />
          {/* Center hole for CD effect */}
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 12,
            height: 12,
            borderRadius: 6,
            background: colors.background,
            border: `2px solid ${colors.border}`,
          }} />
        </motion.div>

        {/* Track Info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ 
            color: colors.textPrimary, 
            fontSize: 14, 
            fontWeight: 600,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}>
            {currentTrack?.title || 'No Track'}
          </p>
          <p style={{ 
            color: colors.textSecondary, 
            fontSize: 12,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}>
            {currentTrack?.artist || 'Unknown'}
          </p>
        </div>

        {/* Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={previousTrack}
            style={{
              width: 32,
              height: 32,
              borderRadius: 16,
              background: 'transparent',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            <IoPlaySkipBack size={18} color={colors.textSecondary} />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={togglePlayPause}
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              background: colors.primary,
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            {isPlaying ? <IoPause size={20} color="white" /> : <IoPlay size={20} color="white" style={{ marginLeft: 2 }} />}
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={nextTrack}
            style={{
              width: 32,
              height: 32,
              borderRadius: 16,
              background: 'transparent',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            <IoPlaySkipForward size={18} color={colors.textSecondary} />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={toggleMute}
            style={{
              width: 32,
              height: 32,
              borderRadius: 16,
              background: 'transparent',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            {isMuted ? <IoVolumeMute size={18} color={colors.textMuted} /> : <IoVolumeHigh size={18} color={colors.textSecondary} />}
          </motion.button>
        </div>
      </motion.div>

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
          { title: 'Heart to Heart 💕', subtitle: 'Our apology & repair space', icon: IoChatbubbles, color: colors.primary, onClick: handleOpenHTH },
          { title: 'Would You Rather 🎲', subtitle: 'Fun couples game', icon: IoHelpCircle, color: colors.secondary, onClick: handleOpenWYR },
          { title: "Who's Right? 🪙", subtitle: 'Flip a coin to decide', icon: null, emoji: '🪙', color: '#FFD700', onClick: handleCoinFlip },
          { title: 'Together For 🕯', subtitle: 'Our time together', icon: null, emoji: '🕯', color: colors.primary, onClick: handleOpenTimeTogether },
        ].map((item, index) => (
          <motion.div
            key={index}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            onClick={item.onClick}
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
