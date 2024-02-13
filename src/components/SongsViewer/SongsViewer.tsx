import { getPublicKey } from '@babbage/sdk'
import { List, ListItem, ListItemText } from '@mui/material'
import { PublicKey } from 'babbage-bsv'
import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { toast } from 'react-toastify'
import { Img } from 'uhrp-react'
import useAsyncEffect from 'use-async-effect'
import { usePlaybackStore } from '../../stores/stores'
import { Song } from '../../types/interfaces'
import constants from '../../utils/constants'
import decryptSong from '../../utils/decryptSong'
import deleteSong from '../../utils/deleteSong'
import fetchSongs from '../../utils/fetchSongs'
import './SongsViewer.scss'

interface MsgProps {
  action: () => void
  toastProps: { id: string | number }
}

const Msg = ({ action, toastProps }: MsgProps) => (
  <div>
    Are you sure you want to delete your masterpiece?
    <button
      className="toastButton"
      style={{ backgroundColor: 'black' }}
      onClick={() => {
        toast.dismiss(toastProps.id)
      }}
    >
      No
    </button>
    <button className="toastButton" style={{ backgroundColor: 'red' }} onClick={action}>
      Yes
    </button>
  </div>
)

interface SongsViewerProps {
  searchFilter: {
    findAll: string
    artistIdentityKey: PublicKey
  }
  mySongsOnly: boolean
}

const SongsViewer = ({ searchFilter, mySongsOnly }: SongsViewerProps) => {
  const [currentIdentityKey, setCurrentIdentityKey] = useState<PublicKey | undefined>(undefined)
  const [songs, setPlaybackSongs] = useState<Song[]>([])
  const [artwork, setArtwork] = usePlaybackStore((state: any) => [state.artwork, state.setArtwork])

  let currentSongId = 1
  const location = useLocation()
  let song
  if (location && location.state && location.state.song) {
    song = location.state.song
  }

  const confirmed = async () => {
    toast.promise(
      (async () => {
        const selectedSong = songs[currentSongId]
        await deleteSong({ song: selectedSong })
        setPlaybackSongs(current => current.filter(song => song !== selectedSong))
      })(),
      {
        pending: 'Deleting song...',
        success: 'Song deleted! 🗑',
        error: 'Failed to delete song! 🤯'
      }
    )
  }

  const changeActive = async (e: React.MouseEvent<HTMLElement>) => {
    // Get the selection index from the click/tap event
    const target = e.currentTarget as HTMLElement
    const selectionIndex = Number(target.id)

    // Get a reference to the elements with class song
    const allSongs: NodeListOf<HTMLElement> = document.querySelectorAll('.song')

    // Remove isActive class from everything except the target element
    allSongs.forEach(element => {
      const parentElement = element.parentNode as HTMLElement
      parentElement?.classList.remove('isActive')
    })
    const currentParent = target.parentNode as HTMLElement
    currentParent?.classList.add('isActive')

    // Decrypt the song selection if there is not a decryptedSongURL at the selected index
    if (!songs[selectionIndex].decryptedSongURL) {
      let decryptedSongURL: string | undefined

      toast.promise(
        (async () => {
          // Decrypt the song
          try {
            decryptedSongURL = await decryptSong(songs[selectionIndex])
          } catch (e) {
            // Log errors to console if decrypt fails
            console.log(e)
          }

          // Map through songs and update the decryptedSongUrl if it matches the selected song index
          const updatedSongs = songs.map((song, index) =>
            index === selectionIndex ? { ...song, decryptedSongURL: decryptedSongURL } : song
          )

          // Update the songs state with newly added decryptedSongUrl
          setPlaybackSongs(updatedSongs)

          // Update the audioPlayer to play the selected song
          const audioPlayer = document.getElementById('audioPlayer') as HTMLAudioElement
          if (!audioPlayer) {
            console.log('Audio player element was not found')
            throw new Error('Audio player element was not found')
          }

          if (typeof decryptedSongURL === 'string') {
            audioPlayer.src = decryptedSongURL // Ensure decryptedSongURL is a string
          } else {
            console.error('Decrypted song URL is undefined')
            throw new Error('Decrypted song URL is undefined')
          }

          // Set the global player artwork to the song's artwork URL
          setArtwork(songs[selectionIndex].artworkURL)

          const playerTitle = document.getElementById('songTitle')
          if (!playerTitle) {
            console.log('Player title element was not found')
            throw new Error('Player title element was not found')
          }

          playerTitle.innerText = songs[selectionIndex].title
          audioPlayer.autoplay = true
        })(),
        {
          pending: 'Loading song...',
          success: 'Feel the beat! 🎉',
          error: 'Failed to load song! 🤯'
        }
      )
    }
  }

  // TODO: Fix bug with getting correct song index.
  const deleteSelectedSong = async (e: React.MouseEvent<HTMLElement>) => {
    const target = e.currentTarget as HTMLElement
    const currentSongId = Number(target.id)
    toast.warn(
      <Msg
        action={confirmed}
        toastProps={{
          id: currentSongId
        }}
      />,
      {
        autoClose: false
      }
    )
  }

  useAsyncEffect(async () => {
    searchFilter ? searchFilter : {}
    if (mySongsOnly) {
      searchFilter.artistIdentityKey = await getPublicKey({
        protocolID: 'Tempo',
        keyID: '1'
      })
      setCurrentIdentityKey(searchFilter.artistIdentityKey)
    }
    try {
      const res = await fetchSongs(searchFilter)
      setPlaybackSongs(res.reverse()) // Newest songs on top (note performance with large results)
    } catch (e) {
      if (e instanceof Error) {
        console.log(e.message)
      } else {
        // Handle cases where the caught object is not an Error instance
        console.log('An unexpected error occurred:', e)
      }
    }
  }, [])

  return (
    <div>
      <div className="songTable">
        <List id="songList" sx={{ width: '100%', maxWidth: 360, bgcolor: 'background.paper' }}>
          {songs.map((song, i) => (
            <ListItem key={i} alignItems="flex-start" className="listItem">
              <ListItemText className="songListItem song" primary={i + 1} />
              <Img
                key={i}
                src={song.artworkURL}
                className="card"
                confederacyHost={constants.confederacyURL}
                id={''}
              />
              <ListItemText
                className="song test"
                // TODO: use ListItemButton here instead?
                // button="true"
                inset
                primary={song.title}
                id={i.toString()}
                onClick={changeActive}
              />
              <Link to="/ArtistProfile" state={{ song }}>
                <ListItemText
                  // button="true"
                  primary={song.artist}
                  style={{ padding: '0px 20px 0px 0px' }}
                />
              </Link>
              <ListItemText primary={song.duration} />
              {song.artistIdentityKey &&
                currentIdentityKey &&
                currentIdentityKey === song.artistIdentityKey && (
                  <Link to="/EditSong" state={{ song }}>
                    <ListItemText
                      className="song test"
                      // button="true"
                      inset
                      primary="Edit"
                      id={i.toString()}
                    />
                  </Link>
                )}
              {song.artistIdentityKey &&
                currentIdentityKey &&
                currentIdentityKey === song.artistIdentityKey && (
                  <ListItemText
                    className="song test"
                    // button="true"
                    inset
                    primary="Delete"
                    id={i.toString()}
                    onClick={deleteSelectedSong}
                  />
                )}
            </ListItem>
          ))}
        </List>
      </div>
    </div>
  )
}
export default SongsViewer
