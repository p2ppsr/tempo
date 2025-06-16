import dotenv from 'dotenv'
import express, { Request, Response, NextFunction } from 'express'
import bodyParser from 'body-parser'
import prettyjson from 'prettyjson'
import { WalletClient } from '@bsv/sdk'
import { createAuthMiddleware } from '@bsv/auth-express-middleware'
import routes from './routes/index.js'
import path from 'path'

dotenv.config()

const HTTP_PORT = process.env.PORT || process.env.HTTP_PORT || 8080
const ROUTING_PREFIX = process.env.ROUTING_PREFIX || ''
const HOSTING_DOMAIN = process.env.HOSTING_DOMAIN || ''

const app = express()

// Middleware: body parser
app.use(bodyParser.json({ limit: '1gb', type: 'application/json' }))

// Force HTTPS unless in development
app.use((req: Request, res: Response, next: NextFunction) => {
  if (
    !req.secure &&
    req.get('x-forwarded-proto') !== 'https' &&
    process.env.NODE_ENV !== 'development' &&
    !HOSTING_DOMAIN.includes('localhost')
  ) {
    return res.redirect('https://' + req.get('host') + req.url)
  }
  next()
})

// CORS headers
app.use((req: Request, res: Response, next: NextFunction) => {
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

// Request logging
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`[${req.method}] <- ${req.url}`)
  const logObject = { ...req.body }
  console.log(prettyjson.render(logObject, { keysColor: 'blue' }))

  const originalJson = res.json.bind(res)
  res.json = (json: any) => {
    originalJson(json)
    console.log(`[${req.method}] -> ${req.url}`)
    console.log(prettyjson.render(json, { keysColor: 'green' }))
    return res
  }

  next()
})

// Static docs
app.use(express.static(path.join(__dirname, 'public')))

// Pre-authenticated routes
routes.preAuthrite.forEach((route) => {
  const method = route.type as 'get' | 'post' | 'put' | 'delete' | 'patch'
  app[method](ROUTING_PREFIX + route.path, route.func)
})

// Auth middleware using WalletClient
const wallet = new WalletClient('json-api', 'auto')

app.use(createAuthMiddleware({
  wallet,
  allowUnauthenticated: false,
  logger: console,
  logLevel: 'debug'
}))

// Post-authenticated routes
routes.postAuthrite.forEach((route) => {
  const method = route.type as 'get' | 'post' | 'put' | 'delete' | 'patch'
  app[method](ROUTING_PREFIX + route.path, route.func)
})

// 404 handler
app.use((req: Request, res: Response) => {
  console.log('404', req.url)
  res.status(404).json({
    status: 'error',
    code: 'ERR_ROUTE_NOT_FOUND',
    description: 'Route not found.'
  })
})

// Start server
app.listen(HTTP_PORT, () => {
  console.log(`Tempo Key Server listening on port ${HTTP_PORT}`)
})
