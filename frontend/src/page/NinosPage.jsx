import { useState, useEffect, useMemo } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import {
  getNinos,
  createNinos,
  updateNinos,
  deleteNinos,
} from '../services/serviceNinos.js'
import { getDispositivos } from '../services/servicesDispositivos.js'
import '../styles/ninosPage.css'

const initialForm = {
  nombre: '',
  apellido: '',
  nacimiento: '',
  dispositivo_id: '',
  ingreso: '',
  medida: '',
  cud: false,
  diagnostico: '',
}

function ChildIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="6" r="3" fill="currentColor" />
      <path d="M12 11c-3.3 0-6 1.8-6 5v1h12v-1c0-3.2-2.7-5-6-5Z" fill="currentColor" />
    </svg>
  )
}

function DeviceIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="5" y="3" width="14" height="18" rx="2" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="12" cy="16" r="1" fill="currentColor" />
      <path d="M8.5 7h7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}

function CalendarIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="3.5" y="5" width="17" height="16" rx="2" stroke="currentColor" strokeWidth="1.6" />
      <path d="M3.5 9.5h17M8 3v4M16 3v4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}

function TrashIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M4 7h16M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2m-9 0 1 13a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-13"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function calcularEdad(nacimiento) {
  if (!nacimiento) return null
  const hoy = new Date()
  const fecha = new Date(nacimiento)
  let edad = hoy.getFullYear() - fecha.getFullYear()
  const m = hoy.getMonth() - fecha.getMonth()
  if (m < 0 || (m === 0 && hoy.getDate() < fecha.getDate())) edad--
  return edad
}

function formatFecha(fecha) {
  if (!fecha) return '—'
  return new Date(fecha).toLocaleDateString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

function NinosPage() {
  const { user } = useAuth()
  const token = user?.token
  const esAdmin = user?.usuario?.rol === 'admin'

  const [ninos, setNinos] = useState([])
  const [dispositivos, setDispositivos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [form, setForm] = useState(initialForm)
  const [creating, setCreating] = useState(false)
  const [formOpen, setFormOpen] = useState(false)

  const [expandedId, setExpandedId] = useState(null)
  const [busqueda, setBusqueda] = useState('')
  const [filtroEstado, setFiltroEstado] = useState('actuales') // 'todos' | 'actuales' | 'egresados'
  const [filtroDispositivo, setFiltroDispositivo] = useState('todos')

  const cargarDatos = async () => {
    setLoading(true)
    setError(null)
    try {
      const [dataNinos, dataDispositivos] = await Promise.all([
        getNinos(token),
        getDispositivos(token),
      ])
      setNinos(dataNinos?.ninos ?? [])
      setDispositivos(dataDispositivos?.dispositivos ?? [])
    } catch (err) {
      setError('No se pudieron cargar los niños.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (token) cargarDatos()
  }, [token])

  const dispositivoPorId = useMemo(() => {
    return dispositivos.reduce((acc, d) => {
      acc[d.id] = d.nombre
      return acc
    }, {})
  }, [dispositivos])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    setCreating(true)
    setError(null)
    try {
      await createNinos(
        { ...form, dispositivo_id: form.dispositivo_id || null },
        token
      )
      setForm(initialForm)
      setFormOpen(false)
      await cargarDatos()
    } catch (err) {
      setError('No se pudo registrar al niño.')
    } finally {
      setCreating(false)
    }
  }

  const handleEgreso = async (id) => {
    const confirmado = window.confirm('¿Confirmás el egreso de este niño del sistema?')
    if (!confirmado) return

    try {
      const hoy = new Date().toISOString().slice(0, 10)
      await updateNinos(id, { egreso: hoy }, token)
      setNinos((prev) => prev.map((n) => (n.id === id ? { ...n, egreso: hoy } : n)))
    } catch (err) {
      setError('No se pudo registrar el egreso.')
    }
  }

  const handleDelete = async (id) => {
    const confirmado = window.confirm('¿Seguro que querés eliminar este registro? Esta acción no se puede deshacer.')
    if (!confirmado) return

    try {
      await deleteNinos(id, token)
      setNinos((prev) => prev.filter((n) => n.id !== id))
    } catch (err) {
      setError('No se pudo eliminar el registro.')
    }
  }

  const ninosFiltrados = ninos.filter((n) => {
    if (filtroEstado === 'actuales' && n.egreso) return false
    if (filtroEstado === 'egresados' && !n.egreso) return false
    if (filtroDispositivo !== 'todos' && String(n.dispositivo_id) !== filtroDispositivo) return false
    if (busqueda.trim()) {
      const texto = `${n.nombre} ${n.apellido ?? ''}`.toLowerCase()
      if (!texto.includes(busqueda.trim().toLowerCase())) return false
    }
    return true
  })

  const totalNinos = ninos.length
  const totalActuales = ninos.filter((n) => !n.egreso).length
  const totalEgresados = totalNinos - totalActuales
  const totalConCud = ninos.filter((n) => n.cud).length

  return (
    <div className="ninos-page">
      <div className="ninos-container">
        <header className="ninos-header">
          <div>
            <p className="ninos-eyebrow">Panel de niños</p>
            <h1 className="ninos-title">Niños</h1>
          </div>

          {esAdmin && (
            <button
              className="ninos-toggle-btn"
              onClick={() => setFormOpen((prev) => !prev)}
              type="button"
            >
              {formOpen ? 'Cancelar' : '+ Registrar niño'}
            </button>
          )}
        </header>

        <section className="ninos-stats" aria-label="Estadísticas">
          <div className="ninos-stat-card">
            <span className="ninos-stat-value">{totalNinos}</span>
            <span className="ninos-stat-label">Total</span>
          </div>
          <div className="ninos-stat-card ninos-stat-card--accent">
            <span className="ninos-stat-value">
              <ChildIcon />
              {totalActuales}
            </span>
            <span className="ninos-stat-label">Actuales en sistema</span>
          </div>
          <div className="ninos-stat-card">
            <span className="ninos-stat-value">{totalEgresados}</span>
            <span className="ninos-stat-label">Egresados</span>
          </div>
          <div className="ninos-stat-card">
            <span className="ninos-stat-value">{totalConCud}</span>
            <span className="ninos-stat-label">Con CUD</span>
          </div>
        </section>

        {error && <p className="ninos-error">{error}</p>}

        {esAdmin && formOpen && (
          <form className="ninos-form" onSubmit={handleCreate}>
            <input
              className="ninos-input"
              name="nombre"
              placeholder="Nombre"
              value={form.nombre}
              onChange={handleChange}
              required
            />
            <input
              className="ninos-input"
              name="apellido"
              placeholder="Apellido"
              value={form.apellido}
              onChange={handleChange}
            />
            <label className="ninos-field">
              <span>Nacimiento</span>
              <input
                className="ninos-input"
                name="nacimiento"
                type="date"
                value={form.nacimiento}
                onChange={handleChange}
              />
            </label>
            <label className="ninos-field">
              <span>Ingreso</span>
              <input
                className="ninos-input"
                name="ingreso"
                type="date"
                value={form.ingreso}
                onChange={handleChange}
                required
              />
            </label>
            <select
              className="ninos-input"
              name="dispositivo_id"
              value={form.dispositivo_id}
              onChange={handleChange}
            >
              <option value="">Sin dispositivo asignado</option>
              {dispositivos.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.nombre}
                </option>
              ))}
            </select>
            <input
              className="ninos-input"
              name="medida"
              placeholder="Medida (judicial/administrativa)"
              value={form.medida}
              onChange={handleChange}
            />
            <label className="ninos-checkbox">
              <input
                type="checkbox"
                name="cud"
                checked={form.cud}
                onChange={handleChange}
              />
              <span>Posee CUD</span>
            </label>
            <textarea
              className="ninos-input ninos-textarea"
              name="diagnostico"
              placeholder="Diagnóstico (opcional)"
              value={form.diagnostico}
              onChange={handleChange}
              rows={2}
            />
            <button className="ninos-btn" type="submit" disabled={creating}>
              {creating ? 'Guardando...' : 'Registrar niño'}
            </button>
          </form>
        )}

        <section className="ninos-filtros">
          <input
            className="ninos-search"
            placeholder="Buscar por nombre..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />

          <div className="ninos-filtro-pills">
            {[
              { key: 'actuales', label: 'Actuales' },
              { key: 'egresados', label: 'Egresados' },
              { key: 'todos', label: 'Todos' },
            ].map((opt) => (
              <button
                key={opt.key}
                type="button"
                className={`ninos-pill ${filtroEstado === opt.key ? 'ninos-pill--active' : ''}`}
                onClick={() => setFiltroEstado(opt.key)}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <select
            className="ninos-input ninos-filtro-select"
            value={filtroDispositivo}
            onChange={(e) => setFiltroDispositivo(e.target.value)}
          >
            <option value="todos">Todos los dispositivos</option>
            {dispositivos.map((d) => (
              <option key={d.id} value={d.id}>
                {d.nombre}
              </option>
            ))}
          </select>
        </section>

        {loading ? (
          <div className="ninos-lista">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="nino-card nino-card--skeleton" />
            ))}
          </div>
        ) : ninosFiltrados.length === 0 ? (
          <p className="ninos-empty">No hay niños que coincidan con el filtro.</p>
        ) : (
          <div className="ninos-lista">
            {ninosFiltrados.map((n) => {
              const expandido = expandedId === n.id
              const edad = calcularEdad(n.nacimiento)

              return (
                <article className="nino-card" key={n.id}>
                  <div className="nino-card-main">
                    <div className="nino-avatar">
                      {n.nombre?.[0]?.toUpperCase() ?? '?'}
                    </div>

                    <div className="nino-info">
                      <div className="nino-nombre-row">
                        <h2 className="nino-nombre">
                          {n.nombre} {n.apellido}
                        </h2>
                        {n.cud && <span className="nino-cud-badge">CUD</span>}
                        <span
                          className={`nino-estado ${
                            n.egreso ? 'nino-estado--egresado' : 'nino-estado--activo'
                          }`}
                        >
                          {n.egreso ? 'Egresado' : 'Activo'}
                        </span>
                      </div>

                      <div className="nino-meta">
                        {edad !== null && <span>{edad} años</span>}
                        <span className="nino-meta-item">
                          <DeviceIcon />
                          {n.dispositivo_id ? dispositivoPorId[n.dispositivo_id] ?? '—' : 'Sin asignar'}
                        </span>
                        <span className="nino-meta-item">
                          <CalendarIcon />
                          Ingreso: {formatFecha(n.ingreso)}
                        </span>
                        {n.egreso && (
                          <span className="nino-meta-item">
                            <CalendarIcon />
                            Egreso: {formatFecha(n.egreso)}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="nino-actions">
                      <button
                        type="button"
                        className="nino-detalle-btn"
                        onClick={() => setExpandedId(expandido ? null : n.id)}
                      >
                        {expandido ? 'Ocultar' : 'Ver más'}
                      </button>

                      {esAdmin && (
                        <>
                          {!n.egreso && (
                            <button
                              type="button"
                              className="nino-egreso-btn"
                              onClick={() => handleEgreso(n.id)}
                            >
                              Marcar egreso
                            </button>
                          )}
                          <button
                            type="button"
                            className="nino-delete-btn"
                            onClick={() => handleDelete(n.id)}
                            aria-label={`Eliminar ${n.nombre}`}
                          >
                            <TrashIcon />
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  {expandido && (
                    <div className="nino-detalle">
                      <div>
                        <span className="nino-detalle-label">Medida</span>
                        <p>{n.medida || 'No especificada'}</p>
                      </div>
                      <div>
                        <span className="nino-detalle-label">Diagnóstico</span>
                        <p>{n.diagnostico || 'No especificado'}</p>
                      </div>
                      <div>
                        <span className="nino-detalle-label">Fecha de nacimiento</span>
                        <p>{formatFecha(n.nacimiento)}</p>
                      </div>
                    </div>
                  )}
                </article>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default NinosPage
