import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Playlist } from '../../types/interfaces'
import SongList from '../../components/SongList/SongList'

const ViewPlaylist = () => {
  const { id } = useParams() // Extracting the ID from the URL parameters
  const [playlist, setPlaylist] = useState<Playlist | null>(null) // State to store the found playlist

  // Function to fetch playlist by ID from localStorage
  const fetchPlaylistById = (playlistId: string | undefined) => {
    const playlistsString = localStorage.getItem('playlists') // Retrieve the stringified playlists array from localStorage
    if (!playlistsString) return null // Early return if there's no playlist data

    const playlists = JSON.parse(playlistsString) // Parse the string back into an array
    return playlists.find((p: Playlist) => p.id === playlistId) // Find the playlist with the matching ID
  }

  useEffect(() => {
    const foundPlaylist = fetchPlaylistById(id) // Fetch the playlist using the extracted ID
    setPlaylist(foundPlaylist) // Update state with the found playlist
  }, [id]) // Rerun the effect if the ID changes

  // Conditional rendering based on whether a playlist is found
  return (
    <div className="container">
      {playlist ? (
        <div>
          <h1>{playlist.name}</h1>
          <div style={{marginTop:'1rem'}}>
            {playlist.songs ? (
              <p className="whiteText">This playlist doesn't contain any songs...yet!</p>
            ) : (
              <>
                <SongList songs={playlist.songs} />
              </>
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
