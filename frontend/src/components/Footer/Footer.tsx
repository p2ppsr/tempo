import { CircularProgress } from '@mui/material'
import { useCallback, useEffect, useRef, useState } from 'react'
import { toast } from 'react-toastify'
import AudioPlayer from 'react-h5-audio-player'
import { usePlaybackStore } from '../../stores/stores'
import { downloadPlayableFile, isBundledAsset } from '../../utils/catalogAvailability'
import { captureError, captureSignal } from '../../utils/usercom'
import ArtworkImage from '../ArtworkImage/ArtworkImage'
import type { PurchaseStage } from '../../utils/decryptSong'

import 'react-h5-audio-player/lib/styles.css'
import './Footer.scss'

const purchaseStageMessage: Record<PurchaseStage, string> = {
  downloading_audio: 'Preparing the encrypted track…',
  requesting_wallet_payment: 'Confirming the wallet payment…',
  decrypting_audio: 'Unlocking the full track…'
}

function listenerPurchaseError(error: unknown): string {
  const detail = error instanceof Error ? error.message : String(error)
  if (/paid request.*failed|sent \d+ satoshis/i.test(detail)) {
    return 'Tempo did not receive the song key after the wallet payment attempt. Check wallet activity before tapping Try again.'
  }
  if (/maximum number of retries|session not found|failed to authenticate/i.test(detail)) {
    return 'The wallet session expired before Tempo received the song key. Keep Metanet open, then tap Try again.'
  }
  if (/insufficient|fund|balance/i.test(detail)) {
    return 'This wallet needs more sats for the track. Add funds in Metanet, then tap Try again.'
  }
  if (/denied|declined|rejected|cancel/i.test(detail)) {
    return 'The wallet did not approve this purchase. Tap Try again when you are ready.'
  }
  return detail || 'Tempo could not unlock this track.'
}

const Footer = () => {
  const [
    isLoading,
    setIsLoading,
    setIsPlaying,
    playbackSong,
    setPlaybackSong,
    togglePlayNextSong,
    togglePlayPreviousSong,
    songList,
    autoUnlockRequest,
    consumeAutoUnlock
  ] = usePlaybackStore((state) => [
    state.isLoading,
    state.setIsLoading,
    state.setIsPlaying,
    state.playbackSong,
    state.setPlaybackSong,
    state.togglePlayNextSong,
    state.togglePlayPreviousSong,
    state.songList,
    state.autoUnlockRequest,
    state.consumeAutoUnlock
  ])

  const [footerSongURL, setFooterSongURL] = useState<string>()
  const [isPreviewOnly, setIsPreviewOnly] = useState(false)
  const [playbackError, setPlaybackError] = useState('')
  const [purchaseErrorSongURL, setPurchaseErrorSongURL] = useState('')
  const [purchaseStatus, setPurchaseStatus] = useState('')
  const audioPlayerRef = useRef<AudioPlayer>(null)
  const purchaseInFlightRef = useRef(false)

  useEffect(() => {
    let active = true
    let objectUrl: string | undefined

    const loadSelectedAudio = async () => {
      if (!playbackSong?.songURL) return
      if (autoUnlockRequest?.songURL === playbackSong.songURL) {
        setFooterSongURL(undefined)
        setPlaybackError('')
        setIsPreviewOnly(false)
        setIsLoading(false)
        return
      }

      setIsLoading(true)
      setFooterSongURL(undefined)
      if (purchaseErrorSongURL !== playbackSong.songURL) setPlaybackError('')

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
    autoUnlockRequest?.id,
    autoUnlockRequest?.songURL,
    purchaseErrorSongURL,
    setIsLoading,
    setIsPlaying
  ])

  const unlockFullTrack = useCallback(async (requestId?: number) => {
    if (!playbackSong.songURL || purchaseInFlightRef.current) return
    const selectedSong = { ...playbackSong }
    purchaseInFlightRef.current = true
    setIsLoading(true)
    setPlaybackError('')
    setPurchaseErrorSongURL('')
    setPurchaseStatus(purchaseStageMessage.downloading_audio)
    captureSignal('purchase.started', { surface: 'player', context: { title: selectedSong.title, trigger: requestId ? 'song_click' : 'player_button' } })
    let failedAt: PurchaseStage = 'downloading_audio'
    try {
      const { default: decryptSong } = await import('../../utils/decryptSong')
      const url = await decryptSong(selectedSong, (stage) => {
        failedAt = stage
        setPurchaseStatus(purchaseStageMessage[stage])
        captureSignal('purchase.stage', { surface: 'player', context: { title: selectedSong.title, stage } })
      })
      if (!url) throw new Error('The key server returned no playable audio.')
      if (usePlaybackStore.getState().playbackSong.songURL !== selectedSong.songURL) {
        URL.revokeObjectURL(url)
        captureSignal('purchase.completed_in_background', { surface: 'player', context: { title: selectedSong.title } })
        return
      }
      setFooterSongURL(url)
      setIsPreviewOnly(false)
      setPurchaseErrorSongURL('')
      setPlaybackSong({ decryptedSongURL: url })
      setIsPlaying(true)
      captureSignal('purchase.succeeded', { surface: 'player', context: { title: selectedSong.title } })
    } catch (error) {
      const message = listenerPurchaseError(error)
      setPlaybackError(message)
      setPurchaseErrorSongURL(selectedSong.songURL)
      toast.error(message)
      captureError('purchase.failed', error, { title: selectedSong.title, failedAt }, ['purchase:failed'])
    } finally {
      purchaseInFlightRef.current = false
      setPurchaseStatus('')
      setIsLoading(false)
      if (requestId) consumeAutoUnlock(requestId)
    }
  }, [consumeAutoUnlock, playbackSong, setIsLoading, setIsPlaying, setPlaybackSong])

  useEffect(() => {
    if (!autoUnlockRequest || isLoading || autoUnlockRequest.songURL !== playbackSong.songURL) return
    void unlockFullTrack(autoUnlockRequest.id)
  }, [autoUnlockRequest, isLoading, playbackSong.songURL, unlockFullTrack])

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
          {purchaseStatus && <p className="purchaseStatus" role="status">{purchaseStatus}</p>}
          {playbackError && <p className="playerError" role="alert">{playbackError}</p>}
        </div>
        {playbackSong.songURL && !isBundledAsset(playbackSong.songURL) && (
          <button className="unlockButton" onClick={() => void unlockFullTrack()} disabled={isLoading || (!isPreviewOnly && Boolean(footerSongURL) && !playbackError)}>
            {purchaseStatus || (playbackError ? 'Try again' : isPreviewOnly ? `Buy & play · ${playbackSong.availability?.priceSatoshis || 1000} sats` : footerSongURL ? 'Full track unlocked' : `Buy & play · ${playbackSong.availability?.priceSatoshis || 1000} sats`)}
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
