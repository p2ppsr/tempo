import React, { useEffect, useState } from "react"
import ReactAudioPlayer from "react-audio-player"
import { Img } from "uhrp-react"
import constants from "../../utils/constants"
import * as metaDataBrowser from "music-metadata-browser"

import "./Footer.scss"

import dummySong from "../../assets/Music/song1.mp3"
import useAsyncEffect from "use-async-effect"

const Footer = () => {
  // State ========================================================

  // Song title state
  const [songTitle, setSongTitle] = useState("Loading title...")

  // Album art state
  const [albumArt, setAlbumArt] = useState("")

  // Life cycle ===================================================

  useAsyncEffect(async () => {
    try {
      const metaData = await metaDataBrowser.fetchFromUrl(dummySong)
      setSongTitle(metaData.common.title || "Unknown Title")

      // Check if album art is available and set the album art URL
      const picture = metaData.common.picture && metaData.common.picture[0]
      if (picture) {
        const blob = new Blob([picture.data], { type: picture.format })
        const url = URL.createObjectURL(blob)
        setAlbumArt(url)
      }
    } catch (error) {
      console.error("Error reading metadata", error)
      setSongTitle("Error loading title")
    }
  }, [])

  // Render ======================================================

  return (
    <div className="footer">
      <div className="titleContainer">
        {albumArt && (
          <Img
            alt={`${songTitle} Album Art`}
            id="playerAlbumArt"
            src={albumArt}
            className="playerAlbumArt"
            confederacyHost={constants.confederacyURL}
          />
        )}
        <p className="songTitle"> {songTitle} </p>
      </div>
      <ReactAudioPlayer
        src={dummySong}
        controls
        className="playerControls"
        id="audioPlayer"
      />
    </div>
  )
}
export default Footer
