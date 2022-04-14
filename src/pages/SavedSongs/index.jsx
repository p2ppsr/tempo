import React from 'react'
import LeftMenu from '../../components/LeftMenu'
import MainMenu from '../../components/MainMenu'
import LatestSongs from '../../components/LatestSongs'
import './style.css'

const SavedSongs = () => {
  return (
    <div className='SavedSongs'>
      <LeftMenu />
      <div className='flexBoxContainer'>
        <MainMenu />
        <h1 style={{ color: 'white' }}>Saved Songs Coming soon...</h1>
        <LatestSongs />
      </div>
      <div className='background' />
    </div>
  )
}
export default SavedSongs
