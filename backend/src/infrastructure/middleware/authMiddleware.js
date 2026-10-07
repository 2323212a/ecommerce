import jwt from "jsonwebtoken";

export function autenticar(req, res, next) {
    const authorization = req.get("authorization");
    const [scheme, token] = authorization?.split(" ") || [];

    if (scheme !== "Bearer" || !token) {
        return res.status(401).json({
            mensaje: "Se requiere iniciar sesión"
        });
    }

    try {
        req.usuario = jwt.verify(token, process.env.AUTH_JWT_SECRET, {
            algorithms: ["HS256"]
        });
    } catch {
        return res.status(401).json({
            mensaje: "La sesión no es válida o ha expirado"
        });
    }

    next();
}

export function autorizarRoles(...rolesPermitidos) {
    return (req, res, next) => {
        if (!rolesPermitidos.includes(req.usuario?.rol)) {
            return res.status(403).json({
                mensaje: "No tienes permiso para realizar esta acción"
            });
        }

        next();
    };
}
