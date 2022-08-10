import React, { useState } from 'react'
import MainMenu from '../../components/MainMenu'
import './style.css'
import image from '../../Images/placeholder-image.png'
import { useNavigate } from 'react-router-dom'
// import songPublisher from '../../utils/songPublisher'
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { createAction } from '@babbage/sdk'
import pushdrop from 'pushdrop'
import { invoice, upload } from 'nanostore-publisher'
import { getURLForFile } from 'uhrp-url'
import { encrypt } from '@cwi/crypto'
import { Authrite } from 'authrite-js'

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
    try {
      // Notes:
      // 1. An artist wants to publish their song.
      // * They need to upload the following data:
      // - The encrypted song bytes
      // - The song artwork. Later this will be the album artwork.
      // In the future, we could generate a UHRP hash to see if the data has already been uploaded.

      // Create invoices hosting the song and artwork files on NanoStore
      const filesToUpload = [song.selectedMusic, song.selectedArtwork]
      const invoices = []
      for (const file of filesToUpload) {
        const inv = await invoice({
          fileSize: file.size,
          retentionPeriod: RETENTION_PERIOD,
          serverURL: NANOSTORE_SERVER_URL // TODO: update
        })
        invoices.push(inv)
      }

      // Get the file contents as arrayBuffers
      const songData = await song.selectedMusic.arrayBuffer()
      const artworkData = new Uint8Array(await song.selectedArtwork.arrayBuffer())

      // Generate an encryption key for the song data
      const encryptionKey = await window.crypto.subtle.generateKey(
        {
          name: 'AES-GCM',
          length: 256
        },
        true, // whether the key is extractable (i.e. can be used in exportKey)
        ['encrypt', 'decrypt'] // can "encrypt", "decrypt", "wrapKey", or "unwrapKey")
      )
      // Encrypt the file data
      const encryptedData = await encrypt(new Uint8Array(songData), encryptionKey, 'Uint8Array')
      // Calc the UHRP address
      const songURL = getURLForFile(encryptedData)
      const artworkFileURL = getURLForFile(artworkData)

      // TODO: Remove Test key
      const TEST_PRIV_KEY = 'L55qjRezJoSHZEbG631BEf7GZqgw3yweM5bThiw9NEPQxGs5SQzw'
      // TODO: Use Babbage as a signing strategy for pushdrop once supported.
      const actionScript = pushdrop.create({
        fields: [
          Buffer.from('1LQtKKK7c1TN3UcRfsp8SqGjWtzGskze36', 'utf8'), // Protocol Namespace Address
          Buffer.from(song.title, 'utf8'),
          Buffer.from(song.artist, 'utf8'),
          Buffer.from('Default description', 'utf8'), // TODO: Add to UI
          Buffer.from('3:30', 'utf8'), // TODO: look at metadata for duration?
          Buffer.from(songURL, 'utf8'),
          Buffer.from(artworkFileURL, 'utf8')
        ],
        key: TEST_PRIV_KEY // TODO: replace test key
      })
      // Create an action for all outputs
      const actionData = {
        outputs: [{
          satoshis: 1,
          script: actionScript
        }],
        description: 'Publish a song',
        bridges: [TEMPO_BRIDGE_ADDRESS] // tsp-bridge
      }
      invoices.forEach(inv => {
        actionData.outputs = [
          ...actionData.outputs,
          ...inv.outputs.map(x => ({
            satoshis: x.amount,
            script: x.outputScript
          }))
        ]
      })
      const tx = await createAction(actionData)
      // Validate transaction success
      if (tx.status === 'error') {
        toast.error(tx.message)
        return
      }

      // Create a file to upload from the encrypted data
      const blob = new Blob([Buffer.from(encryptedData)], { type: 'application/octet-stream' })
      const encryptedFile = new File([blob], 'encryptedSong', { type: 'application/octet-stream' })
      // Swap the unencrypted song file for the encrypted one
      filesToUpload[0] = encryptedFile

      // Upload the files to nanostore
      for (let i = 0; i < filesToUpload.length; i++) {
        const response = await upload({
          referenceNumber: invoices[i].referenceNumber,
          transactionHex: tx.rawTx,
          file: filesToUpload[i],
          inputs: tx.inputs,
          mapiResponses: tx.mapiResponses,
          serverURL: NANOSTORE_SERVER_URL
        // onUploadProgress: prog => {
        //   setUploadProgress(
        //     parseInt((prog.loaded / prog.total) * 100)
        //   )
        // }
        })
        console.log(response.publicURL)
      }

      // Export encryption key to store on the keyServer
      const decryptionKey = await window.crypto.subtle.exportKey('raw', encryptionKey)
      const response = await new Authrite().request(`${KEY_SERVER_HOST}/publish`, {
        body: {
          songURL,
          key: Buffer.from(decryptionKey).toString('base64')
        },
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      })
      if (response.status !== 200) {
        toast.error('Failed to publish song! Please upload a valid media type of mp3 or wav')
        return
      }

      // const result = songPublisher()
      song.isPublished = true
      toast.success('Song successfully published')
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
