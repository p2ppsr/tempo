import { submitDirectTransaction } from '@babbage/sdk'
import { Authrite } from 'authrite-js'
import constants from './constants'
export default async () => {
  const response = await new Authrite().request(
    `${constants.keyServerURL}/checkForRoyalties`, {
    method: 'GET',
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
  if (result.status === 'There are no royalties to be paid. Check back soon!') {
    // No royalties to be paid
    return {
      status: 'noUpdates'
    }
  }

  // Process the transaction
  const processedTx = await submitDirectTransaction({
    protocol: '3241645161d8',
    transaction: { 
      ...result.transaction,
      outputs: [{
        vout: 0,
        satoshis: result.amount,
        derivationSuffix: result.derivationSuffix
      }]
    },
    senderIdentityKey: result.senderIdentityKey,
    note: 'Payment for song royalties',
    derivationPrefix: result.derivationPrefix,
    amount: result.amount
  })
  return {
    status: 'updatesAvailable',
    result: `${result.amount} satoshis recieved for song royalties!`
  }
}