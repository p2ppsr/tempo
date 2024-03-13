import constants from "./constants"
import pushdrop from "pushdrop"
import { createAction } from "@babbage/sdk-ts"
import { Song } from "../types/interfaces"
import { Authrite } from 'authrite-js'

interface DeleteSongProps {
  song: Song
}

const deleteSong = async ({ song }: DeleteSongProps) => {
  try {
    const unlockingScript = await pushdrop.redeem({
      // To unlock the token, we need to use the same tempo protocol
      // and key ID as when we created the tsp token before. Otherwise, the
      // key won't fit the lock and the Bitcoins won't come out.
      protocolID: [2, "tempo"],
      keyID: "1",
      // We're telling PushDrop which previous transaction and output we want to unlock, so that the correct unlocking puzzle can be prepared.
      prevTxId: song.token.txid,
      outputIndex: song.token.vout,
      // We also give PushDrop a copy of the locking puzzle ("script") that
      // we want to open, which is helpful in preparing to unlock it.
      lockingScript: song.token.outputScript,
      // Finally, the amount of Bitcoins we are expecting to unlock when the
      // puzzle gets solved.
      outputAmount: song.sats,
    })

    const deleteTx = await createAction({
      description: `Song, ${song.title}, deleted!`,
      inputs: {
        [song.token.txid]: {
          ...song.token,
          inputs: typeof song.token.inputs === 'string'
            ? JSON.parse(song.token.inputs)
            : song.token.inputs,
          mapiResponses: typeof song.token.mapiResponses === 'string'
            ? JSON.parse(song.token.mapiResponses)
            : song.token.mapiResponses,
          proof: typeof song.token.proof === 'string'
            ? JSON.parse(song.token.proof)
            : song.token.proof,
          outputsToRedeem: [
            {
              index: song.token.vout,
              unlockingScript,
              spendingDescription: "Delete a song"
            },
          ],
        },
      },
      topic: [constants.tempoTopic],
      acceptDelayedBroadcast: false
    })

    // Notify the overlay of the spend!
    await new Authrite().request(`${constants.confederacyURL}/submit`, {
      method: 'POST',
      body: {
        ...deleteTx,
        topics: [constants.tempoTopic]
      }
    })
  } catch (error) {
    console.error(error)
    throw new Error('Failed to delete song!')
  }
}

export default deleteSong
