import React, { useEffect } from 'react'
import { useInvitationModalStore } from '../../stores/stores'
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

  return (
    <>
      <Modal open={invitationModalOpen} onClose={() => setInvitationModalOpen(false)}>
        {invitationModalOpen ? (
          <>
            <div className="invitationModal">
              <h1 style={{ marginBottom: '1rem', maxWidth: '90%' }}>
                {invitationModalContent === 'songEnd'
                  ? 'Thanks for previewing Tempo.'
                  : 'Ready to publish?'}
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
                {invitationModalContent === 'songEnd'
                  ? 'For the full experience, download the Metanet Client for'
                  : 'First, install the Metanet client on'}{' '}
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

              <p>
                {invitationModalContent === 'publishInvitation'
                  ? 'Once the Metanet client is running, reload Tempo. Select the publish tab in the left menu and submit your content.'
                  : null}
              </p>
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
