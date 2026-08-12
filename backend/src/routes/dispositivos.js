import {Router} from 'express';
import supabase from '../config/supabase.js';
import { verificarToken } from '../middleware/authVerifiacion.js';
import { verificarRol } from "../middleware/authRol.js";

const router = Router();

router.get('/', async (req, res) => {
  try {
    const { data: dispositivos, error: errDisp } = await supabase
      .from('dispositivos')
      .select('*')
      .order('id', { ascending: true })

    if (errDisp) throw errDisp

    const { data: ninos, error: errNinos } = await supabase
      .from('ninos')
      .select('dispositivo_id')
      .is('egreso', null) // solo niños actuales, no egresados

    if (errNinos) throw errNinos

    // Agrupar conteo de niños por dispositivo_id
    const conteoPorDispositivo = ninos.reduce((acc, n) => {
      acc[n.dispositivo_id] = (acc[n.dispositivo_id] || 0) + 1
      return acc
    }, {})

    const dispositivosConNinos = dispositivos.map((d) => ({
      ...d,
      cantidadNinos: conteoPorDispositivo[d.id] || 0,
    }))

    res.json({ dispositivos: dispositivosConNinos })
  } catch (error) {
    console.error('Error al obtener dispositivos:', error.message)
    res.status(500).json({ mensaje: 'Error al obtener dispositivos', error: error.message })
  }
})

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