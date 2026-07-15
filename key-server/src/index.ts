import express, { Request, Response, NextFunction, RequestHandler } from 'express'
import dotenv from 'dotenv'
import crypto, { randomBytes } from 'crypto'
import { MongoClient, Db } from 'mongodb'
import { getChaintracksHeight, getWallet } from './utils/walletSingleton.js'
import { KeyStorage } from './KeyStorage.js'
import { MongoAuthSessionManager } from './MongoAuthSessionManager.js'
import { createAuthMiddleware } from '@bsv/auth-express-middleware'
import { createPaymentMiddleware } from '@bsv/payment-express-middleware'
import { P2PKH, PublicKey, PrivateKey, WalletInterface } from '@bsv/sdk'
import { isValid } from './utils/decryptionValidator.js'

declare global {
  // eslint-disable-next-line no-var
  var self: { crypto: typeof crypto }
}
globalThis.self = { crypto }
dotenv.config()

declare module 'express-serve-static-core' {
  interface Request {
    auth?: { identityKey: string }
    requestId?: string
  }
}

const PORT = Number(process.env.HTTP_PORT || 3000)
const SERVER_PRIVATE_KEY = process.env.SERVER_PRIVATE_KEY || ''
const MONGO_URI = process.env.MONGO_URI || ''
const DATABASE_NAME = process.env.MONGO_DB_NAME || ''
const SONG_PRICE_SATOSHIS = Number(process.env.SONG_PRICE_SATOSHIS || 1000)
const RETRY_DELAY_MS = Number(process.env.DEPENDENCY_RETRY_MS || 15_000)

type RuntimeDependencies = {
  dbClient: MongoClient
  db: Db
  keyStorage: KeyStorage
  wallet: WalletInterface
  authMiddleware: RequestHandler
  paymentMiddleware: RequestHandler
}

const counters = new Map<string, number>()
const increment = (name: string, labels = '') => {
  const key = labels ? `${name}{${labels}}` : name
  counters.set(key, (counters.get(key) || 0) + 1)
}

let dependencies: RuntimeDependencies | null = null
let lastDependencyError = 'initializing'
let initializedAt: string | null = null
let shuttingDown = false

const publicPaths = new Set(['/healthz', '/readyz', '/metrics', '/availability'])

function safePath(req: Request): string {
  if (req.path === '/pay' || req.path === '/publish' || req.path === '/checkForRoyalties') {
    return req.path
  }
  if (publicPaths.has(req.path)) return req.path
  return 'other'
}

async function initializeDependencies(): Promise<void> {
  if (!SERVER_PRIVATE_KEY || !MONGO_URI || !DATABASE_NAME) {
    throw new Error('Missing required key-server configuration')
  }

  const dbClient = new MongoClient(MONGO_URI, {
    serverSelectionTimeoutMS: 10_000
  })

  try {
    await dbClient.connect()
    const db = dbClient.db(DATABASE_NAME)
    await db.command({ ping: 1 })

    const keyStorage = new KeyStorage(db)
    const wallet = await getWallet()
    await getChaintracksHeight()
    const authSessionManager = new MongoAuthSessionManager(db.collection('authSessions'))
    await authSessionManager.initialize()

    const authMiddleware = createAuthMiddleware({
      wallet,
      sessionManager: authSessionManager,
      allowUnauthenticated: false,
      logger: console,
      logLevel: 'warn'
    }) as RequestHandler

    const paymentMiddleware = createPaymentMiddleware({
      wallet,
      calculateRequestPrice: async (req) => {
        if (!req.url.includes('/pay')) return 0
        const songURL = (req.body as { songURL?: unknown })?.songURL
        if (typeof songURL !== 'string' || songURL.trim() === '') return 0
        return await keyStorage.findKeyByFileUrl(songURL) ? SONG_PRICE_SATOSHIS : 0
      }
    }) as RequestHandler

    dependencies = { dbClient, db, keyStorage, wallet, authMiddleware, paymentMiddleware }
    initializedAt = new Date().toISOString()
    lastDependencyError = ''
    console.info(JSON.stringify({ event: 'dependencies_ready', initializedAt }))
  } catch (error) {
    await dbClient.close().catch(() => undefined)
    throw error
  }
}

async function maintainDependencies(): Promise<void> {
  while (!dependencies && !shuttingDown) {
    try {
      await initializeDependencies()
    } catch (error) {
      lastDependencyError = error instanceof Error ? error.message : String(error)
      increment('tempo_key_server_dependency_init_failures_total')
      console.error(JSON.stringify({
        event: 'dependency_initialization_failed',
        error: lastDependencyError,
        retryMs: RETRY_DELAY_MS
      }))
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS))
    }
  }
}

function requireDependencies(req: Request, res: Response, next: NextFunction): void {
  if (!dependencies) {
    res.status(503).json({
      status: 'error',
      code: 'ERR_NOT_READY',
      description: 'Tempo key services are still starting.',
      requestId: req.requestId
    })
    return
  }
  next()
}

async function startServer(): Promise<void> {
  const app = express()
  app.disable('x-powered-by')
  app.use(express.json({ limit: '128kb' }))
  app.use(express.urlencoded({ extended: true, limit: '128kb' }))

  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', req.headers.origin || '*')
    res.header('Vary', 'Origin')
    res.header('Access-Control-Allow-Headers', '*')
    res.header('Access-Control-Allow-Methods', 'GET,POST,OPTIONS')
    res.header('Access-Control-Expose-Headers', '*')
    res.header('Access-Control-Allow-Private-Network', 'true')
    if (req.method === 'OPTIONS') {
      res.sendStatus(204)
      return
    }
    next()
  })

  app.use((req: Request, res: Response, next: NextFunction) => {
    req.requestId = req.header('x-request-id') || randomBytes(12).toString('hex')
    res.setHeader('x-request-id', req.requestId)
    const started = Date.now()
    res.on('finish', () => {
      const route = safePath(req)
      increment('tempo_key_server_requests_total', `method="${req.method}",path="${route}",status="${res.statusCode}"`)
      console.info(JSON.stringify({
        event: 'request_complete',
        requestId: req.requestId,
        method: req.method,
        path: route,
        status: res.statusCode,
        durationMs: Date.now() - started
      }))
    })
    next()
  })

  app.get('/healthz', (_req, res) => {
    res.status(200).json({ status: 'ok' })
  })

  app.get('/readyz', async (req, res) => {
    if (!dependencies) {
      res.status(503).json({
        status: 'starting',
        dependency: 'unavailable',
        requestId: req.requestId
      })
      return
    }

    try {
      await dependencies.db.command({ ping: 1 })
      const chaintracksHeight = await getChaintracksHeight()
      res.status(200).json({
        status: 'ready',
        initializedAt,
        dependencies: { mongodb: 'ok', chaintracks: 'ok' },
        chaintracksHeight
      })
    } catch (error) {
      increment('tempo_key_server_readiness_failures_total')
      res.status(503).json({
        status: 'degraded',
        dependency: 'unavailable',
        requestId: req.requestId
      })
    }
  })

  app.get('/availability', requireDependencies, async (req, res) => {
    const songURL = req.query.songURL
    if (typeof songURL !== 'string' || songURL.length < 20 || songURL.length > 256) {
      res.status(400).json({
        status: 'error',
        code: 'ERR_INVALID_SONG_URL',
        description: 'A valid songURL is required.',
        requestId: req.requestId
      })
      return
    }

    const key = await dependencies!.keyStorage.findKeyByFileUrl(songURL)
    increment('tempo_key_server_availability_checks_total', `available="${Boolean(key)}"`)
    res.setHeader('Cache-Control', 'public, max-age=60, stale-while-revalidate=300')
    res.status(200).json({
      status: 'ok',
      available: Boolean(key),
      priceSatoshis: key ? SONG_PRICE_SATOSHIS : null
    })
  })

  app.get('/metrics', (_req, res) => {
    res.type('text/plain; version=0.0.4')
    const lines = [
      '# HELP tempo_key_server_ready Whether all key-server dependencies are ready.',
      '# TYPE tempo_key_server_ready gauge',
      `tempo_key_server_ready ${dependencies ? 1 : 0}`,
      '# TYPE tempo_key_server_requests_total counter',
      ...[...counters.entries()].map(([key, value]) => `${key} ${value}`)
    ]
    res.send(`${lines.join('\n')}\n`)
  })

  app.use(requireDependencies)
  app.use((req, res, next) => dependencies!.authMiddleware(req, res, next))
  app.use((req, res, next) => dependencies!.paymentMiddleware(req, res, next))

  app.get('/checkForRoyalties', async (req, res) => {
    try {
      const identityKey = req.auth?.identityKey
      if (!identityKey) throw new Error('Missing identityKey')

      const { keyStorage, wallet } = dependencies!
      const unpaidRoyalties = await keyStorage.getUnpaidRoyalties()
      const myRoyalties = unpaidRoyalties.filter(r => r.artistIdentityKey === identityKey)
      const totalAmount = myRoyalties.reduce((sum, royalty) => sum + royalty.amount, 0)
      if (!myRoyalties.length || totalAmount === 0) {
        res.status(200).json({ status: 'noUpdates', message: 'No royalties are currently due.' })
        return
      }

      const derivationPrefix = randomBytes(10).toString('base64')
      const derivationSuffix = randomBytes(10).toString('base64')
      const { publicKey: derivedPubKey } = await wallet.getPublicKey({
        protocolID: [2, '3241645161d8'],
        keyID: `${derivationPrefix} ${derivationSuffix}`,
        counterparty: identityKey
      })

      const lockingScript = new P2PKH()
        .lock(PublicKey.fromString(derivedPubKey).toAddress())
        .toHex()
      const { tx } = await wallet.createAction({
        description: 'Tempo royalty payment',
        outputs: [{
          satoshis: totalAmount,
          lockingScript,
          customInstructions: JSON.stringify({ derivationPrefix, derivationSuffix, payee: identityKey }),
          outputDescription: 'Tempo royalty payment'
        }],
        options: { randomizeOutputs: false }
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
        if (royalty._id) {
          await keyStorage.markRoyaltyPaid(royalty._id.toString(), `${derivationPrefix}:${derivationSuffix}`)
        }
      }

      increment('tempo_key_server_royalty_payments_total')
      res.status(200).json({
        status: 'Royalty payment sent!',
        tx,
        derivationPrefix,
        derivationSuffix,
        amount: totalAmount,
        senderIdentityKey: PrivateKey.fromHex(SERVER_PRIVATE_KEY).toPublicKey().toString()
      })
    } catch (error) {
      increment('tempo_key_server_royalty_failures_total')
      console.error(JSON.stringify({ event: 'royalty_failed', requestId: req.requestId }))
      res.status(500).json({
        status: 'error',
        code: 'ERR_INTERNAL',
        description: 'The royalty payment could not be completed.',
        requestId: req.requestId
      })
    }
  })

  app.post('/pay', async (req, res) => {
    try {
      const identityKey = req.auth?.identityKey
      if (!identityKey) {
        res.status(401).json({ status: 'error', code: 'ERR_NOT_AUTHENTICATED', description: 'Authentication required.' })
        return
      }

      const songURL = req.body?.songURL
      if (typeof songURL !== 'string' || songURL.trim() === '') {
        res.status(400).json({ status: 'error', code: 'ERR_INVALID_INPUT', description: 'A valid songURL is required.' })
        return
      }

      const { keyStorage } = dependencies!
      const key = await keyStorage.findKeyByFileUrl(songURL)
      if (!key) {
        res.status(404).json({ status: 'error', code: 'ERR_KEY_NOT_FOUND', description: 'This song is no longer available.' })
        return
      }

      const orderID = randomBytes(32).toString('base64url')
      await keyStorage.insertInvoice({
        orderID,
        identityKey,
        amount: SONG_PRICE_SATOSHIS,
        processed: true,
        createdAt: new Date(),
        updatedAt: new Date()
      })
      await keyStorage.addRoyaltyRecord({
        keyID: key.encryptionKey,
        artistIdentityKey: key.artistIdentityKey!,
        amount: SONG_PRICE_SATOSHIS,
        paid: false
      })

      increment('tempo_key_server_song_purchases_total')
      res.status(200).json({ status: 'Key successfully purchased!', result: key.encryptionKey, orderID })
    } catch (error) {
      increment('tempo_key_server_song_purchase_failures_total')
      console.error(JSON.stringify({ event: 'song_purchase_failed', requestId: req.requestId }))
      res.status(500).json({
        status: 'error',
        code: 'ERR_INTERNAL',
        description: 'The purchase could not be completed.',
        requestId: req.requestId
      })
    }
  })

  app.post('/publish', async (req, res) => {
    try {
      const { songURL, key } = req.body || {}
      const identityKey = req.auth?.identityKey
      if (!identityKey) {
        res.status(403).json({ status: 'error', code: 'ERR_MISSING_IDENTITY', description: 'Authentication required.' })
        return
      }
      if (typeof songURL !== 'string' || songURL.trim() === '' || typeof key !== 'string' || key.trim() === '') {
        res.status(400).json({ status: 'error', code: 'ERR_INVALID_PARAMS', description: 'A valid songURL and key are required.' })
        return
      }
      if (!/^[A-Za-z0-9+/]{43}=$/.test(key)) {
        res.status(400).json({ status: 'error', code: 'ERR_INVALID_KEY_FORMAT', description: 'The decryption key must be 32-byte base64.' })
        return
      }

      const { keyStorage } = dependencies!
      const existing = await keyStorage.findKeyByFileUrl(songURL)
      if (existing) {
        res.status(200).json({ status: 'Key already published.', idempotent: true })
        return
      }
      if (!await isValid(songURL, key)) {
        res.status(400).json({ status: 'error', code: 'ERR_INVALID_DECRYPTION_KEY', description: 'The uploaded audio could not be validated.' })
        return
      }

      await keyStorage.storeKeyRecord(songURL, key, SONG_PRICE_SATOSHIS, 'n/a', identityKey)
      increment('tempo_key_server_keys_published_total')
      res.status(200).json({ status: 'Key successfully published!', available: true })
    } catch (error) {
      increment('tempo_key_server_key_publish_failures_total')
      console.error(JSON.stringify({ event: 'key_publish_failed', requestId: req.requestId }))
      res.status(500).json({
        status: 'error',
        code: 'ERR_INTERNAL',
        description: 'The key could not be published.',
        requestId: req.requestId
      })
    }
  })

  app.use((error: Error, req: Request, res: Response, _next: NextFunction) => {
    increment('tempo_key_server_unhandled_errors_total')
    console.error(JSON.stringify({ event: 'unhandled_error', requestId: req.requestId, error: error.message }))
    if (!res.headersSent) {
      res.status(500).json({ status: 'error', code: 'ERR_INTERNAL', description: 'The request could not be completed.', requestId: req.requestId })
    }
  })

  const server = app.listen(PORT, () => {
    console.info(JSON.stringify({ event: 'server_listening', port: PORT }))
  })
  void maintainDependencies()

  const shutdown = async (signal: string) => {
    if (shuttingDown) return
    shuttingDown = true
    console.info(JSON.stringify({ event: 'shutdown', signal }))
    server.close()
    await dependencies?.dbClient.close().catch(() => undefined)
  }
  process.on('SIGTERM', () => void shutdown('SIGTERM'))
  process.on('SIGINT', () => void shutdown('SIGINT'))
}

void startServer().catch((error) => {
  console.error(JSON.stringify({ event: 'server_start_failed', error: error instanceof Error ? error.message : String(error) }))
  process.exitCode = 1
})
