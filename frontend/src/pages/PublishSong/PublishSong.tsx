import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import publishSong from '../../utils/publishSong'

import './PublishSong.scss'
import type { Song } from '../../types/interfaces'

const RETENTION_PERIOD = 60 * 24 * 365 * 7 // Seven years in minutes

const PublishSong = () => {
  const navigate = useNavigate()

  interface FormValues {
    title: string
    artist: string
    selectedMusic: File
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
      selectedArtwork: undefined,
      verifiedCheckbox: false
    }
  })

  const values = watch()

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
    selectedMusic: formData.selectedMusic
  }

  toast.promise(
    publishSong(songValues, RETENTION_PERIOD).then((publishedSong) => {
      // This now uses the returned song, which includes `sats` and token metadata
      if (publishedSong) {
        // OPTIONAL: store publishedSong in state if you need it elsewhere
        navigate('/PublishSong/Success')
      }
    }),
    {
      pending: 'Publishing song...',
      success: 'Song published! 👌',
      error: 'Failed to publish song! 🤯'
    }
  )
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
