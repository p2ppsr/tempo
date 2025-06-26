import {
  KeyDeriver,
  PrivateKey,
  WalletInterface
} from '@bsv/sdk'

import {
  Wallet,
  WalletSigner,
  WalletStorageManager,
  Services,
  StorageClient
} from '@bsv/wallet-toolbox-client'

const walletInstance: WalletInterface | null = null
let storageClientInstance: StorageClient | null = null

export async function getWallet(): Promise<WalletInterface> {
  const SERVER_PRIVATE_KEY = process.env.SERVER_PRIVATE_KEY
  const WALLET_STORAGE_URL = process.env.WALLET_STORAGE_URL
  const BSV_NETWORK = process.env.BSV_NETWORK as 'mainnet' | 'testnet'

  if (!SERVER_PRIVATE_KEY || !WALLET_STORAGE_URL) {
    throw new Error('Missing SERVER_PRIVATE_KEY or WALLET_STORAGE_URL in environment')
  }

  if (!walletInstance) {
    const chain = BSV_NETWORK === 'mainnet' ? 'main' : 'test'
    const keyDeriver = new KeyDeriver(new PrivateKey(SERVER_PRIVATE_KEY, 'hex'))
    const storageManager = new WalletStorageManager(keyDeriver.identityKey)
    const signer = new WalletSigner(chain, keyDeriver, storageManager)
    const services = new Services(chain)
    const wallet = new Wallet(signer, services)
    const client = new StorageClient(wallet, WALLET_STORAGE_URL)

    await client.makeAvailable()
    await storageManager.addWalletStorageProvider(client)
    return wallet
  }
    return walletInstance
}

export async function getStorageClient(): Promise<StorageClient> {
  if (!storageClientInstance) await getWallet()
  return storageClientInstance!
}
