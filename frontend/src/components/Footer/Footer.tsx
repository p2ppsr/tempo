/**
 * @file Footer.tsx
 * @description
 * React component providing the audio playback controls and song info display
 * for the Tempo app’s footer. Integrates with global playback state, handles
 * decryption of songs, album art display, and user interactions like next/prev
 * or automatic progression when songs end.
 */

import { CircularProgress } from '@mui/material'
import { useEffect, useRef, useState } from 'react'
import AudioPlayer from 'react-h5-audio-player'
import placeholderImage from '../../assets/Images/placeholder-image.png'
import { useAuthStore, usePlaybackStore, useModals } from '../../stores/stores'
import decryptSong from '../../utils/decryptSong'
import { Img, Source } from '@bsv/uhrp-react'

import 'react-h5-audio-player/lib/styles.css'
import './Footer.scss'
import checkForMetaNetClient from '../../utils/checkForMetaNetClient'

/**
 * Footer Component
 *
 * Displays an audio player with playback controls, artwork, and song metadata.
 * - Uses global playback store (`usePlaybackStore`) to synchronize playing state.
 * - Handles song decryption and URL management.
 * - Integrates invitation modal if playback advances when user lacks Metanet client.
 * - Manages album artwork display, fallback image on error, and object URL revocation.
 */
const Footer = () => {
  // ========== GLOBAL STATE ==========
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

  // ========== COMPONENT STATE ==========
  const [footerSongURL, setFooterSongURL] = useState<string | undefined>(undefined)
  const [artworkError, setArtworkError] = useState(false)
  const audioPlayerRef = useRef<AudioPlayer>(null)
  const [isPreviewOnly, setIsPreviewOnly] = useState(false)

  // ========== EFFECTS ==========
  // Load and decrypt song on playback change
  useEffect(() => {
    const handlePlaybackChange = async () => {
      if (playbackSong) {
        console.log('[Footer] New Playback Song Detected:', playbackSong.title)
        setIsLoading(true)
        setFooterSongURL(undefined)
        setIsPreviewOnly(false)

        try {
          const hasMnc = await checkForMetaNetClient()
          console.log('[Footer] MetaNet Client Present:', hasMnc)

          if (audioPlayerRef.current?.audio?.current) {
            audioPlayerRef.current.audio.current.pause()
            audioPlayerRef.current.audio.current.currentTime = 0
          }

          const previewElement = document.getElementById('preview-audio') as HTMLAudioElement | null
          if (previewElement) {
            previewElement.pause()
            previewElement.currentTime = 0
          }

          let url: string | undefined

          console.log(['Footer] URL Check for Playback Song:', playbackSong.songURL])
          if (playbackSong.songURL?.startsWith('/assets/')) {
            // Always allow static preview files
            url = playbackSong.songURL
            setIsPreviewOnly(false)
          } else if (hasMnc) {
            url = await decryptSong(playbackSong)
            setIsPreviewOnly(false)
          } else if (playbackSong.previewURL) {
            const hashOnly = playbackSong.previewURL.split('/').pop() || ''
            url = hashOnly
            setIsPreviewOnly(true)
          } else {
            url = ''
            console.warn('[Footer] No playable URL found')
          }

          if (url) {
            setFooterSongURL(url)
            setIsPlaying(true)
          } else {
            setFooterSongURL(undefined)
          }
        } catch (err) {
          console.error('[Footer] Error processing playback:', err)
          setFooterSongURL(undefined)
        } finally {
          setIsLoading(false)
        }
      }
    }
    handlePlaybackChange()
  }, [playbackSong])

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

  // ========== RENDER ==========
  console.log('[Footer] Final src being passed into AudioPlayer:', footerSongURL)

  return (
    <div className="footerContainer" style={{ gridArea: 'footer' }}>
      <div className="playbackInfoContainer">
        {isLoading ? (
          <CircularProgress />
        ) : (
          <>
            {playbackSong.artworkURL && (
              <Img
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

      {isPreviewOnly && footerSongURL ? (
        <audio
          key={playbackSong?.title}
          controls
          autoPlay
          onCanPlayThrough={(e) => {
          try {
            (e.currentTarget as HTMLAudioElement).play()
          } catch (err) {
            console.warn('[Footer] onCanPlayThrough error:', err)
          }
        }}
          onEnded={() => {
            if (userHasMetanetClient) {
              togglePlayNextSong()
            } else {
              setInvitationModalOpen(true)
              setInvitationModalContent('songEnd')
            }
          }}
        >
          <Source
            src={footerSongURL}
            type="audio/mpeg"
          />
          Your browser does not support the audio element.
        </audio>
        ) : (
        <AudioPlayer
          key={playbackSong?.title}
          ref={audioPlayerRef}
          src={
            footerSongURL &&
            (footerSongURL.startsWith('blob:') ||
              footerSongURL.startsWith('http') ||
              footerSongURL.startsWith('/assets/'))
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
      )}
    </div>
  )
}

export default Footer
