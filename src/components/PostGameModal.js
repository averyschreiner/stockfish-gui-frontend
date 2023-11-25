import React from 'react'
import { Button, Modal, Stack, Backdrop, Fade, Box } from '@mui/material'
import { Link } from 'react-router-dom'

export default function PostGameModal({ open, text, playAgain, pgn }) {
    const style = {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 400,
        bgcolor: 'background.paper',
        border: '2px solid #000',
        boxShadow: 24,
        p: 4,
    }

    const callPlayAgain = () => {
        playAgain()
    }

    return (
        <Modal open={open} closeAfterTransition slots={{ backdrop: Backdrop }} slotProps={{backdrop: {timeout: 500,},}}>
            <Fade in={open}>
                <Box sx={style}>
                    <Stack spacing={2} alignItems={'center'}>
                        <h2> {text} </h2>
                        <Stack direction={'row'} spacing={5}>
                            <Button variant="contained">
                                <Link to={`/?pgn=${pgn}`} style={{color: 'white', textDecoration: 'none'}}>
                                    Review Game
                                </Link>
                            </Button>
                            <Button variant="contained" onClick={callPlayAgain}>
                                Play Again
                            </Button>
                        </Stack>
                    </Stack>
                </Box>
            </Fade>
        </Modal>
    )
}