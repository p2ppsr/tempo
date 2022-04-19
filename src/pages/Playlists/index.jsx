import React from 'react'
import LeftMenu from '../../components/LeftMenu'
import MainMenu from '../../components/MainMenu'
import LatestSongs from '../../components/LatestSongs'
import './style.css'

const Playlists = () => {
  return (
    <div className='Playlists'>
      <div className='flexBoxContainer'>
        <MainMenu />
        <h1 style={{ color: 'white' }}>Playlists Coming soon...</h1>
        <LatestSongs />
      </div>
      <div className='background' />
    </div>
  )
}
export default Playlists
