import React, { useEffect, useState } from 'react'
import { FaCaretDown, FaCaretUp } from 'react-icons/fa'
import { NavLink, useLocation } from 'react-router-dom'
import './LeftMenu.scss'

// @ts-ignore
import tempoLogo from '../../assets/Images/tempoLogo.png'
import fetchUserSongs from '../../utils/fetchSongs/fetchUserSongs'
import useAsyncEffect from 'use-async-effect'
import { useAuthStore, useInvitationModalStore } from '../../stores/stores'

const LeftMenu = () => {
  // Component state ========================================================================
  const [libraryOpen, setLibraryOpen] = useState(false)
  const [showMySongsTab, setShowMySongsTab] = useState(false)

  // Global state ===========================================================================
  const [userHasMetanetClient] = useAuthStore((state: any) => [state.userHasMetanetClient])

  const [
    invitationModalOpen,
    setInvitationModalOpen,
    setInvitationModalContent
  ] = useInvitationModalStore((state: any) => [
    state.invitationModalOpen,
    state.setInvitationModalOpen,
    state.setInvitationModalContent
  ])

  // Close library accordion on page change
  let location = useLocation()
  useEffect(() => {
    setLibraryOpen(false)
  }, [location])

  useAsyncEffect(async () => {
    if (!userHasMetanetClient) return

    const userSongs = await fetchUserSongs()
    if (userSongs.length > 0) {
      setShowMySongsTab(true)
    }
  }, [userHasMetanetClient])

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

          {userHasMetanetClient && (
            <>
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
              if (!userHasMetanetClient) {
                e.preventDefault()
                setInvitationModalContent('publishInvitation')
                setInvitationModalOpen(true)
              }
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
