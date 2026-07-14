import { StorageDownloader, StorageUtils } from '@bsv/sdk'
import type { Song, SongAvailability } from '../types/interfaces'
import constants from './constants'
import { captureError, captureSignal } from './usercom'

const downloader = new StorageDownloader({ networkPreset: constants.overlayNetworkPreset })
const CACHE_MS = 5 * 60 * 1000
const cache = new Map<string, { checkedAt: number; availability: SongAvailability }>()

export function normalizeUhrpReference(value?: string): string | undefined {
  if (!value) return undefined
  let candidate = value.trim()
  try {
    const parsed = new URL(candidate)
    if (parsed.hostname.includes('uhrp')) candidate = parsed.pathname.split('/').filter(Boolean).pop() || ''
  } catch {
    // Bare UHRP identifiers are expected.
  }
  return StorageUtils.isValidURL(candidate) ? StorageUtils.normalizeURL(candidate) : undefined
}

export function isBundledAsset(value?: string): boolean {
  if (!value) return false
  try {
    const parsed = new URL(value, window.location.origin)
    return parsed.origin === window.location.origin &&
      (parsed.pathname.startsWith('/assets/') || parsed.pathname.startsWith('/src/assets/'))
  } catch {
    return value.startsWith('/assets/') || value.startsWith('/src/assets/')
  }
}

async function activeHosts(value?: string): Promise<string[]> {
  const reference = normalizeUhrpReference(value)
  if (!reference) return []
  try {
    return await downloader.resolve(reference)
  } catch {
    return []
  }
}

async function keyAvailable(songURL: string): Promise<{ available: boolean; priceSatoshis?: number }> {
  const controller = new AbortController()
  const timeout = window.setTimeout(() => controller.abort(), 6000)
  try {
    const url = new URL('/availability', constants.keyServerURL)
    url.searchParams.set('songURL', songURL)
    const response = await fetch(url, { signal: controller.signal })
    if (!response.ok) return { available: false }
    const result = await response.json() as { available?: boolean; priceSatoshis?: number }
    return { available: result.available === true, priceSatoshis: result.priceSatoshis }
  } finally {
    window.clearTimeout(timeout)
  }
}

export async function inspectSongAvailability(song: Song): Promise<SongAvailability> {
  if (isBundledAsset(song.decryptedSongURL || song.songURL)) {
    return { status: 'playable', checkedAt: new Date().toISOString(), audioHosts: 1, previewHosts: 1, hasKey: false }
  }

  const cacheKey = `${song.songURL}|${song.previewURL || ''}`
  const cached = cache.get(cacheKey)
  if (cached && Date.now() - cached.checkedAt < CACHE_MS) return cached.availability

  const normalizedSongURL = normalizeUhrpReference(song.songURL)
  const normalizedPreviewURL = normalizeUhrpReference(song.previewURL)
  if (!normalizedSongURL) {
    return { status: 'invalid', checkedAt: new Date().toISOString(), reason: 'invalid_song_url', audioHosts: 0, previewHosts: 0, hasKey: false }
  }

  try {
    const [audioHosts, previewHosts, key] = await Promise.all([
      activeHosts(normalizedSongURL),
      normalizedPreviewURL ? activeHosts(normalizedPreviewURL) : Promise.resolve([]),
      keyAvailable(normalizedSongURL)
    ])
    const playable = audioHosts.length > 0 && key.available && (!normalizedPreviewURL || previewHosts.length > 0)
    const availability: SongAvailability = {
      status: playable ? 'playable' : 'expired',
      checkedAt: new Date().toISOString(),
      reason: playable
        ? undefined
        : audioHosts.length === 0
          ? 'audio_not_hosted'
          : !key.available
            ? 'key_not_available'
            : 'preview_not_hosted',
      audioHosts: audioHosts.length,
      previewHosts: previewHosts.length,
      hasKey: key.available,
      priceSatoshis: key.priceSatoshis
    }
    cache.set(cacheKey, { checkedAt: Date.now(), availability })
    return availability
  } catch (error) {
    captureError('catalog.availability_failed', error, { title: song.title })
    return { status: 'unknown', checkedAt: new Date().toISOString(), reason: 'availability_check_failed', audioHosts: 0, previewHosts: 0, hasKey: false }
  }
}

export async function filterPlayableSongs(songs: Song[]): Promise<Song[]> {
  const results: Song[] = []
  const excluded: Record<string, number> = {}
  let cursor = 0

  const worker = async () => {
    while (cursor < songs.length) {
      const song = songs[cursor++]
      const availability = await inspectSongAvailability(song)
      if (availability.status === 'playable') {
        results.push({
          ...song,
          songURL: normalizeUhrpReference(song.songURL) || song.songURL,
          previewURL: normalizeUhrpReference(song.previewURL),
          availability
        })
      } else {
        const reason = availability.reason || availability.status
        excluded[reason] = (excluded[reason] || 0) + 1
      }
    }
  }

  await Promise.all(Array.from({ length: Math.min(4, songs.length) }, () => worker()))
  captureSignal('catalog.availability_completed', {
    surface: 'catalog',
    context: { candidates: songs.length, playable: results.length, excluded }
  })
  return results
}

export async function downloadPlayableFile(value: string): Promise<string> {
  if (isBundledAsset(value)) return value
  const reference = normalizeUhrpReference(value)
  if (!reference) throw new Error('This audio URL is invalid.')
  const result = await downloader.download(reference)
  return URL.createObjectURL(new Blob([result.data], { type: result.mimeType || 'audio/mpeg' }))
}
