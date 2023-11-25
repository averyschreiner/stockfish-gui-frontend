import React, { useState, useEffect } from 'react'
import { Chess } from 'chess.js'
import { Chessboard } from 'react-chessboard'
import axios from 'axios'
import MySlider from '../components/MySlider'
import MoveTable from '../components/MoveTable'
import BestMovesList from '../components/BestMovesList'
import { Grid, Button, Stack, Tooltip, Container, Box, Divider, Dialog, DialogTitle, DialogContent, DialogActions, TextField } from '@mui/material'
import { KeyboardArrowLeft, KeyboardArrowRight, Upload, Cached, Info, Refresh } from '@mui/icons-material'

export default function Review() {
  document.title = "Review"
  const [game] = useState(new Chess())
  const [whiteWinPercentage, setWhiteWinPercentage] = useState(50)
  const [multiPV, setMultiPV] = useState(3)
  const [depth, setDepth] = useState(15)
  const [fen, setFen] = useState(game.fen())
  const [moves, setMoves] = useState([])
  const [boardOrientation, setBoardOrientation] = useState('white')
  const [currentArrow, setCurrentArrow] = useState([])
  const [bestLines, setBestLines] = useState([])
  const [thinking, setThinking] = useState(false)
  const [openDialog, setOpenDialog] = useState(false)
  const [pgn, setPgn] = useState("")
  const [theCurrentMove, setTheCurrentMove] = useState(0)
  const urlParams = new URLSearchParams(window.location.search)
  const backendURL = 'https://stockfish-gui-backend.azurewebsites.net'
  // const backendURL = 'http://localhost:3001'

  if (urlParams.get('pgn') && moves.length <= 1) {
    setPgn(urlParams.get('pgn'))
    loadGame()
  }

  useEffect(() => {
    if (!game.isGameOver()) {
      setThinking(true)
      setCurrentArrow([[]])
      axios.get(`${backendURL}/analyze?fen=${fen}&depth=${depth}&multiPV=${multiPV}`)
        .then (response => {
          setThinking(false)
          setBestLines(response.data.bestLines)
          const bestMove = response.data.bestLines[0].bestMove
          drawArrow({from: bestMove.substring(0,2), to: bestMove.substring(2,4)})
        })
        .catch (error => {
          console.log(`Failed to get bestmove because: ${error}`)
        })
    }
  }, [fen, depth, multiPV, game])

  useEffect(() => {
    function handleScoreBar(score) {
      if (isNaN(score)) {
        if (bestLines[0].line) {
          let movesToGo = bestLines[0].line
          movesToGo.unshift(bestLines[0].bestMove)
  
          if (movesToGo.length % 2 === 0 && game.turn() === 'w') {
            setWhiteWinPercentage(0)
          }
          else if (movesToGo.length % 2 === 1 && game.turn() === 'b') {
            setWhiteWinPercentage(0)
          }
          else {
            setWhiteWinPercentage(100)
          }
        }
        else {
          if (game.turn() === 'w') {
            setWhiteWinPercentage(100)
          }
          else {
            setWhiteWinPercentage(0)
          }
        }
      }
      else {
        let pawnAdvantage = score * .01
        let winPercentage = 1 / (1 + Math.pow(10, -pawnAdvantage / 4))
      
        if (game.turn() === 'b') {
          winPercentage = 1 - winPercentage
        }
        winPercentage = Math.min(winPercentage, 95)
  
        setWhiteWinPercentage(winPercentage * 100)
      }
    }

    try {
      if (bestLines[0].score) {
        handleScoreBar(bestLines[0].score)
      }
    }
    catch {}
  }, [bestLines, game])


  function handleUndo() {
    setTheCurrentMove(Math.max(-1, theCurrentMove - 1))
    game.undo()
    setFen(game.fen())
  }

  function handleRedo() {
    setTheCurrentMove(Math.min(moves.length - 1, theCurrentMove + 1))
    let result = makeMove(moves[theCurrentMove + 1])
    
    if (!result) {
      makeMove(moves[theCurrentMove])
    }
  }

  function switchSides() {
    setBoardOrientation(boardOrientation === 'white' ? 'black' : 'white')
  }

  function reset() {
    game.reset()
    setFen(game.fen())
    setMoves([])
  }

  function loadGame() {
    setOpenDialog(false)
    game.loadPgn(pgn)
    setFen(game.fen())
    setMoves(game.history())
    setTheCurrentMove(game.history().length-1)
  }

  function handleDepthChange(event) {
    setDepth(event.target.value)
  }
  
  function handleMultiPVChange(event) {
    setMultiPV(event.target.value)
  }

  function drawArrow(move) {
    setCurrentArrow([[move.from, move.to, 'green']])
  }

  function addMove(move) {
    let movesCopy = [...moves]
    movesCopy.push(move)
    setMoves(movesCopy)
    setTheCurrentMove(movesCopy.length -1)
  }

  function makeMove(move) {
    try {
      const result = game.move(move)
      setFen(game.fen())
      return result
  }
    catch (error) {
      return null
    }
  }

  function onDrop(from, to) {
    let result = makeMove({
      from: from,
      to: to,
      promotion: 'q'
    })

    if (result) {
      if (result.san === moves[theCurrentMove + 1]) {
        setTheCurrentMove(theCurrentMove + 1)
      }
      else if (game.history().length <= moves.length) {
        setMoves(game.history())
        setTheCurrentMove(theCurrentMove + 1)
      }
      else {
        addMove(result.san)
      }
    }
  }

  return (
    <Grid container columns={24} spacing={0} style={{ paddingTop: '10px', fontFamily: 'Roboto'}} >
      <Dialog open={openDialog} fullWidth maxWidth='sm'>
        <DialogTitle>Enter PGN</DialogTitle>
        <DialogContent>
          <TextField autoFocus fullWidth multiline label="Paste PGN here..." value={pgn} onChange={(e) => setPgn(e.target.value)} />
        </DialogContent>
        <DialogActions>
          <Stack direction="row" width='100%' spacing={4}>
            <Button fullWidth color="error" variant="contained" onClick={() => setOpenDialog(false)}>Cancel</Button>
            <Button fullWidth color="success" variant="contained" onClick={loadGame}>Continue</Button>
          </Stack>
        </DialogActions>
      </Dialog>
      <Grid item xs={7} paddingTop={'10px'}>
        <Container>
          <Stack spacing={1}>
            <BestMovesList bestLines={bestLines} thinking={thinking} multiPV={multiPV} />
            <Stack spacing={4}>
              <Stack direction={"row"} alignItems={"center"} spacing={1}>
                <h3><u>Depth</u></h3>
                <Tooltip placement={'top'} title={"Determines how deeply Stockfish thinks. Higher depth allows for deeper analysis, but will cause longer response times."}><Info /></Tooltip>
              </Stack>
              <MySlider onSliderChange={handleDepthChange} defaultValue={depth} step={1} min={10} max={25} />
            </Stack>
            <Stack spacing={4}>
              <Stack direction={"row"} alignItems={"center"} spacing={1}>
                <h3><u>Number of Bestmoves</u></h3>
                <Tooltip placement={'top'} title={"Determines the number of bestmoves that Stockfish will report for the given position."}><Info /></Tooltip>
              </Stack>
              <MySlider onSliderChange={handleMultiPVChange} defaultValue={multiPV} step={1} min={1} max={5} />
            </Stack>
          </Stack>
        </Container>
      </Grid>
      <Grid item xs={10} paddingTop={'10px'} >
        <Container style={{ maxWidth: 'calc(100vh - 40px)' }}>
          <Chessboard id="board" customArrows={currentArrow} position={fen} onPieceDrop={onDrop} animationDuration={500} boardOrientation={boardOrientation}/>
        </Container>
      </Grid>
      <Grid item xs={1} paddingRight={'20px'} paddingTop={'10px'}>
        <Box border={'1px solid black'} height={'100%'} style={{backgroundColor: 'black', position: 'relative'}}>
          <div style={{position: 'absolute', height: `${whiteWinPercentage}%`, backgroundColor: 'white', width: '100%', [boardOrientation === 'black' ? 'top' : 'bottom']: '0', transition: 'height 1s ease'}} />
        </Box>
      </Grid>
      <Grid item xs={6} paddingRight={'20px'} paddingTop={'10px'}>
        <MoveTable moves={moves} theCurrentMove={theCurrentMove} height={"calc(100vh - 170px"} />
        <Stack width={'100%'} border={'1px solid lightgrey'} divider={<Divider flexItem />} borderRadius={'5px'}>
          <Stack width={'100%'} direction={'row'} divider={<Divider orientation="vertical" flexItem />}>
            <Tooltip title="Undo move" placement='top' enterDelay={500} arrow>
              <Button fullWidth onClick={handleUndo}>
                <KeyboardArrowLeft />
              </Button>
            </Tooltip>
            <Tooltip title="Redo move" placement='top' enterDelay={500} arrow>
              <Button fullWidth onClick={handleRedo}>
                <KeyboardArrowRight />
              </Button>
            </Tooltip>
          </Stack>
          <Stack width={'100%'} direction={'row'} divider={<Divider orientation="vertical" flexItem />}>
            <Tooltip title="Switch board" placement='top' enterDelay={500} arrow>
              <Button fullWidth onClick={switchSides}>
                <Cached />
              </Button>
            </Tooltip>
            <Tooltip title="Reset board" placement='top' enterDelay={500} arrow>
              <Button fullWidth onClick={reset}>
                <Refresh />
              </Button>
            </Tooltip>
            <Tooltip title="Upload game" placement='top' enterDelay={500} arrow>
              <Button fullWidth onClick={() => setOpenDialog(true)}>
                <Upload />
              </Button>
            </Tooltip>
          </Stack>
        </Stack>
      </Grid>
    </Grid>
  )
}