import { Router } from "express";
import supabase from '../config/supabase.js';
import { verificarToken } from '../middleware/authVerifiacion.js';
import { verificarRol } from "../middleware/authRol.js";

const router = Router();

// GET: Obtener todas las actas
router.get('/', verificarToken, verificarRol('admin'), async (req, res) => {
    try {
        const { data, error } = await supabase
            .from("actas")
            .select(`
                created_at, 
                descripcion, 
                firma_interesado, 
                firma_interviniente, 
                usuario (
                    nombre, 
                    apellido 
                )
            `);

        if (error) {
            console.error("Error Supabase GET:", error);
            return res.status(500).json({ error: "Error al obtener las actas" });
        }

        if (!data || data.length === 0) {
            return res.status(404).json({ error: "No se encontraron actas" });
        }

        return res.status(200).json({ actas: data, mensaje: "Actas obtenidas correctamente" });
    } catch (error) {
        console.error("Error Servidor GET:", error);
        res.status(500).json({ error: "Error al obtener las actas" });
    }
});


// POST: Crear una nueva acta
router.post('/', verificarToken, verificarRol('admin'), async (req, res) => {
    try {
        // 1. Extraemos los campos requeridos desde el body
        const { descripcion, firma_interesado, firma_interviniente } = req.body;

        // 2. Extraemos el usuario_id desde la request (inyectado por tu middleware verificarToken)
        const usuario_id = req.usuario?.id; 

        // Validar datos mínimos obligatorios
        if (!descripcion) {
            return res.status(400).json({ error: "La descripción es requerida" });
        }

        // 3. Insertar en Supabase
        const { data, error } = await supabase
            .from("actas")
            .insert([
                { 
                    descripcion, 
                    usuario_id, 
                    firma_interesado, 
                    firma_interviniente 
                }
            ])
            .select();

        if (error) {
            console.error("Error Supabase POST:", error);
            return res.status(500).json({ error: "Error al crear el acta" });
        }

        return res.status(201).json({ acta: data[0], mensaje: "Acta creada correctamente" });
    } catch (error) {
        console.error("Error Servidor POST:", error);
        res.status(500).json({ error: "Error interno al crear el acta" });
    }
});

export default router;