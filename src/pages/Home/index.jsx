import React from 'react'
import LeftMenu from '../../components/LeftMenu'
import MainMenu from '../../components/MainMenu'
import LatestSongs from '../../components/LatestSongs'
import './style.css'

const Home = () => {
  console.log('home index')
  return (
    <div className='Home'>
      <div className='menuAndContentSection'>
        <MainMenu className='menu' />
        <LatestSongs className='mainContent' />
      </div>
      <div className='background' />
    </div>
  )
}
export default Home
