import React from 'react'
import LeftMenu from '../../components/LeftMenu'
import MainMenu from '../../components/MainMenu'
import LatestSongs from '../../components/LatestSongs'
import './style.css'

const Home = () => {
  return (
    <div className='Home'>
      <LeftMenu />
      <div className='flexBoxContainer'>
        <MainMenu />
        <LatestSongs />
      </div>
      <div className='background' />
    </div>
  )
}
export default Home
