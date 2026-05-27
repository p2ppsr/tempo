import { useEffect } from 'react'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { useMediaQuery, useTheme } from '@mui/material'
import { WalletClient } from '@bsv/sdk'

import Footer from './components/Footer/Footer'
import InvitationModal from './components/InvitationModal/InvitationModal'
import LeftMenu from './components/LeftMenu/LeftMenu'
import SocialShareModal from './components/SocialShareModal/SocialShareModal'
import TopMenu from './components/TopMenu/TopMenu'
import PageMetadata from './components/PageMetadata'

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

import './App.scss'
import './styles/forms.scss'
import './styles/modal.scss'
import './styles/typography.scss'
import './styles/utils.scss'

import backgroundImage from './assets/Images/background.jpg'

import { useAuthStore } from './stores/stores'
import checkForMetaNetClient from './utils/checkForMetaNetClient'

const App = () => {
  const [setUserHasMetanetClient] = useAuthStore((state) => [state.setUserHasMetanetClient])

  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

  useEffect(() => {
    let isMounted = true

    const run = async () => {
      try {
        const walletClient = new WalletClient('auto', 'localhost')
        const status = await checkForMetaNetClient()
        const hasMetaNetClient = status !== 0

        if (!isMounted) return

        setUserHasMetanetClient(hasMetaNetClient)

        if (!hasMetaNetClient) {
          return
        }

        await walletClient.waitForAuthentication()
      } catch (error) {
        console.warn('MetaNet initialization failed:', error)
        if (!isMounted) return

        setUserHasMetanetClient(false)
      }
    }

    run()

    return () => {
      isMounted = false
    }
  }, [setUserHasMetanetClient])

  return (
    <>
      <img src={backgroundImage} className="backgroundImage" alt="" aria-hidden />

      <InvitationModal />
      <SocialShareModal />

      <Router>
        <PageMetadata />
        <div className={`appLayout ${isMobile ? 'mobile' : 'desktop'}`}>
          {!isMobile && (
            <div className="leftMenu">
              <LeftMenu />
            </div>
          )}

          <div className="topMenu">
            <TopMenu />
          </div>

          <main className="mainContent">
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
          </main>

          <Footer />
        </div>
      </Router>

      <ToastContainer
        position="top-right"
        autoClose={5000}
        containerId="alertToast"
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </>
  )
}

export default App
