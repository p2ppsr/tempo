const OPTIMIZED_LEGACY_ARTWORK: Record<string, string> = {
  XUTCR9YBAZ6fqmCBJ8KhgQqs4CSM1nc2iGDswzxH3534miHnhECL:
    '/artwork/optimized/XUTCR9YBAZ6fqmCBJ8KhgQqs4CSM1nc2iGDswzxH3534miHnhECL.webp',
  XUTfFGVWLiQXwTXtcjefmyu38uwZTK481yuSdCYXX5rLcSM8iPaG:
    '/artwork/optimized/XUTfFGVWLiQXwTXtcjefmyu38uwZTK481yuSdCYXX5rLcSM8iPaG.webp',
  XUUd2vXZME9Qq5z9yrhAgpUuuDFux53oV2njVvLDnTkpj2nSQHm3:
    '/artwork/optimized/XUUd2vXZME9Qq5z9yrhAgpUuuDFux53oV2njVvLDnTkpj2nSQHm3.webp',
  XUTPcH4jatjnLYCwmSviyjZw8oZQs9nKeP16vvhR34eThnNEJkbE:
    '/artwork/optimized/XUTPcH4jatjnLYCwmSviyjZw8oZQs9nKeP16vvhR34eThnNEJkbE.webp'
}

export function optimizedArtworkSource(source: string): string {
  const normalized = source.trim()
  return OPTIMIZED_LEGACY_ARTWORK[normalized] || normalized
}

