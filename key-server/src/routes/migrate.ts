import { Request, Response } from 'express'
import knexConfig from '../../knexfile'
import knexModule from 'knex'
import type { RouteDefinition } from '../types/routes'

const env = process.env.NODE_ENV ?? 'development'
const knex = knexModule(knexConfig[env])


const migrateRoute: RouteDefinition = {
  type: 'post',
  path: '/migrate',
  hidden: true,
  summary: 'Run latest database migrations (authorized via migrate key)',
  func: async (req: Request, res: Response) => {
    try {
      const MIGRATE_KEY = process.env.MIGRATE_KEY
      const providedKey = req.body.migrateKey

      if (!providedKey || typeof providedKey !== 'string') {
        return res.status(400).json({
          status: 'error',
          code: 'ERR_INVALID_INPUT',
          description: 'Missing or invalid migrateKey'
        })
      }

      if (MIGRATE_KEY !== providedKey) {
        return res.status(401).json({
          status: 'error',
          code: 'ERR_UNAUTHORIZED',
          description: 'Migrate key is invalid'
        })
      }

      const result = await knex.migrate.latest()
      return res.status(200).json({
        status: 'success',
        result
      })
    } catch (e) {
      console.error('Migration error:', e)
      return res.status(500).json({
        status: 'error',
        code: 'ERR_MIGRATION_FAILED',
        description: 'Migration failed due to internal error.'
      })
    }
  }
}

export default migrateRoute
