import React from 'react'
// import './index.css'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import ArtistProfile from './pages/ArtistProfile'
import PublishASong from './pages/PublishASong'
import SuccessPage from './pages/PublishASong/PublishSuccess'

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
    <Router>
      <Routes>
        <Route exact path='/' element={<Home />} />
        <Route exact path='/ArtistProfile' element={<ArtistProfile />} />
        <Route exact path='/PublishASong' element={<PublishASong />} />
        <Route exact path='/PublishASong/Success' element={<SuccessPage />} />
      </Routes>
    </Router>
  )
}

export default App
