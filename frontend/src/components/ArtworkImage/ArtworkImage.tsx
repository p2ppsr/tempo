import { useCallback, useEffect, useRef, useState } from 'react'
import { Img } from '@bsv/uhrp-react'
import placeholderImage from '../../assets/Images/placeholder-image.png'

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
  const normalizedSrc = src?.trim() ? src : placeholderImage
  const [attempt, setAttempt] = useState(0)
  const [gaveUp, setGaveUp] = useState(false)
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

  if (gaveUp || normalizedSrc === placeholderImage) {
    return <img src={placeholderImage} alt={alt} className={className} onClick={onClick} />
  }

  return (
    <Img
      key={`${normalizedSrc}:${attempt}`}
      src={normalizedSrc}
      alt={alt}
      className={className}
      onClick={onClick}
      onLoad={clearRetryTimer}
      onError={scheduleRetry}
      fallback={
        <img
          src={placeholderImage}
          alt={alt}
          className={className}
          onClick={onClick}
          onLoad={scheduleRetry}
        />
      }
    />
  )
}

export default ArtworkImage
