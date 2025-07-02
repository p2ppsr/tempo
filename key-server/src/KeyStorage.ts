/**
 * @file KeyStorage.ts
 * @description
 * Implements the `KeyStorage` class for interacting with MongoDB collections
 * used by Tempo. Handles management of encryption key records, user balances,
 * royalty tracking, outgoing royalty payments, and invoices related to
 * song purchases and distribution.
 */

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

/**
 * KeyStorage class
 *
 * Provides methods to store, retrieve, and update records in MongoDB for:
 * - Keys (encryption keys for songs)
 * - Balances (user/artist balances)
 * - Royalties (royalty distribution tracking)
 * - Payments (outgoing royalty payments)
 * - Invoices (sales and purchase records)
 */
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

  /**
   * Stores a new key record in the keys collection.
   */
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

  /**
   * Deletes a key record from the keys collection.
   */
  async deleteKeyRecord(fileUrl: string): Promise<void> {
    await this.records.deleteOne({ fileUrl })
  }

  /**
   * Finds a key record by its file URL.
   * Returns null if no record is found.
   */
  async findKeyByFileUrl(fileUrl: string): Promise<KeyRecord | null> {
    return await this.records.findOne({ fileUrl })
  }

  /**
   * Finds all key records in the keys collection.
   */
  async findAllKeys(): Promise<KeyRecord[]> {
    return await this.records.find({}).toArray()
  }

  // ========== BALANCES ==========

  /**
   * Increments the balance for a given public key.
   */
  async incrementBalance(publicKey: string, amount: number): Promise<void> {
    if (amount <= 0) return
    await this.balances.updateOne(
      { publicKey },
      { $inc: { balance: amount } },
      { upsert: true }
    )
  }

  /**
   * Retrieves the balance for a given public key.
   */
  async getBalance(publicKey: string): Promise<number> {
    const result = await this.balances.findOne({ publicKey })
    return result?.balance ?? 0
  }

  /**
   * Sets the balance for a given public key.
   */
  async setBalance(publicKey: string, newBalance: number): Promise<void> {
    await this.balances.updateOne(
      { publicKey },
      { $set: { balance: newBalance } },
      { upsert: true }
    )
  }

  // ========== ROYALTIES ==========

  /**
   * Adds a new royalty record to the royalties collection.
   */
  async addRoyaltyRecord(record: RoyaltyRecord): Promise<void> {
    await this.royalties.insertOne({
      ...record,
      createdAt: new Date(),
      updatedAt: new Date()
    })
  }

  /**
   * Marks a royalty record as paid.
   */
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

  /**
   * Retrieves all unpaid royalty records.
   */
  async getUnpaidRoyalties(): Promise<RoyaltyRecord[]> {
    return await this.royalties.find({ paid: false }).toArray()
  }

  // ========== PAYMENTS ==========

  /**
   * Logs an outgoing royalty payment record.
   */
  async logOutgoingPayment(record: OutgoingRoyaltyPayment): Promise<void> {
    await this.payments.insertOne({
      ...record,
      createdAt: new Date(),
      updatedAt: new Date()
    })
  }

  // ========== INVOICES ==========

  /**
   * Finds a key record by its song URL.
   * Returns null if no record is found.
   */
  async findKeyBySongURL(songURL: string): Promise<{ keyID: string } | null> {
    const record = await this.records.findOne({ fileUrl: songURL })
    return record ? { keyID: record.encryptionKey } : null
    }

    /**
     * Inserts a new invoice record into the invoices collection.
     */
    async insertInvoice(invoice: InvoiceRecord): Promise<void> {
        await this.invoices.insertOne({
            ...invoice,
            createdAt: new Date(),
            updatedAt: new Date()
        })
    }

  /**
   * Finds an invoice by its identity key, key ID, and order ID.
   */
      async findInvoice(identityKey: string, keyID: string, orderID: string): Promise<InvoiceRecord | null> {
    return await this.invoices.findOne({
      identityKey,
      keyID,
      orderID
    })
  }

  /**
   * Marks an invoice as processed, updating the reference number and processed status.
   */
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

  /**
   * Finds an invoice by its song URL.
   * Returns null if no record is found.
   */
  async findSatsbySongURL(songURL: string): Promise<InvoiceRecord | null> {
    return await this.invoices.findOne({ fileUrl: songURL })
  }

}
