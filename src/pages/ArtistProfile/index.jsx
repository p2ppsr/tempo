import React from 'react'
import MainMenu from '../../components/MainMenu'
import ArtistProfile from '../../components/ArtistProfile'
import SongsViewer from '../../components/SongsViewer'
import { useLocation } from 'react-router-dom'
import './style.css'

const PublishSong = () => {
  const location = useLocation()
  const { song } = location.state
  return (
    <div className='Home'>
      <div className='flexBoxContainer'>
        <MainMenu />
        <ArtistProfile />
        <div className='tableHeader'>
          <h3>Songs</h3>
        </div>
        <SongsViewer props={{ filter: { artistIdentityKey: song.artistIdentityKey }, mySongsOnly: false }} />
      </div>
      <div className='background' />
    </div>
  )
}
export default PublishSong
