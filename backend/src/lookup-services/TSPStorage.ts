/**
 * TSPStorage class provides methods to store, delete, and query TSP records in a MongoDB database.
 * It allows for fuzzy searching of records based on various attributes such as artist identity key,
 * song title, artist name, and more.
 */

import { Collection, Db } from "mongodb"
import { UTXOReference, TSPAttributes, TSPQuery, TSPRecord } from "../types";

export class TSPStorage {

  private records: Collection<TSPRecord>

  /**
   * Constructs a new TSPStorage instance
   * @param {Db} db - connected mongo database instance
   */
  constructor(private db: Db) {
    this.records = db.collection<TSPRecord>("tspRecords")
    this.records.createIndex({ "searchableAttributes": "text" })
  }

  /**
   * Stores a new TSP record
   * @param {string} txid transaction id
   * @param {number} outputIndex index of the UTXO
   * @param {TSPAttributes} record TSP record to store
   */
  async storeRecord(txid: string, outputIndex: number, record: TSPAttributes): Promise<void> {
    // Destructure with default values to ensure all required fields are present
    const {
      artistIdentityKey = "",
      songTitle = "",
      artistName = "",
      description = "",
      duration = "",
      songFileURL = "",
      artFileURL = "",
      previewURL = ""
    } = record

    // Insert new record
    const newRecord: TSPRecord = {
      txid,
      outputIndex,
      artistIdentityKey,
      songTitle,
      artistName,
      description,
      duration,
      songFileURL,
      artFileURL,
      createdAt: new Date(),
      searchableAttributes: [
        artistIdentityKey,
        songTitle,
        artistName,
        description,
        duration,
        songFileURL,
        artFileURL,
        previewURL
      ].filter(value => value !== undefined && value !== "").join(' ')
    }

    await this.records.insertOne(newRecord)
  }

  /**
   * Delete a matching TSP record
   * @param {string} txid transaction id
   * @param {number} outputIndex index of the UTXO
   */
  async deleteRecord(txid: string, outputIndex: number): Promise<void> {
    await this.records.deleteOne({ txid, outputIndex })
  }

  // Helper function to convert a string into a regex pattern for fuzzy search
  private getFuzzyRegex(input: string): RegExp {
    const escapedInput = input.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    return new RegExp(escapedInput.split('').join('.*'), 'i')
  }

  /**
   * Find one or more matching records by attribute
   * @param {TSPAttributes} attributes certified attributes to query by
   * @returns {Promise<UTXOReference[]>} returns matching UTXO references
   */
  async findByAttribute(attributes: TSPAttributes): Promise<UTXOReference[]> {
    // Make sure valid query attributes are provided
    if (!attributes || Object.keys(attributes).length === 0) {
      return []
    }

    // Initialize the query
    const query: TSPQuery = {
      $and: []
    }

    // Construct regex queries for specific fields
    const attributeQueries = Object.entries(attributes).map(([key, value]) => ({
      [`${key}`]: this.getFuzzyRegex(value)
    }))
    query.$and.push(...attributeQueries)

    // Find matching results from the DB
    return await this.findRecordWithQuery(query)
  }

  /**
   * Finds matching records by artist identity key
   * @param {string} artistIdentityKey the public identity key to query by
   * @returns {Promise<UTXOReference[]>} returns matching UTXO references
   */
  async findByArtistIdentityKey(artistIdentityKey: string): Promise<UTXOReference[]> {
    // Validate search query param
    if (!artistIdentityKey) {
      return []
    }

    // Construct the base query with the artistIdentityKey
    const query = {
      artistIdentityKey
    }

    // Find matching results from the DB
    return await this.findRecordWithQuery(query)
  }

  /**
   * Find one or more records by matching song title
   * @param {string} songTitle song title to query by
   * @returns {Promise<UTXOReference[]>} returns matching UTXO references
   */
  async findBySongTitle(songTitle: string): Promise<UTXOReference[]> {
    // Validate search query param
    if (!songTitle) {
      return []
    }

    // Construct the query with songTitle
    const query = {
      songTitle: this.getFuzzyRegex(songTitle)
    }

    // Find matching results from the DB
    return await this.findRecordWithQuery(query)
  }

  /**
   * Find one or more records by matching artist name
   * @param {string} artistName artist name to query by
   * @returns {Promise<UTXOReference[]>} returns matching UTXO references
   */
  async findByArtistName(artistName: string): Promise<UTXOReference[]> {
    // Validate search query param
    if (!artistName) {
      return []
    }

    // Construct the query with artistName
    const query = {
      artistName: this.getFuzzyRegex(artistName)
    }

    // Find matching results from the DB
    return await this.findRecordWithQuery(query)
  }

  /**
   * Find one or more records by matching song IDs
   * @param {string[]} songIDs song IDs to query by
   * @returns {Promise<UTXOReference[]>} returns matching UTXO references
   */
  async findBySongIDs(songIDs: string[]): Promise<UTXOReference[]> {
    // Validate search query param
    if (!songIDs || songIDs.length === 0) {
      return []
    }

    // Construct the query to search for any of the song IDs
    const query = {
      'songFileURL': { $in: songIDs }
    }

    // Find matching results from the DB
    return await this.findRecordWithQuery(query)
  }

  /**
   * Find all records in the storage
   * @returns {Promise<UTXOReference[]>} returns all UTXO references
   */
  async findAll(): Promise<UTXOReference[]> {
    // Find all results from the DB
    const results = await this.records.find({}).project({ txid: 1, outputIndex: 1 }).toArray()

    // Convert array of Documents to UTXOReferences
    const parsedResults: UTXOReference[] = results.map(record => ({
      txid: record.txid,
      outputIndex: record.outputIndex,
    }))
    return parsedResults
  }

  /**
   * Helper function for querying from the database
   * @param {object} query 
   * @returns {Promise<UTXOReference[]>} returns matching UTXO references
   */
  private async findRecordWithQuery(query: object): Promise<UTXOReference[]> {
    // Find matching results from the DB
    const results = await this.records.find(query).project({ txid: 1, outputIndex: 1 }).toArray()

    // Convert array of Documents to UTXOReferences
    const parsedResults: UTXOReference[] = results.map(record => ({
      txid: record.txid,
      outputIndex: record.outputIndex,
    }))
    return parsedResults
  }

  /**
   * Checks whether a record with the given songFileURL exists in the database.
   * Useful for preventing duplicate uploads or identifying previously registered files.
   * 
   * @param {string} songFileURL - The URL of the song file to check for.
   * @returns {Promise<boolean>} - Returns true if a matching record exists, false otherwise.
   */
  async isSongFileURLInDatabase(songFileURL: string): Promise<boolean> {
    const count = await this.records.countDocuments({ songFileURL })
    return count > 0
  }
}
