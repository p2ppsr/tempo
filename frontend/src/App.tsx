import { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { useMediaQuery, useTheme } from '@mui/material'

// Components
import Footer from './components/Footer/Footer'
import InvitationModal from './components/InvitationModal/InvitationModal'
import LeftMenu from './components/LeftMenu/LeftMenu'
import SocialShareModal from './components/SocialShareModal/SocialShareModal'
import TopMenu from './components/TopMenu/TopMenu'

// Pages (unchanged)
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
import ViewArtist from './pages/ViewArtist/ViewArtist'
import { WalletClient } from '@bsv/sdk'
// Styles
import './App.scss'
import './styles/forms.scss'
import './styles/modal.scss'
import './styles/typography.scss'
import './styles/utils.scss'

// Assets
import backgroundImage from './assets/Images/background.jpg'

// Store and utils
import { useAuthStore } from './stores/stores'
import checkForMetaNetClient from './utils/checkForMetaNetClient'

const App = () => {
  const setUserHasMetanetClient = useAuthStore(state => state.setUserHasMetanetClient)

  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

  // Detect MetaNet client
  useEffect(() => {
    const run = async () => {
      const walletClient = await new WalletClient()
      const status = await checkForMetaNetClient()
      setUserHasMetanetClient(status !== 0)
      if (status === 0) {
        console.warn('MetaNet client not detected. Some features may not work as expected.')
      } else {
        walletClient.waitForAuthentication()
        console.log('MetaNet client detected successfully.')
      }
    }
    run()
  }, [setUserHasMetanetClient])

  return (
    <>
      <ToastContainer position="top-right" containerId="alertToast" autoClose={5000} />

      <img src={backgroundImage} className="backgroundImage" />

      <InvitationModal />
      <SocialShareModal />

      <Router>
        <div className={`appLayout ${isMobile ? 'mobile' : 'desktop'}`}>
          {!isMobile && (
            <div className="leftMenu">
              <LeftMenu />
            </div>
          )}

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
              <Route path="/Song/:songURL" element={<ViewSong />} />
              <Route path="/Artist/:artistIdentityKey" element={<ViewArtist />} />
            </Routes>
          </div>

          <Footer />
        </div>
        <ToastContainer
          position="top-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />
      </Router>
    </>
  )
}

export default App
