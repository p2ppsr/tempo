import React, { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { useScroll } from 'react-use-gesture'
import useSwipeScroll from './useSwipeScroll'

import { CircularProgress } from '@mui/material'
import { Img } from 'uhrp-react'
import useAsyncEffect from 'use-async-effect'
import placeholderImage from '../../assets/Images/placeholder-image.png'
import { usePlaybackStore } from '../../stores/stores'
import { SearchFilter, Song } from '../../types/interfaces'
import fetchSongs from '../../utils/fetchSongs/fetchSongs'
import SongList from '../SongList/SongList'
import './NewReleases.scss'

const clamp = (value: number, clampAt: number = 60) => Math.min(clampAt, Math.max(-clampAt, value))

interface NewReleasesProps {
  className?: string
}

const NewReleases = ({ className }: NewReleasesProps) => {
  // Global state for audio playback. Includes playing status, audio, artwork url, and setters for each
  const [
    isPlaying,
    setIsPlaying,
    playbackSong,
    setPlaybackSong
  ] = usePlaybackStore((state: any) => [
    state.isPlaying,
    state.setIsPlaying,
    state.playbackSong,
    state.setPlaybackSong
  ])

  const [songs, setSongs] = useState<Song[]>([])

  const ref = useRef(null)
  useSwipeScroll({ sliderRef: ref })
  const [rotation, setRotation] = useState(0)

  const bind = useScroll(event => {
    const rotationFactor = 4 // Adjust this factor to increase or decrease sensitivity
    setRotation(event.scrolling ? clamp(event.delta[0] * rotationFactor) : 0)
  })

  useAsyncEffect(async () => {
    const searchFilter = { findAll: true, artistIdentityKey: '' } as SearchFilter
    try {
      // Get a list of song objects
      const res = await fetchSongs(searchFilter)
      setSongs(res.reverse()) // Newest songs on top (note performance with large results)
    } catch (e) {
      console.log(e)
    }
  }, [])

  return (
    <div className={`container ${className}`}>

      <h1>New Releases</h1>
      {songs.length === 0 ? (
        <CircularProgress style={{ marginTop: '1rem' }} />
      ) : (
        <>
          <div className="horizontalArtworkScroller" ref={ref} {...bind()}>
            {songs.map((newRelease, i) => {
              return (
                <motion.div
                  key={i}
                  animate={{
                    transform: `perspective(500px) rotateY(${rotation}deg)`
                  }}
                  className="newReleaseCardContainer"
                >
                  <Img
                    className="newReleaseCard"
                    src={newRelease.artworkURL} // placeholderImage
                    //@ts-ignore TODO: update uhrp-react to not throw TS errors for img attributes
                    onClick={() => {
                      const { title, artist, songURL, artworkURL } = newRelease
                      setPlaybackSong(newRelease)
                    }}
                    // Set the image to a placeholder if an image was not found
                    onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                      const target = e.target as HTMLImageElement
                      target.src = placeholderImage
                    }}
                  />
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
