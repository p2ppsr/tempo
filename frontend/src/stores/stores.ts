import { create } from 'zustand'
import type { Song } from '../types/interfaces'

/** AUTH STORE **/
interface AuthStore {
  userHasMetanetClient: boolean
  setUserHasMetanetClient: (state: boolean) => void
}
export const useAuthStore = create<AuthStore>(set => ({
  userHasMetanetClient: false,
  setUserHasMetanetClient: (state) => set({ userHasMetanetClient: state })
}))

/** PLAYBACK STORE **/
interface PlaybackStore {
  isPlaying: boolean
  setIsPlaying: (state: boolean) => void

  isLoading: boolean
  setIsLoading: (state: boolean) => void

  playbackSong: Omit<Song, 'token'>
  setPlaybackSong: (song: Partial<Song>) => void

  playNextSong: boolean
  togglePlayNextSong: () => void

  playPreviousSong: boolean
  togglePlayPreviousSong: () => void

  songList: Song[]
  setSongList: (songs: Song[]) => void
}
export const usePlaybackStore = create<PlaybackStore>((set, get) => ({
  isPlaying: false,
  setIsPlaying: (state) => set({ isPlaying: state }),

  isLoading: false,
  setIsLoading: (state) => set({ isLoading: state }),

  playbackSong: {
    title: '',
    artist: '',
    songURL: '',
    artworkURL: '',
    description: '',
    duration: 0,
    isPublished: false
  },
  setPlaybackSong: (song) =>
    set({
      playbackSong: {
        ...get().playbackSong,
        ...song
      }
    }),

  playNextSong: false,
  togglePlayNextSong: () => set({ playNextSong: !get().playNextSong }),

  playPreviousSong: false,
  togglePlayPreviousSong: () => set({ playPreviousSong: !get().playPreviousSong }),

  songList: [],
  setSongList: (songs) => set({ songList: songs })
}))

/** PLAYLIST STORE **/
interface PlaylistStore {
  viewingPlaylist: string | null
  setViewingPlaylist: (id: string) => void
}
export const usePlaylistStore = create<PlaylistStore>(set => ({
  viewingPlaylist: null,
  setViewingPlaylist: (id) => set({ viewingPlaylist: id })
}))

/** LIKES STORE **/
interface LikesStore {
  likesHasChanged: boolean
  setLikesHasChanged: (state: boolean) => void
}
export const useLikesStore = create<LikesStore>(set => ({
  likesHasChanged: false,
  setLikesHasChanged: (state) => set({ likesHasChanged: state })
}))

/** MODALS STORE **/
export type InvitationContent = 'songEnd' | 'publish' | 'library'
interface ModalsStore {
  invitationModalOpen: boolean
  setInvitationModalOpen: (state: boolean) => void

  invitationModalContent: InvitationContent
  setInvitationModalContent: (content: InvitationContent) => void

  socialShareModalOpen: boolean
  setSocialShareModalOpen: (state: boolean) => void

  socialShareLink: string | null
  setSocialShareLink: (url: string) => void
}
export const useModals = create<ModalsStore>(set => ({
  invitationModalOpen: false,
  setInvitationModalOpen: (state) => set({ invitationModalOpen: state }),

  invitationModalContent: 'songEnd',
  setInvitationModalContent: (content) => set({ invitationModalContent: content }),

  socialShareModalOpen: false,
  setSocialShareModalOpen: (state) => set({ socialShareModalOpen: state }),

  socialShareLink: null,
  setSocialShareLink: (url) => set({ socialShareLink: url })
}))
