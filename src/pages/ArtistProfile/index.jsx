import React from 'react'
import MainMenu from '../../components/MainMenu'
import ArtistProfile from '../../components/ArtistProfile'
import SongsViewer from '../../components/SongsViewer'
import './style.css'

const PublishSong = () => {
  return (
    <div className='Home'>
      <div className='flexBoxContainer'>
        <MainMenu />
        <ArtistProfile />
        <div className='tableHeader'>
          <h3>Songs</h3>
        </div>
        <SongsViewer />
      </div>
      <div className='background' />
    </div>
  )
}
export default PublishSong
