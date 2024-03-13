// Dependencies
import React, { useState } from 'react'
import SongList from '../../components/SongList/SongList'

// Styles
import './NoMncPreview.scss'

// Assets
import HereComesTheSunArtwork from '../../assets/AlbumArtwork/beatles.jpg'
import HereComesTheSunPreview from '../../assets/Music/Previews/HereComesTheSun15s.mp3'

import MurosArtwork from '../../assets/AlbumArtwork/muros.jpg'
import MurosPreview from '../../assets/Music/Previews/MurosInstrumental15s.mp3'

import { Button, Modal } from '@mui/material'
import ZodiacGirlsArtwork from '../../assets/AlbumArtwork/zodiacGirls.jpg'
import ZodiacGirlsPreview from '../../assets/Music/Previews/ZodiacGirls15s.mp3'
import { useInvitationModalStore } from '../../stores/stores'

const previewSongs = [
  {
    title: 'Here Comes The Sun',
    artist: 'The Beatles',
    audioURL: HereComesTheSunPreview,
    artworkURL: HereComesTheSunArtwork
  },
  {
    title: 'Muros Instrumental',
    artist: 'Muros',
    audioURL: MurosPreview,
    artworkURL: MurosArtwork
  },
  {
    title: 'Zodiac Girls',
    artist: 'Black Moth Super Rainbow',
    audioURL: ZodiacGirlsPreview,
    artworkURL: ZodiacGirlsArtwork
  }
] as any

const NoMncPreview = () => {

  return (
    <>
      <div className="container">
        <div id="previewBanner">
          <h3>
            To get the full experience, please launch the Metanet Client. If you don't have it
            yet, it's available for{' '}
            <a href="https://projectbabbage.com/desktop/res/MetaNet%20Client.exe" target="_blank">
              Windows
            </a>
            ,{' '}
            <a href="https://projectbabbage.com/desktop/res/MetaNet%20Client.dmg" target="_blank">
              macOS
            </a>
            , and{' '}
            <a
              href="https://projectbabbage.com/desktop/res/MetaNet%20Client.AppImage"
              target="_blank"
            >
              Linux
            </a>
            .
          </h3>
        </div>
        <h1 style={{ marginBottom: '1rem' }}>Previews</h1>
        <SongList songs={previewSongs} />
      </div>
    </>
  )
}

export default NoMncPreview
