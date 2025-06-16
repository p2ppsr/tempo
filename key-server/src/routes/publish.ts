import { Request, Response } from 'express'
import knexConfig from '../../knexfile'
import knexModule from 'knex'
import { isValid } from '../utils/decryptionValidator.js'
import type { RouteDefinition } from '../types/routes'

const knex = knexModule(
  process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'staging'
    ? knexConfig.production
    : knexConfig.development
)

const publishRoute: RouteDefinition = {
  type: 'post',
  path: '/publish',
  summary: 'Use this route to publish a song decryption key',
  parameters: {
    songURL: 'abc', // A UHRP url of the song to decrypt
    key: '' // A 32 byte base64 string.
  },
  exampleResponse: {
    status: 'Key successfully published!'
  },
  func: async (req: Request, res: Response) => {
    try {
      const { songURL, key } = req.body
      const identityKey = (req as any).authrite?.identityKey

      if (!songURL || !key) {
        return res.status(400).json({
          status: 'error',
          code: 'ERR_INVALID_PARAMS',
          description: 'Must provide valid parameters'
        })
      }

      const [existing] = await knex('key').where({ songURL }).select('value')
      if (existing) {
        return res.status(400).json({
          status: 'error',
          code: 'ERR_DUPLICATE_DECRYPTION_KEY',
          description: 'Key already published to key server!'
        })
      }

      const valid = await isValid(songURL, key)
      if (!valid) {
        return res.status(400).json({
          status: 'error',
          code: 'ERR_INVALID_DECRYPTION_KEY',
          description: 'Failed to validate decryption key!'
        })
      }

      await knex('key').insert({
        songURL,
        value: key,
        artistIdentityKey: identityKey
      })

      return res.status(200).json({
        status: 'Key successfully published!'
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

export default publishRoute
