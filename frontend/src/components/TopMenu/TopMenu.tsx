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
import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
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
  const location = useLocation()
  const navigate = useNavigate()

  const [navState, setNavState] = useState(() => {
    const route = `${location.pathname}${location.search}${location.hash}`
    return {
      entries: [{ key: location.key || route, route }],
      index: 0
    }
  })

  const pageLabel = useMemo(() => {
    const path = location.pathname.toLowerCase()

    if (path === '/') return 'Home'
    if (path.includes('/publi')) return 'Publish'
    if (path.includes('/playlist')) return 'Playlists'
    if (path.includes('/my')) return 'My Songs'
    if (path.includes('/like')) return 'Likes'
    if (path.includes('/artist')) return 'Artist'
    if (path.includes('/profile')) return 'Profile'
    if (path.includes('/song/')) return 'Track'
    return 'Tempo'
  }, [location.pathname])

  useEffect(() => {
    const route = `${location.pathname}${location.search}${location.hash}`
    const key = location.key || route

    setNavState((prev) => {
      if (!prev.entries.length) {
        return { entries: [{ key, route }], index: 0 }
      }

      if (prev.entries[prev.index]?.key === key) {
        return prev
      }

      const existingIndex = prev.entries.findIndex((entry) => entry.key === key)
      if (existingIndex !== -1) {
        return { ...prev, index: existingIndex }
      }

      const nextEntries = [...prev.entries.slice(0, prev.index + 1), { key, route }]
      return {
        entries: nextEntries,
        index: nextEntries.length - 1
      }
    })
  }, [location.hash, location.key, location.pathname, location.search])

  const canGoBack = navState.index > 0
  const canGoForward = navState.index < navState.entries.length - 1

  const handleNavigate = (direction: 'back' | 'forward') => {
    if (direction === 'back' && canGoBack) {
      navigate(-1)
      return
    }

    if (direction === 'forward' && canGoForward) {
      navigate(1)
    }
  }

  return (
    <div className="topMenuContainer">
      <div className="topMenuNav">
        <IconButton onClick={() => setMenuOpen(true)} className="hamburger">
          <GiHamburgerMenu size={20} />
        </IconButton>

        {canGoBack && (
          <button className="navButton" onClick={() => handleNavigate('back')} aria-label="Go back">
            <IoArrowBackCircle size={24} className="navigationIcon" />
          </button>
        )}
        {canGoForward && (
          <button className="navButton" onClick={() => handleNavigate('forward')} aria-label="Go forward">
            <IoArrowForwardCircle size={24} className="navigationIcon" />
          </button>
        )}
      </div>

      <div className="topMenuMeta">
        <p className="topMenuPageLabel">{pageLabel}</p>
      </div>

      <Drawer
        anchor="left"
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        PaperProps={{ className: 'topMenuDrawerPaper' }}
      >
        <div className="drawerContent">
          <MenuContent close={() => setMenuOpen(false)} />
        </div>
      </Drawer>
    </div>
  )
}

export default TopMenu
