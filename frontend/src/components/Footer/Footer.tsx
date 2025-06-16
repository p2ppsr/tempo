import { CircularProgress } from '@mui/material'
import { useEffect, useRef, useState } from 'react'
import AudioPlayer from 'react-h5-audio-player'
import placeholderImage from '../../assets/Images/placeholder-image.png'
import { useAuthStore, usePlaybackStore, useModals } from '../../stores/stores'
import decryptSong from '../../utils/decryptSong'

import 'react-h5-audio-player/lib/styles.css'
import './Footer.scss'

const Footer = () => {
  // Global State
  const [
    _isPlaying,
    isLoading,
    setIsLoading,
    setIsPlaying,
    playbackSong,
    setPlaybackSong,
    togglePlayNextSong,
    togglePlayPreviousSong,
    songList
  ] = usePlaybackStore((state) => [
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

  const [userHasMetanetClient] = useAuthStore((state) => [
    state.userHasMetanetClient
  ])

  const [_invitationModalOpen, setInvitationModalOpen, setInvitationModalContent] = useModals((state) => [
    state.invitationModalOpen,
    state.setInvitationModalOpen,
    state.setInvitationModalContent
  ])

  // Component State
  const [footerSongURL, setFooterSongURL] = useState<string | undefined>(undefined)
  const [artworkError, setArtworkError] = useState(false)
  const audioPlayerRef = useRef<AudioPlayer>(null)

  function hasToken(song: any): song is { token: { txid: string } } {
    return song && typeof song === 'object' && 'token' in song && typeof song.token?.txid === 'string'
  }

  // Load and decrypt song on playback change
  useEffect(() => {
    const decryptAndSet = async () => {
      if (playbackSong) {
        setIsLoading(true)
        try {
          const isDemo = hasToken(playbackSong) && playbackSong.token.txid === 'demo'
          const decryptedAudio = isDemo
            ? playbackSong.songURL
            : await decryptSong(playbackSong)

          if (
            decryptedAudio?.startsWith('blob:') ||
            decryptedAudio?.startsWith('http')
          ) {
            setFooterSongURL(decryptedAudio)
          } else {
            console.warn('Invalid footerSongURL', decryptedAudio)
            setFooterSongURL('')
          }

          setIsPlaying(true)
        } catch (e) {
          console.error(e)
          setFooterSongURL('')
        } finally {
          setIsLoading(false)
        }
      }
    }

    decryptAndSet()
  }, [playbackSong])

  // Reset URL if loading
  useEffect(() => {
    if (isLoading) {
      setFooterSongURL('')
    }
  }, [isLoading])

  // Revoke object URL on unmount
  useEffect(() => {
    return () => {
      if (footerSongURL) {
        URL.revokeObjectURL(footerSongURL)
      }
    }
  }, [footerSongURL])

  // Ensure first song plays if play clicked with no current song
  useEffect(() => {
    const handlePlayButtonClick = () => {
      if (!playbackSong || !playbackSong.songURL) {
        if (songList.length > 0) {
          const firstSong = songList[0]
          setPlaybackSong(firstSong)
          setIsPlaying(true)
        }
      }
    }

    const playButton = audioPlayerRef?.current?.audio?.current?.parentNode?.querySelector(
      '.rhap_play-pause-button'
    )

    playButton?.addEventListener('click', handlePlayButtonClick)

    return () => {
      playButton?.removeEventListener('click', handlePlayButtonClick)
    }
  }, [playbackSong, songList, setPlaybackSong, setIsPlaying])

  return (
    <div className="footerContainer">
      <div className="playbackInfoContainer">
        {isLoading ? (
          <CircularProgress />
        ) : (
          <>
            {playbackSong.artworkURL && (
              <img
                src={artworkError ? placeholderImage : playbackSong.artworkURL}
                onError={() => setArtworkError(true)}
                className="playerAlbumArt"
                alt={`${playbackSong.title} Album Art`}
              />
            )}
          </>
        )}
        <div className="titleArtistContainer">
          <p className="songTitle">{playbackSong?.title}</p>
          <p className="artistName">{playbackSong?.artist}</p>
        </div>
      </div>

      <AudioPlayer
        ref={audioPlayerRef}
        src={
          footerSongURL?.startsWith('blob:') || footerSongURL?.startsWith('http')
            ? footerSongURL
            : undefined
        }
        autoPlayAfterSrcChange
        progressUpdateInterval={10}
        showSkipControls
        showJumpControls={false}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={() => {
          if (userHasMetanetClient) {
            togglePlayNextSong()
          } else {
            setInvitationModalOpen(true)
            setInvitationModalContent('songEnd')
          }
        }}
        onClickPrevious={togglePlayPreviousSong}
        onClickNext={togglePlayNextSong}
        onListen={(event) => {
          const target = event.target as HTMLAudioElement
          console.log('Current time:', target.currentTime)
        }}
        listenInterval={1000}
      />
    </div>
  )
}

export default Footer
