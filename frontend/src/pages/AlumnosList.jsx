import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '../components/Button'
import { Input } from '../components/Input'
import { api } from '../services/api'

const emptyForm = { nombre: '', apellido: '', telefono: '', fechaNacimiento: '' }

export function AlumnosList() {
  const [alumnos, setAlumnos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)

  async function load() {
    setError('')
    try {
      setAlumnos(await api.getAlumnos())
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // oxlint-disable-next-line react/set-state-in-effect
  useEffect(() => { load() }, [])

  function change(event) {
    setForm({ ...form, [event.target.name]: event.target.value })
  }

  async function submit(event) {
    event.preventDefault()
    setSaving(true)
    setError('')
    try {
      const data = {
        nombre: form.nombre.trim(),
        apellido: form.apellido.trim() || undefined,
        telefono: form.telefono.trim() || undefined,
        fechaNacimiento: form.fechaNacimiento || undefined,
      }
      await api.crearAlumno(data)
      setForm(emptyForm)
      setShowForm(false)
      await load()
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  async function remove(alumno) {
    if (!window.confirm(`¿Eliminar a ${alumno.nombre} ${alumno.apellido || ''}?`)) return
    setError('')
    try {
      await api.eliminarAlumno(alumno.id)
      await load()
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <section>
      <div className="content-title-row">
        <div>
          <p className="section-kicker">Academia</p>
          <h1>Alumnos</h1>
        </div>
        <Button onClick={() => setShowForm((v) => !v)}>{showForm ? 'Cancelar' : 'Nuevo alumno'}</Button>
      </div>

      {error && <p className="error-message" role="alert">{error}</p>}

      {showForm && (
        <form className="inline-form" onSubmit={submit}>
          <div className="form-row">
            <Input id="nombre" name="nombre" label="Nombre" value={form.nombre} onChange={change} required />
            <Input id="apellido" name="apellido" label="Apellido" value={form.apellido} onChange={change} />
          </div>
          <div className="form-row">
            <Input id="telefono" name="telefono" label="Teléfono" value={form.telefono} onChange={change} />
            <Input id="fechaNacimiento" name="fechaNacimiento" label="Fecha de nacimiento" type="date" value={form.fechaNacimiento} onChange={change} />
          </div>
          <div className="form-actions">
            <Button type="submit" disabled={saving}>{saving ? 'Guardando…' : 'Crear alumno'}</Button>
          </div>
        </form>
      )}

      {loading ? (
        <p className="loading-state">Cargando alumnos…</p>
      ) : alumnos.length === 0 ? (
        <p className="empty-state">Todavía no cargaste ningún alumno.</p>
      ) : (
        <div className="admin-list">
          {alumnos.map((alumno) => (
            <article className="admin-list-item" key={alumno.id}>
              <div className="list-item-info">
                <Link to={`/alumnos/${alumno.id}`}><strong>{alumno.nombre} {alumno.apellido}</strong></Link>
                <span>{alumno.telefono || 'Sin teléfono'}</span>
              </div>
              <div className="item-actions">
                <Link className="button button--text" to={`/alumnos/${alumno.id}`}>Ver</Link>
                <Button variant="text" onClick={() => remove(alumno)}>Eliminar</Button>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  )
}
