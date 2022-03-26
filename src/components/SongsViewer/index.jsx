import React from 'react'
import { List, ListItem, ListItemAvatar, ListItemIcon, ListItemText, Typography } from '@material-ui/core'
import { Link } from 'react-router-dom'
import albumArtwork from '../../Images/albumArtwork.jpg'
import './style.css'

const SongsViewer = () => {
  // TODO: Refactor a lot of this code to make it extensible, clean, and reliable.
  const filteredSongs = [{
    title: 'Talkin\' Tennessee',
    songID: '12345',
    artist: 'Morgan Wallen',
    length: '3:45'
  },
  {
    title: 'New Song',
    songID: '12345',
    artist: 'Morgan Wallen',
    length: '3:30'
  },
  {
    title: 'New Song',
    songID: '12345',
    artist: 'Morgan Wallen',
    length: '3:30'
  },
  {
    title: 'New Song',
    songID: '12345',
    artist: 'Morgan Wallen',
    length: '3:30'
  },
  {
    title: 'New Song',
    songID: '12345',
    artist: 'Morgan Wallen',
    length: '3:30'
  },
  {
    title: 'New Song',
    songID: '12345',
    artist: 'Morgan Wallen',
    length: '3:30'
  },
  {
    title: 'New Song',
    songID: '12345',
    artist: 'Morgan Wallen',
    length: '3:30'
  },
  {
    title: 'New Song',
    songID: '12345',
    artist: 'Morgan Wallen',
    length: '3:30'
  },
  {
    title: 'New Song',
    songID: '12345',
    artist: 'Morgan Wallen',
    length: '3:30'
  }]
  return (
    <div>
      <div className='songTable'>
        <List sx={{ width: '100%', maxWidth: 360, bgcolor: 'background.paper' }}>
          {filteredSongs.map((song, i) => (
            <ListItem button alignItems='flex-start'>
              <ListItemText className='songListItem' primary={i + 1} />
              <img src={albumArtwork} />
              <ListItemText inset primary={song.title} />
              <ListItemText primary={song.artist} />
              <ListItemText primary={song.length} />
            </ListItem>
          ))}
        </List>
      </div>
    </div>
  )
}
export default SongsViewer
