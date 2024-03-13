// Dependencies
import React from 'react'
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'

// Components
import Footer from './components/Footer/Footer'
import LeftMenu from './components/LeftMenu/LeftMenu'
import EditSong from './pages/EditSong/EditSong'
import Home from './pages/Home/Home'
import MySongs from './pages/MySongs/MySongs'
import CreatePlaylist from './pages/Playlists/Create/CreatePlaylist'
import Playlists from './pages/Playlists/Playlists'
import Profile from './pages/Profile/Profile'
import PublishSong from './pages/PublishSong/PublishSong'
import SuccessPage from './pages/PublishSong/PublishSuccess/PublishSuccess'

// Styles
import './App.scss'
import TopMenu from './components/TopMenu/TopMenu'
import Likes from './pages/Library/Likes/Likes'
import './styles/forms.scss'
import './styles/typography.scss'
import './styles/utils.scss'

import backgroundImage from './assets/Images/background.jpg'
import ViewPlaylist from './pages/Playlists/ViewPlaylist'
import { useInvitationModalStore } from './stores/stores'
import InvitationModal from "./components/InvitationModal/InvitationModal"

const App = () => {

  return (
    <>
      <ToastContainer position="top-center" containerId="alertToast" autoClose={7000} />

      <img src={backgroundImage} className="backgroundImage" />

      <InvitationModal/>

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
              <Route path="/Playlists/*" element={<Playlists />} />
              <Route path="/Playlists/:id" element={<ViewPlaylist />} />
              <Route path="/Playlists/Create" element={<CreatePlaylist />} />
              <Route path="/Profile" element={<Profile />} />
              <Route path="/MySongs" element={<MySongs />} />
              <Route path="/EditSong" element={<EditSong />} />
              <Route path="/PublishSong" element={<PublishSong />} />
              <Route path="/PublishSong/Success" element={<SuccessPage />} />

              {/* TODO: Might be a subpath eventually under /library/* */}
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
