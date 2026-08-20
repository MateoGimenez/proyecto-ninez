/**
 * Servicio para obtener estadísticas del dashboard
 */

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

/**
 * Obtiene el token JWT
 */
const getToken = () => {
  const user = sessionStorage.getItem('user');
  if (!user) return null;
  
  try {
    const userData = JSON.parse(user);
    return userData.token;
  } catch (error) {
    console.error('Error parseando user:', error);
    return null;
  }
};

/**
 * Headers comunes
 */
const getHeaders = () => ({
  'Authorization': `Bearer ${getToken()}`,
});

/**
 * Obtiene todas las estadísticas del dashboard
 */
export const obtenerEstadisticas = async () => {
  try {
    const response = await fetch(`${API_URL}/dashboard/estadisticas`, {
      method: 'GET',
      headers: getHeaders(),
    });

    if (!response.ok) {
      if (response.status === 403) {
        throw new Error('Acceso denegado. Solo administradores pueden ver el dashboard.');
      }
      throw new Error(`Error: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error obteniendo estadísticas:', error);
    throw error;
  }
};