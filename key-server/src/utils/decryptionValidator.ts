/**
 * @file decryptionValidator.ts
 * @description
 * Provides a utility function `isValid` to verify whether a given symmetric key
 * correctly decrypts the encrypted file retrieved from a UHRP storage URL.
 * Attempts resolution and decryption up to 5 times with retries.
 */

import { SymmetricKey, Utils, StorageDownloader } from '@bsv/sdk'

/**
 * Checks if the provided symmetric key can successfully decrypt the file
 * at the specified songURL. This is used to validate that the buyer has
 * the correct key to access the purchased song.
 *
 * Retries up to 5 times to handle temporary network or resolution errors.
 *
 * @param songURL - The UHRP URL of the encrypted file to validate.
 * @param key - The symmetric key in base64 encoding to attempt decryption with.
 * @returns A promise resolving to true if decryption yields non-empty content, or false otherwise.
 */
export async function isValid(songURL: string, key: string): Promise<boolean> {
  if (!songURL || !key) return false

  const storageDownloader = new StorageDownloader()

  for (let attempt = 1; attempt <= 5; attempt++) {
    try {
      console.log(`[Attempt ${attempt}] Resolving URL:`, songURL)
      const resolvedUrl = await storageDownloader.resolve(songURL)
      if (!resolvedUrl || resolvedUrl.length === 0) {
        throw new Error('File URL could not be resolved')
      }

      const uhrpFile = await storageDownloader.download(songURL)
      const encryptedDataArray = uhrpFile?.data
      if (!encryptedDataArray || encryptedDataArray.length === 0) {
        throw new Error('Downloaded file is empty or invalid')
      }

      const keyBytes = Utils.toArray(key, 'base64')
      const symKey = new SymmetricKey(keyBytes)
      const decrypted = await symKey.decrypt([...encryptedDataArray])

      if (Array.isArray(decrypted)) {
        const hasNonZero = decrypted.some(b => b !== 0)
        if (decrypted.length > 0 && hasNonZero) return true
      } else if (typeof decrypted === 'string' && decrypted.trim().length > 0) {
        return true
      }

      throw new Error('Decryption yielded empty or invalid result')
    } catch (err) {
      console.error(`[Attempt ${attempt}] Decryption failed:`, err)
      await new Promise(resolve => setTimeout(resolve, 5000))
    }
  }

  return false
}
