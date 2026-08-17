import { LocalKVStore } from '@bsv/sdk'
import { getInteractiveWallet } from './wallet'
import { parseLibraryDocument, type LibraryDocument } from './libraryStorage'

export const TEMPO_LIBRARY_CONTEXT = 'tempo library'
export const TEMPO_LIBRARY_KEY = 'library-v1'

let walletStore: LocalKVStore | null = null

const getWalletStore = (): LocalKVStore => {
  if (!walletStore) {
    walletStore = new LocalKVStore(getInteractiveWallet(), TEMPO_LIBRARY_CONTEXT, true)
  }
  return walletStore
}

export const readWalletLibrary = async (): Promise<LibraryDocument | null> => {
  const value = await getWalletStore().get(TEMPO_LIBRARY_KEY)
  return parseLibraryDocument(value)
}

export const writeWalletLibrary = async (document: LibraryDocument): Promise<void> => {
  await getWalletStore().set(TEMPO_LIBRARY_KEY, JSON.stringify(document))
}

export const resetWalletLibraryForTests = (): void => {
  walletStore = null
}
