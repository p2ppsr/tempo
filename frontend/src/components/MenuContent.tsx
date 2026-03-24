// components/LeftMenu/MenuContent.tsx
import { NavLink } from 'react-router-dom'
import { FaCaretDown, FaCaretUp } from 'react-icons/fa'
import { useEffect, useState } from 'react'
import fetchUserSongs from '../utils/fetchSongs/fetchUserSongs'
import { useAuthStore, useModals } from '../stores/stores'
import tempoLogo from '../assets/Images/tempoLogo.png'
import './LeftMenu/LeftMenu.scss'

const MenuContent = ({ close }: { close?: () => void }) => {
  const [libraryOpen, setLibraryOpen] = useState(false)
  const [showMySongsTab, setShowMySongsTab] = useState(false)
  const [userHasMetanetClient] = useAuthStore(state => [state.userHasMetanetClient])
  const [, setInvitationModalOpen, setInvitationModalContent] = useModals(state => [
    state.invitationModalOpen,
    state.setInvitationModalOpen,
    state.setInvitationModalContent
  ])

  useEffect(() => {
    if (!userHasMetanetClient) return
    ;(async () => {
      const userSongs = await fetchUserSongs()
      if (userSongs?.length) setShowMySongsTab(true)
    })()
  }, [userHasMetanetClient])

  // Define the InvitationContent type or import it if it's defined elsewhere
  type InvitationContent = 'library' | 'publish'; // Adjust according to your actual type definition

  const handleMncCheck = (e: React.MouseEvent, source: string) => {
    if (!userHasMetanetClient) {
      e.preventDefault()
      setInvitationModalContent(source as InvitationContent)
      setInvitationModalOpen(true)
      close?.()
    }
  }

  return (
    <aside className="mobileMenuContent">
      <div className="logoContainer">
        <img className="menuLogo" src={tempoLogo} alt="Tempo logo" />
        <p className="menuTagline">Music marketplace powered by BSV.</p>
      </div>

      <ul>
        <NavLink to="/" end onClick={close}>
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
                close?.()
              }}
            >
              Likes
            </NavLink>
            <NavLink
              to="/Playlists"
              className="menuAccordionLink"
              onClick={e => {
                handleMncCheck(e, 'library')
                close?.()
              }}
            >
              Playlists
            </NavLink>
          </>
        )}

        {showMySongsTab && (
          <NavLink to="/MySongs" onClick={close}>
            <li className="link">My Songs</li>
          </NavLink>
        )}

        <NavLink
          to="/PublishSong"
          onClick={e => {
            handleMncCheck(e, 'publish')
            close?.()
          }}
        >
          <li className="link">Publish</li>
        </NavLink>
      </ul>
    </aside>
  )
}

export default MenuContent
