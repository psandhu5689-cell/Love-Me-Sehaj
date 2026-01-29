import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react'
import { Howl } from 'howler'

export const PLAYLIST = [
  {
    id: 1,
    title: "It's Love",
    artist: "RealestK",
    url: "https://customer-assets.emergentagent.com/job_love-adventure-49/artifacts/230dit60_RealestK%20-%20It%27s%20Love%20%28Official%20Audio%29.mp3",
  },
  {
    id: 2,
    title: "Apocalypse",
    artist: "Cigarettes After Sex",
    url: "https://customer-assets.emergentagent.com/job_add-this-1/artifacts/cufh3d12_Apocalypse%20-%20Cigarettes%20After%20Sex.mp3",
  },
  {
    id: 3,
    title: "Fall in Love with You",
    artist: "Montell Fish",
    url: "https://customer-assets.emergentagent.com/job_add-this-1/artifacts/ixjjhzww_Montell%20Fish%20-%20Fall%20in%20Love%20with%20You.%20%28Lyrics%29.mp3",
  },
  {
    id: 4,
    title: "Love Me",
    artist: "RealestK",
    url: "https://customer-assets.emergentagent.com/job_add-this-1/artifacts/2b5nalgs_RealestK%20-%20Love%20Me%20%28Official%20Audio%29.mp3",
  },
  {
    id: 5,
    title: "Meet Me in Amsterdam",
    artist: "RINI",
    url: "https://customer-assets.emergentagent.com/job_add-this-1/artifacts/950vb5hm_RINI%20-%20Meet%20Me%20in%20Amsterdam%20%28Audio%29.mp3",
  },
]

interface MusicContextType {
  currentTrackIndex: number
  isPlaying: boolean
  isMuted: boolean
  currentTrack: typeof PLAYLIST[0]
  progress: number
  duration: number
  playTrack: (index: number) => void
  togglePlayPause: () => void
  toggleMute: () => void
  nextTrack: () => void
  previousTrack: () => void
  needsUserInteraction: boolean
  enableMusic: () => void
}

const MusicContext = createContext<MusicContextType>({
  currentTrackIndex: 0,
  isPlaying: false,
  isMuted: false,
  currentTrack: PLAYLIST[0],
  progress: 0,
  duration: 0,
  playTrack: () => {},
  togglePlayPause: () => {},
  toggleMute: () => {},
  nextTrack: () => {},
  previousTrack: () => {},
  needsUserInteraction: true,
  enableMusic: () => {},
})

export const useMusic = () => useContext(MusicContext)

export const MusicProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // FIXED: Start with random track index for variety on each fresh app load
  const [currentTrackIndex, setCurrentTrackIndex] = useState(() => Math.floor(Math.random() * PLAYLIST.length))
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [progress, setProgress] = useState(0)
  const [duration, setDuration] = useState(0)
  const [needsUserInteraction, setNeedsUserInteraction] = useState(true)
  const soundRef = useRef<Howl | null>(null)
  const progressInterval = useRef<number | null>(null)

  useEffect(() => {
    const savedMuted = localStorage.getItem('music_muted')
    const savedIndex = localStorage.getItem('music_track_index')
    const musicEnabled = localStorage.getItem('music_enabled')
    
    if (savedMuted) setIsMuted(savedMuted === 'true')
    if (savedIndex) setCurrentTrackIndex(parseInt(savedIndex, 10))
    
    // Check if music was previously enabled by user
    if (musicEnabled === 'true') {
      setNeedsUserInteraction(false)
      setTimeout(() => {
        loadTrack(savedIndex ? parseInt(savedIndex, 10) : 0, savedMuted !== 'true')
      }, 500)
    } else {
      // Try autoplay - if it fails, we'll need user interaction
      setTimeout(() => {
        attemptAutoplay(savedIndex ? parseInt(savedIndex, 10) : 0, savedMuted !== 'true')
      }, 1000)
    }

    return () => {
      if (soundRef.current) soundRef.current.unload()
      if (progressInterval.current) clearInterval(progressInterval.current)
    }
  }, [])

  const attemptAutoplay = (index: number, shouldPlay: boolean) => {
    if (!shouldPlay) {
      loadTrack(index, false)
      return
    }

    const track = PLAYLIST[index]
    const testSound = new Howl({
      src: [track.url],
      html5: true,
      volume: 0.4,
      onplay: () => {
        // Autoplay succeeded!
        setNeedsUserInteraction(false)
        localStorage.setItem('music_enabled', 'true')
        soundRef.current = testSound
        setIsPlaying(true)
        setCurrentTrackIndex(index)
        localStorage.setItem('music_track_index', index.toString())
        setDuration(testSound.duration() || 0)
        startProgressTracking()
        
        testSound.on('end', () => {
          const nextIndex = (index + 1) % PLAYLIST.length
          setCurrentTrackIndex(nextIndex)
          loadTrack(nextIndex, !isMuted)
        })
      },
      onplayerror: () => {
        // Autoplay blocked - need user interaction
        testSound.unload()
        setNeedsUserInteraction(true)
        loadTrack(index, false)
      },
    })

    testSound.play()
  }

  const enableMusic = () => {
    setNeedsUserInteraction(false)
    localStorage.setItem('music_enabled', 'true')
    if (!isPlaying && !isMuted) {
      loadTrack(currentTrackIndex, true)
    }
  }

  const loadTrack = (index: number, autoPlay: boolean = true) => {
    if (soundRef.current) {
      soundRef.current.unload()
    }
    if (progressInterval.current) {
      clearInterval(progressInterval.current)
    }

    const track = PLAYLIST[index]
    soundRef.current = new Howl({
      src: [track.url],
      html5: true,
      volume: isMuted ? 0 : 0.4,
      onload: () => {
        setDuration(soundRef.current?.duration() || 0)
      },
      onend: () => {
        const nextIndex = (index + 1) % PLAYLIST.length
        setCurrentTrackIndex(nextIndex)
        loadTrack(nextIndex, !isMuted)
      },
    })

    if (autoPlay && !isMuted) {
      soundRef.current.play()
      setIsPlaying(true)
      startProgressTracking()
    }

    setCurrentTrackIndex(index)
    localStorage.setItem('music_track_index', index.toString())
  }

  const startProgressTracking = () => {
    if (progressInterval.current) clearInterval(progressInterval.current)
    progressInterval.current = window.setInterval(() => {
      if (soundRef.current) {
        setProgress(soundRef.current.seek() as number)
      }
    }, 500)
  }

  const playTrack = (index: number) => {
    loadTrack(index, !isMuted)
  }

  const togglePlayPause = () => {
    if (!soundRef.current) return
    
    if (isPlaying) {
      soundRef.current.pause()
      setIsPlaying(false)
      if (progressInterval.current) clearInterval(progressInterval.current)
    } else {
      soundRef.current.play()
      setIsPlaying(true)
      startProgressTracking()
    }
  }

  const toggleMute = () => {
    const newMuted = !isMuted
    setIsMuted(newMuted)
    localStorage.setItem('music_muted', newMuted.toString())
    
    if (soundRef.current) {
      soundRef.current.volume(newMuted ? 0 : 0.4)
    }
  }

  const nextTrack = () => {
    const nextIndex = (currentTrackIndex + 1) % PLAYLIST.length
    loadTrack(nextIndex, !isMuted)
  }

  const previousTrack = () => {
    const prevIndex = currentTrackIndex === 0 ? PLAYLIST.length - 1 : currentTrackIndex - 1
    loadTrack(prevIndex, !isMuted)
  }

  return (
    <MusicContext.Provider
      value={{
        currentTrackIndex,
        isPlaying,
        isMuted,
        currentTrack: PLAYLIST[currentTrackIndex],
        progress,
        duration,
        playTrack,
        togglePlayPause,
        toggleMute,
        nextTrack,
        previousTrack,
        needsUserInteraction,
        enableMusic,
      }}
    >
      {children}
    </MusicContext.Provider>
  )
}