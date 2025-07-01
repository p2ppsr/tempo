import { SymmetricKey, StorageUploader, WalletClient } from '@bsv/sdk'

const RETENTION_PERIOD = 5

const storageURL = 'https://nanostore.babbage.systems'

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

  const storageUploader = new StorageUploader({storageURL, wallet})

  const filesToUpload: File[] = []
  let songURL = ''
  let artworkURL = ''
  let songDuration = 0
  let encryptionKey: SymmetricKey | undefined

  // Upload artwork (unencrypted)
  if (selectedArtwork) {
    try {
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
    } catch (err) {
      console.error('[Upload Artwork Error]', err)
      throw new Error('Failed to upload artwork.')
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
    filesToUpload,
    encryptionKey,
    songDuration
  }
}

export default getFileUploadInfo
