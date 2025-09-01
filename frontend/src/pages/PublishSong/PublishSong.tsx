/**
 * @file PublishSong.tsx
 * @description
 * React component for publishing a new song on Tempo.
 * Collects title, artist, music, and artwork inputs, verifies ownership,
 * and publishes the song to the blockchain and overlay network.
 */

import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import publishSong from '../../utils/publishSong'
import './PublishSong.scss'
import type { Song } from '../../types/interfaces'

/**
 * Retention period constant
 * Represents the duration the uploaded song file will be retained (7 years, in minutes).
 */
const RETENTION_PERIOD = 60 * 24 * 365 * 7 // Seven years in minutes

/**
 * PublishSong Component
 *
 * - Renders a form allowing users to upload a new song with title, artist, music, and artwork.
 * - Includes a piracy warning and certification checkbox to ensure rightful ownership.
 * - Submits data to the publishing endpoint and redirects on success.
 */
const PublishSong = () => {
  const navigate = useNavigate()

  /**
   * FormValues interface
   * Defines the structure of the form data used in the PublishSong component.
   */
  interface FormValues {
    title: string
    artist: string
    selectedMusic: File
    selectedPreview?: File
    selectedArtwork: File
    verifiedCheckbox: boolean
  }

  const {
    register,
    handleSubmit,
    watch
  } = useForm<FormValues>({
    defaultValues: {
      title: '',
      artist: '',
      selectedMusic: undefined,
      selectedPreview: undefined,
      selectedArtwork: undefined,
      verifiedCheckbox: false
    }
  })

  const values = watch()

  /**
   * onSubmit
   * Handles form submission, creates a Song object, and calls publishSong.
   * Displays toast notifications on publishing progress or errors.
   */
  const onSubmit = async (formData: FormValues) => {
  const songValues: Song = {
    title: formData.title,
    artist: formData.artist,
    isPublished: true,
    songURL: '',
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
    },
    selectedArtwork: formData.selectedArtwork,
    selectedMusic: formData.selectedMusic,
    selectedPreview: formData.selectedPreview || undefined
  }

  try {
    await toast.promise(
      publishSong(songValues, RETENTION_PERIOD).then((publishedSong) => {
        if (publishedSong) navigate('/PublishSong/Success')
      }),
      {
        pending: 'Publishing song...',
        success: 'Song published! 👌',
        error: 'Failed to publish song! 🤯'
      }
    )
  } catch (e) {
    console.error('Unexpected error during publish:', e)
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

        <div className="fieldContainer">
          <label>15-Second Preview (optional)</label>
          <input type="file" className="uploadInput" {...register('selectedPreview')} />
        </div>

        {values.selectedMusic && (
          <div className="flex" id="piracyCheckboxContainer">
            <input
              type="checkbox"
              id="piracyCheckbox"
              {...register('verifiedCheckbox')}
              required
            />
            <label htmlFor="piracyCheckbox">
              I certify that I am the rightful owner of this content.
            </label>
          </div>
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
