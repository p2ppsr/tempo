/**
 * @file ViewPlaylist.tsx
 * @description
 * React component for viewing the details of a specific playlist,
 * including its name and songs. Supports removing songs from the playlist,
 * and updates the wallet-backed library. Loads the playlist based on
 * the ID from the React Router URL parameter.
 */

import { useEffect } from 'react'
import { useParams } from 'react-router-dom'
import SongList from '../../components/SongList/SongList'
import LibrarySyncStatus from '../../components/LibrarySyncStatus/LibrarySyncStatus'
import { useLibraryStore } from '../../stores/libraryStore'

/**
 * ViewPlaylist Component
 *
 * Fetches a playlist by its ID (from React Router’s URL params)
 * and displays its contents in a SongList. Provides functionality
 * for removing songs from the playlist, updating both component
 * state and the shared wallet library.
 */
const ViewPlaylist = () => {
  const { id } = useParams()
  const playlists = useLibraryStore(state => state.playlists)
  const syncStatus = useLibraryStore(state => state.syncStatus)
  const initializeLibrary = useLibraryStore(state => state.initializeLibrary)
  const removeSongFromPlaylist = useLibraryStore(state => state.removeSongFromPlaylist)
  const playlist = playlists.find(item => item.id === id) ?? null

  useEffect(() => {
    void initializeLibrary()
  }, [initializeLibrary])

  // Function to update the playlist after a song has been deleted
  const handleSongDelete = (songId: string) => {
    if (!playlist || !id) return
    void removeSongFromPlaylist(id, songId)
  }

  return (
    <div className="container songsPage">
      {playlist ? (
        <div>
          <h1>{playlist.name}</h1>
          <LibrarySyncStatus />
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
      ) : syncStatus === 'loading' || syncStatus === 'idle' ? (
        <div>
          <h1>Playlist</h1>
          <LibrarySyncStatus />
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
