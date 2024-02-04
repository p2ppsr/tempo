import { create } from "zustand"

export const useAuthStore = create((set) => ({
  // TODO: These will be dynamic
  userName: "John Doe",
  setUserName: (newState: string) => set(() => ({ username: newState })),

  profilePictureUrl:
    "https://media.istockphoto.com/id/1320436824/photo/beautiful-funny-and-happy-red-shiba-inu-dog-sitting-in-the-green-grass-in-summer-cute.jpg?s=612x612&w=0&k=20&c=VHadPg0DjfwXajuzVp9AyPQiCLy6HVxDAjQV0EVnUMY=",
  setProfilePictureUrl: (newState: string) =>
    set(() => ({ profilePictureUrl: newState })),
}))

// TODO: Make these set a song object instead of individual params
export const usePlaybackStore = create((set) => ({
  // Playback state
  isPlaying: false,
  setIsPlaying: (newState: boolean) =>
    set((state: any) => ({ isPlaying: newState })),
  toggleIsPlaying: (newState: boolean) =>
    set((state: any) => ({ isPlaying: !state.isPlaying })),

  // TODO: This should probably be one Song type handler instead of multiple states
  playingAudioUrl: "",
  setPlayingAudioUrl: (newState: string) =>
    set((state: any) => ({ playingAudioUrl: newState })),

  playingAudioTitle: "",
  setPlayingAudioTitle: (newState: string) =>
    set((state: any) => ({ playingAudioTitle: newState })),

  playingAudioArtist: "",
  setPlayingAudioArtist: (newState: string) =>
    set(() => ({ playingAudioArtist: newState })),

  playingArtworkUrl: "",
  setPlayingArtworkUrl: (newState: string) =>
    set(() => ({ playingArtworkUrl: newState })),
}))
