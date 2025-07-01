import constants from './constants'
import {
  PushDrop,
  WalletClient,
  Utils,
  LockingScript,
  Transaction,
  TopicBroadcaster
} from '@bsv/sdk'
import getFileUploadInfo from './getFileUploadInfo'
import publishKey from './publishKey'
import type { Song } from '../types/interfaces'

const wallet = new WalletClient('auto', 'localhost')
const pushdrop = new PushDrop(wallet)

const broadcaster = new TopicBroadcaster(
  [`tm_${constants.tempoTopic}`],
  {
    networkPreset: window.location.hostname === 'localhost' ? 'local' : 'mainnet'
  }
)

interface updateSongParams {
  song: Song
  filesToUpdate: {
    selectedArtwork?: File | FileList
    selectedMusic?: File | FileList
  }
}

const updateSong = async ({ song, filesToUpdate }: updateSongParams) => {
  // Step 1: Redeem the old token
  const outputScriptHex =
    typeof song.token.outputScript === 'string'
      ? song.token.outputScript
      : song.token.outputScript.toHex?.()

  if (!outputScriptHex || song.token.outputIndex == null) {
    throw new Error('Missing token output script or output index')
  }

  const sourceTransaction = new Transaction()
  sourceTransaction.outputs[song.token.outputIndex] = {
    satoshis: song.sats,
    lockingScript: LockingScript.fromHex(outputScriptHex)
  }

  const tx = new Transaction()
  tx.addInput({
    sourceTXID: song.token.txid,
    sourceOutputIndex: song.token.outputIndex,
    sourceTransaction
  })

  tx.addOutput({
    satoshis: song.sats,
    lockingScript: LockingScript.fromHex('00')
  })

  const { sign } = pushdrop.unlock(
    [2, 'tm tsp'],
    '1',
    'self',
    'all',
    false,
    song.sats,
    LockingScript.fromHex(outputScriptHex)
  )

  const unlockingScript = await sign(tx, 0)

  // Step 2: Get updated file info
  const fileUploadInfo = await getFileUploadInfo({
    selectedArtwork: filesToUpdate.selectedArtwork,
    selectedMusic: filesToUpdate.selectedMusic
  })

  if (fileUploadInfo.songURL) song.songURL = fileUploadInfo.songURL
  if (fileUploadInfo.artworkURL) song.artworkURL = fileUploadInfo.artworkURL
  if (fileUploadInfo.songDuration) song.duration = fileUploadInfo.songDuration

  // Step 3: Create updated PushDrop token
  const updatedOutputScript = await pushdrop.lock(
    [
      Utils.toArray(constants.tempoTopic, 'utf8'),
      Utils.toArray(song.title, 'utf8'),
      Utils.toArray(song.artist, 'utf8'),
      Utils.toArray(song.description ?? 'No description', 'utf8'),
      Utils.toArray(String(song.duration), 'utf8'),
      Utils.toArray(song.songURL, 'utf8'),
      Utils.toArray(song.artworkURL, 'utf8')
    ],
    [2, 'tmtsp'],
    '1',
    'self'
  )

  // Step 4: Create and broadcast transaction
  const action = await wallet.createAction({
    description: `Song ${song.title} updated!`,
    inputs: [
      {
        outpoint: `${song.token.txid}:${song.token.outputIndex!}`,
        inputDescription: 'Redeem old Tempo token',
        unlockingScript: unlockingScript.toHex()
      }
    ],
    outputs: [
      {
        lockingScript: updatedOutputScript.toHex(),
        satoshis: song.sats!,
        outputDescription: 'Updated Tempo Song Token'
      }
    ],
    labels: [constants.tempoTopic]
  })

  if (!action.tx) throw new Error('Transaction creation failed')

  // Step 5: Broadcast to overlay
  await broadcaster.broadcast(Transaction.fromAtomicBEEF(action.tx))

  // Step 6: Publish updated encryption key
  if (fileUploadInfo.encryptionKey) {
    await publishKey({
      wallet,
      key: fileUploadInfo.encryptionKey,
      songURL: fileUploadInfo.songURL
    })
  }
}

export default updateSong
