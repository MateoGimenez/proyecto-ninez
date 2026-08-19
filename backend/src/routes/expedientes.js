import { Router } from 'express';
import multer from 'multer';
import supabase from '../config/supabase.js';
import supabaseAdmin from '../config/supabaseAdmin.js';
import { verificarToken } from '../middleware/authVerifiacion.js';
import { verificarRol } from '../middleware/authRol.js';
import {generarRutaExpediente, subirExpediente, obtenerLinkDescarga , eliminarExpediente} from '../helpers/supabaseStorageHelper.js';

const router = Router();

// Configurar multer para recibir archivos en memoria
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024, // 50 MB máximo
  },
  fileFilter: (req, file, cb) => {
    // Solo permitir PDF e imágenes
    const tiposPermitidos = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
    
    if (tiposPermitidos.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten PDF e imágenes (JPEG, PNG)'));
    }
  },
});

/**
 * GET /api/expedientes/:ninoId
 * Lista todos los expedientes de un niño
 * 
 * Params:
 * - ninoId (number) - ID del niño
 */
router.get(
  '/:ninoId',
  verificarToken,
  verificarRol('admin', 'user'),
  async (req, res) => {
    try {
      const { ninoId } = req.params;

      // Validar que el niño existe
      const { data: nino, error: errorNino } = await supabase
        .from('ninos')
        .select('id, nombre, apellido')
        .eq('id', ninoId)
        .single();

      if (errorNino || !nino) {
        return res.status(404).json({ error: 'Niño no encontrado' });
      }

      // Obtener expedientes con información del usuario que los subió
      const { data: expedientes, error: errorExp } = await supabase
        .from('expedientes')
        .select(`
          id,
          nino_id,
          nombre,
          nombre_original,
          ruta_storage,
          mime_type,
          tamano_bytes,
          descripcion,
          created,
          tipo_expediente_id,
          tipos_expediente(nombre),
          usuario_id,
          usuarios(nombre, apellido)
        `)
        .eq('nino_id', ninoId)
        .order('created', { ascending: false });

      if (errorExp) {
        console.error('Error obteniendo expedientes:', errorExp);
        return res.status(500).json({
          error: 'Error al obtener los expedientes',
        });
      }

      // Mapear respuesta para devolverla más clara
      const expedientesFormateados = expedientes.map(exp => ({
        id: exp.id,
        nombre: exp.nombre,
        nombreOriginal: exp.nombre_original,
        tipo: exp.tipos_expediente?.nombre || 'Sin tipo',
        tipoId: exp.tipo_expediente_id,
        mimeType: exp.mime_type,
        tamanoBytes: exp.tamano_bytes,
        tamanoBytesFormato: `${(exp.tamano_bytes / 1024).toFixed(2)} KB`,
        descripcion: exp.descripcion,
        rutaStorage: exp.ruta_storage,
        subidoPor: exp.usuarios 
          ? `${exp.usuarios.nombre} ${exp.usuarios.apellido}`
          : 'Usuario desconocido',
        usuarioId: exp.usuario_id,
        fechaSubida: exp.created,
      }));

      return res.status(200).json({
        mensaje: 'Expedientes obtenidos correctamente',
        nino: {
          id: nino.id,
          nombre: nino.nombre,
          apellido: nino.apellido,
        },
        expedientes: expedientesFormateados,
        total: expedientesFormateados.length,
      });
    } catch (error) {
      console.error('Error listando expedientes:', error);
      res.status(500).json({
        error: 'Error interno al listar expedientes',
      });
    }
  }
);

/**
 * GET /api/expedientes/:ninoId/descargar/:expedienteId
 * Genera un link temporal para descargar un expediente
 * 
 * Params:
 * - ninoId (number) - ID del niño
 * - expedienteId (number) - ID del expediente
 * 
 * Respuesta:
 * - URL firmada válida por 1 hora
 */
router.get(
  '/:ninoId/descargar/:expedienteId',
  verificarToken,
  verificarRol('admin', 'user'),
  async (req, res) => {
    try {
      const { ninoId, expedienteId } = req.params;

      // Obtener el expediente
      const { data: expediente, error: errorExp } = await supabase
        .from('expedientes')
        .select('id, nino_id, ruta_storage, nombre_original')
        .eq('id', expedienteId)
        .eq('nino_id', ninoId)
        .single();

      if (errorExp || !expediente) {
        return res.status(404).json({
          error: 'Expediente no encontrado',
        });
      }

      // Generar URL firmada
      try {
        const resultado = await obtenerLinkDescarga(expediente.ruta_storage);

        return res.status(200).json({
          mensaje: 'Link de descarga generado correctamente',
          url: resultado.url,
          nombreArchivo: expediente.nombre_original,
          expedienteId: expediente.id,
          expiraEn: '1 hora',
        });
      } catch (errorStorage) {
        console.error('Error generando link:', errorStorage.message);
        return res.status(500).json({
          error: 'Error al generar link de descarga',
        });
      }
    } catch (error) {
      console.error('Error en descarga:', error);
      res.status(500).json({
        error: 'Error interno al procesar la descarga',
      });
    }
  }
);

/**
 * POST /api/expedientes/upload
 * Sube un expediente asociado a un niño
 * 
 * Body (multipart/form-data):
 * - archivo (file) - Archivo PDF o imagen
 * - ninoId (number) - ID del niño
 * - tipoExpedienteId (number) - ID del tipo de expediente
 * - descripcion (string, opcional) - Descripción del expediente
 */
router.post(
  '/upload',
  verificarToken,
  verificarRol('admin', 'user'),
  upload.single('archivo'),
  async (req, res) => {
    try {
      // Validar que se recibió el archivo
      if (!req.file) {
        return res.status(400).json({ error: 'No se envió archivo' });
      }

      const { ninoId, tipoExpedienteId, descripcion } = req.body;

      // Validar campos requeridos
      if (!ninoId || !tipoExpedienteId) {
        return res.status(400).json({
          error: 'Faltan campos requeridos: ninoId, tipoExpedienteId',
        });
      }

      // Verificar que el niño existe
      const { data: nino, error: errorNino } = await supabase
        .from('ninos')
        .select('id')
        .eq('id', ninoId)
        .single();

      if (errorNino || !nino) {
        return res.status(404).json({ error: 'Niño no encontrado' });
      }

      // Verificar que el tipo de expediente existe
      const { data: tipoExp, error: errorTipo } = await supabase
        .from('tipos_expediente')
        .select('id')
        .eq('id', tipoExpedienteId)
        .single();

      if (errorTipo || !tipoExp) {
        return res.status(404).json({ error: 'Tipo de expediente no encontrado' });
      }

      // Obtener datos del usuario desde el token
      const usuarioId = req.usuario.id;
      const nombreOriginal = req.file.originalname;
      const mimeType = req.file.mimetype;
      const tamanoBytes = req.file.size;

      // 1. Crear registro en BD primero
      const { data: expediente, error: errorBD } = await supabase
        .from('expedientes')
        .insert([
          {
            nino_id: ninoId,
            usuario_id: usuarioId,
            tipo_expediente_id: tipoExpedienteId,
            nombre: nombreOriginal.split('.')[0], // Nombre sin extensión
            nombre_original: nombreOriginal,
            ruta_storage: '', // Se actualiza después
            mime_type: mimeType,
            tamano_bytes: tamanoBytes,
            descripcion: descripcion || null,
          },
        ])
        .select()
        .single();

      if (errorBD || !expediente) {
        console.error('Error guardando expediente en BD:', errorBD);
        return res.status(500).json({
          error: 'Error al guardar el expediente en la base de datos',
        });
      }

      // 2. Generar ruta en Storage
      const rutaStorage = generarRutaExpediente(
        ninoId,
        expediente.id,
        nombreOriginal
      );

      // 3. Subir archivo a Storage
      try {
        await subirExpediente(req.file.buffer, rutaStorage, mimeType);
      } catch (errorStorage) {
        // Si falla el upload, eliminar el registro de BD
        await supabase
          .from('expedientes')
          .delete()
          .eq('id', expediente.id);

        console.error('Error subiendo a Storage:', errorStorage.message);
        return res.status(500).json({
          error: 'Error al subir el archivo a Storage',
        });
      }

      // 4. Actualizar el registro con la ruta en Storage
      const { error: errorUpdate } = await supabase
        .from('expedientes')
        .update({ ruta_storage: rutaStorage })
        .eq('id', expediente.id);

      if (errorUpdate) {
        console.error('Error actualizando ruta en BD:', errorUpdate);
        return res.status(500).json({
          error: 'Error al guardar la ruta del archivo',
        });
      }

      // 5. Respuesta exitosa
      return res.status(201).json({
        mensaje: 'Expediente subido correctamente',
        expediente: {
          id: expediente.id,
          ninoId,
          tipoExpedienteId,
          nombreOriginal,
          tamanoBytes,
          rutaStorage,
          createdAt: expediente.created,
        },
      });
    } catch (error) {
      console.error('Error en upload de expediente:', error);
      res.status(500).json({
        error: 'Error interno al procesar el expediente',
      });
    }
  }
);

/**
 * DELETE /api/expedientes/:ninoId/:expedienteId
 * Elimina un expediente (archivo + registro BD)
 * 
 * Params:
 * - ninoId (number) - ID del niño
 * - expedienteId (number) - ID del expediente
 */
router.delete(
  '/:ninoId/:expedienteId',
  verificarToken,
  verificarRol('admin', 'user'),
  async (req, res) => {
    try {
      const { ninoId, expedienteId } = req.params;

      // Obtener el expediente
      const { data: expediente, error: errorExp } = await supabase
        .from('expedientes')
        .select('id, nino_id, ruta_storage, nombre_original')
        .eq('id', expedienteId)
        .eq('nino_id', ninoId)
        .single();

      if (errorExp || !expediente) {
        return res.status(404).json({
          error: 'Expediente no encontrado',
        });
      }

      // 1. Eliminar archivo de Storage
      try {
        await eliminarExpediente(expediente.ruta_storage);
      } catch (errorStorage) {
        console.error('Error eliminando de Storage:', errorStorage.message);
        return res.status(500).json({
          error: 'Error al eliminar el archivo',
        });
      }

      // 2. Eliminar registro de BD
      const { error: errorBD } = await supabase
        .from('expedientes')
        .delete()
        .eq('id', expedienteId);

      if (errorBD) {
        console.error('Error eliminando de BD:', errorBD);
        return res.status(500).json({
          error: 'Error al eliminar el registro de la base de datos',
        });
      }

      // 3. Respuesta exitosa
      return res.status(200).json({
        mensaje: 'Expediente eliminado correctamente',
        expediente: {
          id: expediente.id,
          nombreOriginal: expediente.nombre_original,
          rutaStorage: expediente.ruta_storage,
        },
      });
    } catch (error) {
      console.error('Error eliminando expediente:', error);
      res.status(500).json({
        error: 'Error interno al eliminar el expediente',
      });
    }
  }
);

export default router;