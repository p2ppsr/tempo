import { ActionData, createAction } from '@babbage/sdk-ts'
import pushdrop from 'pushdrop'
import constants from './constants'
import getFileUploadInfo from './getFileUploadInfo'
import submitPaymentProof from './submitPaymentProof.ts'
import publishKey from './publishKey'
import { Authrite } from 'authrite-js'
import { Song } from '../../src/types/interfaces.ts'

const publishSong = async (song: Song, retentionPeriod?: number) => {
  
  console.log('Publish: getFileUploadInfo')
  
  // Update the selected files
  const fileUploadInfo = await getFileUploadInfo({
    selectedArtwork: song.selectedArtwork,
    selectedMusic: song.selectedMusic,
    retentionPeriod: retentionPeriod ?? constants.RETENTION_PERIOD // use default 7 years if prop retentionPeriod is not provided
  })

  console.log('Publish: pushdrop.create')

  // Create an action script based on the tsp-protocol
  const bitcoinOutputScript = await pushdrop.create({
    fields: [
      Buffer.from(constants.tempoTopic, 'utf8'), // Protocol Namespace Address
      Buffer.from(constants.tspProtocolID, 'utf8'),
      Buffer.from(song.title, 'utf8'),
      Buffer.from(song.artist, 'utf8'),
      Buffer.from('Default description', 'utf8'), // TODO: Add to UI
      Buffer.from('' + fileUploadInfo.songDuration, 'utf8'), // Duration
      Buffer.from(fileUploadInfo.songURL, 'utf8'),
      Buffer.from(fileUploadInfo.artworkURL, 'utf8'),
      Buffer.from(Buffer.from(require('crypto').randomBytes(32)).toString('hex')) // Generate a unique songID
    ],
    protocolID: [2, 'tempo'],
    keyID: '1'
  })

  // Create an action for all outputs
  const actionData: ActionData = {
    outputs: [
      {
        satoshis: 1,
        script: bitcoinOutputScript, // Ensure this is of BufferType
        description: 'Tempo Song Token'
      },
      // Make sure that fileUploadInfo.outputs is an array of objects with the correct structure
      ...fileUploadInfo.outputs.map(output => ({
        satoshis: output.satoshis, // Assuming output has a satoshis property
        script: output.script, // Ensure this is of BufferType
        description: output.description // Assuming output has a description property
      }))
    ],
    description: 'Publish a song',
    acceptDelayedBroadcast: false
  }

  console.log('Publish: createAction with data: ', actionData)

  const payment = await createAction(actionData)

  console.log('Publish: submit payment proof: ', 'fileUploadInfo: ', fileUploadInfo, 'payment: ', payment)

  // Pay and upload the files to nanostore
  await submitPaymentProof({ fileUploadInfo, payment })

  console.log('Publish: Authrite.request: ')

  await new Authrite().request(`${constants.confederacyURL}/submit`, {
    method: 'POST',
    body: {
      ...payment,
      topics: [constants.tempoTopic]
    }
  })

  // Check if encryptionKey is not undefined before calling publishKey
  if (fileUploadInfo.encryptionKey) {
    
    console.log('Publish: publishKey')

    // Export encryption key to store on the keyServer
    await publishKey({
      key: fileUploadInfo.encryptionKey,
      songURL: fileUploadInfo.songURL
    })
  } else {
    // Handle the case when there's no encryptionKey (e.g., log, throw an error, or perform alternative action)
    console.log('No encryption key was generated, publishKey was not called.')
  }

  return true
}

export default publishSong
