import { Request, Response } from 'express'
import knexfile from '../../knexfile'
import knexModule from 'knex'
import { WalletClient, Hash } from '@bsv/sdk'
import type { RouteDefinition } from '../types/routes'
import type { TransactionPayload, PaymentOutput } from '../types/transaction.js'

// 🔧 Resolve environment key for knex config
const environment =
  process.env.NODE_ENV === 'staging' || process.env.NODE_ENV === 'production'
    ? 'staging'
    : 'development'

const knex = knexModule(knexfile[environment])
const wallet = new WalletClient()

const payRoute: RouteDefinition = {
  type: 'post',
  path: '/pay',
  summary: 'Submit proof of payment for a song decryption key',
  parameters: {
    songURL: 'The URL of the song associated with the orderID',
    orderID: 'abc',
    transaction: 'Transaction envelope (rawTx, mapiResponses, inputs, proof), including outputs',
    'transaction.outputs': 'Each includes vout, satoshis, derivationPrefix(optional), derivationSuffix',
    derivationPrefix: 'Global derivation prefix for the payment'
  },
  exampleResponse: {
    status: 'Key successfully purchased!',
    result: 'decryptionKeyHere'
  },
  func: async (req: Request, res: Response) => {
    try {
      const identityKey = (req as any).authrite?.identityKey
      if (!identityKey) throw new Error('Missing identityKey from Authrite')

      const tx: TransactionPayload = req.body.transaction
      const { songURL, orderID } = req.body

      if (
        typeof songURL !== 'string' || songURL.trim() === '' ||
        typeof orderID !== 'string' || orderID.trim() === '' ||
        !tx || typeof tx.rawTx !== 'string' ||
        !Array.isArray(tx.outputs)
      ) {
        return res.status(400).json({
          status: 'error',
          code: 'ERR_INVALID_INPUT',
          description: 'Missing or malformed request parameters.'
        })
      }

      // Annotate each output with sender's identity
      tx.outputs = tx.outputs.map((output: PaymentOutput) => ({
        ...output,
        senderIdentityKey: identityKey
      }))

      // Lookup decryption key
      const [key] = await knex('key')
        .where({ songURL })
        .select('value', 'keyID', 'artistIdentityKey')

      if (!key) {
        return res.status(400).json({
          status: 'error',
          code: 'ERR_KEY_NOT_FOUND',
          description: 'Decryption key for specified song not found!'
        })
      }

      // Find matching invoice
      const [invoice] = await knex('invoice')
        .where({
          keyID: key.keyID,
          identityKey,
          orderID
        })

      if (!invoice) {
        return res.status(400).json({
          status: 'error',
          code: 'ERR_INVOICE_NOT_FOUND',
          description: 'Invoice not found for specified purchase!'
        })
      }

      // Generate a reference from rawTx hash
      const reference = Hash.sha256(tx.rawTx, 'hex')
        .map(byte => byte.toString(16).padStart(2, '0'))
        .join('')

      // Mark invoice as processed
      await knex('invoice')
        .where({
          keyID: key.keyID,
          identityKey,
          orderID,
          processed: false
        })
        .update({
          referenceNumber: reference,
          processed: true
        })

      // Register royalty payout record
      await knex('royalty').insert({
        created_at: new Date(),
        updated_at: new Date(),
        keyID: key.keyID,
        artistIdentityKey: key.artistIdentityKey,
        amount: Math.floor(invoice.amount * 0.97),
        paid: false
      })

      return res.status(200).json({
        status: 'Key successfully purchased!',
        result: key.value
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

export default payRoute
