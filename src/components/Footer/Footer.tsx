import * as metaDataBrowser from "music-metadata-browser"
import React, { useEffect, useRef } from "react"
import AudioPlayer from "react-h5-audio-player"
import "react-h5-audio-player/lib/styles.css"
import { Img } from "uhrp-react"
import constants from "../../utils/constants"

import "./Footer.scss"

import useAsyncEffect from "use-async-effect"
import { usePlaybackStore } from "../../stores/stores"

import dummySong from "../../assets/Music/song1.mp3"

const Footer = () => {
  // State ========================================================

  const [
    isPlaying,
    setIsPlaying,

    playingAudioUrl,
    setPlayingAudioUrl,

    playingAudioTitle,
    setPlayingAudioTitle,

    playingAudioArtist,
    setPlayingAudioArtist,

    playingArtworkUrl,
    setPlayingArtworkUrl,
  ] = usePlaybackStore((state: any) => [
    state.isPlaying,
    state.setIsPlaying,

    state.playingAudioUrl,
    state.setPlayingAudioUrl,

    state.playingAudioTitle,
    state.setPlayingAudioTitle,

    state.playingAudioArtist,
    state.setPlayingAudioArtist,

    state.playingArtworkUrl,
    state.setPlayingArtworkUrl,
  ])

  const audioPlayerRef = useRef<any>(null)

  // const playAudio = () => {
  //   audioPlayerRef.current?.play()
  // }

  // const pauseAudio = () => {
  //   if (audioPlayerRef.current) {
  //     audioPlayerRef.current.pause();
  //   }
  // }

  // // Connection between global playback state and footer's playback
  // useEffect(()=>{
  //   isPlaying ? playAudio() : pauseAudio()
  // },[isPlaying])

  // Life cycle ===================================================

  useAsyncEffect(async () => {
    try {
      const metaData = await metaDataBrowser.fetchFromUrl(dummySong)
      setPlayingAudioTitle(metaData.common.title || "Unknown Title")

      // Check if album art is available and set the album art URL
      const picture = metaData.common.picture && metaData.common.picture[0]
      if (picture) {
        const blob = new Blob([picture.data], { type: picture.format })
        const url = URL.createObjectURL(blob)
        setPlayingArtworkUrl(url)
      }
    } catch (error) {
      console.error("Error reading metadata", error)
      setPlayingAudioTitle("Error loading title")
    }
  }, [])

  // Render ======================================================

  return (
    <div className="footer">
      <div className="titleContainer">
        {playingArtworkUrl && (
          <Img
            alt={`${playingAudioTitle} Album Art`}
            id="playerAlbumArt"
            src={playingArtworkUrl}
            className="playerAlbumArt"
            confederacyHost={constants.confederacyURL}
          />
        )}
        <div style={{display:'block'}}>
          <p className="songTitle"> {playingAudioTitle} </p>
          <p className="artistName"> {playingAudioArtist} </p>
        </div>
      </div>
      <AudioPlayer
        // autoPlay
        src={playingAudioUrl}
        onPlay={(e) => console.log("onPlay")}
      />
    </div>
  )
}
export default Footer
