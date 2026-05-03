import { useEffect, useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from '@/context/AuthContext'
import LandingPage from '@/pages/LandingPage'
import Dashboard from '@/pages/Dashboard'
import LoginPage from '@/pages/Login'

function App() {
  const [isAdminSubdomain, setIsAdminSubdomain] = useState(false)

  useEffect(() => {
    const hostname = window.location.hostname
    if (hostname.startsWith('admin.')) {
      setIsAdminSubdomain(true)
    }
  }, [])

  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Main Landing Page */}
          <Route path="/" element={<LandingPage />} />
          
          <Route path="/login" element={<LoginPage />} />
          
          {/* Dashboard / Admin Area */}
          <Route path="/dashboard" element={<Dashboard />} />
          

          
          {/* Admin Subdomain handling */}
          <Route path="*" element={isAdminSubdomain ? <Navigate to="/dashboard" /> : <LandingPage />} />

        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App

