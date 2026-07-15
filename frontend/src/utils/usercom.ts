const USERCOM_BASE_URL = 'https://usercom.babbage.systems'
const SOURCE = 'tempomusic.net'

type Context = Record<string, unknown>
type SignalOptions = { surface?: string; tags?: string[]; context?: Context }

function storedId(storage: Storage | undefined, key: string): string {
  try {
    const existing = storage?.getItem(key)
    if (existing) return existing
    const next = globalThis.crypto?.randomUUID?.() || `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`
    storage?.setItem(key, next)
    return next
  } catch {
    return 'storage-unavailable'
  }
}

function isSensitive(key: string): boolean {
  const normalized = key
    .replace(/([a-z0-9])([A-Z])/g, '$1_$2')
    .replace(/[-\s]+/g, '_')
    .toLowerCase()
  return normalized === 'key' ||
    normalized.endsWith('_key') ||
    /(^|_)(secret|signature|beef|token|password|transaction|tx|txid)($|_)/.test(normalized)
}

export function sanitizeUsercomContext(value: unknown, depth = 0): unknown {
  if (depth > 3) return '[truncated]'
  if (typeof value === 'string') {
    return value
      .replace(/\b[0-9a-f]{64}\b/gi, '[redacted]')
      .replace(/\b[A-Za-z0-9+/]{43}=\b/g, '[redacted]')
      .slice(0, 1000)
  }
  if (Array.isArray(value)) return value.slice(0, 20).map(item => sanitizeUsercomContext(item, depth + 1))
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value as Context).slice(0, 40).map(([key, child]) => [
      key,
      isSensitive(key) ? '[redacted]' : sanitizeUsercomContext(child, depth + 1)
    ]))
  }
  return value
}

function basePayload(name: string, options: SignalOptions = {}): Record<string, unknown> {
  return {
    source: SOURCE,
    name,
    surface: options.surface || 'web-app',
    url: typeof location === 'undefined' ? undefined : location.href,
    path: typeof location === 'undefined' ? undefined : `${location.pathname}${location.search}`,
    referrer: typeof document === 'undefined' ? undefined : document.referrer,
    anonymousId: storedId(typeof window === 'undefined' ? undefined : localStorage, 'tempo:usercom:anonymous'),
    sessionId: storedId(typeof window === 'undefined' ? undefined : sessionStorage, 'tempo:usercom:session'),
    tags: options.tags || [],
    context: sanitizeUsercomContext({
      release: import.meta.env.VITE_RELEASE || 'development',
      viewport: typeof window === 'undefined' ? undefined : `${window.innerWidth}x${window.innerHeight}`,
      online: typeof navigator === 'undefined' ? undefined : navigator.onLine,
      ...options.context
    })
  }
}

async function post(path: string, payload: unknown): Promise<void> {
  const response = await fetch(`${USERCOM_BASE_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    keepalive: true,
    credentials: 'omit'
  })
  if (!response.ok) throw new Error(`UserCom request failed (${response.status})`)
}

export function captureSignal(name: string, options: SignalOptions = {}): void {
  void post('/signal', basePayload(name, options)).catch(() => undefined)
}

export function captureError(name: string, error: unknown, context: Context = {}, tags: string[] = []): void {
  const details = error instanceof Error ? { name: error.name, message: error.message } : { message: String(error) }
  captureSignal(name, { surface: 'client-error', tags: ['error', ...tags], context: { ...context, error: details } })
}

export async function submitFeedback(input: {
  feedback: string
  email?: string
  category?: string
  contactConsent?: boolean
}): Promise<void> {
  await post('/submit', {
    ...basePayload('feedback.submitted', {
      surface: 'feedback-form',
      tags: ['intent:tempo-feedback', `category:${input.category || 'general'}`]
    }),
    type: 'feedback',
    subject: `Tempo feedback: ${input.category || 'General'}`,
    feedback: input.feedback.trim().slice(0, 5000),
    email: input.email?.trim() || undefined,
    contactConsent: Boolean(input.contactConsent)
  })
}
