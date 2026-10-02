export class UsuarioController {

    constructor(usuarioUseCases) {
        this.usuarioUseCases = usuarioUseCases;
    }

    obtenerTodos = async (req, res) => {
        try {
            const usuarios = await this.usuarioUseCases.obtenerTodos();

            res.json(usuarios);
        } catch (error) {
            res.status(500).json({
                mensaje: "Error al obtener usuarios",
                error: error.message
            });
        }
    };

    obtenerPorId = async (req, res) => {
        try {
            const usuario =
                await this.usuarioUseCases.obtenerPorId(req.params.id);

            if (!usuario) {
                return res.status(404).json({
                    mensaje: "Usuario no encontrado"
                });
            }

            res.json(usuario);

        } catch (error) {
            res.status(500).json({
                mensaje: "Error al obtener usuario",
                error: error.message
            });
        }
    };

    crear = async (req, res) => {
        try {
            const usuario =
                await this.usuarioUseCases.crear(req.body);

            res.status(201).json(usuario);

        } catch (error) {
            res.status(400).json({
                mensaje: error.message
            });
        }
    };

    actualizar = async (req, res) => {
        try {
            const usuario =
                await this.usuarioUseCases.actualizar(
                    req.params.id,
                    req.body
                );

            res.json(usuario);

        } catch (error) {
            res.status(400).json({
                mensaje: error.message
            });
        }
    };

    eliminar = async (req, res) => {
        try {
            await this.usuarioUseCases.eliminar(req.params.id);

            res.json({
                mensaje: "Usuario eliminado correctamente"
            });

        } catch (error) {
            res.status(404).json({
                mensaje: error.message
            });
        }
    };
}
