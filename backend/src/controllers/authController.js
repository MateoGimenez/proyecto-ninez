import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import supabase from "../config/supabase.js";

export const login = async (req, res) => {

    const { email, password } = req.body;

    const { data, error } = await supabase
        .from("usuarios")
        .select("*")
        .eq("email", email)
        .single();

    if (!data) {
        return res.status(404).json({
            mensaje: "Usuario no encontrado"
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
            rol: data.rol
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
            rol: data.rol
        }
    });
};