import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { IoChevronBack, IoAdd, IoCheckmark, IoTrash, IoTime, IoPeople, IoPerson, IoClose } from 'react-icons/io5'
import { useTheme } from '../context/ThemeContext'
import { goalsStorage, Goal } from '../utils/storage'
import haptics from '../utils/haptics'

export default function FutureGoals() {
  const navigate = useNavigate()
  const { colors, isDark } = useTheme()
  const [goals, setGoals] = useState<Goal[]>([])
  const [showAddModal, setShowAddModal] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [newGoal, setNewGoal] = useState({
    title: '',
    description: '',
    targetDate: '',
    isShared: true,
  })

  useEffect(() => {
    setGoals(goalsStorage.getGoals())
  }, [])

  const handleAddGoal = () => {
    if (!newGoal.title.trim()) return
    
    haptics.success()
    goalsStorage.addGoal({
      title: newGoal.title,
      description: newGoal.description || undefined,
      targetDate: newGoal.targetDate || undefined,
      isShared: newGoal.isShared,
    })
    setGoals(goalsStorage.getGoals())
    setShowAddModal(false)
    setNewGoal({ title: '', description: '', targetDate: '', isShared: true })
  }

  const handleCompleteGoal = (id: string) => {
    haptics.success()
    goalsStorage.completeGoal(id)
    setGoals(goalsStorage.getGoals())
  }

  const handleDeleteGoal = (id: string) => {
    haptics.medium()
    goalsStorage.deleteGoal(id)
    setGoals(goalsStorage.getGoals())
  }

  const activeGoals = goals.filter(g => !g.completed)
  const completedGoals = goals.filter(g => g.completed)

  const formatDate = (dateStr: string | undefined) => {
    if (!dateStr) return null
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'transparent',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
      padding: 20,
      paddingTop: 70,
      overflow: 'auto',
    }}>
      {/* Back Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => {
          haptics.light()
          navigate(-1)
        }}
        style={{
          position: 'fixed',
          top: 20,
          left: 16,
          width: 44,
          height: 44,
          borderRadius: 22,
          background: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
          backdropFilter: 'blur(10px)',
          border: `1px solid ${isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)'}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          zIndex: 101,
        }}
      >
        <IoChevronBack size={24} color={colors.primary} />
      </motion.button>

      {/* Title */}
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <h1 style={{ color: colors.textPrimary, fontSize: 28, fontWeight: 600, marginBottom: 8 }}>
          🎯 Future Goals
        </h1>
        <p style={{ color: colors.textSecondary, fontSize: 14 }}>Dreams we're building together</p>
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, justifyContent: 'center' }}>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => {
            haptics.light()
            setShowAddModal(true)
          }}
          style={{
            background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`,
            border: 'none',
            borderRadius: 12,
            padding: '12px 20px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            color: 'white',
            fontWeight: 600,
            fontSize: 14,
          }}
        >
          <IoAdd size={20} />
          Add Goal
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => {
            haptics.light()
            setShowHistory(!showHistory)
          }}
          style={{
            background: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
            border: `1px solid ${isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)'}`,
            borderRadius: 12,
            padding: '12px 20px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            color: colors.textPrimary,
            fontWeight: 600,
            fontSize: 14,
          }}
        >
          <IoTime size={20} />
          {showHistory ? 'Active' : 'History'} ({showHistory ? activeGoals.length : completedGoals.length})
        </motion.button>
      </div>

      {/* Goals List */}
      <div style={{ maxWidth: 500, margin: '0 auto', width: '100%' }}>
        <AnimatePresence mode="popLayout">
          {(showHistory ? completedGoals : activeGoals).length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{
                textAlign: 'center',
                padding: 40,
                color: colors.textMuted,
              }}
            >
              <span style={{ fontSize: 48 }}>{showHistory ? '✨' : '🎯'}</span>
              <p style={{ marginTop: 16 }}>
                {showHistory 
                  ? 'No completed goals yet. Keep working!'
                  : 'No active goals. Add one to get started!'}
              </p>
            </motion.div>
          ) : (
            (showHistory ? completedGoals : activeGoals).map((goal) => (
              <motion.div
                key={goal.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                style={{
                  background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.9)',
                  backdropFilter: 'blur(10px)',
                  border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                  borderRadius: 16,
                  padding: 16,
                  marginBottom: 12,
                  opacity: goal.completed ? 0.7 : 1,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                  {/* Checkbox / Status */}
                  {!goal.completed ? (
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleCompleteGoal(goal.id)}
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: 14,
                        background: 'transparent',
                        border: `2px solid ${colors.primary}`,
                        cursor: 'pointer',
                        flexShrink: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    />
                  ) : (
                    <div style={{
                      width: 28,
                      height: 28,
                      borderRadius: 14,
                      background: colors.success,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}>
                      <IoCheckmark size={18} color="white" />
                    </div>
                  )}

                  {/* Content */}
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      {goal.isShared ? (
                        <IoPeople size={14} color={colors.primary} />
                      ) : (
                        <IoPerson size={14} color={colors.secondary} />
                      )}
                      <span style={{ 
                        color: colors.textMuted, 
                        fontSize: 11, 
                        textTransform: 'uppercase',
                        letterSpacing: 0.5,
                      }}>
                        {goal.isShared ? 'Shared' : 'Personal'}
                      </span>
                    </div>
                    <h3 style={{ 
                      color: colors.textPrimary, 
                      fontSize: 16, 
                      fontWeight: 600,
                      textDecoration: goal.completed ? 'line-through' : 'none',
                      marginBottom: 4,
                    }}>
                      {goal.title}
                    </h3>
                    {goal.description && (
                      <p style={{ color: colors.textSecondary, fontSize: 13, marginBottom: 4 }}>
                        {goal.description}
                      </p>
                    )}
                    {goal.targetDate && (
                      <p style={{ color: colors.textMuted, fontSize: 12 }}>
                        📅 Target: {formatDate(goal.targetDate)}
                      </p>
                    )}
                  </div>

                  {/* Delete */}
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleDeleteGoal(goal.id)}
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 8,
                      background: 'rgba(239, 68, 68, 0.1)',
                      border: 'none',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <IoTrash size={16} color={colors.error} />
                  </motion.button>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      {/* Add Goal Modal */}
      <AnimatePresence>
        {showAddModal && (
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
              background: 'rgba(0,0,0,0.6)',
              backdropFilter: 'blur(5px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000,
              padding: 20,
            }}
            onClick={() => setShowAddModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                background: colors.card,
                borderRadius: 20,
                padding: 24,
                width: '100%',
                maxWidth: 400,
                maxHeight: '80vh',
                overflow: 'auto',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <h2 style={{ color: colors.textPrimary, fontSize: 20, fontWeight: 600 }}>
                  ✨ New Goal
                </h2>
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setShowAddModal(false)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    padding: 4,
                  }}
                >
                  <IoClose size={24} color={colors.textMuted} />
                </motion.button>
              </div>

              {/* Title */}
              <div style={{ marginBottom: 16 }}>
                <label style={{ color: colors.textSecondary, fontSize: 13, fontWeight: 500, marginBottom: 6, display: 'block' }}>
                  Goal Title *
                </label>
                <input
                  type="text"
                  value={newGoal.title}
                  onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                  placeholder="What do you want to achieve?"
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    borderRadius: 10,
                    border: `1px solid ${colors.border}`,
                    background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
                    color: colors.textPrimary,
                    fontSize: 15,
                    outline: 'none',
                  }}
                />
              </div>

              {/* Description */}
              <div style={{ marginBottom: 16 }}>
                <label style={{ color: colors.textSecondary, fontSize: 13, fontWeight: 500, marginBottom: 6, display: 'block' }}>
                  Description (optional)
                </label>
                <textarea
                  value={newGoal.description}
                  onChange={(e) => setNewGoal({ ...newGoal, description: e.target.value })}
                  placeholder="Add more details..."
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    borderRadius: 10,
                    border: `1px solid ${colors.border}`,
                    background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
                    color: colors.textPrimary,
                    fontSize: 15,
                    outline: 'none',
                    resize: 'none',
                  }}
                />
              </div>

              {/* Target Date */}
              <div style={{ marginBottom: 16 }}>
                <label style={{ color: colors.textSecondary, fontSize: 13, fontWeight: 500, marginBottom: 6, display: 'block' }}>
                  Target Date (optional)
                </label>
                <input
                  type="date"
                  value={newGoal.targetDate}
                  onChange={(e) => setNewGoal({ ...newGoal, targetDate: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    borderRadius: 10,
                    border: `1px solid ${colors.border}`,
                    background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
                    color: colors.textPrimary,
                    fontSize: 15,
                    outline: 'none',
                  }}
                />
              </div>

              {/* Shared Toggle */}
              <div style={{ marginBottom: 24 }}>
                <label style={{ color: colors.textSecondary, fontSize: 13, fontWeight: 500, marginBottom: 10, display: 'block' }}>
                  Goal Type
                </label>
                <div style={{ display: 'flex', gap: 10 }}>
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setNewGoal({ ...newGoal, isShared: true })}
                    style={{
                      flex: 1,
                      padding: '12px',
                      borderRadius: 10,
                      border: `2px solid ${newGoal.isShared ? colors.primary : colors.border}`,
                      background: newGoal.isShared ? `${colors.primary}15` : 'transparent',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8,
                    }}
                  >
                    <IoPeople size={18} color={newGoal.isShared ? colors.primary : colors.textMuted} />
                    <span style={{ color: newGoal.isShared ? colors.primary : colors.textMuted, fontWeight: 500 }}>
                      Shared
                    </span>
                  </motion.button>
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setNewGoal({ ...newGoal, isShared: false })}
                    style={{
                      flex: 1,
                      padding: '12px',
                      borderRadius: 10,
                      border: `2px solid ${!newGoal.isShared ? colors.secondary : colors.border}`,
                      background: !newGoal.isShared ? `${colors.secondary}15` : 'transparent',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8,
                    }}
                  >
                    <IoPerson size={18} color={!newGoal.isShared ? colors.secondary : colors.textMuted} />
                    <span style={{ color: !newGoal.isShared ? colors.secondary : colors.textMuted, fontWeight: 500 }}>
                      Personal
                    </span>
                  </motion.button>
                </div>
              </div>

              {/* Submit */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleAddGoal}
                disabled={!newGoal.title.trim()}
                style={{
                  width: '100%',
                  padding: '14px',
                  borderRadius: 12,
                  border: 'none',
                  background: newGoal.title.trim() 
                    ? `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`
                    : colors.border,
                  color: 'white',
                  fontSize: 16,
                  fontWeight: 600,
                  cursor: newGoal.title.trim() ? 'pointer' : 'not-allowed',
                }}
              >
                Add Goal 🎯
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
