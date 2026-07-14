/**
 * @file LeftMenu.tsx
 * @description
 * React component providing the left-side navigation menu for Tempo.
 * Includes links for Home, Library (with expandable accordion), My Songs,
 * and Publish Song. Integrates Metanet Client detection to gate access to
 * certain features and prompts the InvitationModal when necessary.
 */

import { useEffect, useState } from 'react'
import { FaCaretDown, FaCaretUp } from 'react-icons/fa'
import { NavLink, useLocation } from 'react-router-dom'
import './LeftMenu.scss'

import tempoLogo from '../../assets/Images/tempoLogo.png'

/**
 * LeftMenu Component
 *
 * Renders Tempo’s primary sidebar navigation, including:
 * - Static links: Home, Publish
 * - Expandable Library accordion with Likes & Playlists
 * - Conditionally displayed My Songs tab (based on user song ownership)
 *
 * Automatically closes the library accordion on page changes, checks
 * Metanet Client presence before allowing access to certain routes,
 * and opens the invitation modal if needed.
 */
const LeftMenu = () => {
  // ========== COMPONENT STATE ==========
  const [libraryOpen, setLibraryOpen] = useState(false)

  // ========== EFFECTS ==========

  // Close library accordion on page change
  const location = useLocation()
  useEffect(() => {
    setLibraryOpen(false)
  }, [location])

  // ========== RENDER ==========
  return (
    <aside className="leftMenuContent">
      <div className="logoContainer">
        <img className="menuLogo" src={tempoLogo} alt="Tempo logo" />
        <p className="menuTagline">Music marketplace powered by BSV.</p>
      </div>

      <ul>
        <NavLink to="/" end>
          <li className="link">Home</li>
        </NavLink>

        <div className="link libraryToggle" onClick={() => setLibraryOpen(!libraryOpen)}>
          <div className="flex">
            Library
            <div className="flexSpacer" />
            {libraryOpen ? <FaCaretUp /> : <FaCaretDown />}
          </div>
        </div>

        {libraryOpen && (
          <>
            <NavLink
              to="/Likes"
              className="menuAccordionLink"
            >
              Likes
            </NavLink>
            <NavLink
              to="/Playlists"
              className="menuAccordionLink"
            >
              Playlists
            </NavLink>
          </>
        )}

        <NavLink to="/MySongs">
          <li className="link">My Songs</li>
        </NavLink>

        <NavLink to="/PublishSong">
          <li className="link">Publish</li>
        </NavLink>
      </ul>
    </aside>
  )
}
export default LeftMenu
