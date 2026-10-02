import express from "express";

export function crearProductoRoutes(productoController) {

    const router = express.Router();

    router.get("/", productoController.obtenerTodos);

    router.get("/:id", productoController.obtenerPorId);

    router.post("/", productoController.crear);

    router.put("/:id", productoController.actualizar);

    router.delete("/:id", productoController.eliminar);

    return router;
}
