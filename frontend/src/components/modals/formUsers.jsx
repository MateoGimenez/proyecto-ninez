import { useState, useEffect } from 'react';
import { getRoles } from "../../services/servicesRol.jsx";
import { getProfesiones } from '../../services/servicesProfesiones.jsx';
import { createUser } from '../../services/servicesUsers.jsx';
import "../../styles/crearUsuario.css";

const CrearUsuario = ({ onSuccess, token, auth, onClose }) => {
  const [rolesData, setRolesData] = useState([]);
  const [profesionesData, setProfesionesData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [form, setForm] = useState({
    nombre: '',
    apellido: '',
    email: '',
    password: '',
    active: true,
    rol_id: '',
    profesion_id: '',
  });

  useEffect(() => {
    const fetchRoles = async () => {
      try { 
        const res = await getRoles(token);
        setRolesData(res.usuario || res.roles || []);
      } catch (error) {
        console.error("Error fetching roles:", error);
      }
    };

    const fetchProfesiones = async () => {
      try {
        const res = await getProfesiones(token);
        setProfesionesData(res.usuario || res.profesiones || []);
      } catch (error) {
        console.error("Error fetching profesiones:", error);
      }
    };

    if (token) {
      fetchRoles();
      fetchProfesiones();
    }
  }, [token]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Evita doble clic si ya se está procesando el envío
    if (loading) return; 

    if (!form.nombre || !form.email || !form.password) return;

    setLoading(true);
    setError(null);

    try {
      const res = await createUser(form, token, auth);

      if (res) {
        setForm({
          nombre: '',
          apellido: '',
          email: '',
          password: '',
          active: true,
          rol_id: '',
          profesion_id: '',
        });
        onSuccess?.(res.usuario);
      }
    } catch (err) {
      console.error("Error al crear usuario:", err);
      setError(err.message || "Error al crear el usuario");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <form onSubmit={handleSubmit}>
          <h2>Crear usuario</h2>

          <label>
            Nombre *
            <input name="nombre" value={form.nombre} onChange={handleChange} required />
          </label>

          <label>
            Apellido
            <input name="apellido" value={form.apellido} onChange={handleChange} />
          </label>

          <label>
            Email *
            <input type="email" name="email" value={form.email} onChange={handleChange} required />
          </label>

          <label>
            Contraseña *
            <input type="password" name="password" value={form.password} onChange={handleChange} required minLength={6} />
          </label>

          <label>
            Rol
            <select name="rol_id" value={form.rol_id} onChange={handleChange}>
              <option value="">-- Seleccionar --</option>
              {rolesData?.map((r) => (
                <option key={r.id} value={r.id}>{r.nombre}</option>
              ))}
            </select>
          </label>

          <label>
            Profesión
            <select name="profesion_id" value={form.profesion_id} onChange={handleChange}>
              <option value="">-- Seleccionar --</option>
              {profesionesData?.map((p) => (
                <option key={p.id} value={p.id}>{p.nombre}</option>
              ))}
            </select>
          </label>

          <label>
            <input type="checkbox" name="active" checked={form.active} onChange={handleChange} />
            Activo
          </label>

          {error && <p style={{ color: 'red' }}>{error}</p>}

          <div className="modal-buttons">
            <button type="button" onClick={onClose} disabled={loading}>
              Cancelar
            </button>
            <button type="submit" disabled={loading}>
              {loading ? 'Creando...' : 'Crear usuario'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CrearUsuario;