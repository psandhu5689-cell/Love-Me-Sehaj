import React from 'react'
import { Routes, Route } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import FirstIntro from './pages/FirstIntro'
import Index from './pages/Index'
import Personalization from './pages/Personalization'
import Origin from './pages/Origin'
import HowItStarted from './pages/HowItStarted'
import WhenIRealized from './pages/WhenIRealized'
import WhatYouAreToMe from './pages/WhatYouAreToMe'
import EvenWhenItsHard from './pages/EvenWhenItsHard'
import MyPromise from './pages/MyPromise'
import UsForever from './pages/UsForever'
import CardMatch from './pages/CardMatch'
import DailyLoveHub from './pages/DailyLoveHub'
import DailyCompliments from './pages/DailyCompliments'
import WhyILoveYou from './pages/WhyILoveYou'
import DailyQuestions from './pages/DailyQuestions'
import DailyChallenges from './pages/DailyChallenges'
import SpecialMoments from './pages/SpecialMoments'
import HowLongTogether from './pages/HowLongTogether'
import WouldYouRather from './pages/WouldYouRather'
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
import CatTest from './pages/CatTest'
import CatDemo from './pages/CatDemo'
import TouchDemo from './pages/TouchDemo'
import FutureGoals from './pages/FutureGoals'
import WordPuzzles from './pages/WordPuzzles'
import WordSearch from './pages/WordSearch'
import Crossword from './pages/Crossword'
import CrosswordGame from './pages/CrosswordGame'
import { UserSetupModal, PresenceCheckModal } from './components/PresenceModals'
import AnimatedBackground from './components/AnimatedBackground'
import ThemeToggle from './components/ThemeToggle'

export default function App() {
  return (
    <>
      {/* Global Animated Background (Stars/Hearts based on theme) */}
      <AnimatedBackground particleCount={80} shootingCount={4} />
      
      {/* Global Presence Modals */}
      <UserSetupModal />
      <PresenceCheckModal />
      
      <AnimatePresence mode="wait">
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/first-intro" element={<FirstIntro />} />
          <Route path="/personalization" element={<Personalization />} />
          <Route path="/origin" element={<Origin />} />
          <Route path="/how-it-started" element={<HowItStarted />} />
          <Route path="/when-i-realized" element={<WhenIRealized />} />
          <Route path="/what-you-are-to-me" element={<WhatYouAreToMe />} />
          <Route path="/even-when-its-hard" element={<EvenWhenItsHard />} />
          <Route path="/my-promise" element={<MyPromise />} />
          <Route path="/us-forever" element={<UsForever />} />
          <Route path="/card-match" element={<CardMatch />} />
          <Route path="/hold-reveal" element={<HoldReveal />} />
          
          {/* Daily Love Hub Routes */}
          <Route path="/daily-love-hub" element={<DailyLoveHub />} />
          <Route path="/daily-compliments" element={<DailyCompliments />} />
          <Route path="/why-i-love-you" element={<WhyILoveYou />} />
          <Route path="/daily-questions" element={<DailyQuestions />} />
          <Route path="/daily-challenges" element={<DailyChallenges />} />
          <Route path="/special-moments" element={<SpecialMoments />} />
          <Route path="/how-long-together" element={<HowLongTogether />} />
          <Route path="/would-you-rather" element={<WouldYouRather />} />
          
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
          <Route path="/cat-test" element={<CatTest />} />
          <Route path="/cat-demo" element={<CatDemo />} />
          <Route path="/touch-demo" element={<TouchDemo />} />
          <Route path="/future-goals" element={<FutureGoals />} />
          <Route path="/word-puzzles" element={<WordPuzzles />} />
          <Route path="/word-search" element={<WordSearch />} />
          <Route path="/crossword" element={<Crossword />} />
          <Route path="/crossword-game" element={<CrosswordGame />} />
        </Routes>
      </AnimatePresence>
    </>
  )
}