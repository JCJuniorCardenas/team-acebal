import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Button } from '../components/Button'
import { Input } from '../components/Input'
import { api } from '../services/api'
import { agregarUnMes, calcularEdad } from '../utils/date'

const emptyPago = { montoPagado: '', fechaPago: '' }
const emptyGraduacion = { grado: '', stripe: '', fechaGraduacion: '' }

export function AlumnoDetail() {
  const { id } = useParams()
  const [alumno, setAlumno] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [editing, setEditing] = useState(false)
  const [editForm, setEditForm] = useState(null)
  const [savingAlumno, setSavingAlumno] = useState(false)

  const [showPagoForm, setShowPagoForm] = useState(false)
  const [pagoForm, setPagoForm] = useState(emptyPago)
  const [savingPago, setSavingPago] = useState(false)
  const [editingPagoId, setEditingPagoId] = useState(null)
  const [editPagoForm, setEditPagoForm] = useState(emptyPago)

  const [showGraduacionForm, setShowGraduacionForm] = useState(false)
  const [graduacionForm, setGraduacionForm] = useState(emptyGraduacion)
  const [savingGraduacion, setSavingGraduacion] = useState(false)
  const [editingGraduacionId, setEditingGraduacionId] = useState(null)
  const [editGraduacionForm, setEditGraduacionForm] = useState(emptyGraduacion)

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

  function startEditing() {
    setEditForm({
      nombre: alumno.nombre,
      apellido: alumno.apellido || '',
      telefono: alumno.telefono || '',
      fechaNacimiento: alumno.fechaNacimiento || '',
    })
    setEditing(true)
  }

  async function submitEdit(event) {
    event.preventDefault()
    setSavingAlumno(true)
    setError('')
    try {
      await api.actualizarAlumno(id, {
        nombre: editForm.nombre.trim(),
        apellido: editForm.apellido.trim() || undefined,
        telefono: editForm.telefono.trim() || undefined,
        fechaNacimiento: editForm.fechaNacimiento || undefined,
      })
      setEditing(false)
      await load()
    } catch (err) {
      setError(err.message)
    } finally {
      setSavingAlumno(false)
    }
  }

  async function submitPago(event) {
    event.preventDefault()
    setSavingPago(true)
    setError('')
    try {
      await api.crearPago(id, {
        montoPagado: Number(pagoForm.montoPagado),
        fechaPago: pagoForm.fechaPago,
        proximaFechaVencimiento: agregarUnMes(pagoForm.fechaPago),
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

  function startEditPago(pago) {
    setEditingPagoId(pago.id)
    setEditPagoForm({
      montoPagado: pago.montoPagado,
      fechaPago: pago.fechaPago,
    })
  }

  async function submitEditPago(event) {
    event.preventDefault()
    setSavingPago(true)
    setError('')
    try {
      await api.actualizarPago(editingPagoId, {
        montoPagado: Number(editPagoForm.montoPagado),
        fechaPago: editPagoForm.fechaPago,
        proximaFechaVencimiento: agregarUnMes(editPagoForm.fechaPago),
      })
      setEditingPagoId(null)
      await load()
    } catch (err) {
      setError(err.message)
    } finally {
      setSavingPago(false)
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

  function startEditGraduacion(graduacion) {
    setEditingGraduacionId(graduacion.id)
    setEditGraduacionForm({
      grado: graduacion.grado,
      stripe: graduacion.stripe || '',
      fechaGraduacion: graduacion.fechaGraduacion,
    })
  }

  async function submitEditGraduacion(event) {
    event.preventDefault()
    setSavingGraduacion(true)
    setError('')
    try {
      await api.actualizarGraduacion(editingGraduacionId, {
        grado: editGraduacionForm.grado.trim(),
        stripe: editGraduacionForm.stripe.trim() || undefined,
        fechaGraduacion: editGraduacionForm.fechaGraduacion,
      })
      setEditingGraduacionId(null)
      await load()
    } catch (err) {
      setError(err.message)
    } finally {
      setSavingGraduacion(false)
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
          <small className="muted">{alumno.telefono || 'Sin teléfono'}{alumno.fechaNacimiento ? ` · ${calcularEdad(alumno.fechaNacimiento)} años` : ''}</small>
        </div>
        {!editing && <Button variant="text" onClick={startEditing}>Editar</Button>}
      </div>

      {error && <p className="error-message" role="alert">{error}</p>}

      {editing && (
        <form className="inline-form" onSubmit={submitEdit}>
          <div className="form-row">
            <Input id="edit-nombre" label="Nombre" value={editForm.nombre} onChange={(e) => setEditForm({ ...editForm, nombre: e.target.value })} required />
            <Input id="edit-apellido" label="Apellido" value={editForm.apellido} onChange={(e) => setEditForm({ ...editForm, apellido: e.target.value })} />
          </div>
          <div className="form-row">
            <Input id="edit-telefono" label="Teléfono" value={editForm.telefono} onChange={(e) => setEditForm({ ...editForm, telefono: e.target.value })} />
            <Input id="edit-fechaNacimiento" label="Fecha de nacimiento" type="date" value={editForm.fechaNacimiento} onChange={(e) => setEditForm({ ...editForm, fechaNacimiento: e.target.value })} />
          </div>
          <div className="form-actions">
            <Button variant="text" type="button" onClick={() => setEditing(false)}>Cancelar</Button>
            <Button type="submit" disabled={savingAlumno}>{savingAlumno ? 'Guardando…' : 'Guardar cambios'}</Button>
          </div>
        </form>
      )}

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
            </div>
            <p className="field-hint">Vence automáticamente un mes después de la fecha de pago.</p>
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
              editingPagoId === pago.id ? (
                <form className="inline-form" onSubmit={submitEditPago} key={pago.id}>
                  <div className="form-row">
                    <Input id={`edit-monto-${pago.id}`} label="Monto" type="number" min="0.01" step="0.01" value={editPagoForm.montoPagado} onChange={(e) => setEditPagoForm({ ...editPagoForm, montoPagado: e.target.value })} required />
                    <Input id={`edit-fechaPago-${pago.id}`} label="Fecha de pago" type="date" value={editPagoForm.fechaPago} onChange={(e) => setEditPagoForm({ ...editPagoForm, fechaPago: e.target.value })} required />
                  </div>
                  <p className="field-hint">Vence automáticamente un mes después de la fecha de pago.</p>
                  <div className="form-actions">
                    <Button variant="text" type="button" onClick={() => setEditingPagoId(null)}>Cancelar</Button>
                    <Button type="submit" disabled={savingPago}>{savingPago ? 'Guardando…' : 'Guardar cambios'}</Button>
                  </div>
                </form>
              ) : (
                <article className="admin-list-item" key={pago.id}>
                  <div className="list-item-info">
                    <strong>${Number(pago.montoPagado).toLocaleString('es-AR')}</strong>
                    <span>Pagado el {pago.fechaPago} · vence el {pago.proximaFechaVencimiento}</span>
                  </div>
                  <div className="item-actions">
                    <Button variant="text" onClick={() => startEditPago(pago)}>Editar</Button>
                    <Button variant="text" onClick={() => removePago(pago)}>Eliminar</Button>
                  </div>
                </article>
              )
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
              <Input id="stripe" label="Cinturón (opcional)" value={graduacionForm.stripe} onChange={(e) => setGraduacionForm({ ...graduacionForm, stripe: e.target.value })} />
              <Input id="fechaGraduacion" label="Fecha de graduación" type="date" value={graduacionForm.fechaGraduacion} onChange={(e) => setGraduacionForm({ ...graduacionForm, fechaGraduacion: e.target.value })} required />
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
              editingGraduacionId === graduacion.id ? (
                <form className="inline-form" onSubmit={submitEditGraduacion} key={graduacion.id}>
                  <div className="form-row">
                    <Input id={`edit-grado-${graduacion.id}`} label="Grado" value={editGraduacionForm.grado} onChange={(e) => setEditGraduacionForm({ ...editGraduacionForm, grado: e.target.value })} required />
                    <Input id={`edit-stripe-${graduacion.id}`} label="Cinturón (opcional)" value={editGraduacionForm.stripe} onChange={(e) => setEditGraduacionForm({ ...editGraduacionForm, stripe: e.target.value })} />
                    <Input id={`edit-fechaGrad-${graduacion.id}`} label="Fecha de graduación" type="date" value={editGraduacionForm.fechaGraduacion} onChange={(e) => setEditGraduacionForm({ ...editGraduacionForm, fechaGraduacion: e.target.value })} required />
                  </div>
                  <div className="form-actions">
                    <Button variant="text" type="button" onClick={() => setEditingGraduacionId(null)}>Cancelar</Button>
                    <Button type="submit" disabled={savingGraduacion}>{savingGraduacion ? 'Guardando…' : 'Guardar cambios'}</Button>
                  </div>
                </form>
              ) : (
                <article className="admin-list-item" key={graduacion.id}>
                  <div className="list-item-info">
                    <strong>{graduacion.grado}</strong>
                    <span>{graduacion.stripe ? `${graduacion.stripe} · ` : ''}{graduacion.fechaGraduacion}</span>
                  </div>
                  <div className="item-actions">
                    <Button variant="text" onClick={() => startEditGraduacion(graduacion)}>Editar</Button>
                    <Button variant="text" onClick={() => removeGraduacion(graduacion)}>Eliminar</Button>
                  </div>
                </article>
              )
            ))}
          </div>
        )}
      </section>
    </section>
  )
}
