import React, { useEffect } from 'react'
import { InvitationContent, useInvitationModalStore } from '../../stores/stores'
import { Modal } from '@mui/material'

import './InvitationModal.scss'

// This is a modal component called when a non-MNC user finishes a preview or clicks on the Publish tab in LeftMenu.
const InvitationModal = () => {
  const [
    invitationModalOpen,
    setInvitationModalOpen,
    invitationModalContent
  ] = useInvitationModalStore((state: any) => [
    state.invitationModalOpen,
    state.setInvitationModalOpen,
    state.invitationModalContent
  ])

  const invitationTexts: Record<InvitationContent, string[]> = {
    songEnd: ['Enjoying the music?', 'Download the Metanet Client to continue listening on '],
    publish: ['Ready to publish?', 'Download the Metanet Client on '],
    library: ["Want to access all of Tempo's features?", 'Download the Metanet Client on ']
  }

  const getInvitationText = (content: InvitationContent) => invitationTexts[content] || ''

  return (
    <>
      <Modal open={invitationModalOpen} onClose={() => setInvitationModalOpen(false)}>
        {invitationModalOpen ? (
          <>
            <div className="invitationModal">
              <h1 style={{ marginBottom: '1rem', maxWidth: '90%' }}>
                {getInvitationText(invitationModalContent)[0]}
              </h1>
              <button
                id="invitationModalCloseButton"
                onClick={() => {
                  setInvitationModalOpen(false)
                }}
              >
                X
              </button>
              <p>
                {getInvitationText(invitationModalContent)[1]}
                <a
                  href="https://projectbabbage.com/desktop/res/MetaNet%20Client.exe"
                  target="_blank"
                >
                  Windows
                </a>
                ,{' '}
                <a
                  href="https://projectbabbage.com/desktop/res/MetaNet%20Client.dmg"
                  target="_blank"
                >
                  macOS
                </a>
                , or{' '}
                <a
                  href="https://projectbabbage.com/desktop/res/MetaNet%20Client.AppImage"
                  target="_blank"
                >
                  Linux
                </a>
                .
              </p>
              <br />
            </div>
          </>
        ) : (
          <></>
        )}
      </Modal>
    </>
  )
}

export default InvitationModal
