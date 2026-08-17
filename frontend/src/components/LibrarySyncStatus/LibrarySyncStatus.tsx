import { useLibraryStore } from '../../stores/libraryStore'
import './LibrarySyncStatus.scss'

interface LibrarySyncStatusProps {
  showReady?: boolean
}

const LibrarySyncStatus = ({ showReady = false }: LibrarySyncStatusProps) => {
  const status = useLibraryStore(state => state.syncStatus)
  const initializeLibrary = useLibraryStore(state => state.initializeLibrary)

  if (status === 'idle' || (status === 'ready' && !showReady)) return null

  if (status === 'offline') {
    return (
      <div className="librarySyncStatus librarySyncStatusOffline" role="status">
        <span>Saved on this device. Open Tempo with your wallet to sync everywhere.</span>
        <button type="button" onClick={() => void initializeLibrary(true)}>Retry sync</button>
      </div>
    )
  }

  return (
    <div className="librarySyncStatus" role="status">
      <span className="librarySyncDot" aria-hidden="true" />
      {status === 'loading' && 'Loading your wallet library…'}
      {status === 'saving' && 'Saving to your wallet…'}
      {status === 'ready' && 'Synced with your wallet'}
    </div>
  )
}

export default LibrarySyncStatus
