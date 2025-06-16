import { TSPLookupService } from '../lookup-services/TSPLookupServiceFactory'
import { LookupQuestion } from '@bsv/overlay'
import { TSPStorage } from '../lookup-services/TSPStorage'
import { LookupAnswer } from '@bsv/overlay'

describe('TSPLookupService', () => {
  let mockStorage: jest.Mocked<TSPStorage>
  let service: TSPLookupService

  beforeEach(() => {
    mockStorage = {
      storeRecord: jest.fn(),
      deleteRecord: jest.fn(),
      findBySongTitle: jest.fn(),
      findByArtistName: jest.fn(),
      findByArtistIdentityKey: jest.fn(),
      findBySongIDs: jest.fn(),
      isSongFileURLInDatabase: jest.fn(),
      findAll: jest.fn()
    } as any

    service = new TSPLookupService(mockStorage)
  })

  it('handles findBySongTitle query', async () => {
    mockStorage.findBySongTitle.mockResolvedValue([{ txid: 'x', outputIndex: 1 }])
    const question: LookupQuestion = {
      service: 'ls_tsp',
      query: { type: 'findBySongTitle', value: { songTitle: 'Hello' } }
    }
    const result = await service.lookup(question)
    expect(result).toEqual([{ txid: 'x', outputIndex: 1 }])
  })

  it('handles findByArtistName query', async () => {
    mockStorage.findByArtistName.mockResolvedValue([{ txid: 'a', outputIndex: 2 }])
    const question: LookupQuestion = {
      service: 'ls_tsp',
      query: { type: 'findByArtistName', value: { artistName: 'Bob' } }
    }
    const result = await service.lookup(question)
    expect(result).toEqual([{ txid: 'a', outputIndex: 2 }])
  })

  it('handles findByArtistIdentityKey query', async () => {
    mockStorage.findByArtistIdentityKey.mockResolvedValue([{ txid: 'idkey', outputIndex: 3 }])
    const question: LookupQuestion = {
      service: 'ls_tsp',
      query: { type: 'findByArtistIdentityKey', value: { artistIdentityKey: 'abc123' } }
    }
    const result = await service.lookup(question)
    expect(result).toEqual([{ txid: 'idkey', outputIndex: 3 }])
  })

  it('handles findBySongIDs query', async () => {
    mockStorage.findBySongIDs.mockResolvedValue([{ txid: 'songid', outputIndex: 4 }])
    const question: LookupQuestion = {
      service: 'ls_tsp',
      query: { type: 'findBySongIDs', value: { songIDs: ['url1'] } }
    }
    const result = await service.lookup(question)
    expect(result).toEqual([{ txid: 'songid', outputIndex: 4 }])
  })

  it('handles songFileExists true', async () => {
    mockStorage.isSongFileURLInDatabase.mockResolvedValue(true)
    const question: LookupQuestion = {
      service: 'ls_tsp',
      query: { type: 'songFileExists', value: { songFileURL: 'url1' } }
    }
    const result = await service.lookup(question)
    expect(result).toEqual([{ txid: 'exists', outputIndex: 0 }])
  })

  it('handles songFileExists false', async () => {
    mockStorage.isSongFileURLInDatabase.mockResolvedValue(false)
    const question: LookupQuestion = {
      service: 'ls_tsp',
      query: { type: 'songFileExists', value: { songFileURL: 'urlX' } }
    }
    const result = await service.lookup(question)
    expect(result).toEqual([])
  })

  it('handles findAll query', async () => {
    mockStorage.findAll.mockResolvedValue([{ txid: 'all', outputIndex: 9 }])
    const question: LookupQuestion = {
      service: 'ls_tsp',
      query: 'findAll'
    }
    const result = await service.lookup(question)
    expect(result).toEqual([{ txid: 'all', outputIndex: 9 }])
  })

  it('throws on missing query', async () => {
    const question = { service: 'ls_tsp' } as any
    await expect(service.lookup(question)).rejects.toThrow('A valid query must be provided!')
  })

  it('throws on unsupported service', async () => {
    const question = {
      service: 'unknown_service',
      query: 'findAll'
    } as LookupQuestion
    await expect(service.lookup(question)).rejects.toThrow('Lookup service not supported!')
  })

  it('throws on unknown query', async () => {
    const question = {
      service: 'ls_tsp',
      query: { type: 'notReal', value: {} }
    } as LookupQuestion
    await expect(service.lookup(question)).rejects.toThrow('Unsupported or unknown query.')
  })
})
