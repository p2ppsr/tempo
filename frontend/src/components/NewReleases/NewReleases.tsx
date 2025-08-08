/**
 * @file NewReleases.tsx
 * @description
 * React component that fetches and displays new song releases in Tempo.
 * Includes a horizontally scrollable artwork scroller (with swipe/scroll support)
 * and a SongList of the releases below. Falls back to demo songs if no data is
 * found on the overlay.
 */

import React, { useRef, useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useScroll } from '@use-gesture/react'
import useSwipeScroll from './useSwipeScroll'
import { CircularProgress } from '@mui/material'
import placeholderImage from '../../assets/Images/placeholder-image.png'
import { usePlaybackStore } from '../../stores/stores'
import type { Song } from '../../types/interfaces'
import fetchSongs from '../../utils/fetchSongs/fetchSongs'
import SongList from '../SongList/SongList'
import loadDemoSongs from '../../utils/loadDemoSongs.js'
import './NewReleases.scss'
import { Img } from '@bsv/uhrp-react'

/**
 * Clamps a value between -clampAt and +clampAt.
 */
const clamp = (value: number, clampAt: number = 60) => Math.min(clampAt, Math.max(-clampAt, value))

/**
 * Props for the NewReleases component.
 */
interface NewReleasesProps {
  className?: string
}

/**
 * NewReleases Component
 *
 * Fetches latest songs from the overlay and displays them in an interactive,
 * horizontally scrollable artwork carousel. Displays a song list below the carousel.
 * - Uses framer-motion for card rotation effects.
 * - Uses react-use-gesture for horizontal scroll/swipe support.
 * - Falls back to demo songs if no real songs are available.
 */
const NewReleases: React.FC<NewReleasesProps> = ({ className }) => {
  const [
    _isPlaying,
    _setIsPlaying,
    _playbackSong,
    setPlaybackSong
  ] = usePlaybackStore((state) => [
    state.isPlaying,
    state.setIsPlaying,
    state.playbackSong,
    state.setPlaybackSong
  ])

  const [songs, setSongs] = useState<Song[]>([])

  const ref = useRef<HTMLDivElement>(null)
  useSwipeScroll({ sliderRef: ref })
  const [rotation, setRotation] = useState(0)

  const bind = useScroll(({ scrolling, delta }) => {
    const rotationFactor = 4
    setRotation(scrolling ? clamp(delta[0] * rotationFactor) : 0)
  })

  // Fetch songs or fallback to demo songs
  useEffect(() => {
    (async () => {
      try {
        const query = {
          type: 'findAll',
          value: { songIDs: [] as string[] },
        } as const

        const res = await fetchSongs(query)

        if (res.length > 0) {
          setSongs(res.reverse())
        } else {
          console.warn('[NewReleases] No songs found on overlay, loading demo songs.')
          const demoSongs = await loadDemoSongs()
          setSongs(demoSongs)
        }
      } catch (e) {
        console.error('[NewReleases] Failed to fetch songs:', e)
        const demoSongs = await loadDemoSongs()
        setSongs(demoSongs)
      }
    })()
  }, [])

  // ========== RENDER ==========
  return (
    <div className={`container ${className}`}>
      <h1>New Releases</h1>
      {songs.length === 0 ? (
        <CircularProgress style={{ marginTop: '1rem' }} />
      ) : (
        <>
          <div className="horizontalArtworkScroller" ref={ref} {...bind()}>
            {songs.map((newRelease, i) => {
              const isPreviewOnly = !newRelease.decryptedSongURL && !!newRelease.previewURL

              return (
                <motion.div
                  key={i}
                  animate={{ transform: `perspective(500px) rotateY(${rotation}deg)` }}
                  className="newReleaseCardContainer"
                  style={{ position: 'relative' }} // Needed for absolute positioning the label
                >
                  <Img
                    className="newReleaseCard"
                    src={newRelease.artworkURL || placeholderImage}
                    onClick={() => {
                      const songToPlay = { ...newRelease }

                      if (!songToPlay.decryptedSongURL && songToPlay.previewURL) {
                        songToPlay.decryptedSongURL = songToPlay.previewURL
                      }

                      setPlaybackSong(songToPlay)
                    }}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = placeholderImage
                    }}
                  />

                  {isPreviewOnly && (
                    <div
                      style={{
                        position: 'absolute',
                        bottom: '6px',
                        left: '6px',
                        background: 'rgba(0,0,0,0.6)',
                        color: '#fff',
                        fontSize: '0.75rem',
                        padding: '2px 6px',
                        borderRadius: '4px'
                      }}
                    >
                      Preview
                    </div>
                  )}
                </motion.div>
              )
            })}
          </div>
          <SongList songs={songs} />
        </>
      )}
    </div>
  )
}

export default NewReleases
