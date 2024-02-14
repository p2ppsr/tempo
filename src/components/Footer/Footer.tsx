import { download } from 'nanoseek'
import React, { useEffect, useRef, useState } from 'react'
import AudioPlayer from 'react-h5-audio-player'
import 'react-h5-audio-player/lib/styles.css'
import { Img } from 'uhrp-react'
import useAsyncEffect from 'use-async-effect'
import { usePlaybackStore } from '../../stores/stores'
import constants from '../../utils/constants'
import './Footer.scss'
import decryptSong from '../../utils/decryptSong'
import { CircularProgress } from '@mui/material'

const Footer = () => {
  // State ========================================================

  const [
    isPlaying,
    isLoading,
    setIsLoading,
    setIsPlaying,
    playbackSong,
    setPlaybackSong
  ] = usePlaybackStore((state: any) => [
    state.isPlaying,
    state.isLoading,
    state.setIsLoading,
    state.setIsPlaying,
    state.playbackSong,
    state.setPlaybackSong
  ])

  const [footerAudioURL, setFooterAudioURL] = useState<string | undefined>(undefined)
  const audioPlayerRef = useRef<AudioPlayer>(null)

  // Lifecycle ===================================================

  useAsyncEffect(async () => {
    if (playbackSong) {
      setIsLoading(true)
      try {
        const decryptedAudio = await decryptSong(playbackSong)
        setIsLoading(false)
        setFooterAudioURL(decryptedAudio) // Load and set new song URL
        setIsPlaying(true)
      } catch (e) {
        console.error(e)
      }
    }
  }, [playbackSong])

  /* Clearing the src directly was not working; 
  use the reference to player element to manually pause and clear the source */
  useEffect(() => {
    if (isLoading) {
      setFooterAudioURL('')
      // if (audioPlayerRef.current && audioPlayerRef.current.audio.current) {
      //   audioPlayerRef.current.audio.current.pause()
      //   audioPlayerRef.current.audio.current.src = ''
      // }
    }
  }, [isLoading])

  useEffect(() => {
    return () => {
      if (footerAudioURL) {
        URL.revokeObjectURL(footerAudioURL)
      }
    }
  }, [footerAudioURL])

  // Render ======================================================

  return (
    <div className="footer">
      <div className="playbackInfoContainer">
        {isLoading ? (
          <CircularProgress />
        ) : (
          <>
            {playbackSong.artworkURL && (
              <Img
                alt={`${playbackSong.playingAudioTitle} Album Art`}
                id="playerAlbumArt"
                src={playbackSong.artworkURL}
                className="playerAlbumArt"
                confederacyHost={constants.confederacyURL}
              />
            )}
          </>
        )}
        <div className="titleArtistContainer">
          <p className="songTitle"> {playbackSong.title} </p>
          <p className="artistName"> {playbackSong.artist} </p>
        </div>
      </div>
      <AudioPlayer
        ref={audioPlayerRef}
        src={footerAudioURL}
        autoPlayAfterSrcChange={true}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={() => setIsPlaying(false)}
        progressUpdateInterval={10}
      />
    </div>
  )
}
export default Footer
