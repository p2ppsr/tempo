import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable
} from '@tanstack/react-table'
import React from 'react'
import { FaPlay } from 'react-icons/fa'
import { Img } from 'uhrp-react'
import { usePlaybackStore } from '../../stores/stores'
import { Song } from '../../types/interfaces'
import constants from '../../utils/constants'
import './SongList.scss'
import { CircularProgress } from '@mui/material'

interface SongListProps {
  songs: Song[]
}

const SongList = ({ songs }: SongListProps) => {
  // State ======================================================

  // Global state for audio playback. Includes playing status, audio, artwork url, and setters for each
  const [
    isPlaying,
    setIsPlaying,
    playbackSong,
    setPlaybackSong
  ] = usePlaybackStore((state: any) => [
    state.isPlaying,
    state.setIsPlaying,
    state.playbackSong,
    state.setPlaybackSong
  ])

  // Table ==================================================================
  const columnHelper = createColumnHelper<Song>()

  // Define columns for React Table
  const columns = [
    columnHelper.accessor('audioURL', {
      header: '',
      cell: info => {
        // Pull the song data from the row's object data and supply it to the img element
        const { title, artist, audioURL, artworkURL } = info.row.original
        return (
          <div
            className="songListArtworkContainer"
            onClick={() => {
              setPlaybackSong({
                title: title,
                artist: artist,
                audioURL: audioURL,
                artworkURL: artworkURL
              })
            }}
          >
            <FaPlay className="artworkThumbnailPlayIcon" />
            {artworkURL ? (
              <>
                <Img
                  src={artworkURL}
                  className="songListArtworkThumbnail"
                  confederacyHost={constants.confederacyURL}
                  // onLoad={() => {console.log('image load')}}
                  loading={false}
                />
              </>
            ) : (
              <CircularProgress />
            )}
          </div>
        )
      }
    }),
    columnHelper.accessor('title', {
      header: 'Title',
      cell: info => info.getValue()
    }),
    columnHelper.accessor('artist', {
      header: 'Artist',
      cell: info => info.getValue()
    })
  ]

  const table = useReactTable({
    data: songs,
    columns,
    getCoreRowModel: getCoreRowModel()
  })

  // Render ========================================================
  return (
    <>
      <table className="songListTable">
        <thead>
          {table.getHeaderGroups().map(headerGroup => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map(header => (
                <th key={header.id}>
                  {header.isPlaceholder
                    ? null
                    : flexRender(header.column.columnDef.header, header.getContext())}
                </th>
              ))}
            </tr>
          ))}
        </thead>

        <tbody>
          {table.getRowModel().rows.map(row => (
            <tr key={row.id} className="songRow">
              {row.getVisibleCells().map(cell => (
                <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </>
  )
}

export default SongList
