import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Review from './views/Review'
import Play from './views/Play'
import Navbar from './components/Navbar'

export default function App() {
    return (
        <Router>
            <Navbar />
            <Routes>
                <Route exact path="/" Component={Review} />
                <Route path="/play" Component={Play} />
            </Routes>
        </Router>
    )
}
