import { Link } from 'react-router-dom'
import type { PublicationReceipt } from '../../../types/interfaces'
import { earliestAssetExpiry } from '../../../utils/publicationReceipt'
import './PublishSuccess.scss'

const readReceipt = (): PublicationReceipt | null => {
  try {
    const value = localStorage.getItem('tempo:last-publication')
    return value ? JSON.parse(value) as PublicationReceipt : null
  } catch {
    return null
  }
}

const SuccessPage = () => {
  const receipt = readReceipt()
  const earliestExpiry = receipt ? earliestAssetExpiry(Object.values(receipt.assets)) : undefined
  return (
    <div className="container publishSuccessPage">
      <p className="sectionEyebrow">Publication verified</p>
      <h1>Your song is playable.</h1>
      <p>Tempo verified redundant storage, key publication, overlay admission, and catalogue playback before completing this flow.</p>
      {receipt && (
        <div className="publicationReceipt" data-testid="publication-receipt">
          <h2>Publication receipt</h2>
          <dl>
            <div><dt>Publication ID</dt><dd>{receipt.publicationId}</dd></div>
            <div><dt>Transaction</dt><dd>{receipt.txid}</dd></div>
            <div><dt>Storage</dt><dd>{Object.values(receipt.assets).filter(asset => asset?.available).length} assets verified on two providers</dd></div>
            <div><dt>Storage retained through</dt><dd>{earliestExpiry ? new Date(earliestExpiry * 1000).toLocaleString() : 'Not recorded'}</dd></div>
            <div><dt>Key server</dt><dd>{receipt.keyPublished ? 'Verified' : 'Failed'}</dd></div>
            <div><dt>Overlay</dt><dd>{receipt.overlayAdmitted ? 'Admitted' : 'Not admitted'}</dd></div>
            <div><dt>Playable</dt><dd>{receipt.playable ? 'Yes' : 'No'}</dd></div>
          </dl>
        </div>
      )}
      <div className="successActions">
        <Link className="button" to="/">Open live catalogue</Link>
        <Link className="button" to="/PublishSong">Publish another</Link>
      </div>
    </div>
  )
}
export default SuccessPage
