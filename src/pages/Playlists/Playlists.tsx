import React from 'react'
import { FaPlusCircle } from 'react-icons/fa'
import './Playlists.scss'

const Playlists = () => {
  return (
    <>
      <div className="container">
        <div className="flex" style={{alignItems:'center'}}>
          <h1>Playlists</h1>

          <FaPlusCircle fill="white" className="addPlayListIcon"/>
        </div>
      </div>
    </>
  )
}

export default Playlists
