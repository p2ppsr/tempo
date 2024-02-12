// Dependencies
import React, { useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'

// Components
import Home from './pages/Home/Home'
import SavedSongs from './pages/SavedSongs/SavedSongs'
import Playlists from './pages/Playlists/Playlists'
import CreatePlaylist from './pages/Playlists/Create/CreatePlaylist'
import MySongs from './pages/MySongs/MySongs'
import EditSong from './pages/EditSong/EditSong'
import PublishSong from './pages/PublishSong/PublishSong'
import SuccessPage from './pages/PublishSong/PublishSuccess/PublishSuccess'
import LeftMenu from './components/LeftMenu/LeftMenu'
import Footer from './components/Footer/Footer'
import Profile from './pages/Profile/Profile'

// Styles
import './App.scss'
import './styles/utils.scss'
import './styles/forms.scss'
import './styles/typography.scss'
import TopMenu from './components/TopMenu/TopMenu'
import Likes from './pages/Library/Likes/Likes'

import backgroundImage from './assets/Images/background.jpg'

import WebFont from 'webfontloader';


const App = () => {

  WebFont.load({ google: { families:['Audiowide','Chakra Petch']} })


  return (
    <>
      <ToastContainer position="top-center" containerId="alertToast" autoClose={7000} />

      <img src={backgroundImage} className="backgroundImage" />

      <Router>
        <div className="appLayout">
          <div className="leftMenu">
            <LeftMenu />
          </div>
          <div className="topMenu">
            <TopMenu />
          </div>

          <div className="mainContent">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/SavedSongs" element={<SavedSongs />} />
              <Route path="/Playlists" element={<Playlists />} />
              <Route path="/Playlists/Create" element={<CreatePlaylist />} />
              <Route path="/Profile" element={<Profile />} />
              <Route path="/MySongs" element={<MySongs />} />
              <Route path="/EditSong" element={<EditSong />} />
              <Route path="/PublishSong" element={<PublishSong />} />
              <Route path="/PublishSong/Success" element={<SuccessPage />} />

              <Route path="/Likes" element={<Likes />} />
            </Routes>
          </div>

          <Footer />
        </div>
      </Router>
    </>
  )
}

export default App
