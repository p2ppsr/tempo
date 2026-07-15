import { Hash, LookupResolver, PushDrop, StorageUtils, Transaction, Utils } from '@bsv/sdk'
import constants from './constants'

const STORAGE_ATTEMPTS = 3
const lookupReputationStorage = { get: () => null, set: () => undefined }
const wait = async (milliseconds: number) => await new Promise(resolve => window.setTimeout(resolve, milliseconds))

function normalizeReference(value: string): string {
  if (!StorageUtils.isValidURL(value)) throw new Error('This storage URL is invalid.')
  return StorageUtils.normalizeURL(value)
}

export async function resolveStorageLocations(value: string): Promise<string[]> {
  const uhrpUrl = normalizeReference(value)
  const resolver = new LookupResolver({
    networkPreset: constants.overlayNetworkPreset,
    hostOverrides: { ls_uhrp: constants.uhrpLookupHosts },
    reputationStorage: lookupReputationStorage
  })
  let outputs: Array<{ beef: number[]; outputIndex: number }> = []
  // Consume the final progressive result. query() intentionally returns the
  // first post-grace snapshot, which can omit a slower primary overlay.
  for await (const response of resolver.query$(
    { service: 'ls_uhrp', query: { uhrpUrl } },
    5000,
    { graceMs: 750 }
  )) {
    outputs = response.outputs
  }
  const currentTime = Math.floor(Date.now() / 1000)
  const locations: string[] = []

  for (const output of outputs) {
    try {
      const transaction = Transaction.fromBEEF(output.beef)
      const { fields } = PushDrop.decode(transaction.outputs[output.outputIndex].lockingScript)
      const expiryTime = new Utils.Reader(fields[3]).readVarIntNum()
      const location = Utils.toUTF8(fields[2])
      if (expiryTime >= currentTime && /^https:\/\//i.test(location)) locations.push(location)
    } catch {
      // Ignore malformed overlay records; valid nonexpired locations still win.
    }
  }

  return [...new Set(locations)]
}

export async function downloadStorageObject(value: string) {
  const uhrpUrl = normalizeReference(value)
  const expectedHash = Utils.toHex(StorageUtils.getHashFromURL(uhrpUrl))
  let lastError: unknown

  for (let attempt = 0; attempt < STORAGE_ATTEMPTS; attempt += 1) {
    try {
      const locations = await resolveStorageLocations(uhrpUrl)
      for (const location of locations) {
        try {
          const response = await fetch(location)
          if (!response.ok) continue
          const data = new Uint8Array(await response.arrayBuffer())
          const actualHash = Utils.toHex(new Hash.SHA256().update(Array.from(data)).digest())
          if (actualHash !== expectedHash) continue
          return { data, mimeType: response.headers.get('Content-Type') }
        } catch {
          // Try the next independently advertised location.
        }
      }
      lastError = new Error('No active storage location returned valid content.')
    } catch (error) {
      lastError = error
    }

    if (attempt < STORAGE_ATTEMPTS - 1) await wait(250 * (attempt + 1))
  }

  throw lastError instanceof Error ? lastError : new Error('Tempo could not download this storage object.')
}
