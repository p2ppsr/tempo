import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const manifest = JSON.parse(readFileSync(resolve(process.cwd(), 'public/manifest.json'), 'utf8'))

describe('BRC-116 permissions', () => {
  it('declares the same grouped permissions for current and legacy wallet namespaces', () => {
    expect(manifest.metanet.schemaVersion).toBe(1)
    expect(manifest.metanet.brcs).toContain('BRC-116')
    expect(manifest.babbage.groupPermissions).toEqual(manifest.metanet.groupPermissions)
    expect(manifest.metanet.groupPermissions.spendingAuthorization.duration).toBe(2592000)
    expect(manifest.metanet.groupPermissions.basketAccess).toContainEqual(expect.objectContaining({ basket: 'tmtsp' }))
    expect(manifest.metanet.groupPermissions.protocolPermissions).toEqual(expect.arrayContaining([
      expect.objectContaining({ protocolID: [2, 'messagebox'], counterparty: 'self' }),
      expect.objectContaining({ protocolID: [2, 'server hmac'], counterparty: 'self' })
    ]))
  })

  it('declares PACT protocols used by AuthFetch payments', () => {
    const protocols = manifest.metanet.counterpartyPermissions.protocols.map((entry: { protocolName: string }) => entry.protocolName)
    expect(protocols).toEqual(expect.arrayContaining([
      'messagebox',
      'auth message signature',
      'server hmac',
      '3241645161d8',
      'wallet payment'
    ]))
  })
})

describe('passive browsing prompt boundary', () => {
  it('does not instantiate or probe a wallet from passive application surfaces', () => {
    for (const file of [
      '../App.tsx',
      '../pages/Home/Home.tsx',
      '../components/SongList/SongList.tsx'
    ]) {
      const source = readFileSync(resolve(process.cwd(), 'src/utils', file), 'utf8')
      expect(source).not.toContain('new WalletClient')
      expect(source).not.toContain('checkForMetaNetClient')
      expect(source).not.toContain('checkForRoyalties')
    }
  })
})

describe('publication recovery contract', () => {
  it('persists stage receipts before key publication and overlay admission', () => {
    const source = readFileSync(resolve(process.cwd(), 'src/utils/publishSong.ts'), 'utf8')
    expect(source.indexOf("saveReceipt('storage_verified')")).toBeLessThan(source.indexOf('await publishKey'))
    expect(source.indexOf('await publishKey')).toBeLessThan(source.indexOf('await broadcaster.broadcast'))
    expect(source).toContain("saveReceipt('failed')")
    expect(source).toContain("localStorage.setItem('tempo:last-publication'")
  })

  it('verifies uploads through the expiry-aware public UHRP overlay without billable find calls', () => {
    const source = readFileSync(resolve(process.cwd(), 'src/utils/getFileUploadInfo.ts'), 'utf8')
    expect(source).toContain('storageDownloader.resolve(uhrpURL)')
    expect(source).toContain('onAssetReceipt?.')
    expect(source).not.toContain('storageUploader.findFile')
  })
})
