import React, { useState, useEffect } from 'react'
import { List, ListItem, ListItemText } from '@material-ui/core'
import { Link, useLocation } from 'react-router-dom'
import './style.css'
import { toast } from 'react-toastify'
import constants from '../../utils/constants'
import { Img } from 'uhrp-react'

// Helper functions
import decryptSong from '../../utils/decryptSong'
import fetchSongs from '../../utils/fetchSongs'

const SongsViewer = ({ artist }) => {
  const location = useLocation()
  let song
  if (location && location.state && location.state.song) {
    song = location.state.song
  }

  const [songs, setSongs] = useState([])
  const updatedSongs = songs
  // Decrypt the selected song and update the UI
  const changeActive = async (e) => {
    const selectionIndex = e.currentTarget.id
    const allSongs = document.querySelectorAll('.song')
    allSongs.forEach((n) => n.parentNode.classList.remove('isActive'))
    e.currentTarget.parentNode.classList.add('isActive')
    // Decrypt song
    if (!songs[selectionIndex].decryptedSongURL) {
      let decryptedSongURL
      try {
        decryptedSongURL = await decryptSong({
          songURL: songs[selectionIndex].songFileURL
        })
      } catch (error) {
        toast.error('Failed to load song!')
        return
      }
      updatedSongs[selectionIndex].decryptedSongURL = decryptedSongURL
      setSongs(updatedSongs)
    }
    // Update the audioPlayer to play the selected song
    const audioPlayer = document.getElementById('audioPlayer')
    audioPlayer.src = updatedSongs[selectionIndex].decryptedSongURL
    audioPlayer.autoplay = true
  }

  useEffect(() => {
    let searchFilter = undefined
    if (song && song.artist) {
      searchFilter = song.artist
    }
    fetchSongs(searchFilter)
      .then((res) => {
        setSongs(res.reverse()) // Newest songs on top
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
              <Img
                src={song.artworkFileURL}
                bridgeportResolvers={constants.bridgeportResolvers}
              />
              <ListItemText
                className='song test'
                button='true'
                inset
                primary={song.title}
                id={i}
                onClick={changeActive}
              />
              <Link to='/ArtistProfile' state={{ song }}>
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
