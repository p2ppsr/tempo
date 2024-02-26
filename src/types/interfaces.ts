// Interfaces & types used across multiple functions & components

import { BitcoinOutputScript, PublicKey } from '@babbage/sdk'

export interface Token {
  inputs: string | object
  mapiResponses: string | object
  outputScript: string | BitcoinOutputScript
  proof: string | object
  rawTX: string
  satoshis: number
  txid: string
  vout: number
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
  decryptedSongURL?: string
  artistIdentityKey?: string
}

export interface SearchFilter {
  findAll: boolean
  artistIdentityKey: PublicKey
}

export interface Playlist {
  id: string
  name: string
  songs: Song[]
}