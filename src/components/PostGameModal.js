import React from 'react'
import Button from '@mui/material/Button'
import Modal from '@mui/material/Modal'
import Stack from '@mui/material/Stack'
import Backdrop from '@mui/material/Backdrop'
import Fade from '@mui/material/Fade'
import Box from '@mui/material/Box'

export default function PostGameModal({ open, text, playAgain, reviewGame }) {
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

    const callReviewGame = () => {
        reviewGame()
    }

    return (
        <Modal open={open} closeAfterTransition slots={{ backdrop: Backdrop }} slotProps={{backdrop: {timeout: 500,},}}>
            <Fade in={open}>
                <Box sx={style}>
                    <Stack spacing={2} alignItems={'center'}>
                        <h2> {text} </h2>
                        <Stack direction={'row'} spacing={5}>
                            <Button variant="contained" onClick={callReviewGame}>
                                Review Game
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