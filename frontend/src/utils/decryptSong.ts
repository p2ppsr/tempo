import { WalletClient, P2PKH, PublicKey, AuthFetch, SymmetricKey, StorageDownloader, Utils } from '@bsv/sdk'
import constants from './constants'
import type { Song } from '../types/interfaces'
import { getStorageClient } from './walletSingleton'

const wallet = new WalletClient('auto', 'localhost')
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
    //   console.time('Invoice request time')
    //   const invoiceResponse = await authFetch.fetch(`${constants.keyServerURL}/invoice`, {
    //     method: 'POST',
    //     body: { songURL: song.songURL },
    //     headers: { 'Content-Type': 'application/json' }
    //   })
    //   console.timeEnd('Invoice request time')

      //invoice = await invoiceResponse.json()

      // console.time('getPublicKey')
      // const { publicKey: derivedPublicKey } = await wallet.getPublicKey({
      //   identityKey: true
      //   // protocolID: [2, '3241645161d8'],
      //   // keyID: `${derivationPrefix} ${derivationSuffix}`,
      //   // counterparty: invoice.identityKey
      // })
      // console.timeEnd('getPublicKey')

      console.time('Payment receipt request')
      const purchasedKeyResponse = await authFetch.fetch(`${constants.keyServerURL}/pay`, {
        method: 'POST',
        body: {
          //derivationPrefix,
          songURL: song.songURL,
          // satoshis: invoice.amount,
          // orderID: invoice.orderID
        },
        headers: { 'Content-Type': 'application/json' }
      })

      debugger
      console.timeEnd('Payment receipt request')


      const key = await purchasedKeyResponse.json() as any
      if (!key || !key.result) {
        throw new Error('Failed to retrieve encryption key')
      }

      console.log('Received encryption key:', key.result)
      const storageDownloader = new StorageDownloader()

      const RawBytesResponse = await storageDownloader.download(song.songURL)
          // Decrypt the song
      console.log('Raw bytes response:', RawBytesResponse)
      


        const symmetricKey = new SymmetricKey((Utils.toArray(key.result)), 'hex')

      console.log('Symmetric key created:', symmetricKey)

      const decrypted = await symmetricKey.decrypt([...RawBytesResponse.data]) as number[]
      console.log('Decrypted song bytes:', decrypted)

      const blob = new Blob(
        [Uint8Array.from(decrypted)],
        { type: 'model/stl' })
      const url = URL.createObjectURL(blob)

      console.log('Decrypted song URL:', url)
      return URL.createObjectURL(blob)
    })()
  ])
}
  

export default decryptSong
