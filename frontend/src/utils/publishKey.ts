import { WalletClient, Utils, Hash, SymmetricKey, AuthFetch } from '@bsv/sdk'
import constants from './constants'

const wallet = new WalletClient('json-api', 'auto')
const authFetch = new AuthFetch(wallet)

interface PublishKeyParams {
  key: SymmetricKey
  songURL: string
}

const publishKey = async ({ key, songURL }: PublishKeyParams): Promise<void> => {
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

  const response = await authFetch.fetch(`${constants.keyServerURL}/publish`, {
    method: 'POST',
    body: {
      songURL,
      key: base64Key,
      signature: Utils.toHex(signature),
      publicKey
    }
  })

  const result = await response.json()
  if (result.status === 'error') {
    const err = new Error(result.description)
    err.name = result.code || 'PublishKeyError'
    throw err
  }
}

export default publishKey
