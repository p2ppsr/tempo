import React, { useState } from 'react'
import LeftMenu from '../../components/LeftMenu'
import MainMenu from '../../components/MainMenu'
import './style.css'
import image from '../../Images/albumArtwork.jpg'
// import styled from 'styled-components'

const PublishASong = () => {
  const [song, setSong] = useState({
    title: '',
    artist: '',
    selectedArtwork: null,
    selectedMusic: null
  })

  const handleChange = (e) => {
    const valueToUpdate = e.target.name === 'selectedArtwork' || e.target.name === 'selectedMusic' ? e.target.files[0] : e.target.value
    console.log(valueToUpdate)
    setSong({
      ...song,
      [e.target.name]: valueToUpdate
    })
  }

  const onFileUpload = (e) => {
    // Create an object of formData
    const formData = new FormData()

    // Update the formData object
    formData.append(
      'myAlbumArtwork',
      song.selectedArtwork,
      song.selectedArtwork.name
    )
    formData.append(
      'myMusic',
      song.selectedMusic,
      song.selectedMusic.name
    )

    // Details of the uploaded file
    formData.forEach((value) => {
      console.log(value)
    })

    // TODO: Make some API call to upload the selected file.
    // Nanostream via parapet or boomerang?
  }

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
                <input type='text' name='title' value={song.title} onChange={handleChange} />
                <label>ARTIST </label>
                <input type='text' name='artist' value={song.artist} onChange={handleChange} />
                <label>ATTACH ARTWORK </label>
                <input type='file' name='selectedArtwork' onChange={handleChange} />
                <label>ATTACH MUSIC </label>
                <input type='file' name='selectedMusic' onChange={handleChange} />
                <input type='button' name='submitForm' value='PUBLISH SONG' className='button publish' onClick={onFileUpload} />
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
