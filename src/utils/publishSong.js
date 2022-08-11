import { createAction } from '@babbage/sdk'
import pushdrop from 'pushdrop'
import { invoice, upload } from 'nanostore-publisher'
import { getURLForFile } from 'uhrp-url'
import { encrypt } from '@cwi/crypto'
import { Authrite } from 'authrite-js'

export default async (song, retentionPeriod, nanostoreURL, keyServerURL, bridgeAddress, toast) => {
  // Notes:
  // 1. An artist wants to publish their song.
  // * They need to upload the following data:
  // - The encrypted song bytes
  // - The song artwork. Later this will be the album artwork.
  // In the future, we could generate a UHRP hash to see if the data has already been uploaded.

  // Create invoices hosting the song and artwork files on NanoStore
  const filesToUpload = [song.selectedMusic, song.selectedArtwork]
  const invoices = []
  for (const file of filesToUpload) {
    const inv = await invoice({
      fileSize: file.size,
      retentionPeriod: retentionPeriod,
      serverURL: nanostoreURL
    })
    invoices.push(inv)
  }

  // Get the file contents as arrayBuffers
  const songData = await song.selectedMusic.arrayBuffer()
  const artworkData = new Uint8Array(await song.selectedArtwork.arrayBuffer())

  // Generate an encryption key for the song data
  const encryptionKey = await window.crypto.subtle.generateKey(
    {
      name: 'AES-GCM',
      length: 256
    },
    true, // whether the key is extractable (i.e. can be used in exportKey)
    ['encrypt', 'decrypt'] // can "encrypt", "decrypt", "wrapKey", or "unwrapKey")
  )
  // Encrypt the file data
  const encryptedData = await encrypt(new Uint8Array(songData), encryptionKey, 'Uint8Array')
  // Calc the UHRP address
  const songURL = getURLForFile(encryptedData)
  const artworkFileURL = getURLForFile(artworkData)

  // TODO: Remove Test key
  const TEST_PRIV_KEY = 'L55qjRezJoSHZEbG631BEf7GZqgw3yweM5bThiw9NEPQxGs5SQzw'
  // TODO: Use Babbage as a signing strategy for pushdrop once supported.
  const actionScript = pushdrop.create({
    fields: [
      Buffer.from('1LQtKKK7c1TN3UcRfsp8SqGjWtzGskze36', 'utf8'), // Protocol Namespace Address
      Buffer.from(song.title, 'utf8'),
      Buffer.from(song.artist, 'utf8'),
      Buffer.from('Default description', 'utf8'), // TODO: Add to UI
      Buffer.from('3:30', 'utf8'), // TODO: look at metadata for duration?
      Buffer.from(songURL, 'utf8'),
      Buffer.from(artworkFileURL, 'utf8')
    ],
    key: TEST_PRIV_KEY // TODO: replace test key
  })
  // Create an action for all outputs
  const actionData = {
    outputs: [{
      satoshis: 1,
      script: actionScript
    }],
    description: 'Publish a song',
    bridges: [bridgeAddress] // tsp-bridge
  }
  invoices.forEach(inv => {
    actionData.outputs = [
      ...actionData.outputs,
      ...inv.outputs.map(x => ({
        satoshis: x.amount,
        script: x.outputScript
      }))
    ]
  })
  const tx = await createAction(actionData)
  // Validate transaction success
  if (tx.status === 'error') {
    toast.error(tx.message) // Can't show toast notifications from here. TODO: return message to display
    return
  }
  // Create a file to upload from the encrypted data
  const blob = new Blob([Buffer.from(encryptedData)], { type: 'application/octet-stream' })
  const encryptedFile = new File([blob], 'encryptedSong', { type: 'application/octet-stream' })
  // Swap the unencrypted song file for the encrypted one
  filesToUpload[0] = encryptedFile

  // Upload the files to nanostore
  for (let i = 0; i < filesToUpload.length; i++) {
    const response = await upload({
      referenceNumber: invoices[i].referenceNumber,
      transactionHex: tx.rawTx,
      file: filesToUpload[i],
      inputs: tx.inputs,
      mapiResponses: tx.mapiResponses,
      serverURL: nanostoreURL
      // onUploadProgress: prog => {
      //   setUploadProgress(
      //     parseInt((prog.loaded / prog.total) * 100)
      //   )
      // }
    })
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
