import { CircularProgress } from '@mui/material'
import React, { useEffect, useRef, useState } from 'react'
import AudioPlayer from 'react-h5-audio-player'
import { Img } from 'uhrp-react'
import useAsyncEffect from 'use-async-effect'
import placeholderImage from '../../assets/Images/placeholder-image.png'
import { useAuthStore, usePlaybackStore, useModals } from '../../stores/stores'
import constants from '../../utils/constants'
import decryptSong from '../../utils/decryptSong'

import 'react-h5-audio-player/lib/styles.css'
import './Footer.scss'

const Footer = () => {
  // Global State ========================================================

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

  const [userHasMetanetClient, setUserHasMetanetClient] = useAuthStore((state: any) => [
    state.userHasMetanetClient,
    state.setUserHasMetanetClient
  ])

  const [invitationModalOpen, setInvitationModalOpen, setInvitationModalContent] = useModals((state: any) => [
    state.invitationModalOpen,
    state.setInvitationModalOpen,
    state.setInvitationModalContent
  ])

  // Component state ========================================================

  const [footerSongURL, setFooterSongURL] = useState<string | undefined>(undefined)
  const audioPlayerRef = useRef<AudioPlayer>(null)

  // Tracks current playback time
  const [currentTime, setCurrentTime] = useState<number>(0)

  // Lifecycle ===================================================

  useAsyncEffect(async () => {
    if (playbackSong) {
      console.log(playbackSong)
      setIsLoading(true)
      try {
        const decryptedAudio = await decryptSong(playbackSong)
        setFooterSongURL(decryptedAudio) // Load and set new song URL
        setIsPlaying(true)
      } catch (e) {
        console.error(e)
        setFooterSongURL(playbackSong.songURL) // TODO: Handle previews more elegantly? See pages/NoMncPreview.tsx
      } finally {
        setIsLoading(false)
      }
    }
  }, [playbackSong])

  useEffect(() => {
    if (isLoading) {
      setFooterSongURL('')
    }
  }, [isLoading])

  useEffect(() => {
    return () => {
      if (footerSongURL) {
        URL.revokeObjectURL(footerSongURL)
      }
    }
  }, [footerSongURL])

  // Effect hook for handling play button click to load and play the first song if no song is loaded
  useEffect(() => {
    // Define a function to handle play button click
    const handlePlayButtonClick = () => {
      // Check if no song is loaded
      if (!playbackSong || !playbackSong.songURL) {
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
        src={footerSongURL}
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
        onEnded={() => {
          // If user is logged into Metanet Client, play next song. If not, open the invitation modal
          if (userHasMetanetClient) {
            togglePlayNextSong()
          } else {
            setInvitationModalOpen(true)
            setInvitationModalContent('songEnd')
          }
        }}
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
