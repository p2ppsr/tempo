import {
  PushDrop,
  WalletClient,
  Utils,
  Hash,
  TopicBroadcaster,
  Transaction
} from '@bsv/sdk'
import constants from './constants'
import getFileUploadInfo from './getFileUploadInfo'
import publishKey from './publishKey'
import type { Song } from '../../src/types/interfaces'

const wallet = new WalletClient('auto', 'localhost')
const pushdrop = new PushDrop(wallet)

const broadcaster = new TopicBroadcaster(
  [`tm_${constants.tempoTopic}`],
  {
    networkPreset: window.location.hostname === 'localhost' ? 'local' : 'mainnet'
  }
)

const publishSong = async (song: Song, retentionPeriod?: number): Promise<Song> => {
  console.log('[Publish] Uploading files...')

  const fileUploadInfo = await getFileUploadInfo({
    selectedArtwork: song.selectedArtwork,
    selectedMusic: song.selectedMusic,
    selectedPreview: song.selectedPreview,
    retentionPeriod: retentionPeriod ?? constants.RETENTION_PERIOD
  })

  console.log('[Publish] Upload Complete')
  console.log('[Publish] songURL:', fileUploadInfo.songURL)
  console.log('[Publish] artworkURL:', fileUploadInfo.artworkURL)
  console.log('[Publish] previewURL:', fileUploadInfo.previewURL)
  console.log('[Publish] songDuration:', fileUploadInfo.songDuration)

  console.log('[Publish] Creating PushDrop token...')

  const uniqueID = Utils.toHex(
    Hash.sha256(Utils.toArray(Math.random().toString(), 'utf8'))
  )

  const lockingScript = await pushdrop.lock(
    [
      Utils.toArray(constants.tempoTopic, 'utf8'),
      Utils.toArray(constants.tspProtocolID, 'utf8'),
      Utils.toArray(song.title, 'utf8'),
      Utils.toArray(song.artist, 'utf8'),
      Utils.toArray('Default description', 'utf8'),
      Utils.toArray(String(fileUploadInfo.songDuration), 'utf8'),
      Utils.toArray(fileUploadInfo.songURL, 'utf8'),
      Utils.toArray(fileUploadInfo.artworkURL, 'utf8'),
      Utils.toArray(fileUploadInfo.previewURL || '', 'utf8'),
      Utils.toArray(uniqueID, 'utf8')
    ],
    [2, 'tmtsp'],
    '1',
    'anyone',
    true
  )

  const { tx } = await wallet.createAction({
    outputs: [
      {
        lockingScript: lockingScript.toHex(),
        satoshis: 1,
        outputDescription: 'Tempo Song Token',
        basket: 'tmtsp'
      }
    ],
    description: 'Publish a song',
    options: {
      acceptDelayedBroadcast: false,
      randomizeOutputs: false
    }
  })

  if (!tx) throw new Error('Transaction creation failed')

  const transaction = Transaction.fromAtomicBEEF(tx)
  const txid = transaction.id('hex')
  const outputIndex = 0

  console.log('[Publish] Broadcasting to overlay...')
  await broadcaster.broadcast(transaction)

  if (fileUploadInfo.encryptionKey) {
    console.log('[Publish] Publishing encryption key...')
    await publishKey({
      wallet,
      key: fileUploadInfo.encryptionKey,
      songURL: fileUploadInfo.songURL
    })
  } else {
    console.log('[Publish] No encryption key to publish.')
  }

  return {
    ...song,
    sats: 1,
    token: {
      txid,
      vout: outputIndex,
      outputScript: lockingScript,
      satoshis: 1,
      inputs: {},
      mapiResponses: {},
      proof: {},
      rawTX: Utils.toBase64(tx)
    }
  }
}

export default publishSong
