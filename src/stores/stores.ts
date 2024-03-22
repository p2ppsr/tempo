import { create } from 'zustand'
import { Song } from '../types/interfaces'

export const useAuthStore = create(set => ({
  userHasMetanetClient: false,
  setUserHasMetanetClient: (newState: boolean) => set(() => ({ userHasMetanetClient: newState }))
}))

export const usePlaybackStore = create(set => ({
  isPlaying: false,
  setIsPlaying: (newState: boolean) => set(() => ({ isPlaying: newState })),

  isLoading: false,
  setIsLoading: (newState: boolean) => set(() => ({ isLoading: newState })),

  playbackSong: {
    title: '',
    artist: '',
    audioURL: '',
    artworkURL: '',
    description: '',
    duration: 0
  },
  setPlaybackSong: (newSong: any) =>
    set((state: any) => ({
      playbackSong: {
        ...state.playbackSong,
        ...newSong
      }
    })),

  playNextSong: false,
  togglePlayNextSong: () => set((state: any) => ({ playNextSong: !state.playNextSong })),

  playPreviousSong: false,
  togglePlayPreviousSong: () =>
    set((state: any) => ({ playPreviousSong: !state.playPreviousSong })),

  songList: [] as Song[],
  setSongList: (newState: Song[]) => set(() => ({ songList: newState }))
}))

export const usePlaylistStore = create(set => ({
  viewingPlaylist: null,
  setViewingPlaylist: (newState: string) => set(() => ({ viewingPlaylist: newState }))
}))

export const useLikesStore = create(set => ({
  likesHasChanged: false,
  setLikesHasChanged: (newState: boolean) => set(() => ({ likesHasChanged: newState })),
}))

// Displaying the invitational modal dialogue and what content to display
export type InvitationContent = 'songEnd' | 'publish' | 'library'
export const useModals = create(set => ({
  invitationModalOpen: false,
  setInvitationModalOpen: (newState: string) => set(() => ({ invitationModalOpen: newState })),

  invitationModalContent: 'songEnd', // invitation modal content differs based on 'preview' or 'songEnd'
  setInvitationModalContent: (newState: InvitationContent) =>
    set(() => ({ invitationModalContent: newState })),

  socialShareModalOpen: false,
  setSocialShareModalOpen: (newState: boolean) => set(() => ({ socialShareModalOpen: newState })),
  
  socialShareLink:null,
  setSocialShareLink: (newState: string) => set(() => ({ socialShareLink: newState })),
}))
