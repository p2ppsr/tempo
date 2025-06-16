import { IoArrowBackCircle, IoArrowForwardCircle } from 'react-icons/io5'
// import { useAuthStore } from '../../stores/stores'
import './TopMenu.scss'

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
