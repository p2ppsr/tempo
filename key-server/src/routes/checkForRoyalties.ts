import { Request, Response } from 'express'
import { randomBytes } from 'crypto'
import { PrivateKey, PublicKey, P2PKH } from '@bsv/sdk'
import knexConfig from '../../knexfile'
import knexModule from 'knex'
import { getWallet } from '../utils/walletSingleton'
import type { RouteDefinition } from '../types/routes'

const env = process.env.NODE_ENV ?? 'development'
const knex = knexModule(knexConfig[env])

const checkForRoyaltiesRoute: RouteDefinition = {
  type: 'get',
  path: '/checkForRoyalties',
  summary: 'Check for royalty payments for your published songs.',
  parameters: {},
  exampleResponse: {
    status: 'Royalty payment sent!',
    transaction: {
      txid: '...',
      mapiResponses: {},
      note: 'The transaction has been processed and broadcast.',
      amount: 100,
      inputs: []
    },
    derivationPrefix: '...',
    derivationSuffix: '...',
    amount: 85,
    senderIdentityKey: '04...'
  },
  func: async (req: Request, res: Response) => {
    try {
      const identityKey = (req as any).authrite?.identityKey
      if (!identityKey) throw new Error('Missing identityKey in Authrite context')

      const royalties = await knex('royalty')
        .where({ artistIdentityKey: identityKey, paid: false })
        .select('keyID', 'amount', 'paid')

      const totalAmount = royalties.reduce((sum, r) => sum + r.amount, 0)
      if (!royalties.length || totalAmount === 0) {
        return res.status(200).json({
          status: 'noUpdates',
          message: 'There are no royalties to be paid. Check back soon!'
        })
      }

      const derivationPrefix = randomBytes(10).toString('base64')
      const derivationSuffix = randomBytes(10).toString('base64')

      const wallet = await getWallet()
      const { publicKey: derivedPubKey } = await wallet.getPublicKey({
        protocolID: [2, '3241645161d8'],
        keyID: `${derivationPrefix} ${derivationSuffix}`,
        counterparty: identityKey
      })

      const lockingScript = new P2PKH()
        .lock(PublicKey.fromString(derivedPubKey).toAddress())
        .toHex()

      const { tx } = await wallet.createAction({
        description: 'Tempo Royalty Payment',
        outputs: [{
          satoshis: totalAmount,
          lockingScript,
          customInstructions: JSON.stringify({
            derivationPrefix,
            derivationSuffix,
            payee: identityKey
          }),
          outputDescription: 'Tempo Royalty Payment'
        }],
        options: {
          randomizeOutputs: false
        }
      })

      await knex('outgoingRoyaltyPayment').insert({
        transaction: JSON.stringify(tx),
        derivationPrefix,
        derivationSuffix,
        amount: totalAmount,
        created_at: new Date(),
        updated_at: new Date()
      })

      const [outgoingRoyaltyPayment] = await knex('outgoingRoyaltyPayment')
        .where({ derivationPrefix, derivationSuffix, amount: totalAmount })
        .select('Id')

      await knex('royalty')
        .where({ artistIdentityKey: identityKey, paid: false })
        .update({
          paymentId: outgoingRoyaltyPayment.Id,
          paid: true,
          updated_at: new Date()
        })

      const SERVER_PRIVATE_KEY = process.env.SERVER_PRIVATE_KEY
      if (!SERVER_PRIVATE_KEY) throw new Error('Missing SERVER_PRIVATE_KEY in .env')

      return res.status(200).json({
        status: 'Royalty payment sent!',
        transaction: {
          ...tx,
          note: 'The transaction has been processed and broadcast.'
        },
        derivationPrefix,
        derivationSuffix,
        amount: totalAmount,
        senderIdentityKey: PrivateKey.fromHex(SERVER_PRIVATE_KEY).toPublicKey().toString()
      })
    } catch (e) {
      console.error(e)
      return res.status(500).json({
        status: 'error',
        code: 'ERR_INTERNAL',
        description: 'An internal error has occurred.',
        detail: e instanceof Error ? e.message : String(e)
      })
    }
  }
}

export default checkForRoyaltiesRoute
