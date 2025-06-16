import { SymmetricKey, StorageUploader, WalletClient } from '@bsv/sdk'
import constants from './constants'

const RETENTION_PERIOD = 60 * 24 * 365 * 7 // 7 years in minutes

interface GetFileUploadInfoParams {
  selectedArtwork: File | FileList | null
  selectedMusic: File | FileList | null
  retentionPeriod?: number
}

const getFileUploadInfo = async ({
  selectedArtwork = null,
  selectedMusic = null,
  retentionPeriod = RETENTION_PERIOD
}: Partial<GetFileUploadInfoParams> = {}) => {
  const wallet = new WalletClient('auto', 'localhost')
  const storageUploader = new StorageUploader({
    storageURL: constants.keyServerURL, // Replace with dedicated storageURL constant if needed
    wallet
  })

  const filesToUpload: File[] = []
  let songURL = ''
  let artworkURL = ''
  let songDuration = 0
  let encryptionKey: SymmetricKey | undefined

  // Upload artwork (unencrypted)
  if (selectedArtwork) {
    const artworkFile =
      selectedArtwork instanceof FileList ? selectedArtwork[0] : selectedArtwork
    const artworkBuffer = new Uint8Array(await artworkFile.arrayBuffer())

    const uploadedArtwork = await storageUploader.publishFile({
      file: {
        data: Array.from(artworkBuffer),
        type: artworkFile.type
      },
      retentionPeriod
    })

    artworkURL = uploadedArtwork.uhrpURL
    filesToUpload.push(artworkFile)
  }

  // Encrypt and upload music
  if (selectedMusic) {
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

    const blob = new Blob([Uint8Array.from(encrypted as number[])], {
      type: 'application/octet-stream'
    })
    const encryptedFile = new File([blob], 'encryptedSong', {
      type: 'application/octet-stream'
    })

    filesToUpload.push(encryptedFile)
  }

  return {
    songURL,
    artworkURL,
    filesToUpload,
    encryptionKey,
    songDuration
  }
}

export default getFileUploadInfo
