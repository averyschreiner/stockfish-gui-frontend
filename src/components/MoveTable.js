import React from 'react'
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material'

export default function MySlider({ moves }) {
    return (
        <div style={{ height: 'calc(100vh - 80px)', overflowY: 'auto', minWidth: '100%'}}>
            <TableContainer component={Paper} elevation={0} >
                <Table style={{border: '1.5px solid lightgrey'}}>
                    <TableHead>
                        <TableRow>
                            <TableCell></TableCell>
                            <TableCell>White</TableCell>
                            <TableCell>Black</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody id="table-container" >
                        {moves.map((move, index) => (
                            move.whiteMove !== undefined && (
                                <TableRow key={index} style={{ backgroundColor: index % 2 === 0 ? '#eeeeee' : 'white' }}>
                                    <TableCell>{index + 1}.</TableCell>
                                    <TableCell>{move.whiteMove}</TableCell>
                                    <TableCell>{move.blackMove}</TableCell>
                                </TableRow>
                            )
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </div>
    )
}