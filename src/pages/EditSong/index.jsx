import React, { useState } from 'react'
import MainMenu from '../../components/MainMenu'
import './style.css'
// import image from '../../Images/placeholder-image.png'
import { useNavigate, Link, useLocation } from 'react-router-dom'
import { toast, ToastContainer } from 'react-toastify'
import { Img } from 'uhrp-react'
import constants from '../../utils/constants'
import decryptSong from '../../utils/decryptSong'
import updateSong from '../../utils/updateSong'

const EditSong = () => {
  const location = useLocation()
  const { song } = location.state

  const [updatedSong, setUpdatedSong] = useState({
    title: song.title,
    artist: song.artist,
    selectedArtwork: null,
    selectedMusic: null,
    isPublished: false
  })

  const handleChange = (e) => {
    const valueToUpdate = e.target.name === 'selectedArtwork' || e.target.name === 'selectedMusic' ? e.target.files[0] : e.target.value

    setUpdatedSong({
      ...updatedSong,
      [e.target.name]: valueToUpdate
    })
  }
  const navigate = useNavigate()

  const onFileUpload = async (e) => {
    song.title = updatedSong.title
    song.artist = updatedSong.artist

    // Updated the song
    toast.promise(
      async () => {
        await updateSong({ song, filesToUpdate: { selectedArtwork: updatedSong.selectedArtwork, selectedMusic: updatedSong.selectedMusic } })
        navigate('/MySongs')
      },
      {
        pending: 'Updating song... 🛠',
        success: 'Song updated! 🎉',
        error: 'Failed to update song! 🤯'
      })
  }
  // Demo the current song audio file
  const playSong = async (e) => {
    toast.promise(
      async () => {
        const decryptedSongURL = await decryptSong({
          song
        })

        // Update the audioPlayer to play the selected song
        const audioPlayer = document.getElementById('audioPlayer')
        audioPlayer.src = decryptedSongURL
        audioPlayer.autoplay = true
      },
      {
        pending: 'Loading current song...',
        success: 'Feel the beat! 🎉',
        error: 'Failed to load song! 🤯'
      }
    )
  }

  return (
    <div className='EditSong'>
      <div className='menuAndContentSection'>
        <MainMenu className='menu' />
        <div className='mainContentEditSong'>
          <ToastContainer
            position='top-center'
            containerId='alertToast'
          />
          <div className='header'>
            <h1>Edit Song</h1>
            <p className='subTitle'>Become your own publisher and upload your music for the world to hear!</p>
          </div>
          <div className='uploadSectionEditSong'>
            <div className='albumArtwork'>
              <h3>ALBUM ARTWORK</h3>
              <Img
                src={song.artworkFileURL}
                bridgeportResolvers={constants.bridgeportResolvers}
                style={{ width: '300px' }}
              />
              {/* <Link className='button tipBtn' onClick={playSong}>Listen</Link> */}
              <button className='button tipBtn' onClick={playSong}>Listen</button>
            </div>
            <div className='centerDiv'>
              <form className='publishForm'>
                <label>SONG TITLE</label>
                <input type='text' className='textBox' name='title' placeholder='Title' value={updatedSong.title} onChange={handleChange} />
                <label>FEATURED ARTIST</label>
                <input type='text' className='textBox' name='artist' placeholder='artist' value={updatedSong.artist} onChange={handleChange} />
                <label>REPLACE ARTWORK (OPTIONAL)</label>
                <input type='file' name='selectedArtwork' className='upload' onChange={handleChange} />
                <label>REPLACE MUSIC (OPTIONAL)</label>
                <input type='file' name='selectedMusic' className='upload' onChange={handleChange} />
                <input type='button' name='submitForm' value='UPDATE SONG' className='publish' onClick={onFileUpload} />
              </form>
            </div>
          </div>
        </div>
      </div>
      <div className='background' />
    </div>
  )
}
export default EditSong
