import React, { useState, useEffect } from 'react'
import MainMenu from '../../components/MainMenu'
import LatestSongs from '../../components/LatestSongs'
import './style.css'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import checkForRoyalties from '../../utils/checkForRoyalties'

const Home = () => {
  useEffect(() => {
    checkForRoyalties()
      .then((res) => {
        console.log(res)
      })
      .catch((e) => {
        console.log(e.message)
      })
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
