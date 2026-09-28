import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AdminLayout } from './components/AdminLayout'
import { ProtectedRoute } from './components/ProtectedRoute'
import { AlumnoDetail } from './pages/AlumnoDetail'
import { AlumnosList } from './pages/AlumnosList'
import { Dashboard } from './pages/Dashboard'
import { Login } from './pages/Login'
import './styles/tokens.css'
import './App.css'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route element={<ProtectedRoute />}>
          <Route element={<AdminLayout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="alumnos" element={<AlumnosList />} />
            <Route path="alumnos/:id" element={<AlumnoDetail />} />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
