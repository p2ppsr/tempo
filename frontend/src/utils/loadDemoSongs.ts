import type { Song } from '../types/interfaces'
import fetchSongs from './fetchSongs/fetchSongs'

/**
 * loadDemoSongs
 * - Queries the overlay for publicly available preview songs.
 * - Returns only songs whose required storage and purchase key are live.
 * - Uses a wallet-free preview when the publisher supplied one.
 */
export default async function loadDemoSongs(): Promise<Song[]> {
  console.log('[loadDemoSongs] Querying overlay for previews...')

  try {
    const playableSongs = await fetchSongs({ type: 'findAll', value: { songIDs: [] } })

    playableSongs.forEach((song) => {
      if (song.previewURL) song.decryptedSongURL = song.previewURL
    })

    return playableSongs
  } catch (err) {
    console.error('[loadDemoSongs] Failed to load overlay previews:', err)
    return []
  }
}
