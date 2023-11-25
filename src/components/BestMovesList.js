import React from 'react'
import { Stack, ListItem, ListItemText, Divider, LinearProgress } from '@mui/material'

export default function BestMoveList({ bestLines, thinking, multiPV }) {

    function getMateIn(score) {
        let split = score.split(" ")
        let mateIn = Math.abs(split[1])
        return `Mate in ${mateIn}`
    }

    return (
        <div style={{ height: 'calc(100vh - 300px)', border: '1px solid grey', borderRadius: '5px', backgroundColor: '#eeeeee', overflowY: 'auto'}}>
          {thinking ? (
            <Stack spacing={1} paddingTop={'10px'}>
              {Array(multiPV).fill().map((_, index) => (
                <div key={index}>
                    <ListItem>
                        <ListItemText primary={`${index + 1}. ???`} />
                    </ListItem>
                    <LinearProgress />
                    <Divider style={{ paddingTop: '35px' }} />
                </div>
              ))}
            </Stack>
          ) : (
            <Stack>
              {bestLines.map((line, index) => (
                <div key={index}>
                  <ListItem>
                    <ListItemText primary={`${index + 1}. ${line.bestMove} (${isNaN(line.score) ? getMateIn(line.score) : (line.score * .01).toFixed(2)})`} secondary={line.line.join(', ')} />
                  </ListItem>
                  {index !== bestLines.length - 1 && <Divider />}
                </div>
              ))}
            </Stack>
          )}
        </div>
      )
}