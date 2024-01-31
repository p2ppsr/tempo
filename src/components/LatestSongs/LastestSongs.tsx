import { useRef, useState } from "react"
import useSwipeScroll from "./useSwipeScroll"
import { useScroll } from "react-use-gesture"
import "./LatestSongs.scss"
// import SongsViewer from '../SongsViewer/SongsViewer'
import { Link } from "react-router-dom"
import { PublicKey } from "babbage-bsv"
import { motion } from "framer-motion"
import React from "react"

const clamp = (value: number, clampAt: number = 60) =>
  Math.min(clampAt, Math.max(-clampAt, value))

const beatlesArtwork = "/AlbumArtwork/beatles.jpg"

// TODO: Make this dynamic
const songArtwork = [
  beatlesArtwork,
  beatlesArtwork,
  beatlesArtwork,
  beatlesArtwork,
  beatlesArtwork,
  beatlesArtwork,
]

interface LatestSongProps {
  className: string
}

const LatestSongs = ({ className }: LatestSongProps) => {
  const ref = useRef(null)
  useSwipeScroll({ sliderRef: ref })

  const [rotation, setRotation] = useState(0)

  const bind = useScroll((event) => {
    const rotationFactor = 4 // Adjust this factor to increase or decrease sensitivity
    setRotation(event.scrolling ? clamp(event.delta[0] * rotationFactor) : 0)
  })

  return (
    <div className={`mainContainer ${className}`}>
      <div className="horizontalArtworkScroller" ref={ref} {...bind()}>
        {songArtwork.map((src, i) => (
          <Link key={i} to="/">
            <motion.img
              className="cardLarge"
              src={src}
              animate={{
                transform: `perspective(500px) rotateY(${rotation}deg)`,
              }}
            />
          </Link>
        ))}
      </div>
      <div className="tableHeader">
        <h3>New Releases</h3>
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
