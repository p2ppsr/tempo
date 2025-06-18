import { Request, Response } from 'express'
import { randomBytes } from 'crypto'
import knexConfig from '../../knexfile'
import knexModule from 'knex'
import { PrivateKey } from '@bsv/sdk'
import type { RouteDefinition } from '../types/routes'

const env = process.env.NODE_ENV ?? 'development'
const knex = knexModule(knexConfig[env])

const AMOUNT = 10000
const SERVER_PRIVATE_KEY = process.env.SERVER_PRIVATE_KEY!
const SERVER_PUBLIC_KEY = new PrivateKey(SERVER_PRIVATE_KEY, 'hex')
  .toPublicKey()
  .toString()

const invoiceRoute: RouteDefinition = {
  type: 'post',
  path: '/invoice',
  summary: 'Requests an invoice for purchasing a song',
  parameters: {
    songURL: 'abc'
  },
  exampleResponse: {
    status: 'success',
    amount: 1337,
    identityKey: 'adfsfdf',
    orderID: 'asdfldsf=s=sfsd'
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

      const { songURL } = req.body
      if (typeof songURL !== 'string' || songURL.trim() === '') {
        return res.status(400).json({
          status: 'error',
          code: 'ERR_INVALID_INPUT',
          description: 'Missing or invalid songURL.'
        })
      }

      const [key] = await knex('key')
        .where({ songURL })
        .select('keyID')

      if (!key) {
        return res.status(400).json({
          status: 'error',
          code: 'ERR_KEY_NOT_FOUND',
          description: 'Decryption key for specified song not found!'
        })
      }

      const orderID = randomBytes(32).toString('base64')
      await knex('invoice').insert({
        orderID,
        keyID: key.keyID,
        identityKey,
        amount: AMOUNT,
        processed: false
      })

      return res.status(200).json({
        status: 'success',
        identityKey: SERVER_PUBLIC_KEY,
        amount: AMOUNT,
        orderID
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

export default invoiceRoute
