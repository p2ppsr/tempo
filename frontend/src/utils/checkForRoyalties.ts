import { WalletClient, AuthFetch, type AtomicBEEF } from '@bsv/sdk'
import constants from './constants'
import { toast } from 'react-toastify'

interface RoyaltyResponse {
  status: string
  tx?: AtomicBEEF
  derivationPrefix?: string
  derivationSuffix?: string
  amount?: number
  senderIdentityKey?: string
  message?: string
  description?: string
  code?: string
}

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
      return
    }

    const result: RoyaltyResponse = await response.json()

    if (result.status === 'error') {
      console.warn(`Royalties check error: ${result.description} (code: ${result.code})`)
      return
    }

    if (result.status === 'noUpdates') {
      console.log(result.message)
      return
    }

    // Internalize the transaction if we have one
    if (result.tx && result.derivationPrefix && result.derivationSuffix && result.senderIdentityKey) {
      await wallet.internalizeAction({
        tx: result.tx,
        outputs: [
          {
            outputIndex: 0, // Assuming the royalty payment is the first output
            protocol: 'wallet payment',
            paymentRemittance: {
              derivationPrefix: result.derivationPrefix,
              derivationSuffix: result.derivationSuffix,
              senderIdentityKey: result.senderIdentityKey
            }
          }
        ],
        description: 'Received song royalty payment'
      })
    }
    toast.success(`${result.amount} satoshis received for song royalties!`, {
      containerId: 'alertToast'
    })
  } catch (e) {
    console.error('checkForRoyalties error:', e)
  }
}

export default checkForRoyalties
