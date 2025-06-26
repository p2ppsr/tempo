// utils/decodeOutputs.ts

import { PushDrop, Transaction, Utils } from '@bsv/sdk'
import type { DecodedSongOutput } from '../types.js'

type FieldKey = keyof DecodedSongOutput

export async function decodeOutput(
  beef: number[],
  outputIndex: number,
  fields: FieldKey[]
): Promise<DecodedSongOutput> {
  const tx = Transaction.fromBEEF(beef)
  const output = tx.outputs[outputIndex]
  const decoded = PushDrop.decode(output.lockingScript)
  const data = decoded.fields

  const result: DecodedSongOutput = {
    txid: tx.id('hex'),
    outputIndex
  }

  for (const key of fields) {
    switch (key) {
      case 'title':
        result.title = Utils.toUTF8(Utils.toArray(data[2]))
        break
      case 'artist':
        result.artist = Utils.toUTF8(Utils.toArray(data[3]))
        break
      case 'description':
        result.description = Utils.toUTF8(Utils.toArray(data[4]))
        break
      case 'duration':
        result.duration = Utils.toUTF8(Utils.toArray(data[5]))
        break
      case 'fileUrl':
        result.fileUrl = Utils.toUTF8(Utils.toArray(data[6]))
        break
      case 'coverUrl':
        result.coverUrl = Utils.toUTF8(Utils.toArray(data[7]))
        break
      case 'uuid':
        result.uuid = Utils.toUTF8(Utils.toArray(data[8]))
        break
      case 'txid':
      case 'outputIndex':
      default:
        break
    }
  }

  return result
}

export async function decodeOutputs(
  outputs: { beef: number[]; outputIndex: number }[],
  fields: FieldKey[]
): Promise<DecodedSongOutput[]> {
  return Promise.all(outputs.map(o => decodeOutput(o.beef, o.outputIndex, fields)))
}
