import React, { useState, useEffect } from 'react'
import { List, ListItem, ListItemText } from '@material-ui/core'
import { Link, useLocation } from 'react-router-dom'
import './style.css'
import { toast } from 'react-toastify'
import constants from '../../utils/constants'
import { Img } from 'uhrp-react'
import { getPublicKey } from '@babbage/sdk'

// Helper functions
import decryptSong from '../../utils/decryptSong'
import fetchSongs from '../../utils/fetchSongs'
import deleteSong from '../../utils/deleteSong'

const Msg = ({ action, toastProps }) => (
  <div>
    Are you sure you want to delete your masterpiece?
    <button
      className='toastButton' style={{ backgroundColor: 'black' }} onClick={() => {
        toast.dismiss(toastProps.id)
      }}
    >No
    </button>
    <button className='toastButton' style={{ backgroundColor: 'red' }} onClick={action}>Yes</button>
  </div>
)

const SongsViewer = ({ props } = {}) => {
  const [currentSongId, setCurrentSongId] = useState(0)
  const [currentIdentityKey, setCurrentIdentityKey] = useState()

  // const location = useLocation()
  // let song
  // if (location && location.state && location.state.song) {
  //   song = location.state.song
  // }

  const confirmed = async () => {
    toast.promise(
      async () => {
        const selectedSong = songs[currentSongId]
        await deleteSong({ song: selectedSong })
        setSongs((current) =>
          current.filter((song) => song !== selectedSong)
        )
      },
      {
        pending: 'Deleting song...',
        success: 'Song deleted! 🗑',
        error: 'Failed to delete song! 🤯'
      }
    )
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
      toast.promise(
        async () => {
          decryptedSongURL = await decryptSong({
            song: songs[selectionIndex]
          })
          updatedSongs[selectionIndex].decryptedSongURL = decryptedSongURL
          setSongs(updatedSongs)
          // Update the audioPlayer to play the selected song
          const audioPlayer = document.getElementById('audioPlayer')
          audioPlayer.src = updatedSongs[selectionIndex].decryptedSongURL
          audioPlayer.autoplay = true
        },
        {
          pending: 'Loading song...',
          success: 'Feel the beat! 🎉',
          error: 'Failed to load song! 🤯'
        }
      )
    }
  }

  // TODO: Fix bug with getting correct song index.
  const deleteSelectedSong = async (e) => {
    setCurrentSongId(e.currentTarget.id)
    toast.warn(<Msg action={confirmed} />, { autoClose: false })
  }

  useEffect(async () => {
    // TODO: Add support for viewing a particular artist's songs
    const searchFilter = props ? props.filter : {}
    if (props && props.mySongsOnly) {
      searchFilter.artistIdentityKey = await getPublicKey({ protocolID: 'Tempo', keyID: '1' })
      setCurrentIdentityKey(searchFilter.artistIdentityKey)
    }
    fetchSongs(searchFilter)
      .then((res) => {
        setSongs(res.reverse()) // Newest songs on top (note performance with large results)
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
              {(song.artistIdentityKey && currentIdentityKey) && currentIdentityKey === song.artistIdentityKey &&
                <Link to='/EditSong' state={{ song }}>
                  <ListItemText
                    className='song test'
                    button='true'
                    inset
                    primary='Edit'
                    id={i}
                  />
                </Link>}
              {(song.artistIdentityKey && currentIdentityKey) && currentIdentityKey === song.artistIdentityKey &&
                <ListItemText
                  className='song test'
                  button='true'
                  inset
                  primary='Delete'
                  id={i}
                  onClick={deleteSelectedSong}
                />}
            </ListItem>
          ))}
        </List>
      </div>
    </div>
  )
}
export default SongsViewer
