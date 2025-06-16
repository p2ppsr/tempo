import { TSPStorage } from '../lookup-services/TSPStorage'
import { Collection, Db } from 'mongodb'
import { TSPRecord } from '../types'

describe('TSPStorage', () => {
  let dbMock: jest.Mocked<Db>
  let collectionMock: jest.Mocked<Collection<TSPRecord>>
  let storage: TSPStorage

  beforeEach(() => {
    collectionMock = {
      createIndex: jest.fn(),
      insertOne: jest.fn(),
      deleteOne: jest.fn(),
      find: jest.fn().mockReturnValue({
        project: jest.fn().mockReturnThis(),
        toArray: jest.fn().mockResolvedValue([]),
      }),
      countDocuments: jest.fn().mockResolvedValue(0),
    } as any

    dbMock = {
      collection: jest.fn().mockReturnValue(collectionMock),
    } as any

    storage = new TSPStorage(dbMock)
  })

  it('should create index on initialization', () => {
    expect(collectionMock.createIndex).toHaveBeenCalledWith({ searchableAttributes: 'text' })
  })

  it('should insert a record correctly', async () => {
    await storage.storeRecord('txid1', 0, {
      artistIdentityKey: 'key1',
      songTitle: 'song',
      artistName: 'artist',
      description: 'desc',
      duration: '3:30',
      songFileURL: 'url1',
      artFileURL: 'url2'
    })
    expect(collectionMock.insertOne).toHaveBeenCalled()
  })

  it('should call deleteOne on deleteRecord', async () => {
    await storage.deleteRecord('txid1', 0)
    expect(collectionMock.deleteOne).toHaveBeenCalledWith({ txid: 'txid1', outputIndex: 0 })
  })

  it('should return empty array when findByAttribute is passed no fields', async () => {
    const result = await storage.findByAttribute({})
    expect(result).toEqual([])
  })

  it('should return results from findAll', async () => {
    const toArrayMock = jest.fn().mockResolvedValue([{ txid: 'txid1', outputIndex: 0 }])
    const projectMock = jest.fn().mockReturnValue({ toArray: toArrayMock })

    collectionMock.find = jest.fn().mockReturnValue({ project: projectMock }) as any

    const result = await storage.findAll()

    expect(projectMock).toHaveBeenCalledWith({ txid: 1, outputIndex: 1 })
    expect(toArrayMock).toHaveBeenCalled()
    expect(result).toEqual([{ txid: 'txid1', outputIndex: 0 }])
  })

  it('should check songFileURL existence with isSongFileURLInDatabase', async () => {
    collectionMock.countDocuments.mockResolvedValue(1)
    const result = await storage.isSongFileURLInDatabase('url1')
    expect(result).toBe(true)
  })

  it('should match fuzzy artist name', async () => {
    const mockToArray = jest.fn().mockResolvedValue([{ txid: 'x', outputIndex: 0 }])
    collectionMock.find = jest.fn().mockReturnValue({
      project: jest.fn().mockReturnThis(),
      toArray: mockToArray
    }) as any

    const result = await storage.findByArtistName('Alice')
    expect(mockToArray).toHaveBeenCalled()
    expect(result).toEqual([{ txid: 'x', outputIndex: 0 }])
  })

  it('should match by songTitle with fuzzy pattern', async () => {
    const mockToArray = jest.fn().mockResolvedValue([{ txid: 'y', outputIndex: 1 }])
    collectionMock.find = jest.fn().mockReturnValue({
      project: jest.fn().mockReturnThis(),
      toArray: mockToArray
    }) as any

    const result = await storage.findBySongTitle('TestTitle')
    expect(mockToArray).toHaveBeenCalled()
    expect(result).toEqual([{ txid: 'y', outputIndex: 1 }])
  })

  it('should match by multiple attributes', async () => {
    const mockToArray = jest.fn().mockResolvedValue([{ txid: 'multi', outputIndex: 2 }])
    collectionMock.find = jest.fn().mockReturnValue({
      project: jest.fn().mockReturnThis(),
      toArray: mockToArray
    }) as any

    const result = await storage.findByAttribute({
      songTitle: 'Echoes',
      artistName: 'Pink Floyd'
    })

    expect(mockToArray).toHaveBeenCalled()
    expect(result).toEqual([{ txid: 'multi', outputIndex: 2 }])
  })

  it('should handle malformed input in findByArtistName gracefully', async () => {
    const result = await storage.findByArtistName('')
    expect(result).toEqual([])
  })

  it('should handle malformed input in findBySongTitle gracefully', async () => {
    const result = await storage.findBySongTitle('')
    expect(result).toEqual([])
  })

  it('should handle undefined songIDs in findBySongIDs', async () => {
    const result = await storage.findBySongIDs(undefined as any)
    expect(result).toEqual([])
  })

  it('should handle empty array songIDs in findBySongIDs', async () => {
    const result = await storage.findBySongIDs([])
    expect(result).toEqual([])
  })
})
