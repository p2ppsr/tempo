/**
 * @file decodeOutputs.ts
 * @description
 * Utility functions for decoding PushDrop outputs in Tempo.
 * Provides functionality to parse fields like title, artist, fileUrl, etc.
 * from locking scripts of transaction outputs, and convert them into
 * structured `DecodedSongOutput` objects.
 */

import { PushDrop, Transaction, Utils } from '@bsv/sdk'
import type { DecodedSongOutput } from '../types.js'

type FieldKey = keyof DecodedSongOutput

/**
 * Decodes a single output from a Bitcoin transaction, extracting
 * requested fields from the PushDrop-encoded locking script.
 *
 * @param beef - The raw transaction in BEEF format (array of bytes).
 * @param outputIndex - The index of the output to decode.
 * @param fields - The specific fields to extract (e.g., 'title', 'artist').
 * @returns A promise resolving to a DecodedSongOutput object containing the txid, outputIndex, and requested fields.
 */
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

/**
 * Decodes multiple outputs in parallel, using `decodeOutput`
 * for each provided beef/outputIndex pair.
 *
 * @param outputs - An array of objects containing beef (transaction) and outputIndex.
 * @param fields - The fields to extract for each output.
 * @returns A promise resolving to an array of DecodedSongOutput objects.
 */
export async function decodeOutputs(
  outputs: { beef: number[]; outputIndex: number }[],
  fields: FieldKey[]
): Promise<DecodedSongOutput[]> {
  return Promise.all(outputs.map(o => decodeOutput(o.beef, o.outputIndex, fields)))
}
