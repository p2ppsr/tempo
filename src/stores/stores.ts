import { create } from 'zustand'
import { Song } from '../types/interfaces'

export const useAuthStore = create(set => ({
  // TODO: These will be dynamic
  userName: 'John Doe',
  setUserName: (newState: string) => set(() => ({ username: newState })),

  profilePictureUrl:
    'https://media.istockphoto.com/id/1320436824/photo/beautiful-funny-and-happy-red-shiba-inu-dog-sitting-in-the-green-grass-in-summer-cute.jpg?s=612x612&w=0&k=20&c=VHadPg0DjfwXajuzVp9AyPQiCLy6HVxDAjQV0EVnUMY=',
  setProfilePictureUrl: (newState: string) => set(() => ({ profilePictureUrl: newState })),

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
    audioSrc: null,
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

// Displaying the invitational modal dialogue and what content to display
export type InvitationContent = 'songEnd' | 'publish' | 'library'
export const useInvitationModalStore = create(set => ({
  invitationModalOpen: false,
  setInvitationModalOpen: (newState: string) => set(() => ({ invitationModalOpen: newState })),

  invitationModalContent: 'songEnd', // invitation modal content differs based on 'preview' or 'songEnd'
  setInvitationModalContent: (newState: InvitationContent) =>
    set(() => ({ invitationModalContent: newState }))
}))
