import { WalletClient } from '@bsv/sdk'

export default async function checkForMetaNetClient(): Promise<number> {
  try {
    const client = new WalletClient('auto', 'localhost')
    await client.getPublicKey({ identityKey: true })
    return 1
  } catch {
    return 0
  }
}
