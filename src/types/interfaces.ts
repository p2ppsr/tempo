// Interfaces & types used across multiple functions & components

import { BitcoinOutputScript, PublicKey } from '@babbage/sdk-ts'

export interface Token {
  inputs: string | object
  mapiResponses: string | object
  outputScript: string | BitcoinOutputScript
  proof: string | object
  rawTX: string
  satoshis: number
  txid: string
  vout: number
  // TODO: Set these types
  outputIndex?: any
  lockingScript?: any
}

export interface Song {
  // Necessary
  title: string
  artist: string
  isPublished: boolean
  audioURL: string
  artworkURL: string
  description: string
  duration: number
  token: Token

  // Optional
  selectedMusic?: File
  selectedArtwork?: File
  sats?: number
  decryptedAudioURL?: string
  artistIdentityKey?: string
}

export interface SearchFilter {
  findAll: boolean
  artistIdentityKey: PublicKey,
  songIDs: any
}

export interface Playlist {
  id: string
  name: string
  songs: Song[]
}