import React, { useState, useEffect } from 'react'
import MainMenu from '../../components/MainMenu'
import LatestSongs from '../../components/LatestSongs'
import './style.css'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

const Home = () => {
  useEffect(() => {
  }, [])

  return (
    <div className='Home'>
      <div className='menuAndContentSection'>
        <MainMenu className='menu' />
        <ToastContainer
          position='top-center'
          containerId='alertToast'
          autoClose={7000}
        />
        <LatestSongs className='mainContent' />
      </div>
      <div className='background' />
    </div>
  )
}
export default Home
