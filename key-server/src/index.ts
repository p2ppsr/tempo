import express, { Request, Response, NextFunction } from 'express'
import bodyParser from 'body-parser'
import dotenv from 'dotenv'
import crypto, { randomBytes } from 'crypto'
import prettyjson from 'prettyjson'
import { MongoClient } from 'mongodb'
import { getWallet } from './utils/walletSingleton.js'
import { KeyStorage } from './KeyStorage.js'
import { createAuthMiddleware } from '@bsv/auth-express-middleware'
import { createPaymentMiddleware } from '@bsv/payment-express-middleware'
import { P2PKH, PublicKey, PrivateKey, Hash } from '@bsv/sdk'
import { isValid } from './utils/decryptionValidator.js'

// Extend globalThis to include 'self'
declare global {
  // eslint-disable-next-line no-var
  var self: { crypto: typeof crypto }
}
globalThis.self = { crypto }
dotenv.config()

declare module 'express-serve-static-core' {
  interface Request {
    auth?: {
      identityKey: string
    }
  }
}

const PORT = process.env.HTTP_PORT || 3000
const SERVER_PRIVATE_KEY = process.env.SERVER_PRIVATE_KEY!
const MONGO_URI = process.env.MONGO_URI!
const DATABASE_NAME = process.env.MONGO_DB_NAME!
const SERVER_PUBLIC_KEY = new PrivateKey(SERVER_PRIVATE_KEY, 'hex').toPublicKey().toString()

const startServer = async () => {
  const app = express()

  app.use(bodyParser.json())
  app.use(bodyParser.urlencoded({ extended: true }))

  // CORS middleware
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*')
    res.header('Access-Control-Allow-Headers', '*')
    res.header('Access-Control-Allow-Methods', '*')
    res.header('Access-Control-Expose-Headers', '*')
    res.header('Access-Control-Allow-Private-Network', 'true')
    if (req.method === 'OPTIONS') {
      res.sendStatus(200)
    } else {
      next()
    }
  })

  // Logging middleware
  app.use((req: Request, res: Response, next: NextFunction) => {
    console.log(`[${req.method}] <- ${req.url}`)
    console.log(prettyjson.render(req.body || {}, { keysColor: 'blue' }))

    const originalJson = res.json.bind(res)
    res.json = (json: any) => {
      console.log(`[${req.method}] -> ${req.url}`)
      console.log(prettyjson.render(json, { keysColor: 'green' }))
      return originalJson(json)
    }
    next()
  })

  app.use(express.static('public'))

  const dbClient = new MongoClient(MONGO_URI)
  await dbClient.connect()
  console.log('Connected to MongoDB')

  const db = dbClient.db(DATABASE_NAME)
  const keyStorage = new KeyStorage(db)
  const wallet = await getWallet()

  app.use(createAuthMiddleware({
    wallet,
    allowUnauthenticated: false,
    logger: console,
    logLevel: undefined
  }))

  app.use(createPaymentMiddleware({
    wallet,
    calculateRequestPrice: async (req) => {
      try {
        if (!req.url.includes('/pay')) return 0

        const { songURL } = req.body as { songURL?: string }

        if (!songURL || typeof songURL !== 'string' || songURL.trim() === '') {
          console.warn('[Pricing] Invalid or missing songURL in request body')
          return 0
        }
        const record = await keyStorage.findKeyByFileUrl(songURL)
        if (!record) {
          console.warn('[Pricing] No record found for songURL:', songURL)
          return 0
        }
        return 1000
      } catch (err) {
        console.warn('[Pricing] Failed to calculate price:', err)
        return 0
      }
    }
  }))

  app.get('/checkForRoyalties', (req: Request, res: Response, next: NextFunction) => {
    (async () => {
      try {
        const identityKey = req.auth?.identityKey
        if (!identityKey) throw new Error('Missing identityKey')

        const unpaidRoyalties = await keyStorage.getUnpaidRoyalties()
        const myRoyalties = unpaidRoyalties.filter(
          r => r.artistIdentityKey === identityKey
        )

        const totalAmount = myRoyalties.reduce((sum, r) => sum + r.amount, 0)
        if (!myRoyalties.length || totalAmount === 0) {
          return res.status(200).json({
            status: 'noUpdates',
            message: 'There are no royalties to be paid. Check back soon!'
          })
        }

        const derivationPrefix = crypto.randomBytes(10).toString('base64')
        const derivationSuffix = crypto.randomBytes(10).toString('base64')

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
          outputs: [
            {
              satoshis: totalAmount,
              lockingScript,
              customInstructions: JSON.stringify({
                derivationPrefix,
                derivationSuffix,
                payee: identityKey
              }),
              outputDescription: 'Tempo Royalty Payment'
            }
          ],
          options: {
            randomizeOutputs: false
          }
        })

        if (!tx) throw new Error('Failed to create royalty transaction')

        await keyStorage.logOutgoingPayment({
          transaction: JSON.stringify(tx),
          derivationPrefix,
          derivationSuffix,
          amount: totalAmount,
          createdAt: new Date(),
          updatedAt: new Date()
        })

        for (const royalty of myRoyalties) {
          if (!royalty._id) continue
          await keyStorage.markRoyaltyPaid(
            royalty._id.toString(),
            `${derivationPrefix}:${derivationSuffix}`
          )
        }

        const senderKey = PrivateKey.fromHex(SERVER_PRIVATE_KEY).toPublicKey().toString()

        return res.status(200).json({
          status: 'Royalty payment sent!',
          tx,
          derivationPrefix,
          derivationSuffix,
          amount: totalAmount,
          senderIdentityKey: senderKey
        })
      } catch (e) {
        console.error('[Royalty Error]', e)
        return res.status(500).json({
          status: 'error',
          code: 'ERR_INTERNAL',
          description: 'An internal error has occurred.',
          detail: e instanceof Error ? e.message : String(e)
        })
      }
    })().catch(next)
  })

  app.post('/pay', (req: Request, res: Response, next: NextFunction) => {
    (async () => {
      try {
        const identityKey = req.auth?.identityKey
        if (!identityKey) {
          return res.status(401).json({
            status: 'error',
            code: 'ERR_NOT_AUTHENTICATED',
            description: 'Authentication required.'
          })
        }


        const { songURL } = req.body

        if (
          typeof songURL !== 'string' || songURL.trim() === ''
        ) {
          return res.status(400).json({
            status: 'error',
            code: 'ERR_INVALID_INPUT',
            description: 'Missing or malformed request parameters.'
          })
        }

        const key = await keyStorage.findKeyByFileUrl(songURL)
        if (!key) {
          return res.status(400).json({
            status: 'error',
            code: 'ERR_KEY_NOT_FOUND',
            description: 'Decryption key for specified song not found!'
          })
        }

        const orderID = randomBytes(32).toString('base64')
        const amount = 10000 // replace with dynamic pricing if needed later

        await keyStorage.insertInvoice({
          orderID,
          identityKey,
          amount,
          processed: false,
          createdAt: new Date(),
          updatedAt: new Date()
        })

        console.log(`[Pay] Invoice created: orderID=${orderID}, amount=${amount}`)

        await keyStorage.addRoyaltyRecord({
          keyID: key.encryptionKey,
          artistIdentityKey: key.artistIdentityKey!,
          amount: 1000,
          paid: false
        })

        return res.status(200).json({
          status: 'Key successfully purchased!',
          result: key.encryptionKey
        })

      } catch (e) {
        console.error('[Pay Error]', e)
        return res.status(500).json({
          status: 'error',
          code: 'ERR_INTERNAL',
          description: 'An internal error has occurred.'
        })
      }
    })().catch(next)
  })

  app.post('/publish', (req: Request, res: Response, next: NextFunction) => {
    (async () => {
      try {
        const { songURL, key } = req.body
        const identityKey = req.auth?.identityKey

        if (!identityKey) {
          console.warn('[KeyServer] Missing identityKey in authenticated request!')
          return res.status(403).json({
            status: 'error',
            code: 'ERR_MISSING_IDENTITY',
            description: 'Authenticated identity key is missing from request.'
          })
        }

        if (
          typeof songURL !== 'string' || songURL.trim() === '' ||
          typeof key !== 'string' || key.trim() === ''
        ) {
          return res.status(400).json({
            status: 'error',
            code: 'ERR_INVALID_PARAMS',
            description: 'Must provide valid songURL and key.'
          })
        }

        if (key.length !== 44) {
          return res.status(400).json({
            status: 'error',
            code: 'ERR_INVALID_KEY_FORMAT',
            description: 'Decryption key must be 32 bytes (base64-encoded).'
          })
        }

        const existing = await keyStorage.findKeyByFileUrl(songURL)
        if (existing) {
          return res.status(400).json({
            status: 'error',
            code: 'ERR_DUPLICATE_DECRYPTION_KEY',
            description: 'Key already published to key server.'
          })
        }

        const valid = await isValid(songURL, key)
        if (!valid) {
          return res.status(400).json({
            status: 'error',
            code: 'ERR_INVALID_DECRYPTION_KEY',
            description: 'Failed to validate decryption key.'
          })
        }

        await keyStorage.storeKeyRecord(
          songURL,
          key,
          0, // placeholder satoshis
          'n/a', // placeholder public key
          identityKey
        )

        console.log('[KeyServer] Successfully stored key for song:', songURL)

        return res.status(200).json({
          status: 'Key successfully published!'
        })
      } catch (err: any) {
        console.error('[KeyServer] Internal error in /publish:', err?.stack || err?.message || err)
        return res.status(500).json({
          status: 'error',
          code: 'ERR_INTERNAL',
          description: 'An internal error has occurred.'
        })
      }
    })().catch(next)
  })

  app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`)
  })
}

startServer()
