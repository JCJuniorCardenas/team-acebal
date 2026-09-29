import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '../components/Button'
import { Input } from '../components/Input'
import { api } from '../services/api'

export function Registro() {
  const [form, setForm] = useState({ nombre: '', email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [enviado, setEnviado] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    setLoading(true)
    setError('')
    try {
      await api.registro({
        nombre: form.nombre.trim() || undefined,
        email: form.email.trim(),
        password: form.password,
      })
      setEnviado(true)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="login-shell">
      <div className="login-bg" aria-hidden="true" />
      <div className="login-content">
        <p className="brand-mark login-anim" style={{ '--delay': '0s' }}>ACADEMIA</p>
        <h1 className="login-anim" style={{ '--delay': '.08s' }}>Creá tu cuenta.</h1>
        {enviado ? (
          <p className="login-intro login-anim" style={{ '--delay': '.16s' }}>
            Listo, ya podés <Link to="/login">iniciar sesión</Link> con <strong>{form.email.trim()}</strong>.
          </p>
        ) : (
          <>
            <p className="login-intro login-anim" style={{ '--delay': '.16s' }}>Probá el sistema con tu propia cuenta.</p>
            <form onSubmit={handleSubmit} className="login-anim" style={{ '--delay': '.24s' }}>
              <Input
                id="nombre"
                label="Nombre (opcional)"
                value={form.nombre}
                onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                autoComplete="name"
              />
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
                autoComplete="new-password"
                minLength={6}
                required
              />
              {error && <p className="error-message" role="alert">{error}</p>}
              <Button type="submit" disabled={loading}>{loading ? 'Creando…' : 'Crear cuenta'}</Button>
            </form>
          </>
        )}
        <p className="login-intro login-anim" style={{ '--delay': '.3s', margin: '1.5rem 0 0' }}>
          <Link to="/login">Ya tengo cuenta, iniciar sesión</Link>
        </p>
      </div>
    </main>
  )
}
