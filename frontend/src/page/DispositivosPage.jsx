import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import {
  getDispositivos,
  deleteDispositivos,
  createDispositivos,
} from '../services/servicesDispositivos.js'
import '../styles/dispositivosPage.css'

const initialForm = { nombre: '', direccion: '' }

function DispositivosPage() {
  const { user } = useAuth()
  const token = user?.token

  const [dispositivos, setDispositivos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [form, setForm] = useState(initialForm)
  const [creating, setCreating] = useState(false)

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

  return (
    <div className="dispositivos-page">
      <div className="dispositivos-container">
        <h1 className="dispositivos-title">Dispositivos</h1>

        {error && <p className="dispositivos-error">{error}</p>}

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
          <button className="dispositivos-btn" type="submit" disabled={creating}>
            {creating ? 'Creando...' : 'Agregar dispositivo'}
          </button>
        </form>

        {loading ? (
          <p className="dispositivos-loading">Cargando dispositivos...</p>
        ) : dispositivos.length === 0 ? (
          <p className="dispositivos-empty">No hay dispositivos registrados.</p>
        ) : (
          <table className="dispositivos-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Dirección</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {dispositivos.map((d) => (
                <tr key={d.id}>
                  <td>{d.nombre}</td>
                  <td>{d.direccion}</td>
                  <td>
                    <button
                      className="dispositivos-delete-btn"
                      onClick={() => handleDelete(d.id)}
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

export default DispositivosPage