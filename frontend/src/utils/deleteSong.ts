import {
  PushDrop,
  WalletClient,
  Transaction,
  TopicBroadcaster,
  Beef
} from '@bsv/sdk'
import constants from './constants'
import type { Song } from '../types/interfaces'
import { toast } from 'react-toastify'

const wallet = new WalletClient('auto', 'localhost')
const pushdrop = new PushDrop(wallet)

const deleteSong = async (song: Song): Promise<string> => {
  try {
    const { txid, vout, rawTX } = song.token
    const title = song.title

    if (!rawTX) {
      throw new Error('Missing rawTX from token; required for deletion')
    }

    // Step 1: Parse BEEF and hydrate transaction
    const loadedBEEF = Beef.fromBinary(
      Array.from(Uint8Array.from(atob(rawTX), c => c.charCodeAt(0)))
    )
    const prevOutpoint = `${txid}.${vout}` as const

    const originalTx = Transaction.fromBEEF(loadedBEEF.toBinary())
    const output = originalTx.outputs[vout]
    if (!output?.lockingScript) {
      throw new Error('Missing lockingScript from transaction output')
    }

    const satoshis = output.satoshis ?? 0
    const lockingScript = output.lockingScript

    // Step 2: Create signable deletion action
    const { signableTransaction } = await wallet.createAction({
      description: `Song, ${title}, deleted!`,
      inputBEEF: loadedBEEF.toBinary(),
      inputs: [
        {
          outpoint: prevOutpoint,
          unlockingScriptLength: 74,
          inputDescription: 'Delete a song'
        }
      ],
      outputs: [], // No outputs = token burned
      options: {
        acceptDelayedBroadcast: false,
        randomizeOutputs: false,
        signAndProcess: false
      }
    })

    if (!signableTransaction?.tx) {
      throw new Error('Failed to create signable transaction')
    }

    // Step 3: Sign input 0 with PushDrop
    const unlocker = pushdrop.unlock(
      [2, 'tmtsp'],
      '1',
      'anyone',
      'all',
      true,
      satoshis,
      lockingScript
    )
    const unlockingScript = await unlocker.sign(
      Transaction.fromBEEF(signableTransaction.tx),
      0
    )

    // Step 4: Finalize and broadcast
    const { tx, txid: newTxid } = await wallet.signAction({
      reference: signableTransaction.reference,
      spends: {
        0: { unlockingScript: unlockingScript.toHex() }
      }
    })

    if (!tx || !newTxid) {
      throw new Error('Signed transaction missing or failed to return txid')
    }

    const broadcaster = new TopicBroadcaster(
      [`tm_${constants.tempoTopic}`],
      {
        networkPreset: window.location.hostname === 'localhost' ? 'local' : 'mainnet'
      }
    )


    await broadcaster.broadcast(Transaction.fromAtomicBEEF(tx))

    console.log(`[Delete] Successfully deleted song "${title}" with txid: ${newTxid}`)
    toast.success(`Successfully deleted song "${title}" with txid: ${newTxid}`, {
      containerId: 'alertToast'
    })


    return newTxid
  } catch (error) {
    console.error(error)
    throw new Error('Failed to delete song!')
  }
}

export default deleteSong
