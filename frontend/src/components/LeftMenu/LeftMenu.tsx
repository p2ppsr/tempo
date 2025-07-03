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

// @ts-ignore: Static asset import
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
    _invitationModalOpen,
    setInvitationModalOpen,
    setInvitationModalContent
  ] = useModals((state: any) => [
    state.invitationModalOpen,
    state.setInvitationModalOpen,
    state.setInvitationModalContent
  ])

  // ========== EFFECTS ==========

  // Close library accordion on page change
  let location = useLocation()
  useEffect(() => {
    setLibraryOpen(false)
  }, [location])

  useEffect(() => {
  if (!userHasMetanetClient) return

  (async () => {
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
    <div>
      <div className="leftMenu">
        <div className="logoContainer">
          <img className="menuLogo" src={tempoLogo} />
        </div>
        <ul>
          <NavLink to="/">
            <li className="link">Home</li>
          </NavLink>

          <div
            className="link"
            onClick={() => setLibraryOpen(!libraryOpen)}
            style={libraryOpen ? { margin: '0' } : {}}
          >
            <div className="flex">
              Library
              <div className="flexSpacer" />
              {libraryOpen ? (
                <FaCaretUp color="white" style={{ marginRight: '10%' }} />
              ) : (
                <FaCaretDown color="white" style={{ marginRight: '10%' }} />
              )}
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
              <div className="menuAccordionDivider" />
              <NavLink
                to="/Playlists"
                className="menuAccordionLink"
                onClick={e => {
                  handleMncCheck(e, 'library')
                }}
              >
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
      </div>
    </div>
  )
}
export default LeftMenu
