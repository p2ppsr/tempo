/**
 * @file InvitationModal.tsx
 * @description
 * React component for displaying invitation modals in Tempo. Shows a modal prompt
 * inviting users to download the Metanet Client when they attempt to access features
 * requiring it (e.g., playing past the first song, publishing, accessing the library).
 * 
 * Fetches its open state and content type from the global modal store.
 */

import type { InvitationContent } from '../../stores/stores'
import { useModals } from '../../stores/stores'
import { Modal } from '@mui/material'

/**
 * InvitationModal Component
 *
 * Renders a modal with dynamic invitation messages and download links for
 * the Metanet Client (Windows, macOS, Linux). 
 * - Uses `useModals` store to determine modal open state and current invitation context.
 * - Supports different invitation scenarios via `InvitationContent` type.
 */
const InvitationModal = () => {
  const [
    invitationModalOpen,
    setInvitationModalOpen,
    invitationModalContent
  ] = useModals((state) => [
    state.invitationModalOpen,
    state.setInvitationModalOpen,
    state.invitationModalContent
  ])

  const invitationTexts: Record<InvitationContent, string[]> = {
    songEnd: ['Enjoying the music?', 'Download the Metanet Client to continue listening on '],
    publish: ['Ready to publish?', 'Download the Metanet Client on '],
    library: ["Want to access all of Tempo's features?", 'Download the Metanet Client on ']
  }

  /**
   * Returns the invitation text array for a given invitation context.
   */
  const getInvitationText = (content: InvitationContent) => invitationTexts[content] || []

  return (
    <Modal open={invitationModalOpen} onClose={() => setInvitationModalOpen(false)}>
      <div className="modal">
        <h1 style={{ marginBottom: '1rem', maxWidth: '90%' }}>
          {getInvitationText(invitationModalContent)[0]}
        </h1>
        <button
          className="modalCloseButton"
          onClick={() => setInvitationModalOpen(false)}
        >
          X
        </button>
        <p>
          {getInvitationText(invitationModalContent)[1]}
          <a
            href="https://projectbabbage.com/desktop/res/MetaNet%20Client.exe"
            target="_blank"
            rel="noreferrer"
          >
            Windows
          </a>,{' '}
          <a
            href="https://projectbabbage.com/desktop/res/MetaNet%20Client.dmg"
            target="_blank"
            rel="noreferrer"
          >
            macOS
          </a>, or{' '}
          <a
            href="https://projectbabbage.com/desktop/res/MetaNet%20Client.AppImage"
            target="_blank"
            rel="noreferrer"
          >
            Linux
          </a>.
        </p>
        <br />
      </div>
    </Modal>
  )
}

export default InvitationModal
