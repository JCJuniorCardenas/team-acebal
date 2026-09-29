import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Button } from '../components/Button'
import { Input } from '../components/Input'
import { api, hasValidToken, TOKEN_KEY } from '../services/api'

export function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (hasValidToken()) navigate('/dashboard', { replace: true })
  }, [navigate])

  async function handleSubmit(event) {
    event.preventDefault()
    setLoading(true)
    setError('')
    try {
      const { access_token: token } = await api.login({
        email: form.email.trim(),
        password: form.password.trim(),
      })
      localStorage.setItem(TOKEN_KEY, token)
      navigate(location.state?.from?.pathname || '/dashboard', { replace: true })
    } catch (err) {
      setError(err.message === 'No se pudo completar la solicitud.' ? 'Email o contraseña incorrectos' : err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="login-shell">
      <div className="login-bg" aria-hidden="true" />
      <div className="login-content">
        <p className="brand-mark login-anim" style={{ '--delay': '0s' }}>ACADEMIA</p>
        <h1 className="login-anim" style={{ '--delay': '.08s' }}>Ingresá al panel.</h1>
        <p className="login-intro login-anim" style={{ '--delay': '.16s' }}>Gestioná alumnos, pagos y graduaciones.</p>
        <form onSubmit={handleSubmit} className="login-anim" style={{ '--delay': '.24s' }}>
          <Input
            id="email"
            label="Email"
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            autoComplete="email"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck="false"
            required
          />
          <Input
            id="password"
            label="Contraseña"
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            autoComplete="current-password"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck="false"
            required
          />
          {error && <p className="error-message" role="alert">{error}</p>}
          <Button type="submit" disabled={loading}>{loading ? 'Ingresando…' : 'Iniciar sesión'}</Button>
        </form>
      </div>
    </main>
  )
}
