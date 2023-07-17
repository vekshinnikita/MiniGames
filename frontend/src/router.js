import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import GamePage from "./pages/GamePage";
import LobbyPage from "./pages/LobbyPage";
import MainPage from "./pages/MainPage";


const router = (
    <BrowserRouter>
        <Routes>
            <Route exact path='/' element={<MainPage/>}/>
            <Route path='/lobby' element={<LobbyPage/>}/>
            <Route path='/game/:game' element={<GamePage/>}/>
        </Routes>
    </BrowserRouter>
)

export default router