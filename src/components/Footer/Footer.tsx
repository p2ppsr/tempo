import React, { useEffect } from "react"
import "./Footer.scss"
// import { FaUserCircle, FaPlus } from 'react-icons/fa'
// import logo from '../../Images/tempoLogo.png'
import ReactAudioPlayer from "react-audio-player"
// import { NavLink } from 'react-router-dom'
import { Img } from "uhrp-react"
import constants from "../../utils/constants"

const Footer = () => {
  useEffect(() => {}, [])

  return (
    <div className="footer">
      <Img
        alt=""
        id="playerImg"
        src={""}
        className="logoImage"
        confederacyHost={constants.confederacyURL}
      />
      <p id="songTitle"> Song Title </p>
      <ReactAudioPlayer
        src='/Music/song01.mp3'
        autoPlay={false}
        controls
        className="playerControls"
        id="audioPlayer"
      />
    </div>
  )
}
export default Footer
