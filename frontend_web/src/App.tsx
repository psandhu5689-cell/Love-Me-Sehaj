import React from 'react'
import { Routes, Route } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import FirstIntro from './pages/FirstIntro'
import Index from './pages/Index'
import Personalization from './pages/Personalization'
import Origin from './pages/Origin'
import Crossword from './pages/Crossword'
import CardMatch from './pages/CardMatch'
import HoldReveal from './pages/HoldReveal'
import QuietStars from './pages/QuietStars'
import Question from './pages/Question'
import Celebration from './pages/Celebration'
import DailyLove from './pages/DailyLove'
import Gallery from './pages/Gallery'
import Hub from './pages/Hub'
import LieDetector from './pages/LieDetector'
import RelationshipEmergency from './pages/RelationshipEmergency'
import TortureChamber from './pages/TortureChamber'
import TryNotToSmile from './pages/TryNotToSmile'
import VirtualBed from './pages/VirtualBed'
import FutureGoals from './pages/FutureGoals'
import WordPuzzles from './pages/WordPuzzles'
import WordSearch from './pages/WordSearch'
import Crossword from './pages/Crossword'
import { UserSetupModal, PresenceCheckModal } from './components/PresenceModals'
import AnimatedBackground from './components/AnimatedBackground'
import ThemeToggle from './components/ThemeToggle'

export default function App() {
  return (
    <>
      {/* Global Animated Background (Stars/Hearts based on theme) */}
      <AnimatedBackground particleCount={80} shootingCount={4} />
      
      {/* Theme Toggle - Fixed position */}
      <ThemeToggle style={{ position: 'fixed', top: 20, right: 20, zIndex: 9999 }} />
      
      {/* Global Presence Modals */}
      <UserSetupModal />
      <PresenceCheckModal />
      
      <AnimatePresence mode="wait">
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/first-intro" element={<FirstIntro />} />
          <Route path="/personalization" element={<Personalization />} />
          <Route path="/origin" element={<Origin />} />
          <Route path="/crossword" element={<Crossword />} />
          <Route path="/card-match" element={<CardMatch />} />
          <Route path="/hold-reveal" element={<HoldReveal />} />
          <Route path="/quiet-stars" element={<QuietStars />} />
          <Route path="/question" element={<Question />} />
          <Route path="/celebration" element={<Celebration />} />
          <Route path="/daily-love" element={<DailyLove />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/hub" element={<Hub />} />
          <Route path="/lie-detector" element={<LieDetector />} />
          <Route path="/relationship-emergency" element={<RelationshipEmergency />} />
          <Route path="/torture-chamber" element={<TortureChamber />} />
          <Route path="/try-not-to-smile" element={<TryNotToSmile />} />
          <Route path="/virtual-bed" element={<VirtualBed />} />
          <Route path="/future-goals" element={<FutureGoals />} />
          <Route path="/word-puzzles" element={<WordPuzzles />} />
          <Route path="/word-search" element={<WordSearch />} />
          <Route path="/crossword" element={<Crossword />} />
        </Routes>
      </AnimatePresence>
    </>
  )
}