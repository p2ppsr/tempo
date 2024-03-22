import { Authrite } from 'authrite-js'
import constants from './constants'

interface PublishKeyParams {
  key: CryptoKey
  songURL: string
}

// interface PublishKeyResult {
//   status: string;
//   description?: string;
//   code?: string;
// }

const publishKey = async ({ key, songURL }: PublishKeyParams): Promise<void> => {
  // Export encryption key to store on the keyServer
  const decryptionKey = await window.crypto.subtle.exportKey('raw', key)
  const response = await new Authrite().request(`${constants.keyServerURL}/publish`, {
    body: {
      songURL,
      key: Buffer.from(decryptionKey).toString('base64')
    },
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    }
  })
  const result = JSON.parse(Buffer.from(response.body).toString('utf8'))
  if (result.status === 'error') {
    const e = new Error(result.description)
    e.name = result.code
    throw e
  }
}

export default publishKey
