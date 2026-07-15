import type { PeerSession } from '@bsv/sdk'
import type { Collection, Filter } from 'mongodb'
import { describe, expect, it } from 'vitest'
import { MongoAuthSessionManager, type AuthSessionDocument } from '../MongoAuthSessionManager'

class SharedSessionCollection {
  readonly documents = new Map<string, AuthSessionDocument>()

  async createIndex(): Promise<string> {
    return 'test-index'
  }

  async updateOne(
    filter: Filter<AuthSessionDocument>,
    update: { $set: AuthSessionDocument }
  ): Promise<void> {
    this.documents.set(String(filter.sessionNonce), { ...update.$set })
  }

  async findOne(
    filter: Filter<AuthSessionDocument>,
    options?: { sort?: { lastUpdate?: number } }
  ): Promise<AuthSessionDocument | null> {
    const active = [...this.documents.values()].filter(document => document.expiresAt > new Date())
    if (typeof filter.sessionNonce === 'string') {
      return active.find(document => document.sessionNonce === filter.sessionNonce) || null
    }
    if (typeof filter.peerIdentityKey === 'string') {
      const matches = active.filter(document => document.peerIdentityKey === filter.peerIdentityKey)
      if (options?.sort?.lastUpdate === -1) matches.sort((a, b) => b.lastUpdate - a.lastUpdate)
      return matches[0] || null
    }
    return null
  }

  async deleteOne(filter: Filter<AuthSessionDocument>): Promise<void> {
    if (typeof filter.sessionNonce === 'string') this.documents.delete(filter.sessionNonce)
  }
}

const session = (sessionNonce: string, lastUpdate: number): PeerSession => ({
  isAuthenticated: true,
  sessionNonce,
  peerNonce: `peer-${sessionNonce}`,
  peerIdentityKey: 'listener-identity',
  lastUpdate
})

describe('MongoAuthSessionManager', () => {
  it('shares nonce and latest-identity lookups across server instances', async () => {
    const shared = new SharedSessionCollection()
    const collection = shared as unknown as Collection<AuthSessionDocument>
    const firstReplica = new MongoAuthSessionManager(collection)
    const secondReplica = new MongoAuthSessionManager(collection)

    await firstReplica.initialize()
    await firstReplica.addSession(session('nonce-one', 10))
    expect(await secondReplica.getSession('nonce-one')).toMatchObject({ sessionNonce: 'nonce-one' })

    await secondReplica.addSession(session('nonce-two', 20))
    expect(await firstReplica.getSession('listener-identity')).toMatchObject({ sessionNonce: 'nonce-two' })

    await firstReplica.removeSession(session('nonce-two', 20))
    expect(await secondReplica.hasSession('nonce-two')).toBe(false)
  })
})
