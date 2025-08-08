/**
 * @file ViewArtist.tsx
 * @description
 * React component for displaying all songs published by a specific artist
 * in Tempo. Fetches songs by the artist's identity key from the URL,
 * sets the artist name, and displays them in a SongList.
 */

import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { fetchSongsByArtist } from '../../utils/fetchSongs/fetchSongsByArtist'
import type { Song } from '../../types/interfaces'
import SongList from '../../components/SongList/SongList'
import { CircularProgress } from "@mui/material"

/**
 * ViewArtist Component
 *
 * - Extracts the `artistIdentityKey` from the URL.
 * - Fetches songs associated with the given artist.
 * - Sets and displays the artist’s name.
 * - Renders a SongList with the artist’s songs, or a loading spinner if not yet fetched.
 */
const ViewArtist: React.FC = () => {
  const { artistIdentityKey } = useParams<{ artistIdentityKey: string }>()
  const [songs, setSongs] = useState<Song[]>([])
  const [artistName, setArtistName] = useState('')

  /**
   * loadSongs
   * Fetches songs for the artist using the provided identity key.
   * Updates the state with the fetched songs.
   */
  const loadSongs = async () => {
    if (!artistIdentityKey) return
    try {
      const fetchedSongs = await fetchSongsByArtist(artistIdentityKey)
      setSongs(fetchedSongs)
    } catch (error) {
      console.error('Failed to fetch songs for artist: ', error)
    }
  }

  useEffect(() => {
    const load = async () => {
      await loadSongs()
    }
    load()
  }, [artistIdentityKey])

  useEffect(() => {
    if (songs[0] && songs[0].artist) {
      setArtistName(songs[0].artist)
    }
  }, [songs])

  return (
    <div className="container">
      {songs.length > 0 ? (
        <>
          <h1 style={{ marginBottom: '1rem' }}>{artistName}</h1>
          <SongList songs={songs} />
        </>
      ) : (
        <CircularProgress/>
      )}
    </div>
  )
}

export default ViewArtist
