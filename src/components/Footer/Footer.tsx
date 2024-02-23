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
    togglePlayPreviousSong,
    songList
  ] = usePlaybackStore((state: any) => [
    state.isPlaying,
    state.isLoading,
    state.setIsLoading,
    state.setIsPlaying,
    state.playbackSong,
    state.setPlaybackSong,
    state.togglePlayNextSong,
    state.togglePlayPreviousSong,
    state.songList
  ])

  const [footerAudioURL, setFooterAudioURL] = useState<string | undefined>(undefined)
  const audioPlayerRef = useRef<AudioPlayer>(null)

  // State to store current playback time
  const [currentTime, setCurrentTime] = useState<number>(0)

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

  // Effect hook for handling play button click to load and play the first song if no song is loaded
  useEffect(() => {
    // Define a function to handle play button click
    const handlePlayButtonClick = () => {
      // Check if no song is loaded
      if (!playbackSong || !playbackSong.audioURL) {
        // Load and play the first song from songList if it exists
        if (songList.length > 0) {
          const firstSong = songList[0]
          setPlaybackSong(firstSong)
          setIsPlaying(true) // This should trigger the audio player to play the song
        }
      }
    }

    // Get the play button element from the AudioPlayer component
    const playButton = audioPlayerRef?.current?.audio?.current?.parentNode?.querySelector(
      '.rhap_play-pause-button'
    )

    // Add event listener to the play button
    playButton?.addEventListener('click', handlePlayButtonClick)

    // Clean up function to remove event listener
    return () => {
      playButton?.removeEventListener('click', handlePlayButtonClick)
    }
  }, [playbackSong, songList, setPlaybackSong, setIsPlaying])

  // Render ======================================================

  return (
    <div className="footerContainer">
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
                confederacyHost={constants.confederacyURL}
                className="playerAlbumArt"
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
        autoPlayAfterSrcChange
        progressUpdateInterval={10}
        showSkipControls
        showJumpControls={false}
        onPlay={() => {
          setIsPlaying(true)
        }}
        onPause={() => {
          setIsPlaying(false)
        }}
        onEnded={() => togglePlayNextSong()}
        onClickPrevious={() => {
          togglePlayPreviousSong()
        }}
        onClickNext={() => {
          togglePlayNextSong()
        }}
        onListen={event => {
          const target = event.target as HTMLAudioElement
          setCurrentTime(target.currentTime)
        }}
        listenInterval={1000}
      />
    </div>
  )
}
export default Footer
