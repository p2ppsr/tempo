import { SymmetricKey, Utils, StorageDownloader } from '@bsv/sdk'

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
