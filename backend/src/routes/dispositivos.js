import {Router} from 'express';
import supabase from '../config/supabase.js';
import { verificarToken } from '../middleware/authVerifiacion.js';
import { verificarRol } from "../middleware/authRol.js";

const router = Router();

router.get('/', verificarToken, async (req, res) => {
    try{
        const {data, error} = await supabase.from("dispositivos").select("*");

        if(error){
            console.error(error);
            return res.status(500).json({error: "Error al obtener los dispositivos"});
        }

        if(!data || data.length === 0){
            return res.status(404).json({error: "No se encontraron dispositivos"});
        }

        return res.status(200).json({dispositivos: data, mensaje: "dispositivos obtenidos correctamente"});
    }catch(error){
        console.error(error);
        res.status(500).json({error: "Error al obtener los dispositivos"});
    }
});

router.post('/', verificarToken, verificarRol('admin'), async (req, res) => {
    try{
        const {nombre, direccion} = req.body;

        const {data, error} = await supabase.from("dispositivos").insert([
            { nombre, direccion }
        ]).select();

        if(error){
            console.error(error);
            return res.status(500).json({error: "Error al crear el dispositivo"});
        }

        return res.status(201).json({dispositivo: data, mensaje: "dispositivo creado correctamente"});
    }catch(error){
        console.error(error);
        res.status(500).json({error: "Error al crear el dispositivo"});
    }
});

router.put('/:id', verificarToken, verificarRol('admin'), async (req, res) => {
    try{
        const {id} = req.params;
        const {nombre, direccion} = req.body;

        const {data, error} = await supabase.from("dispositivos").update({
            nombre,
            direccion,
            edited: new Date().toISOString()
        }).eq("id", id).select();

        if(error){
            console.error(error);
            return res.status(500).json({error: "Error al actualizar el dispositivo"});
        }

        return res.status(200).json({dispositivo: data, mensaje: "dispositivo actualizado correctamente"});
    }catch(error){
        console.error(error);
        res.status(500).json({error: "Error al actualizar el dispositivo"});
    }
});

router.delete('/:id', verificarToken, verificarRol('admin'), async (req, res) => {
    try{
        const {id} = req.params;
        const {data, error} = await supabase.from("dispositivos").delete().eq("id", id).select();

        if(error){
            console.error(error);
            return res.status(500).json({error: "Error al eliminar el dispositivo"});
        }

        return res.status(200).json({dispositivo: data, mensaje: "dispositivo eliminado correctamente"});
    }catch(error){
        console.error(error);
        res.status(500).json({error: "Error al eliminar el dispositivo"});
    }
});

export default router;