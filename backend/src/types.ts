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
  previewURL?: string;
}

export interface TSPAttributes {
  artistIdentityKey?: string;
  songTitle?: string;
  artistName?: string;
  description?: string;
  duration?: string;
  songFileURL?: string;
  artFileURL?: string;
  previewURL?: string;
}

export interface TSPQuery {
  $and: Array<{ [key: string]: any }>
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

