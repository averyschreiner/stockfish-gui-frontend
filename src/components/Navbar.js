import React from 'react'
import { Link } from 'react-router-dom'
import { AppBar, Toolbar, Button } from '@mui/material'

export default function Navbar() {
  return (
    <AppBar position="static" elevation={2}>
      <Toolbar variant='dense'>
        <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
          <Button color="inherit">Review</Button>
        </Link>
        <Link to="/play" style={{ textDecoration: 'none', color: 'inherit' }}>
          <Button color="inherit">Play</Button>
        </Link>
      </Toolbar>
    </AppBar>
  )
}