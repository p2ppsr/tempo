import React from 'react'
import LeftMenu from '../../components/LeftMenu'
import MainMenu from '../../components/MainMenu'
import './style.css'
import image from '../../Images/albumArtwork.jpg'
import styled from 'styled-components'

const StyledInput = styled.input`
  display: block;
  margin: 20px 0px;
  border: 1px solid lightblue;
`

const PublishASong = () => {
  return (
    <div className='PublishASong'>
      <LeftMenu />
      <div className='flexBoxContainer'>
        <MainMenu />
        <div>
          <h1 className='header'>Publish A Song</h1>
          <p className='subTitle'>Become your own publisher and upload your music for the world to hear!</p>
          <div className='publishingSection'>
            <h3>UPLOAD ALBUM ARTWORK</h3>
            <div className='row'>
              <img src={image} />
              <form className='inputForm'>
                <label>Title </label>
                <input type='text' />

                <label>ARTIST </label>
                <input type='text' />
                <span className='test'>
                  <button className='upload button'>ATTACH ARTWORK</button>
                  <button className='upload button'>ATTACH MUSIC</button>
                  <button className='button publish'>PUBLISH SONG</button>
                </span>
              </form>
            </div>
          </div>
        </div>
      </div>
      <div className='background' />
    </div>
  )
}
export default PublishASong
