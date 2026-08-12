import { Router } from 'express';
import { verificarToken } from '../middleware/authVerifiacion.js';
import { verificarRol } from '../middleware/authRol.js';
import supabase from '../config/supabase.js';

const router = Router();

// GET /ninos — listar todos los niños
router.get('/', verificarToken, verificarRol(['admin', 'user']), async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('ninos')
      .select('*')
      .order('id', { ascending: true });

    if (error) {
      console.error(error);
      return res.status(500).json({ error: 'Error al obtener los niños' });
    }

    if (!data || data.length === 0) {
      return res.status(200).json({ ninos: [], mensaje: 'No se encontraron niños' });
    }

    return res.status(200).json({ ninos: data, mensaje: 'Niños obtenidos correctamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener los niños' });
  }
});

// GET /ninos/:id — obtener un niño puntual
router.get('/:id', verificarToken, verificarRol(['admin', 'user']), async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('ninos')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      return res.status(404).json({ error: 'Niño no encontrado' });
    }

    return res.status(200).json({ nino: data, mensaje: 'Niño obtenido correctamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener el niño' });
  }
});

// POST /ninos — registrar un niño nuevo
router.post('/', verificarToken, verificarRol(['admin']), async (req, res) => {
  try {
    const {
      nombre,
      apellido,
      nacimiento,
      dispositivo_id,
      ingreso,
      medida,
      cud,
      diagnostico,
    } = req.body;

    if (!nombre || !ingreso) {
      return res.status(400).json({ error: 'Nombre e ingreso son obligatorios' });
    }

    const { data, error } = await supabase
      .from('ninos')
      .insert([
        {
          nombre,
          apellido: apellido || null,
          nacimiento: nacimiento || null,
          dispositivo_id: dispositivo_id || null,
          ingreso,
          egreso: null,
          medida: medida || null,
          cud: cud ?? null,
          diagnostico: diagnostico || null,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error(error);
      return res.status(500).json({ error: 'Error al registrar el niño' });
    }

    return res.status(201).json({ nino: data, mensaje: 'Niño registrado correctamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al registrar el niño' });
  }
});

// PATCH /ninos/:id — actualizar datos de un niño (incluye marcar egreso)
router.patch('/:id', verificarToken, verificarRol(['admin']), async (req, res) => {
  try {
    const { id } = req.params;

    const camposPermitidos = [
      'nombre',
      'apellido',
      'nacimiento',
      'dispositivo_id',
      'ingreso',
      'egreso',
      'medida',
      'cud',
      'diagnostico',
    ];

    const cambios = Object.fromEntries(
      Object.entries(req.body).filter(([key]) => camposPermitidos.includes(key))
    );

    if (Object.keys(cambios).length === 0) {
      return res.status(400).json({ error: 'No se enviaron campos válidos para actualizar' });
    }

    const { data, error } = await supabase
      .from('ninos')
      .update(cambios)
      .eq('id', id)
      .select()
      .single();

    if (error || !data) {
      console.error(error);
      return res.status(404).json({ error: 'No se pudo actualizar, niño no encontrado' });
    }

    return res.status(200).json({ nino: data, mensaje: 'Niño actualizado correctamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al actualizar el niño' });
  }
});

// DELETE /ninos/:id — eliminar un registro
router.delete('/:id', verificarToken, verificarRol(['admin']), async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('ninos')
      .delete()
      .eq('id', id)
      .select()
      .single();

    if (error || !data) {
      console.error(error);
      return res.status(404).json({ error: 'No se pudo eliminar, niño no encontrado' });
    }

    return res.status(200).json({ nino: data, mensaje: 'Niño eliminado correctamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al eliminar el niño' });
  }
});

export default router;