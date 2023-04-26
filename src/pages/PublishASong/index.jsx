import React, { useState } from 'react'
import MainMenu from '../../components/MainMenu'
import './style.css'
import { useNavigate } from 'react-router-dom'
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import publishSong from '../../utils/publishSong'

// Uploaded songs will be hosted for seven years
const RETENTION_PERIOD = 60 * 24 * 365 * 7

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
    try {
      // Publish Song
      let publishStatus = false
      const pubSong = async () => {
        try {
          publishStatus = await publishSong(song, RETENTION_PERIOD)
          if (publishStatus) {
            console.log('success')
            navigate('/PublishASong/Success')
          }
        } catch (e) {
          console.error(e)
          throw e
        }
      }
      toast.promise(
        pubSong(),
        {
          pending: 'Publishing song...',
          success: 'Song published! 👌',
          error: 'Failed to publish song! 🤯'
        }
      )
      song.isPublished = publishStatus
    } catch (error) {
      console.log(error)
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
      <div className='background' />
    </div>
  )
}
export default PublishASong
