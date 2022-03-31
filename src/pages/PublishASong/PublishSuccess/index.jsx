import React, { useState } from 'react'
import LeftMenu from '../../../components/LeftMenu'
import MainMenu from '../../../components/MainMenu'
import './style.css'

const SuccessPage = () => {
  // TODO: validation?
  return (
    <div className='Success'>
      <LeftMenu />
      <div className='flexBoxContainer'>
        <MainMenu />
        <div>
          <h1 className='header'>Publish A Song</h1>
          <p className='subTitle'>Become your own publisher and upload your music for the world to hear!</p>
          <div className='row'>
            <div className='column'>
              <h2>Your song was successfully published! 🎉</h2>
            </div>
          </div>
        </div>
      </div>
      <div className='background' />
    </div>
  )
}
export default SuccessPage
