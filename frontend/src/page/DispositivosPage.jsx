import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import {
  getDispositivos,
  deleteDispositivos,
  createDispositivos,
} from '../services/servicesDispositivos.js'
import '../styles/dispositivosPage.css'

const initialForm = { nombre: '', direccion: '', imagenUrl: '' }

function DeviceIcon() {
  return (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="10" y="6" width="28" height="36" rx="4" stroke="currentColor" strokeWidth="2" />
      <circle cx="24" cy="32" r="2" fill="currentColor" />
      <path d="M17 14h14M17 19h9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

function ChildIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="6" r="3" fill="currentColor" />
      <path
        d="M12 11c-3.3 0-6 1.8-6 5v1h12v-1c0-3.2-2.7-5-6-5Z"
        fill="currentColor"
      />
    </svg>
  )
}

function PinIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M12 22s7-6.2 7-12a7 7 0 1 0-14 0c0 5.8 7 12 7 12Z"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <circle cx="12" cy="10" r="2.4" stroke="currentColor" strokeWidth="1.6" />
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

function DispositivoImagen({ src, alt }) {
  const [failed, setFailed] = useState(false)

  if (!src || failed) {
    return (
      <div className="dispositivo-imagen dispositivo-imagen--placeholder">
        <DeviceIcon />
      </div>
    )
  }

  return (
    <div className="dispositivo-imagen">
      <img src={src} alt={alt} onError={() => setFailed(true)} loading="lazy" />
    </div>
  )
}

function DispositivosPage() {
  const { user } = useAuth()
  const token = user?.token
  const esAdmin = user?.usuario?.rol === 'admin'

  const [dispositivos, setDispositivos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [form, setForm] = useState(initialForm)
  const [creating, setCreating] = useState(false)
  const [formOpen, setFormOpen] = useState(false)

  const fetchDispositivos = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getDispositivos(token)
      setDispositivos(data?.dispositivos ?? [])
    } catch (err) {
      setError('No se pudieron cargar los dispositivos.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (token) fetchDispositivos()
  }, [token])

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    setCreating(true)
    setError(null)
    try {
      await createDispositivos(form, token)
      setForm(initialForm)
      setFormOpen(false)
      await fetchDispositivos()
    } catch (err) {
      setError('No se pudo crear el dispositivo.')
    } finally {
      setCreating(false)
    }
  }

  const handleDelete = async (id) => {
    const confirmado = window.confirm('¿Seguro que querés eliminar este dispositivo?')
    if (!confirmado) return

    try {
      await deleteDispositivos(id, token)
      setDispositivos((prev) => prev.filter((d) => d.id !== id))
    } catch (err) {
      setError('No se pudo eliminar el dispositivo.')
    }
  }

  const totalDispositivos = dispositivos.length
  const totalActivos = dispositivos.filter((d) => d.activo).length
  const totalNinos = dispositivos.reduce((acc, d) => acc + (d.cantidadNinos ?? 0), 0)

  return (
    <div className="dispositivos-page">
      <div className="dispositivos-container">
        <header className="dispositivos-header">
          <div>
            <p className="dispositivos-eyebrow">Panel de dispositivos</p>
            <h1 className="dispositivos-title">Dispositivos</h1>
          </div>

          {esAdmin && (
            <button
              className="dispositivos-toggle-btn"
              onClick={() => setFormOpen((prev) => !prev)}
              type="button"
            >
              {formOpen ? 'Cancelar' : '+ Agregar dispositivo'}
            </button>
          )}
        </header>

        <section className="dispositivos-stats" aria-label="Estadísticas">
          <div className="stat-card">
            <span className="stat-value">{totalDispositivos}</span>
            <span className="stat-label">Dispositivos</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">{totalActivos}</span>
            <span className="stat-label">Activos</span>
          </div>
          <div className="stat-card stat-card--accent">
            <span className="stat-value">
              <ChildIcon />
              {totalNinos}
            </span>
            <span className="stat-label">Niños registrados</span>
          </div>
        </section>

        {error && <p className="dispositivos-error">{error}</p>}

        {esAdmin && formOpen && (
          <form className="dispositivos-form" onSubmit={handleCreate}>
            <input
              className="dispositivos-input"
              name="nombre"
              placeholder="Nombre"
              value={form.nombre}
              onChange={handleChange}
              required
            />
            <input
              className="dispositivos-input"
              name="direccion"
              placeholder="Dirección"
              value={form.direccion}
              onChange={handleChange}
              required
            />
            <input
              className="dispositivos-input"
              name="imagenUrl"
              placeholder="URL de la imagen (opcional)"
              value={form.imagenUrl}
              onChange={handleChange}
            />
            <button className="dispositivos-btn" type="submit" disabled={creating}>
              {creating ? 'Creando...' : 'Agregar dispositivo'}
            </button>
          </form>
        )}

        {loading ? (
          <div className="dispositivos-grid">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="dispositivo-card dispositivo-card--skeleton" />
            ))}
          </div>
        ) : dispositivos.length === 0 ? (
          <p className="dispositivos-empty">No hay dispositivos registrados.</p>
        ) : (
          <div className="dispositivos-grid">
            {dispositivos.map((d) => (
              <article className="dispositivo-card" key={d.id}>
                <DispositivoImagen src={d.imagenUrl} alt={d.nombre} />

                <div className="dispositivo-card-body">
                  <div className="dispositivo-card-heading">
                    <h2 className="dispositivo-nombre">{d.nombre}</h2>
                    <span
                      className={`dispositivo-estado ${
                        d.activo ? 'dispositivo-estado--activo' : 'dispositivo-estado--inactivo'
                      }`}
                      title={d.activo ? 'Activo' : 'Inactivo'}
                    />
                  </div>

                  {d.direccion && (
                    <p className="dispositivo-direccion">
                      <PinIcon />
                      {d.direccion}
                    </p>
                  )}

                  <div className="dispositivo-card-footer">
                    <span className="dispositivo-ninos-badge">
                      <ChildIcon />
                      {d.cantidadNinos ?? 0}
                    </span>

                    {esAdmin && (
                      <button
                        className="dispositivos-delete-btn"
                        onClick={() => handleDelete(d.id)}
                        type="button"
                        aria-label={`Eliminar ${d.nombre}`}
                      >
                        <TrashIcon />
                      </button>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default DispositivosPage
