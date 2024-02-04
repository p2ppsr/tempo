import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table"
import React from "react"
import { FaPlay } from "react-icons/fa"
import { Song } from "../../types/interfaces"
import "./SongList.scss"
import { Img } from "uhrp-react"
import constants from "../../utils/constants"
import { usePlaybackStore } from "../../stores/stores"

interface SongListProps {
  songs: Song[]
}

const SongList = ({ songs }: SongListProps) => {
  // State ======================================================

  // Global state for audio playback. Includes playing status, audio, artwork url, and setters for each
  const [
    isPlaying,
    setIsPlaying,

    playingAudioUrl,
    setPlayingAudioUrl,

    playingAudioTitle,
    setPlayingAudioTitle,

    playingAudioArtist,
    setPlayingAudioArtist,

    playingArtworkUrl,
    setPlayingArtworkUrl,
  ] = usePlaybackStore((state: any) => [
    state.isPlaying,
    state.setIsPlaying,

    state.playingAudioUrl,
    state.setPlayingAudioUrl,

    state.playingAudioTitle,
    state.setPlayingAudioTitle,

    state.playingAudioArtist,
    state.setPlayingAudioArtist,

    state.playingArtworkUrl,
    state.setPlayingArtworkUrl,
  ])

  // Table ==================================================================
  const columnHelper = createColumnHelper<Song>()

  const columns = [
    columnHelper.accessor("songFileUrl", {
      header: "",
      cell: (info) => {
        // Pull the artwork URL from the row's object data and supply it to the img element
        const songFileUrl = info.row.original.songFileUrl
        const songTitle = info.row.original.title
        const songArtist = info.row.original.artist
        const artworkFileUrl = info.row.original.artworkFileUrl
        return (
          <div
            className="songListArtworkContainer"
            onClick={() => {
              setIsPlaying(true)
              setPlayingAudioUrl(songFileUrl)
              setPlayingArtworkUrl(artworkFileUrl)
              setPlayingAudioTitle(songTitle)
              setPlayingAudioArtist(songArtist)
            }}
          >
            <FaPlay className="artworkThumbnailPlayIcon" />
            <Img
              src={artworkFileUrl}
              className="songListArtworkThumbnail"
              confederacyHost={constants.confederacyURL}
            />
          </div>
        )
      },
    }),
    columnHelper.accessor("title", {
      header: "Title",
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor("artist", {
      header: "Artist",
      cell: (info) => info.getValue(),
    }),
  ]

  const table = useReactTable({
    data: songs,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  // Handlers ======================================================

  const handlePlaySong = (songUrl: string, artworkUrl: string) => {}

  // Render ========================================================
  return (
    <>
      <table className="songListTable">
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th key={header.id}>
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                </th>
              ))}
            </tr>
          ))}
        </thead>

        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id}>
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </>
  )
}

export default SongList
