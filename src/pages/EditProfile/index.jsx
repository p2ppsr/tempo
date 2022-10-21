import React, { useState, useEffect } from 'react'
import LeftMenu from '../../components/LeftMenu'
import MainMenu from '../../components/MainMenu'
import './style.css'
import image from '../../Images/placeholder-image.png'
import { Link, useLocation } from 'react-router-dom'
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import SongsViewer from '../../components/SongsViewer'
// import { getPublicKey } from '@babbage/sdk'
import ArtistProfile from '../../components/ArtistProfile'
import ProfilePicture from '../../Images/placeholder-image.png'
const EditProfile = () => {
  // TODO: Refactor for profile updating.
  // const [song, setSong] = useState({
  //   title: '',
  //   artist: '',
  //   selectedArtwork: null,
  //   selectedMusic: null,
  //   isPublished: false
  // })
  // const [identityKey, setIdentityKey] = useState('')

  // const handleChange = (e) => {
  //   const valueToUpdate = e.target.name === 'selectedArtwork' || e.target.name === 'selectedMusic' ? e.target.files[0] : e.target.value
  //   setSong({
  //     ...song,
  //     [e.target.name]: valueToUpdate
  //   })
  // }
  // const navigate = useNavigate()

  // useEffect(async () => {
  //   const key = await getPublicKey({ protocolID: 'Tempo', keyID: '1' })
  //   console.log(key)
  //   setIdentityKey(key)
  // }, [])

  // const onFileUpload = (e) => {
  //   try {
  //     // Create an object of formData
  //     const formData = new FormData()

  //     // Update the formData object
  //     formData.append(
  //       'myAlbumArtwork',
  //       song.selectedArtwork,
  //       song.selectedArtwork.name
  //     )
  //     formData.append(
  //       'myMusic',
  //       song.selectedMusic,
  //       song.selectedMusic.name
  //     )

  //     // Details of the uploaded file
  //     formData.forEach((value) => {
  //       console.log(value)
  //     })
  //     song.isPublished = true
  //     toast.success('Song publishing coming soon!')
  //   } catch (error) {
  //     toast.error('Please select a valid file to upload!')
  //   }

  //   // TODO: Make some API call to upload the selected file.
  //   // Nanostream via parapet or boomerang?
  //   // const history = useHistory()
  //   // if (song.isPublished) {
  //   //   console.log('success')
  //   //   navigate('/PublishASong/Success')
  //   // }
  // }

  return (
    <div className='Home'>
      <div className='flexBoxContainer'>
        <MainMenu />
        <div className='ArtistProfile'>
          <img alt='artist' src={ProfilePicture} />
          <div>
            <h1>StageName</h1>
            <p className='about'>hmm</p>
            {/* <Link className='button tipBtn' to='#'>TIP ARTIST</Link> */}
            <button className='button' onClick='#'>Edit Profile</button>
          </div>
        </div>
      </div>
      <div className='background' />
    </div>
  )
}
export default EditProfile
