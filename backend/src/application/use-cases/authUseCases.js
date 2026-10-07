import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export class AuthUseCases {

    constructor(usuarioRepository) {
        this.usuarioRepository = usuarioRepository;
    }

    async login(email, password) {

        if (!email || !password) {
            throw new Error("Email y contraseña son obligatorios");
        }

        const usuario =
            await this.usuarioRepository.obtenerPorEmail(email);

        if (!usuario) {
            throw new Error("Credenciales incorrectas");
        }

        const passwordCorrecta =
            await bcrypt.compare(
                password,
                usuario.password_hash
            );

        if (!passwordCorrecta) {
            throw new Error("Credenciales incorrectas");
        }

        return {
            id: usuario.id,
            nombre: usuario.nombre,
            email: usuario.email,
            rol: usuario.rol,
            token: jwt.sign(
                {
                    sub: String(usuario.id),
                    nombre: usuario.nombre,
                    email: usuario.email,
                    rol: usuario.rol
                },
                process.env.AUTH_JWT_SECRET,
                { expiresIn: "8h", algorithm: "HS256" }
            )
        };
    }
}
