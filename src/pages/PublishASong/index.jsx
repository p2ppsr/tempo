import React, { useState } from 'react'
import MainMenu from '../../components/MainMenu'
import './style.css'
import image from '../../Images/placeholder-image.png'
import { useNavigate } from 'react-router-dom'
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

import publishSong from '../../utils/publishSong'

const TEMPO_BRIDGE_ADDRESS = '1LQtKKK7c1TN3UcRfsp8SqGjWtzGskze36'
const NANOSTORE_SERVER_URL = 'http://localhost:3104'
const RETENTION_PERIOD = 100 // ?
const KEY_SERVER_HOST = 'http://localhost:8080'

const PublishASong = () => {
  const [song, setSong] = useState({
    title: '',
    artist: '',
    selectedArtwork: null,
    selectedMusic: null,
    isPublished: false
  })

  const handleChange = (e) => {
    const valueToUpdate = e.target.name === 'selectedArtwork' || e.target.name === 'selectedMusic' ? e.target.files[0] : e.target.value
    console.log(valueToUpdate)
    setSong({
      ...song,
      [e.target.name]: valueToUpdate
    })
  }
  const navigate = useNavigate()

  const onFileUpload = async (e) => {
    toast.success('Publishing song...')
    try {
      // Publish Song
      const publishStatus = await publishSong(song, RETENTION_PERIOD, NANOSTORE_SERVER_URL, KEY_SERVER_HOST, TEMPO_BRIDGE_ADDRESS, toast)
      song.isPublished = publishStatus
    } catch (error) {
      console.log(error)
      toast.error('Please select a valid file to upload!')
    }

    // const history = useHistory()
    if (song.isPublished) {
      console.log('success')
      navigate('/PublishASong/Success')
    }
  }

  return (
    <div className='PublishASong'>
      <div className='menuAndContentSection'>
        <MainMenu className='menu' />
        <div className='mainContent'>
          <ToastContainer
            position='top-center'
            containerId='alertToast'
          />
          <div className='header'>
            <h1>Publish A Song</h1>
            <p className='subTitle'>Become your own publisher and upload your music for the world to hear!</p>
          </div>
          <div className='uploadSection'>
            <div className='albumArtwork'>
              <h3>ALBUM ARTWORK</h3>
              <img src={image} />
            </div>
            <div className='centerDiv'>
              <form className='publishForm'>
                <label>SONG TITLE</label>
                <input type='text' className='textBox' name='title' placeholder='song title' value={song.title} onChange={handleChange} />
                <label>FEATURED ARTIST </label>
                <input type='text' className='textBox' name='artist' placeholder='name (optional)' value={song.artist} onChange={handleChange} />
                <label>ATTACH ARTWORK </label>
                <input type='file' name='selectedArtwork' className='upload' onChange={handleChange} />
                <label>ATTACH MUSIC </label>
                <input type='file' name='selectedMusic' className='upload' onChange={handleChange} />
                <input type='button' name='submitForm' value='PUBLISH SONG' className='publish' onClick={onFileUpload} />
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
