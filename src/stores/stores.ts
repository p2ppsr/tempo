import { create } from 'zustand'

export const useAuthStore = create(set => ({
  // TODO: These will be dynamic
  userName: 'John Doe',
  setUserName: (newState: string) => set(() => ({ username: newState })),

  profilePictureUrl:
    'https://media.istockphoto.com/id/1320436824/photo/beautiful-funny-and-happy-red-shiba-inu-dog-sitting-in-the-green-grass-in-summer-cute.jpg?s=612x612&w=0&k=20&c=VHadPg0DjfwXajuzVp9AyPQiCLy6HVxDAjQV0EVnUMY=',
  setProfilePictureUrl: (newState: string) => set(() => ({ profilePictureUrl: newState }))
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
    }))
}))
