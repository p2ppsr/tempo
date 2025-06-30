import { Collection, Db, ObjectId } from 'mongodb'
import dotenv from 'dotenv'
import {
  KeyRecord,
  BalanceRecord,
  RoyaltyRecord,
  OutgoingRoyaltyPayment,
  InvoiceRecord
} from './types.js'

dotenv.config()

const KEY_COLLECTION_NAME = process.env.KEY_COLLECTION_NAME || 'keys'
const BALANCE_COLLECTION_NAME = process.env.BALANCE_COLLECTION_NAME || 'balances'
const ROYALTY_COLLECTION_NAME = 'royalties'
const PAYMENT_COLLECTION_NAME = 'outgoingRoyaltyPayments'
const INVOICE_COLLECTION_NAME = 'invoices'

export class KeyStorage {
  private readonly records: Collection<KeyRecord>
  private readonly balances: Collection<BalanceRecord>
  private readonly royalties: Collection<RoyaltyRecord>
  private readonly payments: Collection<OutgoingRoyaltyPayment>
  private readonly invoices: Collection<InvoiceRecord>

  constructor(private readonly db: Db) {
    this.records = db.collection(KEY_COLLECTION_NAME)
    this.balances = db.collection(BALANCE_COLLECTION_NAME)
    this.royalties = db.collection(ROYALTY_COLLECTION_NAME)
    this.payments = db.collection(PAYMENT_COLLECTION_NAME)
    this.invoices = db.collection(INVOICE_COLLECTION_NAME)

  }

  // ========== KEYS ==========

  async storeKeyRecord(
    fileUrl: string,
    encryptionKey: string,
    satoshis: number,
    publicKey: string,
    artistIdentityKey?: string
  ): Promise<void> {
    await this.records.insertOne({
      fileUrl,
      encryptionKey,
      satoshis,
      publicKey,
      artistIdentityKey
    })
  }

  async deleteKeyRecord(fileUrl: string): Promise<void> {
    await this.records.deleteOne({ fileUrl })
  }

  async findKeyByFileUrl(fileUrl: string): Promise<KeyRecord | null> {
    return await this.records.findOne({ fileUrl })
  }

  async findAllKeys(): Promise<KeyRecord[]> {
    return await this.records.find({}).toArray()
  }

  // ========== BALANCES ==========

  async incrementBalance(publicKey: string, amount: number): Promise<void> {
    if (amount <= 0) return
    await this.balances.updateOne(
      { publicKey },
      { $inc: { balance: amount } },
      { upsert: true }
    )
  }

  async getBalance(publicKey: string): Promise<number> {
    const result = await this.balances.findOne({ publicKey })
    return result?.balance ?? 0
  }

  async setBalance(publicKey: string, newBalance: number): Promise<void> {
    await this.balances.updateOne(
      { publicKey },
      { $set: { balance: newBalance } },
      { upsert: true }
    )
  }

  // ========== ROYALTIES ==========

  async addRoyaltyRecord(record: RoyaltyRecord): Promise<void> {
    await this.royalties.insertOne({
      ...record,
      createdAt: new Date(),
      updatedAt: new Date()
    })
  }

  async markRoyaltyPaid(recordId: string, paymentId: string): Promise<void> {
  await this.royalties.updateOne(
    { _id: new ObjectId(recordId) },
    {
      $set: {
        paid: true,
        paymentId,
        updatedAt: new Date()
      }
    }
  )
}

  async getUnpaidRoyalties(): Promise<RoyaltyRecord[]> {
    return await this.royalties.find({ paid: false }).toArray()
  }

  // ========== PAYMENTS ==========

  async logOutgoingPayment(record: OutgoingRoyaltyPayment): Promise<void> {
    await this.payments.insertOne({
      ...record,
      createdAt: new Date(),
      updatedAt: new Date()
    })
  }

  // ========== INVOICES ==========
  async findKeyBySongURL(songURL: string): Promise<{ keyID: string } | null> {
    const record = await this.records.findOne({ fileUrl: songURL })
    return record ? { keyID: record.encryptionKey } : null
    }

    async insertInvoice(invoice: InvoiceRecord): Promise<void> {
        await this.invoices.insertOne({
            ...invoice,
            createdAt: new Date(),
            updatedAt: new Date()
        })
    }

      async findInvoice(identityKey: string, keyID: string, orderID: string): Promise<InvoiceRecord | null> {
    return await this.invoices.findOne({
      identityKey,
      keyID,
      orderID
    })
  }

  async markInvoiceProcessed(params: {
    keyID: string
    identityKey: string
    orderID: string
    referenceNumber: string
  }): Promise<void> {
    const { keyID, identityKey, orderID, referenceNumber } = params

    await this.invoices.updateOne(
      {
        keyID,
        identityKey,
        orderID,
        processed: false
      },
      {
        $set: {
          referenceNumber,
          processed: true,
          updatedAt: new Date()
        }
      }
    )
  }

  async findSatsbySongURL(songURL: string): Promise<InvoiceRecord | null> {
    return await this.invoices.findOne({ fileUrl: songURL })
  }

}
