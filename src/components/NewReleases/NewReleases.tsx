import React, { useEffect, useRef, useState } from 'react'
import { useScroll } from 'react-use-gesture'
import './NewReleases.scss'
import useSwipeScroll from './useSwipeScroll'
// import SongsViewer from '../SongsViewer/SongsViewer'
import { motion } from 'framer-motion'

import { CircularProgress } from '@mui/material'
import { Img } from 'uhrp-react'
import useAsyncEffect from 'use-async-effect'
import { usePlaybackStore } from '../../stores/stores'
import { SearchFilter, Song } from '../../types/interfaces'
import fetchSongs from '../../utils/fetchSongs'
import SongList from '../SongList/SongList'

const clamp = (value: number, clampAt: number = 60) => Math.min(clampAt, Math.max(-clampAt, value))

// const [newReleaseSongs, setNewReleaseSongs] = useState([{}])

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

  useEffect(() => {
    console.log(songs)
  }, [songs])

  return (
    <div className={`container ${className}`}>
      <h1 className="whiteText">New Releases</h1>
      {songs.length === 0 ? (
        <div className="container">
          <CircularProgress />
        </div>
      ) : (
        <>
          <div className="horizontalArtworkScroller" ref={ref} {...bind()}>
            {songs.map((newRelease, i) => (
              <motion.div
                key={i}
                animate={{
                  transform: `perspective(500px) rotateY(${rotation}deg)`
                }}
                className="newReleaseCardContainer"
              >
                <Img
                  className="newReleaseCard"
                  src={newRelease.artworkURL}
                  //@ts-ignore TODO: update uhrp-react to not throw TS errors for img attributes
                  onClick={() => {
                    const { title, artist, audioURL, artworkURL } = newRelease
                    setPlaybackSong({
                      title: title,
                      artist: artist,
                      audioURL: audioURL,
                      artworkURL: artworkURL
                    })
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
