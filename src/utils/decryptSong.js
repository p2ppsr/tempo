import { Authrite } from 'authrite-js'
import paymail from 'paymail'
import { decrypt } from '@cwi/crypto'
import { toast } from 'react-toastify'

const KEY_SERVER_BASE_URL = 'http://localhost:8080'

export default async (baseURL, songURL) => {
  const response = await fetch(
    baseURL + songURL
  )
  const encryptedData = await response.arrayBuffer()

  // Get purchcase invoice from key-server recipient
  const invoiceResponse = await new Authrite().request('http://localhost:8080/invoice', {
    body: {
      songURL
    },
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    }
  })
  toast.success('Loading song...')
  const invoice = (JSON.parse(Buffer.from(invoiceResponse.body).toString('utf8')))
  // Make a payment and get the returned reference number
  const payment = await paymail.send({
    recipient: invoice.paymail,
    amount: invoice.amount,
    description: `Here is payment for the song: ${songURL}`
  })
  // Send the recipient proof of payment
  const purchasedKey = await new Authrite().request(`${KEY_SERVER_BASE_URL}/pay`, {
    body: {
      songURL,
      referenceNumber: payment.reference,
      paymail: invoice.paymail
    },
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    }
  })
  // Parse out the decryption key and decrypt the song data
  const key = (JSON.parse(Buffer.from(purchasedKey.body).toString('utf8'))).result
  const keyAsBuffer = Buffer.from(key, 'base64')
  const decryptionKey = await window.crypto.subtle.importKey(
    'raw',
    Uint8Array.from(keyAsBuffer),
    {
      name: 'AES-GCM'
    },
    true,
    ['decrypt']
  )
  const decryptedData = await decrypt(new Uint8Array(encryptedData), decryptionKey, 'Uint8Array')
  const dataBlob = new Blob([decryptedData])
  return URL.createObjectURL(dataBlob)
}
