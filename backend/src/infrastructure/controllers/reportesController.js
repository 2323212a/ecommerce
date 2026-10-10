export class ReportesController {
    constructor(service) {
        this.service = service;
    }

    obtenerResumen = async (req, res) => {
        try {
            const data = await this.service.obtenerResumen({
                desde: req.query.desde,
                hasta: req.query.hasta
            });

            res.json(data);
        } catch (error) {
            res.status(400).json({
                mensaje: error.message
            });
        }
    };

    obtenerVentasTiempo = async (req, res) => {
        try {
            const data = await this.service.obtenerVentasTiempo({
                desde: req.query.desde,
                hasta: req.query.hasta,
                agrupacion: req.query.agrupacion
            });

            res.json(data);
        } catch (error) {
            res.status(400).json({
                mensaje: error.message
            });
        }
    };

    obtenerProductosMasVendidos = async (req, res) => {
        try {
            const data = await this.service.obtenerProductosMasVendidos({
                desde: req.query.desde,
                hasta: req.query.hasta,
                limite: req.query.limite
            });

            res.json(data);
        } catch (error) {
            res.status(400).json({
                mensaje: error.message
            });
        }
    };

    obtenerEstadosPedidos = async (req, res) => {
        try {
            const data = await this.service.obtenerEstadosPedidos({
                desde: req.query.desde,
                hasta: req.query.hasta
            });

            res.json(data);
        } catch (error) {
            res.status(400).json({
                mensaje: error.message
            });
        }
    };

    obtenerTicketPromedio = async (req, res) => {
        try {
            const data = await this.service.obtenerTicketPromedio({
                desde: req.query.desde,
                hasta: req.query.hasta
            });

            res.json(data);
        } catch (error) {
            res.status(400).json({
                mensaje: error.message
            });
        }
    };
}
