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

  const [footerAudioURL, setFooterAudioURL] = useState() as any
  const [firstLoad, setFirstLoad] = useState(true)

  // Lifecycle ===================================================

  /* 
    In this useEffect, we do 3 things:

    1. When the component loads, check if it is the first load.
      If so, toggle the "firstLoad" state to false.

    2. If there is no playbackSong data, break out of the useEffect.

    3. If we pass that check, enter a try/catch block that will 
      attempt to decrypt a song object. 
      Successfully decrypting a song sets footerAudioURL to a localized URL.
  */
  useAsyncEffect(async () => {
    //@ 1
    firstLoad ? setIsLoading(false) : setIsLoading(true)

    //@ 2
    if (!playbackSong) { 
      return
    }

    //@ 3
    try { 
      const decryptedAudio = await decryptSong(playbackSong)
      setFooterAudioURL(decryptedAudio)
      console.log('song loaded and playing')
    } catch (e) {
      console.error(e)
    } finally {
      // Set isLoading to false when done
      setIsLoading(false)
    }

    // Cleanup function when component unmounts
    return () => {
      if (playbackSong.audioSource) {
        URL.revokeObjectURL(playbackSong.audioSource)
      }
    }
  }, [playbackSong, firstLoad])

  // useEffect(() => {
  //   console.log('loading change')
  // }, [isLoading])

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
        src={footerAudioURL}
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
