/**
 * @file TopMenu.tsx
 * @description
 * React component for displaying the top menu navigation bar in Tempo.
 * Includes simple backward/forward browser navigation buttons and
 * a placeholder for future user profile functionality.
 */

import { IoArrowBackCircle, IoArrowForwardCircle } from 'react-icons/io5'
import { GiHamburgerMenu } from 'react-icons/gi'
import { Drawer, IconButton } from '@mui/material'
import { useState } from 'react'
import MenuContent from '../MenuContent'
import './TopMenu.scss'

/**
 * TopMenu Component
 *
 * Renders a top navigation bar with:
 * - Back and forward buttons using `window.history` to navigate browser history.
 * - A flexible spacer for alignment.
 * - (Commented out) placeholder for future user profile UI.
 *
 * This component does not rely on Zustand or any global state,
 * and can be reused across pages where top navigation is needed.
 */
const TopMenu = () => {
  const [menuOpen, setMenuOpen] = useState(false)

  const handleNavigate = (direction: 'back' | 'forward') => {
    direction === 'back' ? window.history.back() : window.history.forward()
  }

  return (
    <div className="topMenuContainer">
      <IconButton onClick={() => setMenuOpen(true)} className="hamburger">
        <GiHamburgerMenu size={24} color="white" />
      </IconButton>

      <IoArrowBackCircle size={30} color="white" className="navigationIcon" onClick={() => handleNavigate('back')} />
      <IoArrowForwardCircle size={30} color="white" className="navigationIcon" onClick={() => handleNavigate('forward')} />
      <div className="flexSpacer" />

      <Drawer anchor="left" open={menuOpen} onClose={() => setMenuOpen(false)}>
        <div className="drawerContent">
          <MenuContent close={() => setMenuOpen(false)} />
        </div>
      </Drawer>
    </div>
  )
}

export default TopMenu
