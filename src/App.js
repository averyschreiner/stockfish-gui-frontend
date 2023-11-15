import './App.css';
import React, { useState, useMemo } from 'react'
import { Chess } from 'chess.js'
import { Chessboard } from 'react-chessboard'
import MySlider from './components/MySlider'
import MoveTable from './components/MoveTable'
import PostGameModal from './components/PostGameModal'
import axios from 'axios'
import Grid from '@mui/material/Unstable_Grid2'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import LinearProgress from '@mui/material/LinearProgress'
import Tooltip from '@mui/material/Tooltip'
import InfoIcon from '@mui/icons-material/Info'

export default function App() {
  const [game, setGame] = useState(useMemo(() => new Chess(), []))
  const [elo, setElo] = useState(1320)
  const [depth, setDepth] = useState(15)
  const [fen, setFen] = useState(game.fen())
  const [moves, setMoves] = useState([{}])
  const [playingAsWhite, setPlayingAsWhite] = useState(true)
  const [boardOrientation, setBoardOrientation] = useState('white')
  const [started, setStarted] = useState(false)
  const [thinking, setThinking] = useState(false)
  const [gameOver, setGameOver] = useState(false)
  const [gameOverText, setGameOverText] = useState("")
  const backendURL = 'https://stockfish-gui-backend.azurewebsites.net'
  // const backendURL = 'http://localhost:3001'

  const handleEloChange = (event) => {
    setElo(event.target.value)
  }

  const handleDepthChange = (event) => {
    setDepth(event.target.value)
  }

  const playAgain = () => {
    setGame(new Chess())
    setFen("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1")
    setMoves([{}])
    setStarted(false)
    setGameOver(false)
  }

  const reviewGame = () => {
    // take to review page with game pgn
    window.location.reload()
  }

  const switchSides = () => {
    setPlayingAsWhite(!playingAsWhite)
    setBoardOrientation(boardOrientation === 'white' ? 'black' : 'white')
  }

  const startGame = () => {
    setStarted(true)
    if (boardOrientation === 'black') {
      setThinking(true)
      axios.get(`${backendURL}/bestmove?fen=${game.fen()}&elo=${elo}&depth=${depth}`)
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
    let currentMove = moves.pop()

    if (game.turn() === 'b') {
      currentMove.whiteMove = move
      moves.push(currentMove)
    }
    else {
      currentMove.blackMove = move
      moves.push(currentMove)
      moves.push({})
    }
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
          axios.get(`${backendURL}/bestmove?fen=${move.after}&elo=${elo}&depth=${depth}`)
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
    <Grid container spacing={1} style={{ paddingTop: '20px', fontFamily: 'Roboto'}} >
      <PostGameModal open={gameOver} text={gameOverText} playAgain={playAgain} />
      <Grid xs={6} style={{ paddingLeft: '30px' }}>
        <Stack spacing={2} style={{ maxWidth: 'calc(100vh - 100px)' }}>
          { thinking && (
            <LinearProgress />
          )}
          { !thinking && (
            <LinearProgress  sx={{'& .MuiLinearProgress-bar': {backgroundColor: 'white'}}} variant="determinate" value={100} />
          )}
          <Chessboard id="board" position={fen} onPieceDrop={onDrop} arePremovesAllowed={true} animationDuration={500} boardOrientation={boardOrientation}/>
        </Stack>
      </Grid>
      <Grid xs={6} style={{paddingRight: '30px'}}>
        <Stack spacing={4} alignItems='center'>
          { !started && (
            <>
              <h1><u>Game Setup</u></h1>
              <Stack direction={"row"} alignItems={"center"} spacing={1}>
                <h2><u>Elo</u></h2>
                <Tooltip placement={'top'} title={"Determines Stockfish's playing strength. Higher elo makes it more challenging, while lower elo make it easier."}><InfoIcon /></Tooltip>
              </Stack>
              <MySlider onSliderChange={handleEloChange} defaultValue={elo} step={1} min={1320} max={3190} />
              <Stack direction={"row"} alignItems={"center"} spacing={1}>
                <h2><u>Depth</u></h2>
                <Tooltip placement={'top'} title={"Determines how deeply Stockfish thinks. Higher depth allows for deeper analysis, but will cause longer response times."}><InfoIcon /></Tooltip>
              </Stack>
              <MySlider onSliderChange={handleDepthChange} defaultValue={depth} step={1} min={10} max={25} />
              <h2><u>Board Orientation</u></h2>
              <Stack direction="row" justifyContent="center" spacing={5}>
                {playingAsWhite && (
                  <Button variant="contained" onClick={switchSides} style={{ backgroundColor: 'black', color: 'white' }}>
                    Play as Black
                  </Button>
                )}
                {!playingAsWhite && (
                  <Button variant="contained" onClick={switchSides} style={{ backgroundColor: 'white', color: 'black' }}>
                    Play as White
                  </Button>
                )}
                <Button variant="contained" onClick={startGame}>
                  Begin
                </Button>     
              </Stack>
            </>
          )}
          { started && (
            <MoveTable moves={moves} />
          )}
        </Stack>
      </Grid>
    </Grid>
  )
}