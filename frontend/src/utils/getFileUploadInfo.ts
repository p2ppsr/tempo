import { SymmetricKey, StorageDownloader, StorageUploader } from '@bsv/sdk'
import constants from './constants'
import { getInteractiveWallet } from './wallet'
import type { PublicationAssetReceipt } from '../types/interfaces'

interface GetFileUploadInfoParams {
  selectedArtwork: File | FileList | null
  selectedMusic: File | FileList | null
  selectedPreview?: File | FileList | null
  retentionPeriod?: number
  onProgress?: (message: string) => void
  onAssetReceipt?: (asset: 'audio' | 'artwork' | 'preview', receipt: PublicationAssetReceipt) => void
}

const storageDownloader = new StorageDownloader({ networkPreset: constants.overlayNetworkPreset })

const sleep = async (milliseconds: number) => await new Promise(resolve => window.setTimeout(resolve, milliseconds))

async function withDeadline<T>(promise: Promise<T>, label: string, milliseconds: number): Promise<T> {
  let timeout: number | undefined
  try {
    return await Promise.race([
      promise,
      new Promise<T>((_resolve, reject) => {
        timeout = window.setTimeout(() => reject(new Error(`${label} timed out after ${Math.ceil(milliseconds / 1000)} seconds.`)), milliseconds)
      })
    ])
  } finally {
    if (timeout !== undefined) window.clearTimeout(timeout)
  }
}

const getFileUploadInfo = async ({
  selectedArtwork = null,
  selectedMusic = null,
  selectedPreview = null,
  retentionPeriod = constants.RETENTION_PERIOD,
  onProgress,
  onAssetReceipt
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

  const receiptFor = async (
    asset: 'audio' | 'artwork' | 'preview',
    uhrpURL: string,
    hostedBy: string[]
  ): Promise<PublicationAssetReceipt> => {
    const requiredHosts = 2
    let activeHosts: string[] = []

    // Provider /find calls are authenticated, billable, and historically
    // capable of hanging after payment. The UHRP overlay is the authoritative
    // public catalogue: resolve() omits expired records and needs no extra
    // wallet request. Poll it until every required replica is admitted.
    for (let attempt = 0; attempt < 6; attempt += 1) {
      onProgress?.(`Verifying ${asset} storage replicas (${attempt + 1}/6)...`)
      try {
        const resolved = await withDeadline(storageDownloader.resolve(uhrpURL), `${asset} storage verification`, 10000)
        activeHosts = [...new Set(resolved.map(url => {
          try {
            return new URL(url).origin
          } catch {
            return url
          }
        }))]
        if (activeHosts.length >= requiredHosts) break
      } catch {
        activeHosts = []
      }
      if (attempt < 5) await sleep(1500 * (attempt + 1))
    }

    return {
      uhrpURL,
      hostedBy: activeHosts,
      available: hostedBy.length >= requiredHosts && activeHosts.length >= requiredHosts
    }
  }

  // Upload artwork (unencrypted)
  if (selectedArtwork) {
    try {
      onProgress?.('Uploading artwork to two storage providers...')
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
      assets.artwork = await receiptFor('artwork', uploadedArtwork.uhrpURL, uploadedArtwork.hostedBy)
      onAssetReceipt?.('artwork', assets.artwork)
      filesToUpload.push(artworkFile)
    } catch (err) {
      console.error('[Upload Artwork Error]', err)
      const detail = err instanceof Error ? err.message : String(err)
      throw new Error(`Failed to upload artwork: ${detail}`)
    }
  }

  // Upload preview (unencrypted)
  if (selectedPreview) {
    const previewFile =
      selectedPreview instanceof FileList ? selectedPreview[0] : selectedPreview

    // Only proceed if we actually have a file
    if (previewFile && previewFile.size > 0) {
      try {
        onProgress?.('Uploading the preview to two storage providers...')
        const previewBuffer = new Uint8Array(await previewFile.arrayBuffer())

        const uploadedPreview = await storageUploader.publishFile({
          file: {
            data: Array.from(previewBuffer),
            type: previewFile.type
          },
          retentionPeriod
        })

        previewURL = uploadedPreview.uhrpURL
        assets.preview = await receiptFor('preview', uploadedPreview.uhrpURL, uploadedPreview.hostedBy)
        onAssetReceipt?.('preview', assets.preview)
        filesToUpload.push(previewFile)
      } catch (err) {
        console.error('[Upload Preview Error]', err)
        const detail = err instanceof Error ? err.message : String(err)
        throw new Error(`Failed to upload preview: ${detail}`)
      }
    }
  }

  // Encrypt and upload music
  if (selectedMusic) {
    try {
      onProgress?.('Encrypting and uploading the master audio to two storage providers...')
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
      assets.audio = await receiptFor('audio', uploadedMusic.uhrpURL, uploadedMusic.hostedBy)
      onAssetReceipt?.('audio', assets.audio)

      const blob = new Blob([Uint8Array.from(encrypted as number[])], {
        type: 'application/octet-stream'
      })
      const encryptedFile = new File([blob], 'encryptedSong', {
        type: 'application/octet-stream'
      })

      filesToUpload.push(encryptedFile)
    } catch (err) {
      console.error('[Upload Music Error]', err)
      const detail = err instanceof Error ? err.message : String(err)
      throw new Error(`Failed to upload and encrypt music: ${detail}`)
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
