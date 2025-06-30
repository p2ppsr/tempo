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

const clamp = (value: number, clampAt: number = 60) => Math.min(clampAt, Math.max(-clampAt, value))

interface NewReleasesProps {
  className?: string
}

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

  return (
    <div className={`container ${className}`}>
      <h1>New Releases</h1>
      {songs.length === 0 ? (
        <CircularProgress style={{ marginTop: '1rem' }} />
      ) : (
        <>
          <div className="horizontalArtworkScroller" ref={ref} {...bind()}>
            {songs.map((newRelease, i) => (
              <motion.div
                key={i}
                animate={{ transform: `perspective(500px) rotateY(${rotation}deg)` }}
                className="newReleaseCardContainer"
              >
                <Img
                  className="newReleaseCard"
                  src={newRelease.artworkURL || placeholderImage}
                  onClick={() => setPlaybackSong(newRelease)}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = placeholderImage
                  }}
                />
              </motion.div>
            ))}
          </div>

          <SongList songs={songs} />
        </>
      )}
    </div>
  )
}

export default NewReleases
