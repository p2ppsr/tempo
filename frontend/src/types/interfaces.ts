// Interfaces & types used across multiple functions & components

import { LockingScript } from '@bsv/sdk'

export interface Token {
  inputs: object
  mapiResponses: object
  outputScript: string | LockingScript
  proof: object
  rawTX: string
  satoshis: number
  txid: string
  vout: number
  outputIndex?: number
  lockingScript?: LockingScript
}

export interface Song {
  // Required
  title: string
  artist: string
  isPublished: boolean
  songURL: string
  artworkURL: string
  description: string
  duration: number
  token: Token

  // Optional
  selectedMusic?: File
  selectedArtwork?: File
  selectedPreview?: File
  previewURL?: string
  sats?: number
  decryptedSongURL?: string
  artistIdentityKey?: string
  availability?: SongAvailability
  publicationReceipt?: PublicationReceipt
}

export interface SongAvailability {
  status: 'playable' | 'expired' | 'invalid' | 'unknown'
  checkedAt: string
  reason?: string
  audioHosts: number
  previewHosts: number
  hasKey: boolean
  priceSatoshis?: number
}

export interface PublicationAssetReceipt {
  uhrpURL: string
  expiryTime?: number
  acceptedBy?: string[]
  hostedBy: string[]
  available: boolean
}

export interface PublicationReceipt {
  publicationId: string
  createdAt: string
  updatedAt: string
  stage: string
  failedAtStage?: string
  error?: string
  txid?: string
  assets: {
    audio?: PublicationAssetReceipt
    artwork?: PublicationAssetReceipt
    preview?: PublicationAssetReceipt
  }
  keyPublished: boolean
  overlayAdmitted: boolean
  playable: boolean
}

export interface SearchFilter {
  type: 'findAll'
  value?: {
    artistIdentityKey?: string
    songIDs?: string[]
  }
}

export interface Playlist {
  id: string
  name: string
  songs: Song[]
}

export interface UTXOReference {
  txid: string,
  outputIndex: number
}

export interface TSPRecord {
  txid: string;
  outputIndex: number;
  artistIdentityKey: string;
  songTitle: string;
  artistName: string;
  description: string;
  duration: string;
  songFileURL: string;
  artFileURL: string;
  createdAt: Date;
  searchableAttributes: string;
}

export interface TSPAttributes {
  artistIdentityKey?: string;
  songTitle?: string;
  artistName?: string;
  description?: string;
  duration?: string;
  songFileURL?: string;
  artFileURL?: string;
}

export interface TSPQuery {
  $and: Array<{ [key: string]: unknown }>
}

// Overlay-compatible structured lookup query types

export type FindBySongTitleQuery = {
  type: 'findBySongTitle'
  value: { songTitle: string }
}

export type FindByArtistNameQuery = {
  type: 'findByArtistName'
  value: { artistName: string }
}

export type FindByArtistIdentityKeyQuery = {
  type: 'findByArtistIdentityKey'
  value: { artistIdentityKey: string }
}

export type FindBySongIDsQuery = {
  type: 'findBySongIDs'
  value: { songIDs: string[] }
}

export type FindBySongFileURLQuery = {
  type: 'songFileExists'
  value: { songFileURL: string }
}

export interface FindAllQuery {
  type: 'findAll'
  value?: {
    songIDs?: string[]
    artistIdentityKey?: string
  }
}

export type TSPLookupQuery =
  | FindBySongTitleQuery
  | FindByArtistNameQuery
  | FindByArtistIdentityKeyQuery
  | FindBySongIDsQuery
  | FindBySongFileURLQuery
  | FindAllQuery 
