import React, { useEffect } from 'react'
import { useRef, useState } from 'react'
import { useScroll } from 'react-use-gesture'
import './NewReleases.scss'
import useSwipeScroll from './useSwipeScroll'
// import SongsViewer from '../SongsViewer/SongsViewer'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'

import beatlesArtwork from '../../assets/AlbumArtwork/beatles.jpg'
import useAsyncEffect from 'use-async-effect'
import fetchSongs from '../../utils/fetchSongs'
import { SearchFilter, Song } from '../../types/interfaces'
import decryptSong from '../../utils/decryptSong'
import { Img } from "uhrp-react"

const clamp = (value: number, clampAt: number = 60) => Math.min(clampAt, Math.max(-clampAt, value))

// TODO: This will be dynamic
const songArtwork = [
  beatlesArtwork,
  beatlesArtwork,
  beatlesArtwork,
  beatlesArtwork,
  beatlesArtwork,
  beatlesArtwork
]

// const [newReleaseSongs, setNewReleaseSongs] = useState([{}])

interface NewReleasesProps {
  className?: string
}

const NewReleases = ({ className }: NewReleasesProps) => {
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

  useEffect(()=>{
    console.log(newReleaseSongs)
  },[newReleaseSongs])

  return (
    <div className={`container ${className}`}>
      <h1 className="whiteText">New Releases</h1>
      <div className="horizontalArtworkScroller" ref={ref} {...bind()}>
        {newReleaseSongs.map((newRelease, i) => (
          <div className="" key={i}>
            <Img
              className="newReleaseCard"
              src={newRelease.artworkURL}
              // animate={{
              //   transform: `perspective(500px) rotateY(${rotation}deg)`
              // }}
            />
          </div>
        ))}
      </div>
    </div>
  )
}

export default NewReleases
