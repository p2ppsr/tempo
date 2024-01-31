import React from 'react'
import './MySongs.scss'
import 'react-toastify/dist/ReactToastify.css'

const MySongs = () => {
	return (
		<div className="container">
			<h1>My Songs</h1>
			<p className="whiteText">Update or delete your published songs</p>

			<div className="uploadSection">
				{/* <SongsViewer
					searchFilter={{ findAll: 'true', artistIdentityKey: '' }}
					mySongsOnly={true}
				/> */}
			</div>
		</div>
	)
}
export default MySongs
