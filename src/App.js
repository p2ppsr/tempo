import React from 'react'
// import './index.css'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import SavedSongs from './pages/SavedSongs'
import Playlists from './pages/Playlists'
import CreatePlaylist from './pages/Playlists/Create'
import ArtistProfile from './pages/ArtistProfile'
import EditProfile from './pages/EditProfile'
import MySongs from './pages/MySongs'
import EditSong from './pages/EditSong'
import PublishASong from './pages/PublishASong'
import SuccessPage from './pages/PublishASong/PublishSuccess'
import LeftMenu from './components/LeftMenu'
import Footer from './components/Footer'

// const useStyles = makeStyles(theme => ({
//   content_wrap: {
//     display: 'grid',
//     placeItems: 'center',
//     width: '100%',
//     minHeight: '100vh'
//   },
//   action_button: {
//     marginBottom: theme.spacing(3)
//   }
// }), { name: 'App' })

const App = () => {
  return (
    <div className='rightSide'>
      <Router>
        <div className='main'>
          <LeftMenu />
          <Footer />
          <div>
            <Routes>
              <Route exact path='/' element={<Home />} />
              <Route exact path='/SavedSongs' element={<SavedSongs />} />
              <Route exact path='/Playlists' element={<Playlists />} />
              <Route exact path='/Playlists/Create' element={<CreatePlaylist />} />
              <Route exact path='/ArtistProfile' element={<ArtistProfile />} />
              <Route exact path='/EditProfile' element={<EditProfile />} />
              <Route exact path='/MySongs' element={<MySongs />} />
              <Route exact path='/EditSong' element={<EditSong />} />
              <Route exact path='/PublishASong' element={<PublishASong />} />
              <Route exact path='/PublishASong/Success' element={<SuccessPage />} />
            </Routes>
          </div>
        </div>
      </Router>
    </div>
  )
}

export default App
