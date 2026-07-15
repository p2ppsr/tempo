import { useCallback, useEffect, useRef, useState } from 'react'
import { StorageUtils } from '@bsv/sdk'
import placeholderImage from '../../assets/Images/placeholder-image.png'
import { optimizedArtworkSource } from '../../utils/optimizedArtwork'
import { resolveStorageLocations } from '../../utils/storageReliability'

interface ArtworkImageProps {
  src?: string
  alt: string
  className?: string
  onClick?: () => void
  maxRetries?: number
  retryDelayMs?: number
}

const ArtworkImage = ({
  src,
  alt,
  className,
  onClick,
  maxRetries = 4,
  retryDelayMs = 900
}: ArtworkImageProps) => {
  const normalizedSrc = src?.trim() ? optimizedArtworkSource(src) : placeholderImage
  const [attempt, setAttempt] = useState(0)
  const [gaveUp, setGaveUp] = useState(false)
  const [resolvedSrc, setResolvedSrc] = useState(
    StorageUtils.isValidURL(normalizedSrc) ? '' : normalizedSrc
  )
  const retryTimerRef = useRef<number | null>(null)

  const clearRetryTimer = useCallback(() => {
    if (retryTimerRef.current !== null) {
      window.clearTimeout(retryTimerRef.current)
      retryTimerRef.current = null
    }
  }, [])

  useEffect(() => {
    clearRetryTimer()
    setAttempt(0)
    setGaveUp(false)
    setResolvedSrc(StorageUtils.isValidURL(normalizedSrc) ? '' : normalizedSrc)
  }, [normalizedSrc, clearRetryTimer])

  useEffect(() => () => clearRetryTimer(), [clearRetryTimer])

  const scheduleRetry = useCallback(() => {
    if (normalizedSrc === placeholderImage || gaveUp) return

    if (attempt >= maxRetries) {
      setGaveUp(true)
      return
    }

    if (retryTimerRef.current !== null) return

    retryTimerRef.current = window.setTimeout(() => {
      retryTimerRef.current = null
      setAttempt((prev) => prev + 1)
    }, retryDelayMs)
  }, [attempt, gaveUp, maxRetries, normalizedSrc, retryDelayMs])

  useEffect(() => {
    if (!StorageUtils.isValidURL(normalizedSrc) || gaveUp) return
    let cancelled = false

    const resolveArtwork = async () => {
      try {
        const locations = await resolveStorageLocations(normalizedSrc)
        if (cancelled) return
        if (locations.length === 0) {
          scheduleRetry()
          return
        }
        setResolvedSrc(locations[attempt % locations.length])
      } catch {
        if (!cancelled) scheduleRetry()
      }
    }

    void resolveArtwork()
    return () => { cancelled = true }
  }, [attempt, gaveUp, normalizedSrc, scheduleRetry])

  if (gaveUp || normalizedSrc === placeholderImage || !resolvedSrc) {
    return <img src={placeholderImage} alt={alt} className={className} onClick={onClick} loading="lazy" decoding="async" />
  }

  return (
    <img
      key={`${normalizedSrc}:${attempt}`}
      src={resolvedSrc}
      alt={alt}
      className={className}
      onClick={onClick}
      loading="lazy"
      decoding="async"
      onLoad={clearRetryTimer}
      onError={scheduleRetry}
    />
  )
}

export default ArtworkImage
