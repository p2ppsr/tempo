// components/LeftMenu/MenuContent.tsx
import { NavLink } from 'react-router-dom'
import { FaCaretDown, FaCaretUp } from 'react-icons/fa'
import { useState } from 'react'
import tempoLogo from '../assets/Images/tempoLogo.png'
import './LeftMenu/LeftMenu.scss'

const MenuContent = ({ close }: { close?: () => void }) => {
  const [libraryOpen, setLibraryOpen] = useState(false)

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
              onClick={close}
            >
              Likes
            </NavLink>
            <NavLink
              to="/Playlists"
              className="menuAccordionLink"
              onClick={close}
            >
              Playlists
            </NavLink>
          </>
        )}

        <NavLink to="/MySongs" onClick={close}>
          <li className="link">My Songs</li>
        </NavLink>

        <NavLink to="/PublishSong" onClick={close}>
          <li className="link">Publish</li>
        </NavLink>
      </ul>
    </aside>
  )
}

export default MenuContent
