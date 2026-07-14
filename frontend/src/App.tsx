import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { useMediaQuery, useTheme } from '@mui/material'
import { lazy, Suspense, useEffect } from 'react'

import Footer from './components/Footer/Footer'
import LeftMenu from './components/LeftMenu/LeftMenu'
import SocialShareModal from './components/SocialShareModal/SocialShareModal'
import TopMenu from './components/TopMenu/TopMenu'
import PageMetadata from './components/PageMetadata'

import Home from './pages/Home/Home'

import './App.scss'
import './styles/forms.scss'
import './styles/modal.scss'
import './styles/typography.scss'
import './styles/utils.scss'

import backgroundImage from './assets/Images/background.jpg'

import { captureError, captureSignal } from './utils/usercom'
import FeedbackPanel from './components/FeedbackPanel/FeedbackPanel'

const EditSong = lazy(() => import('./pages/EditSong/EditSong'))
const Likes = lazy(() => import('./pages/Likes/Likes'))
const MySongs = lazy(() => import('./pages/MySongs/MySongs'))
const CreatePlaylist = lazy(() => import('./pages/Playlists/Create/CreatePlaylist'))
const Playlists = lazy(() => import('./pages/Playlists/Playlists'))
const ViewPlaylist = lazy(() => import('./pages/Playlists/ViewPlaylist'))
const Profile = lazy(() => import('./pages/Profile/Profile'))
const PublishSong = lazy(() => import('./pages/PublishSong/PublishSong'))
const SuccessPage = lazy(() => import('./pages/PublishSong/PublishSuccess/PublishSuccess'))
const ViewSong = lazy(() => import('./pages/ViewSong/ViewSong'))
const ViewArtist = lazy(() => import('./pages/ViewArtist/ViewArtist'))

const App = () => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

  useEffect(() => {
    captureSignal('app.opened', { surface: 'web-app' })
    const handleError = (event: ErrorEvent) => captureError('app.unhandled_error', event.error || event.message)
    const handleRejection = (event: PromiseRejectionEvent) => captureError('app.unhandled_rejection', event.reason)
    window.addEventListener('error', handleError)
    window.addEventListener('unhandledrejection', handleRejection)
    return () => {
      window.removeEventListener('error', handleError)
      window.removeEventListener('unhandledrejection', handleRejection)
    }
  }, [])

  return (
    <>
      <img src={backgroundImage} className="backgroundImage" alt="" aria-hidden />

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
            <Suspense fallback={<div className="routeLoading" role="status">Loading Tempo…</div>}>
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
            </Suspense>
          </main>

          <Footer />
          <FeedbackPanel />
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
