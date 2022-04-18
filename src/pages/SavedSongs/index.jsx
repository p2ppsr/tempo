import React from 'react'
import LeftMenu from '../../components/LeftMenu'
import MainMenu from '../../components/MainMenu'
import LatestSongs from '../../components/LatestSongs'
import './style.css'

const SavedSongs = () => {
  return (
    <div className='SavedSongs'>
      <LeftMenu />
      <div className='mainContentContainer2'>
        <MainMenu className='menu' />
        <div className='centerMe'>
          <div className='space space1'>
            <h1>COMING</h1>
          </div>
          <div className='space space2'>
            <h1>SOON</h1>
          </div>
        </div>
      </div>
      <div className='background' />
    </div>
  )
}
export default SavedSongs
