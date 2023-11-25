import { Slider } from '@mui/material'
import React from 'react'

export default function MySlider({ onSliderChange, defaultValue, step, min, max, disabled }) {
    const handleSliderChange = (value) => {
        onSliderChange(value)
    }

    return (
        <Slider
            aria-label="Depth"
            valueLabelDisplay="on"
            onChange={handleSliderChange}
            defaultValue={defaultValue}
            step={step}
            min={min}
            max={max}
            disabled={disabled}
        />
    )
}