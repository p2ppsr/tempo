import { invoice, derivePaymentInfo } from 'nanostore-publisher'
import { getURLForFile } from 'uhrp-url'
import { encrypt } from 'cwi-crypto'
import constants from './constants'

function copy(src: ArrayBuffer | ArrayBufferView): ArrayBuffer {
  const srcBuffer = src instanceof ArrayBuffer ? src : src.buffer
  const dst = new ArrayBuffer(srcBuffer.byteLength)
  new Uint8Array(dst).set(new Uint8Array(srcBuffer))
  return dst
}

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
  let filesToUpload: File[] = []
  let artworkURL = ''
  let songURL = ''
  let songDuration = 0
  let encryptionKey

  if (selectedArtwork) {
    // Flatten FileList to File[]
    const artworkFiles =
      selectedArtwork instanceof FileList ? Array.from(selectedArtwork) : [selectedArtwork]

    const artworkBlob = new Blob([artworkFiles[0]])
    const artworkData = new Uint8Array(await artworkBlob.arrayBuffer())
    artworkURL = getURLForFile(artworkData)
    filesToUpload.push(...artworkFiles)
  }

  if (selectedMusic) {
    const musicFiles = selectedMusic instanceof FileList ? selectedMusic : [selectedMusic]
    const songData = await musicFiles[0].arrayBuffer()
    const { duration } = await new window.AudioContext().decodeAudioData(copy(songData))
    songDuration = Math.ceil(duration)
    encryptionKey = await window.crypto.subtle.generateKey(
      {
        name: 'AES-GCM',
        length: 256
      },
      true,
      ['encrypt', 'decrypt']
    )

    const encryptedData = await encrypt(new Uint8Array(songData), encryptionKey, 'Uint8Array')
    const blob = new Blob([Buffer.from(encryptedData)], {
      type: 'application/octet-stream'
    })
    const encryptedFile = new File([blob], 'encryptedSong', {
      type: 'application/octet-stream'
    })

    songURL = getURLForFile(encryptedData)
    filesToUpload.push(encryptedFile)
  }

  const invoices = []
  const outputs = []
  for (const fileOrFileList of filesToUpload) {
    let files: File[] = []

    if (fileOrFileList instanceof FileList) {
      for (let i = 0; i < fileOrFileList.length; i++) {
        const fileItem = fileOrFileList.item(i)
        if (fileItem !== null) {
          files.push(fileItem)
        }
      }
    } else if (fileOrFileList instanceof File) {
      // Also check if it's a File instance
      files.push(fileOrFileList)
    }

    for (const file of files) {
      const fileSize = file.size
      const inv = await invoice({
        fileSize: fileSize,
        retentionPeriod,
        config: { nanostoreURL: constants.nanostoreURL }
      })

      const paymentInfo = await derivePaymentInfo({
        recipientPublicKey: inv.identityKey,
        amount: inv.amount
      })

      inv.derivationPrefix = paymentInfo.derivationPrefix
      inv.derivationSuffix = paymentInfo.derivationSuffix
      inv.derivedPublicKey = paymentInfo.derivedPublicKey

      outputs.push(paymentInfo.output)
      invoices.push(inv)
    }
  }

  return {
    invoices,
    outputs,
    songURL,
    artworkURL,
    filesToUpload,
    encryptionKey,
    songDuration
  }
}

export default getFileUploadInfo
