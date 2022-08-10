import React, { useState, useEffect } from 'react'
import { List, ListItem, ListItemAvatar, ListItemIcon, ListItemText, Typography } from '@material-ui/core'
import { Link } from 'react-router-dom'
import './style.css'
import { toast } from 'react-toastify'
import { decrypt } from '@cwi/crypto'
import parapet from 'parapet-js'
import { Authrite } from 'authrite-js'
import paymail from 'paymail'

const NANOSTORE_BASE_URL = 'http://localhost:3104/data/'

const SongsViewer = () => {
  const [songStatus, setSongStatus] = useState('red')
  const [songs, setSongs] = useState([])
  const updatedSongs = songs
  const changeActive = async (e) => {
    const selectionIndex = e.currentTarget.id
    const allSongs = document.querySelectorAll('.song')
    allSongs.forEach((n) => n.parentNode.classList.remove('isActive'))
    e.currentTarget.parentNode.classList.add('isActive')
    // Decrypt song
    if (!songs[selectionIndex].decryptedSongURL) {
      let decryptedSongURL
      // let artworkBlobURL
      try {
        decryptedSongURL = await decryptSong(songs[selectionIndex].songFileURL)
      } catch (error) {
        toast.error(error.message)
        return
      }
      updatedSongs[selectionIndex].decryptedSongURL = decryptedSongURL
      setSongs(updatedSongs)
    }
    const audioPlayer = document.getElementById('audioPlayer')
    audioPlayer.src = updatedSongs[selectionIndex].decryptedSongURL
    audioPlayer.autoplay = true
  }
  // TODO: move to helper function
  const decryptSong = async (songURL) => {
    const response = await fetch(
      NANOSTORE_BASE_URL + songURL
    )
    const encryptedData = await response.arrayBuffer()

    // Get purchcase invoice from key-server recipient
    const invoiceResponse = await new Authrite().request('http://localhost:8080/invoice', {
      body: {
        songURL
      },
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    })

    const invoice = (JSON.parse(Buffer.from(invoiceResponse.body).toString('utf8')))
    // Make a payment and get the returned reference number
    const payment = await paymail.send({
      recipient: invoice.paymail,
      amount: invoice.amount,
      description: `Here is payment for the song: ${songURL}`
    })
    // Send the recipient proof of payment
    const purchasedKey = await new Authrite().request('http://localhost:8080/pay', {
      body: {
        songURL,
        referenceNumber: payment.reference
      },
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    })
    const key = (JSON.parse(Buffer.from(purchasedKey.body).toString('utf8'))).result
    const keyAsBuffer = Buffer.from(key, 'base64')
    const decryptionKey = await window.crypto.subtle.importKey(
      'raw',
      Uint8Array.from(keyAsBuffer),
      {
        name: 'AES-GCM'
      },
      true,
      ['decrypt']
    )
    const decryptedData = await decrypt(new Uint8Array(encryptedData), decryptionKey, 'Uint8Array')
    const dataBlob = new Blob([decryptedData])
    return URL.createObjectURL(dataBlob)
  }

  const fetchSongs = async () => {
    // Query tempo bridge
    const availableSongs = await parapet({
      resolvers: ['http://localhost:3103'],
      bridge: '1LQtKKK7c1TN3UcRfsp8SqGjWtzGskze36', // TSP
      request: {
        type: 'json-query',
        query: {
          v: 3,
          q: {
            collection: 'songs',
            find: {}
          }
        }
      }
    })
    return availableSongs
  }

  useEffect(() => {
    fetchSongs()
      .then((res) => {
        setSongs(res)
      })
      .catch((e) => {
        console.log(e.message)
      })
  }, [])

  return (
    <div>
      <div className='songTable'>
        <List id='songList' sx={{ width: '100%', maxWidth: 360, bgcolor: 'background.paper' }}>
          {songs.map((song, i) => (
            <ListItem
              key={song.id} alignItems='flex-start'
              className='listItem'
            >
              <ListItemText className='songListItem song' primary={i + 1} />
              <img src={`${NANOSTORE_BASE_URL}${song.artworkFileURL}`} />
              <ListItemText
                className='song test'
                button='true'
                inset
                primary={song.title}
                id={i}
                onClick={changeActive}
              />
              <Link to='/ArtistProfile' state={{ song: song }}>
                <ListItemText button='true' primary={song.artist} style={{ padding: '0px 20px 0px 0px' }} />
              </Link>
              <ListItemText primary={song.length} />
            </ListItem>
          ))}
        </List>
      </div>
    </div>
  )
}
export default SongsViewer
