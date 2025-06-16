
import { AdmittanceInstructions } from '@bsv/overlay'
import { PublicKey, Signature, Transaction, PushDrop, Utils } from '@bsv/sdk'
import TSPTopicManager from '../topic-managers/TSPTopicManager'

jest.mock('@bsv/sdk', () => {
  const actual = jest.requireActual('@bsv/sdk')
  return {
    ...actual,
    Transaction: {
      fromBEEF: jest.fn()
    },
    PushDrop: {
      decode: jest.fn()
    },
    Signature: {
      fromDER: jest.fn()
    },
    Utils: {
      ...actual.Utils,
      toBase58: jest.fn()
    }
  }
})

describe('TSPTopicManager', () => {
  let manager: TSPTopicManager

  beforeEach(() => {
    manager = new TSPTopicManager()
    jest.clearAllMocks()
  })

  it('should admit outputs with valid signature and protocol address', async () => {
    const txMock = {
      outputs: [
        { lockingScript: 'script1' },
        { lockingScript: 'script2' }
      ]
    }

    const mockPubKey = {
      verify: jest.fn().mockReturnValue(true)
    }

    const mockDecoded = {
      fields: [
        Buffer.from('1LQtKKK7c1TN3UcRfsp8SqGjWtzGskze36'),
        Buffer.from('title'),
        Buffer.from('artist'),
        Buffer.from('desc'),
        Buffer.from('dur'),
        Buffer.from('songUrl'),
        Buffer.from('artUrl'),
        Buffer.from('sig')
      ],
      lockingPublicKey: mockPubKey
    }

    require('@bsv/sdk').Transaction.fromBEEF.mockReturnValue(txMock)
    require('@bsv/sdk').PushDrop.decode.mockReturnValue(mockDecoded)
    require('@bsv/sdk').Signature.fromDER.mockReturnValue({ verify: () => true })
    require('@bsv/sdk').Utils.toBase58.mockReturnValue('1LQtKKK7c1TN3UcRfsp8SqGjWtzGskze36')

    const result = await manager.identifyAdmissibleOutputs([1, 2, 3], [0])
    expect(result.outputsToAdmit).toEqual([0, 1])
    expect(result.coinsToRetain).toEqual([0])
  })

  it('should skip outputs with invalid signature', async () => {
    const txMock = {
      outputs: [{ lockingScript: 'badScript' }]
    }

    const mockPubKey = {
      verify: jest.fn().mockReturnValue(false)
    }

    const mockDecoded = {
      fields: Array(8).fill(Buffer.from('a')),
      lockingPublicKey: mockPubKey
    }

    require('@bsv/sdk').Transaction.fromBEEF.mockReturnValue(txMock)
    require('@bsv/sdk').PushDrop.decode.mockReturnValue(mockDecoded)
    require('@bsv/sdk').Signature.fromDER.mockReturnValue({ verify: () => false })
    require('@bsv/sdk').Utils.toBase58.mockReturnValue('1LQtKKK7c1TN3UcRfsp8SqGjWtzGskze36')

    const result = await manager.identifyAdmissibleOutputs([], [])
    expect(result.outputsToAdmit).toEqual([])
  })

  it('should handle malformed fields array (too short)', async () => {
    const txMock = {
      outputs: [{ lockingScript: 'incompleteScript' }]
    }

    const mockDecoded = {
      fields: [Buffer.from('short')], // too few fields
      lockingPublicKey: { verify: () => true }
    }

    require('@bsv/sdk').Transaction.fromBEEF.mockReturnValue(txMock)
    require('@bsv/sdk').PushDrop.decode.mockReturnValue(mockDecoded)
    require('@bsv/sdk').Signature.fromDER.mockImplementation(() => {
      throw new Error('Malformed signature')
    })
    require('@bsv/sdk').Utils.toBase58.mockReturnValue('1LQtKKK7c1TN3UcRfsp8SqGjWtzGskze36')

    const result = await manager.identifyAdmissibleOutputs([], [])
    expect(result.outputsToAdmit).toEqual([])
  })


  it('should skip outputs with invalid protocol address', async () => {
    const txMock = {
      outputs: [{ lockingScript: 'wrongAddressScript' }]
    }

    const mockPubKey = { verify: () => true }
    const mockDecoded = {
      fields: Array(8).fill(Buffer.from('a')),
      lockingPublicKey: mockPubKey
    }

    require('@bsv/sdk').Transaction.fromBEEF.mockReturnValue(txMock)
    require('@bsv/sdk').PushDrop.decode.mockReturnValue(mockDecoded)
    require('@bsv/sdk').Utils.toBase58.mockReturnValue('wrongAddress')

    const result = await manager.identifyAdmissibleOutputs([], [])
    expect(result.outputsToAdmit).toEqual([])
  })

  it('should return empty if transaction cannot be parsed', async () => {
    require('@bsv/sdk').Transaction.fromBEEF.mockImplementation(() => {
      throw new Error('Parse error')
    })

    const result = await manager.identifyAdmissibleOutputs([], [])
    expect(result.outputsToAdmit).toEqual([])
    expect(result.coinsToRetain).toEqual([])
  })

  it('getDocumentation returns a string', async () => {
    const doc = await manager.getDocumentation()
    expect(typeof doc).toBe('string')
  })

  it('getMetaData returns expected metadata', async () => {
    const meta = await manager.getMetaData()
    expect(meta.name).toBe('tm_tsp')
    expect(meta.shortDescription).toBe('Tempo Song Protocol Topic Manager')
    expect(meta.version).toBe('1.0.0')
  })
})
