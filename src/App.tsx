// Dependencies
import React, { useState } from "react"
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import { ToastContainer } from "react-toastify"

// Components
import Home from "./pages/Home/Home"
import SavedSongs from "./pages/SavedSongs/SavedSongs"
import Playlists from "./pages/Playlists/Playlists"
import CreatePlaylist from "./pages/Playlists/Create/CreatePlaylist"
import MySongs from "./pages/MySongs/MySongs"
import EditSong from "./pages/EditSong/EditSong"
import PublishSong from "./pages/PublishSong/PublishSong"
import SuccessPage from "./pages/PublishSong/PublishSuccess/PublishSuccess"
import LeftMenu from "./components/LeftMenu/LeftMenu"
import Footer from "./components/Footer/Footer"
import Profile from "./pages/Profile/Profile"

// Styles
import "./App.scss"
import "./styles/utils.scss"
import "./styles/forms.scss"
import "./styles/typography.scss"
import TopMenu from "./components/TopMenu/TopMenu"
import Likes from "./pages/Library/Likes/Likes"

const App = () => {
  return (
    <>
      <ToastContainer
        position="top-center"
        containerId="alertToast"
        autoClose={7000}
      />

      {/* <div className="backgroundImage" /> */}

      <img src="/Images/background.jpg" className="backgroundImage" />

      <Router>
        <div className="flex">
          <LeftMenu />
          <div className="rightContainer">
            <TopMenu />
            <div style={{ marginTop: "3rem" }}>
              <Footer />
              <div>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/SavedSongs" element={<SavedSongs />} />
                  <Route path="/Playlists" element={<Playlists />} />
                  <Route
                    path="/Playlists/Create"
                    element={<CreatePlaylist />}
                  />
                  <Route path="/Profile" element={<Profile />} />
                  <Route path="/MySongs" element={<MySongs />} />
                  <Route path="/EditSong" element={<EditSong />} />
                  <Route path="/PublishSong" element={<PublishSong />} />
                  <Route
                    path="/PublishSong/Success"
                    element={<SuccessPage />}
                  />

                  <Route path="/Likes" element={<Likes />} />
                </Routes>
              </div>
            </div>
          </div>
        </div>
      </Router>
    </>
  )
}

export default App
