/**
 * @file SocialShareModal.tsx
 * @description
 * React component for displaying a modal that allows users to share
 * a song link on social media platforms. When opened, it fetches
 * song data from a provided share URL, displays the song’s title and artist,
 * allows copying the link, and provides social share buttons for Twitter,
 * WhatsApp, LinkedIn, Facebook, and Reddit.
 */

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

/**
 * Type representing minimal song data fetched for the modal.
 */
interface SongInfo {
  title: string
  artist: string
}

/**
 * SocialShareModal Component
 *
 * - Opens when `socialShareModalOpen` is true (managed by global Zustand store).
 * - Fetches song data based on the hash from the share link.
 * - Displays song title and artist name.
 * - Allows users to copy the share link to their clipboard.
 * - Provides social share buttons for multiple platforms using react-share.
 * - Closes on outside click or clicking the close button.
 *
 * State & Store:
 * - Uses `socialShareModalOpen`, `setSocialShareModalOpen`, and `socialShareLink` from the Zustand store.
 * - Local state `socialModalSongData` holds fetched song details.
 *
 * Hooks:
 * - useOutsideClick to detect clicks outside modal content and close it.
 */
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
      <div>
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
      </div>
    </Modal>
  )
}

export default SocialShareModal
