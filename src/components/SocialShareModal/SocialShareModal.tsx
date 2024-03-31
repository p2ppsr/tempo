import { CircularProgress, Modal } from '@mui/material'
import React, { useRef, useState } from 'react'
import useOutsideClick from '../../hooks/useOutsideClick'
import { useModals } from '../../stores/stores'
import './SocialShareModal.scss'

import {
  FacebookIcon,
  FacebookShareButton,
  LinkedinIcon,
  LinkedinShareButton,
  RedditIcon,
  RedditShareButton,
  TwitterShareButton,
  WhatsappIcon,
  WhatsappShareButton,
  XIcon
} from 'react-share'

import { FaRegCopy } from 'react-icons/fa'
import useAsyncEffect from 'use-async-effect'
import { copyLinkToClipboard } from '../../utils/copyLinkToClipboard'
import { extractHashFromUrl } from '../../utils/extractHashFromUrl'
import { getSongDataFromHash } from '../../utils/getSongDataFromHash'

const SocialShareModal = () => {
  const modalContentRef = useRef<HTMLDivElement>(null)
  useOutsideClick(modalContentRef, () => setSocialShareModalOpen(false))

  const [socialModalSongData, setSocialModalSongData] = useState() as any

  const [
    socialShareModalOpen,
    setSocialShareModalOpen,
    socialShareLink
  ] = useModals((state: any) => [
    state.socialShareModalOpen,
    state.setSocialShareModalOpen,
    state.socialShareLink
  ])

  const shareText = 'Check out this song on Tempo: \n'

  useAsyncEffect(async () => {
    if (!socialShareLink) return

    const songHash = extractHashFromUrl(socialShareLink)
    const songData = await getSongDataFromHash(songHash)
    setSocialModalSongData(songData)
  }, [socialShareLink])

  return (
    <>
      <Modal open={socialShareModalOpen} onClose={() => setSocialShareModalOpen(false)}>
        <>
          {socialModalSongData ? (
            <>
              <div className="modal">
                <button
                  className="modalCloseButton"
                  onClick={() => {
                    setSocialShareModalOpen(false)
                  }}
                >
                  X
                </button>
                <h1>Share</h1>

                <h2 style={{ marginTop: '1rem' }}>
                  {socialModalSongData.title} by {socialModalSongData.artist}
                </h2>

                <div
                  className="socialHeaderContainer"
                  onClick={() => {
                    copyLinkToClipboard(socialShareLink)
                  }}
                >
                  <h3>Copy link</h3>
                  <FaRegCopy />
                </div>

                <div className="socialButtons">
                  {/* Twitter */}
                  <TwitterShareButton url={socialShareLink} title={shareText}>
                    <XIcon size={32} round />
                  </TwitterShareButton>
                  {/* WhatsApp */}
                  <WhatsappShareButton url={socialShareLink} title={shareText}>
                    <WhatsappIcon size={32} round />
                  </WhatsappShareButton>
                  {/* LinkedIn */}
                  <LinkedinShareButton url={socialShareLink} summary={shareText}>
                    <LinkedinIcon size={32} round />
                  </LinkedinShareButton>
                  {/* Facebook */}
                  <FacebookShareButton url={socialShareLink} title={shareText}>
                    <FacebookIcon size={32} round />
                  </FacebookShareButton>
                  {/* Reddit - Reddit does not support a text parameter directly */}
                  <RedditShareButton url={socialShareLink}>
                    <RedditIcon size={32} round />
                  </RedditShareButton>
                  d h
                </div>
              </div>
            </>
          ) : (
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '33vh' }}>
              <CircularProgress />
            </div>
          )}
        </>
      </Modal>
    </>
  )
}

export default SocialShareModal
