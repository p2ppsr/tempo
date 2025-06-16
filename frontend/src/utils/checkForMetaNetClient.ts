import { WalletClient } from '@bsv/sdk'

export default async function checkForMetaNetClient(): Promise<number> {
  try {
    const client = new WalletClient('json-api', 'auto')
    await client.getPublicKey({ identityKey: true })
    return 1
  } catch {
    return 0
  }
}
