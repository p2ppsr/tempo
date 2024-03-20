// Dependencies
import React from 'react'
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'

// Components
import Footer from './components/Footer/Footer'
import InvitationModal from './components/InvitationModal/InvitationModal'
import LeftMenu from './components/LeftMenu/LeftMenu'
import SocialShareModal from './components/SocialShareModal/SocialShareModal'
import TopMenu from './components/TopMenu/TopMenu'

// Pages
import EditSong from './pages/EditSong/EditSong'
import Home from './pages/Home/Home'
import Likes from './pages/Likes/Likes'
import MySongs from './pages/MySongs/MySongs'
import CreatePlaylist from './pages/Playlists/Create/CreatePlaylist'
import Playlists from './pages/Playlists/Playlists'
import ViewPlaylist from './pages/Playlists/ViewPlaylist'
import Profile from './pages/Profile/Profile'
import PublishSong from './pages/PublishSong/PublishSong'
import SuccessPage from './pages/PublishSong/PublishSuccess/PublishSuccess'
import ViewSong from './pages/ViewSong/ViewSong'

// Styles
import './App.scss'
import './styles/forms.scss'
import './styles/modal.scss'
import './styles/typography.scss'
import './styles/utils.scss'

// Assets
import useAsyncEffect from 'use-async-effect'
import backgroundImage from './assets/Images/background.jpg'
import { useAuthStore } from './stores/stores'
import checkForMetaNetClient from './utils/checkForMetaNetClient'
import ArtistSongsPage from "./pages/ViewArtist/ViewArtist"

const App = () => {
  const [userHasMetanetClient, setUserHasMetanetClient] = useAuthStore((state: any) => [
    state.userHasMetanetClient,
    state.setUserHasMetanetClient
  ])

  useAsyncEffect(async () => {
    const status = await checkForMetaNetClient()
    setUserHasMetanetClient(status !== 0)
    
    // TODO: poll for mnc without messing with other state
    
    // const myInterval = setInterval(async () => {
    //   const status = await checkForMetaNetClient()
    //   setUserHasMetanetClient(status !== 0)
    // }, 3000)
    // return(()=>{
    //   clearInterval(myInterval)
    // })
  }, [])

  return (
    <>
      <ToastContainer position="top-center" containerId="alertToast" autoClose={5000} />

      <img src={backgroundImage} className="backgroundImage" />

      {/* Invitation Modal for a non-MNC user */}
      <InvitationModal />

      {/* Social media share modal */}
      <SocialShareModal />

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
              <Route path="/Artist/:artistIdentityKey" element={<ArtistSongsPage />} />
            </Routes>
          </div>

          <Footer />
        </div>
      </Router>
    </>
  )
}

export default App
