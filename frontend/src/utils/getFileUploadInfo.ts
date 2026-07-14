import { SymmetricKey, StorageUploader } from '@bsv/sdk'
import constants from './constants'
import { getInteractiveWallet } from './wallet'
import type { PublicationAssetReceipt } from '../types/interfaces'
import { buildAssetReceipt } from './publicationReceipt'

interface GetFileUploadInfoParams {
  selectedArtwork: File | FileList | null
  selectedMusic: File | FileList | null
  selectedPreview?: File | FileList | null
  retentionPeriod?: number
}

const getFileUploadInfo = async ({
  selectedArtwork = null,
  selectedMusic = null,
  selectedPreview = null,
  retentionPeriod = constants.RETENTION_PERIOD
}: Partial<GetFileUploadInfoParams> = {}) => {
  const wallet = getInteractiveWallet()

  const storageUploader = new StorageUploader({ wallet, resilienceLevel: 2 })

  const filesToUpload: File[] = []
  let songURL = ''
  let artworkURL = ''
  let previewURL = ''
  let songDuration = 0
  let encryptionKey: SymmetricKey | undefined
  const assets: {
    audio?: PublicationAssetReceipt
    artwork?: PublicationAssetReceipt
    preview?: PublicationAssetReceipt
  } = {}

  const receiptFor = async (uhrpURL: string, hostedBy: string[]): Promise<PublicationAssetReceipt> => {
    const checks = await Promise.all(hostedBy.map(async host => {
      try {
        const record = await storageUploader.findFile(uhrpURL, { hostedBy: [host] })
        return { host, expiryTime: record.expiryTime }
      } catch {
        return null
      }
    }))
    return buildAssetReceipt(uhrpURL, checks)
  }

  // Upload artwork (unencrypted)
  if (selectedArtwork) {
    try {
      const artworkFile =
        selectedArtwork instanceof FileList ? selectedArtwork[0] : selectedArtwork
      const artworkBuffer = new Uint8Array(await artworkFile.arrayBuffer())

      console.log('[Uploading Artwork]', {
        size: artworkBuffer.length,
        type: artworkFile.type
      })

      const uploadedArtwork = await storageUploader.publishFile({
        file: {
          data: Array.from(artworkBuffer),
          type: artworkFile.type
        },
        retentionPeriod
      })

      artworkURL = uploadedArtwork.uhrpURL
      assets.artwork = await receiptFor(uploadedArtwork.uhrpURL, uploadedArtwork.hostedBy)
      filesToUpload.push(artworkFile)
    } catch (err) {
      console.error('[Upload Artwork Error]', err)
      throw new Error('Failed to upload artwork.')
    }
  }

  // Upload preview (unencrypted)
  if (selectedPreview) {
    const previewFile =
      selectedPreview instanceof FileList ? selectedPreview[0] : selectedPreview

    // Only proceed if we actually have a file
    if (previewFile && previewFile.size > 0) {
      try {
        const previewBuffer = new Uint8Array(await previewFile.arrayBuffer())

        const uploadedPreview = await storageUploader.publishFile({
          file: {
            data: Array.from(previewBuffer),
            type: previewFile.type
          },
          retentionPeriod
        })

        previewURL = uploadedPreview.uhrpURL
        assets.preview = await receiptFor(uploadedPreview.uhrpURL, uploadedPreview.hostedBy)
        filesToUpload.push(previewFile)
      } catch (err) {
        console.error('[Upload Preview Error]', err)
        throw new Error('Failed to upload preview.')
      }
    }
  }

  // Encrypt and upload music
  if (selectedMusic) {
    try {
      const musicFile =
        selectedMusic instanceof FileList ? selectedMusic[0] : selectedMusic
      const musicBuffer = await musicFile.arrayBuffer()

      const { duration } = await new AudioContext().decodeAudioData(musicBuffer.slice(0))
      songDuration = Math.ceil(duration)

      encryptionKey = SymmetricKey.fromRandom()
      const encrypted = encryptionKey.encrypt(Array.from(new Uint8Array(musicBuffer)))

      if (typeof encrypted === 'string') {
        throw new Error('Encrypted data must be a number array, not a string')
      }

      const uploadedMusic = await storageUploader.publishFile({
        file: {
          data: encrypted as number[],
          type: 'application/octet-stream'
        },
        retentionPeriod
      })

      songURL = uploadedMusic.uhrpURL
      assets.audio = await receiptFor(uploadedMusic.uhrpURL, uploadedMusic.hostedBy)

      const blob = new Blob([Uint8Array.from(encrypted as number[])], {
        type: 'application/octet-stream'
      })
      const encryptedFile = new File([blob], 'encryptedSong', {
        type: 'application/octet-stream'
      })

      filesToUpload.push(encryptedFile)
    } catch (err) {
      console.error('[Upload Music Error]', err)
      throw new Error('Failed to upload and encrypt music.')
    }
  }

  return {
    songURL,
    artworkURL,
    previewURL,
    filesToUpload,
    encryptionKey,
    songDuration,
    assets
  }
}

export default getFileUploadInfo
