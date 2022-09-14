import { createAction } from '@babbage/sdk'
import pushdrop from 'pushdrop'
import { invoice, upload, derivePaymentInfo, submitPayment } from 'nanostore-publisher'
import { getURLForFile } from 'uhrp-url'
import { encrypt } from 'cwi-crypto'
import { Authrite } from 'authrite-js'

// Thanks to https://stackoverflow.com/a/22114687 for this
function copy(src)  {
    var dst = new ArrayBuffer(src.byteLength);
    new Uint8Array(dst).set(new Uint8Array(src));
    return dst;
}

// Notes:
// 1. An artist wants to publish their song.
// * They need to upload the following data:
// - The encrypted song bytes
// - The song artwork. Later this will be the album artwork.
// In the future, we could generate a UHRP hash to see if the data has already been uploaded.

export default async (
  song, retentionPeriod, nanostoreURL, keyServerURL, bridgeAddress, toast
) => {
  // Get the file contents as arrayBuffers
  const songData = await song.selectedMusic.arrayBuffer()
  const artworkData = new Uint8Array(await song.selectedArtwork.arrayBuffer())

  // Calculate audio duration
  let { duration } = await new window.AudioContext()
    .decodeAudioData(copy(songData))
  duration = Math.ceil(duration)

  // Generate an encryption key for the song data
  const encryptionKey = await window.crypto.subtle.generateKey(
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
  const songURL = getURLForFile(encryptedData)
  const artworkFileURL = getURLForFile(artworkData)

  // Create invoices hosting the song and artwork files on NanoStore
  const filesToUpload = [encryptedFile, song.selectedArtwork]
  const invoices = []
  const outputs = []
  for (const file of filesToUpload) {
    const inv = await invoice({
      fileSize: file.size,
      retentionPeriod: retentionPeriod,
      config: {
        nanostoreURL
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

  // Create an action script based on the tsp-protocol
  const actionScript = await pushdrop.create({
    fields: [
      Buffer.from('1LQtKKK7c1TN3UcRfsp8SqGjWtzGskze36', 'utf8'), // Protocol Namespace Address
      Buffer.from(song.title, 'utf8'),
      Buffer.from(song.artist, 'utf8'),
      Buffer.from('Default description', 'utf8'), // TODO: Add to UI
      Buffer.from('' + duration, 'utf8'), // Duration
      Buffer.from(songURL, 'utf8'),
      Buffer.from(artworkFileURL, 'utf8')
    ],
    protocolID: 'tempo',
    keyID: '1'
  })
  // Create an action for all outputs
  const actionData = {
    outputs: [{
      satoshis: 1,
      script: actionScript
    }, ...outputs],
    description: 'Publish a song',
    bridges: [bridgeAddress] // tsp-bridge
  }
  const tx = await createAction(actionData)

  // Pay and upload the files to nanostore
  for (let i = 0; i < filesToUpload.length; i++) {
    // Submit the payment to nanostore
    const paymentResult = await submitPayment({
      config: {
        nanostoreURL
      },
      orderID: invoices[i].ORDER_ID,
      amount: invoices[i].amount,
      payment: tx,
      derivationPrefix: invoices[i].derivationPrefix,
      derivationSuffix: invoices[i].derivationSuffix,
      vout: i + 1
    })
    // Upload the file to nanostore
    const uploadObject = {
      config: {
        nanostoreURL
      },
      uploadURL: paymentResult.uploadURL, // wrong
      publicURL: invoices[i].publicURL,
      file: filesToUpload[i],
      serverURL: nanostoreURL // ?
      // onUploadProgress: prog => {
      //   setUploadProgress(
      //     parseInt((prog.loaded / prog.total) * 100)
      //   )
      // }
    }
    debugger
    const response = await upload(uploadObject)
    console.log(response.publicURL)
  }

  // Export encryption key to store on the keyServer
  const decryptionKey = await window.crypto.subtle.exportKey('raw', encryptionKey)
  const response = await new Authrite().request(`${keyServerURL}/publish`, {
    body: {
      songURL,
      key: Buffer.from(decryptionKey).toString('base64')
    },
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    }
  })
  if (response.status !== 200) {
    toast.error('Failed to publish song! Please upload a valid media type of mp3, m4a, or wav')
    return false
  }
  toast.success('Song successfully published!')
  return true
}
