import React from "react"
import "./MySongs.scss"
import "react-toastify/dist/ReactToastify.css"
import { Song } from "../../types/interfaces"


import testArtwork from "../../assets/AlbumArtwork/beatles.jpg"
import SongList from "../../components/SongList/SongList"

// test audio
import hereComesTheSun from "../../assets/Music/HereComesTheSun.mp3"
import zodiacGirls from "../../assets/Music/ZodiacGirls.mp3"

const MySongs = () => {
  const testSongs: Song[] = [
    {
      title: "Here Comes the Sun",
      artist: "The Beatles",
      isPublished: true,
      songFileUrl: hereComesTheSun,
      // local artwork
      artworkFileUrl: testArtwork,
      description: "A test song",
      duration: 180,
      songID: "12345",
      token: { outputIndex: 0, txid: "12345", lockingScript: "asdf" },
      outputScript: { fields: [""], protocolID: "asdf", keyID: "asdf" },
    },
    {
      title: "Zodiac Girls",
      artist: "Black Moth Super Rainbow",
      isPublished: true,
      songFileUrl: zodiacGirls,
      // imported artwork from url
      artworkFileUrl:
        "https://i.discogs.com/qRvndWXrCEXL6qXvEAqdr3juNgOxJOgg58mwu85PR1w/rs:fit/g:sm/q:90/h:599/w:600/czM6Ly9kaXNjb2dz/LWRhdGFiYXNlLWlt/YWdlcy9SLTEyNzg4/MzAtMTIxMDczNzcw/Mi5qcGVn.jpeg",
      description: "A test song",
      duration: 180,
      songID: "12345",
      token: { outputIndex: 0, txid: "12345", lockingScript: "asdf" },
      outputScript: { fields: [""], protocolID: "asdf", keyID: "asdf" },
    },
  ]

  return (
    <div className="container">
      <h1>My Songs</h1>

      <div>
        <SongList songs={testSongs} />
        {/* <SongsViewer
					searchFilter={{ findAll: 'true', artistIdentityKey: '' }}
					mySongsOnly={true}
				/> */}
      </div>
    </div>
  )
}
export default MySongs
