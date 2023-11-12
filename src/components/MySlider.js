import { Slider } from '@mui/material'
import React from 'react'

export default function MySlider({ onSliderChange }) {
    const handleSliderChange = (value) => {
        onSliderChange(value)
    }

    return (
        <Slider
            aria-label="Depth"
            valueLabelDisplay="on"
            onChange={handleSliderChange}
            defaultValue={1320}
            step={1}
            min={1320}
            max={3190}
        />
    )
}