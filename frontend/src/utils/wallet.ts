import BabbageGo from '@babbage/go'
import { WalletClient, type WalletInterface } from '@bsv/sdk'
import { captureError, captureSignal } from './usercom'

const baseWallet = new WalletClient('auto', 'localhost')

const interactiveWallet = new BabbageGo(baseWallet, {
  showModal: true,
  hangOnWalletErrors: false,
  readOnlyFallbacks: false,
  design: {
    preset: 'auroraPulse',
    tokens: {
      accentBackground: 'linear-gradient(135deg, #8b7cff, #35d6c3)',
      accentText: '#071018',
      cardBackground: '#101522',
      cardBorder: 'rgba(255,255,255,.14)',
      cardRadius: '24px',
      textPrimary: '#f7f8ff',
      textMuted: '#b6bdcf',
      buttonShape: 'pill'
    }
  },
  walletUnavailable: {
    title: 'Open Tempo with Metanet',
    message: 'Browsing and previews work here. Open Tempo in Metanet Explorer when you are ready to publish or purchase music.',
    ctaText: 'Open with Metanet'
  },
  funding: {
    title: 'Add sats to keep the music moving',
    introText: 'Tempo needs a small wallet payment for this action. Add sats, then retry without losing your place.',
    buySatsText: 'Add sats',
    retryText: 'Retry action',
    cancelText: 'Not now'
  }
})

export const getInteractiveWallet = (): WalletInterface => interactiveWallet

export async function connectWallet(): Promise<string> {
  captureSignal('wallet.connect_started', { surface: 'wallet-onboarding' })
  try {
    const { publicKey } = await interactiveWallet.getPublicKey({ identityKey: true })
    captureSignal('wallet.connect_succeeded', { surface: 'wallet-onboarding' })
    return publicKey.toString()
  } catch (error) {
    captureError('wallet.connect_failed', error, {}, ['wallet_failed'])
    throw error
  }
}

export function detectedWalletSurface(): string {
  if (typeof window === 'undefined') return 'server'
  const candidate = window as typeof window & {
    ReactNativeWebView?: unknown
    CWI?: unknown
    wallet?: unknown
    metaid?: unknown
  }
  if (candidate.ReactNativeWebView) return 'metanet-explorer'
  if (candidate.CWI) return 'window-cwi'
  if (candidate.wallet) return 'window-wallet'
  if (candidate.metaid) return 'legacy-metaid'
  return 'browser'
}
