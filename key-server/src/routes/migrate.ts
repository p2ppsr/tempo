import { Request, Response } from 'express'
import knexConfig from '../../knexfile'
import knexModule from 'knex'
import type { RouteDefinition } from '../types/routes'

const knex = knexModule(
  process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'staging'
    ? knexConfig.production
    : knexConfig.development
)

const migrateRoute: RouteDefinition = {
  type: 'post',
  path: '/migrate',
  hidden: true,
  summary: 'Run latest database migrations (authorized via migrate key)',
  func: async (req: Request, res: Response) => {
    const MIGRATE_KEY = process.env.MIGRATE_KEY
    const providedKey = req.body.migrateKey

    if (typeof MIGRATE_KEY === 'string' && providedKey === MIGRATE_KEY) {
      try {
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
    } else {
      return res.status(401).json({
        status: 'error',
        code: 'ERR_UNAUTHORIZED',
        description: 'Migrate key is invalid'
      })
    }
  }
}

export default migrateRoute
