export class PedidoController {

    constructor(useCases) {
        this.useCases = useCases;
    }

    crear = async (req, res) => {
        try {
            const pedido = await this.useCases.crear(req.body);

            res.status(201).json(pedido);

        } catch (error) {
            res.status(400).json({
                mensaje: error.message
            });
        }
    };

    obtenerTodos = async (req, res) => {
        try {
            res.json(await this.useCases.obtenerTodos());

        } catch (error) {
            res.status(500).json({
                mensaje: error.message
            });
        }
    };

    obtenerPorId = async (req, res) => {
        try {
            const pedido =
                await this.useCases.obtenerPorId(req.params.id);

            if (!pedido) {
                return res.status(404).json({
                    mensaje: "Pedido no encontrado"
                });
            }

            res.json(pedido);

        } catch (error) {
            res.status(500).json({
                mensaje: error.message
            });
        }
    };

    obtenerPorUsuario = async (req, res) => {
        try {
            res.json(
                await this.useCases.obtenerPorUsuario(req.params.usuarioId)
            );
        } catch (error) {
            res.status(500).json({
                mensaje: error.message
            });
        }
    };

    actualizar = async (req, res) => {
        try {
            res.json(
                await this.useCases.actualizar(
                    req.params.id,
                    req.body.estado
                )
            );

        } catch (error) {
            res.status(400).json({
                mensaje: error.message
            });
        }
    };

    eliminar = async (req, res) => {
        try {
            await this.useCases.eliminar(req.params.id);

            res.json({
                mensaje: "Pedido eliminado correctamente"
            });

        } catch (error) {
            res.status(404).json({
                mensaje: error.message
            });
        }
    };
}
