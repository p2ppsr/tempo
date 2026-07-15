import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  artworkNeedsNormalization,
  fitArtworkDimensions,
  MAX_ARTWORK_EDGE,
  normalizeArtworkFile,
  TARGET_ARTWORK_BYTES
} from './artworkOptimization'
import { optimizedArtworkSource } from './optimizedArtwork'

describe('artwork optimization', () => {
  afterEach(() => {
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
  })

  it('preserves aspect ratio while constraining the longest edge', () => {
    expect(fitArtworkDimensions(1024, 1536)).toEqual({ width: 800, height: 1200 })
    expect(fitArtworkDimensions(600, 600)).toEqual({ width: 600, height: 600 })
  })

  it('normalizes oversized, over-dimensioned, and non-WebP artwork', () => {
    expect(artworkNeedsNormalization(
      { size: TARGET_ARTWORK_BYTES + 1, type: 'image/webp' },
      { width: 1000, height: 1000 }
    )).toBe(true)
    expect(artworkNeedsNormalization(
      { size: 1000, type: 'image/webp' },
      { width: MAX_ARTWORK_EDGE + 1, height: 1000 }
    )).toBe(true)
    expect(artworkNeedsNormalization(
      { size: 1000, type: 'image/png' },
      { width: 1000, height: 1000 }
    )).toBe(true)
    expect(artworkNeedsNormalization(
      { size: 1000, type: 'image/webp' },
      { width: 1000, height: 1000 }
    )).toBe(false)
  })

  it('uses bundled renditions for known oversized immutable catalogue covers', () => {
    const reference = 'XUTCR9YBAZ6fqmCBJ8KhgQqs4CSM1nc2iGDswzxH3534miHnhECL'
    expect(optimizedArtworkSource(reference)).toBe(`/artwork/optimized/${reference}.webp`)
    expect(optimizedArtworkSource('https://example.com/cover.webp')).toBe('https://example.com/cover.webp')
  })

  it('converts a large upload to a constrained WebP before publication', async () => {
    const close = vi.fn()
    vi.stubGlobal('createImageBitmap', vi.fn().mockResolvedValue({ width: 2400, height: 1200, close }))
    const context = {
      drawImage: vi.fn(),
      imageSmoothingEnabled: false,
      imageSmoothingQuality: 'low'
    }
    const canvas = {
      width: 0,
      height: 0,
      getContext: vi.fn(() => context),
      toBlob: vi.fn((callback: BlobCallback) => callback(new Blob([new Uint8Array(120_000)], { type: 'image/webp' })))
    } as unknown as HTMLCanvasElement
    const originalCreateElement = document.createElement.bind(document)
    vi.spyOn(document, 'createElement').mockImplementation((tagName: string) => (
      tagName === 'canvas' ? canvas : originalCreateElement(tagName)
    ))

    const input = new File([new Uint8Array(TARGET_ARTWORK_BYTES + 1)], 'cover.png', { type: 'image/png' })
    const output = await normalizeArtworkFile(input)

    expect(output.type).toBe('image/webp')
    expect(output.name).toBe('cover.webp')
    expect(canvas.width).toBe(1200)
    expect(canvas.height).toBe(600)
    expect(close).toHaveBeenCalledOnce()
  })
})
