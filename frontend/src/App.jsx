import { useState } from 'react'
import {Route, Routes} from 'react-router-dom'
import { AuthPage } from './context/AuthContext.jsx'
import HomePage from './page/HomePage.jsx'
import LoginPage from './page/LoginPage.jsx'
import './App.css'

function App() {

  return (
    <>
      <Routes>
        <Route path="/" element={
          <AuthPage>
            <HomePage />
          </AuthPage>
        } />
        <Route path="/login" element={<LoginPage />} />
      </Routes>
    </>
  )
}

export default App
