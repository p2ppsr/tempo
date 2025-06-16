// import { useState } from 'react'
// import { useLocation, useNavigate } from 'react-router-dom'
// import { toast } from 'react-toastify'
// import constants from '../../utils/constants'
// import decryptSong from '../../utils/decryptSong'
// import fetchSongs from '../../utils/fetchSongs/fetchSongs'
// import updateSong from '../../utils/updateSong'
// import './EditSong.scss'
// import { Authrite } from 'authrite-js'
// import React from 'react'
//const Confederacy = require('@cwi/confederacy')

const EditSong = () => {
  // const navigate = useNavigate()
  // const location = useLocation()
  // // Current state of the selected song
  // const { song } = location.state

  // // Contains the current state of the selected song with updates by the user
  // const [updatedSong, setUpdatedSong] = useState(song)

  // // Handle UI updates to song properties
  // const handleChange = e => {
  // 	const valueToUpdate =
  // 		e.target.name === 'selectedArtwork' || e.target.name === 'selectedMusic'
  // 			? e.target.files[0]
  // 			: e.target.value
  // 	setUpdatedSong({
  // 		...updatedSong,
  // 		[e.target.name]: valueToUpdate
  // 	})
  // }

  // const onFileUpload = async e => {
  // 	let attemptCounter = 0
  // 	let alertId = 'tempValue'
  // 	// Try to update the selected song
  // 	const attemptToUpdate = async () => {
  // 		try {
  // 			await updateSong({
  // 				song: updatedSong,
  // 				filesToUpdate: {
  // 					selectedArtwork: updatedSong.selectedArtwork,
  // 					selectedMusic: updatedSong.selectedMusic
  // 				}
  // 			})
  // 		} catch (error) {
  // 			// Handle double spend attempts
  // 			if (error.code === 'ERR_DOUBLE_SPEND') {
  // 				// Let the user know what is happening
  // 				toast.dismiss(alertId)
  // 				alertId = toast.error(
  // 					'Double spend attempt detected! Attempting to resolve state...'
  // 				)

  // 				//Notify confederacy of missing state change(s)
  // 				await Promise.all(
  // 					Object.values(error.spendingTransactions).map(async env => {
  // 						await new Authrite().request(`${constants.confederacyURL}/submit`, {
  // 							method: 'POST',
  // 							body: {
  // 								...envelope,
  // 								topics: ['TSP']
  // 							}
  // 						})
  // 					})
  // 				)

  // 				// If we haven't surpassed the limit, try to update the song again
  // 				if (attemptCounter < 3) {
  // 					// Get the new state of the song to update
  // 					const songs = await fetchSongs({ songID: song.songID })
  // 					const changedSong = songs[0]
  // 					// Figure what state changes were made by the previous transaction
  // 					Object.keys(changedSong).forEach(prop => {
  // 						// Rules Tempo State Updates Follow:
  // 						// 1. If a property was updated by a spending transaction, updated the current state to match.
  // 						// 2. If the current update attempt also updated that property, the current updated value has priority.
  // 						// 3. If a property was updated by a spending transaction and not the current update, the new state is applied.
  // 						// 4. If no changes were made, the current state is kept.

  // 						if (
  // 							changedSong[prop] !== song[prop] &&
  // 							updatedSong[prop] !== song[prop]
  // 						) {
  // 							song[prop] = updatedSong[prop]
  // 						} else {
  // 							song[prop] = changedSong[prop]
  // 						}
  // 					})
  // 					// Set updatedSong so that it contains the new state discovered, as well as current updates
  // 					setUpdatedSong(song)
  // 					attemptCounter++
  // 					// Attempt update again
  // 					return await attemptToUpdate()
  // 				} else {
  // 					throw error
  // 				}
  // 			} else {
  // 				throw error
  // 			}
  // 		}
  // 		navigate('/MySongs')
  // 	}

  // 	toast.promise(attemptToUpdate, {
  // 		pending: 'Updating song... 🛠',
  // 		success: 'Song updated! 🎉',
  // 		error: 'Failed to update song! 🤯'
  // 	})
  // }
  // // Demo the current song audio file
  // const playSong = async e => {
  // 	toast.promise(
  // 		async () => {
  // 			const decryptedSongURL = await decryptSong({
  // 				song
  // 			})

  // 			// Update the audioPlayer to play the selected song
  // 			const audioPlayer = document.getElementById('audioPlayer')
  // 			audioPlayer.src = decryptedSongURL
  // 			audioPlayer.autoplay = true
  // 		},
  // 		{
  // 			pending: 'Loading current song...',
  // 			success: 'Feel the beat! 🎉',
  // 			error: 'Failed to load song! 🤯'
  // 		}
  // 	)
  // }

  return (
    <div className="EditSong">
      {/* <div className="menuAndContentSection">
				<div className="mainContentEditSong">
					<div className="header">
						<h1>Edit Song</h1>
						<p className="subTitle">
							Become your own publisher and upload your music for the world to hear!
						</p>
					</div>
					<div className="uploadSectionEditSong">
						<div className="albumArtwork">
							<h3>ALBUM ARTWORK</h3>
							<Img
								src={songrl}
								confederacyHost={constants.confederacyURL}
								style={{ width: '300px' }}
							/>
							<button className="button tipBtn" onClick={playSong}>
								Listen
							</button>
						</div>
						<div className="centered">
							<form>
								<label>SONG TITLE</label>
								<input
									type="text"
									className="textInput"
									name="title"
									placeholder="Title"
									value={updatedSong.title}
									onChange={handleChange}
								/>
								<label>FEATURED ARTIST</label>
								<input
									type="text"
									className="textInput"
									name="artist"
									placeholder="artist"
									value={updatedSong.artist}
									onChange={handleChange}
								/>
								<label>REPLACE ARTWORK (OPTIONAL)</label>
								<input
									type="file"
									name="selectedArtwork"
									className="upload"
									onChange={handleChange}
								/>
								<label>REPLACE MUSIC (OPTIONAL)</label>
								<input
									type="file"
									name="selectedMusic"
									className="upload"
									onChange={handleChange}
								/>
								<input
									type="button"
									name="submitForm"
									value="UPDATE SONG"
									className="publish"
									onClick={onFileUpload}
								/>
							</form>
						</div>
					</div>
				</div>
			</div> */}
    </div>
  )
}
export default EditSong
