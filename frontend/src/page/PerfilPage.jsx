import { useState, useEffect } from 'react'
import "../styles/perfilPage.css"
import { useAuth } from '../context/AuthContext.jsx'

const formatFecha = (fecha) => {
  if (!fecha) return '—'
  try {
    return new Date(fecha).toLocaleDateString('es-AR')
  } catch {
    return fecha
  }
}

function PerfilPage() {
  const { user, setUser } = useAuth()
  // Asegura la lectura independientemente de si viene como user o user.usuario
  const usuario = user?.usuario || user || {} 
  
  const isAdmin = usuario.rol === 'admin'

  const [form, setForm] = useState({
    nombre: usuario.nombre || '',
    apellido: usuario.apellido || '',
    email: usuario.email || '',
    profesion: usuario.profesion || '',
  })

  // Sincroniza el formulario si el objeto usuario se carga asincrónicamente
  useEffect(() => {
    setForm({
      nombre: usuario.nombre || '',
      apellido: usuario.apellido || '',
      email: usuario.email || '',
      profesion: usuario.profesion || '',
    })
  }, [user])

  const [passwordForm, setPasswordForm] = useState({
    actual: '',
    nueva: '',
    confirmar: '',
  })

  const [savingProfile, setSavingProfile] = useState(false)
  const [profileMsg, setProfileMsg] = useState(null)

  const [savingPassword, setSavingPassword] = useState(false)
  const [passwordMsg, setPasswordMsg] = useState(null)

  const initial = (usuario.nombre || 'U').charAt(0).toUpperCase()
  const hayCambios =
    form.nombre !== (usuario.nombre || '') ||
    form.apellido !== (usuario.apellido || '') ||
    form.email !== (usuario.email || '') ||
    form.profesion !== (usuario.profesion || '')

  const handleFormChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handlePasswordChange = (e) => {
    setPasswordForm({ ...passwordForm, [e.target.name]: e.target.value })
  }

  const handleProfileSubmit = async (e) => {
    e.preventDefault()
    if (!isAdmin) return // Bloqueo preventivo en frontend

    setSavingProfile(true)
    setProfileMsg(null)

    try {
      const res = await fetch('/api/usuario/perfil', {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })

      if (!res.ok) {
        throw new Error(`No se pudieron guardar los cambios (${res.status})`)
      }

      const data = await res.json()

      if (setUser && data?.usuario) {
        setUser((prev) => ({ ...prev, usuario: data.usuario }))
      }

      setProfileMsg({ type: 'success', text: 'Perfil actualizado correctamente.' })
    } catch (err) {
      console.error('Error al actualizar perfil:', err)
      setProfileMsg({ type: 'error', text: 'No se pudo actualizar el perfil.' })
    } finally {
      setSavingProfile(false)
    }
  }

  const handlePasswordSubmit = async (e) => {
    e.preventDefault()
    if (!isAdmin) return

    setPasswordMsg(null)

    if (passwordForm.nueva.length < 8) {
      setPasswordMsg({ type: 'error', text: 'La nueva contraseña debe tener al menos 8 caracteres.' })
      return
    }

    if (passwordForm.nueva !== passwordForm.confirmar) {
      setPasswordMsg({ type: 'error', text: 'Las contraseñas nuevas no coinciden.' })
      return
    }

    setSavingPassword(true)

    try {
      const res = await fetch('/api/usuario/password', {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          actual: passwordForm.actual,
          nueva: passwordForm.nueva,
        }),
      })

      if (!res.ok) {
        throw new Error(`No se pudo cambiar la contraseña (${res.status})`)
      }

      setPasswordMsg({ type: 'success', text: 'Contraseña actualizada correctamente.' })
      setPasswordForm({ actual: '', nueva: '', confirmar: '' })
    } catch (err) {
      console.error('Error al cambiar contraseña:', err)
      setPasswordMsg({ type: 'error', text: 'No se pudo cambiar la contraseña.' })
    } finally {
      setSavingPassword(false)
    }
  }

  return (
    <div className="perfil-page">
      <section className="perfil-hero">
        <div className="perfil-container perfil-hero-inner">
          <span className="perfil-avatar">{initial}</span>
          <div>
            <h1 className="perfil-title">{`${usuario.nombre || ''} ${usuario.apellido || ''}`.trim() || 'Mi perfil'}</h1>
            <p className="perfil-subtitle">{usuario.email || 'Sin email registrado'}</p>
            <div className="perfil-badges">
              {usuario.rol && <span className="perfil-badge perfil-badge--rol">{usuario.rol}</span>}
              <span className={`perfil-badge perfil-badge--estado ${usuario.active === false ? 'is-inactive' : 'is-active'}`}>
                {usuario.active === false ? 'Inactivo' : 'Activo'}
              </span>
            </div>
          </div>
        </div>
      </section>

      <div className="perfil-container perfil-grid">
        {/* Datos personales */}
        <section className="perfil-card">
          <h2 className="perfil-card-title">Datos personales</h2>
          <p className="perfil-card-description">
            {isAdmin ? 'Actualizá la información de contacto y profesión.' : 'Información del usuario (Lectura).' }
          </p>

          <form onSubmit={handleProfileSubmit} className="perfil-form">
            <div className="perfil-field">
              <label htmlFor="nombre">Nombre</label>
              <input
                id="nombre"
                name="nombre"
                type="text"
                value={form.nombre}
                onChange={handleFormChange}
                disabled={!isAdmin}
              />
            </div>

            <div className="perfil-field">
              <label htmlFor="apellido">Apellido</label>
              <input
                id="apellido"
                name="apellido"
                type="text"
                value={form.apellido}
                onChange={handleFormChange}
                disabled={!isAdmin}
              />
            </div>

            <div className="perfil-field">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                value={form.email}
                onChange={handleFormChange}
                disabled={!isAdmin}
              />
            </div>

            <div className="perfil-field">
              <label htmlFor="profesion">Profesión</label>
              <input
                id="profesion"
                name="profesion"
                type="text"
                value={form.profesion}
                onChange={handleFormChange}
                disabled={!isAdmin}
              />
            </div>

            {profileMsg && (
              <p className={`perfil-msg perfil-msg--${profileMsg.type}`}>{profileMsg.text}</p>
            )}

            {/* Botón visible únicamente si es Administrador */}
            {isAdmin && (
              <div className="perfil-form-actions">
                <button type="submit" className="perfil-btn perfil-btn--primary" disabled={!hayCambios || savingProfile}>
                  {savingProfile ? 'Guardando…' : 'Guardar cambios'}
                </button>
              </div>
            )}
          </form>
        </section>

        {/* Sección Seguridad: visible únicamente para Administradores */}
        {isAdmin && (
          <section className="perfil-card">
            <h2 className="perfil-card-title">Seguridad</h2>
            <p className="perfil-card-description">Cambiá tu contraseña de acceso.</p>

            <form onSubmit={handlePasswordSubmit} className="perfil-form">
              <div className="perfil-field">
                <label htmlFor="actual">Contraseña actual</label>
                <input
                  id="actual"
                  name="actual"
                  type="password"
                  value={passwordForm.actual}
                  onChange={handlePasswordChange}
                  placeholder="••••••••"
                  required
                />
              </div>

              <div className="perfil-field">
                <label htmlFor="nueva">Nueva contraseña</label>
                <input
                  id="nueva"
                  name="nueva"
                  type="password"
                  value={passwordForm.nueva}
                  onChange={handlePasswordChange}
                  placeholder="Mínimo 8 caracteres"
                  required
                />
              </div>

              <div className="perfil-field">
                <label htmlFor="confirmar">Confirmar nueva contraseña</label>
                <input
                  id="confirmar"
                  name="confirmar"
                  type="password"
                  value={passwordForm.confirmar}
                  onChange={handlePasswordChange}
                  placeholder="Repetí la nueva contraseña"
                  required
                />
              </div>

              {passwordMsg && (
                <p className={`perfil-msg perfil-msg--${passwordMsg.type}`}>{passwordMsg.text}</p>
              )}

              <div className="perfil-form-actions">
                <button type="submit" className="perfil-btn perfil-btn--outline" disabled={savingPassword}>
                  {savingPassword ? 'Actualizando…' : 'Cambiar contraseña'}
                </button>
              </div>
            </form>
          </section>
        )}

        {/* Info de la cuenta */}
        <section className="perfil-card perfil-card--info">
          <h2 className="perfil-card-title">Información de la cuenta</h2>
          <dl className="perfil-info-list">
            <div className="perfil-info-item">
              <dt>Rol</dt>
              <dd>{usuario.rol || '—'}</dd>
            </div>
            <div className="perfil-info-item">
              <dt>Estado</dt>
              <dd>{usuario.active === false ? 'Inactivo' : 'Activo'}</dd>
            </div>
            <div className="perfil-info-item">
              <dt>Creado</dt>
              <dd>{formatFecha(usuario.creado || usuario.created_at)}</dd>
            </div>
          </dl>
        </section>
      </div>
    </div>
  )
}

export default PerfilPage