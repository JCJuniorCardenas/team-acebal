import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { Button } from './Button'
import { TOKEN_KEY } from '../services/api'

export function AdminLayout() {
  const navigate = useNavigate()

  function logout() {
    localStorage.removeItem(TOKEN_KEY)
    navigate('/login', { replace: true })
  }

  return (
    <div className="admin-shell">
      <header className="admin-header">
        <div>
          <p className="brand-mark">TEAM ACEBAL</p>
          <span className="admin-label">Administración</span>
        </div>
        <Button variant="text" onClick={logout}>Cerrar sesión</Button>
      </header>
      <nav className="admin-nav" aria-label="Administración">
        <NavLink to="/alumnos">Alumnos</NavLink>
      </nav>
      <main className="admin-content">
        <Outlet />
      </main>
    </div>
  )
}
