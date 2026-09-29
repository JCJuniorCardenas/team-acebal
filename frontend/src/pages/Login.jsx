import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { Button } from '../components/Button'
import { Input } from '../components/Input'
import { api, hasValidToken, TOKEN_KEY } from '../services/api'

export function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [noVerificado, setNoVerificado] = useState(false)
  const [reenviando, setReenviando] = useState(false)
  const [reenviado, setReenviado] = useState(false)

  const verificado = searchParams.get('verificado')

  useEffect(() => {
    if (hasValidToken()) navigate('/dashboard', { replace: true })
  }, [navigate])

  async function handleSubmit(event) {
    event.preventDefault()
    setLoading(true)
    setError('')
    setNoVerificado(false)
    setReenviado(false)
    try {
      const { access_token: token } = await api.login({
        email: form.email.trim(),
        password: form.password.trim(),
      })
      localStorage.setItem(TOKEN_KEY, token)
      navigate(location.state?.from?.pathname || '/dashboard', { replace: true })
    } catch (err) {
      if (err.status === 401 && err.message.includes('confirmaste')) {
        setNoVerificado(true)
      }
      setError(err.message === 'No se pudo completar la solicitud.' ? 'Email o contraseña incorrectos' : err.message)
    } finally {
      setLoading(false)
    }
  }

  async function reenviarVerificacion() {
    setReenviando(true)
    try {
      await api.reenviarVerificacion(form.email.trim())
      setReenviado(true)
    } catch {
      // El endpoint no distingue si el email existe; cualquier error se ignora en la UI.
      setReenviado(true)
    } finally {
      setReenviando(false)
    }
  }

  return (
    <main className="login-shell">
      <div className="login-bg" aria-hidden="true" />
      <div className="login-content">
        <p className="brand-mark login-anim" style={{ '--delay': '0s' }}>ACADEMIA</p>
        <h1 className="login-anim" style={{ '--delay': '.08s' }}>Ingresá al panel.</h1>
        <p className="login-intro login-anim" style={{ '--delay': '.16s' }}>Gestioná alumnos, pagos y graduaciones.</p>
        {verificado === '1' && <p className="success-message" role="status">Cuenta confirmada. Ya podés ingresar.</p>}
        {verificado === '0' && <p className="error-message" role="alert">El link de verificación es inválido o expiró.</p>}
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
          {noVerificado && !reenviado && (
            <Button type="button" variant="text" onClick={reenviarVerificacion} disabled={reenviando}>
              {reenviando ? 'Enviando…' : 'Reenviar email de verificación'}
            </Button>
          )}
          {reenviado && <p className="success-message" role="status">Listo, revisá tu email.</p>}
          <Button type="submit" disabled={loading}>{loading ? 'Ingresando…' : 'Iniciar sesión'}</Button>
        </form>
        <p className="login-intro login-anim" style={{ '--delay': '.3s', margin: '1.5rem 0 0' }}>
          <Link to="/registro">Crear una cuenta</Link>
        </p>
      </div>
    </main>
  )
}
