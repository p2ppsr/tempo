import {
  KeyDeriver,
  PrivateKey
} from '@bsv/sdk'
import type { WalletInterface } from '@bsv/sdk'

import {
  Wallet,
  WalletSigner,
  WalletStorageManager,
  Services,
  StorageClient
} from '@bsv/wallet-toolbox-client'

let walletInstance: WalletInterface | null = null
let storageClientInstance: StorageClient | null = null

export async function getWallet(): Promise<WalletInterface> {
  if (walletInstance) return walletInstance

  // Vite-style environment variables
  const SERVER_PRIVATE_KEY = import.meta.env.VITE_SERVER_PRIVATE_KEY as string
  const WALLET_STORAGE_URL = import.meta.env.VITE_WALLET_STORAGE_URL as string
  const BSV_NETWORK = import.meta.env.VITE_BSV_NETWORK as 'mainnet' | 'testnet'

  const chain = BSV_NETWORK === 'mainnet' ? 'main' : 'test'
  const keyDeriver = new KeyDeriver(new PrivateKey(SERVER_PRIVATE_KEY, 'hex'))
  const storageManager = new WalletStorageManager(keyDeriver.identityKey)
  const signer = new WalletSigner(chain, keyDeriver as any, storageManager)
  const services = new Services(chain)
  const wallet = new Wallet(signer, services)
  const client = new StorageClient(wallet, WALLET_STORAGE_URL)

  ;(client as any).downloadFile = async (url: string): Promise<Uint8Array> => {
    const res = await fetch(url)
    if (!res.ok) throw new Error(`Failed to fetch ${url}`)
    return new Uint8Array(await res.arrayBuffer())
  }

  await client.makeAvailable()
  await storageManager.addWalletStorageProvider(client)

  walletInstance = wallet
  storageClientInstance = client

  return walletInstance
}

export async function getStorageClient(): Promise<StorageClient> {
  if (!storageClientInstance) await getWallet()
  return storageClientInstance!
}
