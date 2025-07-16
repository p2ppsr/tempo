/**
 * @file TopMenu.tsx
 * @description
 * React component for displaying the top menu navigation bar in Tempo.
 * Includes simple backward/forward browser navigation buttons and
 * a placeholder for future user profile functionality.
 */

import { IoArrowBackCircle, IoArrowForwardCircle } from 'react-icons/io5'
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
  // const [userName] = useAuthStore((state: any) => [state.userName])

  const handleNavigate = (direction: 'back' | 'forward') => {
    direction === 'back' ? window.history.back() : window.history.forward()
  }

  return (
    <div className="topMenuContainer">
      <IoArrowBackCircle
        size={30}
        color="white"
        className="navigationIcon"
        style={{ marginInline: '1rem' }}
        onClick={() => handleNavigate('back')}
      />
      <IoArrowForwardCircle
        size={30}
        color="white"
        className="navigationIcon"
        onClick={() => handleNavigate('forward')}
      />
      <div className="flexSpacer" />

      {/* Future user profile dropdown / avatar UI could go here */}
      {/* <NavLink to="/Profile" className="menuProfileContainer flex">
        <p>{userName}</p>
        <FaUserCircle size={30} />
      </NavLink> */}
    </div>
  )
}

export default TopMenu
