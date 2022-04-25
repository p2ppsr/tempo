class Song {
  constructor (title, id, artist, length) {
    this.title = title
    this.id = id
    this.artist = artist
    this.length = length
    this.isFavorite = false
  }
}
class Artist {
  constructor (name, bio) {
    this.name = name
    this.bio = bio
  }
}

const MorganWallen = new Artist('Morgan Wallen', 'Country Singer')
const CAIN = new Artist('CAIN', 'Bio coming soon...')
const ArtistPlaceholder = new Artist('ArtistName', 'Bio coming soon...')

const Songs = [
  new Song('Song Title', '1231', CAIN, '3:45'),
  new Song('Song Title', '1232', MorganWallen, '3:45'),
  new Song('Song Title', '1233', ArtistPlaceholder, '3:45'),
  new Song('Song Title', '1234', ArtistPlaceholder, '3:45'),
  new Song('Song Title', '1235', ArtistPlaceholder, '3:45'),
  new Song('Song Title', '1236', ArtistPlaceholder, '3:45'),
  new Song('Song Title', '1237', ArtistPlaceholder, '3:45'),
  new Song('Song Title', '1238', ArtistPlaceholder, '3:45')
]

const parapetMock = () => {
  return Songs
}

export default parapetMock
