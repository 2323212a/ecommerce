import bcrypt from "bcrypt";

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
            rol: usuario.rol
        };
    }
}
