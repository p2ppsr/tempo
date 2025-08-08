import {
  LookupService,
  LookupQuestion,
  LookupAnswer,
  LookupFormula,
  AdmissionMode,
  SpendNotificationMode,
  OutputAdmittedByTopic,
  OutputSpent
} from '@bsv/overlay'
import { PushDrop, Utils } from '@bsv/sdk'
import { TSPStorage } from './TSPStorage.js'
import docs from './TSPLookupDocs.md.js'
import { Db } from 'mongodb'
import {
  TSPLookupQuery,
  FindBySongTitleQuery,
  FindByArtistNameQuery,
  FindByArtistIdentityKeyQuery,
  FindBySongIDsQuery,
  FindBySongFileURLQuery
} from '../types.js'

export class TSPLookupService implements LookupService {
  readonly admissionMode: AdmissionMode = 'locking-script'
  readonly spendNotificationMode: SpendNotificationMode = 'none'

  constructor(public storage: TSPStorage) { }

  async outputAdmittedByTopic(payload: OutputAdmittedByTopic): Promise<void> {
    if (payload.mode !== 'locking-script') throw new Error('Invalid mode')
    const { topic, lockingScript, txid, outputIndex } = payload

    console.log('[TSPLookupService] outputAdmittedByTopic called with:', {
      topic, txid, outputIndex
    })

    if (topic !== 'tm_tsp') {
      console.warn(`[TSPLookupService] Ignoring unknown topic: "${topic}"`)
      return
    }

    try {
      const decoded = PushDrop.decode(lockingScript)
      const [_, __, songTitleBuf, artistNameBuf, descriptionBuf, durationBuf, songFileURLBuf, artFileURLBuf, previewURLBuf] = decoded.fields

      const artistIdentityKey = Utils.toHex(payload.lockingScript.chunks[0].data!)
      const songTitle = Utils.toBase64(songTitleBuf)
      const artistName = Utils.toBase64(artistNameBuf)
      const description = Utils.toBase64(descriptionBuf)
      const duration = Utils.toBase64(durationBuf)
      const songFileURL = Utils.toBase64(songFileURLBuf)
      const artFileURL = Utils.toBase64(artFileURLBuf)
      const previewURL = Utils.toBase64(previewURLBuf)

      console.log(`[TSPLookupService] Decoded song "${songTitle}" by "${artistName}"`)
      console.log('[TSPLookupService] Storing TSP record with:', {
        txid, outputIndex, artistIdentityKey, songTitle, artistName, songFileURL
      })

      await this.storage.storeRecord(txid, outputIndex, {
        artistIdentityKey,
        songTitle,
        artistName,
        description,
        duration,
        songFileURL,
        artFileURL,
        previewURL
      })

      console.log('[TSPLookupService] Record stored successfully.')
    } catch (error) {
      console.error('[TSPLookupService] Failed to decode/store PushDrop:', error)
    }
  }

  async outputSpent(payload: OutputSpent): Promise<void> {
    if (payload.mode !== 'none') throw new Error('Invalid mode')
    const { topic, txid, outputIndex } = payload

    if (topic !== 'tm_tsp') {
      console.warn(`[TSPLookupService] Ignoring spent from unknown topic: "${topic}"`)
      throw new Error(`Invalid topic "${topic}" for this service.`)
    }

    console.log(`[TSPLookupService] Deleting spent record for txid: ${txid}, vout: ${outputIndex}`)
    await this.storage.deleteRecord(txid, outputIndex)
  }

  async outputEvicted(txid: string, outputIndex: number): Promise<void> {
    console.log(`[TSPLookupService] Evicting record for txid: ${txid}, vout: ${outputIndex}`)
    await this.storage.deleteRecord(txid, outputIndex)
  }

  async lookup(question: LookupQuestion): Promise<LookupFormula> {
    console.log('[TSPLookupService] Lookup called with:', question)

    if (!question.query) {
      throw new Error('A valid query must be provided!')
    }

    if (question.service !== 'ls_tsp') {
      console.warn(`[TSPLookupService] Received lookup for unknown service: "${question.service}"`)
      throw new Error('Lookup service not supported!')
    }

    const query = question.query as TSPLookupQuery

    try {
      if (isSongTitleQuery(query)) {
        console.log('[TSPLookupService] Query type: findBySongTitle')
        return await this.storage.findBySongTitle(query.value.songTitle)

      } else if (isArtistNameQuery(query)) {
        console.log('[TSPLookupService] Query type: findByArtistName')
        return await this.storage.findByArtistName(query.value.artistName)

      } else if (isArtistKeyQuery(query)) {
        console.log('[TSPLookupService] Query type: findByArtistIdentityKey')
        return await this.storage.findByArtistIdentityKey(query.value.artistIdentityKey)

      } else if (isSongIDsQuery(query)) {
        console.log('[TSPLookupService] Query type: findBySongIDs')
        return await this.storage.findBySongIDs(query.value.songIDs)

      } else if (isSongFileCheckQuery(query)) {
        console.log('[TSPLookupService] Query type: songFileExists')
        const exists = await this.storage.isSongFileURLInDatabase(query.value.songFileURL)
        return exists ? [{ txid: 'exists', outputIndex: 0 }] : []

      } else if (typeof query === 'object' && query.type === 'findAll') {
        console.log('[TSPLookupService] Query type: findAll (possibly filtered)')
        const filters = query.value || {}

        if (filters.songIDs && filters.songIDs.length > 0) {
          return await this.storage.findBySongIDs(filters.songIDs)
        } else if ('artistIdentityKey' in filters && filters.artistIdentityKey) {
          return await this.storage.findByArtistIdentityKey(filters.artistIdentityKey)
        } else {
          const result = await this.storage.findAll()
          console.log(`[TSPLookupService] findAll returned ${result.length} results`)
          return result
        }
      }

      throw new Error('Unsupported or unknown query.')

    } catch (err) {
      console.error('[TSPLookupService] Lookup query failed:', err)
      throw err
    }
  }


  async getDocumentation(): Promise<string> {
    return docs
  }

  async getMetaData(): Promise<{
    name: string
    shortDescription: string
    iconURL?: string
    version?: string
    informationURL?: string
  }> {
    return {
      name: 'ls_tsp',
      shortDescription: 'Tempo Song Protocol Lookup Service'
    }
  }
}

// Type guards
function isSongTitleQuery(query: TSPLookupQuery): query is FindBySongTitleQuery {
  return typeof query === 'object' && query !== null && query.type === 'findBySongTitle'
}
function isArtistNameQuery(query: TSPLookupQuery): query is FindByArtistNameQuery {
  return typeof query === 'object' && query !== null && query.type === 'findByArtistName'
}
function isArtistKeyQuery(query: TSPLookupQuery): query is FindByArtistIdentityKeyQuery {
  return typeof query === 'object' && query !== null && query.type === 'findByArtistIdentityKey'
}
function isSongIDsQuery(query: TSPLookupQuery): query is FindBySongIDsQuery {
  return typeof query === 'object' && query !== null && query.type === 'findBySongIDs'
}
function isSongFileCheckQuery(query: TSPLookupQuery): query is FindBySongFileURLQuery {
  return typeof query === 'object' && query !== null && query.type === 'songFileExists'
}

export default (db: Db): TSPLookupService => {
  return new TSPLookupService(new TSPStorage(db))
}


