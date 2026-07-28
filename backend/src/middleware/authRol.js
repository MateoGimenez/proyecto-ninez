export const verificarRol = (...rolesPermitidos) => {

    return (req, res, next) => {

        const rolUsuario = req.usuario.rol;

        console.log("Rol del usuario:", rolUsuario);

        if (!rolUsuario) {
            return res.status(403).json({
                mensaje: "No se pudo determinar el rol del usuario."
            });
        }

        if (!rolesPermitidos.includes(rolUsuario)) {

            return res.status(403).json({
                mensaje: "No tenés permisos para acceder a este recurso."
            });

        }

        next();

    };

};