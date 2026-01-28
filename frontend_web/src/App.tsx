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

export default function App() {
  return (
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
      </Routes>
    </AnimatePresence>
  )
}