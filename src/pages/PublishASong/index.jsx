import React, { useState } from 'react'
import LeftMenu from '../../components/LeftMenu'
import MainMenu from '../../components/MainMenu'
import './style.css'
import image from '../../Images/placeholder-image.png'
import { useNavigate } from 'react-router-dom'
import songPublisher from '../../utils/songPublisher'
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

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

  const onFileUpload = (e) => {
    try {
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
      const result = songPublisher()
      song.isPublished = true
      toast.success('Song publishing coming soon!')
    } catch (error) {
      toast.error('Please select a valid file to upload!')
    }

    // TODO: Make some API call to upload the selected file.
    // Nanostream via parapet or boomerang?
    // const history = useHistory()
    // if (song.isPublished) {
    //   console.log('success')
    //   navigate('/PublishASong/Success')
    // }
  }

  // return (
  //   <div className='container2'>
  //     <div className='header'>Header</div>
  //     <div className='middleSection'>
  //       <div className='left'>left</div>
  //       <div className='center'>center</div>
  //       <div className='right'>middle</div>
  //     </div>
  //     <div className='footer'>Footer</div>
  //   </div>
  // )

  return (
    <div className='PublishASong'>
      <LeftMenu className='test2' style={{ display: 'none' }} />
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
