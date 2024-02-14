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

  const [newReleaseSongs, setNewReleaseSongs] = useState<Song[]>([])

  const ref = useRef(null)
  useSwipeScroll({ sliderRef: ref })
  const [rotation, setRotation] = useState(0)

  const bind = useScroll(event => {
    const rotationFactor = 4 // Adjust this factor to increase or decrease sensitivity
    setRotation(event.scrolling ? clamp(event.delta[0] * rotationFactor) : 0)
  })

  useAsyncEffect(async () => {
    let searchFilter = {} as SearchFilter

    try {
      searchFilter.findAll = true
    } catch (e) {
      console.log(e)
    }

    try {
      // Get a list of song objects
      const res = await fetchSongs(searchFilter)
      const songs = await Promise.all(
        res.map(async (fetchedSong: any) => {
          return fetchedSong
        })
      )
      setNewReleaseSongs(songs)
    } catch (e) {
      if (e instanceof Error) {
        console.log(e.message)
      } else {
        // Handle cases where the caught object is not an Error instance
        console.log('An unexpected error occurred:', e)
      }
    }
  }, [])

  useEffect(() => {
    console.log(newReleaseSongs)
  }, [newReleaseSongs])

  return (
    <div className={`container ${className}`}>
      <h1 className="whiteText">New Releases</h1>
      {newReleaseSongs.length === 0 ? (
        <div className="container">
          <CircularProgress />
        </div>
      ) : (
        <>
          <div className="horizontalArtworkScroller" ref={ref} {...bind()}>
            {newReleaseSongs.map((newRelease, i) => (
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
        </>
      )}
    </div>
  )
}

export default NewReleases
