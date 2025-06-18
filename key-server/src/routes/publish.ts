import { Request, Response } from 'express'
import knexfile from '../../knexfile'  // ✅ use correct default import
import knexModule from 'knex'
import { isValid } from '../utils/decryptionValidator.js'
import type { RouteDefinition } from '../types/routes'

// ✅ Determine correct environment key
const environment = process.env.NODE_ENV === 'staging' || process.env.NODE_ENV === 'production'
  ? 'staging'
  : 'development'

// ✅ Initialize knex using the resolved config
const knex = knexModule(knexfile[environment])

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

      // Validate required input
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

      // Optional: check base64 length (32 bytes = 44 base64 chars)
      if (key.length !== 44) {
        return res.status(400).json({
          status: 'error',
          code: 'ERR_INVALID_KEY_FORMAT',
          description: 'Decryption key must be 32 bytes (base64-encoded).'
        })
      }

      // Check for duplicate
      const [existing] = await knex('key')
        .where({ songURL })
        .select('value')

      if (existing) {
        return res.status(400).json({
          status: 'error',
          code: 'ERR_DUPLICATE_DECRYPTION_KEY',
          description: 'Key already published to key server!'
        })
      }

      // Validate key works on file
      const valid = await isValid(songURL, key)
      if (!valid) {
        return res.status(400).json({
          status: 'error',
          code: 'ERR_INVALID_DECRYPTION_KEY',
          description: 'Failed to validate decryption key!'
        })
      }

      // Insert into database
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
