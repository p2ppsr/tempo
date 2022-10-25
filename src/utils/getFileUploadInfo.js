import { createAction } from '@babbage/sdk'
import pushdrop from 'pushdrop'
import { invoice, upload, derivePaymentInfo, submitPayment } from 'nanostore-publisher'
import { getURLForFile } from 'uhrp-url'
import { encrypt } from 'cwi-crypto'
import { Authrite } from 'authrite-js'
import constants from './constants'
import { toast } from 'react-toastify'

// Thanks to https://stackoverflow.com/a/22114687 for this
function copy (src) {
  const dst = new ArrayBuffer(src.byteLength)
  new Uint8Array(dst).set(new Uint8Array(src))
  return dst
}

const RETENTION_PERIOD = 60 * 24 * 365 * 7
// Notes:
// 1. An artist wants to publish their song.
// * They need to upload the following data:
// - The encrypted song bytes
// - The song artwork. Later this will be the album artwork.
// In the future, we could generate a UHRP hash to see if the data has already been uploaded.

export default async ({
  selectedArtwork, selectedMusic, retentionPeriod = RETENTION_PERIOD
} = {}) => {
  // Defauflt values
  const filesToUpload = []
  let artworkFileURL = null
  let songURL = null
  let songDuration = null
  let encryptionKey = null

  // Check if we have artwork to upload
  if (selectedArtwork) {
    const artworkData = new Uint8Array(await selectedArtwork.arrayBuffer())
    artworkFileURL = getURLForFile(artworkData)
    filesToUpload.push(selectedArtwork)
  }

  // Check if we have music to upload
  if (selectedMusic) {
    // Get the file contents as arrayBuffers
    const songData = await selectedMusic.arrayBuffer()

    // Calculate audio duration
    const { duration } = await new window.AudioContext()
      .decodeAudioData(copy(songData))
    songDuration = Math.ceil(duration)

    // Generate an encryption key for the song data
    encryptionKey = await window.crypto.subtle.generateKey(
      {
        name: 'AES-GCM',
        length: 256
      },
      true,
      ['encrypt', 'decrypt']
    )

    // Encrypt the song data
    const encryptedData = await encrypt(
      new Uint8Array(songData),
      encryptionKey,
      'Uint8Array'
    )

    // Convert the encrypted file for upload with NanoStore
    const blob = new Blob(
      [Buffer.from(encryptedData)],
      { type: 'application/octet-stream' }
    )
    const encryptedFile = new File(
      [blob],
      'encryptedSong',
      { type: 'application/octet-stream' }
    )

    // Calculate the UHRP addresses, for later use in the TSP script
    songURL = getURLForFile(encryptedData)
    filesToUpload.push(encryptedFile)
  }

  // Create invoices for hosting any attached song or artwork files on NanoStore
  const invoices = []
  const outputs = []
  for (const file of filesToUpload) {
    const inv = await invoice({
      fileSize: file.size,
      retentionPeriod,
      config: {
        nanostoreURL: constants.nanostoreURL
      }
    })

    // Derive the payment info for the given invoice
    const paymentInfo = await derivePaymentInfo({
      recipientPublicKey: inv.identityKey,
      amount: inv.amount
    })
    // Save the payment info with the invoice for the later submitPayment call
    inv.derivationPrefix = paymentInfo.derivationPrefix
    inv.derivationSuffix = paymentInfo.derivationSuffix
    inv.derivedPublicKey = paymentInfo.derivedPublicKey

    // Add the new invoice and the new transaction output
    invoices.push(inv)
    outputs.push(paymentInfo.output)
  }

  return {
    invoices,
    outputs,
    songURL,
    artworkFileURL,
    filesToUpload,
    encryptionKey,
    songDuration
  }
}
