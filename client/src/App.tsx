import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import Register from './pages/Register'
import Login from './pages/Login'
import Profile from './pages/UserPage'
import './App.css'
import PublicView from './pages/PublicView'

// This file contains the main App component which sets up the routing for the application.

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route 
            path="/profile" 
            element={
              <Profile />
            } 
          />
          <Route path="/public-view/:documentId" element={<PublicView />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
