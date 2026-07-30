import router from 'express';
import supabase from '../config/supabase.js';
import { verificarToken } from '../middleware/authVerifiacion.js';
import { verificarRol } from "../middleware/authRol.js";

const profesionalesRouter = router();

profesionalesRouter.get('/', verificarToken, verificarRol('admin'), async (req, res) => {
  try {
    const { data, error } = await supabase.from('profesiones').select('*');

    if(!data || data.length === 0) {
      return res.status(404).json({ error: 'No se encontraron profesionales' });
    }

    if (error) {
      console.error(error);
    }

    return res.status(200).json({ profesiones: data, mensaje: 'profesiones obtenidos correctamente' });
    } catch (error) {   
        res.status(500).json({ error: 'Error al obtener los profesiones' });
    } 
})

profesionalesRouter.post('/', verificarToken, verificarRol('admin'), async (req, res) => {
    try {
        const { nombre } = req.body;

        const { data, error } = await supabase.from('profesiones').insert([
            {
                nombre
            }
        ]);

        if(error) {
            console.error(error);
            return res.status(400).json({ error: 'Error al crear el Profesion' });
        }

        res.status(201).json({ Profesion: data, mensaje: 'Profesion creado correctamente' });
        }catch(error) {
            console.error(error);
            res.status(500).json({ error: 'Error al crear el profesion' });
    }
})

export default profesionalesRouter;