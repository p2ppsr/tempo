import type { PublicationAssetReceipt } from '../types/interfaces'

export type ProviderExpiryCheck = { host: string; expiryTime: number } | null

export function buildAssetReceipt(
  uhrpURL: string,
  checks: ProviderExpiryCheck[],
  nowSeconds = Math.floor(Date.now() / 1000)
): PublicationAssetReceipt {
  const active = checks.filter((result): result is { host: string; expiryTime: number } =>
    result !== null && result.expiryTime > nowSeconds)

  return {
    uhrpURL,
    expiryTime: active.length > 0 ? Math.min(...active.map(result => result.expiryTime)) : undefined,
    hostedBy: active.map(result => result.host),
    available: active.length >= 2
  }
}
