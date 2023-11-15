import './App.css';
import React, { useState, useMemo } from 'react'
import { Chess } from 'chess.js'
import { Chessboard } from 'react-chessboard'
import MySlider from './components/MySlider'
import MoveTable from './components/MoveTable'
import axios from 'axios'
import Grid from '@mui/material/Unstable_Grid2'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import LinearProgress from '@mui/material/LinearProgress'

export default function App() {
  const game = useMemo(() => new Chess(), [])
  const [elo, setElo] = useState(1320)
  const [fen, setFen] = useState(game.fen())
  const [moves] = useState([{}])
  const [playingAsWhite, setPlayingAsWhite] = useState(true)
  const [boardOrientation, setBoardOrientation] = useState('white')
  const [started, setStarted] = useState(false)
  const [thinking, setThinking] = useState(false)
  const backendURL = 'https://stockfish-gui-backend.azurewebsites.net'
  // const backendURL = 'http://localhost:3001'

  const handleSliderChange = (event) => {
    setElo(event.target.value)
  }

  const switchSides = () => {
    setPlayingAsWhite(!playingAsWhite)
    setBoardOrientation(boardOrientation === 'white' ? 'black' : 'white')
  }

  const startGame = () => {
    setStarted(true)
    if (boardOrientation === 'black') {
      setThinking(true)
      axios.get(`${backendURL}/bestmove?fen=${game.fen()}&elo=${elo}`)
      .then (response => {
        const bestmove = response.data.bestmove
        makeMove({from: bestmove.substring(0,2), to: bestmove.substring(2,4), promotion: "q"})
        setThinking(false)
      })
      .catch (error => {
        console.log(error)
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
            alert(`Checkmate! ${game.turn() === 'w' ? "Black" : "White"} wins.`)
          } else if (game.isDraw()) {
            alert("It's a draw!")
          } else {
            alert("Game over.")
          }
        }, 700)
      }

      return result
      }
    catch (error) {
      console.log(error)
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
          axios.get(`${backendURL}/bestmove?fen=${move.after}&elo=${elo}`)
          .then (response => {
            const bestmove = response.data.bestmove
            makeMove({from: bestmove.substring(0,2), to: bestmove.substring(2,4), promotion: "q"})
            setThinking(false)
          })
          .catch (error => {
            console.log(error)
          })
        }
      }
    }
  }

  return (
    <Grid container spacing={1} style={{ paddingTop: '20px', fontFamily: 'Roboto'}} >
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
              <h2><u>Stockfish's Elo</u></h2>
              <MySlider onSliderChange={handleSliderChange} />
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