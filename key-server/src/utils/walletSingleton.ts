/**
 * @file walletSingleton.ts
 * @description
 * Provides utility functions to initialize and retrieve the backend server’s
 * Tempo wallet and associated StorageClient using wallet-toolbox.
 * Ensures a single wallet and storage client instance are shared across requests.
 */

import {
  CachedKeyDeriver,
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

/**
 * Initializes (if necessary) and retrieves the server wallet configured with
 * SERVER_PRIVATE_KEY and WALLET_STORAGE_URL environment variables.
 * The wallet is configured with wallet-toolbox, including WalletSigner,
 * Services, and StorageClient integration for UHRP storage.
 *
 * @returns A promise resolving to the initialized WalletInterface instance.
 * @throws If SERVER_PRIVATE_KEY or WALLET_STORAGE_URL are missing in the environment.
 */
export async function getWallet(): Promise<WalletInterface> {
  const SERVER_PRIVATE_KEY = process.env.SERVER_PRIVATE_KEY
  const WALLET_STORAGE_URL = process.env.WALLET_STORAGE_URL
  const BSV_NETWORK = process.env.BSV_NETWORK as 'mainnet' | 'testnet'

  if (!SERVER_PRIVATE_KEY || !WALLET_STORAGE_URL) {
    throw new Error('Missing SERVER_PRIVATE_KEY or WALLET_STORAGE_URL in environment')
  }

  if (!walletInstance) {
    const chain = BSV_NETWORK === 'mainnet' ? 'main' : 'test'
    const keyDeriver = new CachedKeyDeriver(new PrivateKey(SERVER_PRIVATE_KEY, 'hex'))
    const storageManager = new WalletStorageManager(keyDeriver.identityKey)
    const signer = new WalletSigner(chain, keyDeriver, storageManager)
    const services = new Services(chain)
    const wallet = new Wallet(signer, services)

    const client = new StorageClient(wallet, WALLET_STORAGE_URL)
    await client.makeAvailable()
    await storageManager.addWalletStorageProvider(client)

    storageClientInstance = client
    return wallet
  }

  return walletInstance
}

/**
 * Retrieves the initialized StorageClient instance associated with the server wallet.
 * If not yet initialized, it calls `getWallet` to ensure proper setup first.
 *
 * @returns A promise resolving to the StorageClient instance.
 */
export async function getStorageClient(): Promise<StorageClient> {
  if (!storageClientInstance) await getWallet()
  return storageClientInstance!
}