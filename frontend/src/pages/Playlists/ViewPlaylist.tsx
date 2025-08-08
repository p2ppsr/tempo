/**
 * @file ViewPlaylist.tsx
 * @description
 * React component for viewing the details of a specific playlist,
 * including its name and songs. Supports removing songs from the playlist,
 * and updates changes to localStorage. Loads the playlist based on
 * the ID from the React Router URL parameter.
 */

import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import type { Playlist } from '../../types/interfaces'
import SongList from '../../components/SongList/SongList'

/**
 * ViewPlaylist Component
 *
 * Fetches a playlist by its ID (from React Router’s URL params)
 * and displays its contents in a SongList. Provides functionality
 * for removing songs from the playlist, updating both component
 * state and localStorage.
 */
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

  // Function to update the playlist after a song has been deleted
  const handleSongDelete = (songId: string) => {
    if (!playlist) return

    const updatedSongs = playlist.songs.filter(song => song.songURL !== songId)
    const updatedPlaylist = { ...playlist, songs: updatedSongs }

    // Update the playlist in the component state
    setPlaylist(updatedPlaylist)

    // Optionally, update the playlist in localStorage
    const playlistsString = localStorage.getItem('playlists')
    if (playlistsString) {
      const playlists: Playlist[] = JSON.parse(playlistsString)
      const updatedPlaylists = playlists.map(p => (p.id === id ? updatedPlaylist : p))
      localStorage.setItem('playlists', JSON.stringify(updatedPlaylists))
    }
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
                <SongList songs={playlist.songs} onRemoveFromPlaylist={handleSongDelete}/>
              </>
            ) : (
              <p>This playlist doesn't contain any songs...yet!</p>
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
