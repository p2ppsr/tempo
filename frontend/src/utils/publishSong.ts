import {
  PushDrop,
  Utils,
  Hash,
  TopicBroadcaster,
  Transaction,
  LookupResolver
} from '@bsv/sdk'
import constants from './constants'
import getFileUploadInfo from './getFileUploadInfo'
import publishKey from './publishKey'
import type { PublicationReceipt, Song } from '../types/interfaces'
import { getInteractiveWallet } from './wallet'
import { captureError, captureSignal } from './usercom'
import { inspectSongAvailability } from './catalogAvailability'

const wallet = getInteractiveWallet()
const pushdrop = new PushDrop(wallet)

export type PublishProgressStage =
  | 'uploading_files'
  | 'creating_token'
  | 'broadcasting'
  | 'publishing_key'
  | 'verifying'
  | 'completed'

type PublishProgressCallback = (stage: PublishProgressStage, message: string) => void

const broadcaster = new TopicBroadcaster(
  [`tm_${constants.tempoTopic}`],
  {
    networkPreset: constants.overlayNetworkPreset
  }
)

const resolver = new LookupResolver({ networkPreset: constants.overlayNetworkPreset })

async function waitForOverlayAdmission(songURL: string): Promise<boolean> {
  for (let attempt = 0; attempt < 6; attempt += 1) {
    const answer = await resolver.query({
      service: constants.overlayLookupService,
      query: { type: 'findBySongIDs', value: { songIDs: [songURL] } }
    })
    if (answer.type === 'output-list' && answer.outputs.length > 0) return true
    await new Promise(resolve => window.setTimeout(resolve, 1500 * (attempt + 1)))
  }
  return false
}

const publishSong = async (
  song: Song,
  retentionPeriod?: number,
  onProgress?: PublishProgressCallback
): Promise<Song> => {
  captureSignal('publish.started', { surface: 'publish-flow', context: { retentionMinutes: retentionPeriod ?? constants.RETENTION_PERIOD } })

  let activeStage: PublishProgressStage = 'uploading_files'
  const receipt: PublicationReceipt = {
    publicationId: globalThis.crypto?.randomUUID?.() || `tempo-${Date.now().toString(36)}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    stage: 'started',
    assets: {},
    keyPublished: false,
    overlayAdmitted: false,
    playable: false
  }
  const saveReceipt = (stage: string) => {
    receipt.stage = stage
    receipt.updatedAt = new Date().toISOString()
    localStorage.setItem('tempo:last-publication', JSON.stringify(receipt))
  }
  saveReceipt('started')

  try {
    onProgress?.('uploading_files', 'Uploading redundant audio, artwork, and preview copies...')

    const fileUploadInfo = await getFileUploadInfo({
      selectedArtwork: song.selectedArtwork,
      selectedMusic: song.selectedMusic,
      selectedPreview: song.selectedPreview,
      retentionPeriod: retentionPeriod ?? constants.RETENTION_PERIOD,
      onProgress: message => onProgress?.('uploading_files', message),
      onAssetReceipt: (asset, assetReceipt) => {
        receipt.assets[asset] = assetReceipt
        saveReceipt(`${asset}_storage_verified`)
      }
    })

    const unavailableAssets = Object.entries(fileUploadInfo.assets)
      .filter(([, asset]) => !asset?.available)
      .map(([name, asset]) => `${name} (${asset?.acceptedBy?.length ?? 0} upload receipts, ${asset?.hostedBy.length ?? 0} active UHRP locations)`)
    if (!fileUploadInfo.assets.audio?.available || !fileUploadInfo.assets.artwork?.available ||
      (fileUploadInfo.previewURL && !fileUploadInfo.assets.preview?.available)) {
      throw new Error(`Storage verification failed for ${unavailableAssets.join(', ')} before publication. No catalogue token was created.`)
    }
    receipt.assets = fileUploadInfo.assets
    saveReceipt('storage_verified')

    activeStage = 'creating_token'
    onProgress?.('creating_token', 'Creating your song token...')

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
    receipt.txid = txid
    saveReceipt('token_created')

    if (!fileUploadInfo.encryptionKey) throw new Error('The encrypted audio key was not created.')
    activeStage = 'publishing_key'
    onProgress?.('publishing_key', 'Publishing the purchase key...')
    await publishKey({ wallet, key: fileUploadInfo.encryptionKey, songURL: fileUploadInfo.songURL })
    receipt.keyPublished = true
    saveReceipt('key_published')

    activeStage = 'broadcasting'
    onProgress?.('broadcasting', 'Broadcasting your song to the overlay...')
    const broadcastResult = await broadcaster.broadcast(transaction)
    if (broadcastResult.status === 'error') {
      throw new Error('The Tempo overlay did not accept the song token.')
    }
    saveReceipt('broadcast_accepted')

    activeStage = 'verifying'
    onProgress?.('verifying', 'Verifying storage, key server, overlay admission, and playback readiness...')
    const overlayAdmitted = await waitForOverlayAdmission(fileUploadInfo.songURL)
    const publishedSong: Song = {
      ...song,
      songURL: fileUploadInfo.songURL,
      artworkURL: fileUploadInfo.artworkURL,
      previewURL: fileUploadInfo.previewURL || undefined,
      duration: fileUploadInfo.songDuration,
      sats: 1,
      token: {
        txid,
        vout: outputIndex,
        outputScript: lockingScript,
        satoshis: 1,
        inputs: {},
        mapiResponses: {},
        proof: {},
        rawTX: Utils.toBase64(Array.from(tx))
      }
    }
    const availability = await inspectSongAvailability(publishedSong)
    receipt.keyPublished = availability.hasKey
    receipt.overlayAdmitted = overlayAdmitted
    receipt.playable = overlayAdmitted && availability.status === 'playable'
    publishedSong.availability = availability
    saveReceipt(receipt.playable ? 'verified' : 'verification_failed')
    publishedSong.publicationReceipt = { ...receipt }

    if (!receipt.playable) {
      throw new Error(`Publication verification failed (${availability.reason || 'overlay_not_admitted'}). Your receipt was saved for recovery.`)
    }

    onProgress?.('completed', 'Published and verified playable.')
    captureSignal('publish.succeeded', {
      surface: 'publish-flow',
      context: { publicationId: txid.slice(0, 12), overlayAdmitted, playable: receipt.playable }
    })
    return publishedSong
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    receipt.failedAtStage = activeStage
    receipt.error = message
    saveReceipt('failed')
    captureError('publish.failed', error, { publicationId: receipt.publicationId, failedAtStage: activeStage }, ['publish:failed'])
    throw error
  }
}

export default publishSong
