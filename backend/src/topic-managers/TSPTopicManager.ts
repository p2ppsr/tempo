import { AdmittanceInstructions, TopicManager } from '@bsv/overlay'
import {
  PublicKey,
  Signature,
  Transaction,
  PushDrop,
  Utils
} from '@bsv/sdk'
import docs from './TSPTopicDocs.md.js'

export default class TSPTopicManager implements TopicManager {
  async identifyAdmissibleOutputs(
    beef: number[],
    previousCoins: number[]
  ): Promise<AdmittanceInstructions> {
    const admissibleOutputs: number[] = []

    try {
      const tx = Transaction.fromBEEF(beef)
      console.log('[TSPTopicManager] Evaluating transaction:', tx.id)

      for (const [index, output] of tx.outputs.entries()) {
        try {
          const decoded = PushDrop.decode(output.lockingScript)
          const fields = decoded.fields

          // Check protocol ID
          const protocolID = Utils.toUTF8(fields[0])
          if (protocolID !== 'tmtsp') {
            console.log(`[TSPTopicManager] Output #${index} – Invalid protocol ID: ${protocolID}`)
            continue
          }

          // Extract signed fields
          const signedData = fields.slice(0, 7).flat() // same order as in publishSong.ts

          const sig = Signature.fromDER(fields[7])
          const pubKeyStr = Utils.toUTF8(fields[8])
          const pubKey = PublicKey.fromString(pubKeyStr)

          const isValid = pubKey.verify(signedData, sig)
          if (!isValid) {
            console.warn(`[TSPTopicManager] Output #${index} – Invalid signature`)
            continue
          }

          console.log(`[TSPTopicManager] Output #${index} – Valid TSP song from ${pubKey.toString()}`)
          admissibleOutputs.push(index)

        } catch (err) {
          console.log(`[TSPTopicManager] Skipping output #${index}:`, err)
        }
      }

      if (admissibleOutputs.length === 0) {
        console.warn('[TSPTopicManager] No valid TSP outputs found in transaction')
      }

      return {
        outputsToAdmit: admissibleOutputs,
        coinsToRetain: previousCoins
      }

    } catch (err) {
      console.error('[TSPTopicManager] Failed to parse transaction:', err)
      return {
        outputsToAdmit: [],
        coinsToRetain: []
      }
    }
  }

  async getDocumentation(): Promise<string> {
    return docs
  }

  async getMetaData(): Promise<{
    name: string
    shortDescription: string
    iconURL?: string
    version?: string
    informationURL?: string
  }> {
    return {
      name: 'tm_tsp',
      shortDescription: 'Tempo Song Protocol Topic Manager',
      version: '1.0.0'
    }
  }
}
