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
import InvitationModal from './components/InvitationModal/InvitationModal'
import ViewPlaylist from './pages/Playlists/ViewPlaylist'
import { useAuthStore } from './stores/stores'
import useAsyncEffect from 'use-async-effect'
import checkForMetaNetClient from './utils/checkForMetaNetClient'
import ViewSong from './pages/ViewSong/ViewSong'

const App = () => {
  const [userHasMetanetClient, setUserHasMetanetClient] = useAuthStore((state: any) => [
    state.userHasMetanetClient,
    state.setUserHasMetanetClient
  ])

  const setUserMnCStatus = async () => {
    const userHasMnC = await checkForMetaNetClient() // returns 1 if mainline, -1 if stageline, 0 if neither
    setUserHasMetanetClient(userHasMnC !== 0)
  }

  const mncPollFrequency = 3000 // milliseconds
  useAsyncEffect(async () => {
    // Check if user is logged into MNC and set global state, then poll for changes
    await setUserMnCStatus()

    // const pollMncClient = setInterval(async () => {
    //   await setUserMnCStatus()
    // }, mncPollFrequency)

    // return () => {
    //   clearInterval(pollMncClient)
    // }
  }, [])

  return (
    <>
      <ToastContainer position="top-center" containerId="alertToast" autoClose={7000} />

      <img src={backgroundImage} className="backgroundImage" />

      {/* Invitation Modal for a non-MNC user */}
      <InvitationModal />

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
              <Route path="/Likes" element={<Likes />} />
              <Route path="/Song/:audioURL" element={<ViewSong />} />
            </Routes>
          </div>

          <Footer />
        </div>
      </Router>
    </>
  )
}

export default App
