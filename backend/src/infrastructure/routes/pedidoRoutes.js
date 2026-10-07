import express from "express";

export function crearPedidoRoutes(controller, autenticar, autorizarRoles) {

    const router = express.Router();

    router.get("/", autenticar, autorizarRoles("admin"), controller.obtenerTodos);
    router.get("/usuario/:usuarioId", autenticar, controller.obtenerPorUsuario);
    router.get("/:id", autenticar, controller.obtenerPorId);
    router.post("/", autenticar, controller.crear);
    router.put("/:id", autenticar, autorizarRoles("admin"), controller.actualizar);
    router.delete("/:id", autenticar, autorizarRoles("admin"), controller.eliminar);

    return router;
}
