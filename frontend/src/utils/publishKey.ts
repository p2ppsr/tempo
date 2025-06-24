import { WalletClient, Utils, Hash, SymmetricKey, AuthFetch } from '@bsv/sdk'
import constants from './constants'

const wallet = new WalletClient('json-api', 'auto')
const authFetch = new AuthFetch(wallet)

interface PublishKeyParams {
  key: SymmetricKey
  songURL: string
}

const publishKey = async ({ key, songURL }: PublishKeyParams): Promise<void> => {
  try {
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

    let response
    try {
      response = await authFetch.fetch(`${constants.keyServerURL}/publish`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })
    } catch (fetchErr) {
      console.error('[publishKey] Network error while contacting key server:', fetchErr)
      throw new Error('PublishKeyNetworkError')
    }

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`[publishKey] Server responded with status ${response.status}:`, errorText)
      throw new Error(`PublishKeyServerError: ${response.status}`)
    }

    let result
    try {
      result = await response.json()
    } catch (parseErr) {
      const errorText = await response.text()
      console.error('[publishKey] Failed to parse JSON response from server:', errorText)
      throw new Error('PublishKeyParseError')
    }

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
