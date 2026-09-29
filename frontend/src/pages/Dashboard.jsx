import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Reveal } from '../components/Reveal'
import { api } from '../services/api'

function nombreCompleto(persona) {
  return [persona.nombre, persona.apellido].filter(Boolean).join(' ')
}

export function Dashboard() {
  const [resumen, setResumen] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  async function load() {
    setError('')
    try {
      setResumen(await api.getDashboard())
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // oxlint-disable-next-line react/set-state-in-effect
  useEffect(() => { load() }, [])

  if (loading) return <p className="loading-state">Cargando resumen…</p>
  if (!resumen) return <p className="error-message" role="alert">{error || 'No se pudo cargar el resumen'}</p>

  return (
    <section>
      <div className="content-title-row">
        <div>
          <p className="section-kicker">Hoy</p>
          <h1>Dashboard</h1>
        </div>
      </div>

      {error && <p className="error-message" role="alert">{error}</p>}

      <div className="stat-cards">
        <Reveal as="article" className="stat-card" delay={0}>
          <span>Alumnos</span>
          <strong>{resumen.totalAlumnos}</strong>
        </Reveal>
        <Reveal as="article" className={`stat-card ${resumen.totalPagosVencidos > 0 ? 'stat-card--alert' : ''}`} delay={0.08}>
          <span>Cuotas vencidas</span>
          <strong>{resumen.totalPagosVencidos}</strong>
        </Reveal>
        <Reveal as="article" className="stat-card" delay={0.16}>
          <span>Recaudado este mes</span>
          <strong>${Number(resumen.recaudadoMes).toLocaleString('es-AR')}</strong>
        </Reveal>
      </div>

      <Reveal as="section" className="detail-block">
        <div className="content-title-row content-title-row--sub">
          <h2>Cuotas vencidas</h2>
        </div>
        {resumen.vencidos.length === 0 ? (
          <p className="empty-state">No hay cuotas vencidas. 🎉</p>
        ) : (
          <div className="admin-list">
            {resumen.vencidos.map((item) => (
              <Link className="admin-list-item admin-list-item--link" to={`/alumnos/${item.alumnoId}`} key={item.alumnoId}>
                <div className="list-item-info">
                  <strong>{nombreCompleto(item)}</strong>
                  <span>Venció el {item.fechaVencimiento}</span>
                </div>
                <span className="badge badge--danger">{item.diasVencido} {item.diasVencido === 1 ? 'día' : 'días'}</span>
              </Link>
            ))}
          </div>
        )}
      </Reveal>

      <Reveal as="section" className="detail-block">
        <div className="content-title-row content-title-row--sub">
          <h2>Por vencer (próximos 7 días)</h2>
        </div>
        {resumen.proximosAVencer.length === 0 ? (
          <p className="empty-state">Nadie vence en los próximos días.</p>
        ) : (
          <div className="admin-list">
            {resumen.proximosAVencer.map((item) => (
              <Link className="admin-list-item admin-list-item--link" to={`/alumnos/${item.alumnoId}`} key={item.alumnoId}>
                <div className="list-item-info">
                  <strong>{nombreCompleto(item)}</strong>
                  <span>Vence el {item.fechaVencimiento}</span>
                </div>
                <span className="badge badge--warning">{item.diasParaVencer === 0 ? 'hoy' : `en ${item.diasParaVencer} ${item.diasParaVencer === 1 ? 'día' : 'días'}`}</span>
              </Link>
            ))}
          </div>
        )}
      </Reveal>

      {resumen.sinPagos.length > 0 && (
        <Reveal as="section" className="detail-block">
          <div className="content-title-row content-title-row--sub">
            <h2>Sin pagos registrados</h2>
          </div>
          <div className="admin-list">
            {resumen.sinPagos.map((item) => (
              <Link className="admin-list-item admin-list-item--link" to={`/alumnos/${item.alumnoId}`} key={item.alumnoId}>
                <div className="list-item-info">
                  <strong>{nombreCompleto(item)}</strong>
                </div>
              </Link>
            ))}
          </div>
        </Reveal>
      )}
    </section>
  )
}
