import { Request, Response } from 'express'
import { Hash } from '@bsv/sdk'
import type { RouteDefinition } from '../types/routes.js'
import type { KeyStorage } from '../KeyStorage.js'
import type { WalletInterface } from '@bsv/sdk'

export default function payRoute(
  keyStorage: KeyStorage,
  wallet: WalletInterface
): RouteDefinition {
  return {
    type: 'post',
    path: '/pay',
    summary: 'Submit proof of payment for a song decryption key',
    parameters: {
      songURL: 'The URL of the song associated with the orderID',
      orderID: 'The order ID for the song purchase',
      transaction: 'Full transaction as a raw hex string'
    },
    exampleResponse: {
      status: 'Key successfully purchased!',
      result: 'decryptionKeyHere'
    },
    func: async (req: Request, res: Response) => {
      try {
        const identityKey = (req as any).authrite?.identityKey
        if (!identityKey) {
          return res.status(401).json({
            status: 'error',
            code: 'ERR_NOT_AUTHENTICATED',
            description: 'Authentication required.'
          })
        }

        const { songURL, orderID, rawTx } = req.body

        if (
          typeof songURL !== 'string' || songURL.trim() === '' ||
          typeof orderID !== 'string' || orderID.trim() === '' ||
          typeof rawTx !== 'string' || !/^[0-9a-fA-F]+$/.test(rawTx)
        ) {
          return res.status(400).json({
            status: 'error',
            code: 'ERR_INVALID_INPUT',
            description: 'Missing or malformed request parameters.'
          })
        }

        // 🔍 Look up key by song URL
        const key = await keyStorage.findKeyByFileUrl(songURL)
        if (!key) {
          return res.status(400).json({
            status: 'error',
            code: 'ERR_KEY_NOT_FOUND',
            description: 'Decryption key for specified song not found!'
          })
        }

        // 🔍 Look up invoice
        const invoice = await keyStorage.findInvoice(identityKey, key.encryptionKey, orderID)
        if (!invoice) {
          return res.status(400).json({
            status: 'error',
            code: 'ERR_INVOICE_NOT_FOUND',
            description: 'Invoice not found for specified purchase!'
          })
        }

        // 🧾 Generate reference from rawTx
        const reference = Hash.sha256(rawTx, 'hex')
          .map(b => b.toString(16).padStart(2, '0'))
          .join('')

        // ✅ Mark invoice processed
        await keyStorage.markInvoiceProcessed({
          keyID: key.encryptionKey,
          identityKey,
          orderID,
          referenceNumber: reference
        })

        // 💸 Register royalty
        await keyStorage.addRoyaltyRecord({
          keyID: key.encryptionKey,
          artistIdentityKey: key.artistIdentityKey!,
          amount: Math.floor(invoice.amount * 0.97),
          paid: false
        })

        return res.status(200).json({
          status: 'Key successfully purchased!',
          result: key.encryptionKey
        })

      } catch (e) {
        console.error(e)
        return res.status(500).json({
          status: 'error',
          code: 'ERR_INTERNAL',
          description: 'An internal error has occurred.'
        })
      }
    }
  }
}
