import constants from "./constants"
import pushdrop from "pushdrop"
import { createAction } from "@babbage/sdk"
import { Song } from "../types/interfaces"

interface DeleteSongProps {
  song: Song
}

const deleteSong = async ({ song }: DeleteSongProps) => {
  // console.log(song)
  const unlockingScript = await pushdrop.redeem({
    // To unlock the token, we need to use the same tempo protocol
    // and key ID as when we created the tsp token before. Otherwise, the
    // key won't fit the lock and the Bitcoins won't come out.
    protocolID: "tempo",
    keyID: "1",
    // We're telling PushDrop which previous transaction and output we want to unlock, so that the correct unlocking puzzle can be prepared.
    prevTxId: song.token.txid,
    outputIndex: song.token.outputIndex,
    // We also give PushDrop a copy of the locking puzzle ("script") that
    // we want to open, which is helpful in preparing to unlock it.
    lockingScript: song.token.lockingScript,
    // Finally, the amount of Bitcoins we are expecting to unlock when the
    // puzzle gets solved.
    outputAmount: song.sats,
  })

  await createAction({
    description: `Song, ${song.title}, deleted!`,
    inputs: {
      [song.token.txid]: {
        ...song.token,
        outputsToRedeem: [
          {
            index: song.token.outputIndex,
            unlockingScript,
          },
        ],
      },
    },
    topic: [constants.tempoTopic],
  })
}

export default deleteSong
