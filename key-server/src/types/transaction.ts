// src/types/transaction.ts
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
