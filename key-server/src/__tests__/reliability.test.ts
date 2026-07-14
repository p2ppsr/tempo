import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const walletSource = readFileSync(resolve(process.cwd(), 'src/utils/walletSingleton.ts'), 'utf8')
const serverSource = readFileSync(resolve(process.cwd(), 'src/index.ts'), 'utf8')

describe('key-server reliability invariants', () => {
  it('pins ChainTracks through an explicit production-aware client and caches the wallet', () => {
    expect(walletSource).toContain('CHAINTRACKS_URL')
    expect(walletSource).toContain('ChaintracksServiceClient')
    expect(walletSource).toContain('walletInstance = wallet')
    expect(walletSource).not.toContain('const walletInstance')
  })

  it('keeps catalogue visibility, payment, invoices, and royalties on one price', () => {
    expect(serverSource).toContain('SONG_PRICE_SATOSHIS')
    expect(serverSource).not.toContain('const amount = 10000')
  })

  it('does not log request or response bodies containing encryption keys', () => {
    expect(serverSource).not.toContain('prettyjson')
    expect(serverSource).not.toContain('console.log(req.body')
    expect(serverSource).not.toContain('console.log(prettyjson')
  })

  it('serves liveness before dependency initialization and retries degraded dependencies', () => {
    expect(serverSource.indexOf("app.get('/healthz'")).toBeLessThan(serverSource.indexOf('void maintainDependencies()'))
    expect(serverSource).toContain('while (!dependencies && !shuttingDown)')
    expect(serverSource).toContain("app.get('/readyz'")
  })
})
