// Interfaces (types) used across multiple functions/components

import { BitcoinOutputScript } from '@babbage/sdk'

export interface Song {
  // Necessary
  title: string
  artist: string
  isPublished: boolean
  audioURL: string
  artworkURL: string
  description: string
  duration: number
  token: { outputIndex: number; txid: string; lockingScript: string }
  outputScript: BitcoinOutputScript

  // Optional
  selectedMusic?: File
  selectedArtwork?: File
  sats?: number
  decryptedSongURL?: string
  artistIdentityKey?: string
}
