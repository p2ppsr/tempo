import { NavLink } from 'react-router-dom'
import './TopMenu.scss'

import { FaUserCircle } from 'react-icons/fa'
import { IoArrowBackCircle, IoArrowForwardCircle } from 'react-icons/io5'
import React from "react"
import { useAuthStore } from "../../stores/stores"

const TopMenu = () => {
	const [userName] = useAuthStore((state: any) => [state.userName])

	const handleNavigate = (direction: string) => {
		direction === 'back' ? history.back() : history.forward()
	}

	return (
		<div className="topMenuContainer">

			<IoArrowBackCircle
				size={30}
				color="white"
				className='navigationIcon'
				style={{ marginInline: '1rem' }}
				onClick={() => {
					handleNavigate('back')
				}}
			/>

			<IoArrowForwardCircle
				size={30}
				color="white"
				className='navigationIcon'
				onClick={() => {
					handleNavigate('forward')
				}}
			/>

			<div className="flexSpacer" />

			<NavLink
				to="/Profile"
				className="menuProfileContainer flex"
			>
				<p>{userName}</p>
				<FaUserCircle size={30}/>
			</NavLink>
		</div>
	)
}
export default TopMenu
