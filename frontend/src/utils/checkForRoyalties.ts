import { WalletClient, AuthFetch } from '@bsv/sdk'
import constants from './constants'

const checkForRoyalties = async () => {
  const wallet = new WalletClient('auto', 'localhost')
  const authFetch = new AuthFetch(wallet)

  const response = await authFetch.fetch(`${constants.keyServerURL}/checkForRoyalties`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    }
  })

  if (!response.ok) {
    throw new Error(`Network error: ${response.status} ${response.statusText}`)
  }

  const result = await response.json()

  if (result.status === 'error') {
    throw new Error(`${result.description} (code: ${result.code})`)
  }

  if (result.status === 'There are no royalties to be paid. Check back soon!') {
    return {
      status: 'noUpdates'
    }
  }

  // Server already handled the payment. Just confirm and notify the user.
  return {
    status: 'updatesAvailable',
    result: `${result.amount} satoshis received for song royalties!`,
    txid: result.transaction?.txid ?? 'unknown'
  }
}

export default checkForRoyalties
