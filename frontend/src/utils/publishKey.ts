import { Utils, SymmetricKey, AuthFetch, type WalletInterface } from '@bsv/sdk'
import constants from './constants'

interface PublishKeyParams {
  wallet: WalletInterface
  key: SymmetricKey
  songURL: string
}


const publishKey = async ({ wallet, key, songURL }: PublishKeyParams): Promise<void> => {
  try {
    const authFetch = new AuthFetch(wallet)

    // The BRC-103 authenticated request proves the publisher's identity. Avoid
    // separate signature/public-key calls that would create redundant prompts.
    const rawKey = key.toArray('be', 32)
    const base64Key = Utils.toBase64(rawKey)

    const payload = {
      songURL,
      key: base64Key
    }

    // Authenticated fetch
    const response = await authFetch.fetch(`${constants.keyServerURL}/publish`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`[publishKey] Server responded with status ${response.status}:`, errorText)
      throw new Error(`PublishKeyServerError: ${response.status}`)
    }

    const result = await response.json()
    if (result.status === 'error') {
      console.error('[publishKey] Server responded with application error:', result)
      const err = new Error(result.description)
      err.name = result.code || 'PublishKeyError'
      throw err
    }

  } catch (err) {
    console.error('[publishKey] Unhandled error:', err)
    throw err
  }
}

export default publishKey
