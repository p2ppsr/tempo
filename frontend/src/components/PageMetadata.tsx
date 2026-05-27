import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

const SITE_URL = 'https://tempomusic.net'
const DEFAULT_IMAGE = `${SITE_URL}/favicon.ico`

const metadata = {
  title: 'Tempo | Music Streaming and Publishing on BSV',
  description: 'Tempo is a BSV-powered music streaming and publishing app for artists and listeners, with direct ownership, sharing, and payments.'
}

const setMeta = (selector: string, attribute: 'content' | 'href', value: string) => {
  const element = document.head.querySelector(selector)
  if (element) element.setAttribute(attribute, value)
}

const PageMetadata = () => {
  const { pathname } = useLocation()

  useEffect(() => {
    const canonical = pathname === '/' ? `${SITE_URL}/` : `${SITE_URL}${pathname}`

    document.title = metadata.title
    setMeta('meta[name="description"]', 'content', metadata.description)
    setMeta('meta[name="robots"]', 'content', 'index,follow')
    setMeta('link[rel="canonical"]', 'href', canonical)
    setMeta('meta[property="og:url"]', 'content', canonical)
    setMeta('meta[property="og:title"]', 'content', metadata.title)
    setMeta('meta[property="og:description"]', 'content', metadata.description)
    setMeta('meta[property="og:image"]', 'content', DEFAULT_IMAGE)
    setMeta('meta[name="twitter:title"]', 'content', metadata.title)
    setMeta('meta[name="twitter:description"]', 'content', metadata.description)
    setMeta('meta[name="twitter:image"]', 'content', DEFAULT_IMAGE)
  }, [pathname])

  return null
}

export default PageMetadata
