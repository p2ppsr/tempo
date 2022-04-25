class Playlist {
  constructor (id, genreId = 5, title, songs = [], image, isPublic = false) {
    this.id = id
    this.genreId = genreId
    this.title = title
    this.songs = songs
    this.image = image
    this.isPublic = isPublic
  }
}

class Genre {
  constructor (id, name) {
    this.id = id
    this.name = name
  }
}

const musicGenres = [
  new Genre(0, 'Classical'),
  new Genre(1, 'Country'),
  new Genre(2, 'Pop'),
  new Genre(3, 'Rap'),
  new Genre(4, 'Chill'),
  new Genre(5, 'Generic')
]
const mockPlaylists = [
  new Playlist(1, musicGenres[4].id, 'Chill Beats'),
  new Playlist(2, musicGenres[0].id, 'Classical Music'),
  new Playlist(3, musicGenres[5].id, 'Road Trip Tunes')
]

export default Playlist
