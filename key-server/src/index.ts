import dotenv from 'dotenv'
import express, { Request, Response, NextFunction } from 'express'
import bodyParser from 'body-parser'
import prettyjson from 'prettyjson'
import path from 'path'
import { WalletClient } from '@bsv/sdk'
import { createAuthMiddleware } from '@bsv/auth-express-middleware'
import routes from './routes/index.js'

dotenv.config()

const HTTP_PORT = process.env.PORT || process.env.HTTP_PORT || 8080
const ROUTING_PREFIX = process.env.ROUTING_PREFIX || ''
const HOSTING_DOMAIN = process.env.HOSTING_DOMAIN || ''
const NODE_ENV = process.env.NODE_ENV || 'production'

const app = express()

// Manual CORS Headers
app.use((req: Request, res: Response, next: NextFunction): void => {
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

// Body Parser
app.use(bodyParser.json({ limit: '1gb', type: 'application/json' }))

// HTTPS Redirect (unless local)
app.use((req: Request, res: Response, next: NextFunction) => {
  const forwardedProto = req.get('x-forwarded-proto')
  const isSecure = req.secure || forwardedProto === 'https'
  const isLocal = NODE_ENV === 'development' || HOSTING_DOMAIN.includes('localhost')

  if (!isSecure && !isLocal) {
    return res.redirect('https://' + req.get('host') + req.url)
  }

  next()
})

// Logging
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`[${req.method}] <- ${req.url}`)
  if (Object.keys(req.body).length > 0) {
    console.log(prettyjson.render(req.body, { keysColor: 'blue' }))
  }

  const originalJson = res.json.bind(res)
  res.json = (json: any) => {
    originalJson(json)
    console.log(`[${req.method}] -> ${req.url}`)
    console.log(prettyjson.render(json, { keysColor: 'green' }))
    return res
  }

  next()
})

// Static docs/assets
app.use(express.static(path.join(__dirname, 'public')))

// Pre-auth routes
routes.preAuthrite.forEach(route => {
  const method = route.type as keyof express.Application
  app[method](ROUTING_PREFIX + route.path, route.func)
})

// Auth middleware
const wallet = new WalletClient('json-api', 'auto')

app.use(createAuthMiddleware({
  wallet,
  allowUnauthenticated: false,
  logger: console,
  logLevel: 'debug'
}))

// Post-auth routes
routes.postAuthrite.forEach(route => {
  const method = route.type as keyof express.Application
  app[method](ROUTING_PREFIX + route.path, route.func)
})

// 404
app.use((req: Request, res: Response) => {
  console.log('404 Not Found:', req.url)
  res.status(404).json({
    status: 'error',
    code: 'ERR_ROUTE_NOT_FOUND',
    description: 'Route not found.'
  })
})

// Start server
app.listen(HTTP_PORT, () => {
  console.log(`✅ Tempo Key Server listening on port ${HTTP_PORT}`)
  setInterval(() => {}, 1 << 30) // Keep alive
})
