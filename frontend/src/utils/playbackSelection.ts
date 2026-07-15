import type { Song } from '../types/interfaces'

export interface PreparedPlayback {
  song: Song
  autoUnlock: boolean
}

export function prepareSongPlayback(song: Song, currentSong?: Partial<Song>): PreparedPlayback {
  const currentFullTrack = currentSong?.songURL === song.songURL &&
    currentSong.decryptedSongURL &&
    currentSong.decryptedSongURL !== currentSong.previewURL
      ? currentSong.decryptedSongURL
      : undefined

  const selectedSong = currentFullTrack
    ? { ...song, decryptedSongURL: currentFullTrack }
    : { ...song }
  const hasFullTrack = Boolean(
    selectedSong.decryptedSongURL && selectedSong.decryptedSongURL !== selectedSong.previewURL
  )
  const autoUnlock = selectedSong.isPublished && !hasFullTrack

  if (autoUnlock) delete selectedSong.decryptedSongURL

  return { song: selectedSong, autoUnlock }
}

