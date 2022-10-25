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
// import 'react-toastify/dist/ReactToastify.css'

// import publishSong from '../../utils/publishSong'

// const TEMPO_BRIDGE_ADDRESS = '1LQtKKK7c1TN3UcRfsp8SqGjWtzGskze36'
// const NANOSTORE_SERVER_URL = process.env.REACT_APP_IS_STAGING
//   ? 'https://staging-nanostore.babbage.systems'
//   : window.location.host.startsWith('localhost')
//     ? 'http://localhost:3104'
//     : 'https://nanostore.babbage.systems'
// const RETENTION_PERIOD = 86400 // ?
// const KEY_SERVER_HOST =
//   process.env.REACT_APP_TEMPO_KEY_SERVER_URL
//   || 'http://localhost:8080'

const EditSong = () => {
  const location = useLocation()
  const { song } = location.state
  // const test = song.title

  const [updatedSong, setUpdatedSong] = useState({
    title: song.title,
    artist: song.artist,
    selectedArtwork: null,
    selectedMusic: null,
    isPublished: false
  })

  const handleChange = (e) => {
    const valueToUpdate = e.target.name === 'selectedArtwork' || e.target.name === 'selectedMusic' ? e.target.files[0] : e.target.value
    console.log(valueToUpdate)
    setUpdatedSong({
      ...updatedSong,
      [e.target.name]: valueToUpdate
    })
  }
  const navigate = useNavigate()

  const onFileUpload = async (e) => {
    // toast.success('Publishing song...')
    // debugger
    song.title = updatedSong.title
    song.artist = updatedSong.artist

    if (updatedSong.selectedArtwork) {
      console.log('hey new artwork here!')
    }
    if (updatedSong.selectedMusic) {
      console.log('hey new music here!')
    }
    // debugger
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
    // try {
    //   // Publish Song
    //   const publishStatus = await publishSong(song, RETENTION_PERIOD, NANOSTORE_SERVER_URL, KEY_SERVER_HOST, TEMPO_BRIDGE_ADDRESS, toast)
    //   song.isPublished = publishStatus
    // } catch (error) {
    //   console.log(error)
    //   toast.error('Please select a valid file to upload!')
    // }

    // // const history = useHistory()
    // if (song.isPublished) {
    // console.log('success')
    // }
  }

  const playSong = async (e) => {
    // const selectionIndex = e.currentTarget.id
    // const allSongs = document.querySelectorAll('.song')
    // allSongs.forEach((n) => n.parentNode.classList.remove('isActive'))
    // e.currentTarget.parentNode.classList.add('isActive')
    // Decrypt song
    // if (!song.decryptedSongURL) {
    //   let decryptedSongURL
    // debugger
    try {
      // console.log(song.title + 'test')
      const decryptedSongURL = await decryptSong({
        song
      })

      // Update the audioPlayer to play the selected song
      const audioPlayer = document.getElementById('audioPlayer')
      audioPlayer.src = decryptedSongURL
      audioPlayer.autoplay = true
    } catch (error) {
      toast.error('Failed to load song!')
    }
    // }
  }

  return (
    <div className='EditSong'>
      <div className='menuAndContentSection2'>
        <MainMenu className='menu' />
        <div className='mainContent2'>
          <ToastContainer
            position='top-center'
            containerId='alertToast'
          />
          <div className='header2'>
            <h1>Edit Song</h1>
            <p className='subTitle'>Become your own publisher and upload your music for the world to hear!</p>
          </div>
          <div className='uploadSection2'>
            <div className='albumArtwork2'>
              <h3>ALBUM ARTWORK</h3>
              <Img
                src={song.artworkFileURL}
                bridgeportResolvers={constants.bridgeportResolvers}
                style={{ width: '300px' }}
              />
              {/* <Link className='button tipBtn' onClick={playSong}>Listen</Link> */}
              <button className='button tipBtn' onClick={playSong}>Listen</button>
            </div>
            <div className='centerDiv2'>
              <form className='publishForm2'>
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
