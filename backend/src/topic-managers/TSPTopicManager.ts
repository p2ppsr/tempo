import { AdmittanceInstructions, TopicManager } from '@bsv/overlay'
import { Transaction, PushDrop, Utils } from '@bsv/sdk'
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

          // Check field count
          if (fields.length < 9 || fields.length > 11) {
            console.log(`[TSPTopicManager] Output #${index} – Unexpected field count: ${fields.length}`)
            continue
          }

          // Validate protocol fields
          const topic = Utils.toUTF8(fields[0])
          const protocol = Utils.toUTF8(fields[1])

          if (protocol !== 'tmtsp' || topic !== 'tsp') {
            console.log(`[TSPTopicManager] Output #${index} – Invalid topic or protocol: ${topic}, ${protocol}`)
            continue
          }

          // Could add more validation on fields[2] to [8] if needed
          console.log(`[TSPTopicManager] Output #${index} – Valid TSP song token`)
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

  async getDocumentation() {
    return docs
  }

  async getMetaData() {
    return {
      name: 'tm_tsp',
      shortDescription: 'Tempo Song Protocol Topic Manager',
      version: '1.0.0'
    }
  }
}
