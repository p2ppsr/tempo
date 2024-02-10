import { download } from 'nanoseek'
import React, { useEffect, useState } from 'react'
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

  const [localSongURL, setLocalSongURL] = useState() as any
  const [firstLoad, setFirstLoad] = useState(true)

  // Lifecycle ===================================================

  useAsyncEffect(async () => {
    if (!firstLoad) {
      // This ensures isLoading is only set to true after the first load
      setIsLoading(true)
    }
    console.log('requested song')

    try {
      const decryptedAudio = await decryptSong(playbackSong)
      setLocalSongURL(decryptedAudio)
      console.log('song loaded and playing')
    } catch (e) {
      console.error(e)
    } finally {
      // Always set isLoading to false when done, irrespective of first load or not
      setIsLoading(false)
    }

    // After the first successful load, ensure subsequent loads set the loading state
    if (firstLoad) {
      setFirstLoad(false)
    }

    // Cleanup function
    return () => {
      if (playbackSong.audioSource) {
        URL.revokeObjectURL(playbackSong.audioSource)
      }
    }
  }, [playbackSong, firstLoad])

  useEffect(() => {
    console.log('loading change')
  }, [isLoading])

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
        src={localSongURL}
        onPlay={() => {
          setIsPlaying(true)
        }}
        onPause={() => {
          setIsPlaying(false)
        }}
      />
    </div>
  )
}
export default Footer
