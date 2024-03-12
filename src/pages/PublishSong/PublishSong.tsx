import React from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import constants from '../../utils/constants'
import publishSong from '../../utils/publishSong'

import './PublishSong.scss'
import { Song } from '../../types/interfaces'

const PublishSong = () => {
  const navigate = useNavigate()

  interface FormValues {
    title: string
    artist: string
    selectedMusic: File
    selectedArtwork: File
    verifiedCheckbox: boolean
  }

  const form = useForm<FormValues>({
    defaultValues: {
      title: '',
      artist: '',
      selectedMusic: undefined,
      selectedArtwork: undefined,
      verifiedCheckbox: false
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

  const onSubmit = async () => {
    // TODO: set these params from uploaded file

    const newValues: Song = {
      title: values.title,
      artist: values.artist,
      isPublished: false,
      audioURL: '',
      artworkURL: '',
      description: '',
      duration: 0,
      token: {
        inputs: {},
        mapiResponses: {},
        outputScript: '',
        proof: {},
        rawTX: '',
        satoshis: 0,
        txid: '',
        vout: 0
      }
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
    <div className="publishSongContainer container">
      <h1>Publish</h1>

      <div id="piracyBannerContainer">
        <h2 style={{ marginBottom: '.5rem' }}>Tempo actively fights music piracy.</h2>
        <p>
          Uploading copyrighted content by others is forbidden. Infringement will be reported to the
          rightful owners and you will be permanently removed from the platform.
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
          <input type="file" className="uploadInput" {...register('selectedMusic')} required />
        </div>

        <div className="fieldContainer">
          <label>Artwork</label>
          <input type="file" className="uploadInput" {...register('selectedArtwork')} required />
        </div>

        {values.selectedMusic && (
          <>
            <div className="flex" id="piracyCheckboxContainer">
              <input
                type="checkbox"
                id="piracyCheckbox"
                {...register('verifiedCheckbox')}
                required
              />
              <label>I certify that I am the rightful owner of this content.</label>
            </div>
          </>
        )}

        <button
          name="submitForm"
          className="button publishButton"
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
