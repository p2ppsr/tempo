import React from "react"
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import constants from '../../utils/constants'
import publishSong from '../../utils/publishSong'

import './PublishSong.scss'

const PublishSong = () => {
	const navigate = useNavigate()

	interface FormValues {
		title: string
		artist: string
		selectedMusic: File
		selectedArtwork: File
	}

	const form = useForm<FormValues>({
		defaultValues: {
			title: '',
			artist: '',
			selectedMusic: undefined,
			selectedArtwork: undefined
		}
	})

	const {
		register,
		handleSubmit,
		formState: { errors },
		watch,
		setValue
	} = form

	const values = watch()

	// function handleMusicChange(e: React.ChangeEvent<HTMLInputElement>) {
	// 	const file = e.target.files?.[0]
	// 	if (file) {
	// 		setValue('selectedMusic', file)
	// 	}
	// }

	const onSubmit = async () => {

		// TODO: set these params from uploaded file

		const newValues = {
			isPublished: false,
			artworkFileURL: '',
			songFileURL: '',
			description: '',
			duration: 0,
			songID: '',
			token: { outputIndex: 0, txid: '', lockingScript: '' },
			outputScript: {
				fields: [''],
				protocolID: '',
				keyID: ''
			},
			...values
		}

		try {
			// Publish Song
			let publishStatus = false
			const pubSong = async () => {
				try {
					// Publish status returns true if success, or false
					publishStatus = await publishSong(newValues, constants.RETENTION_PERIOD)
					if (publishStatus) {
						console.log('success')
						navigate('/PublishSong/Success')
					}
				} catch (e) {
					console.error(e)
					throw e
				}
			}
			toast.promise(pubSong(), {
				pending: 'Publishing song...',
				success: 'Song published! 👌',
				error: 'Failed to publish song! 🤯'
			})
		} catch (error) {
			console.log(error)
		}
	}

	return (
		<div className="publishContainer container">
			<div className="header">
				<h1>Publish A Song</h1>
				<p className="whiteText">
					Become your own publisher and upload your music for the world to hear!
				</p>
			</div>

			<form className="formContainer" onSubmit={handleSubmit(onSubmit)}>
				<div className="fieldContainer">
					<label>Title</label>
					<input type="text" className="textInput" {...register('title')} required />
				</div>

				<div className="fieldContainer">
					<label>Artist</label>
					<input type="text" className="textInput" {...register('artist')} required />
				</div>

				<div className="fieldContainer">
					<label>Music</label>
					<input
						type="file"
						className="uploadInput"
						{...register('selectedMusic')}
						required
					/>
				</div>

				<div className="fieldContainer">
					<label>Artwork</label>
					<input
						type="file"
						className="uploadInput"
						{...register('selectedArtwork')}
						required
					/>
				</div>

				<button
					name="submitForm"
					className="button"
					type="submit"
					style={{ marginTop: '1rem' }}
				>
					Publish Song
				</button>
			</form>
		</div>
	)
}
export default PublishSong
