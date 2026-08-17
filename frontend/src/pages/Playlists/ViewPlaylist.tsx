/**
 * @file ViewPlaylist.tsx
 * @description
 * React component for viewing the details of a specific playlist,
 * including its name and songs. Supports removing songs from the playlist,
 * and updates changes to localStorage. Loads the playlist based on
 * the ID from the React Router URL parameter.
 */

import { useParams } from 'react-router-dom'
import SongList from '../../components/SongList/SongList'
import { useLibraryStore } from '../../stores/libraryStore'

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
  const playlists = useLibraryStore(state => state.playlists)
  const setPlaylists = useLibraryStore(state => state.setPlaylists)
  const playlist = playlists.find(item => item.id === id) ?? null

  // Function to update the playlist after a song has been deleted
  const handleSongDelete = (songId: string) => {
    if (!playlist) return

    const updatedSongs = playlist.songs.filter(song => song.songURL !== songId)
    const updatedPlaylist = { ...playlist, songs: updatedSongs }

    setPlaylists(playlists.map(item => (item.id === id ? updatedPlaylist : item)))
  }

  return (
    <div className="container songsPage">
      {playlist ? (
        <div>
          <h1>{playlist.name}</h1>
          <div className="songsPageContent">
            {playlist.songs.length > 0 ? (
              <>
                <SongList songs={playlist.songs} onRemoveFromPlaylist={handleSongDelete}/>
              </>
            ) : (
              <p className="emptyPageState">This playlist doesn&apos;t contain any songs yet.</p>
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
