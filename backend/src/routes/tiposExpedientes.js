import { Router } from 'express';
import supabase from '../config/supabase.js';
import { verificarToken } from '../middleware/authVerifiacion.js';

const router = Router();

/**
 * GET /api/admin/tipos-expediente
 * Obtiene todos los tipos de expediente activos
 */
router.get('/', verificarToken, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('tipos_expediente')
      .select('id, nombre')
      .eq('activo', true)
      .order('nombre', { ascending: true });

    if (error) {
      console.error(error);
      return res.status(500).json({ error: 'Error al obtener tipos de expediente' });
    }

    return res.status(200).json({ 
      tipos: data,
      mensaje: 'Tipos de expediente obtenidos correctamente'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error interno al obtener tipos' });
  }
});

export default router;