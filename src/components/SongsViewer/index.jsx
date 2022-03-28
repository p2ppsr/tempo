import React from 'react'
import { List, ListItem, ListItemAvatar, ListItemIcon, ListItemText, Typography } from '@material-ui/core'
import { Link } from 'react-router-dom'
import albumArtwork from '../../Images/albumArtwork.jpg'
import './style.css'
import songs from '../../data/songs'

const SongsViewer = () => {
  // TODO: Refactor a lot of this code to make it extensible, clean, and reliable.

  return (
    <div>
      <div className='songTable'>
        <List sx={{ width: '100%', maxWidth: 360, bgcolor: 'background.paper' }}>
          {songs.map((song, i) => (
            <ListItem key={song} button alignItems='flex-start' onClick={() => {
              // Start playing the selected song.
              const songItem = document.getElementById(song.title + i)
              songItem.style.color = 'red'
            }}>
              <ListItemText className='songListItem' primary={i + 1} />
              <img src={albumArtwork} />
              <ListItemText inset primary={song.title} id={song.title + i} />
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
