import { Request, Response } from 'express'
import knexConfig from '../../knexfile'
import knexModule from 'knex'
import { WalletClient, Hash } from '@bsv/sdk'
import type { RouteDefinition } from '../types/routes'

const knex = knexModule(
  process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'staging'
    ? knexConfig.production
    : knexConfig.development
)

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

      // Find decryption key
      const [key] = await knex('key')
        .where({ songURL: req.body.songURL })
        .select('value', 'keyID', 'artistIdentityKey')

      if (!key) {
        return res.status(400).json({
          status: 'error',
          code: 'ERR_KEY_NOT_FOUND',
          description: 'Decryption key for specified song not found!'
        })
      }

      // Find invoice
      const [invoice] = await knex('invoice')
        .where({
          keyID: key.keyID,
          identityKey,
          orderID: req.body.orderID
        })

      if (!invoice) {
        return res.status(400).json({
          status: 'error',
          code: 'ERR_INVOICE_NOT_FOUND',
          description: 'Invoice not found for specified purchase!'
        })
      }

      // Attach senderIdentityKey to each output
      req.body.transaction.outputs = req.body.transaction.outputs.map((output: any) => ({
        ...output,
        senderIdentityKey: identityKey
      }))

      // Placeholder: Verify the transaction manually
      // Replace this with actual validation logic appropriate to your project
      const rawTx = req.body.transaction.rawTx
      if (!rawTx || typeof rawTx !== 'string') {
        return res.status(400).json({
          status: 'error',
          code: 'ERR_PAYMENT_INVALID',
          description: 'Missing or invalid rawTx.'
        })
      }

      // OPTIONAL: You may decode and inspect the rawTx using:
      // const tx = await wallet.decodeTransaction({ rawTx })

      // Simulate success
      const processedTransaction = {
        reference: Hash.sha256(rawTx, 'hex')
          .map(byte => byte.toString(16).padStart(2, '0'))
          .join('')
      }

      // Update invoice
      await knex('invoice')
        .where({
          keyID: key.keyID,
          identityKey,
          orderID: req.body.orderID,
          processed: false
        })
        .update({
          referenceNumber: processedTransaction.reference,
          processed: true
        })

      // Record royalty entry
      await knex('royalty').insert({
        created_at: new Date(),
        updated_at: new Date(),
        keyID: key.keyID,
        artistIdentityKey: key.artistIdentityKey,
        amount: invoice.amount * 0.97,
        paid: false
      })

      // Return decryption key
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
