import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { fetchSongsByArtist } from '../../utils/fetchSongs/fetchSongsByArtist'
import { Song } from '../../types/interfaces'
import SongList from '../../components/SongList/SongList'
import useAsyncEffect from 'use-async-effect'
import { CircularProgress } from "@mui/material"

const ArtistSongsPage: React.FC = () => {
  const { artistIdentityKey } = useParams<{ artistIdentityKey: string }>()
  const [songs, setSongs] = useState<Song[]>([])
  const [artistName, setArtistName] = useState('')

  const loadSongs = async () => {
    if (!artistIdentityKey) return
    try {
      const fetchedSongs = await fetchSongsByArtist(artistIdentityKey)
      setSongs(fetchedSongs)
    } catch (error) {
      console.error('Failed to fetch songs for artist: ', error)
    }
  }

  useAsyncEffect(async () => {
    loadSongs()
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

export default ArtistSongsPage
