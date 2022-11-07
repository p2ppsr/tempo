import constants from './constants'
import pushdrop from 'pushdrop'
import { createAction } from '@babbage/sdk'
import getFileUploadInfo from '../utils/getFileUploadInfo'
import submitPaymentProof from './submitPaymentProof'
import publishKey from './publishKey'

export default async ({ song, filesToUpdate }) => {
  const unlockingScript = await pushdrop.redeem({
    // To unlock the token, we need to use the same tempo protocol
    // and key ID as when we created the tsp token before. Otherwise, the
    // key won't fit the lock and the Bitcoins won't come out.
    protocolID: 'tempo',
    keyID: '1',
    // We're telling PushDrop which previous transaction and output we want to unlock, so that the correct unlocking puzzle can be prepared.
    prevTxId: song.token.txid,
    outputIndex: song.token.outputIndex,
    // We also give PushDrop a copy of the locking puzzle ("script") that
    // we want to open, which is helpful in preparing to unlock it.
    lockingScript: song.token.lockingScript,
    // Finally, the amount of Bitcoins we are expecting to unlock when the
    // puzzle gets solved.
    outputAmount: song.sats
  })

  // If we need to...
  const fileUploadInfo = await getFileUploadInfo({ selectedArtwork: filesToUpdate.selectedArtwork, selectedMusic: filesToUpdate.selectedMusic })

  if (fileUploadInfo.songURL) {
    song.songFileURL = fileUploadInfo.songURL
  }
  if (fileUploadInfo.artworkFileURL) {
    song.artworkFileURL = fileUploadInfo.artworkFileURL
  }

  // Create an updated locking script with the updated data
  const updatedBitcoinOutputScript = await pushdrop.create({
    fields: [
      Buffer.from(constants.tempoBridge, 'utf8'), // Protocol Namespace Address
      Buffer.from(song.title, 'utf8'),
      Buffer.from(song.artist, 'utf8'),
      // Buffer.from(song.artistIdentityKey, 'utf8'),
      Buffer.from(song.description, 'utf8'), // TODO: Add to UI
      Buffer.from('' + song.duration, 'utf8'), // Duration
      Buffer.from(song.songFileURL, 'utf8'),
      Buffer.from(song.artworkFileURL, 'utf8'),
      Buffer.from(song.songID)
    ],
    protocolID: 'tempo',
    keyID: '1'
  })

  const payment = await createAction({
    description: `Song ${song.title} updated!`,
    inputs: {
      [song.token.txid]: {
        ...song.token,
        outputsToRedeem: [{
          index: song.token.outputIndex,
          unlockingScript
        }]
      }
    },
    outputs: [
      {
        script: updatedBitcoinOutputScript,
        satoshis: Number(song.sats)
      }, ...fileUploadInfo.outputs],
    bridges: [constants.tempoBridge]
  })

  // Pay and upload the files to nanostore
  await submitPaymentProof({ fileUploadInfo, payment })

  if (fileUploadInfo.encryptionKey) {
    // Export encryption key to store on the keyServer
    await publishKey({ key: fileUploadInfo.encryptionKey, songURL: fileUploadInfo.songURL })
  }
}
