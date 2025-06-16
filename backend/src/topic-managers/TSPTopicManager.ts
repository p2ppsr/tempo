import { AdmittanceInstructions, TopicManager } from '@bsv/overlay'
import { PublicKey, Signature, Transaction, PushDrop, Utils } from '@bsv/sdk'
import docs from './TSPTopicDocs.md.js'

const TSP_PROTOCOL_ADDRESS = '1LQtKKK7c1TN3UcRfsp8SqGjWtzGskze36'

export default class TSPTopicManager implements TopicManager {
  async identifyAdmissibleOutputs(beef: number[], previousCoins: number[]): Promise<AdmittanceInstructions> {
    const admissibleOutputs: number[] = []

    try {
      const tx = Transaction.fromBEEF(beef)
      console.log('[TSPTopicManager] Evaluating transaction:', tx.id)

      for (const [index, output] of tx.outputs.entries()) {
        try {
          const decoded = PushDrop.decode(output.lockingScript)
          const fields = decoded.fields

          const protocolAddress = Utils.toBase58(fields[0])
          if (protocolAddress !== TSP_PROTOCOL_ADDRESS) {
            console.log(`[TSPTopicManager] Output #${index} – Invalid protocol address: ${protocolAddress}`)
            continue
          }

          const dataToVerify = fields.slice(0, 7).flat()
          const pubKey = decoded.lockingPublicKey
          const sig = Signature.fromDER(fields[7])

          const valid = pubKey.verify(dataToVerify, sig)
          if (!valid) {
            console.log(`[TSPTopicManager] Output #${index} – Invalid signature`)
            continue
          }

          console.log(`[TSPTopicManager] Output #${index} – Valid TSP output by ${pubKey.toString()}`)
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

