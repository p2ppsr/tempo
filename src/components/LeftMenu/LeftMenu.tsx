import React, { useEffect, useState } from "react"
import { FaCaretDown, FaCaretUp } from "react-icons/fa"
import { NavLink, useLocation } from "react-router-dom"
import "./LeftMenu.scss"

// @ts-ignore
import tempoLogo from '../../assets/Images/tempoLogo.png'

const LeftMenu = () => {
  // State for whether library accordion is open or closed
  const [libraryOpen, setLibraryOpen] = useState(false)

  // Close library accordion on page change
  let location = useLocation()
  useEffect(() => {
    setLibraryOpen(false)
  }, [location])

  return (
    <div>
      <div className="leftMenu">
        <div className="logoContainer">
          <img className='menuLogo' src={tempoLogo} />
        </div>
        <ul>
          <NavLink to="/">
            <li className="link">Home</li>
          </NavLink>

          <div
            className="link"
            onClick={() => setLibraryOpen(!libraryOpen)}
            style={libraryOpen ? { margin: "0" } : {}}
          >
            <div className="flex">
              Library
              <div className="flexSpacer" />
              {libraryOpen ? (
                <FaCaretUp color="white" style={{ marginRight: "10%" }} />
              ) : (
                <FaCaretDown color="white" style={{ marginRight: "10%" }} />
              )}
            </div>
          </div>

          {libraryOpen && (
            <>
              <NavLink to="/Likes" className="menuAccordionLink">
                Likes
              </NavLink>
              <div className="menuAccordionDivider" />
              <NavLink to="/Playlists" className="menuAccordionLink">
                Playlists
              </NavLink>
              {/* <div className="menuAccordionDivider" /> */}
              {/* <NavLink to="/Artists" className="menuAccordionLink">
                Artists
              </NavLink>
              <div className="menuAccordionDivider" />
              <NavLink to="/Podcasts" className="menuAccordionLink">
                Podcasts
              </NavLink> */}
            </>
          )}

          <NavLink to="/MySongs">
            <li className="link">My Songs</li>
          </NavLink>

          <NavLink to="/PublishSong">
            <li className="link">Publish</li>
          </NavLink>
        </ul>
      </div>
    </div>
  )
}
export default LeftMenu
