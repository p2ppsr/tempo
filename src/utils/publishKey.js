import { Authrite } from 'authrite-js'
import constants from './constants'

export default async ({ key, songURL }) => {
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
  const result = (JSON.parse(Buffer.from(response.body).toString('utf8')))
  if (result.status === 'error') {
    const e = new Error(result.description)
    e.code = result.code
    throw e
  }
}
