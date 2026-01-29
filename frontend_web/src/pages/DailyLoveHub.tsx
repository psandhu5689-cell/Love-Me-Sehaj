import React from 'react'
import { motion } from 'framer-motion'
import { IoChevronBack, IoHeart, IoHelpCircle, IoTrophy, IoChatbubbles, IoStar, IoBook, IoImages } from 'react-icons/io5'
import { useNavigate } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'
import haptics from '../utils/haptics'

export default function DailyLoveHub() {
  const navigate = useNavigate()
  const { colors } = useTheme()

  const activities = [
    {
      id: 'gallery',
      title: 'When i.....',
      subtitle: 'Our moments together',
      icon: IoImages,
      gradient: ['#4facfe', '#00f2fe'],
      route: '/gallery',
    },
    {
      id: 'compliments',
      title: 'For Sehaj & Mrs. Sandhu',
      subtitle: 'Words from my heart',
      icon: IoHeart,
      gradient: ['#FF6B9D', '#C471ED'],
      route: '/daily-compliments',
    },
    {
      id: 'why-i-love-you',
      title: 'Why does he love me',
      subtitle: 'Because reasons',
      icon: IoStar,
      gradient: ['#FF9472', '#F2709C'],
      route: '/why-i-love-you',
    },
    {
      id: 'questions',
      title: 'Mhmm what would she say',
      subtitle: 'Let me know you better',
      icon: IoHelpCircle,
      gradient: ['#4FACFE', '#00F2FE'],
      route: '/daily-questions',
    },
    {
      id: 'challenges',
      title: 'A little this & A little that',
      subtitle: 'Small things for us',
      icon: IoTrophy,
      gradient: ['#43E97B', '#38F9D7'],
      route: '/daily-challenges',
    },
    {
      id: 'notes',
      title: '"Here and There" memories',
      subtitle: 'Things I remember',
      icon: IoBook,
      gradient: ['#FFA8A8', '#FCFF00'],
      route: '/special-moments',
    },
  ]

  return (
    <div style={{
      minHeight: '100vh',
      background: colors.background,
      display: 'flex',
      flexDirection: 'column',
      padding: 20,
    }}>
      {/* Back Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => {
          haptics.light()
          navigate('/')
        }}
        style={{
          position: 'absolute',
          top: 20,
          left: 20,
          width: 44,
          height: 44,
          borderRadius: 22,
          background: colors.card,
          border: `1px solid ${colors.border}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          zIndex: 100,
        }}
      >
        <IoChevronBack size={24} color={colors.primary} />
      </motion.button>

      {/* Content */}
      <div style={{
        maxWidth: 600,
        margin: '0 auto',
        width: '100%',
        paddingTop: 60,
        paddingLeft: 16,
        paddingRight: 16,
      }}>
        {/* Title - MUST BE VISIBLE AT TOP */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            textAlign: 'center',
            marginBottom: 20,
            marginTop: 0,
          }}
        >
          <h1 style={{
            color: colors.textPrimary,
            fontSize: 26,
            fontWeight: 700,
            marginBottom: 4,
            marginTop: 0,
          }}>
            Personal Library
          </h1>
          <p style={{
            color: colors.textSecondary,
            fontSize: 13,
            margin: 0,
          }}>
            Everything for my girl
          </p>
        </motion.div>

        {/* BIG "When You're Sad" Widget at TOP */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ scale: 1.02, y: -5 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => {
            haptics.medium()
            navigate('/daily-love')
          }}
          style={{
            background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`,
            borderRadius: 24,
            padding: 32,
            cursor: 'pointer',
            boxShadow: `0 12px 40px ${colors.primaryGlow}`,
            marginBottom: 24,
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Shimmer effect */}
          <motion.div
            animate={{ x: ['-100%', '200%'] }}
            transition={{ duration: 3, repeat: Infinity, repeatDelay: 5 }}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
              pointerEvents: 'none',
            }}
          />
          
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 20,
          }}>
            {/* Icon */}
            <div style={{
              width: 72,
              height: 72,
              borderRadius: 20,
              background: 'rgba(255,255,255,0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}>
              <IoChatbubbles size={36} color="white" />
            </div>

            {/* Text */}
            <div>
              <h2 style={{
                color: 'white',
                fontSize: 24,
                fontWeight: 700,
                marginBottom: 8,
              }}>
                When You're Sad
              </h2>
              <p style={{
                color: 'rgba(255,255,255,0.9)',
                fontSize: 16,
                lineHeight: 1.5,
              }}>
                I'm here for you 💗
              </p>
            </div>
          </div>
        </motion.div>

        {/* Activity Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 16,
        }}>
          {activities.map((activity, index) => {
            const Icon = activity.icon
            return (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.08 }}
                whileHover={{ scale: 1.02, y: -3 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  haptics.medium()
                  navigate(activity.route)
                }}
                style={{
                  background: colors.glass,
                  backdropFilter: 'blur(20px)',
                  border: `1px solid ${colors.border}`,
                  borderRadius: 20,
                  padding: 20,
                  cursor: 'pointer',
                  boxShadow: `0 4px 20px ${colors.primaryGlow}`,
                  position: 'relative',
                  overflow: 'hidden',
                  // FIXED: Always visible, no disappearing
                  opacity: 1,
                  visibility: 'visible',
                }}
              >
                {/* Gradient Overlay */}
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: 4,
                  background: `linear-gradient(90deg, ${activity.gradient[0]}, ${activity.gradient[1]})`,
                }} />

                {/* Icon */}
                <div style={{
                  width: 48,
                  height: 48,
                  borderRadius: 14,
                  background: `linear-gradient(135deg, ${activity.gradient[0]}, ${activity.gradient[1]})`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 14,
                }}>
                  <Icon size={24} color="white" />
                </div>

                {/* Text */}
                <h3 style={{
                  color: colors.textPrimary,
                  fontSize: 18,
                  fontWeight: 600,
                  marginBottom: 6,
                }}>
                  {activity.title}
                </h3>
                <p style={{
                  color: colors.textSecondary,
                  fontSize: 13,
                  lineHeight: 1.4,
                }}>
                  {activity.subtitle}
                </p>
              </motion.div>
            )
          })}
        </div>

        <div style={{ height: 40 }} />
      </div>
    </div>
  )
}
