class Song {
  constructor (title, id, artist, length) {
    this.title = title
    this.id = id
    this.artist = artist
    this.length = length
  }
}
class Artist {
  constructor (name, bio) {
    this.name = name
    this.bio = bio
  }
}

const MorganWallen = new Artist('Morgan Wallen', 'Country Singer')
const ArtistPlaceholder = new Artist('ArtistName', 'Bio coming soon...')

const Songs = [
  new Song('Talkin\' Tennessee', '1234', MorganWallen, '3:45'),
  new Song('Song Title', '1234', ArtistPlaceholder, '3:45'),
  new Song('Song Title', '1234', ArtistPlaceholder, '3:45'),
  new Song('Song Title', '1234', ArtistPlaceholder, '3:45'),
  new Song('Song Title', '1234', ArtistPlaceholder, '3:45'),
  new Song('Song Title', '1234', ArtistPlaceholder, '3:45'),
  new Song('Song Title', '1234', ArtistPlaceholder, '3:45'),
  new Song('Song Title', '1234', ArtistPlaceholder, '3:45')
]

export default Songs
