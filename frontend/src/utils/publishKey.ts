import { WalletClient, Utils, Hash, SymmetricKey, AuthFetch } from '@bsv/sdk'
import constants from './constants'

interface PublishKeyParams {
  wallet: WalletClient
  key: SymmetricKey
  songURL: string
}


const publishKey = async ({ wallet, key, songURL }: PublishKeyParams): Promise<void> => {
  try {
    const authFetch = new AuthFetch(wallet)

    // Prepare key & signature
    const rawKey = key.toArray('be', 32)
    const base64Key = Utils.toBase64(rawKey)
    const message = JSON.stringify({ songURL, key: base64Key })
    const hash = Hash.sha256(Utils.toArray(message, 'utf8'))

    const { signature } = await wallet.createSignature({
      hashToDirectlySign: hash,
      protocolID: [1, 'tempo'],
      keyID: 'signing-key',
      counterparty: 'self'
    })

    await wallet.getPublicKey({ identityKey: true })

    const { publicKey } = await wallet.getPublicKey({
      protocolID: [1, 'tempo'],
      keyID: 'signing-key',
      counterparty: 'self'
    })

    const payload = {
      songURL,
      key: base64Key,
      signature: Utils.toHex(signature),
      publicKey
    }

    console.log('[publishKey] Sending payload to key server:', payload)

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

    console.log('[publishKey] Key successfully published')
  } catch (err) {
    console.error('[publishKey] Unhandled error:', err)
    throw err
  }
}

export default publishKey
