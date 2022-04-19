class Playlist {
  constructor (id, categoryId, name) {
    this.id = id
    this.categoryId = categoryId
    this.name = name
  }
}

const mockPlaylists = [
  new Playlist(1, 1, 'Chill Beats'),
  new Playlist(2, 2, 'Classical Music')
]

export default Playlist
