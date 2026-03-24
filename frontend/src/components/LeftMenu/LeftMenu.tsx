/**
 * @file LeftMenu.tsx
 * @description
 * React component providing the left-side navigation menu for Tempo.
 * Includes links for Home, Library (with expandable accordion), My Songs,
 * and Publish Song. Integrates Metanet Client detection to gate access to
 * certain features and prompts the InvitationModal when necessary.
 */

import React, { useEffect, useState } from 'react'
import { FaCaretDown, FaCaretUp } from 'react-icons/fa'
import { NavLink, useLocation } from 'react-router-dom'
import './LeftMenu.scss'

import tempoLogo from '../../assets/Images/tempoLogo.png'
import fetchUserSongs from '../../utils/fetchSongs/fetchUserSongs'
import { useAuthStore, useModals } from '../../stores/stores'

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
  const [showMySongsTab, setShowMySongsTab] = useState(false)

  // ========== GLOBAL STATE ==========
  const [userHasMetanetClient] = useAuthStore((state: any) => [state.userHasMetanetClient])

  const [
    setInvitationModalOpen,
    setInvitationModalContent
  ] = useModals((state: any) => [
    state.setInvitationModalOpen,
    state.setInvitationModalContent
  ])

  // ========== EFFECTS ==========

  // Close library accordion on page change
  const location = useLocation()
  useEffect(() => {
    setLibraryOpen(false)
  }, [location])

  useEffect(() => {
    if (!userHasMetanetClient) return

    ;(async () => {
      try {
        const userSongs = await fetchUserSongs()
        if (userSongs && userSongs.length > 0) {
          setShowMySongsTab(true)
        }
      } catch (err) {
        console.error('Failed to fetch user songs:', err)
      }
    })()
  }, [userHasMetanetClient])

  /**
   * Prevents navigation if Metanet Client is not installed,
   * opens the invitation modal instead.
   */
  const handleMncCheck = (e: React.MouseEvent, source: string) => {
    if (!userHasMetanetClient) {
      e.preventDefault()
      setInvitationModalContent(source)
      setInvitationModalOpen(true)
    }
  }

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
              onClick={e => {
                handleMncCheck(e, 'library')
              }}
            >
              Likes
            </NavLink>
            <NavLink
              to="/Playlists"
              className="menuAccordionLink"
              onClick={e => {
                handleMncCheck(e, 'library')
              }}
            >
              Playlists
            </NavLink>
          </>
        )}

        {showMySongsTab && (
          <NavLink to="/MySongs">
            <li className="link">My Songs</li>
          </NavLink>
        )}

        <NavLink
          to="/PublishSong"
          onClick={e => {
            handleMncCheck(e, 'publish')
          }}
        >
          <li className="link">Publish</li>
        </NavLink>
      </ul>
    </aside>
  )
}
export default LeftMenu
