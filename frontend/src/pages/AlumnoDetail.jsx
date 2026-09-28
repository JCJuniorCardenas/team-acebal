import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Button } from '../components/Button'
import { Input } from '../components/Input'
import { api } from '../services/api'

const emptyPago = { montoPagado: '', fechaPago: '', proximaFechaVencimiento: '' }
const emptyGraduacion = { grado: '', stripe: '', fechaGraduacion: '' }

export function AlumnoDetail() {
  const { id } = useParams()
  const [alumno, setAlumno] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [showPagoForm, setShowPagoForm] = useState(false)
  const [pagoForm, setPagoForm] = useState(emptyPago)
  const [savingPago, setSavingPago] = useState(false)

  const [showGraduacionForm, setShowGraduacionForm] = useState(false)
  const [graduacionForm, setGraduacionForm] = useState(emptyGraduacion)
  const [savingGraduacion, setSavingGraduacion] = useState(false)

  async function load() {
    setError('')
    try {
      setAlumno(await api.getAlumno(id))
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // oxlint-disable-next-line react/set-state-in-effect react-hooks/exhaustive-deps
  useEffect(() => { load() }, [id])

  async function submitPago(event) {
    event.preventDefault()
    setSavingPago(true)
    setError('')
    try {
      await api.crearPago(id, {
        montoPagado: Number(pagoForm.montoPagado),
        fechaPago: pagoForm.fechaPago,
        proximaFechaVencimiento: pagoForm.proximaFechaVencimiento,
      })
      setPagoForm(emptyPago)
      setShowPagoForm(false)
      await load()
    } catch (err) {
      setError(err.message)
    } finally {
      setSavingPago(false)
    }
  }

  async function removePago(pago) {
    if (!window.confirm(`¿Eliminar el pago de $${pago.montoPagado}?`)) return
    setError('')
    try {
      await api.eliminarPago(pago.id)
      await load()
    } catch (err) {
      setError(err.message)
    }
  }

  async function submitGraduacion(event) {
    event.preventDefault()
    setSavingGraduacion(true)
    setError('')
    try {
      await api.crearGraduacion(id, {
        grado: graduacionForm.grado.trim(),
        stripe: graduacionForm.stripe.trim() || undefined,
        fechaGraduacion: graduacionForm.fechaGraduacion,
      })
      setGraduacionForm(emptyGraduacion)
      setShowGraduacionForm(false)
      await load()
    } catch (err) {
      setError(err.message)
    } finally {
      setSavingGraduacion(false)
    }
  }

  async function removeGraduacion(graduacion) {
    if (!window.confirm(`¿Eliminar la graduación "${graduacion.grado}"?`)) return
    setError('')
    try {
      await api.eliminarGraduacion(graduacion.id)
      await load()
    } catch (err) {
      setError(err.message)
    }
  }

  if (loading) return <p className="loading-state">Cargando alumno…</p>
  if (!alumno) return <p className="error-message" role="alert">{error || 'No se encontró el alumno'}</p>

  return (
    <section>
      <Link className="back-link" to="/alumnos">← Volver a alumnos</Link>
      <div className="content-title-row">
        <div>
          <p className="section-kicker">Alumno</p>
          <h1>{alumno.nombre} {alumno.apellido}</h1>
          <small className="muted">{alumno.telefono || 'Sin teléfono'}{alumno.fechaNacimiento ? ` · nació el ${alumno.fechaNacimiento}` : ''}</small>
        </div>
      </div>

      {error && <p className="error-message" role="alert">{error}</p>}

      <section className="detail-block">
        <div className="content-title-row content-title-row--sub">
          <h2>Pagos</h2>
          <Button variant="text" onClick={() => setShowPagoForm((v) => !v)}>{showPagoForm ? 'Cancelar' : '+ Registrar pago'}</Button>
        </div>
        {showPagoForm && (
          <form className="inline-form" onSubmit={submitPago}>
            <div className="form-row">
              <Input id="montoPagado" label="Monto" type="number" min="0.01" step="0.01" value={pagoForm.montoPagado} onChange={(e) => setPagoForm({ ...pagoForm, montoPagado: e.target.value })} required />
              <Input id="fechaPago" label="Fecha de pago" type="date" value={pagoForm.fechaPago} onChange={(e) => setPagoForm({ ...pagoForm, fechaPago: e.target.value })} required />
              <Input id="proximaFechaVencimiento" label="Próximo vencimiento" type="date" value={pagoForm.proximaFechaVencimiento} onChange={(e) => setPagoForm({ ...pagoForm, proximaFechaVencimiento: e.target.value })} required />
            </div>
            <div className="form-actions">
              <Button type="submit" disabled={savingPago}>{savingPago ? 'Guardando…' : 'Registrar pago'}</Button>
            </div>
          </form>
        )}
        {alumno.pagos?.length === 0 ? (
          <p className="empty-state">Sin pagos registrados.</p>
        ) : (
          <div className="admin-list">
            {alumno.pagos?.map((pago) => (
              <article className="admin-list-item" key={pago.id}>
                <div className="list-item-info">
                  <strong>${Number(pago.montoPagado).toLocaleString('es-AR')}</strong>
                  <span>Pagado el {pago.fechaPago} · vence el {pago.proximaFechaVencimiento}</span>
                </div>
                <Button variant="text" onClick={() => removePago(pago)}>Eliminar</Button>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="detail-block">
        <div className="content-title-row content-title-row--sub">
          <h2>Graduaciones</h2>
          <Button variant="text" onClick={() => setShowGraduacionForm((v) => !v)}>{showGraduacionForm ? 'Cancelar' : '+ Registrar graduación'}</Button>
        </div>
        {showGraduacionForm && (
          <form className="inline-form" onSubmit={submitGraduacion}>
            <div className="form-row">
              <Input id="grado" label="Grado" value={graduacionForm.grado} onChange={(e) => setGraduacionForm({ ...graduacionForm, grado: e.target.value })} required />
              <Input id="stripe" label="Franja (opcional)" value={graduacionForm.stripe} onChange={(e) => setGraduacionForm({ ...graduacionForm, stripe: e.target.value })} />
              <Input id="fechaGraduacion" label="Fecha" type="date" value={graduacionForm.fechaGraduacion} onChange={(e) => setGraduacionForm({ ...graduacionForm, fechaGraduacion: e.target.value })} required />
            </div>
            <div className="form-actions">
              <Button type="submit" disabled={savingGraduacion}>{savingGraduacion ? 'Guardando…' : 'Registrar graduación'}</Button>
            </div>
          </form>
        )}
        {alumno.graduaciones?.length === 0 ? (
          <p className="empty-state">Sin graduaciones registradas.</p>
        ) : (
          <div className="admin-list">
            {alumno.graduaciones?.map((graduacion) => (
              <article className="admin-list-item" key={graduacion.id}>
                <div className="list-item-info">
                  <strong>{graduacion.grado}</strong>
                  <span>{graduacion.stripe ? `${graduacion.stripe} · ` : ''}{graduacion.fechaGraduacion}</span>
                </div>
                <Button variant="text" onClick={() => removeGraduacion(graduacion)}>Eliminar</Button>
              </article>
            ))}
          </div>
        )}
      </section>
    </section>
  )
}
