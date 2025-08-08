import { Transaction, PushDrop, Utils } from '@bsv/sdk'
import type { Song } from '../types/interfaces'

export interface DecodedSong extends Song {}

export async function decodeOutput(
  beef: number[],
  outputIndex: number
): Promise<DecodedSong> {
  // Decode the transaction from the on-chain BEEF
  const decodedTx = Transaction.fromBEEF(beef)
  const output = decodedTx.outputs[outputIndex]

  // Decode the PushDrop data in the locking script
  const decoded = PushDrop.decode(output.lockingScript)
  const data = decoded.fields
  const sats = output.satoshis ?? 0;

  const previewRaw = data.length > 10 ? Utils.toUTF8(data[8]) : ''
  const isValidUhrpHash = /^[a-zA-Z0-9_-]{30,}$/.test(previewRaw)
  const previewURL = isValidUhrpHash ? `https://uhrp.babbage.systems/${previewRaw}` : undefined

  const song: DecodedSong = {
    title: Utils.toUTF8(data[2]),
    artist: Utils.toUTF8(data[3]),
    description: Utils.toUTF8(data[4]),
    duration: parseInt(Utils.toUTF8(data[5])),
    songURL: Utils.toUTF8(data[6]),
    artworkURL: Utils.toUTF8(data[7]),
    previewURL,
    sats: output.satoshis,
    isPublished: true,
    artistIdentityKey: decoded.lockingPublicKey.toString(),
    token: {
      txid: decodedTx.id('hex'),
      vout: outputIndex,
      satoshis: sats,
      outputScript: output.lockingScript.toHex(),
      inputs: {},
      mapiResponses: {},
      proof: {},
      rawTX: Utils.toBase64(beef)
    }
  }

  return song
}

export async function decodeOutputs(
  outputs: Array<{ beef: number[]; outputIndex: number }>
): Promise<DecodedSong[]> {
  return Promise.all(
    outputs.map(({ beef, outputIndex }) =>
      decodeOutput(beef, outputIndex).catch((err) => {
        console.warn(`[decodeOutputs] Skipping invalid output at vout ${outputIndex}:`, err)
        return null
      })
    )
  ).then((results) => results.filter((s): s is DecodedSong => s !== null))
}
