export class ProductoController {

    constructor(productoUseCases) {
        this.productoUseCases = productoUseCases;
    }

    obtenerTodos = async (req, res) => {
        try {
            res.json(await this.productoUseCases.obtenerTodos());
        } catch (error) {
            res.status(500).json({
                mensaje: "Error al obtener productos",
                error: error.message
            });
        }
    };

    obtenerPorId = async (req, res) => {
        try {
            const producto =
                await this.productoUseCases.obtenerPorId(req.params.id);

            if (!producto) {
                return res.status(404).json({
                    mensaje: "Producto no encontrado"
                });
            }

            res.json(producto);

        } catch (error) {
            res.status(500).json({
                mensaje: "Error al obtener producto",
                error: error.message
            });
        }
    };

    crear = async (req, res) => {
        try {
            const producto =
                await this.productoUseCases.crear(req.body);

            res.status(201).json(producto);

        } catch (error) {
            res.status(400).json({
                mensaje: error.message
            });
        }
    };

    actualizar = async (req, res) => {
        try {
            const producto =
                await this.productoUseCases.actualizar(
                    req.params.id,
                    req.body
                );

            res.json(producto);

        } catch (error) {
            res.status(400).json({
                mensaje: error.message
            });
        }
    };

    eliminar = async (req, res) => {
        try {
            await this.productoUseCases.eliminar(req.params.id);

            res.json({
                mensaje: "Producto eliminado correctamente"
            });

        } catch (error) {
            res.status(404).json({
                mensaje: error.message
            });
        }
    };
}
