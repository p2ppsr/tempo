import type { Knex } from 'knex'
import dotenv from 'dotenv'

dotenv.config()

const sharedConfig: Partial<Knex.Config> = {
  pool: {
    min: 2,
    max: 120,
    acquireTimeoutMillis: 30000,
    createTimeoutMillis: 30000,
    idleTimeoutMillis: 30000,
    reapIntervalMillis: 1000,
    log: (message) => console.log('Pool log:', message)
  },
  useNullAsDefault: true,
  migrations: {
    directory: './src/migrations'
  }
}

const knexfile: { [key: string]: Knex.Config } = {
  development: {
    client: process.env.DB_CLIENT || 'mysql2',
    connection: {
      host: process.env.DB_HOST || '127.0.0.1',
      port: Number(process.env.DB_PORT || 3307),
      user: process.env.DB_USER || 'overlayAdmin',
      password: process.env.DB_PASS || 'overlay123',
      database: process.env.DB_NAME || 'overlay'
    },
    ...sharedConfig
  },

  staging: {
    client: process.env.DB_CLIENT || 'mysql2',
    connection: {
      host: process.env.DB_HOST || 'tempo-key-server-mysql',
      port: Number(process.env.DB_PORT || 3002),
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASS || 'test',
      database: process.env.DB_NAME || 'tempo-key-server'
    },
    ...sharedConfig
  }
}

// Optional: fallback export for safety
const env = process.env.NODE_ENV || 'development'
if (!knexfile[env]) {
  console.warn(`[knexfile] Unknown NODE_ENV "${env}", falling back to development`)
}
export default knexfile
