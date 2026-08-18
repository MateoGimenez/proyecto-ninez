import supabaseAdmin from '../config/supabaseAdmin.js';

const BUCKET_NAME = 'expedientes';

/**
 * Sanitiza un nombre de archivo para usarlo en Storage
 * - Remueve acentos
 * - Reemplaza espacios por guiones
 * - Solo permite números, letras, puntos y guiones
 */
export const sanitizarNombreArchivo = (nombreArchivo) => {
  return nombreArchivo
    // Normalizar acentos
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    // Reemplazar espacios por guiones
    .replace(/\s+/g, '-')
    // Remover caracteres especiales (excepto punto y guion)
    .replace(/[^a-zA-Z0-9.-]/g, '')
    // Remover múltiples guiones seguidos
    .replace(/-+/g, '-')
    // Remover guiones al principio y final
    .replace(/^-+|-+$/g, '');
};

/**
 * Genera la ruta segura para un expediente
 * Formato: {nino_id}/{expediente_id}/{nombre_archivo_sanitizado}
 */
export const generarRutaExpediente = (ninoId, expedienteId, nombreArchivo) => {
  const nombreSanitizado = sanitizarNombreArchivo(nombreArchivo);
  return `${ninoId}/${expedienteId}/${nombreSanitizado}`;
};
/**
 * Sube un archivo al bucket de expedientes
 * @param {Buffer} archivoBuffer - Contenido del archivo
 * @param {string} ruta - Ruta completa (ej: "123/456/documento.pdf")
 * @param {string} mimeType - Tipo MIME (ej: "application/pdf")
 * @returns {Promise} - URL pública temporal o error
 */
export const subirExpediente = async (archivoBuffer, ruta, mimeType) => {
  try {
    const { data, error } = await supabaseAdmin.storage
      .from(BUCKET_NAME)
      .upload(ruta, archivoBuffer, {
        contentType: mimeType,
        upsert: false, // No sobreescribir si existe
      });

    if (error) {
      throw error;
    }

    return { exito: true, data };
  } catch (error) {
    console.error('Error subiendo expediente:', error.message);
    throw error;
  }
};

/**
 * Obtiene un link temporal de descarga (válido 1 hora)
 * @param {string} ruta - Ruta del archivo
 * @returns {Promise} - URL de descarga
 */

export const obtenerLinkDescarga = async (ruta) => {
  try {
    const { data, error } = await supabaseAdmin.storage
      .from(BUCKET_NAME)
      .createSignedUrl(ruta, 3600); // 3600 segundos = 1 hora

    if (error) {
      throw error;
    }

    return { exito: true, url: data.signedUrl };
  } catch (error) {
    console.error('Error generando link de descarga:', error.message);
    throw error;
  }
};

/**
 * Elimina un archivo del bucket
 * @param {string} ruta - Ruta del archivo
 * @returns {Promise}
 */
export const eliminarExpediente = async (ruta) => {
  try {
    const { data, error } = await supabaseAdmin.storage
      .from(BUCKET_NAME)
      .remove([ruta]);

    if (error) {
      throw error;
    }

    return { exito: true, data };
  } catch (error) {
    console.error('Error eliminando expediente:', error.message);
    throw error;
  }
};

/**
 * Lista todos los archivos de un niño
 * @param {number} ninoId - ID del niño
 * @returns {Promise} - Lista de archivos
 */
export const listarExpedientesPorNino = async (ninoId) => {
  try {
    const { data, error } = await supabaseAdmin.storage
      .from(BUCKET_NAME)
      .list(`${ninoId}`, {
        limit: 100,
        offset: 0,
        sortBy: { column: 'created_at', order: 'desc' },
      });

    if (error) {
      throw error;
    }

    return { exito: true, archivos: data };
  } catch (error) {
    console.error('Error listando expedientes:', error.message);
    throw error;
  }
};