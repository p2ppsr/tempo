import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Playlist } from '../../types/interfaces'
import SongList from '../../components/SongList/SongList'

const ViewPlaylist = () => {
  const { id } = useParams()
  const [playlist, setPlaylist] = useState<Playlist | null>(null)

  // Function to fetch playlist by ID from localStorage
  const fetchPlaylistById = (playlistId: string | undefined) => {
    const playlistsString = localStorage.getItem('playlists') // Retrieve the stringified playlists array from localStorage
    if (!playlistsString) return null // Early return if there's no playlist data

    const playlists = JSON.parse(playlistsString) // Parse the string back into an array
    return playlists.find((p: Playlist) => p.id === playlistId) // Find the playlist with the matching ID
  }

  useEffect(() => {
    const foundPlaylist = fetchPlaylistById(id) // Fetch the playlist using the extracted ID
    setPlaylist(foundPlaylist)
  }, [id])

  return (
    <div className="container">
      {playlist ? (
        <div>
          <h1>{playlist.name}</h1>
          <div style={{ marginTop: '1rem' }}>
            {playlist.songs.length > 0 ? (
              <>
                <SongList songs={playlist.songs} />
              </>
            ) : (
              <p className="whiteText">This playlist doesn't contain any songs...yet!</p>
            )}
          </div>
        </div>
      ) : (
        <div>
          <h1>Playlist not found</h1>
        </div>
      )}
    </div>
  )
}

export default ViewPlaylist
