import fetchSongs from './fetchSongs'

export const fetchSongsByArtist = async (artistIdentityKey: string) => {
  const searchFilter = { artistIdentityKey }
  return await fetchSongs(searchFilter)
}
