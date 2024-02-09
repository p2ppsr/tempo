import { download } from 'nanoseek'
import React, { useState } from 'react'
import AudioPlayer from 'react-h5-audio-player'
import 'react-h5-audio-player/lib/styles.css'
import { Img } from 'uhrp-react'
import useAsyncEffect from 'use-async-effect'
import { usePlaybackStore } from '../../stores/stores'
import constants from '../../utils/constants'
import './Footer.scss'
import decryptSong from '../../utils/decryptSong'

const Footer = () => {
  // State ========================================================

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

  const [localSongURL, setLocalSongURL] = useState() as any

  // Lifecycle ===================================================

  useAsyncEffect(async () => {
    console.log('playback change')

    try {
      const decryptedAudio = await decryptSong(playbackSong)
      setLocalSongURL(decryptedAudio)
    } catch (e) {
      console.error(e)
    }

    // Cleanup function
    return () => {
      if (playbackSong.audioSource) {
        URL.revokeObjectURL(playbackSong.audioSource)
      }
    }
  }, [playbackSong])

  // Render ======================================================

  return (
    <div className="footer">
      <div className="playbackInfoContainer">
        {playbackSong.artworkURL && (
          <Img
            alt={`${playbackSong.playingAudioTitle} Album Art`}
            id="playerAlbumArt"
            src={playbackSong.artworkURL}
            className="playerAlbumArt"
            confederacyHost={constants.confederacyURL}
          />
        )}
        <div className="titleArtistContainer">
          <p className="songTitle"> {playbackSong.title} </p>
          <p className="artistName"> {playbackSong.artist} </p>
        </div>
      </div>
      <AudioPlayer src={localSongURL} />
    </div>
  )
}
export default Footer
