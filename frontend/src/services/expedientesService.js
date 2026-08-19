/**
 * Servicio para manejar expedientes
 * Todas las llamadas al backend de expedientes
 */

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

/**
 * Obtiene el token JWT del sessionStorage
 */
const getToken = () => {
  const user = sessionStorage.getItem('user');
  if (!user) return null;
  
  try {
    const userData = JSON.parse(user);
    return userData.token; // El token está dentro del objeto user
  } catch (error) {
    console.error('Error parseando user:', error);
    return null;
  }
};

/**
 * Headers comunes para todas las requests
 */
const getHeaders = () => ({
  'Authorization': `Bearer ${getToken()}`,
});

/**
 * Lista todos los niños
 */
export const obtenerNinos = async () => {
  try {
    const response = await fetch(`${API_URL}/admin/ninos`, {
      method: 'GET',
      headers: getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }

    const data = await response.json();
    return data.ninos || [];
  } catch (error) {
    console.error('Error obteniendo niños:', error);
    throw error;
  }
};

/**
 * Lista expedientes de un niño específico
 */
export const obtenerExpedientesPorNino = async (ninoId) => {
  try {
    const response = await fetch(`${API_URL}/expedientes/${ninoId}`, {
      method: 'GET',
      headers: getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error obteniendo expedientes:', error);
    throw error;
  }
};

/**
 * Sube un archivo como expediente
 */
export const subirExpediente = async (
  archivo,
  ninoId,
  tipoExpedienteId,
  descripcion = ''
) => {
  try {
    const formData = new FormData();
    formData.append('archivo', archivo);
    formData.append('ninoId', ninoId);
    formData.append('tipoExpedienteId', tipoExpedienteId);
    formData.append('descripcion', descripcion);

    const response = await fetch(`${API_URL}/expedientes/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getToken()}`,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error subiendo expediente:', error);
    throw error;
  }
};

/**
 * Obtiene URL para descargar un expediente
 */
export const obtenerLinkDescarga = async (ninoId, expedienteId) => {
  try {
    const response = await fetch(
      `${API_URL}/expedientes/${ninoId}/descargar/${expedienteId}`,
      {
        method: 'GET',
        headers: getHeaders(),
      }
    );

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }

    const data = await response.json();
    return data.url;
  } catch (error) {
    console.error('Error obteniendo link de descarga:', error);
    throw error;
  }
};

/**
 * Elimina un expediente
 */
export const eliminarExpediente = async (ninoId, expedienteId) => {
  try {
    const response = await fetch(
      `${API_URL}/expedientes/${ninoId}/${expedienteId}`,
      {
        method: 'DELETE',
        headers: getHeaders(),
      }
    );

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error eliminando expediente:', error);
    throw error;
  }
};

/**
 * Obtiene los tipos de expediente disponibles
 */
export const obtenerTiposExpediente = async () => {
  try {
    const response = await fetch(`${API_URL}/admin/tipos-expediente`, {
      method: 'GET',
      headers: getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }

    const data = await response.json();
    return data.tipos || data || [];
  } catch (error) {
    console.error('Error obteniendo tipos de expediente:', error);
    throw error;
  }
};