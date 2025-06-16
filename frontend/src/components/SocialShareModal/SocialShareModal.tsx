import React, { useRef, useState, useEffect } from 'react'
import { CircularProgress, Modal } from '@mui/material'
import { FaRegCopy } from 'react-icons/fa'
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

import useOutsideClick from '../../hooks/useOutsideClick'
import { useModals } from '../../stores/stores'
import { copyLinkToClipboard } from '../../utils/copyLinkToClipboard'
import { extractHashFromUrl } from '../../utils/extractHashFromUrl'
import { getSongDataFromHash } from '../../utils/getSongDataFromHash'

import './SocialShareModal.scss'

// Define type if available, else fallback to minimal shape
interface SongInfo {
  title: string
  artist: string
}

const SocialShareModal: React.FC = () => {
  const modalContentRef = useRef<HTMLDivElement>(null)
  useOutsideClick<HTMLDivElement>(modalContentRef, () => setSocialShareModalOpen(false))

  const [socialModalSongData, setSocialModalSongData] = useState<SongInfo | null>(null)

  const [
    socialShareModalOpen,
    setSocialShareModalOpen,
    socialShareLink
  ] = useModals((state) => [
    state.socialShareModalOpen,
    state.setSocialShareModalOpen,
    state.socialShareLink
  ])

  const shareText = 'Check out this song on Tempo: \n'

  useEffect(() => {
    const fetchSongData = async () => {
      if (!socialShareLink) return
      const songHash = extractHashFromUrl(socialShareLink)
      const songData = await getSongDataFromHash(songHash)
      setSocialModalSongData(songData[0] || null)
    }

    fetchSongData()
  }, [socialShareLink])


  return (
    <Modal open={socialShareModalOpen} onClose={() => setSocialShareModalOpen(false)}>
      <>
        {socialModalSongData ? (
          <div className="modal" ref={modalContentRef}>
            <button
              className="modalCloseButton"
              onClick={() => setSocialShareModalOpen(false)}
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
                if (socialShareLink) copyLinkToClipboard(socialShareLink)
              }}
            >
              <h3>Copy link</h3>
              <FaRegCopy />
            </div>

            {socialShareLink && (
              <div className="socialButtons">
                <TwitterShareButton url={socialShareLink} title={shareText}>
                  <XIcon size={32} round />
                </TwitterShareButton>
                <WhatsappShareButton url={socialShareLink} title={shareText}>
                  <WhatsappIcon size={32} round />
                </WhatsappShareButton>
                <LinkedinShareButton url={socialShareLink} summary={shareText}>
                  <LinkedinIcon size={32} round />
                </LinkedinShareButton>
                <FacebookShareButton url={socialShareLink} title={shareText}>
                  <FacebookIcon size={32} round />
                </FacebookShareButton>
                <RedditShareButton url={socialShareLink}>
                  <RedditIcon size={32} round />
                </RedditShareButton>
              </div>
            )}
          </div>
        ) : (
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '33vh' }}>
            <CircularProgress />
          </div>
        )}
      </>
    </Modal>
  )
}

export default SocialShareModal
