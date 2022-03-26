import React from 'react'
import LeftMenu from '../../components/LeftMenu'
import MainMenu from '../../components/MainMenu'
import MainContainer from '../../components/MainContainer'
import './style.css'

const Home = () => {
  return (
    <div className='Home'>
      <LeftMenu />
      <div className='flexBoxContainer'>
        <MainMenu />
        <MainContainer />
      </div>
      <div className='background' />
    </div>
  )
}
export default Home
