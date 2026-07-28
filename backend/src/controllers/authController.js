import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import supabase from "../config/supabase.js";

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const { data, error } = await supabase
            .from("usuarios")
            .select(`
                id,
                nombre,
                apellido,
                email,
                password,
                active,
                profesion_id,
                rol (
                    id,
                    nombre
                )
            `)
            .eq("email", email)
            .single();

        if (error || !data) {
            return res.status(404).json({
                mensaje: "Usuario no encontrado"
            });
        }

        if (!data.active) {
            return res.status(403).json({
                mensaje: "Usuario deshabilitado"
            });
        }

        const passwordCorrecta = await bcrypt.compare(
            password,
            data.password
        );

        if (!passwordCorrecta) {
            return res.status(401).json({
                mensaje: "Contraseña incorrecta"
            });
        }

        const token = jwt.sign(
            {
                id: data.id,
                rol: data.rol.nombre
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "8h"
            }
        );

        return res.json({
            ok: true,
            token,
            usuario: {
                id: data.id,
                nombre: data.nombre,
                apellido: data.apellido,
                rol: data.rol.nombre
            }
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            mensaje: "Error interno del servidor"
        });
    }
};