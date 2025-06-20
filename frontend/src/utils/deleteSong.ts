import {
  PushDrop,
  LockingScript,
  WalletClient,
  Transaction,
  TopicBroadcaster
} from '@bsv/sdk'
import constants from './constants'
import type { Song } from '../types/interfaces'

const wallet = new WalletClient('json-api', 'auto')
const pushdrop = new PushDrop(wallet)

const deleteSong = async (song: Song): Promise<string> => {
  try {
    // Destructure for clarity
    const {
      token: { txid, vout, satoshis, outputScript },
      title
    } = song

    // Step 1: Convert outputScript to LockingScript
    const outputScriptHex =
      typeof outputScript === 'string' ? outputScript : outputScript.toHex()

    const lockingScript = LockingScript.fromHex(outputScriptHex)

    // Step 2: Get unlock script generator
    const { sign } = pushdrop.unlock(
      [2, 'tmtsp'],
      '1',
      'self',
      'all',
      false,
      satoshis,
      lockingScript
    )

    // Step 3: Create unsigned deletion transaction
    const { signableTransaction } = await wallet.createAction({
      description: `Song, ${title}, deleted!`,
      inputs: [
        {
          outpoint: `${txid}:${vout}`,
          unlockingScriptLength: 73,
          inputDescription: 'Delete a song'
        }
      ],
      outputs: [],
      options: {
        signAndProcess: false
      }
    })

    if (!signableTransaction?.tx) {
      throw new Error('Failed to create signable transaction')
    }

    // Step 4: Deserialize and sign
    const tx = Transaction.fromAtomicBEEF(signableTransaction.tx)
    const unlockingScript = await sign(tx, 0)

    // Step 5: Finalize by calling signAction
    const action = await wallet.signAction({
      reference: signableTransaction.reference,
      spends: {
        0: {
          unlockingScript: unlockingScript.toHex()
        }
      }
    })

    // Step 6: Broadcast to overlay
    if (!action.tx) {
      throw new Error('Signed transaction is missing from action result')
    }

    const broadcaster = new TopicBroadcaster([constants.tempoTopic])
    await broadcaster.broadcast(Transaction.fromAtomicBEEF(action.tx))

    if (!action.txid) {
      throw new Error('Signed transaction did not return a txid')
    }

    return action.txid
  } catch (error) {
    console.error(error)
    throw new Error('Failed to delete song!')
  }
}

export default deleteSong
