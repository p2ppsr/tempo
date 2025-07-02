import { ObjectId } from 'mongodb'

export interface DecodedSongOutput {
  txid: string
  outputIndex: number
  title?: string
  artist?: string
  description?: string
  duration?: string
  fileUrl?: string
  coverUrl?: string
  uuid?: string
}

export interface PaymentOutput {
  vout: number
  satoshis: number
  derivationPrefix?: string
  derivationSuffix?: string
  senderIdentityKey?: string
}

export interface TransactionPayload {
  rawTx: string
  mapiResponses: any[]
  inputs: any[]
  outputs: PaymentOutput[]
  proof?: any
}

export interface KeyRecord {
  fileUrl: string
  encryptionKey: string
  satoshis: number
  publicKey: string
  artistIdentityKey?: string
}

export interface BalanceRecord {
  publicKey: string
  balance: number
}

export interface RoyaltyRecord {
  _id?: ObjectId
  artistIdentityKey: string
  keyID: string
  amount: number
  paid: boolean
  paymentId?: string
  createdAt?: Date
  updatedAt?: Date
}

export interface OutgoingRoyaltyPayment {
  transaction: string
  derivationPrefix: string
  derivationSuffix: string
  amount: number
  createdAt: Date
  updatedAt: Date
}

export interface InvoiceRecord {
  orderID: string
  identityKey: string
  amount: number
  processed: boolean
  createdAt: Date
  updatedAt: Date
}
