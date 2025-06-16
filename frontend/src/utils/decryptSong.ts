import { WalletClient, P2PKH, PublicKey, AuthFetch } from '@bsv/sdk'
import constants from './constants'
import type { Song } from '../types/interfaces'
import { getStorageClient } from './walletSingleton'

const wallet = new WalletClient('json-api', 'auto')
const authFetch = new AuthFetch(wallet)

function generateBase64RandomBytes(length: number): string {
  const array = new Uint8Array(length)
  window.crypto.getRandomValues(array)
  return btoa(String.fromCharCode(...array))
}

type MinimalSong = Pick<Song, 'songURL' | 'title' | 'artist'>

const decryptSong = async (song: MinimalSong) => {
  if (!song.songURL) return

  const derivationPrefix = generateBase64RandomBytes(10)
  const derivationSuffix = generateBase64RandomBytes(10)

  let invoice: any

  const [encryptedData, _purchasedKey] = await Promise.all([
    (async () => {
      console.time('Song download time')
      const storageClient = await getStorageClient()
      const encryptedData = await (storageClient as any).downloadFile(song.songURL)
      console.timeEnd('Song download time')
      return encryptedData
    })(),
    (async () => {
      console.time('Invoice request time')
      const invoiceResponse = await authFetch.fetch(`${constants.keyServerURL}/invoice`, {
        method: 'POST',
        body: { songURL: song.songURL },
        headers: { 'Content-Type': 'application/json' }
      })
      console.timeEnd('Invoice request time')

      invoice = await invoiceResponse.json()

      const paymentDescription = `You listened to ${song.title}, by ${song.artist}`

      console.time('getPublicKey')
      const { publicKey: derivedPublicKey } = await wallet.getPublicKey({
        protocolID: [2, '3241645161d8'],
        keyID: `${derivationPrefix} ${derivationSuffix}`,
        counterparty: invoice.identityKey
      })
      console.timeEnd('getPublicKey')

      const lockingScript = new P2PKH()
        .lock(PublicKey.fromString(derivedPublicKey).toAddress())
        .toHex()

      console.time('createAction')
      const { tx } = await wallet.createAction({
        description: paymentDescription,
        outputs: [{
          satoshis: parseInt(invoice.amount),
          lockingScript,
          outputDescription: 'Song payment'
        }],
        options: { signAndProcess: true }
      })
      console.timeEnd('createAction')

      if (!tx) throw new Error('Failed to generate royalty payment transaction')

      console.time('Payment receipt request')
      const purchasedKeyResponse = await authFetch.fetch(`${constants.keyServerURL}/pay`, {
        method: 'POST',
        body: {
          derivationPrefix,
          songURL: song.songURL,
          transaction: {
            ...tx,
            outputs: [{
              vout: 0,
              satoshis: invoice.amount,
              derivationSuffix
            }]
          },
          orderID: invoice.orderID
        },
        headers: { 'Content-Type': 'application/json' }
      })
      console.timeEnd('Payment receipt request')

      return purchasedKeyResponse
    })()
  ])

  // Decrypt the song
  console.time('Decrypt result response time')
  const { plaintext } = await wallet.decrypt({
    ciphertext: Array.from(new Uint8Array(encryptedData)),
    protocolID: [2, '3241645161d8'],
    keyID: `${derivationPrefix} ${derivationSuffix}`,
    counterparty: invoice.identityKey
  })
  console.timeEnd('Decrypt result response time')

  return URL.createObjectURL(new Blob([new Uint8Array(plaintext)]))
}

export default decryptSong
