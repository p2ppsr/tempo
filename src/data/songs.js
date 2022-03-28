class Song {
  constructor (title, id, artist, length) {
    this.title = title
    this.id = id
    this.artist = artist
    this.length = length
  }
}

const Songs = [
  new Song('Talkin\' Tennessee', '1234', 'Morgan Wallen', '3:45'),
  new Song('Song Title', '1234', 'Artist', '3:45'),
  new Song('Song Title', '1234', 'Artist', '3:45'),
  new Song('Song Title', '1234', 'Artist', '3:45'),
  new Song('Song Title', '1234', 'Artist', '3:45'),
  new Song('Song Title', '1234', 'Artist', '3:45'),
  new Song('Song Title', '1234', 'Artist', '3:45'),
  new Song('Song Title', '1234', 'Artist', '3:45')
]

export default Songs
