import {
  PushDrop,
  LockingScript,
  WalletClient,
  Transaction,
  TopicBroadcaster
} from '@bsv/sdk'
import constants from './constants'
import type { Song } from '../types/interfaces'

const wallet = new WalletClient('auto', 'localhost')
const pushdrop = new PushDrop(wallet)

const deleteSong = async (song: Song): Promise<string> => {
  try {
    const { txid, vout } = song.token
    const title = song.title

    // Step 0: Hydrate token with full metadata
    const { outputs } = await wallet.listOutputs({
  basket: 'localhost',
  include: 'locking scripts'
})

const matchedOutput = outputs.find(o => {
  const [outputTxid, outputVoutStr] = o.outpoint?.split(':') ?? []
  return outputTxid === txid && Number(outputVoutStr) === vout
})



if (!matchedOutput) {
  throw new Error(`Output ${txid}:${vout} not found in wallet`)
}


    if (!matchedOutput) {
      throw new Error(`Output ${txid}:${vout} not found in wallet`)
    }

    if (!matchedOutput?.lockingScript) {
  throw new Error('Missing lockingScript for matched output')
}

const outputScriptHex = matchedOutput.lockingScript
const lockingScript = LockingScript.fromHex(outputScriptHex)

    // Step 1: Get unlock script generator
    const { sign } = pushdrop.unlock(
      [2, 'tmtsp'],
      '1',
      'self',
      'all',
      false,
      matchedOutput.satoshis,
      lockingScript
    )

    // Step 2: Create unsigned deletion transaction
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

    // Step 3: Deserialize and sign
    const tx = Transaction.fromAtomicBEEF(signableTransaction.tx)
    const unlockingScript = await sign(tx, 0)

    // Step 4: Finalize by calling signAction
    const action = await wallet.signAction({
      reference: signableTransaction.reference,
      spends: {
        0: {
          unlockingScript: unlockingScript.toHex()
        }
      }
    })

    // Step 5: Broadcast to overlay
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
