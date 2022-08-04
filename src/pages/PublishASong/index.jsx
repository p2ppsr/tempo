import React, { useState } from 'react'
import MainMenu from '../../components/MainMenu'
import './style.css'
import image from '../../Images/placeholder-image.png'
import { useNavigate } from 'react-router-dom'
import songPublisher from '../../utils/songPublisher'
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { createAction } from '@babbage/sdk'
import pushdrop from 'pushdrop'
import { invoice, upload } from 'nanostore-publisher'

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
      // TODO: Figure out the best way to upload all the necessary files.
      // Should compression be used at all?
      let file
      formData.forEach((value) => {
        file = value
      })
      const inv = await invoice({
        fileSize: file.size,
        retentionPeriod: 60,
        serverURL: 'http://localhost:3104'
      })

      const uploadTx = await createAction({
        outputs: inv.outputs.map(x => ({
          satoshis: x.amount,
          script: x.outputScript
        })),
        description: 'Upload with NanoStore'
      })

      const response = await upload({
        referenceNumber: inv.referenceNumber,
        transactionHex: uploadTx.rawTx,
        file,
        inputs: uploadTx.inputs,
        mapiResponses: uploadTx.mapiResponses,
        serverURL: 'http://localhost:3104'
        // onUploadProgress: prog => {
        //   setUploadProgress(
        //     parseInt((prog.loaded / prog.total) * 100)
        //   )
        // }
      })

      // Create a new action
      const TEST_PRIV_KEY = 'L55qjRezJoSHZEbG631BEf7GZqgw3yweM5bThiw9NEPQxGs5SQzw'
      const TEMPO_BRIDGE_ADDRESS = '1LQtKKK7c1TN3UcRfsp8SqGjWtzGskze36'
      // TODO: Use Babbage as a signing strategy for pushdrop once supported.
      const actionScript = pushdrop.create({
        fields: [
          Buffer.from('1LQtKKK7c1TN3UcRfsp8SqGjWtzGskze36', 'utf8'), // Protocol Namespace Address
          Buffer.from(song.title, 'utf8'),
          Buffer.from(song.artist, 'utf8'),
          Buffer.from('Default description', 'utf8'), // TODO: Add to UI
          Buffer.from('3:30', 'utf8'), // TODO: look at metadata for duration?
          Buffer.from(response.publicURL, 'utf8'),
          Buffer.from('publish', 'utf8')
        ],
        key: TEST_PRIV_KEY // TODO: replace test key
      })
      const publishTx = await createAction({
        outputs: [{
          satoshis: 1,
          script: actionScript
        }],
        description: 'Publish a song',
        bridges: [TEMPO_BRIDGE_ADDRESS] // tsp-bridge
      })

      const result = songPublisher()
      song.isPublished = true
      toast.success('Song publishing coming soon!')
    } catch (error) {
      console.log(error)
      toast.error('Please select a valid file to upload!')
    }

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
