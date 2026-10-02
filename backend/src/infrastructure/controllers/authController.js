export class AuthController {

    constructor(authUseCases) {
        this.authUseCases = authUseCases;
    }

    login = async (req, res) => {

        try {

            const { email, password } = req.body;

            const usuario =
                await this.authUseCases.login(
                    email,
                    password
                );

            res.json({
                mensaje: "Login exitoso",
                usuario
            });

        } catch (error) {

            res.status(401).json({
                mensaje: error.message
            });
        }
    };
}
