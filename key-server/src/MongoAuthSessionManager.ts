import type { AsyncSessionManager, PeerSession } from '@bsv/sdk'
import type { Collection } from 'mongodb'

const SESSION_TTL_MS = 24 * 60 * 60 * 1000

export interface AuthSessionDocument extends PeerSession {
  sessionNonce: string
  expiresAt: Date
}

function sessionDocument(session: PeerSession): AuthSessionDocument {
  if (!session.sessionNonce) throw new TypeError('Auth session nonce is required.')
  const document: AuthSessionDocument = {
    isAuthenticated: session.isAuthenticated,
    sessionNonce: session.sessionNonce,
    lastUpdate: session.lastUpdate,
    expiresAt: new Date(Date.now() + SESSION_TTL_MS)
  }
  if (session.peerNonce !== undefined) document.peerNonce = session.peerNonce
  if (session.peerIdentityKey !== undefined) document.peerIdentityKey = session.peerIdentityKey
  if (session.certificatesRequired !== undefined) document.certificatesRequired = session.certificatesRequired
  if (session.certificatesValidated !== undefined) document.certificatesValidated = session.certificatesValidated
  return document
}

function peerSession(document: AuthSessionDocument | null): PeerSession | undefined {
  if (!document) return undefined
  return {
    isAuthenticated: document.isAuthenticated,
    sessionNonce: document.sessionNonce,
    peerNonce: document.peerNonce,
    peerIdentityKey: document.peerIdentityKey,
    lastUpdate: document.lastUpdate,
    certificatesRequired: document.certificatesRequired,
    certificatesValidated: document.certificatesValidated
  }
}

/**
 * Shared BRC-103 session state for horizontally scaled key-server replicas.
 * The auth middleware awaits this interface, so a handshake created by one
 * pod can be completed by any other pod behind the load balancer.
 */
export class MongoAuthSessionManager implements AsyncSessionManager {
  constructor(private readonly sessions: Collection<AuthSessionDocument>) {}

  async initialize(): Promise<void> {
    await Promise.all([
      this.sessions.createIndex({ sessionNonce: 1 }, { unique: true }),
      this.sessions.createIndex({ peerIdentityKey: 1, lastUpdate: -1 }),
      this.sessions.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 })
    ])
  }

  private async persist(session: PeerSession): Promise<void> {
    const document = sessionDocument(session)
    await this.sessions.updateOne(
      { sessionNonce: document.sessionNonce },
      { $set: document },
      { upsert: true }
    )
  }

  async addSession(session: PeerSession): Promise<void> {
    await this.persist(session)
  }

  async updateSession(session: PeerSession): Promise<void> {
    await this.persist(session)
  }

  async getSession(identifier: string): Promise<PeerSession | undefined> {
    const current = { $gt: new Date() }
    const byNonce = await this.sessions.findOne({ sessionNonce: identifier, expiresAt: current })
    if (byNonce) return peerSession(byNonce)

    const byIdentity = await this.sessions.findOne(
      { peerIdentityKey: identifier, expiresAt: current },
      { sort: { lastUpdate: -1 } }
    )
    return peerSession(byIdentity)
  }

  async removeSession(session: PeerSession): Promise<void> {
    if (!session.sessionNonce) return
    await this.sessions.deleteOne({ sessionNonce: session.sessionNonce })
  }

  async hasSession(identifier: string): Promise<boolean> {
    return await this.getSession(identifier) !== undefined
  }
}
