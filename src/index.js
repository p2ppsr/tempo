import React from 'react'
import ReactDOM from 'react-dom'
import './index.css'
// import App from './App'
import Prompt from '@babbage/react-prompt'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
// import Home from './pages/Home'
import Home from './pages/Home'
import ArtistProfile from './pages/ArtistProfile'

ReactDOM.render(
  <Prompt appName='tempo'>
    <ToastContainer
      position='top-center'
    />
    {/* Figure out what routes are available */}
    <Router>
      <Routes>
        <Route exact path='/' element={<Home />} />
        <Route exact path='/ArtistProfile' element={<ArtistProfile />} />
      </Routes>
    </Router>
  </Prompt>,
  document.getElementById('root')
)
