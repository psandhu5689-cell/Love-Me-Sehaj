/**
 * MR AND MRS - Virtual Cat Scene (Complete Rewrite)
 * 
 * Features:
 * - Sprite-based animation system with no sliding
 * - Floor-only autonomous roaming with walking animations
 * - Direct touch interactions on cat body parts
 * - Game-style compact bottom action bar
 * - Interactive room elements (weather, curtains, lamp, etc.)
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IoChevronBackOutline, IoVolumeHigh, IoVolumeMute } from 'react-icons/io5';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import haptics from '../utils/haptics';
import { Howl } from 'howler';
import { SpriteAnimator } from '../components/SpriteAnimator';

// ============ SPRITE METADATA ============

const prabhMetadata = {
  "meta": {
    "image": "black_cat_sprite.png",
    "frameWidth": 64,
    "frameHeight": 64,
    "columns": 18,
    "totalFrames": 1188
  },
  "animations": {
    "walkDown": { "start": 0, "end": 5, "fps": 8 },
    "walkUp": { "start": 18, "end": 23, "fps": 8 },
    "walkRight": { "start": 36, "end": 41, "fps": 8 },
    "walkLeft": { "start": 54, "end": 59, "fps": 8 },
    "sitIdle": { "start": 144, "end": 144, "fps": 1 },
    "layIdle": { "start": 145, "end": 145, "fps": 1 },
    "happy": { "start": 504, "end": 514, "fps": 12 },
    "annoyed": { "start": 936, "end": 945, "fps": 10 },
    "surprised": { "start": 198, "end": 203, "fps": 10 },
    "wake": { "start": 1008, "end": 144, "fps": 10 },
    "sleep": { "start": 666, "end": 671, "fps": 6 },
    "nudge": { "start": 252, "end": 259, "fps": 10 },
    "kick": { "start": 558, "end": 568, "fps": 12 },
    "hogBlanket": { "start": 1008, "end": 1013, "fps": 8 },
    "feed": { "start": 864, "end": 873, "fps": 10 },
    "gaming": { "start": 504, "end": 514, "fps": 12 }
  }
};

const sehajMetadata = {
  "meta": {
    "image": "ginger_cat_sprite.png",
    "frameWidth": 64,
    "frameHeight": 64,
    "columns": 18,
    "totalFrames": 1188
  },
  "animations": {
    "walkDown": { "start": 0, "end": 5, "fps": 8 },
    "walkUp": { "start": 18, "end": 23, "fps": 8 },
    "walkRight": { "start": 36, "end": 41, "fps": 8 },
    "walkLeft": { "start": 54, "end": 59, "fps": 8 },
    "sitIdle": { "start": 144, "end": 144, "fps": 1 },
    "layIdle": { "start": 145, "end": 145, "fps": 1 },
    "happy": { "start": 504, "end": 514, "fps": 12 },
    "annoyed": { "start": 936, "end": 945, "fps": 10 },
    "surprised": { "start": 198, "end": 203, "fps": 10 },
    "wake": { "start": 1008, "end": 144, "fps": 10 },
    "sleep": { "start": 666, "end": 671, "fps": 6 },
    "nudge": { "start": 252, "end": 259, "fps": 10 },
    "kick": { "start": 558, "end": 568, "fps": 12 },
    "hogBlanket": { "start": 1008, "end": 1013, "fps": 8 },
    "feed": { "start": 864, "end": 873, "fps": 10 },
    "gaming": { "start": 504, "end": 514, "fps": 12 }
  }
};

// ============ TYPES ============

type AnimationState = 
  | 'sitIdle' | 'layIdle' | 'walkUp' | 'walkDown' | 'walkLeft' | 'walkRight'
  | 'sleep' | 'wake' | 'nudge' | 'kick' | 'hogBlanket' | 'feed' | 'gaming'
  | 'happy' | 'annoyed' | 'surprised';

type CatName = 'Prabh' | 'Sehaj';
type TargetMode = 'Prabh' | 'Sehaj' | 'Both';
type WeatherMode = 'clear' | 'rain' | 'snow' | 'city';

interface Position {
  x: number;
  y: number;
}

interface CatState {
  position: Position;
  animation: AnimationState;
  isMoving: boolean;
  targetPosition: Position | null;
  mood: 'neutral' | 'happy' | 'annoyed' | 'sleeping';
}

// ============ CONSTANTS ============

// Floor bounds (cats can only roam here)
const FLOOR_BOUNDS = {
  x: 50,
  y: 450,
  width: 700,
  height: 300,
};

// Anchor points for roaming (all within floor bounds)
const ROAM_ANCHORS: Position[] = [
  { x: 100, y: 500 },
  { x: 200, y: 550 },
  { x: 300, y: 500 },
  { x: 400, y: 600 },
  { x: 500, y: 550 },
  { x: 600, y: 500 },
  { x: 150, y: 650 },
  { x: 300, y: 700 },
  { x: 500, y: 680 },
  { x: 650, y: 600 },
  { x: 250, y: 600 },
  { x: 450, y: 650 },
];

// ============ MAIN COMPONENT ============

export default function VirtualBed() {
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  
  // Audio
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<Howl | null>(null);

  // Cat states
  const [prabhState, setPrabhState] = useState<CatState>({
    position: { x: 150, y: 550 },
    animation: 'sitIdle',
    isMoving: false,
    targetPosition: null,
    mood: 'neutral',
  });

  const [sehajState, setSehajState] = useState<CatState>({
    position: { x: 500, y: 550 },
    animation: 'sitIdle',
    isMoving: false,
    targetPosition: null,
    mood: 'neutral',
  });

  // UI state
  const [targetMode, setTargetMode] = useState<TargetMode>('Both');
  const [showSecondaryPanel, setShowSecondaryPanel] = useState(false);
  const [weather, setWeather] = useState<WeatherMode>('clear');
  const [curtainsOpen, setCurtainsOpen] = useState(true);
  const [lampOn, setLampOn] = useState(true);
  const [lightsOut, setLightsOut] = useState(false);

  // Roaming timers
  const roamTimerPrabh = useRef<NodeJS.Timeout | null>(null);
  const roamTimerSehaj = useRef<NodeJS.Timeout | null>(null);

  // ============ UTILITY FUNCTIONS ============

  const clampToFloor = (pos: Position): Position => {
    return {
      x: Math.max(FLOOR_BOUNDS.x, Math.min(FLOOR_BOUNDS.x + FLOOR_BOUNDS.width - 64, pos.x)),
      y: Math.max(FLOOR_BOUNDS.y, Math.min(FLOOR_BOUNDS.y + FLOOR_BOUNDS.height - 64, pos.y)),
    };
  };

  const getRandomAnchor = (): Position => {
    return ROAM_ANCHORS[Math.floor(Math.random() * ROAM_ANCHORS.length)];
  };

  const getWalkDirection = (from: Position, to: Position): 'walkUp' | 'walkDown' | 'walkLeft' | 'walkRight' => {
    const dx = to.x - from.x;
    const dy = to.y - from.y;

    if (Math.abs(dx) > Math.abs(dy)) {
      return dx > 0 ? 'walkRight' : 'walkLeft';
    } else {
      return dy > 0 ? 'walkDown' : 'walkUp';
    }
  };

  const playSound = (soundPath: string) => {
    if (!isMuted) {
      const sound = new Howl({ src: [soundPath], volume: 0.3 });
      sound.play();
    }
  };

  // ============ CAT MOVEMENT ============

  const moveCat = useCallback((
    catName: CatName,
    targetPos: Position,
    onComplete?: () => void
  ) => {
    const setState = catName === 'Prabh' ? setPrabhState : setSehajState;
    const currentState = catName === 'Prabh' ? prabhState : sehajState;

    const clampedTarget = clampToFloor(targetPos);
    const walkAnim = getWalkDirection(currentState.position, clampedTarget);

    // Start walking animation
    setState(prev => ({
      ...prev,
      animation: walkAnim,
      isMoving: true,
      targetPosition: clampedTarget,
    }));

    // Calculate duration based on distance
    const distance = Math.sqrt(
      Math.pow(clampedTarget.x - currentState.position.x, 2) +
      Math.pow(clampedTarget.y - currentState.position.y, 2)
    );
    const duration = Math.max(1200, Math.min(2500, distance * 3));

    // Animate position
    const startTime = Date.now();
    const startPos = { ...currentState.position };

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      const newX = startPos.x + (clampedTarget.x - startPos.x) * progress;
      const newY = startPos.y + (clampedTarget.y - startPos.y) * progress;

      setState(prev => ({
        ...prev,
        position: { x: newX, y: newY },
      }));

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        // Arrival - stop and sit/lay
        const idleAnim = Math.random() > 0.8 ? 'layIdle' : 'sitIdle';
        setState(prev => ({
          ...prev,
          animation: idleAnim,
          isMoving: false,
          targetPosition: null,
        }));
        if (onComplete) onComplete();
      }
    };

    requestAnimationFrame(animate);
  }, [prabhState, sehajState]);

  // ============ AUTONOMOUS ROAMING ============

  const startRoaming = useCallback((catName: CatName) => {
    const timer = catName === 'Prabh' ? roamTimerPrabh : roamTimerSehaj;

    const roam = () => {
      const nextAnchor = getRandomAnchor();
      moveCat(catName, nextAnchor);

      const nextInterval = 5000 + Math.random() * 5000;
      timer.current = setTimeout(roam, nextInterval);
    };

    // Start initial roam
    const initialDelay = 3000 + Math.random() * 3000;
    timer.current = setTimeout(roam, initialDelay);
  }, [moveCat]);

  const stopRoaming = (catName: CatName) => {
    const timer = catName === 'Prabh' ? roamTimerPrabh : roamTimerSehaj;
    if (timer.current) {
      clearTimeout(timer.current);
      timer.current = null;
    }
  };

  // Start roaming on mount
  useEffect(() => {
    startRoaming('Prabh');
    startRoaming('Sehaj');

    return () => {
      stopRoaming('Prabh');
      stopRoaming('Sehaj');
    };
  }, [startRoaming]);

  // ============ TOUCH INTERACTIONS ============

  const handleCatPartClick = (catName: CatName, part: 'head' | 'nose' | 'belly' | 'tail') => {
    haptics.light();
    playSound('/audio/cats/meow1.mp3');

    const setState = catName === 'Prabh' ? setPrabhState : setSehajState;

    // Stop roaming
    stopRoaming(catName);

    // Play reaction based on part
    let reactionAnim: AnimationState = 'happy';
    if (part === 'tail') reactionAnim = 'annoyed';
    if (part === 'nose') reactionAnim = 'surprised';

    setState(prev => ({
      ...prev,
      animation: reactionAnim,
      isMoving: false,
    }));

    // Return to idle after reaction
    setTimeout(() => {
      setState(prev => ({
        ...prev,
        animation: 'sitIdle',
      }));
      startRoaming(catName);
    }, 2000);

    console.log(`${catName} ${part} clicked!`);
  };

  // ============ ACTION BUTTONS ============

  const performAction = (action: string) => {
    haptics.medium();
    playSound('/audio/cats/meow2.mp3');

    const targets: CatName[] = 
      targetMode === 'Both' ? ['Prabh', 'Sehaj'] : [targetMode];

    targets.forEach(catName => {
      const setState = catName === 'Prabh' ? setPrabhState : setSehajState;
      stopRoaming(catName);

      switch (action) {
        case 'wake':
          setState(prev => ({ ...prev, animation: 'wake', mood: 'neutral' }));
          setTimeout(() => {
            setState(prev => ({ ...prev, animation: 'sitIdle' }));
            startRoaming(catName);
          }, 1500);
          break;

        case 'sleep':
          setState(prev => ({ ...prev, animation: 'sleep', mood: 'sleeping', isMoving: false }));
          break;

        case 'feed':
          setState(prev => ({ ...prev, animation: 'feed', mood: 'happy' }));
          setTimeout(() => {
            setState(prev => ({ ...prev, animation: 'sitIdle' }));
            startRoaming(catName);
          }, 2000);
          break;

        case 'nudge':
          setState(prev => ({ ...prev, animation: 'nudge' }));
          setTimeout(() => {
            setState(prev => ({ ...prev, animation: 'sitIdle' }));
            startRoaming(catName);
          }, 1500);
          break;

        case 'kick':
          setState(prev => ({ ...prev, animation: 'kick', mood: 'annoyed' }));
          setTimeout(() => {
            setState(prev => ({ ...prev, animation: 'sitIdle' }));
            startRoaming(catName);
          }, 1500);
          break;

        case 'hogBlanket':
          setState(prev => ({ ...prev, animation: 'hogBlanket' }));
          setTimeout(() => {
            setState(prev => ({ ...prev, animation: 'layIdle' }));
            startRoaming(catName);
          }, 2000);
          break;

        case 'gaming':
          setState(prev => ({ ...prev, animation: 'gaming', mood: 'happy' }));
          setTimeout(() => {
            setState(prev => ({ ...prev, animation: 'sitIdle' }));
            startRoaming(catName);
          }, 3000);
          break;

        case 'pet':
          setState(prev => ({ ...prev, animation: 'happy', mood: 'happy' }));
          setTimeout(() => {
            setState(prev => ({ ...prev, animation: 'sitIdle' }));
            startRoaming(catName);
          }, 2000);
          break;

        case 'drama':
          setState(prev => ({ ...prev, animation: 'annoyed', mood: 'annoyed' }));
          setTimeout(() => {
            setState(prev => ({ ...prev, animation: 'sitIdle' }));
            startRoaming(catName);
          }, 2000);
          break;
      }
    });

    // Special multi-cat actions
    if (action === 'cuddle' && targetMode === 'Both') {
      stopRoaming('Prabh');
      stopRoaming('Sehaj');
      
      const meetPoint = { x: 350, y: 600 };
      
      moveCat('Prabh', { x: meetPoint.x - 40, y: meetPoint.y }, () => {
        setPrabhState(prev => ({ ...prev, animation: 'happy' }));
      });
      
      moveCat('Sehaj', { x: meetPoint.x + 40, y: meetPoint.y }, () => {
        setSehajState(prev => ({ ...prev, animation: 'happy' }));
      });

      setTimeout(() => {
        startRoaming('Prabh');
        startRoaming('Sehaj');
      }, 4000);
    }

    if (action === 'lightsOut') {
      setLightsOut(true);
      setLampOn(false);
      playSound('/audio/cats/meow3.mp3');
      
      setTimeout(() => {
        setLightsOut(false);
        setLampOn(true);
      }, 3000);
    }
  };

  // ============ ROOM INTERACTIONS ============

  const cycleWeather = () => {
    const modes: WeatherMode[] = ['clear', 'rain', 'snow', 'city'];
    const currentIndex = modes.indexOf(weather);
    const nextIndex = (currentIndex + 1) % modes.length;
    setWeather(modes[nextIndex]);
    haptics.light();
  };

  // ============ RENDER ============

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      overflow: 'hidden',
      position: 'relative',
      background: lightsOut ? '#000' : (isDarkMode ? '#1a1a2e' : '#f0f0f0'),
      transition: 'background 0.5s',
    }}>
      {/* Back Button */}
      <motion.button
        onClick={() => { haptics.light(); navigate(-1); }}
        style={{
          position: 'absolute',
          top: 60,
          left: 20,
          zIndex: 100,
          width: 44,
          height: 44,
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.2)',
          backdropFilter: 'blur(10px)',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
        whileTap={{ scale: 0.9 }}
      >
        <IoChevronBackOutline size={24} color="#fff" />
      </motion.button>

      {/* Mute Button */}
      <motion.button
        onClick={() => { setIsMuted(!isMuted); haptics.light(); }}
        style={{
          position: 'absolute',
          top: 60,
          right: 20,
          zIndex: 100,
          width: 44,
          height: 44,
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.2)',
          backdropFilter: 'blur(10px)',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
        whileTap={{ scale: 0.9 }}
      >
        {isMuted ? <IoVolumeMute size={24} color="#fff" /> : <IoVolumeHigh size={24} color="#fff" />}
      </motion.button>

      {/* Room Container */}
      <div style={{
        width: '800px',
        height: '900px',
        margin: '50px auto',
        position: 'relative',
        background: 'linear-gradient(180deg, #87CEEB 0%, #F5DEB3 50%, #D2B48C 100%)',
        borderRadius: '20px',
        overflow: 'hidden',
        boxShadow: '0 10px 50px rgba(0,0,0,0.3)',
      }}>
        {/* Wall Background */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '450px',
          background: isDarkMode ? '#2a2a3e' : '#e8d5c4',
          borderBottom: '3px solid #8b7355',
        }} />

        {/* Floor */}
        <div style={{
          position: 'absolute',
          top: '450px',
          left: 0,
          width: '100%',
          height: '450px',
          background: 'linear-gradient(135deg, #d4a574 0%, #c9965f 100%)',
        }} />

        {/* Window */}
        <motion.div
          onClick={cycleWeather}
          style={{
            position: 'absolute',
            top: 100,
            right: 100,
            width: 200,
            height: 250,
            background: weather === 'rain' ? '#7a9cb5' : 
                       weather === 'snow' ? '#e0f2ff' :
                       weather === 'city' ? '#1a1a2e' : '#87CEEB',
            border: '8px solid #654321',
            borderRadius: '8px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '48px',
          }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {weather === 'rain' && '🌧️'}
          {weather === 'snow' && '❄️'}
          {weather === 'city' && '🌃'}
          {weather === 'clear' && '☀️'}
        </motion.div>

        {/* Curtains */}
        <AnimatePresence>
          {!curtainsOpen && (
            <motion.div
              initial={{ x: -100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -100, opacity: 0 }}
              style={{
                position: 'absolute',
                top: 90,
                right: 90,
                width: 220,
                height: 270,
                background: 'linear-gradient(90deg, #8b4513 0%, #654321 100%)',
                borderRadius: '8px',
                zIndex: 10,
              }}
            />
          )}
        </AnimatePresence>

        <motion.button
          onClick={() => { setCurtainsOpen(!curtainsOpen); haptics.light(); }}
          style={{
            position: 'absolute',
            top: 90,
            right: 50,
            zIndex: 11,
            padding: '8px 12px',
            background: 'rgba(255,255,255,0.3)',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '12px',
          }}
          whileTap={{ scale: 0.9 }}
        >
          {curtainsOpen ? 'Close' : 'Open'}
        </motion.button>

        {/* Lamp */}
        <motion.div
          onClick={() => { setLampOn(!lampOn); haptics.light(); }}
          style={{
            position: 'absolute',
            top: 150,
            left: 100,
            width: 60,
            height: 120,
            cursor: 'pointer',
          }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <div style={{
            width: '100%',
            height: '60%',
            background: lampOn ? '#ffe066' : '#555',
            borderRadius: '50%',
            boxShadow: lampOn ? '0 0 30px rgba(255,224,102,0.8)' : 'none',
            transition: 'all 0.3s',
          }} />
          <div style={{
            width: '20%',
            height: '40%',
            background: '#333',
            margin: '0 auto',
          }} />
        </motion.div>

        {/* PRABH (Black Cat) */}
        <div
          style={{
            position: 'absolute',
            left: prabhState.position.x,
            top: prabhState.position.y,
            width: 64,
            height: 64,
            zIndex: 20,
          }}
        >
          {/* Touch Zones */}
          <div style={{ position: 'relative', width: 64, height: 64 }}>
            {/* Sprite */}
            <SpriteAnimator
              spriteSheet="black_cat_sprite.png"
              metadata={prabhMetadata}
              animation={prabhState.animation}
              width={64}
              height={64}
              loop={prabhState.animation.includes('walk') || prabhState.animation === 'sleep'}
            />

            {/* Head touch zone */}
            <div
              onClick={() => handleCatPartClick('Prabh', 'head')}
              style={{
                position: 'absolute',
                top: 0,
                left: 16,
                width: 32,
                height: 24,
                cursor: 'pointer',
                // Debug: background: 'rgba(255,0,0,0.2)',
              }}
            />

            {/* Nose touch zone */}
            <div
              onClick={() => handleCatPartClick('Prabh', 'nose')}
              style={{
                position: 'absolute',
                top: 20,
                left: 24,
                width: 16,
                height: 12,
                cursor: 'pointer',
                // Debug: background: 'rgba(0,255,0,0.2)',
              }}
            />

            {/* Belly touch zone */}
            <div
              onClick={() => handleCatPartClick('Prabh', 'belly')}
              style={{
                position: 'absolute',
                top: 32,
                left: 12,
                width: 40,
                height: 20,
                cursor: 'pointer',
                // Debug: background: 'rgba(0,0,255,0.2)',
              }}
            />

            {/* Tail touch zone */}
            <div
              onClick={() => handleCatPartClick('Prabh', 'tail')}
              style={{
                position: 'absolute',
                top: 36,
                left: 48,
                width: 12,
                height: 24,
                cursor: 'pointer',
                // Debug: background: 'rgba(255,255,0,0.2)',
              }}
            />
          </div>
        </div>

        {/* SEHAJ (Ginger Cat) */}
        <div
          style={{
            position: 'absolute',
            left: sehajState.position.x,
            top: sehajState.position.y,
            width: 64,
            height: 64,
            zIndex: 21,
          }}
        >
          {/* Touch Zones */}
          <div style={{ position: 'relative', width: 64, height: 64 }}>
            {/* Sprite */}
            <SpriteAnimator
              spriteSheet="ginger_cat_sprite.png"
              metadata={sehajMetadata}
              animation={sehajState.animation}
              width={64}
              height={64}
              loop={sehajState.animation.includes('walk') || sehajState.animation === 'sleep'}
            />

            {/* Head touch zone */}
            <div
              onClick={() => handleCatPartClick('Sehaj', 'head')}
              style={{
                position: 'absolute',
                top: 0,
                left: 16,
                width: 32,
                height: 24,
                cursor: 'pointer',
              }}
            />

            {/* Nose touch zone */}
            <div
              onClick={() => handleCatPartClick('Sehaj', 'nose')}
              style={{
                position: 'absolute',
                top: 20,
                left: 24,
                width: 16,
                height: 12,
                cursor: 'pointer',
              }}
            />

            {/* Belly touch zone */}
            <div
              onClick={() => handleCatPartClick('Sehaj', 'belly')}
              style={{
                position: 'absolute',
                top: 32,
                left: 12,
                width: 40,
                height: 20,
                cursor: 'pointer',
              }}
            />

            {/* Tail touch zone */}
            <div
              onClick={() => handleCatPartClick('Sehaj', 'tail')}
              style={{
                position: 'absolute',
                top: 36,
                left: 48,
                width: 12,
                height: 24,
                cursor: 'pointer',
              }}
            />
          </div>
        </div>
      </div>

      {/* Target Selector */}
      <div style={{
        position: 'fixed',
        bottom: 150,
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        gap: '8px',
        background: 'rgba(255,255,255,0.15)',
        backdropFilter: 'blur(10px)',
        padding: '8px',
        borderRadius: '20px',
        zIndex: 50,
      }}>
        {(['Prabh', 'Sehaj', 'Both'] as TargetMode[]).map(mode => (
          <motion.button
            key={mode}
            onClick={() => { setTargetMode(mode); haptics.light(); }}
            style={{
              padding: '8px 16px',
              background: targetMode === mode ? 'rgba(255,255,255,0.4)' : 'transparent',
              border: 'none',
              borderRadius: '12px',
              color: '#fff',
              fontSize: '14px',
              fontWeight: 'bold',
              cursor: 'pointer',
            }}
            whileTap={{ scale: 0.95 }}
          >
            {mode}
          </motion.button>
        ))}
      </div>

      {/* Bottom Action Bar */}
      <motion.div
        style={{
          position: 'fixed',
          bottom: 20,
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          gap: '12px',
          background: 'rgba(255,255,255,0.2)',
          backdropFilter: 'blur(15px)',
          padding: '12px 20px',
          borderRadius: '25px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
          zIndex: 100,
        }}
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', damping: 20 }}
      >
        {/* Primary Actions */}
        <ActionButton icon="👁️" label="Wake" onClick={() => performAction('wake')} />
        <ActionButton icon="😴" label="Sleep" onClick={() => performAction('sleep')} />
        <ActionButton icon="🍗" label="Feed" onClick={() => performAction('feed')} />
        <ActionButton 
          icon="⋯" 
          label="More" 
          onClick={() => { setShowSecondaryPanel(!showSecondaryPanel); haptics.light(); }}
        />
      </motion.div>

      {/* Secondary Action Panel */}
      <AnimatePresence>
        {showSecondaryPanel && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            style={{
              position: 'fixed',
              bottom: 100,
              left: '50%',
              transform: 'translateX(-50%)',
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '12px',
              background: 'rgba(255,255,255,0.25)',
              backdropFilter: 'blur(15px)',
              padding: '16px',
              borderRadius: '20px',
              boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
              zIndex: 99,
            }}
          >
            <ActionButton icon="🐾" label="Pet" onClick={() => performAction('pet')} />
            <ActionButton icon="🎮" label="Gaming" onClick={() => performAction('gaming')} />
            <ActionButton icon="💥" label="Kick" onClick={() => performAction('kick')} />
            <ActionButton icon="👋" label="Nudge" onClick={() => performAction('nudge')} />
            <ActionButton icon="❤️" label="Cuddle" onClick={() => performAction('cuddle')} />
            <ActionButton icon="🎭" label="Drama" onClick={() => performAction('drama')} />
            <ActionButton icon="🧣" label="Blanket" onClick={() => performAction('hogBlanket')} />
            <ActionButton icon="🌙" label="Lights" onClick={() => performAction('lightsOut')} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ============ ACTION BUTTON COMPONENT ============

interface ActionButtonProps {
  icon: string;
  label: string;
  onClick: () => void;
}

function ActionButton({ icon, label, onClick }: ActionButtonProps) {
  return (
    <motion.button
      onClick={onClick}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '4px',
        background: 'transparent',
        border: 'none',
        cursor: 'pointer',
        padding: '8px',
        borderRadius: '12px',
        minWidth: '60px',
      }}
      whileHover={{ scale: 1.1, background: 'rgba(255,255,255,0.2)' }}
      whileTap={{ scale: 0.95 }}
    >
      <span style={{ fontSize: '24px' }}>{icon}</span>
      <span style={{ fontSize: '10px', color: '#fff', fontWeight: '500' }}>{label}</span>
    </motion.button>
  );
}
