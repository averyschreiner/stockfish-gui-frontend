import React from 'react'
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material'

export default function MySlider({ moves, height, theCurrentMove, outlineOnHover=false, jumpTo }) {
    function whiteMove(index) {
        return moves[index]
    }
    
    function blackMove(index) {
        return moves[index+1]
    }

    function addHover(e) {
        if (outlineOnHover) {
            e.target.style.border = '1px solid grey'
            e.target.style.borderRadius = '10px'
            e.target.style.cursor = 'pointer'
            e.target.style.padding = '5px'
            e.target.style.margin = '0px'
        }
    }

    function removeHover(e) {
        if (outlineOnHover) {
            e.target.style.border = '1px solid rgba(255,255,255,0)'
        }
    }

    return (
        <div style={{ height: height, overflowY: 'auto', minWidth: '100%'}}>
            <TableContainer component={Paper} >
                <Table style={{border: '1.5px solid lightgrey'}}>
                    <TableHead>
                        <TableRow>
                            <TableCell></TableCell>
                            <TableCell align='center'>White</TableCell>
                            <TableCell align='center'>Black</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {moves.map((_, index) => (
                            index % 2 === 0 && (
                                <TableRow key={index} style={{ backgroundColor: index % 4 === 0 ? '#eeeeee' : 'white'}}>
                                    <TableCell align='center'>{Math.ceil(index / 2) + 1}.</TableCell>
                                    <TableCell align='center' onClick={() => jumpTo(index)}>
                                        <div onMouseEnter={addHover} onMouseLeave={removeHover} style={{padding: '5px', borderRadius: '10px', margin: '0px', border: '1px solid rgba(255,255,255,0)', textDecoration: index <= theCurrentMove ? 'underline' : 'none'}}>
                                            {whiteMove(index)}
                                        </div>
                                    </TableCell>
                                    <TableCell align='center' onClick={() => jumpTo(index+1)}>
                                        <div onMouseEnter={addHover} onMouseLeave={removeHover} style={{padding: '5px', borderRadius: '10px', margin: '0px', border: '1px solid rgba(255,255,255,0)', textDecoration: index+1 <= theCurrentMove ? 'underline' : 'none'}}>
                                            {blackMove(index)}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            )
                        ))}

                    </TableBody>
                </Table>
            </TableContainer>
        </div>
    )
}