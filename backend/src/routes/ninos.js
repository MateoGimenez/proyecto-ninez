import Router from 'express';
import { verificarToken } from '../middleware/authVerifiacion.js';
import { verificarRol } from "../middleware/authRol.js";
import supabase from '../config/supabase.js';

const router = Router();

router.get('/', verificarToken, verificarRol(['admin', 'user']), (req, res) => {
    try{
        const {data , error} = supabase.from("ninos").select("*");

        if(!data || data.length === 0){
            return res.status(404).json({error: "No se encontraron niños"});
        }

        if(error){
            console.error(error);
        }

        return res.status(200).json({ninos: data, mensaje: "niños obtenidos correctamente"});
    }catch(error){
        console.error(error);
        res.status(500).json({error: "Error al obtener los niños"});
    }
});

export default router;