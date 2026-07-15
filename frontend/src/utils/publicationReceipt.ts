import type { PublicationAssetReceipt } from '../types/interfaces'

export type ProviderExpiryCheck = { host: string; expiryTime: number } | null

export function expiryFromRetention(
  retentionMinutes: number,
  nowSeconds = Math.floor(Date.now() / 1000)
): number | undefined {
  if (!Number.isFinite(retentionMinutes) || retentionMinutes <= 0) return undefined
  return nowSeconds + Math.floor(retentionMinutes * 60)
}

export function earliestAssetExpiry(
  assets: Array<PublicationAssetReceipt | undefined>
): number | undefined {
  const expiries = assets
    .map(asset => asset?.expiryTime)
    .filter((expiry): expiry is number => Number.isFinite(expiry) && (expiry ?? 0) > 0)
  return expiries.length > 0 ? Math.min(...expiries) : undefined
}

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
