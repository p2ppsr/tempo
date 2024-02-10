import React from "react"
import { useRef, useState } from "react"
import { useScroll } from "react-use-gesture"
import "./NewReleases.scss"
import useSwipeScroll from "./useSwipeScroll"
// import SongsViewer from '../SongsViewer/SongsViewer'
import { motion } from "framer-motion"
import { Link } from "react-router-dom"

import beatlesArtwork from "../../assets/AlbumArtwork/beatles.jpg"

const clamp = (value: number, clampAt: number = 60) =>
  Math.min(clampAt, Math.max(-clampAt, value))

// TODO: This will be dynamic
const songArtwork = [
  beatlesArtwork,
  beatlesArtwork,
  beatlesArtwork,
  beatlesArtwork,
  beatlesArtwork,
  beatlesArtwork,
]

interface NewReleasesProps {
  className?: string
}

const LatestSongs = ({ className }: NewReleasesProps) => {
  const ref = useRef(null)
  useSwipeScroll({ sliderRef: ref })

  const [rotation, setRotation] = useState(0)

  const bind = useScroll((event) => {
    const rotationFactor = 4 // Adjust this factor to increase or decrease sensitivity
    setRotation(event.scrolling ? clamp(event.delta[0] * rotationFactor) : 0)
  })

  return (
    <div className={`container ${className}`}>
      <h1 className="whiteText">New Releases</h1>
      <div className="horizontalArtworkScroller" ref={ref} {...bind()}>
        {songArtwork.map((src, i) => (
          <Link key={i} to="/">
            <motion.img
              className="newReleaseCard"
              src={src}
              animate={{
                transform: `perspective(500px) rotateY(${rotation}deg)`,
              }}
            />
          </Link>
        ))}
      </div>

      

      {/* <SongsViewer
				searchFilter={{
					findAll: 'true',
					artistIdentityKey: '' // TODO: make this dynamic
				}}
				mySongsOnly={false}
			/> */}
    </div>
  )
}

export default LatestSongs
