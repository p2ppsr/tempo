const MAX_ARTWORK_INPUT_BYTES = 32 * 1024 * 1024
export const MAX_ARTWORK_EDGE = 1200
export const TARGET_ARTWORK_BYTES = 400 * 1024

export interface ArtworkDimensions {
  width: number
  height: number
}

export function fitArtworkDimensions(
  width: number,
  height: number,
  maxEdge = MAX_ARTWORK_EDGE
): ArtworkDimensions {
  if (width <= 0 || height <= 0) throw new Error('Artwork dimensions must be positive.')
  const scale = Math.min(1, maxEdge / Math.max(width, height))
  return {
    width: Math.max(1, Math.round(width * scale)),
    height: Math.max(1, Math.round(height * scale))
  }
}

export function artworkNeedsNormalization(
  file: Pick<File, 'size' | 'type'>,
  dimensions: ArtworkDimensions
): boolean {
  return file.type !== 'image/webp' ||
    file.size > TARGET_ARTWORK_BYTES ||
    Math.max(dimensions.width, dimensions.height) > MAX_ARTWORK_EDGE
}

interface DecodedArtwork {
  source: CanvasImageSource
  width: number
  height: number
  dispose: () => void
}

async function decodeArtwork(file: File): Promise<DecodedArtwork> {
  if (typeof createImageBitmap === 'function') {
    const bitmap = await createImageBitmap(file)
    return {
      source: bitmap,
      width: bitmap.width,
      height: bitmap.height,
      dispose: () => bitmap.close()
    }
  }

  const objectUrl = URL.createObjectURL(file)
  const image = new Image()
  try {
    await new Promise<void>((resolve, reject) => {
      image.onload = () => resolve()
      image.onerror = () => reject(new Error('Tempo could not read this artwork file.'))
      image.src = objectUrl
    })
    return {
      source: image,
      width: image.naturalWidth,
      height: image.naturalHeight,
      dispose: () => URL.revokeObjectURL(objectUrl)
    }
  } catch (error) {
    URL.revokeObjectURL(objectUrl)
    throw error
  }
}

function canvasBlob(canvas: HTMLCanvasElement, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error('Tempo could not optimize this artwork.'))
        return
      }
      resolve(blob)
    }, 'image/webp', quality)
  })
}

function webpName(name: string): string {
  const base = name.replace(/\.[^.]+$/, '') || 'tempo-artwork'
  return `${base}.webp`
}

export async function normalizeArtworkFile(file: File): Promise<File> {
  if (!file.type.startsWith('image/')) throw new Error('Artwork must be an image file.')
  if (file.size > MAX_ARTWORK_INPUT_BYTES) {
    throw new Error('Artwork must be smaller than 32 MB before optimization.')
  }

  const decoded = await decodeArtwork(file)
  try {
    if (!artworkNeedsNormalization(file, decoded)) return file

    let dimensions = fitArtworkDimensions(decoded.width, decoded.height)
    let bestBlob: Blob | undefined

    for (let sizePass = 0; sizePass < 4; sizePass += 1) {
      const canvas = document.createElement('canvas')
      canvas.width = dimensions.width
      canvas.height = dimensions.height
      const context = canvas.getContext('2d', { alpha: true })
      if (!context) throw new Error('Artwork optimization is unavailable in this browser.')
      context.imageSmoothingEnabled = true
      context.imageSmoothingQuality = 'high'
      context.drawImage(decoded.source, 0, 0, dimensions.width, dimensions.height)

      for (const quality of [0.82, 0.74, 0.66]) {
        const blob = await canvasBlob(canvas, quality)
        if (!bestBlob || blob.size < bestBlob.size) bestBlob = blob
        if (blob.size <= TARGET_ARTWORK_BYTES) {
          return new File([blob], webpName(file.name), { type: 'image/webp', lastModified: Date.now() })
        }
      }

      const nextMaxEdge = Math.max(640, Math.round(MAX_ARTWORK_EDGE * Math.pow(0.82, sizePass + 1)))
      dimensions = fitArtworkDimensions(decoded.width, decoded.height, nextMaxEdge)
    }

    if (!bestBlob) throw new Error('Tempo could not optimize this artwork.')
    return new File([bestBlob], webpName(file.name), { type: 'image/webp', lastModified: Date.now() })
  } finally {
    decoded.dispose()
  }
}
