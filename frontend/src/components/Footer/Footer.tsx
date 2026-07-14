import { CircularProgress } from '@mui/material'
import { useEffect, useRef, useState } from 'react'
import { toast } from 'react-toastify'
import AudioPlayer from 'react-h5-audio-player'
import { usePlaybackStore } from '../../stores/stores'
import { downloadPlayableFile, isBundledAsset } from '../../utils/catalogAvailability'
import { captureError, captureSignal } from '../../utils/usercom'
import ArtworkImage from '../ArtworkImage/ArtworkImage'

import 'react-h5-audio-player/lib/styles.css'
import './Footer.scss'

const Footer = () => {
  const [
    isLoading,
    setIsLoading,
    setIsPlaying,
    playbackSong,
    setPlaybackSong,
    togglePlayNextSong,
    togglePlayPreviousSong,
    songList
  ] = usePlaybackStore((state) => [
    state.isLoading,
    state.setIsLoading,
    state.setIsPlaying,
    state.playbackSong,
    state.setPlaybackSong,
    state.togglePlayNextSong,
    state.togglePlayPreviousSong,
    state.songList
  ])

  const [footerSongURL, setFooterSongURL] = useState<string>()
  const [isPreviewOnly, setIsPreviewOnly] = useState(false)
  const [playbackError, setPlaybackError] = useState('')
  const audioPlayerRef = useRef<AudioPlayer>(null)

  useEffect(() => {
    let active = true
    let objectUrl: string | undefined

    const loadSelectedAudio = async () => {
      if (!playbackSong?.songURL) return
      setIsLoading(true)
      setFooterSongURL(undefined)
      setPlaybackError('')

      const preview = playbackSong.previewURL
      const selected = playbackSong.decryptedSongURL || preview
      const previewOnly = Boolean(preview && selected === preview)
      setIsPreviewOnly(previewOnly)

      if (!selected) {
        setIsLoading(false)
        return
      }

      try {
        const url = await downloadPlayableFile(selected)
        if (!active) {
          if (url.startsWith('blob:')) URL.revokeObjectURL(url)
          return
        }
        objectUrl = url.startsWith('blob:') ? url : undefined
        setFooterSongURL(url)
        setIsPlaying(true)
        captureSignal('playback.started', {
          surface: 'player',
          tags: [previewOnly ? 'mode:preview' : 'mode:bundled'],
          context: { title: playbackSong.title, bundled: isBundledAsset(selected) }
        })
      } catch (error) {
        const message = 'This track stopped being available. It has been removed from playback.'
        setPlaybackError(message)
        toast.error(message)
        captureError('playback.load_failed', error, { title: playbackSong.title })
      } finally {
        if (active) setIsLoading(false)
      }
    }

    void loadSelectedAudio()
    return () => {
      active = false
      if (objectUrl) URL.revokeObjectURL(objectUrl)
    }
  }, [
    playbackSong.songURL,
    playbackSong.decryptedSongURL,
    playbackSong.previewURL,
    playbackSong.title,
    setIsLoading,
    setIsPlaying
  ])

  const unlockFullTrack = async () => {
    if (!playbackSong.songURL || isLoading) return
    setIsLoading(true)
    setPlaybackError('')
    captureSignal('purchase.started', { surface: 'player', context: { title: playbackSong.title } })
    try {
      const { default: decryptSong } = await import('../../utils/decryptSong')
      const url = await decryptSong(playbackSong)
      if (!url) throw new Error('The key server returned no playable audio.')
      setFooterSongURL(url)
      setIsPreviewOnly(false)
      setIsPlaying(true)
      captureSignal('purchase.succeeded', { surface: 'player', context: { title: playbackSong.title } })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Tempo could not unlock this track.'
      setPlaybackError(message)
      toast.error(message)
      captureError('purchase.failed', error, { title: playbackSong.title }, ['purchase:failed'])
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    const handlePlayButtonClick = () => {
      if (!playbackSong?.songURL && songList.length > 0) {
        setPlaybackSong(songList[0])
        setIsPlaying(true)
      }
    }
    const playButton = audioPlayerRef.current?.audio.current?.parentNode?.querySelector('.rhap_play-pause-button')
    playButton?.addEventListener('click', handlePlayButtonClick)
    return () => playButton?.removeEventListener('click', handlePlayButtonClick)
  }, [playbackSong.songURL, songList, setPlaybackSong, setIsPlaying])

  return (
    <div className="footerContainer" aria-label="Tempo player">
      <div className="playbackInfoContainer">
        {isLoading ? <CircularProgress size={34} /> : playbackSong?.title ? (
          <ArtworkImage
            src={playbackSong.artworkURL}
            className="playerAlbumArt"
            alt={`${playbackSong.title} album art`}
          />
        ) : null}
        <div className="titleArtistContainer">
          <p className="songTitle">{playbackSong?.title || 'Nothing playing'}</p>
          <p className="artistName">{playbackSong?.artist || 'Choose a verified song to start playback'}</p>
          {playbackError && <p className="playerError" role="alert">{playbackError}</p>}
        </div>
        {playbackSong.songURL && !isBundledAsset(playbackSong.songURL) && (
          <button className="unlockButton" onClick={unlockFullTrack} disabled={isLoading || !isPreviewOnly && Boolean(footerSongURL)}>
            {isPreviewOnly ? `Unlock full track · ${playbackSong.availability?.priceSatoshis || 1000} sats` : footerSongURL ? 'Full track unlocked' : `Buy & play · ${playbackSong.availability?.priceSatoshis || 1000} sats`}
          </button>
        )}
      </div>

      <AudioPlayer
        key={`${playbackSong.songURL}-${isPreviewOnly ? 'preview' : 'full'}`}
        ref={audioPlayerRef}
        src={footerSongURL}
        autoPlayAfterSrcChange
        progressUpdateInterval={250}
        showSkipControls
        showJumpControls={false}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={togglePlayNextSong}
        onClickPrevious={togglePlayPreviousSong}
        onClickNext={togglePlayNextSong}
      />
    </div>
  )
}

export default Footer
