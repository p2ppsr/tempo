import { SymmetricKey, Utils } from '@bsv/sdk'
import { getStorageClient } from './walletSingleton'

/**
 * Validates that a song can be successfully decrypted with the given symmetric key.
 * Returns true if decryption yields non-zero data.
 */
export async function isValid(songURL: string, key: string): Promise<boolean> {
  if (!songURL || !key) return false

  for (let attempt = 1; attempt <= 5; attempt++) {
    try {
      const storage = await getStorageClient()

      // Download encrypted song file
      const encryptedData = await storage.downloadFile(songURL)
      if (!(encryptedData instanceof Uint8Array)) {
        throw new Error('Downloaded data is not a Uint8Array')
      }

      // Decode key and initialize symmetric key
      const keyBytes = Utils.toArray(key, 'base64')
      const symKey = new SymmetricKey(keyBytes)

      // Decrypt and sanity check
      const decrypted = await symKey.decrypt([...encryptedData])

      if (Array.isArray(decrypted)) {
        const hasNonZero = decrypted.some(b => b !== 0)
        if (decrypted.length > 0 && hasNonZero) return true
      } else if (typeof decrypted === 'string') {
        // If string is returned, ensure it's not empty/whitespace
        if (decrypted.trim().length > 0) return true
      }

    } catch (err) {
      console.error(`[Attempt ${attempt}] Decryption failed:`, err)
      await new Promise(resolve => setTimeout(resolve, 5000))
    }
  }

  return false
}
