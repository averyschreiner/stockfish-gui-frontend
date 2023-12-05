import React, { useState, useMemo } from 'react'
import '../Play.css'
import { Chess } from 'chess.js'
import { Chessboard } from 'react-chessboard'
import axios from 'axios'
import MySlider from '../components/MySlider'
import MoveTable from '../components/MoveTable'
import PostGameModal from '../components/PostGameModal'
import { Grid, Button, Stack, LinearProgress, Tooltip, Container } from '@mui/material'
import { Info } from '@mui/icons-material'

export default function Play() {
  document.title = "Play"
  const [game, setGame] = useState(useMemo(() => new Chess(), []))
  const [elo, setElo] = useState(1320)
  const [depth, setDepth] = useState(15)
  const [fen, setFen] = useState(game.fen())
  const [moves, setMoves] = useState([])
  const [playingAsWhite, setPlayingAsWhite] = useState(true)
  const [boardOrientation, setBoardOrientation] = useState('white')
  const [started, setStarted] = useState(false)
  const [thinking, setThinking] = useState(false)
  const [gameOver, setGameOver] = useState(false)
  const [gameOverText, setGameOverText] = useState("")
  // const backendURL = 'http://localhost:3001'
  const backendURL = ""

  function handleEloChange(event) {
    setElo(event.target.value)
  }

  function handleDepthChange(event) {
    setDepth(event.target.value)
  }

  function playAgain() {
    setGame(new Chess())
    setFen("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1")
    setMoves([])
    setStarted(false)
    setGameOver(false)
  }

  function switchSides() {
    setPlayingAsWhite(!playingAsWhite)
    setBoardOrientation(boardOrientation === 'white' ? 'black' : 'white')
  }

  function startGame() {
    setStarted(true)
    if (boardOrientation === 'black') {
      setThinking(true)
      axios.get(`${backendURL}/play/bestmove?fen=${game.fen()}&elo=${elo}&depth=${depth}`)
      .then (response => {
        const bestmove = response.data.bestmove
        makeMove({from: bestmove.substring(0,2), to: bestmove.substring(2,4), promotion: "q"})
        setThinking(false)
      })
      .catch (error => {
        console.log(`Failed to get bestmove because: ${error}`)
      })
    }
  }  

  function addMove(move) {
    moves.push(move)
  }

  function makeMove(move) {
    try {
      const result = game.move(move)
      addMove(result.san)
      setFen(game.fen())

      if (game.isGameOver()) {
        setTimeout(() => {
          if (game.isCheckmate()) {
            setGameOverText(`Checkmate! ${game.turn() === 'w' ? "Black" : "White"} wins.`)
          } else if (game.isDraw()) {
            setGameOverText(`It's a draw!`)
          } else {
            setGameOverText(`Game over.`)
          }
          setGameOver(true)
        }, 700)
      }

      return result
      }
    catch (error) {
      return null
    }
  }

  function onDrop(from, to) {
    if (game.turn() === boardOrientation[0]) {
      const move = makeMove({
        from: from,
        to: to,
        promotion: "q",
      })
      
      if (move) {
        setStarted(true)
        if (game.turn() !== boardOrientation[0]) {
          setThinking(true)
          axios.get(`${backendURL}/play/bestmove?fen=${move.after}&elo=${elo}&depth=${depth}`)
          .then (response => {
            const bestmove = response.data.bestmove
            makeMove({from: bestmove.substring(0,2), to: bestmove.substring(2,4), promotion: "q"})
            setThinking(false)
          })
          .catch (error => {
            console.log(`Failed to get bestmove because: ${error}`)
          })
        }
      }
    }
  }

  return (
    <Grid container columns={24} spacing={1} style={{ paddingTop: '10px', fontFamily: 'Roboto', fontSize: '1.5vw'}} >
      <PostGameModal open={gameOver} text={gameOverText} playAgain={playAgain} pgn={game.pgn()} />
      <Grid item xs paddingLeft={'30px'} paddingTop={'30px'}>
        <Container>
          <Stack height='calc(100vh - 90px)' spacing={5} justifyContent={'space-around'}>
            <Stack direction={"row"} alignItems={"center"} spacing={1}>
              <h2><u>Elo</u></h2>
              <Tooltip placement={'top'} title={"Determines Stockfish's playing strength. Higher elo makes it more challenging, while lower elo make it easier."}><Info /></Tooltip>
            </Stack>
            <MySlider disabled={started} onSliderChange={handleEloChange} defaultValue={elo} step={1} min={1320} max={3190} />
            <Stack direction={"row"} alignItems={"center"} spacing={1}>
              <h2><u>Depth</u></h2>
              <Tooltip placement={'top'} title={"Determines how deeply Stockfish thinks. Higher depth allows for deeper analysis, but will cause longer response times."}><Info /></Tooltip>
            </Stack>
            <MySlider disabled={started} onSliderChange={handleDepthChange} defaultValue={depth} step={1} min={10} max={25} />
            <h2><u>Board Orientation</u></h2>
            <Stack direction="row" justifyContent="center" spacing={5}>
              { playingAsWhite && (
                <Button disabled={started} variant="contained" onClick={switchSides} style={{ backgroundColor: 'black', color: 'white' }}>
                  Play as Black
                </Button>
              )}
              { !playingAsWhite && (
                <Button disabled={started} variant="contained" onClick={switchSides} style={{ backgroundColor: 'white', color: 'black', outline: '1px solid black' }}>
                  Play as White
                </Button>
              )}
              <Button disabled={started} variant="contained" onClick={startGame}>
                Begin
              </Button>     
            </Stack>
          </Stack>
        </Container>
      </Grid>
      <Grid item style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <Container style={{ maxWidth: 'calc(100vh - 40px)' }}>
          <Stack spacing={1}>
            { thinking && (
              <LinearProgress />
            )}
            { !thinking && (
              <LinearProgress sx={{'& .MuiLinearProgress-bar': {backgroundColor: 'white'}}} variant="determinate" value={100} />
            )}
            <Container style={{ width: 'calc(100vh - 90px)', padding: 0 }}>
              <Chessboard id="board" position={fen} onPieceDrop={onDrop} animationDuration={500} boardOrientation={boardOrientation}/>
            </Container>
          </Stack>
        </Container>
      </Grid>
      <Grid item xs paddingRight={'20px'} paddingTop={'15px'}>
        <MoveTable moves={moves} height={"calc(100vh - 96px)"} theCurrentMove={-1} />
      </Grid>
    </Grid>
  )
}