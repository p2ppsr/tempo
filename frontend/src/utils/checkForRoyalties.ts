import { WalletClient, AuthFetch } from '@bsv/sdk'
import constants from './constants'

const checkForRoyalties = async () => {
  try {
    const wallet = new WalletClient('auto', 'localhost')
    const authFetch = new AuthFetch(wallet)

    const response = await authFetch.fetch(`${constants.keyServerURL}/checkForRoyalties`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    })

    if (!response.ok) {
      console.warn(`Royalties check failed: ${response.status} ${response.statusText}`)
      return { status: 'noUpdates' }
    }

    const result = await response.json()

    if (result.status === 'error') {
      console.warn(`Royalties check error: ${result.description} (code: ${result.code})`)
      return { status: 'noUpdates' }
    }

    if (result.status === 'noUpdates') {
      console.log(result.message)
      return { status: 'noUpdates' }
    }

    return {
      status: 'updatesAvailable',
      result: `${result.amount} satoshis received for song royalties!`,
      txid: result.transaction?.txid ?? 'unknown'
    }
  } catch (e) {
    console.error('checkForRoyalties error:', e)
    return { status: 'noUpdates' }
  }
}

export default checkForRoyalties
