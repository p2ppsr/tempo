import { SymmetricKey, Utils } from '@bsv/sdk'
import { getStorageClient } from './walletSingleton'

export async function isValid(songURL: string, key: string): Promise<boolean> {
  if (!songURL || !key) return false

  for (let attempt = 1; attempt <= 5; attempt++) {
    try {
      const storage = await getStorageClient()

      // Download encrypted file
      const encryptedData = await storage.downloadFile(songURL)

      // Decode base64 key to Uint8Array
      const keyBytes = Utils.toArray(key, 'base64')
      const symKey = new SymmetricKey(keyBytes)

      // Decrypt
      const decrypted = await symKey.decrypt(Array.from(encryptedData))

      // Sanity check
      if (typeof decrypted === 'string') {
        console.log('Decrypted data is a string:', decrypted)
      } else {
        console.log('Decrypted data is a byte array:', decrypted)
      }

      const nonZeroBytes =
        Array.isArray(decrypted) && decrypted.some(b => b !== 0)

      if (decrypted.length > 0 && nonZeroBytes) return true

    } catch (err) {
      console.error(`[Attempt ${attempt}] Decryption failed:`, err)
      await new Promise(resolve => setTimeout(resolve, 5000))
    }
  }

  return false
}
