const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3000').replace(/\/$/, '')
const TOKEN_KEY = 'team_acebal_token'

export function hasValidToken() {
  const token = localStorage.getItem(TOKEN_KEY)
  if (!token) return false
  try {
    const encodedPayload = token.split('.')[1].replaceAll('-', '+').replaceAll('_', '/')
    const payload = JSON.parse(
      atob(encodedPayload.padEnd(encodedPayload.length + ((4 - (encodedPayload.length % 4)) % 4), '=')),
    )
    return typeof payload.exp === 'number' && payload.exp * 1000 > Date.now()
  } catch {
    return false
  }
}

async function request(path, options = {}, requiresAuth = true) {
  const token = localStorage.getItem(TOKEN_KEY)
  const headers = { 'Content-Type': 'application/json', ...options.headers }
  if (requiresAuth && token) headers.Authorization = `Bearer ${token}`

  let response
  try {
    response = await fetch(`${API_URL}${path.startsWith('/') ? path : `/${path}`}`, { ...options, headers })
  } catch {
    throw new Error('No pudimos conectar, revisá tu conexión e intentá de nuevo')
  }

  if (response.status === 401 && requiresAuth) {
    localStorage.removeItem(TOKEN_KEY)
    window.location.href = '/login'
    throw new Error('Sesión expirada. Volvé a iniciar sesión.')
  }

  if (!response.ok) {
    const body = await response.json().catch(() => ({}))
    const error = new Error(Array.isArray(body.message) ? body.message.join(', ') : body.message || 'No se pudo completar la solicitud.')
    error.status = response.status
    throw error
  }

  return response.status === 204 ? null : response.json()
}

export const api = {
  login: (credentials) => request('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }, false),

  getDashboard: () => request('/dashboard/resumen'),

  getAlumnos: () => request('/alumnos'),
  getAlumno: (id) => request(`/alumnos/${id}`),
  crearAlumno: (data) => request('/alumnos', { method: 'POST', body: JSON.stringify(data) }),
  actualizarAlumno: (id, data) => request(`/alumnos/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  eliminarAlumno: (id) => request(`/alumnos/${id}`, { method: 'DELETE' }),

  getPagos: (alumnoId) => request(`/alumnos/${alumnoId}/pagos`),
  crearPago: (alumnoId, data) => request(`/alumnos/${alumnoId}/pagos`, { method: 'POST', body: JSON.stringify(data) }),
  actualizarPago: (id, data) => request(`/pagos/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  eliminarPago: (id) => request(`/pagos/${id}`, { method: 'DELETE' }),

  getGraduaciones: (alumnoId) => request(`/alumnos/${alumnoId}/graduaciones`),
  crearGraduacion: (alumnoId, data) => request(`/alumnos/${alumnoId}/graduaciones`, { method: 'POST', body: JSON.stringify(data) }),
  actualizarGraduacion: (id, data) => request(`/graduaciones/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  eliminarGraduacion: (id) => request(`/graduaciones/${id}`, { method: 'DELETE' }),
}

export { TOKEN_KEY }
