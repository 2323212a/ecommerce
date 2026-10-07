export class AuthController {

    constructor(authUseCases) {
        this.authUseCases = authUseCases;
    }

    login = async (req, res) => {

        try {

            const { email, password } = req.body;

            const sesion =
                await this.authUseCases.login(
                    email,
                    password
                );

            res.json({
                mensaje: "Login exitoso",
                usuario: {
                    id: sesion.id,
                    nombre: sesion.nombre,
                    email: sesion.email,
                    rol: sesion.rol
                },
                token: sesion.token
            });

        } catch (error) {

            res.status(401).json({
                mensaje: error.message
            });
        }
    };
}
