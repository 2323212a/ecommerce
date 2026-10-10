import { Router } from "express";

export function crearReportesRoutes(controller, autenticar, autorizarRoles) {
    const router = Router();

    router.use(autenticar, autorizarRoles("admin"));
    router.get("/resumen", controller.obtenerResumen);
    router.get("/ventas-tiempo", controller.obtenerVentasTiempo);
    router.get("/productos-mas-vendidos", controller.obtenerProductosMasVendidos);
    router.get("/estados-pedidos", controller.obtenerEstadosPedidos);
    router.get("/ticket-promedio", controller.obtenerTicketPromedio);

    return router;
}
