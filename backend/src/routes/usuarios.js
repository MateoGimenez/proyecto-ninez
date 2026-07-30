import Router from 'express';
import supabase from '../config/supabase.js';
import { verificarToken }from '../middleware/authVerifiacion.js';
import {verificarRol} from "../middleware/authRol.js"

const usuariosRouter = Router();

usuariosRouter.get('/', verificarToken, verificarRol('admin'), async (req, res) => {
  try {
    const { data, error } = await supabase.from('usuarios').select('*');

    if(!data || data.length === 0) {
      return res.status(404).json({ error: 'No se encontraron usuarios' });
    }

    if (error) {
      console.error(error);
    }

    res.status(200).json({ Usuario: data , mensaje: 'Usuarios obtenidos correctamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener los usuarios' });
  }
});

usuariosRouter.post('/', verificarToken, verificarRol('admin'), async (req, res) => {
  try {
    const { nombre, apellido , email, password, rol_id , profesion_id , created} = req.body;

    

    const { data, error } = await supabase.from('usuarios').insert([
      {
        nombre,
        apellido,
        email,
        password,
        rol_id,
        profesion_id,
      }
    ]);

    if (error) {
      console.error(error);
      return res.status(400).json({ error: 'Error al crear el usuario' });
    }

    res.status(201).json({ Usuario: data, mensaje: 'Usuario creado correctamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al crear el usuario' });
  }
});

export default usuariosRouter;