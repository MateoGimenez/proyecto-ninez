import { useState, useEffect } from 'react';
import { getUsers, deleteUser } from '../services/servicesUsers.jsx';
import Loading from '../components/Loading.jsx';
import CrearUsuario from "../components/modals/formUsers.jsx";
import { useAuth } from '../context/AuthContext.jsx';
import { formatDate } from '../utils/dateUtils.js';
import '../styles/adminUsers.css';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false); // Estado para controlar el modal

  const { user } = useAuth();
  const token = user?.token;
  const rol = user?.usuario?.rol

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getUsers(token);
      setUsers(data.usuario || []);
    } catch (err) {
      console.error('Error fetching usuarios:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const handleDelete = async (id, nombre) => {
    if (!window.confirm(`¿Eliminar a ${nombre}?`)) return;
    try {
      await deleteUser(id, token);
      setUsers((prev) => prev.filter((u) => u.id !== id));
    } catch (err) {
      alert(err.message);
    }
  };

  // Manejador cuando un usuario se crea con éxito desde el modal
  const handleUserCreated = () => {
    setIsModalOpen(false);
    fetchUsers(); // Recarga la lista para mostrar el nuevo usuario
  };

  return (
    <div className="admin-page">
      <div className="admin-header">
        <h1>Panel de Administración</h1>
        <h2>Usuarios</h2>

        <div className="button-actions">
          <button className="btn-refresh" onClick={fetchUsers} disabled={loading}>
            {loading ? 'Cargando...' : 'Actualizar'}
          </button>

          <button onClick={() => setIsModalOpen(true)}>Agregar</button>
        </div>
      </div>

      {loading && <Loading />}
      {error && <p className="admin-status admin-status--error">Error: {error}</p>}

      {!loading && !error && (
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Email</th>
                <th>Rol</th>
                <th>Profesión</th>
                <th>Estado</th>
                <th>Creado</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td colSpan={7} className="admin-empty">No hay usuarios registrados.</td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id}>
                    <td>{u.nombre} {u.apellido}</td>
                    <td>{u.email}</td>
                    <td>
                      <span className={`badge ${u.rol?.nombre === 'admin' ? 'badge--admin' : 'badge--default'}`}>
                        {u.rol?.nombre || '-'}
                      </span>
                    </td>
                    <td>{u.profesiones?.nombre || '-'}</td>
                    <td>
                      <span className={`badge ${u.active ? 'badge--active' : 'badge--inactive'}`}>
                        {u.active ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td>{formatDate(u.created)}</td>
                    <td>
                      <button className="btn-delete" onClick={() => handleDelete(u.id, u.nombre)}>
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Renderizado condicional del modal */}
      {isModalOpen && (
        <CrearUsuario
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSuccess={handleUserCreated}
          token={token}
          auth={rol}
        />
      )}
    </div>
  );
};

export default AdminUsers;