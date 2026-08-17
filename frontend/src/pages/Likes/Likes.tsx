/**
 * @file Likes.tsx
 * @description
 * React page component for displaying the user’s liked songs in Tempo.
 * Resolves the song URLs in the reactive library store against bundled previews
 * and the overlay, then displays only exact liked matches.
 */

import { useState, useEffect } from 'react'
import { CircularProgress } from '@mui/material'
import SongList from '../../components/SongList/SongList'
import fetchSongs from '../../utils/fetchSongs/fetchSongs'
import bundledPreviewSongs from '../../utils/bundledPreviewSongs'
import { useLibraryStore } from '../../stores/libraryStore'
import type { Song } from '../../types/interfaces'
import { Utils } from '@bsv/sdk'
import type { FindAllQuery } from '../../types/interfaces.js'

/**
 * Likes Component
 *
 * - Reacts to the current liked song URLs in the library store.
 * - Resolves bundled previews locally and queries remaining IDs from the overlay.
 * - Filters overlay responses to exact liked URLs and preserves the user's like order.
 * - Displays a loading spinner while loading.
 * - Shows a SongList if there are liked songs, or a fallback message if none exist.
 */
const Likes = () => {
  const [songs, setSongs] = useState<Song[]>([])
  const [isLoaded, setIsLoaded] = useState(false)

  const likedSongIds = useLibraryStore(state => state.likedSongIds)

  useEffect(() => {
    let cancelled = false

    const fetchLikedSongs = async () => {
      setIsLoaded(false)
      setSongs([])
      if (likedSongIds.length === 0) {
        setIsLoaded(true)
        return
      }

      const likedSongURLs = new Set(likedSongIds)
      const bundledSongsByURL = new Map(bundledPreviewSongs.map(song => [song.songURL, song]))
      const overlayLikedSongIds = likedSongIds.filter(songURL => !bundledSongsByURL.has(songURL))

      if (overlayLikedSongIds.length === 0) {
        if (!cancelled) {
          setSongs(likedSongIds
            .map(songURL => bundledSongsByURL.get(songURL))
            .filter((song): song is Song => Boolean(song))
            .reverse())
          setIsLoaded(true)
        }
        return
      }

      const query: FindAllQuery = {
        type: 'findAll',
        value: {
          songIDs: overlayLikedSongIds.map((likedSong: string) =>
            Utils.toBase64(Utils.toArray(likedSong, 'utf8'))
          )
        }
      }

      try {
        const res = await fetchSongs(query)
        if (cancelled) return
        const likedSongsByURL = new Map([
          ...bundledSongsByURL,
          ...res.filter(song => likedSongURLs.has(song.songURL)).map(song => [song.songURL, song] as const)
        ])
        setSongs(likedSongIds
          .map(songURL => likedSongsByURL.get(songURL))
          .filter((song): song is Song => Boolean(song))
          .reverse())
      } catch (e) {
        if (e instanceof Error) {
          console.error(e.message)
        } else {
          console.error('An unexpected error occurred:', e)
        }
      } finally {
        if (!cancelled) setIsLoaded(true)
      }
    }

    fetchLikedSongs()
    return () => {
      cancelled = true
    }
  }, [likedSongIds])

  return (
    <div className="container songsPage">
      <h1>Likes</h1>
      {!isLoaded && songs.length === 0 && (
        <div className="songsPageContent">
          <CircularProgress />
        </div>
      )}
      {isLoaded && songs.length > 0 && (
        <div className="songsPageContent">
          <SongList songs={songs} />
        </div>
      )}
      {isLoaded && songs.length === 0 && (
        <p className="emptyPageState">No songs have been liked yet.</p>
      )}
    </div>
  )
}

export default Likes
