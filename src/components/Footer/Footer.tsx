import { download } from 'nanoseek'
import React, { useEffect, useRef, useState } from 'react'
import useAsyncEffect from 'use-async-effect'
import AudioPlayer from 'react-h5-audio-player'
import { Img } from 'uhrp-react'
import { usePlaybackStore } from '../../stores/stores'
import { CircularProgress } from '@mui/material'
import constants from '../../utils/constants'
import decryptSong from '../../utils/decryptSong'
import placeholderImage from '../../assets/Images/placeholder-image.png'

import 'react-h5-audio-player/lib/styles.css'
import './Footer.scss'

const Footer = () => {
  // State ========================================================

  const [
    isPlaying,
    isLoading,
    setIsLoading,
    setIsPlaying,
    playbackSong,
    setPlaybackSong,
    togglePlayNextSong,
  ] = usePlaybackStore((state: any) => [
    state.isPlaying,
    state.isLoading,
    state.setIsLoading,
    state.setIsPlaying,
    state.playbackSong,
    state.setPlaybackSong,
    state.togglePlayNextSong
  ])

  const [footerAudioURL, setFooterAudioURL] = useState<string | undefined>(undefined)
  const audioPlayerRef = useRef<AudioPlayer>(null)

  // Handlers ====================================================

  

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

  useEffect(() => {
    if (isLoading) {
      setFooterAudioURL('')
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
                // @ts-ignore
                onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                  const target = e.target as HTMLImageElement
                  target.src = placeholderImage
                }}
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
        onEnded={() => togglePlayNextSong()}
        progressUpdateInterval={10}
      />
    </div>
  )
}
export default Footer
