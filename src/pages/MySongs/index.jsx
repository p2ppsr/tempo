import React, { useState, useEffect } from 'react'
// import LeftMenu from '../../components/LeftMenu'
import MainMenu from '../../components/MainMenu'
import './style.css'
// import image from '../../Images/placeholder-image.png'
import { useNavigate } from 'react-router-dom'
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import SongsViewer from '../../components/SongsViewer'

const MySongs = () => {
  // TODO: Refactor for profile updating.
  const [song, setSong] = useState({
    title: '',
    artist: '',
    selectedArtwork: null,
    selectedMusic: null,
    isPublished: false
  })
  const [identityKey, setIdentityKey] = useState('')

  const handleChange = (e) => {
    const valueToUpdate = e.target.name === 'selectedArtwork' || e.target.name === 'selectedMusic' ? e.target.files[0] : e.target.value
    setSong({
      ...song,
      [e.target.name]: valueToUpdate
    })
  }
  const navigate = useNavigate()

  useEffect(async () => {

  }, [])

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

  return (
    <div className='MySongs'>
      <div className='menuAndContentSection'>
        <MainMenu className='menu' />
        <div className='mainContent'>
          <ToastContainer
            position='top-center'
            containerId='alertToast'
          />
          <div className='header'>
            <h1>My Songs</h1>
            <p className='subTitle'>Update or delete your published songs!</p>
          </div>
          <div className='uploadSection'>
            {/* <h1 style={{ color: 'white' }}>Coming soon!</h1> */}
            {/* <h3 className='header'>Update or delete your published songs.</h3> */}
            <SongsViewer props={{ filter: {}, mySongsOnly: true }} />
          </div>
        </div>
      </div>
      <div className='background' />
    </div>
  )
}
export default MySongs
