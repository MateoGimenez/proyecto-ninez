import { Router } from 'express';
import supabase from '../config/supabase.js';
import { verificarToken } from '../middleware/authVerifiacion.js';
import { verificarRol } from '../middleware/authRol.js';
import bcrypt from 'bcrypt';

const usuariosRouter = Router();

// ==========================================
// 1. GET: Obtener todos los usuarios
// ==========================================
usuariosRouter.get('/', verificarToken, verificarRol('admin'), async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('usuarios')
      .select(`
        id,
        nombre,
        apellido,
        email,
        active,
        created,
        update,
        profesiones (
          id,
          nombre
        ),
        rol (
          id,
          nombre
        )
      `)
      .order('id', { ascending: true });

    if (error) {
      console.error('Error Supabase GET:', error);
      return res.status(400).json({ error: 'Error al consultar los usuarios' });
    }

    return res.status(200).json({
      usuario: data,
      mensaje: 'Usuarios obtenidos correctamente'
    });
  } catch (error) {
    console.error('Error Servidor GET:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// ==========================================
// 2. POST: Crear un usuario nuevo
// ==========================================
usuariosRouter.post('/', verificarToken, verificarRol('admin'), async (req, res) => {
  try {
    const { nombre, apellido, email, password, active, rol_id, profesion_id } = req.body;

    // 1. Validaciones básicas
    if (!nombre || !email || !password) {
      return res.status(400).json({ error: 'Nombre, email y contraseña son requeridos' });
    }

    // 2. Hash de contraseña
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // 3. Inserción trayendo las relaciones anidadas (profesiones, rol) para tu UI
    const { data, error } = await supabase
      .from('usuarios')
      .insert([
        {
          nombre,
          apellido: apellido || null,
          email,
          password: hashedPassword,
          active: active !== undefined ? active : true,
          rol_id: rol_id ? parseInt(rol_id, 10) : null,
          profesion_id: profesion_id ? parseInt(profesion_id, 10) : null
        }
      ])
      .select(`
        id,
        nombre,
        apellido,
        email,
        active,
        created,
        update,
        profesiones ( id, nombre ),
        rol ( id, nombre )
      `);

    if (error) {
      console.error('Error Supabase POST:', error);
      return res.status(400).json({ error: 'Error al crear el usuario en la base de datos' });
    }

    return res.status(201).json({ 
      usuario: data[0],
      mensaje: 'Usuario creado correctamente' 
    });

  } catch (error) {
    console.error('Error Servidor POST:', error);
    return res.status(500).json({ error: 'Error interno al crear el usuario' });
  }
});

// ==========================================
// 3. PUT: Actualizar un usuario existente
// ==========================================
usuariosRouter.put('/:id', verificarToken, verificarRol('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, apellido, email, password, active, rol_id, profesion_id } = req.body;

    const updateFields = {
      update: new Date().toISOString()
    };

    if (nombre !== undefined) updateFields.nombre = nombre;
    if (apellido !== undefined) updateFields.apellido = apellido;
    if (email !== undefined) updateFields.email = email;
    if (active !== undefined) updateFields.active = active;
    if (rol_id !== undefined) updateFields.rol_id = rol_id ? parseInt(rol_id, 10) : null;
    if (profesion_id !== undefined) updateFields.profesion_id = profesion_id ? parseInt(profesion_id, 10) : null;

    // Solo actualiza la contraseña si enviaron un valor nuevo
    if (password && password.trim() !== '') {
      updateFields.password = await bcrypt.hash(password, 10);
    }

    const { data, error } = await supabase
      .from('usuarios')
      .update(updateFields)
      .eq('id', id)
      .select(`
        id,
        nombre,
        apellido,
        email,
        active,
        created,
        update,
        profesiones ( id, nombre ),
        rol ( id, nombre )
      `);

    if (error) {
      console.error('Error Supabase PUT:', error);
      return res.status(400).json({ error: 'Error al actualizar el usuario' });
    }

    return res.status(200).json({
      usuario: data[0],
      mensaje: 'Usuario actualizado correctamente'
    });
  } catch (error) {
    console.error('Error Servidor PUT:', error);
    return res.status(500).json({ error: 'Error interno al actualizar el usuario' });
  }
});

// ==========================================
// 4. DELETE: Eliminar usuario por ID
// ==========================================
usuariosRouter.delete('/:id', verificarToken, verificarRol('admin'), async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('usuarios')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error Supabase DELETE:', error);
      return res.status(400).json({ error: 'Error al eliminar el usuario de la base de datos' });
    }

    return res.status(200).json({ 
      id: parseInt(id, 10),
      mensaje: 'Usuario eliminado correctamente' 
    });

  } catch (error) {
    console.error('Error Servidor DELETE:', error);
    return res.status(500).json({ error: 'Error interno al eliminar el usuario' });
  }
});

export default usuariosRouter;