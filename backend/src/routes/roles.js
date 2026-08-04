import {supabase} from "../config/supabase.js";
import Router from "express";
import { verificarToken } from "../middleware/authVerifiacion.js";
import { verificarRol } from "../middleware/authRol.js";

const rolesRouter = Router();

rolesRouter.get('/', verificarToken, verificarRol('admin'), async (req, res) => {
    try {
        const { data, error } = await supabase.from('rol').select('*');

        if(!data || data.length === 0) {
            return res.status(404).json({ error: 'No se encontraron roles' });
        }

        if (error) {
            console.error(error);
        }

        return res.status(200).json({ roles: data, mensaje: 'Roles obtenidos correctamente' });
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener los roles' });
    }
});

rolesRouter.post('/', verificarToken, verificarRol('admin'), async (req, res) => {
    const { nombre } = req.body;

    if (!nombre) {
        return res.status(400).json({ error: 'El nombre del rol es requerido' });
    }

    try {
        const { data, error } = await supabase.from('rol').insert([{ nombre }]);

        if (error) {
            console.error(error);
            return res.status(500).json({ error: 'Error al crear el rol' });
        }

        return res.status(201).json({ rol: data[0], mensaje: 'Rol creado correctamente' });

    } catch (error) {
        res.status(500).json({ error: 'Error al crear el rol' });
    }
});

rolesRouter.put('/:id', verificarToken, verificarRol('admin'), async (req, res) => {
    const { id } = req.params;
    const { nombre } = req.body;

    if (!nombre) {
        return res.status(400).json({ error: 'El nombre del rol es requerido' });
    }

    try {
        const { data, error } = await supabase.from('rol').update({ nombre }).eq('id', id);

        if (error) {
            console.error(error);
            return res.status(500).json({ error: 'Error al actualizar el rol' });
        }

        if (!data || data.length === 0) {
            return res.status(404).json({ error: 'Rol no encontrado' });
        }

        return res.status(200).json({ rol: data[0], mensaje: 'Rol actualizado correctamente' });
    } catch (error) {
        res.status(500).json({ error: 'Error al actualizar el rol' });
    }
});

rolesRouter.delete('/:id', verificarToken, verificarRol('admin'), async (req, res) => {
    const { id } = req.params;

    try {
        const { data, error } = await supabase.from('rol').delete().eq('id', id);

        if (error) {
            console.error(error);
            return res.status(500).json({ error: 'Error al eliminar el rol' });
        }

        if (!data || data.length === 0) {
            return res.status(404).json({ error: 'Rol no encontrado' });
        }

        return res.status(200).json({ mensaje: 'Rol eliminado correctamente' });
    } catch (error) {
        res.status(500).json({ error: 'Error al eliminar el rol' });
    }
});

export default rolesRouter;