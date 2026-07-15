/**
 * @file PublishSong.tsx
 * @description
 * React component for publishing a new song on Tempo.
 * Collects title, artist, music, and artwork inputs, verifies ownership,
 * and publishes the song to the blockchain and overlay network.
 */

import { useState } from 'react'
import { CircularProgress } from '@mui/material'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import publishSong, { type PublishProgressStage } from '../../utils/publishSong'
import './PublishSong.scss'
import type { PublicationReceipt, Song } from '../../types/interfaces'

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
  const [isPublishing, setIsPublishing] = useState(false)
  const [publishStage, setPublishStage] = useState<PublishProgressStage | 'idle'>('idle')
  const [publishStatus, setPublishStatus] = useState('')
  const [publicationError, setPublicationError] = useState('')
  const [failedReceipt, setFailedReceipt] = useState<PublicationReceipt | null>(null)

  const publishSteps: Array<{ id: PublishProgressStage; label: string }> = [
    { id: 'uploading_files', label: 'Uploading files' },
    { id: 'creating_token', label: 'Creating token' },
    { id: 'publishing_key', label: 'Publishing key' },
    { id: 'broadcasting', label: 'Broadcasting' },
    { id: 'verifying', label: 'Verifying playback' },
    { id: 'completed', label: 'Complete' }
  ]

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
    if (isPublishing) return

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

    setIsPublishing(true)
    setPublishStage('uploading_files')
    setPublishStatus('Uploading audio, artwork, and preview files...')
    setPublicationError('')
    setFailedReceipt(null)

    try {
      const publishedSong = await publishSong(
        songValues,
        RETENTION_PERIOD,
        (stage, message) => {
          setPublishStage(stage)
          setPublishStatus(message)
        }
      )
      toast.success('Song published and verified playable.')
      if (publishedSong) navigate('/PublishSong/Success')
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Tempo could not complete this publication.'
      setPublicationError(message)
      try {
        const value = localStorage.getItem('tempo:last-publication')
        setFailedReceipt(value ? JSON.parse(value) as PublicationReceipt : null)
      } catch {
        setFailedReceipt(null)
      }
      toast.error(message)
    } finally {
      setIsPublishing(false)
    }
  }

  const activeStepIndex = publishSteps.findIndex((step) => step.id === publishStage)

  return (
    <div className="publishSongContainer container">
      <div className="publishHeader">
        <h1>Publish</h1>
        <p>Upload your track, attach artwork, and mint your song token in one flow.</p>
        <span className="publishHeaderHint">Tempo stores two verified copies for seven years, encrypts the master, and only finishes after the overlay, key server, and playback checks pass.</span>
      </div>

      <div id="piracyBannerContainer">
        <h2>Tempo actively fights music piracy.</h2>
        <p>
          Uploading copyrighted content by others is forbidden. Infringement will be reported to the
          rightful owners and you will be permanently removed from the platform.
        </p>
      </div>

      <form className="formContainer" onSubmit={handleSubmit(onSubmit)}>
        <fieldset className="publishFieldset" disabled={isPublishing}>
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
            <input type="file" accept="audio/mpeg,audio/wav,audio/x-wav" className="uploadInput" {...register('selectedMusic')} required />
            <small className="fieldHint">Use a high-quality master file (MP3/WAV).</small>
          </div>

          <div className="fieldContainer">
            <label>Artwork</label>
            <input type="file" accept="image/jpeg,image/png,image/webp" className="uploadInput" {...register('selectedArtwork')} required />
            <small className="fieldHint">Square cover art works best. Tempo automatically converts it to a fast, catalogue-sized WebP.</small>
          </div>

          <div className="fieldContainer">
            <label>15-Second Preview (optional)</label>
            <input type="file" accept="audio/mpeg,audio/wav,audio/x-wav" className="uploadInput" {...register('selectedPreview')} />
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
            disabled={isPublishing}
          >
            {isPublishing ? 'Publishing...' : 'Publish Song'}
          </button>
        </fieldset>
      </form>

      {publicationError && (
        <div className="publicationFailure" role="alert">
          <h2>Publication paused safely</h2>
          <p>{publicationError}</p>
          {failedReceipt && (
            <dl>
              <div><dt>Receipt</dt><dd>{failedReceipt.publicationId}</dd></div>
              <div><dt>Failed stage</dt><dd>{failedReceipt.failedAtStage || failedReceipt.stage}</dd></div>
              <div><dt>Transaction</dt><dd>{failedReceipt.txid || 'Not created'}</dd></div>
              <div><dt>Storage</dt><dd>{Object.values(failedReceipt.assets).filter(asset => asset?.available).length} assets verified</dd></div>
              <div><dt>Key server</dt><dd>{failedReceipt.keyPublished ? 'Verified' : 'Not published'}</dd></div>
              <div><dt>Overlay</dt><dd>{failedReceipt.overlayAdmitted ? 'Admitted' : 'Not admitted'}</dd></div>
            </dl>
          )}
          <p className="fieldHint">This receipt is stored in this browser as <code>tempo:last-publication</code> for support and recovery.</p>
        </div>
      )}

      {isPublishing && (
        <div className="publishLoadingOverlay" role="status" aria-live="polite">
          <div className="publishLoadingCard">
            <CircularProgress size={30} className="publishSpinner" />
            <h2>Publishing your song</h2>
            <p>{publishStatus}</p>
            <div className="publishStepList">
              {publishSteps.map((step, index) => {
                const isActive = index === activeStepIndex
                const isDone = activeStepIndex > index
                return (
                  <div
                    key={step.id}
                    className={`publishStep ${isActive ? 'active' : ''} ${isDone ? 'done' : ''}`}
                  >
                    {step.label}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default PublishSong
