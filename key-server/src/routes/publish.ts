import { Request, Response } from 'express'
import knexfile from '../../knexfile'
import knexModule from 'knex'
import { isValid } from '../utils/decryptionValidator.js'
import type { RouteDefinition } from '../types/routes'

const environment = process.env.NODE_ENV === 'staging' || process.env.NODE_ENV === 'production'
  ? 'staging'
  : 'development'

const knex = knexModule(knexfile[environment])

const publishRoute: RouteDefinition = {
  type: 'post',
  path: '/publish',
  summary: 'Use this route to publish a song decryption key',
  parameters: {
    songURL: 'abc', // A UHRP url of the song to decrypt
    key: '' // A 32-byte base64 string.
  },
  exampleResponse: {
    status: 'Key successfully published!'
  },
  func: async (req: Request, res: Response) => {
    try {
      const { songURL, key } = req.body
      const identityKey = (req as any).authrite?.identityKey

      if (!identityKey) {
        console.warn('[KeyServer] Missing identityKey in authenticated request!')
        return res.status(403).json({
          status: 'error',
          code: 'ERR_MISSING_IDENTITY',
          description: 'Authenticated identity key is missing from request.'
        })
      }

      console.log('[KeyServer] Received /publish request')
      console.log('  songURL:', songURL)
      console.log('  key:', key)
      console.log('  identityKey:', identityKey)

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

      const [existing] = await knex('key')
        .where({ songURL })
        .select('value')

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

      await knex('key').insert({
        songURL,
        value: key,
        artistIdentityKey: identityKey
      })

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
  }
}

export default publishRoute
