import { createAction } from '@babbage/sdk'
import pushdrop from 'pushdrop'
import constants from './constants'
import getFileUploadInfo from './getFileUploadInfo'
import submitPaymentProof from './submitPaymentProof'
import publishKey from './publishKey'
import { Authrite } from 'authrite-js'

export default async (
  song, retentionPeriod
) => {
  // Update the selected files
  const fileUploadInfo = await getFileUploadInfo({ selectedArtwork: song.selectedArtwork, selectedMusic: song.selectedMusic, retentionPeriod })
  
  // Create an action script based on the tsp-protocol
  const bitcoinOutputScript = await pushdrop.create({
    fields: [
      Buffer.from(constants.tempoTopic, 'utf8'), // Protocol Namespace Address
      Buffer.from(song.title, 'utf8'),
      Buffer.from(song.artist, 'utf8'),
      Buffer.from('Default description', 'utf8'), // TODO: Add to UI
      Buffer.from('' + fileUploadInfo.songDuration, 'utf8'), // Duration
      Buffer.from(fileUploadInfo.songURL, 'utf8'),
      Buffer.from(fileUploadInfo.artworkFileURL, 'utf8'),
      Buffer.from(Buffer.from(require('crypto').randomBytes(32)).toString('hex')) // Generate a unique songID
    ],
    protocolID: [2, 'tempo'],
    keyID: '1'
  })
  // Create an action for all outputs
  const actionData = {
    outputs: [{
      satoshis: 1,
      script: bitcoinOutputScript
    }, ...fileUploadInfo.outputs],
    description: 'Publish a song',
    //topics: [constants.tempoTopic] commented out for local dev
  }
  
  const payment = await createAction(actionData)
  await new Authrite().request(
    `${constants.confederacyURL}/submit`,
    {
      method: 'POST',
      body: {
        ...payment,
        topics: [constants.tempoTopic]
      }
    }
  )

  // Pay and upload the files to nanostore
  await submitPaymentProof({ fileUploadInfo, payment })
  console.log("publish")
  // Export encryption key to store on the keyServer
  await publishKey({ key: fileUploadInfo.encryptionKey, songURL: fileUploadInfo.songURL })
  console.log("done")
  return true
}
