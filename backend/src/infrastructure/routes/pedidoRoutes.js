import express from "express";

export function crearPedidoRoutes(controller) {

    const router = express.Router();

    router.get("/", controller.obtenerTodos);
    router.get("/usuario/:usuarioId", controller.obtenerPorUsuario);
    router.get("/:id", controller.obtenerPorId);
    router.post("/", controller.crear);
    router.put("/:id", controller.actualizar);
    router.delete("/:id", controller.eliminar);

    return router;
}
