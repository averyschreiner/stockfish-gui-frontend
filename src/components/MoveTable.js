import React from 'react'
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material'

export default function MySlider({ moves, height, theCurrentMove }) {

    function whiteMove(index) {
        return moves[index]
    }
    
    function blackMove(index) {
        return moves[index+1]
    }

    return (
        <div style={{ height: height, overflowY: 'auto', minWidth: '100%'}}>
            <TableContainer component={Paper} >
                <Table style={{border: '1.5px solid lightgrey'}}>
                    <TableHead>
                        <TableRow>
                            <TableCell></TableCell>
                            <TableCell>White</TableCell>
                            <TableCell>Black</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {moves.map((_, index) => (
                            index % 2 === 0 && (
                                <TableRow key={index} style={{ backgroundColor: index % 4 === 0 ? '#eeeeee' : 'white' }}>
                                    <TableCell>{Math.ceil(index / 2) + 1}.</TableCell>
                                    <TableCell>
                                        <div style={index <= theCurrentMove ? { textDecoration: 'underline' } : null}>
                                            {whiteMove(index)}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div style={index + 1 <= theCurrentMove ? { textDecoration: 'underline' } : null}>
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